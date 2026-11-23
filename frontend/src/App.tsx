import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FarmProvider } from './context/FarmContext'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CowsPage from './pages/CowsPage'
import MilkEntryPage from './pages/MilkEntryPage'
import MilkRecordsPage from './pages/MilkRecordsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SupplyPage from './pages/SupplyPage'
import PaymentsPage from './pages/PaymentsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Layout>{children}</Layout>
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/cows"
                element={
                  <ProtectedLayout>
                    <CowsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/milk-entry"
                element={
                  <ProtectedLayout>
                    <MilkEntryPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/records"
                element={
                  <ProtectedLayout>
                    <MilkRecordsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedLayout>
                    <AnalyticsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/supply"
                element={
                  <ProtectedLayout>
                    <SupplyPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedLayout>
                    <PaymentsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedLayout>
                    <ReportsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedLayout>
                    <SettingsPage />
                  </ProtectedLayout>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FarmProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
