import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
} from '../../components/ui/formStyles.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../services/categoriesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

export function AdminCategories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const [modal, setModal] = useState(null)
  const [modalBusy, setModalBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const [cName, setCName] = useState('')
  const [cSlug, setCSlug] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadFromServer = useCallback(async () => {
    if (!isApiConfigured()) return
    setError('')
    setLoading(true)
    try {
      const list = await fetchCategories()
      setItems(
        [...list].sort((a, b) =>
          String(a.name).localeCompare(String(b.name), 'es'),
        ),
      )
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las categorías.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      if (modal?.mode !== 'edit') return
      const name = cName.trim()
      if (!name) {
        throw new Error('El nombre es obligatorio.')
      }
      const existing = items.find((x) => Number(x.id) === Number(modal.id))
      const payload = { name, forceOverwrite }
      const slug = cSlug.trim()
      if (slug) payload.slug = slug
      payload.expectedUpdatedAt = existing?.updatedAt || null
      await updateCategory(modal.id, payload)
      setModal(null)
      await loadFromServer()
      setToast({ type: 'success', message: 'Categoría actualizada.' })
    },
    [cName, cSlug, items, loadFromServer, modal],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'esta categoría',
    onReloadSuccess: () =>
      setToast({
        type: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        type: 'error',
        message: e.message || 'No se pudo recargar las categorías.',
      }),
    onForceSaveError: (e) =>
      setToast({ type: 'error', message: e.message || 'No se pudo guardar.' }),
  })

  useEffect(() => {
    loadFromServer()
  }, [loadFromServer])

  function openCreate() {
    setFormError('')
    setCName('')
    setCSlug('')
    setModal({ mode: 'create' })
  }

  function openEdit(row) {
    setFormError('')
    setCName(row.name || '')
    setCSlug(row.slug || '')
    setModal({ mode: 'edit', id: row.id })
  }

  function closeModal() {
    if (modalBusy) return
    setModal(null)
    setFormError('')
  }

  async function handleSubmitCreate(e) {
    e.preventDefault()
    setFormError('')
    const name = cName.trim()
    if (!name) {
      setFormError('El nombre es obligatorio.')
      return
    }
    setModalBusy(true)
    try {
      const payload = { name }
      const slug = cSlug.trim()
      if (slug) payload.slug = slug
      await createCategory(payload)
      setModal(null)
      await loadFromServer()
      setToast({ type: 'success', message: 'Categoría creada correctamente.' })
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo crear.' })
    } finally {
      setModalBusy(false)
    }
  }

  async function handleSubmitEdit(e) {
    e.preventDefault()
    setFormError('')
    if (modal?.mode !== 'edit') return
    const name = cName.trim()
    if (!name) {
      setFormError('El nombre es obligatorio.')
      return
    }
    setModalBusy(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      setToast({ type: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setModalBusy(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
      await loadFromServer()
      setToast({ type: 'success', message: 'Categoría eliminada.' })
    } catch (e) {
      setToast({
        type: 'error',
        message: e.message || 'No se pudo eliminar.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!isApiConfigured()) {
    return (
      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Categorías"
        subtitle="Requiere API."
        maxWidthClass="max-w-3xl"
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          No hay conexión activa con el backend en este entorno.
        </div>
      </AdminPageShell>
    )
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}
      {conflictDialog}
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null)
        }}
        title="¿Eliminar esta categoría?"
        description={
          deleteTarget ? (
            <>
              Se eliminará <span className="font-semibold">{deleteTarget.name}</span>. Solo
              podés hacerlo si no hay noticias que la usen.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      <Modal
        open={modal?.mode === 'create'}
        onClose={closeModal}
        loading={modalBusy}
        title="Nueva categoría"
        description="El slug se genera automáticamente si lo dejás vacío."
      >
        <form className="space-y-4" onSubmit={handleSubmitCreate}>
          {formError ? (
            <p className={formErrorClass} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={labelClass}>
            Nombre
            <input
              className={inputClass}
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              maxLength={120}
              required
              disabled={modalBusy}
            />
          </label>
          <label className={labelClass}>
            Slug (opcional)
            <input
              className={inputClass}
              value={cSlug}
              onChange={(e) => setCSlug(e.target.value)}
              placeholder="ej. educacion"
              disabled={modalBusy}
            />
          </label>
          <div className="flex flex-row flex-wrap items-center gap-3 pt-1 sm:gap-3">
            <Button type="submit" disabled={modalBusy} className="min-w-28 flex-1 sm:flex-none">
              {modalBusy ? 'Guardando…' : 'Crear'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={modalBusy}
              onClick={closeModal}
              className="min-w-28 flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal?.mode === 'edit'}
        onClose={closeModal}
        loading={modalBusy}
        title="Editar categoría"
        description="Los cambios se reflejan en las noticias que usan esta categoría."
      >
        <form className="space-y-4" onSubmit={handleSubmitEdit}>
          {formError ? (
            <p className={formErrorClass} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={labelClass}>
            Nombre
            <input
              className={inputClass}
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              maxLength={120}
              required
              disabled={modalBusy}
            />
          </label>
          <label className={labelClass}>
            Slug
            <input
              className={inputClass}
              value={cSlug}
              onChange={(e) => setCSlug(e.target.value)}
              disabled={modalBusy}
            />
          </label>
          <div className="flex flex-row flex-wrap items-center gap-3 pt-1 sm:gap-3">
            <Button type="submit" disabled={modalBusy} className="min-w-28 flex-1 sm:flex-none">
              {modalBusy ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={modalBusy}
              onClick={closeModal}
              className="min-w-28 flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Categorías de noticias"
        subtitle="Las noticias se vinculan a una categoría. El nombre se muestra en el portal público."
        actions={
          <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
            Nueva categoría
          </Button>
        }
        maxWidthClass="max-w-5xl"
        variant="plain"
      >
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="h-4 w-32 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3.5 sm:px-5">Nombre</th>
                      <th className="px-4 py-3.5 sm:px-5">Slug</th>
                      <th className="w-[1%] whitespace-nowrap px-4 py-3.5 text-right sm:px-5">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                      >
                        <td className="max-w-[min(100%,14rem)] px-4 py-3.5 align-middle font-semibold text-slate-900 sm:px-5">
                          {row.name}
                        </td>
                        <td className="max-w-[min(100%,16rem)] truncate px-4 py-3.5 align-middle font-mono text-xs text-slate-600 sm:px-5">
                          {row.slug}
                        </td>
                        <td className="px-4 py-3.5 align-middle sm:px-5">
                          <div className="inline-flex w-full min-w-0 flex-nowrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              className="shrink-0 px-3! py-1.5! text-xs! whitespace-nowrap"
                              onClick={() => openEdit(row)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              className="shrink-0 px-3! py-1.5! text-xs! whitespace-nowrap"
                              onClick={() =>
                                setDeleteTarget({
                                  id: row.id,
                                  name: row.name || 'esta categoría',
                                })
                              }
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ul className="space-y-3 md:hidden" aria-label="Lista de categorías">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <p className="text-base font-semibold text-slate-900">{row.name}</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-500">{row.slug}</p>
                  <div className="mt-4 flex w-full flex-row flex-nowrap items-stretch justify-stretch gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-10 flex-1 basis-0 px-3! py-2! text-sm!"
                      onClick={() => openEdit(row)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="min-h-10 flex-1 basis-0 px-3! py-2! text-sm!"
                      onClick={() =>
                        setDeleteTarget({
                          id: row.id,
                          name: row.name || 'esta categoría',
                        })
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminPageShell>
    </>
  )
}
