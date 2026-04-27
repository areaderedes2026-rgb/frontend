/** Clases compartidas para formularios (escalables y coherentes con el diseño). */
export const labelClass =
  'flex flex-col gap-1.5 text-sm font-medium text-slate-700'

export const inputClass =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/15 disabled:cursor-not-allowed disabled:opacity-60'

export const textareaClass = `${inputClass} min-h-[7rem] resize-y leading-relaxed`

export const formErrorClass =
  'rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800'
