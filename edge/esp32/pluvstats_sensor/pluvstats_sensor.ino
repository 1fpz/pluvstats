/*
 * PLUVSTATS - ESP32 edge node
 * -----------------------------------------------------------------------------
 * Reads an HC-SR04 ultrasonic sensor, derives the water level from the sensor
 * geometry, classifies the local state with the same experimental thresholds
 * used by the API, and drives four LEDs and a buzzer.
 *
 * The firmware is a prototype. No physical device has been validated in this
 * project. It must not be used as an early-warning or life-safety system.
 *
 * Team (Global Solution 2026.2 - CitizenTech):
 *   Felipe Ilek .............. RM 571322
 *   Michel Tatsuya Hanada .... RM 571987
 *   Marcos Vinicius Tudisco .. RM 569366
 *
 * Build (Arduino CLI, ESP32 core installed):
 *   arduino-cli compile --fqbn esp32:esp32:esp32 \
 *       --build-path build edge/esp32/pluvstats_sensor
 *
 * Thresholds are generated from shared/pluvstats.config.json:
 *   python edge/tools/sync_thresholds.py
 *
 * Network upload is compile-time opt-in and untested against real hardware:
 *   - copy secrets.example.h to secrets.h and fill it in;
 *   - compile with -DPLUVSTATS_ENABLE_NETWORK=1.
 * Never commit secrets.h.
 * -----------------------------------------------------------------------------
 */

#include "generated_config.h"

#ifndef PLUVSTATS_ENABLE_NETWORK
#define PLUVSTATS_ENABLE_NETWORK 0
#endif

#ifndef PLUVSTATS_DEVICE_ID
#define PLUVSTATS_DEVICE_ID "PLUV-ESP32-0001"
#endif

#if PLUVSTATS_ENABLE_NETWORK
#include <WiFi.h>
#include <HTTPClient.h>
#if __has_include("secrets.h")
#include "secrets.h"
#else
#error "PLUVSTATS_ENABLE_NETWORK=1 requires edge/esp32/pluvstats_sensor/secrets.h"
#endif
#endif

