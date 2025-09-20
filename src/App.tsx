import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { toastMessages } from '@/lib/toast'
import { initGlobalNumberInputScrollPrevention } from '@/lib/inputUtils'

// Import components
import LoginScreen from '@/components/auth/LoginScreen'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/contexts/UserContext'

// Import pages
import Dashboard from '@/pages/Dashboard'
import Orders from '@/pages/Orders'
import AddOrder from '@/pages/AddOrder'
import IndividualCustomers from '@/pages/IndividualCustomers'
import CompanyCustomers from '@/pages/CompanyCustomers'
import AgentCustomers from '@/pages/AgentCustomers'
import AddCustomer from '@/pages/AddCustomer'
import AddCompany from '@/pages/AddCompany'
import AddAgent from '@/pages/AddAgent'
import Kitchen from '@/pages/Kitchen'
import KitchenDetail from '@/pages/KitchenDetail'
import Delivery from '@/pages/Delivery'
import Invoices from '@/pages/Invoices'

// Auth hook
import { useLogin } from '@/hooks/mutations/useLogin'
import { authService } from '@/api/services'

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('isLoggedIn')
    return savedAuth === 'true'
  })
  const [isInitializing, setIsInitializing] = useState(true)

  const loginMutation = useLogin({
    onSuccess: () => {
      setIsLoggedIn(true)
      // Persist login across refreshes
      localStorage.setItem('isLoggedIn', 'true')
      toastMessages.loginSuccess()
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Login failed. Please try again.'
      toastMessages.loginError(errorMessage)
    },
  })

  // Check authentication state on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      const savedAuth = localStorage.getItem('isLoggedIn') === 'true'

      // Keep user logged in if either a token exists OR the persisted flag is true
      if (savedAuth || token) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }

      setIsInitializing(false)
    }

    checkAuth()
    
    // Initialize global scroll prevention for number inputs
    initGlobalNumberInputScrollPrevention()
  }, [])

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      await loginMutation.mutateAsync(credentials)
    } catch (error) {
      // Error handling is done in the mutation onError callback
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsLoggedIn(false)
      toastMessages.logoutSuccess()
    } catch (error) {
      console.error('Logout error:', error)
      // Still log out locally even if API call fails
      setIsLoggedIn(false)
      localStorage.removeItem('authToken')
      localStorage.removeItem('isLoggedIn')
    }
  }

  // Show loading spinner during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Routes>
          <Route 
            path="/login" 
            element={
              <LoginScreen 
                onLogin={handleLogin} 
                isLoading={loginMutation.isPending} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </div>
    )
  }

  // Main application routes (authenticated)
  return (
    <div className="min-h-screen bg-background">
      <Routes>
    {/* Redirect login to dashboard if already authenticated */}
    <Route path="/login" element={<Navigate to="/" replace />} />
    
    {/* Main application routes with layout */}
    <Route
      path="/*"
      element={
        <MainLayout onLogout={handleLogout}>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Orders */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/add-order" element={<AddOrder />} />
            
            {/* Customers */}
            <Route path="/customers/individual" element={<IndividualCustomers />} />
            <Route path="/customers/company" element={<CompanyCustomers />} />
            <Route path="/customers/agents" element={<AgentCustomers />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/add-company" element={<AddCompany />} />
            <Route path="/add-agent" element={<AddAgent />} />
            
            {/* Kitchen & Operations */}
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/kitchen/:date" element={<KitchenDetail />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/invoices" element={<Invoices />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      }
    />
    </Routes>
    {/* Sonner Toast Container */}
    <Toaster />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
