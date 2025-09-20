"use client"

import { useEffect, useRef, useState, useMemo } from 'react'
import { CalendarIcon, Plus, Search, X, User, Clock, Shield, UserCheck, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { useGetCompanyCustomers } from '@/hooks/queries/useGetCompanyCustomers'
import { useGetAgentCustomers } from '@/hooks/queries/useGetAgentCustomers'
import { useUser } from '@/contexts/UserContext'
import { useSettings } from '@/hooks/useSettings'
import { getOrderCreationLogic } from '@/lib/orderLogic'
import { showToast } from '@/lib/toast'
import { ApiCompanyCustomer, ApiAgentCustomer } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
// Removed global preference selector; per-meal preferences will be captured instead
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Locked Order Overlay Component
function LockedOrderOverlay({ reason }: { reason?: string }) {
  // Format time from 24-hour to AM/PM format
  const formatTimeToAMPM = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    } catch {
      return timeString
    }
  }

  // Extract and format time from reason message
  const formatReason = (reason?: string) => {
    if (!reason) return 'Orders are currently not available'
    
    // Look for time pattern like "22:00" and convert to AM/PM
    return reason.replace(/(\d{1,2}:\d{2})/g, (match) => formatTimeToAMPM(match))
  }

  return (
    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        {/* Animated Lock Icon */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4">
            <Lock className="w-full h-full text-red-500 animate-pulse" />
          </div>
          {/* Rotating lock ring animation */}
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* Locked Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Orders Locked
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            {formatReason(reason)}
          </p>
        </div>
        
        {/* Time indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          <span>Please try again tomorrow</span>
        </div>
      </div>
    </div>
  )
}

interface OrderData {
  customerId: string
  customerName: string
  customerMobile: string
  preference: 'veg' | 'non-veg' | 'none'
  breakfast: number
  lunch: number
  dinner: number
  breakfastVeg?: number
  breakfastNonVeg?: number
  lunchVeg?: number
  lunchNonVeg?: number
  dinnerVeg?: number
  dinnerNonVeg?: number
}

interface CompactOrderFormProps {
  onAddOrder: (orderData: OrderData) => void
  onDateChange: (date: Date) => void
  orderForDate: Date
  editingOrder?: OrderData | null
  resetKey?: number
}

export function CompactOrderForm({ onAddOrder, onDateChange, orderForDate, editingOrder = null, resetKey }: CompactOrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCompanyCustomer | ApiAgentCustomer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerType, setCustomerType] = useState<'company' | 'agent'>('company')
  // Capture per-meal veg/non-veg splits
  const [quantities, setQuantities] = useState({
    breakfastVeg: 0,
    breakfastNonVeg: 0,
    lunchVeg: 0,
    lunchNonVeg: 0,
    dinnerVeg: 0,
    dinnerNonVeg: 0,
  })
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date()) // Live time state
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const { data: companyData, isLoading: companyLoading } = useGetCompanyCustomers()
  const { data: agentData, isLoading: agentLoading } = useGetAgentCustomers()
  
  // Order creation logic hooks
  const { userRole, userName, isAdmin, isPrivileged } = useUser()
  const { settings, isLoading: settingsLoading } = useSettings()
  
  // Force update mechanism
  const [forceRender, setForceRender] = useState(0)
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 CompactOrderForm Debug:', {
      userRole,
      userName,
      isAdmin,
      isPrivileged,
      settings,
      settingsLoading,
      localStorageUserInfo: localStorage.getItem('userInfo'),
      localStorageSettings: localStorage.getItem('munchbox-settings'),
      isLoggedIn: localStorage.getItem('isLoggedIn')
    })
  }, [userRole, userName, isAdmin, isPrivileged, settings, settingsLoading])

  // Emergency localStorage check - force reload if data exists but context is null
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    console.log('🔍 Emergency Check:', {
      storedUserInfo,
      isLoggedIn,
      currentUserRole: userRole
    });
    
    if (isLoggedIn && storedUserInfo && !userRole) {
      console.log('🚨 EMERGENCY: Found user data in localStorage but context is null!');
      console.log('🚨 Stored userInfo:', storedUserInfo);
      console.log('🚨 Current userRole:', userRole);
      
      // Try to manually parse and set the user data
      try {
        const userData = JSON.parse(storedUserInfo);
        console.log('🚨 Parsed userData:', userData);
        
        // Force reload the page to reinitialize context
        console.log('🚨 Reloading page to fix context...');
        window.location.reload();
      } catch (error) {
        console.error('🚨 Error parsing userInfo:', error);
      }
    }
  }, [userRole])
  

  const customersLoading =
    (customerType === 'company' && companyLoading) ||
    (customerType === 'agent' && agentLoading) ||
    false

  // Live timer - update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update every second

    return () => clearInterval(timer) // Cleanup on unmount
  }, [])

  // Force re-render when userRole changes (fix for role switching bug)
  useEffect(() => {
    console.log('🔄 CompactOrderForm - User context changed:', {
      userRole,
      userName,
      isAdmin,
      isPrivileged
    });
    // Force a re-render when user context changes
    setForceRender(prev => prev + 1);
  }, [userRole, userName, isAdmin, isPrivileged])
  
  // Listen for localStorage changes (for role switching)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userInfo') {
        console.log('🔄 localStorage userInfo changed, forcing re-render');
        // Force a re-render by updating a dummy state
        setCurrentTime(new Date());
      }
    };
    
    // Listen for custom user role change events
    const handleUserRoleChange = (e: CustomEvent) => {
      console.log('🔄 Custom userRoleChanged event received:', e.detail);
      setForceRender(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userRoleChanged', handleUserRoleChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userRoleChanged', handleUserRoleChange as EventListener);
    };
  }, [])

  // Calculate order creation logic
  const orderLogic = useMemo(() => {
    // Show loading state only if we're actually loading
    if (settingsLoading) {
      return {
        orderDate: new Date(),
        permissions: { canPlaceOrder: false, canEditOrderDate: false, reason: 'Loading settings...' },
        isInMorningWindow: false,
        explanation: 'Loading settings...'
      }
    }
    
    // If userRole is null but not loading, show a different message
    if (!userRole) {
      return {
        orderDate: new Date(),
        permissions: { canPlaceOrder: false, canEditOrderDate: false, reason: 'Please login to continue' },
        isInMorningWindow: false,
        explanation: 'Please login to continue'
      }
    }
    
    // If settings are not available, use defaults
    if (!settings) {
      const defaultSettings = { 
        dayCutOffTime: '14:33',
        nightCutOffTime: '22:00',
        morningWindowEnd: '14:33'
      }
      const logic = getOrderCreationLogic(userRole, defaultSettings, currentTime)
      return {
        ...logic,
        explanation: getOrderExplanation(defaultSettings, logic.isInMorningWindow)
      }
    }
    
    // Normal flow with userRole and settings
    const logic = getOrderCreationLogic(userRole, settings, currentTime)
    return {
      ...logic,
      explanation: getOrderExplanation(settings, logic.isInMorningWindow)
    }
  }, [userRole, settings, settingsLoading, currentTime, forceRender]) // Add forceRender dependency

  // Helper function to generate explanation text
  function getOrderExplanation(settings: any, isInMorningWindow: boolean) {
    const morningTime = settings.morningWindowEnd || '14:30'
    const formattedTime = format(new Date(`2000-01-01T${morningTime}:00`), 'h:mm a')
    if (isInMorningWindow) {
      return `Orders placed before ${formattedTime} are delivered today.`
    } else {
      return `Orders placed after ${formattedTime} are delivered tomorrow.`
    }
  }

  const customersData =
    customerType === 'company'
      ? companyData
      : agentData

  const filteredCustomers = (customersData?.data || [])
    .filter((customer: any) =>
      (customer?.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer?.mobile || '').includes(customerSearch)
    )

  const handleCustomerSelect = (customer: ApiCompanyCustomer | ApiAgentCustomer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name || '')
    setShowCustomerDropdown(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerSearch('')
  }

  const handleQuantityChange = (key: keyof typeof quantities, value: string) => {
    const numValue = parseInt(value) || 0
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, numValue)
    }))
  }

  const handleAddOrder = () => {
    if (!selectedCustomer) {
      showToast.error('Please select a customer first', 'Choose a customer to continue')
      return
    }

    if (!orderLogic.permissions.canPlaceOrder) {
      // Orders are blocked - no toast notification, just return silently
      // The LockedOrderOverlay will show the locked state
      return
    }

    const totalBreakfast = quantities.breakfastVeg + quantities.breakfastNonVeg
    const totalLunch = quantities.lunchVeg + quantities.lunchNonVeg
    const totalDinner = quantities.dinnerVeg + quantities.dinnerNonVeg
    const totalQuantity = totalBreakfast + totalLunch + totalDinner
    if (totalQuantity === 0) {
      showToast.error('Please add meal quantities', 'Enter at least one meal quantity')
      return
    }

    const orderData: OrderData = {
      customerId: selectedCustomer.id.toString(),
      customerName: selectedCustomer.name || '',
      customerMobile: selectedCustomer.mobile || '',
      preference: 'none',
      breakfast: totalBreakfast,
      lunch: totalLunch,
      dinner: totalDinner,
      breakfastVeg: quantities.breakfastVeg,
      breakfastNonVeg: quantities.breakfastNonVeg,
      lunchVeg: quantities.lunchVeg,
      lunchNonVeg: quantities.lunchNonVeg,
      dinnerVeg: quantities.dinnerVeg,
      dinnerNonVeg: quantities.dinnerNonVeg,
    }

    onAddOrder(orderData)
    
    // Reset form
    setQuantities({
      breakfastVeg: 0,
      breakfastNonVeg: 0,
      lunchVeg: 0,
      lunchNonVeg: 0,
      dinnerVeg: 0,
      dinnerNonVeg: 0,
    })
    setSelectedCustomer(null)
    setCustomerSearch('')
    setShowCustomerDropdown(true)
    // Focus back to the search input for quick next entry
    searchInputRef.current?.focus()
    // Parent handles user feedback toast; avoid duplicate notifications here
  }

  const totalQuantity =
    quantities.breakfastVeg +
    quantities.breakfastNonVeg +
    quantities.lunchVeg +
    quantities.lunchNonVeg +
    quantities.dinnerVeg +
    quantities.dinnerNonVeg

  // Populate form when editing an existing order
  useEffect(() => {
    if (!editingOrder) return

    const makeHalfSplit = (total: number) => {
      const veg = Math.max(0, Math.floor((total || 0) / 2))
      const nonVeg = Math.max(0, (total || 0) - veg)
      return { veg, nonVeg }
    }

    const b = makeHalfSplit(editingOrder.breakfast)
    const l = makeHalfSplit(editingOrder.lunch)
    const d = makeHalfSplit(editingOrder.dinner)

    setQuantities({
      breakfastVeg: b.veg,
      breakfastNonVeg: b.nonVeg,
      lunchVeg: l.veg,
      lunchNonVeg: l.nonVeg,
      dinnerVeg: d.veg,
      dinnerNonVeg: d.nonVeg,
    })

    // Minimal customer object for display and submission
    setSelectedCustomer({
      id: parseInt(editingOrder.customerId, 10),
      name: editingOrder.customerName,
      mobile: editingOrder.customerMobile,
    } as unknown as ApiCompanyCustomer | ApiAgentCustomer)
    setCustomerSearch(editingOrder.customerName)
  }, [editingOrder])

  // External reset signal (after successful update)
  useEffect(() => {
    if (resetKey === undefined) return
    setSelectedCustomer(null)
    setCustomerSearch('')
    setQuantities({
      breakfastVeg: 0,
      breakfastNonVeg: 0,
      lunchVeg: 0,
      lunchNonVeg: 0,
      dinnerVeg: 0,
      dinnerNonVeg: 0,
    })
  }, [resetKey])

  return (
    <Card className="h-full overflow-hidden flex flex-col relative">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Add New Order</CardTitle>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Entry: {format(new Date(), 'dd/MM/yyyy')}</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Order For:</span>
              <Popover open={showDatePicker && orderLogic.permissions.canEditOrderDate} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    disabled={!orderLogic.permissions.canEditOrderDate}
                  >
                    {format(orderForDate, 'dd/MM/yyyy')}
                    {!orderLogic.permissions.canEditOrderDate && (
                      <Lock className="ml-1 h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={orderForDate}
                    onSelect={(date) => {
                      if (date) {
                        onDateChange(date)
                        setShowDatePicker(false)
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        
        {/* Order Creation Logic Indicators */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            {/* User Role & Current Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAdmin && <Shield className="h-4 w-4 text-purple-600" />}
                {isPrivileged && <UserCheck className="h-4 w-4 text-blue-600" />}
                {!isAdmin && !isPrivileged && <User className="h-4 w-4 text-gray-600" />}
                <span className="text-sm font-medium">
                  {userName || 'Loading...'} ({userRole || 'Loading...'})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3 animate-pulse text-blue-500" />
                <span className="font-mono">{format(currentTime, 'h:mm a')}</span>
              </div>
            </div>

            {/* Cut-off Times */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                <span className="text-gray-600">Morning Window:</span>
                <span className="font-mono font-medium text-blue-700">
                  {settings.morningWindowEnd ? format(new Date(`2000-01-01T${settings.morningWindowEnd}:00`), 'h:mm a') : '2:30 PM'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                <span className="text-gray-600">Night Cut-off:</span>
                <span className="font-mono font-medium text-red-700">
                  {settings.nightCutOffTime ? format(new Date(`2000-01-01T${settings.nightCutOffTime}:00`), 'h:mm a') : '10:00 PM'}
                </span>
              </div>
            </div>

            {/* Order Permissions & Explanation */}
            <div className="space-y-2">
              {orderLogic.permissions.canPlaceOrder && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-green-700 dark:text-green-300">{orderLogic.explanation}</span>
                </div>
              )}
              
              {orderLogic.permissions.canEditOrderDate ? (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Delivery date is editable</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3 w-3" />
                  <span>Delivery date is locked</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Customer Type</Label>
          <RadioGroup value={customerType} onValueChange={(v)=> setCustomerType(v as any)} className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" id="ct-com" />
              <Label htmlFor="ct-com" className="text-sm">Company</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="agent" id="ct-ag" />
              <Label htmlFor="ct-ag" className="text-sm">Agent</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Customer Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Customer</Label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value)
                setShowCustomerDropdown(true)
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="pl-10 pr-8 h-9 text-sm w-full"
              ref={searchInputRef}
            />
            {selectedCustomer && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                onClick={handleClearCustomer}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {/* Customer Dropdown - positioned relative to input */}
            {showCustomerDropdown && (
              <div className="absolute z-10 mt-1 left-0 right-0 rounded-md border bg-white shadow-lg max-h-48 overflow-auto">
                {customersLoading ? (
                  <div className="px-10 py-3 text-sm text-gray-500">Loading...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="px-10 py-3 text-sm text-gray-500">No customers found</div>
                ) : (
                  <div className="py-1">
                    {filteredCustomers.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="flex cursor-pointer items-center justify-between px-10 py-3 text-sm hover:bg-blue-50 transition-colors"
                        onClick={() => handleCustomerSelect(customer as ApiCompanyCustomer | ApiAgentCustomer)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{customer.mobile}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Customer */}
          {selectedCustomer && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-900">{selectedCustomer.name}</div>
                  <div className="text-xs text-green-700 mt-0.5">{selectedCustomer.mobile}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Per-meal preferences with totals */}
        <div className="space-y-5">
          {/* Breakfast Group */}
          <fieldset className="rounded-xl border p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">Breakfast</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-orange-700">Total</Label>
                <Input
                  type="number"
                  min="0"
                  value={(quantities.breakfastVeg + quantities.breakfastNonVeg) === 0 ? '' : (quantities.breakfastVeg + quantities.breakfastNonVeg)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || '0')
                    const half = Math.max(0, Math.floor((v || 0) / 2))
                    setQuantities(prev => ({ ...prev, breakfastVeg: half, breakfastNonVeg: Math.max(0, (v || 0) - half) }))
                  }}
                  className="h-10 text-center text-sm font-semibold border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                  placeholder="0"
                />
              </div>
              <fieldset className="md:col-span-2 rounded-xl border p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">Preferences</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Veg</Label>
                    <Input
                      type="number"
                      min="0"
                      value={quantities.breakfastVeg === 0 ? '' : quantities.breakfastVeg}
                      onChange={(e) => handleQuantityChange('breakfastVeg', e.target.value)}
                      className="h-10 text-center text-sm font-semibold"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">NonVeg</Label>
                    <Input
                      type="number"
                      min="0"
                      value={quantities.breakfastNonVeg === 0 ? '' : quantities.breakfastNonVeg}
                      onChange={(e) => handleQuantityChange('breakfastNonVeg', e.target.value)}
                      className="h-10 text-center text-sm font-semibold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </fieldset>

          {/* Lunch Group */}
          <fieldset className="rounded-xl border p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">Lunch</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-700">Total</Label>
                <Input
                  type="number"
                  min="0"
                  value={(quantities.lunchVeg + quantities.lunchNonVeg) === 0 ? '' : (quantities.lunchVeg + quantities.lunchNonVeg)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || '0')
                    const half = Math.max(0, Math.floor((v || 0) / 2))
                    setQuantities(prev => ({ ...prev, lunchVeg: half, lunchNonVeg: Math.max(0, (v || 0) - half) }))
                  }}
                  className="h-10 text-center text-sm font-semibold border-green-200 focus:border-green-400 focus:ring-green-200"
                  placeholder="0"
                />
              </div>
              <fieldset className="md:col-span-2 rounded-xl border p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">Preferences</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Veg</Label>
                    <Input
                      type="number"
                      min="0"
                      value={quantities.lunchVeg === 0 ? '' : quantities.lunchVeg}
                      onChange={(e) => handleQuantityChange('lunchVeg', e.target.value)}
                      className="h-10 text-center text-sm font-semibold"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">NonVeg</Label>
                    <Input
                      type="number"
                      min="0"
                      value={quantities.lunchNonVeg === 0 ? '' : quantities.lunchNonVeg}
                      onChange={(e) => handleQuantityChange('lunchNonVeg', e.target.value)}
                      className="h-10 text-center text-sm font-semibold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </fieldset>

          {/* Dinner Group */}
          <fieldset className="rounded-xl border p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">Dinner</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-purple-700">Total</Label>
                <Input
                  type="number"
                  min="0"
                  value={(quantities.dinnerVeg + quantities.dinnerNonVeg) === 0 ? '' : (quantities.dinnerVeg + quantities.dinnerNonVeg)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || '0')
                    const half = Math.max(0, Math.floor((v || 0) / 2))
                    setQuantities(prev => ({ ...prev, dinnerVeg: half, dinnerNonVeg: Math.max(0, (v || 0) - half) }))
                  }}
                  className="h-10 text-center text-sm font-semibold border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  placeholder="0"
                />
              </div>
              <fieldset className="md:col-span-2 rounded-xl border p-4">
                <legend className="px-2 text-sm font-semibold text-gray-700">Preferences</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Veg</Label>
                    <Input
                      type="number"
                      min="0"
                      value={quantities.dinnerVeg === 0 ? '' : quantities.dinnerVeg}
                      onChange={(e) => handleQuantityChange('dinnerVeg', e.target.value)}
                      className="h-10 text-center text-sm font-semibold"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">NonVeg</Label>
                    <Input
                      type="number"
                      min="0"
                      value={quantities.dinnerNonVeg === 0 ? '' : quantities.dinnerNonVeg}
                      onChange={(e) => handleQuantityChange('dinnerNonVeg', e.target.value)}
                      className="h-10 text-center text-sm font-semibold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </fieldset>
        </div>

        

        {/* Total and Add Button */}
        <div className="space-y-3">
          {totalQuantity > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-900">Total Meals:</span>
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                {totalQuantity}
              </Badge>
            </div>
          )}
          
          <Button
            onClick={handleAddOrder}
            disabled={!selectedCustomer || totalQuantity === 0 || !orderLogic.permissions.canPlaceOrder}
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="mr-2 h-4 w-4" />
            {!orderLogic.permissions.canPlaceOrder ? 'Orders Blocked' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
      
      {/* Locked Order Overlay */}
      {!orderLogic?.permissions.canPlaceOrder && (
        <LockedOrderOverlay reason={orderLogic?.permissions.reason} />
      )}
    </Card>
  )
}
