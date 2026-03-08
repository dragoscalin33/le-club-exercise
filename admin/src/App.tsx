import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantFormPage from './pages/RestaurantFormPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/restaurants"
            element={
              <PrivateRoute>
                <RestaurantsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurants/new"
            element={
              <PrivateRoute>
                <RestaurantFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurants/:id/edit"
            element={
              <PrivateRoute>
                <RestaurantFormPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/restaurants" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