namespace {

// --- Hardware mapping --------------------------------------------------------
// HC-SR04 ECHO is 5 V. Use a voltage divider (e.g. 1 kOhm / 2 kOhm) before the
// ESP32 pin. The wiring table is documented in edge/README.md.
constexpr uint8_t kPinTrig = 5;
constexpr uint8_t kPinEcho = 18;
constexpr uint8_t kPinLedNormal = 25;
constexpr uint8_t kPinLedAttention = 26;
constexpr uint8_t kPinLedAlert = 27;
constexpr uint8_t kPinLedCritical = 14;
constexpr uint8_t kPinBuzzer = 12;

constexpr bool kBuzzerActiveHigh = true;
constexpr uint8_t kSamplesPerCycle = 5;
constexpr uint8_t kMinimumValidSamples = 3;
constexpr uint32_t kEchoTimeoutUs = 30000UL;   // ~5 m round trip
constexpr uint32_t kSampleIntervalMs = 1000UL;
constexpr uint32_t kPublishIntervalMs = 5000UL;
constexpr uint32_t kNetworkIntervalMs = 10000UL;
constexpr uint32_t kRateWindowMs = 60000UL;
constexpr uint32_t kRateMinimumSpanMs = 10000UL;
constexpr uint8_t kInvalidSamplesForFault = 3;
constexpr uint8_t kWindowSize = 90;

const char kFirmwareVersion[] = PLUVSTATS_FIRMWARE_VERSION;

enum Severity : uint8_t {
  kNormal = 0,
  kAttention = 1,
  kAlert = 2,
  kCritical = 3,
};

struct LevelSample {
  uint32_t atMs;
  float levelCm;
};

LevelSample gWindow[kWindowSize];
uint8_t gWindowCount = 0;

Severity gLevelSeverity = kNormal;
Severity gRateSeverity = kNormal;
Severity gSeverity = kNormal;
bool gFault = false;

float gLastDistanceCm = -1.0f;
float gLastLevelCm = 0.0f;
float gRateCmPerMin = NAN;
uint8_t gInvalidStreak = 0;

uint32_t gLastSampleAtMs = 0;
uint32_t gLastPublishAtMs = 0;
Severity gLastPublishedSeverity = kNormal;
bool gLastPublishedFault = false;

// --- Threshold rules ---------------------------------------------------------

Severity classify(float value, float attention, float alert, float critical) {
  if (value >= critical) return kCritical;
  if (value >= alert) return kAlert;
  if (value >= attention) return kAttention;
  return kNormal;
}

float limitFor(Severity severity, float attention, float alert, float critical) {
  switch (severity) {
    case kAttention:
      return attention;
    case kAlert:
      return alert;
    case kCritical:
      return critical;
    default:
      return 0.0f;
  }
}

// Mirrors app/intelligence/thresholds.py: a lower reading holds the previous
// severity while it remains inside the hysteresis band.
Severity stabilize(Severity candidate, Severity previous, float value,
                   float attention, float alert, float critical,
                   float hysteresis) {
  if (previous > candidate) {
    const float hold = limitFor(previous, attention, alert, critical) - hysteresis;
    if (value >= hold) return previous;
  }
  return candidate;
}

Severity evaluateLevel(float levelCm) {
  const Severity candidate = classify(
      levelCm, PLUVSTATS_LEVEL_ATTENTION_CM, PLUVSTATS_LEVEL_ALERT_CM,
      PLUVSTATS_LEVEL_CRITICAL_CM);
  gLevelSeverity = stabilize(candidate, gLevelSeverity, levelCm,
                             PLUVSTATS_LEVEL_ATTENTION_CM,
                             PLUVSTATS_LEVEL_ALERT_CM,
                             PLUVSTATS_LEVEL_CRITICAL_CM,
                             PLUVSTATS_HYSTERESIS_CM);
  return gLevelSeverity;
}

Severity evaluateRate(float rateCmPerMin) {
  if (isnan(rateCmPerMin)) return gRateSeverity;
  const float positive = rateCmPerMin < 0.0f ? 0.0f : rateCmPerMin;
  const Severity candidate = classify(
      positive, PLUVSTATS_RATE_ATTENTION_CM_PER_MIN,
      PLUVSTATS_RATE_ALERT_CM_PER_MIN, PLUVSTATS_RATE_CRITICAL_CM_PER_MIN);
  gRateSeverity = stabilize(candidate, gRateSeverity, positive,
                            PLUVSTATS_RATE_ATTENTION_CM_PER_MIN,
                            PLUVSTATS_RATE_ALERT_CM_PER_MIN,
                            PLUVSTATS_RATE_CRITICAL_CM_PER_MIN,
                            PLUVSTATS_HYSTERESIS_RATE_CM_PER_MIN);
  return gRateSeverity;
}

// --- Sensor acquisition ------------------------------------------------------

bool readDistanceCm(float &distanceCm) {
  float samples[kSamplesPerCycle];
  uint8_t count = 0;

  for (uint8_t i = 0; i < kSamplesPerCycle; i++) {
    digitalWrite(kPinTrig, LOW);
    delayMicroseconds(4);
    digitalWrite(kPinTrig, HIGH);
    delayMicroseconds(10);
    digitalWrite(kPinTrig, LOW);

    const unsigned long duration = pulseIn(kPinEcho, HIGH, kEchoTimeoutUs);
    if (duration > 0) {
      const float cm = static_cast<float>(duration) / 58.0f;
      if (cm >= PLUVSTATS_INVALID_DISTANCE_MIN_CM &&
          cm <= PLUVSTATS_INVALID_DISTANCE_MAX_CM) {
        samples[count++] = cm;
      }
    }
    delay(40);
  }

  if (count < kMinimumValidSamples) return false;

  for (uint8_t i = 1; i < count; i++) {
    const float key = samples[i];
    int8_t j = static_cast<int8_t>(i) - 1;
    while (j >= 0 && samples[j] > key) {
      samples[j + 1] = samples[j];
      j--;
    }
    samples[j + 1] = key;
  }
  distanceCm = samples[count / 2];
  return true;
}

void pushSample(uint32_t atMs, float levelCm) {
  if (gWindowCount == kWindowSize) {
    for (uint8_t i = 1; i < kWindowSize; i++) gWindow[i - 1] = gWindow[i];
    gWindowCount--;
  }
  gWindow[gWindowCount++] = {atMs, levelCm};
}

// Least-surprise slope: newest level minus the oldest sample inside the
// 10-60 s window. Short windows are rejected to avoid absurd extrapolation.
float computeRateCmPerMin(uint32_t now) {
  const LevelSample *base = nullptr;
  for (uint8_t i = 0; i < gWindowCount; i++) {
    const uint32_t age = now - gWindow[i].atMs;
    if (age < kRateMinimumSpanMs || age > kRateWindowMs) continue;
    if (base == nullptr || gWindow[i].atMs < base->atMs) base = &gWindow[i];
  }
  if (base == nullptr || gWindowCount == 0) return NAN;

  const float minutes = static_cast<float>(now - base->atMs) / 60000.0f;
  if (minutes <= 0.0f) return NAN;
  return (gWindow[gWindowCount - 1].levelCm - base->levelCm) / minutes;
}

// --- Outputs -----------------------------------------------------------------

void setLeds(bool normal, bool attention, bool alert, bool critical) {
  digitalWrite(kPinLedNormal, normal ? HIGH : LOW);
  digitalWrite(kPinLedAttention, attention ? HIGH : LOW);
  digitalWrite(kPinLedAlert, alert ? HIGH : LOW);
  digitalWrite(kPinLedCritical, critical ? HIGH : LOW);
}

bool buzzerActive(Severity severity, bool fault, uint32_t now) {
  if (fault) {
    const uint32_t phase = now % 3000UL;
    return phase < 120UL || (phase >= 320UL && phase < 440UL);
  }
  switch (severity) {
    case kAttention: {
      return (now % 6000UL) < 90UL;
    }
    case kAlert: {
      const uint32_t phase = now % 3000UL;
      return phase < 110UL || (phase >= 320UL && phase < 430UL);
    }
    case kCritical: {
      const uint32_t phase = now % 2000UL;
      return phase < 140UL || (phase >= 280UL && phase < 420UL) ||
             (phase >= 560UL && phase < 700UL);
    }
    default:
      return false;
  }
}

void updateOutputs(uint32_t now) {
  if (gFault) {
    // Blinking yellow means "sensor fault", not a water-level classification.
    setLeds(false, ((now / 500UL) % 2UL) == 0UL, false, false);
  } else {
    setLeds(gSeverity == kNormal, gSeverity == kAttention,
            gSeverity == kAlert, gSeverity == kCritical);
  }
  const bool on = buzzerActive(gSeverity, gFault, now);
  digitalWrite(kPinBuzzer, (on == kBuzzerActiveHigh) ? HIGH : LOW);
}

const char *severityLabel(Severity severity) {
  switch (severity) {
    case kAttention:
      return "attention";
    case kAlert:
      return "alert";
    case kCritical:
      return "critical";
    default:
      return "normal";
  }
}

void publishTelemetry(uint32_t now, bool valid) {
  char rate[16];
  if (isnan(gRateCmPerMin)) {
    snprintf(rate, sizeof(rate), "null");
  } else {
    snprintf(rate, sizeof(rate), "%.2f", gRateCmPerMin);
  }

  if (valid) {
    Serial.printf(
        "{\"deviceId\":\"%s\",\"firmwareVersion\":\"%s\",\"uptimeMs\":%lu,"
        "\"valid\":true,\"fault\":%s,\"distanceCm\":%.1f,"
        "\"waterLevelCm\":%.1f,\"rateCmPerMin\":%s,\"severity\":\"%s\","
        "\"simulated\":false}\n",
        PLUVSTATS_DEVICE_ID, kFirmwareVersion,
        static_cast<unsigned long>(now), gFault ? "true" : "false",
        gLastDistanceCm, gLastLevelCm, rate, severityLabel(gSeverity));
  } else {
    Serial.printf(
        "{\"deviceId\":\"%s\",\"firmwareVersion\":\"%s\",\"uptimeMs\":%lu,"
        "\"valid\":false,\"fault\":%s,\"distanceCm\":null,"
        "\"waterLevelCm\":null,\"rateCmPerMin\":null,\"severity\":\"%s\","
        "\"simulated\":false}\n",
        PLUVSTATS_DEVICE_ID, kFirmwareVersion,
        static_cast<unsigned long>(now), gFault ? "true" : "false",
        severityLabel(gSeverity));
  }
}

// --- Optional network upload -------------------------------------------------

void maintainNetwork(uint32_t now) {
#if PLUVSTATS_ENABLE_NETWORK
  static uint32_t lastPostAtMs = 0;
  if (WiFi.status() != WL_CONNECTED) return;
  if (now - lastPostAtMs < kNetworkIntervalMs) return;
  if (gLastDistanceCm < 0.0f || gFault) return;
  lastPostAtMs = now;

  char payload[224];
  snprintf(payload, sizeof(payload),
           "{\"deviceId\":\"%s\",\"distanceCm\":%.1f,"
           "\"firmwareVersion\":\"%s\"}",
           PLUVSTATS_DEVICE_ID, gLastDistanceCm, kFirmwareVersion);

  HTTPClient http;
  http.setTimeout(4000);
  if (!http.begin(PLUVSTATS_API_URL)) {
    Serial.println("[net] invalid API URL");
    return;
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", PLUVSTATS_DEVICE_KEY);
  const int status = http.POST(reinterpret_cast<uint8_t *>(payload), strlen(payload));
  if (status > 0) {
    Serial.printf("[net] POST %d %s\n", status, http.getString().c_str());
  } else {
    Serial.printf("[net] POST failed: %d\n", status);
  }
  http.end();
#else
  (void)now;
#endif
}

}  // namespace

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(kPinTrig, OUTPUT);
  pinMode(kPinEcho, INPUT);
  pinMode(kPinLedNormal, OUTPUT);
  pinMode(kPinLedAttention, OUTPUT);
  pinMode(kPinLedAlert, OUTPUT);
  pinMode(kPinLedCritical, OUTPUT);
  pinMode(kPinBuzzer, OUTPUT);
  digitalWrite(kPinTrig, LOW);
  setLeds(false, false, false, false);
  digitalWrite(kPinBuzzer, !kBuzzerActiveHigh ? HIGH : LOW);

