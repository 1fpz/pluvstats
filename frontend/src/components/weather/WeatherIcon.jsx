import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSun,
  Snowflake,
  Sun,
} from 'lucide-react'

const ICONS = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-rain-wind': CloudRainWind,
  'cloud-lightning': CloudLightning,
  snowflake: Snowflake,
}

export function WeatherIcon({ icon = 'cloud', className }) {
  const Icon = ICONS[icon] ?? Cloud
  return <Icon className={className} aria-hidden="true" />
}
