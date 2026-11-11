// Copy this file to secrets.h to enable uploads. Never commit secrets.h.
// The network path is prepared but has not been validated on physical hardware.

#pragma once

#define PLUVSTATS_WIFI_SSID "replace-with-a-local-network"
#define PLUVSTATS_WIFI_PASSWORD "replace-with-a-local-password"

// Example: http://192.168.0.10:8000/api/hardware/readings
#define PLUVSTATS_API_URL "http://192.168.0.10:8000/api/hardware/readings"

// Must match PLUVSTATS_HARDWARE_KEY on the backend. Development placeholder only.
#define PLUVSTATS_DEVICE_KEY "change-me-development-only"
