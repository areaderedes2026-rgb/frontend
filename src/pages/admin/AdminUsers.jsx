import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useAuth } from '../../hooks/useAuth.js'
import {
  createUser,
  deleteUser,
  fetchUserById,
  fetchUsersList,
  updateUser,
} from '../../services/usersService.js'
import { fetchAreasAdmin } from '../../services/areasService.js'
import { fetchAreaProfile } from '../../services/areaProfilesService.js'
import { formatShortDate } from '../../utils/formatDate.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'

const ROLE_LABELS = {
  admin: 'Administrador',
  editor: 'Editor',
  area_service_editor: 'Editor de servicio',
}

function roleLabel(role) {
  return ROLE_LABELS[role] || role || 'Editor'
}

function normalizeAreaServicePermissions(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item?.resourceType === 'area_service' && item.areaSlug && item.resourceId)
    .map((item) => ({
      resourceType: 'area_service',
      areaSlug: String(item.areaSlug),
      resourceId: String(item.resourceId),
      canUpdate: item.canUpdate !== false,
    }))
}

function ServicePermissionPicker({
  role,
  permissions,
  onChange,
  areas,
  serviceOptionsByArea,
  onLoadAreaServices,
  disabled,
}) {
  const [areaSlug, setAreaSlug] = useState('')
  const [serviceId, setServiceId] = useState('')

  const services = useMemo(
    () => (areaSlug ? serviceOptionsByArea[areaSlug] || [] : []),
    [areaSlug, serviceOptionsByArea],
  )

  useEffect(() => {
    if (!areaSlug || role !== 'area_service_editor') return
    onLoadAreaServices(areaSlug)
  }, [areaSlug, onLoadAreaServices, role])

  if (role !== 'area_service_editor') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Este rol tiene permisos generales. Los permisos por servicio se usan solo para
        usuarios con rol “Editor de servicio”.
      </div>
    )
  }

  function addPermission() {
    if (!areaSlug || !serviceId) return
    const exists = permissions.some(
      (item) => item.areaSlug === areaSlug && item.resourceId === serviceId,
    )
    if (exists) return
    onChange([
      ...permissions,
      {
        resourceType: 'area_service',
        areaSlug,
        resourceId: serviceId,
        canUpdate: true,
      },
    ])
  }

  function removePermission(target) {
    onChange(
      permissions.filter(
        (item) =>
          !(item.areaSlug === target.areaSlug && item.resourceId === target.resourceId),
      ),
    )
  }

  function permissionLabel(permission) {
    const area = areas.find((item) => item.slug === permission.areaSlug)
    const service = (serviceOptionsByArea[permission.areaSlug] || []).find(
      (item) => item.id === permission.resourceId,
    )
    return {
      area: area?.title || permission.areaSlug,
      service: service?.title || permission.resourceId,
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <div>
        <p className="text-sm font-bold text-slate-900">Permisos por servicio de área</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          El usuario solo podrá abrir el link directo del servicio asignado y guardar
          cambios en ese servicio.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className={labelClass}>
          Área
          <select
            className={inputClass}
            value={areaSlug}
            onChange={(e) => {
              setAreaSlug(e.target.value)
              setServiceId('')
            }}
            disabled={disabled}
          >
            <option value="">Seleccionar área</option>
            {areas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.title}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Servicio
          <select
            className={inputClass}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={disabled || !areaSlug || !services.length}
          >
            <option value="">Seleccionar servicio</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || !areaSlug || !serviceId}
          onClick={addPermission}
        >
          Agregar
        </Button>
      </div>
      {areaSlug && serviceOptionsByArea[areaSlug] && !services.length ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Esta área no tiene servicios con identificador estable. Guardá el área desde
          su editor para generar IDs antes de asignarla.
        </p>
      ) : null}
      {permissions.length ? (
        <ul className="space-y-2">
          {permissions.map((permission) => {
            const label = permissionLabel(permission)
            const link = `/admin/area-services/${permission.areaSlug}/${permission.resourceId}`
            return (
              <li
                key={`${permission.areaSlug}:${permission.resourceId}`}
                className="rounded-xl border border-white bg-white px-3 py-2 text-sm shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{label.service}</p>
                    <p className="text-xs text-slate-500">{label.area}</p>
                    <p className="mt-1 break-all text-xs font-medium text-sky-700">
                      Link: {link}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    className="px-2.5! py-1! text-xs!"
                    disabled={disabled}
                    onClick={() => removePermission(permission)}
                  >
                    Quitar
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-sky-200 bg-white/70 px-3 py-2 text-xs text-slate-600">
          Todavía no hay servicios asignados.
        </p>
      )}
    </div>
  )
}

export function AdminUsers() {
  const { user: sessionUser } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [toast, setToast] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])

  const [modal, setModal] = useState(null)
  const [modalBusy, setModalBusy] = useState(false)
  const [modalFormError, setModalFormError] = useState('')
  const [areas, setAreas] = useState([])
  const [serviceOptionsByArea, setServiceOptionsByArea] = useState({})

  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createFullName, setCreateFullName] = useState('')
  const [createRole, setCreateRole] = useState('editor')
  const [createPermissions, setCreatePermissions] = useState([])

  const [editLoading, setEditLoading] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editFullName, setEditFullName] = useState('')
  const [editRole, setEditRole] = useState('editor')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editPermissions, setEditPermissions] = useState([])

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    if (!isApiConfigured()) return
    setError('')
    setLoading(true)
    try {
      const data = await fetchUsersList()
      setItems(Array.isArray(data.items) ? data.items : [])
      setTotal(typeof data.total === 'number' ? data.total : 0)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los usuarios.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const loadAreasCatalog = useCallback(async () => {
    if (!isApiConfigured()) return
    try {
      const data = await fetchAreasAdmin()
      setAreas(data)
    } catch {
      setAreas([])
    }
  }, [])

  useEffect(() => {
    loadAreasCatalog()
  }, [loadAreasCatalog])

  const loadAreaServices = useCallback(
    async (slug) => {
      if (!slug) return
      try {
        const profile = await fetchAreaProfile(slug)
        const services = (profile?.serviceBlocks || [])
          .filter((item) => item?.id && item?.title)
          .map((item) => ({
            id: String(item.id),
            title: String(item.title),
          }))
        setServiceOptionsByArea((current) => ({
          ...current,
          [slug]: services,
        }))
      } catch {
        setServiceOptionsByArea((current) => ({
          ...current,
          [slug]: [],
        }))
      }
    },
    [],
  )

  function resetCreateForm() {
    setCreateUsername('')
    setCreatePassword('')
    setCreateFullName('')
    setCreateRole('editor')
    setCreatePermissions([])
  }

  function openCreateModal() {
    resetCreateForm()
    setModalFormError('')
    setModal({ mode: 'create' })
  }

  function openEditModal(id) {
    setModalFormError('')
    setEditPassword('')
    setEditUsername('')
    setEditFullName('')
    setEditRole('editor')
    setEditIsActive(true)
    setEditPermissions([])
    setEditLoading(true)
    setModal({ mode: 'edit', id })
  }

  function closeModal() {
    if (modalBusy) return
    setModal(null)
    setModalFormError('')
    setEditLoading(false)
  }

  useEffect(() => {
    if (modal?.mode !== 'edit') return
    let cancelled = false
    const id = modal.id
    setEditLoading(true)
    setModalFormError('')
    fetchUserById(id)
      .then((data) => {
        if (cancelled || !data?.user) return
        const u = data.user
        setEditUsername(u.username || '')
        setEditFullName(u.fullName || '')
        setEditRole(ROLE_LABELS[u.role] ? u.role : 'editor')
        setEditIsActive(u.isActive !== false)
        const permissions = normalizeAreaServicePermissions(u.permissions)
        setEditPermissions(permissions)
        permissions.forEach((permission) => {
          loadAreaServices(permission.areaSlug)
        })
      })
      .catch((e) => {
        if (!cancelled) {
          setToast({ type: 'error', message: e.message || 'No se pudo cargar el usuario.' })
          setModal(null)
        }
      })
      .finally(() => {
        if (!cancelled) setEditLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadAreaServices, modal])

  async function handleCreateSubmit(e) {
    e.preventDefault()
    setModalFormError('')
    const u = createUsername.trim()
    if (u.length < 3) {
      setModalFormError('El nombre de usuario debe tener al menos 3 caracteres.')
      return
    }
    if (!createPassword || createPassword.length < 6) {
      setModalFormError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (createRole === 'area_service_editor' && createPermissions.length === 0) {
      setModalFormError('Asigná al menos un servicio para este usuario.')
      return
    }
    setModalBusy(true)
    try {
      await createUser({
        username: u,
        password: createPassword,
        fullName: createFullName.trim(),
        role: createRole,
        permissions: createRole === 'area_service_editor' ? createPermissions : [],
        isActive: true,
      })
      setModal(null)
      resetCreateForm()
      await load()
      setToast({ type: 'success', message: 'Usuario creado correctamente.' })
    } catch (e) {
      setToast({
        type: 'error',
        message: e.message || 'No se pudo crear el usuario.',
      })
    } finally {
      setModalBusy(false)
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setModalFormError('')
    if (!modal || modal.mode !== 'edit') return
    const u = editUsername.trim()
    if (u.length < 3) {
      setModalFormError('El nombre de usuario debe tener al menos 3 caracteres.')
      return
    }
    const pwd = editPassword.trim()
    if (pwd.length > 0 && pwd.length < 6) {
      setModalFormError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (editRole === 'area_service_editor' && editPermissions.length === 0) {
      setModalFormError('Asigná al menos un servicio para este usuario.')
      return
    }
    setModalBusy(true)
    try {
      const existing = items.find((x) => Number(x.id) === Number(modal.id))
      const payload = {
        username: u,
        fullName: editFullName.trim(),
        role: editRole,
        permissions: editRole === 'area_service_editor' ? editPermissions : [],
        isActive: editIsActive,
        expectedUpdatedAt: existing?.updatedAt || null,
      }
      if (pwd.length > 0) payload.password = pwd
      await updateUser(modal.id, payload)
      setModal(null)
      setEditPassword('')
      await load()
      setToast({ type: 'success', message: 'Usuario actualizado correctamente.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setToast({
        type: 'error',
        message: e.message || 'No se pudo guardar los cambios.',
      })
    } finally {
      setModalBusy(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      await load()
      setToast({ type: 'success', message: 'Usuario eliminado correctamente.' })
    } catch (e) {
      setToast({
        type: 'error',
        message: e.message || 'No se pudo eliminar el usuario.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!isApiConfigured()) {
    return (
      <AdminPageShell
        eyebrow="Administración"
        title="Usuarios"
        subtitle="La gestión de usuarios requiere conexión con el backend."
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
      <ConfirmDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar última versión y reintentar"
        cancelLabel="Cerrar"
        loading={false}
        onConfirm={() => window.location.reload()}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null)
        }}
        title="¿Eliminar este usuario?"
        description={
          deleteTarget ? (
            <>
              Se eliminará la cuenta{' '}
              <span className="font-semibold text-slate-800">
                @{deleteTarget.username}
              </span>
              . Esta acción no se puede deshacer.
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
        title="Nuevo usuario"
        description="Definí nombre de usuario, contraseña y rol. El acceso al panel es solo con usuario y clave."
      >
        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          {modalFormError ? (
            <p className={formErrorClass} role="alert">
              {modalFormError}
            </p>
          ) : null}
          <label className={labelClass}>
            Nombre de usuario
            <input
              className={inputClass}
              name="username"
              autoComplete="off"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              required
              minLength={3}
              maxLength={32}
              disabled={modalBusy}
            />
          </label>
          <label className={labelClass}>
            Contraseña
            <input
              className={inputClass}
              type="password"
              name="password"
              autoComplete="new-password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              required
              minLength={6}
              disabled={modalBusy}
            />
          </label>
          <label className={labelClass}>
            Nombre completo
            <input
              className={inputClass}
              name="fullName"
              value={createFullName}
              onChange={(e) => setCreateFullName(e.target.value)}
              disabled={modalBusy}
            />
          </label>
          <label className={labelClass}>
            Rol
            <select
              className={inputClass}
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              disabled={modalBusy}
            >
              <option value="editor">Editor</option>
              <option value="area_service_editor">Editor de servicio</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <ServicePermissionPicker
            role={createRole}
            permissions={createPermissions}
            onChange={setCreatePermissions}
            areas={areas}
            serviceOptionsByArea={serviceOptionsByArea}
            onLoadAreaServices={loadAreaServices}
            disabled={modalBusy}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={modalBusy}>
              {modalBusy ? 'Guardando…' : 'Crear usuario'}
            </Button>
            <Button type="button" variant="secondary" disabled={modalBusy} onClick={closeModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal?.mode === 'edit'}
        onClose={closeModal}
        loading={modalBusy || editLoading}
        title="Editar usuario"
        description="Modificá datos, rol y estado. Dejá la contraseña en blanco para no cambiarla."
      >
        {editLoading && modal?.mode === 'edit' ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-slate-600">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
            Cargando datos…
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            {modalFormError ? (
              <p className={formErrorClass} role="alert">
                {modalFormError}
              </p>
            ) : null}
            <label className={labelClass}>
              Nombre de usuario
              <input
                className={inputClass}
                name="editUsername"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                disabled={modalBusy}
              />
            </label>
            <label className={labelClass}>
              Nombre completo
              <input
                className={inputClass}
                name="editFullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                disabled={modalBusy}
              />
            </label>
            <label className={labelClass}>
              Nueva contraseña (opcional)
              <input
                className={inputClass}
                type="password"
                name="editPassword"
                autoComplete="new-password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                minLength={6}
                placeholder="Solo si querés cambiarla"
                disabled={modalBusy}
              />
            </label>
            <label className={labelClass}>
              Rol
              <select
                className={inputClass}
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                disabled={modalBusy}
              >
                <option value="editor">Editor</option>
                <option value="area_service_editor">Editor de servicio</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <ServicePermissionPicker
              role={editRole}
              permissions={editPermissions}
              onChange={setEditPermissions}
              areas={areas}
              serviceOptionsByArea={serviceOptionsByArea}
              onLoadAreaServices={loadAreaServices}
              disabled={modalBusy}
            />
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                disabled={modalBusy}
              />
              Cuenta activa
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={modalBusy}>
                {modalBusy ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              <Button type="button" variant="secondary" disabled={modalBusy} onClick={closeModal}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Administración"
        title="Usuarios del sistema"
        subtitle={`Total: ${total}. Gestioná cuentas con nombre de usuario y contraseña.`}
        actions={
          <Button type="button" onClick={openCreateModal}>
            Nuevo usuario
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
                <div className="mt-4 h-8 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3.5 sm:px-5">Usuario</th>
                    <th className="hidden px-4 py-3.5 sm:table-cell sm:px-5">Nombre</th>
                    <th className="w-28 px-4 py-3.5 sm:px-5">Rol</th>
                    <th className="w-28 px-4 py-3.5 sm:px-5">Estado</th>
                    <th className="w-40 px-4 py-3.5 sm:px-5">Alta</th>
                    <th className="w-44 px-4 py-3.5 text-right sm:px-5">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-900 sm:px-5">
                        @{u.username}
                      </td>
                      <td className="hidden max-w-[220px] truncate px-4 py-3.5 sm:table-cell sm:px-5">
                        {u.fullName || '—'}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900 ring-1 ring-sky-100">
                          {roleLabel(u.role)}
                        </span>
                        {u.role === 'area_service_editor' ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {normalizeAreaServicePermissions(u.permissions).length} servicio(s)
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        {u.isActive ? (
                          <span className="text-emerald-700">Activo</span>
                        ) : (
                          <span className="text-slate-500">Inactivo</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-600 sm:px-5">
                        {u.createdAt ? formatShortDate(u.createdAt) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right sm:px-5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-2.5! py-1! text-xs!"
                            onClick={() => openEditModal(u.id)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="px-2.5! py-1! text-xs!"
                            disabled={String(sessionUser?.id) === String(u.id)}
                            onClick={() =>
                              setDeleteTarget({
                                id: u.id,
                                username: u.username || u.id,
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

            <ul className="space-y-3 lg:hidden">
              {items.map((u) => (
                <li
                  key={u.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold text-slate-900">@{u.username}</p>
                  {u.fullName ? (
                    <p className="mt-1 text-sm text-slate-600">{u.fullName}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-900 ring-1 ring-sky-100">
                      {roleLabel(u.role)}
                    </span>
                    <span>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 px-2.5! py-2! text-xs! sm:flex-none"
                      onClick={() => openEditModal(u.id)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="flex-1 px-2.5! py-2! text-xs! sm:flex-none"
                      disabled={String(sessionUser?.id) === String(u.id)}
                      onClick={() =>
                        setDeleteTarget({
                          id: u.id,
                          username: u.username || u.id,
                        })
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
