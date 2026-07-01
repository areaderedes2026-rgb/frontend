import { useOutletContext } from 'react-router-dom'
import { ServicesPublicView } from '../components/services/ServicesPublicView.jsx'

export function Services() {
  const { content, services } = useOutletContext()
  return <ServicesPublicView content={content} services={services} />
}
