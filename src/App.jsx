import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { FdcPublicProvider } from './context/FdcPublicProvider.jsx'
import { AppRouter } from './routes/AppRouter.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FdcPublicProvider>
          <AppRouter />
        </FdcPublicProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
