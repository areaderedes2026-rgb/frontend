import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'
import { Toast } from '../ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
} from '../ui/formStyles.js'
import { createCategory, fetchCategories } from '../../services/categoriesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

const MOCK_CATEGORIES = [
  { id: 'm1', name: 'General', slug: 'general', sortOrder: 0 },
  { id: 'm2', name: 'Institucional', slug: 'institucional', sortOrder: 10 },
  { id: 'm3', name: 'Obras', slug: 'obras', sortOrder: 20 },
  { id: 'm4', name: 'Salud', slug: 'salud', sortOrder: 30 },
  { id: 'm5', name: 'Cultura', slug: 'cultura', sortOrder: 40 },
]

function sortCategories(list) {
  return [...list].sort((a, b) =>
    String(a.name).localeCompare(String(b.name), 'es'),
  )
}

/**
 * Selector de categoría para formularios de noticias + alta rápida.
 * Con API: usa `/api/categories`. Sin API: usa lista local temporal.
 */
export function NewsCategoryField({
  value,
  onChange,
  disabled = false,
  /** Sin API: devuelve el nombre legible para guardar en mock (`category` string). */
  onMockCategoryName,
}) {
  const api = isApiConfigured()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [modalError, setModalError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const refresh = useCallback(async () => {
    if (!api) {
      setItems(MOCK_CATEGORIES)
      setLoading(false)
      return
    }
    setLoadError('')
    setLoading(true)
    try {
      const list = await fetchCategories()
      setItems(sortCategories(list))
    } catch (e) {
      setLoadError(e.message || 'No se pudieron cargar las categorías.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (loading || !items.length || value) return
    const gen = items.find((i) => i.slug === 'general') || items[0]
    if (gen) {
      onChange(String(gen.id))
      if (!api && onMockCategoryName) onMockCategoryName(gen.name)
    }
  }, [loading, items, value, onChange, api, onMockCategoryName])

  function handleSelect(e) {
    const id = e.target.value
    onChange(id)
    if (!api && onMockCategoryName) {
      const row = items.find((i) => String(i.id) === id)
      onMockCategoryName(row?.name || 'General')
    }
  }

  async function handleQuickCreate(e) {
    e.preventDefault()
    setModalError('')
    const name = newName.trim()
    if (!name) {
      setModalError('Ingresá un nombre.')
      return
    }
    if (!api) {
      const id = `mock-${Date.now()}`
      const row = { id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), sortOrder: 999 }
      setItems((prev) => sortCategories([...prev, row]))
      onChange(id)
      if (onMockCategoryName) onMockCategoryName(name)
      setNewName('')
      setModalOpen(false)
      setToast({ type: 'success', message: 'Categoría agregada localmente.' })
      return
    }
    setCreating(true)
    try {
      const data = await createCategory({ name })
      const cat = data?.category
      if (!cat) throw new Error('Respuesta inválida.')
      await refresh()
      onChange(String(cat.id))
      setNewName('')
      setModalOpen(false)
      setToast({ type: 'success', message: 'Categoría creada. Ya podés usarla en esta noticia.' })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'No se pudo crear.' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!creating) {
            setModalOpen(false)
            setModalError('')
            setNewName('')
          }
        }}
        loading={creating}
        title="Nueva categoría"
        description="Se creará y quedará disponible en todo el sitio. Podés editarla después en Configuración → Categorías."
      >
        <form className="space-y-4" onSubmit={handleQuickCreate}>
          {modalError ? (
            <p className={formErrorClass} role="alert">
              {modalError}
            </p>
          ) : null}
          <label className={labelClass}>
            Nombre
            <input
              className={inputClass}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Educación"
              maxLength={120}
              disabled={creating}
              autoFocus
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" disabled={creating}>
              {creating ? 'Creando…' : 'Crear y usar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={creating}
              onClick={() => {
                setModalOpen(false)
                setNewName('')
                setModalError('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <div className={labelClass}>
        <span className="block">Categoría</span>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <select
            className={`${inputClass} min-w-0 flex-1`}
            value={value}
            onChange={handleSelect}
            disabled={disabled || loading}
          >
            {loading ? (
              <option value="">Cargando…</option>
            ) : (
              <>
                <option value="">Seleccioná una categoría</option>
                {items.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </>
            )}
          </select>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 sm:w-auto"
            disabled={disabled || loading}
            onClick={() => {
              setModalError('')
              setNewName('')
              setModalOpen(true)
            }}
          >
            Nueva categoría
          </Button>
        </div>
        {loadError ? (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {loadError}
          </p>
        ) : null}
      </div>
    </>
  )
}
