import { useOutletContext, useParams } from 'react-router-dom'
import { ServicesCategoryView } from '../components/services/ServicesCategoryView.jsx'

export function ServicesCategoryPage() {
  const { categorySlug = '' } = useParams()
  const { content, services, contentReady } = useOutletContext()

  return (
    <ServicesCategoryView
      content={content}
      services={services}
      categorySlug={categorySlug}
      contentReady={contentReady}
    />
  )
}
