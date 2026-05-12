import { AREA_OFFICE_ICON_KEYS } from '../../data/areaOfficeIconKeys.js'

const iconClass = 'h-5 w-5 shrink-0 text-sky-700'

export function AreaOfficeIcon({ iconKey, className = iconClass, title }) {
  const k = String(iconKey || 'building')
  const aria = title ? { 'aria-label': title } : { 'aria-hidden': true }
  const cn = className
  switch (k) {
    case 'users':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      )
    case 'clipboard':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
          />
        </svg>
      )
    case 'bookOpen':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.053 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      )
    case 'handHeart':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.645 20.91a.75.75 0 0 1-1.29 0l-3.42-5.93a.75.75 0 0 1 .65-1.125h6.83a.75.75 0 0 1 .65 1.125l-3.42 5.93Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1.5M12 9V6m0 0 2.25-2.25M12 6 9.75 3.75M6.75 12h10.5M9 12v3a3 3 0 0 0 6 0v-3"
          />
        </svg>
      )
    case 'mapPin':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      )
    case 'shield':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          />
        </svg>
      )
    case 'sparkles':
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.455 2.456Z"
          />
        </svg>
      )
    case 'building':
    default:
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...aria}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008H17.25v-.008Zm0 3h.008v.008H17.25v-.008Zm0 3h.008v.008H17.25v-.008Z"
          />
        </svg>
      )
  }
}
