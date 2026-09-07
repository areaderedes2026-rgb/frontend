import {
  FaBus,
  FaCampground,
  FaCar,
  FaCircleInfo,
  FaHorse,
  FaHotel,
  FaKitMedical,
  FaLandmark,
  FaLocationDot,
  FaMicrophone,
  FaRestroom,
  FaSquareParking,
  FaStore,
  FaTicketSimple,
  FaTree,
  FaUtensils,
  FaDroplet,
} from 'react-icons/fa6'

/** Mapa value → componente react-icons (UI lista / admin). */
export const FDC_MAP_LOCATION_ICON_MAP = {
  pin: FaLocationDot,
  horse: FaHorse,
  stage: FaMicrophone,
  food: FaUtensils,
  market: FaStore,
  ticket: FaTicketSimple,
  parking: FaSquareParking,
  info: FaCircleInfo,
  restroom: FaRestroom,
  camping: FaCampground,
  medical: FaKitMedical,
  hotel: FaHotel,
  water: FaDroplet,
  park: FaTree,
  bus: FaBus,
  car: FaCar,
  landmark: FaLandmark,
}

/** Emoji para marcadores Leaflet (HTML seguro, sin depender de React en el mapa). */
export const FDC_MAP_LOCATION_ICON_EMOJI = {
  pin: '📍',
  horse: '🐴',
  stage: '🎤',
  food: '🍽️',
  market: '🏪',
  ticket: '🎟️',
  parking: '🅿️',
  info: 'ℹ️',
  restroom: '🚻',
  camping: '⛺',
  medical: '🩺',
  hotel: '🏨',
  water: '💧',
  park: '🌳',
  bus: '🚌',
  car: '🚗',
  landmark: '🏛️',
}

export const FDC_MAP_LOCATION_DEFAULT_ICON = 'pin'

export function resolveFdcMapLocationIcon(name) {
  const key = String(name || '').trim()
  if (FDC_MAP_LOCATION_ICON_MAP[key]) return key
  return FDC_MAP_LOCATION_DEFAULT_ICON
}

export function getFdcMapLocationEmoji(name) {
  const key = resolveFdcMapLocationIcon(name)
  return FDC_MAP_LOCATION_ICON_EMOJI[key] || FDC_MAP_LOCATION_ICON_EMOJI.pin
}

export function FdcMapLocationIcon({
  name,
  className = 'h-4 w-4',
  tone = 'inherit',
}) {
  const key = resolveFdcMapLocationIcon(name)
  const Icon = FDC_MAP_LOCATION_ICON_MAP[key] || FaLocationDot
  const toneClass =
    tone === 'light'
      ? 'text-white'
      : tone === 'dark'
        ? 'text-[#171b22]'
        : tone === 'accent'
          ? 'text-[#d4b483]'
          : ''
  return <Icon className={`${className} shrink-0 ${toneClass}`.trim()} aria-hidden />
}
