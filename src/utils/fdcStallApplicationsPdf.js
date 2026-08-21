import { jsPDF } from 'jspdf'
import { APP_NAME } from './constants.js'

const STATUS_LABEL = {
  sin_resolver: 'Sin resolver',
  leida: 'Leída',
  resuelta: 'Resuelta',
}

function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

function fileStamp() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}${m}${day}-${h}${min}`
}

function rubroLabel(app) {
  if (!app) return '—'
  const isOther = String(app.rubro || '').trim().toLowerCase() === 'otro'
  if (isOther && app.rubroOther) return `Otro: ${app.rubroOther}`
  return String(app.rubro || '—').trim() || '—'
}

function cell(value) {
  const s = String(value ?? '').trim()
  return s || '—'
}

function wrapLines(doc, text, maxWidth) {
  return doc.splitTextToSize(cell(text), maxWidth)
}

/**
 * PDF tabular de preinscripciones FDC (respeta el listado filtrado actual).
 * @param {object[]} applications
 * @param {{ filterSummary?: string }} [options]
 */
export function downloadFdcStallApplicationsPdf(applications, options = {}) {
  const rows = Array.isArray(applications) ? applications : []
  if (rows.length === 0) {
    throw new Error('No hay solicitudes para exportar con los filtros actuales.')
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 10
  const marginTop = 28
  const marginBottom = 14
  const usableW = pageW - marginX * 2

  // Anchos proporcionales (suma ≈ usableW)
  const cols = [
    { key: 'id', label: 'N°', w: 10 },
    { key: 'fullName', label: 'Nombre', w: 42 },
    { key: 'dni', label: 'DNI', w: 20 },
    { key: 'phone', label: 'Teléfono', w: 24 },
    { key: 'email', label: 'Email', w: 44 },
    { key: 'locality', label: 'Localidad', w: 28 },
    { key: 'rubro', label: 'Rubro', w: 36 },
    { key: 'status', label: 'Estado', w: 22 },
    { key: 'createdAt', label: 'Fecha', w: 20 },
  ]
  const widthSum = cols.reduce((s, c) => s + c.w, 0)
  const scale = usableW / widthSum
  cols.forEach((c) => {
    c.w = Math.floor(c.w * scale * 10) / 10
  })

  function drawPageHeader() {
    doc.setFillColor(23, 27, 34)
    doc.rect(0, 0, pageW, 22, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(APP_NAME, marginX, 9)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text('Fiesta del Caballo — Preinscripciones de puestos', marginX, 15)
    doc.setFontSize(8)
    doc.text(`Emitido: ${formatDateTime(new Date().toISOString())}`, pageW - marginX, 9, {
      align: 'right',
    })
    doc.text(`${rows.length} registro${rows.length === 1 ? '' : 's'}`, pageW - marginX, 15, {
      align: 'right',
    })

    if (options.filterSummary) {
      doc.setTextColor(71, 85, 105)
      doc.setFontSize(7.5)
      doc.text(`Filtros: ${options.filterSummary}`, marginX, 26)
    }
  }

  function rowValues(app) {
    return {
      id: String(app.id ?? '—'),
      fullName: cell(app.fullName),
      dni: cell(app.dni),
      phone: cell(app.phone),
      email: cell(app.email),
      locality: cell(app.locality),
      rubro: rubroLabel(app),
      status: STATUS_LABEL[app.status] || cell(app.status),
      createdAt: formatDateTime(app.createdAt),
    }
  }

  const lineH = 3.6
  const padY = 1.6
  let y = marginTop
  let pageIndex = 1

  function ensureHeader() {
    drawPageHeader()
    y = marginTop + (options.filterSummary ? 2 : 0)
    doc.setFillColor(241, 245, 249)
    doc.rect(marginX, y, usableW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(51, 65, 85)
    let x = marginX
    cols.forEach((col) => {
      doc.text(col.label, x + 1.2, y + 4.6)
      x += col.w
    })
    y += 8
    doc.setFont('helvetica', 'normal')
  }

  ensureHeader()

  rows.forEach((app, index) => {
    const values = rowValues(app)
    const linesPerCol = cols.map((col) => wrapLines(doc, values[col.key], col.w - 2.4))
    const maxLines = Math.max(1, ...linesPerCol.map((l) => l.length))
    const rowH = maxLines * lineH + padY * 2

    if (y + rowH > pageH - marginBottom) {
      doc.addPage()
      pageIndex += 1
      ensureHeader()
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(marginX, y, usableW, rowH, 'F')
    }

    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.2)
    doc.line(marginX, y + rowH, marginX + usableW, y + rowH)

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(7)
    let x = marginX
    cols.forEach((col, ci) => {
      const lines = linesPerCol[ci]
      lines.forEach((line, li) => {
        doc.text(line, x + 1.2, y + padY + 2.8 + li * lineH)
      })
      x += col.w
    })
    y += rowH
  })

  // pageIndex used to avoid unused lint if only one page; keep for clarity
  void pageIndex

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i)
    doc.setFillColor(255, 255, 255)
    doc.rect(0, pageH - 11, pageW, 11, 'F')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7.5)
    doc.text(`Página ${i} de ${totalPages}`, pageW / 2, pageH - 6, { align: 'center' })
  }

  doc.save(`fdc-preinscripciones-${fileStamp()}.pdf`)
}
