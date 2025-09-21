import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ChefHat, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Building2, 
  UserCheck, 
  Plus,
  Menu,
  X,
  LogOut,
  Bell,
  Settings,
  Search,
  Truck,
  Receipt,
  UtensilsCrossed,
  Clock,
  CalendarIcon,
  Edit3,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// import { CompactDatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import { useGetOrders } from '@/hooks/queries/useGetOrders'
import { useMemo } from 'react'
import ModeToggle from '@/components/ModeToggle'
import { SettingsModal } from '@/components/modals/SettingsModal'
import { useHeaderConfig } from '@/hooks/useHeaderConfig'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface MainLayoutProps {
  children: React.ReactNode
  onLogout: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
  iconColor?: string
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    iconColor: 'text-blue-500',
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    iconColor: 'text-green-500',
    badge: '5',
    children: [
      { title: 'All Orders', href: '/orders', icon: ShoppingCart, iconColor: 'text-green-600' },
      { title: 'Add Order', href: '/add-order', icon: Plus, iconColor: 'text-emerald-600' },
    ],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    iconColor: 'text-purple-500',
    children: [
      { title: 'Individual', href: '/customers/individual', icon: Users, iconColor: 'text-emerald-600' },
      { title: 'Companies', href: '/customers/company', icon: Building2, iconColor: 'text-sky-600' },
      { title: 'Agents', href: '/customers/agents', icon: UserCheck, iconColor: 'text-amber-600' },
    ],
  },
  {
    title: 'Kitchen',
    href: '/kitchen',
    icon: UtensilsCrossed,
    iconColor: 'text-orange-500',
    badge: '3',
  },
  {
    title: 'Delivery',
    href: '/delivery',
    icon: Truck,
    iconColor: 'text-cyan-500',
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: Receipt,
    iconColor: 'text-yellow-500',
  },
]

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [orderForDate, setOrderForDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Tomorrow
  const [desktopDatePickerOpen, setDesktopDatePickerOpen] = useState(false)
  const [mobileDatePickerOpen, setMobileDatePickerOpen] = useState(false)
  const headerConfig = useHeaderConfig()
  // Removed unused local filters (managed in pages)
  const location = useLocation()

  // Ensure only one date picker is open at a time
  React.useEffect(() => {
    if (desktopDatePickerOpen && mobileDatePickerOpen) {
      setMobileDatePickerOpen(false)
    }
  }, [desktopDatePickerOpen, mobileDatePickerOpen])

  // Close date pickers when navigating away from order pages
  React.useEffect(() => {
    const isOrderPage = location.pathname.startsWith('/add-order') || 
                       location.pathname.startsWith('/compact-add-order') || 
                       location.pathname.startsWith('/modern-add-order')
    
    if (!isOrderPage) {
      setDesktopDatePickerOpen(false)
      setMobileDatePickerOpen(false)
    }
  }, [location.pathname])

  const isOrdersPage = location.pathname.startsWith('/orders')

  // Get orders data for summary cards
  const { data: ordersData } = useGetOrders()

  // Calculate meal summary totals for Orders page
  useMemo(() => {
    if (!ordersData?.data || !isOrdersPage) return null
    // Summary computed in Orders page
    return null
  }, [ordersData, isOrdersPage])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // Removed unused isActiveRoute helper

  const renderNavItem = (item: NavItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.title}>
        <div className="group">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.title)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                level > 0 && 'ml-4'
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
                <span>{item.title}</span>
              </div>
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <Link
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                level > 0 && 'ml-4'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={cn("mr-3 h-4 w-4", item.iconColor)} />
              <span>{item.title}</span>
            </Link>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand/10 rounded-lg">
              <ChefHat className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-lg font-bold">MunchBox</h1>
              <p className="text-xs text-muted-foreground">Kitchen Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navigationItems.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              MunchBox v1.0
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                
                {/* Dynamic Page Title - Desktop */}
                {headerConfig.title && (
                  <div className="hidden md:block">
                    {headerConfig.orderDetails ? (
                      /* Professional single line layout for order pages */
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{headerConfig.title}</h1>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700 font-medium">Entry: {headerConfig.orderDetails.entryDate}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                            {headerConfig.orderDetails.canEditOrderDate ? (
                              <Popover open={desktopDatePickerOpen} onOpenChange={setDesktopDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-auto p-0 text-blue-800 font-semibold hover:text-blue-900 hover:bg-transparent cursor-pointer underline decoration-dotted underline-offset-2 hover:decoration-solid flex items-center gap-1"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setDesktopDatePickerOpen(true)
                                      setMobileDatePickerOpen(false) // Ensure mobile is closed
                                    }}
                                  >
                                    Order For: {format(orderForDate, 'dd/MM/yyyy')}
                                    <Edit3 className="h-3 w-3 opacity-60" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-0 z-[9999] bg-white shadow-lg border rounded-md" 
                                  align="start"
                                  side="bottom"
                                  sideOffset={5}
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                  avoidCollisions={true}
                                  collisionPadding={10}
                                >
                                  <Calendar
                                    mode="single"
                                    selected={orderForDate}
                                    onSelect={(date) => {
                                      if (date) {
                                        setOrderForDate(date)
                                        setDesktopDatePickerOpen(false)
                                      }
                                    }}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="text-blue-800 font-semibold">Order For: {format(orderForDate, 'dd/MM/yyyy')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Professional layout for other pages */
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{headerConfig.title}</h1>
                        {headerConfig.subtitle && (
                          <span className="text-sm text-gray-500 font-normal">• {headerConfig.subtitle}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Page Title - Mobile */}
                {headerConfig.title && (
                  <div className="md:hidden">
                    {headerConfig.orderDetails ? (
                      /* Mobile layout for order pages */
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                          <h1 className="text-lg font-bold text-gray-900">{headerConfig.title}</h1>
                        </div>
                        <div className="flex flex-col gap-2 text-xs">
                          <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md">
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span className="text-gray-700 font-medium">Entry: {headerConfig.orderDetails.entryDate}</span>
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-md">
                            <CalendarIcon className="h-3 w-3 text-blue-600" />
                            {headerConfig.orderDetails.canEditOrderDate ? (
                              <Popover open={mobileDatePickerOpen} onOpenChange={setMobileDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-auto p-0 text-blue-800 font-semibold hover:text-blue-900 hover:bg-transparent text-xs cursor-pointer underline decoration-dotted underline-offset-2 hover:decoration-solid flex items-center gap-1"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setMobileDatePickerOpen(true)
                                      setDesktopDatePickerOpen(false) // Ensure desktop is closed
                                    }}
                                  >
                                    Order For: {format(orderForDate, 'dd/MM/yyyy')}
                                    <Edit3 className="h-2.5 w-2.5 opacity-60" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-0 z-[9999] bg-white shadow-lg border rounded-md" 
                                  align="start"
                                  side="bottom"
                                  sideOffset={5}
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                  avoidCollisions={true}
                                  collisionPadding={10}
                                >
                                  <Calendar
                                    mode="single"
                                    selected={orderForDate}
                                    onSelect={(date) => {
                                      if (date) {
                                        setOrderForDate(date)
                                        setMobileDatePickerOpen(false)
                                      }
                                    }}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="text-blue-800 font-semibold text-xs">Order For: {format(orderForDate, 'dd/MM/yyyy')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Mobile layout for other pages */
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
                        <h1 className="text-lg font-bold text-gray-900">{headerConfig.title}</h1>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Dynamic Search */}
                {headerConfig.searchPlaceholder && (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={headerConfig.searchPlaceholder}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                {headerConfig.quickActions && headerConfig.quickActions.length > 0 && (
                  <>
                    <div className="hidden md:flex items-center space-x-2">
                      {headerConfig.quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="flex items-center gap-2"
                        >
                          <action.icon className="h-4 w-4" />
                          <span>{action.label}</span>
                        </Button>
                      ))}
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                  </>
                )}
                
                {/* Dynamic Notifications */}
                {headerConfig.showNotifications && (
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                    {headerConfig.notificationCount && headerConfig.notificationCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0">
                        {headerConfig.notificationCount}
                  </Badge>
                    )}
                </Button>
                )}

                <Separator orientation="vertical" className="h-6" />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-brand">A</span>
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium">Admin User</div>
                        <div className="text-xs text-muted-foreground">admin@munchbox.com</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme toggle */}
                <ModeToggle />
              </div>
            </div>
          </div>

          {/* Orders page summary and filters are rendered within the Orders page itself to ensure counts match the table. */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </div>
  )
}

export default MainLayout
