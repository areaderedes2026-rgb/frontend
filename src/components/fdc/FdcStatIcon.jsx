import {
  FaCalendarDays,
  FaHatCowboy,
  FaHorse,
  FaHorseHead,
  FaMicrophone,
  FaStore,
  FaTicketSimple,
  FaUsers,
  FaUtensils,
} from 'react-icons/fa6'

/** Íconos de estadísticas FDC (Font Awesome 6 vía react-icons). */
const FDC_STAT_ICON_MAP = {
  horse: FaHorse,
  people: FaUsers,
  music: FaMicrophone,
  jineteada: FaHatCowboy,
  peruvianHorse: FaHorseHead,
  food: FaUtensils,
  market: FaStore,
  calendar: FaCalendarDays,
  ticket: FaTicketSimple,
}

export function FdcStatIcon({ name, className = 'h-9 w-9 sm:h-10 sm:w-10' }) {
  const key = String(name || '').trim()
  const Icon = FDC_STAT_ICON_MAP[key] || FaHorse
  return (
    <Icon
      className={`${className} shrink-0 text-[#171b22]`.trim()}
      aria-hidden
    />
  )
}

export { FDC_STAT_ICON_MAP }
