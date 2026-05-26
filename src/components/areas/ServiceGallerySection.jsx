import { useState } from 'react'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import {
  isServiceGallerySectionVisible,
  normalizeServiceGallerySection,
} from '../../utils/serviceGallery.js'

function GalleryLightbox({ image, onClose }) {
  if (!image) return null
  const src = resolveMediaUrl(image.imageUrl)
  const caption = String(image.caption || '').trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={caption || 'Imagen ampliada'}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-bold text-white transition hover:bg-white/20"
        aria-label="Cerrar"
      >
        ×
      </button>
      <figure
        className="relative max-h-[min(90vh,900px)] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={caption || ''}
          className="max-h-[min(85vh,860px)] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
        />
        {caption ? (
          <figcaption className="mt-3 text-center text-sm font-medium text-slate-200">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  )
}

export function ServiceGallerySection({ gallerySection, className = '' }) {
  const section = normalizeServiceGallerySection(gallerySection)
  const [activeImage, setActiveImage] = useState(null)

  if (!isServiceGallerySectionVisible(section)) return null

  const images = section.images.filter((img) => img.imageUrl)

  return (
    <>
      <section className={className}>
        <div className="border-b border-[#e8e4dc] pb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-800">
            Galería
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
            {section.title}
          </h2>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, idx) => {
            const src = resolveMediaUrl(image.imageUrl)
            const caption = String(image.caption || '').trim()
            return (
              <li key={image.id || `gal-${idx}`}>
                <button
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className="group block w-full overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200/90 hover:shadow-lg hover:shadow-violet-500/10"
                >
                  <img
                    src={src}
                    alt={caption || ''}
                    className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  {caption ? (
                    <p className="border-t border-[#e8e4dc] px-4 py-3 text-sm leading-relaxed text-[#4b505a]">
                      {caption}
                    </p>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <GalleryLightbox image={activeImage} onClose={() => setActiveImage(null)} />
    </>
  )
}
