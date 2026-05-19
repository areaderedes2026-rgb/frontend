export const EMPTY_SERVICE_PROJECT = {
  id: '',
  title: '',
  description: '',
  status: '',
  imageUrl: '',
  linkUrl: '',
  linkLabel: '',
}

export function normalizeServiceProjects(projects) {
  return (Array.isArray(projects) ? projects : [])
    .map((project) => ({
      id: String(project?.id || '').trim(),
      title: String(project?.title || '').trim(),
      description: String(project?.description || '').trim(),
      status: String(project?.status || '').trim(),
      imageUrl: String(project?.imageUrl || '').trim(),
      linkUrl: String(project?.linkUrl || '').trim(),
      linkLabel: String(project?.linkLabel || '').trim(),
    }))
    .filter((project) =>
      Boolean(
        project.title ||
          project.description ||
          project.status ||
          project.imageUrl ||
          project.linkUrl ||
          project.linkLabel,
      ),
    )
}
