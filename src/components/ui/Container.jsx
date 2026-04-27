export function Container({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full max-w-[min(100%,90rem)] px-4 sm:px-6 lg:px-8 xl:px-10 ${className}`}
    >
      {children}
    </div>
  )
}
