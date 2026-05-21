import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { isAccessGranted, getCurrentUser } from './lib/auth'
import { ChatPage } from './pages/ChatPage'
import { LandingPage } from './pages/LandingPage'
import { UserSelectPage } from './pages/UserSelectPage'

function RootRedirect() {
  if (!isAccessGranted()) return <LandingPage />
  if (!getCurrentUser()) return <Navigate to="/select" replace />
  return <Navigate to="/chat" replace />
}

export default function App() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/select"
            element={
              <ProtectedRoute>
                <UserSelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute requireUser>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
