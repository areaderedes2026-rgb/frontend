import { jsPDF } from 'jspdf'
import { APP_NAME } from './constants.js'

const MARGIN = 16
const LINE = 5.2
const FOOTER_H = 12

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
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d)
}

function fileStamp() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function display(value) {
  const s = String(value ?? '').trim()
  return s || '—'
}

/**
 * Genera y descarga un PDF con el detalle de una consulta ciudadana (panel admin).
 * @param {object} inquiry Objeto de consulta (mismo shape que `mapInquiry` en citizenAttentionService).
 */
export function downloadCitizenInquiryPdf(inquiry) {
  if (!inquiry || inquiry.id == null) {
    throw new Error('No hay datos de consulta para exportar.')
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const contentW = pageW - MARGIN * 2
  let y = MARGIN

  const bottomLimit = () => pageH - FOOTER_H

  function newPage() {
    doc.addPage()
    y = MARGIN
  }

  function ensureSpace(mm) {
    if (y + mm > bottomLimit()) newPage()
  }

  function drawHeader() {
    doc.setFillColor(2, 132, 199)
    doc.rect(0, 0, pageW, 34, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(APP_NAME, MARGIN, 13)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Consulta ciudadana — Formulario web de atención', MARGIN, 21)
    doc.setFontSize(8.5)
    doc.text(`Registro N° ${inquiry.id}`, pageW - MARGIN, 12, { align: 'right' })
    doc.text(`Emitido: ${formatDateTime(new Date().toISOString())}`, pageW - MARGIN, 18, { align: 'right' })
    doc.setTextColor(15, 23, 42)
  }

  function drawFooter(pageIndex, totalPages) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    const line = `Documento interno — ${APP_NAME} — Página ${pageIndex} de ${totalPages}`
    doc.text(line, MARGIN, pageH - 6, { maxWidth: contentW })
    doc.setTextColor(15, 23, 42)
  }

  function sectionTitle(text) {
    ensureSpace(11)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(3, 105, 161)
    doc.text(text, MARGIN, y + 4)
    y += 8
    doc.setDrawColor(125, 211, 252)
    doc.setLineWidth(0.35)
    doc.line(MARGIN, y, pageW - MARGIN, y)
    y += 6
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
  }

  function fieldBlock(label, value) {
    const body = display(value)
    const labelW = contentW * 0.38
    const valueX = MARGIN + contentW * 0.4
    const valueW = contentW * 0.6 - 2
    const labelLines = doc.splitTextToSize(label.toUpperCase(), labelW)
    const valueLines = doc.splitTextToSize(body, valueW)
    const h = Math.max(labelLines.length, valueLines.length) * LINE + 3
    ensureSpace(h + 1)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(labelLines, MARGIN, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59)
    doc.text(valueLines, valueX, y + 5)
    y += h + 1
  }

  function paragraphBlock(title, body) {
    sectionTitle(title)
    const raw = String(body ?? '').trim() || '—'
    const paragraphs = raw.split(/\n+/)
    for (let p = 0; p < paragraphs.length; p += 1) {
      const lines = doc.splitTextToSize(paragraphs[p], contentW - 6)
      for (let i = 0; i < lines.length; i += 1) {
        ensureSpace(LINE + 1)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(51, 65, 85)
        doc.text(lines[i], MARGIN + 2, y + 5)
        y += LINE
      }
      if (p < paragraphs.length - 1) y += 2
    }
    y += 5
  }

  drawHeader()
  y = 42

  const fullName = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(' ').trim()

  sectionTitle('Datos del vecino')
  fieldBlock('Nombre completo', fullName || '—')
  fieldBlock('DNI', inquiry.dni)
  fieldBlock('Correo electrónico', inquiry.email)
  fieldBlock('Teléfono', inquiry.phone)

  sectionTitle('Consulta')
  fieldBlock('Tema', inquiry.topic)
  fieldBlock('Estado', STATUS_LABEL[inquiry.status] || display(inquiry.status))

  sectionTitle('Cronología')
  fieldBlock('Recibida', formatDateTime(inquiry.createdAt))
  fieldBlock('Última actualización', formatDateTime(inquiry.updatedAt))

  paragraphBlock('Mensaje', inquiry.message)

  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p)
    drawFooter(p, total)
  }

  const safeId = String(inquiry.id).replace(/[^\w-]/g, '')
  doc.save(`consulta-ciudadana-${safeId}-${fileStamp()}.pdf`)
}