  Serial.println();
  Serial.println("PLUVSTATS edge node - prototype, simulated/hardware data must stay labelled.");
  Serial.printf("firmware=%s config=%s device=%s\n", kFirmwareVersion,
                PLUVSTATS_CONFIG_VERSION, PLUVSTATS_DEVICE_ID);
  Serial.printf("limits: level %.0f/%.0f/%.0f cm, rate %.1f/%.1f/%.1f cm/min\n",
                PLUVSTATS_LEVEL_ATTENTION_CM, PLUVSTATS_LEVEL_ALERT_CM,
                PLUVSTATS_LEVEL_CRITICAL_CM,
                PLUVSTATS_RATE_ATTENTION_CM_PER_MIN,
                PLUVSTATS_RATE_ALERT_CM_PER_MIN,
                PLUVSTATS_RATE_CRITICAL_CM_PER_MIN);

#if PLUVSTATS_ENABLE_NETWORK
  Serial.println("[net] uploading is enabled; connectivity has not been validated.");
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(PLUVSTATS_WIFI_SSID, PLUVSTATS_WIFI_PASSWORD);
#endif
}

void loop() {
  const uint32_t now = millis();
  updateOutputs(now);
  maintainNetwork(now);

  if (now - gLastSampleAtMs < kSampleIntervalMs) {
    delay(10);
    return;
  }
  gLastSampleAtMs = now;

  float distanceCm = 0.0f;
  const bool valid = readDistanceCm(distanceCm);
  Severity severityBefore = gSeverity;

  if (valid) {
    gInvalidStreak = 0;
    gFault = false;
    gLastDistanceCm = distanceCm;
    gLastLevelCm = PLUVSTATS_SENSOR_HEIGHT_CM - distanceCm;
    if (gLastLevelCm < 0.0f) gLastLevelCm = 0.0f;
    if (gLastLevelCm > PLUVSTATS_CHANNEL_DEPTH_CM) gLastLevelCm = PLUVSTATS_CHANNEL_DEPTH_CM;

    pushSample(now, gLastLevelCm);
    gRateCmPerMin = computeRateCmPerMin(now);

    const Severity levelSeverity = evaluateLevel(gLastLevelCm);
    const Severity rateSeverity = evaluateRate(gRateCmPerMin);
    gSeverity = levelSeverity > rateSeverity ? levelSeverity : rateSeverity;
  } else {
    gInvalidStreak++;
    if (gInvalidStreak >= kInvalidSamplesForFault) gFault = true;
  }

  const bool publish =
      (now - gLastPublishAtMs >= kPublishIntervalMs) ||
      (gSeverity != gLastPublishedSeverity) || (gFault != gLastPublishedFault);
  if (publish) {
    gLastPublishAtMs = now;
    gLastPublishedSeverity = gSeverity;
    gLastPublishedFault = gFault;
    publishTelemetry(now, valid);
  }

  if (valid && severityBefore != gSeverity) {
    Serial.printf("[classifier] severity=%s level=%.1f cm rate=%.2f cm/min\n",
                  severityLabel(gSeverity), gLastLevelCm, gRateCmPerMin);
  }
}
