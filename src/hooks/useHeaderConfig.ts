import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import { format } from 'date-fns'
import { useUser } from '@/contexts/UserContext'

export interface HeaderConfig {
  searchPlaceholder: string
  searchAction?: () => void
  showNotifications: boolean
  notificationCount?: number
  additionalActions?: React.ReactNode
  title?: string
  subtitle?: string
  orderDetails?: {
    entryDate: string
    orderForDate: string
    canEditOrderDate: boolean
  }
  quickActions?: {
    label: string
    icon: React.ComponentType<any>
    action: () => void
  }[]
}

export const useHeaderConfig = (): HeaderConfig => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userRole } = useUser()
  
  return useMemo(() => {
    const pathname = location.pathname
    const currentDate = new Date()
    const tomorrowDate = new Date(currentDate)
    tomorrowDate.setDate(currentDate.getDate() + 1)
    
    // Dashboard
    if (pathname === '/') {
      return {
        searchPlaceholder: 'Search orders, customers...',
        showNotifications: true,
        notificationCount: 3,
        title: 'Dashboard',
        subtitle: 'Overview of your operations'
      }
    }
    
    // Orders
    if (pathname.startsWith('/orders')) {
      return {
        searchPlaceholder: 'Search orders by ID, customer...',
        showNotifications: true,
        notificationCount: 5,
        title: 'Orders',
        subtitle: 'Manage all orders',
        quickActions: [
          {
            label: 'New Order',
            icon: Plus,
            action: () => navigate('/add-order')
          },
          {
            label: 'Export',
            icon: Download,
            action: () => console.log('Export orders')
          }
        ]
      }
    }
    
    // New Order
    if (pathname.startsWith('/add-order') || pathname.startsWith('/compact-add-order') || pathname.startsWith('/modern-add-order')) {
      return {
        searchPlaceholder: '', // No search box
        showNotifications: false, // No notifications
        title: 'Add New Order',
        orderDetails: {
          entryDate: format(currentDate, 'dd/MM/yyyy'),
          orderForDate: format(tomorrowDate, 'dd/MM/yyyy'),
          canEditOrderDate: userRole === 'Admin' || userRole === 'Privileged'
        }
      }
    }
    
    // Customers
    if (pathname.startsWith('/customers')) {
      return {
        searchPlaceholder: 'Search customers by name, mobile...',
        showNotifications: true,
        notificationCount: 2,
        title: 'Customers',
        subtitle: 'Manage customer database',
        quickActions: [
          {
            label: 'Add Customer',
            icon: Plus,
            action: () => console.log('Add customer')
          },
          {
            label: 'Export',
            icon: Download,
            action: () => console.log('Export customers')
          }
        ]
      }
    }
    
    // Companies
    if (pathname.startsWith('/companies')) {
      return {
        searchPlaceholder: 'Search companies by name...',
        showNotifications: true,
        notificationCount: 1,
        title: 'Companies',
        subtitle: 'Corporate customer management'
      }
    }
    
    // Agents
    if (pathname.startsWith('/agents')) {
      return {
        searchPlaceholder: 'Search agents by name...',
        showNotifications: true,
        notificationCount: 0,
        title: 'Agents',
        subtitle: 'Agent customer management'
      }
    }
    
    // Kitchen
    if (pathname.startsWith('/kitchen')) {
      return {
        searchPlaceholder: 'Search kitchen orders...',
        showNotifications: true,
        notificationCount: 8,
        title: 'Kitchen',
        subtitle: 'Order preparation status',
        quickActions: [
          {
            label: 'Print Orders',
            icon: Download,
            action: () => console.log('Print kitchen orders')
          }
        ]
      }
    }
    
    // Delivery
    if (pathname.startsWith('/delivery')) {
      return {
        searchPlaceholder: 'Search delivery orders...',
        showNotifications: true,
        notificationCount: 4,
        title: 'Delivery',
        subtitle: 'Delivery management'
      }
    }
    
    // Invoices
    if (pathname.startsWith('/invoices')) {
      return {
        searchPlaceholder: 'Search invoices by date, amount...',
        showNotifications: false,
        title: 'Invoices',
        subtitle: 'Invoice management',
        quickActions: [
          {
            label: 'Process Invoice',
            icon: Plus,
            action: () => console.log('Process invoice')
          },
          {
            label: 'Export',
            icon: Download,
            action: () => console.log('Export invoices')
          }
        ]
      }
    }
    
    // Settings
    if (pathname.startsWith('/settings')) {
      return {
        searchPlaceholder: 'Search settings...',
        showNotifications: false,
        title: 'Settings',
        subtitle: 'Application configuration'
      }
    }
    
    // Default fallback
    return {
      searchPlaceholder: 'Search...',
      showNotifications: true,
      notificationCount: 0
    }
  }, [location.pathname])
}
