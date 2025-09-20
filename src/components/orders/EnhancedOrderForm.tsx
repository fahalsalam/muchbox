"use client"

import { useState, useEffect, useMemo } from 'react'
import { CalendarIcon, AlertCircle, Clock, User, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { useGetIndividualCustomers } from '@/hooks/queries/useGetIndividualCustomers'
import { useSettings } from '@/hooks/useSettings'
import { useUser } from '@/contexts/UserContext'
import { getOrderCreationLogic, getOrderDateExplanation, validateCustomOrderDate, formatTimeForDisplay } from '@/lib/orderLogic'
import { showToast } from '@/lib/toast'
import { ApiIndividualCustomer } from '@/types'
import { preventScrollOnWheel } from '@/lib/inputUtils'

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
import { Badge } from '@/components/ui/badge'
// Alert component replacement with Card
import { Card as AlertCard } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EnhancedOrderFormProps {
  onAddOrder: (orderData: any) => void
  onDateChange: (date: Date) => void
  orderForDate: Date
}

export function EnhancedOrderForm({ onAddOrder, onDateChange, orderForDate }: EnhancedOrderFormProps) {
  const { data: customersData } = useGetIndividualCustomers()
  const { settings, isLoading: settingsLoading } = useSettings()
  const { userRole, userName, isAdmin, isPrivileged } = useUser()
  
  const [selectedCustomer, setSelectedCustomer] = useState<ApiIndividualCustomer | null>(null)
  const [quantities, setQuantities] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  })
  
  const [currentTime] = useState(new Date())
  
  // Force re-render when userRole changes (fix for role switching bug)
  useEffect(() => {
    // This effect will trigger re-render when userRole changes
    // No action needed - just dependency tracking for re-render
  }, [userRole, userName, isAdmin, isPrivileged])

  // Use useMemo to ensure orderLogic recalculates when userRole changes
  const orderLogic = useMemo(() => {
    if (!userRole) {
      return null
    }
    
    return getOrderCreationLogic(userRole, settings, currentTime)
  }, [userRole, settings, settingsLoading, currentTime])
  
  const explanation = useMemo(() => {
    if (!userRole) {
      return null
    }
    
    return getOrderDateExplanation(userRole, settings, currentTime)
  }, [userRole, settings, currentTime])

  // Update order date based on logic when component mounts
  useEffect(() => {
    if (!settingsLoading && orderLogic?.permissions.canPlaceOrder) {
      onDateChange(orderLogic.orderDate)
    }
  }, [settingsLoading, orderLogic?.orderDate, orderLogic?.permissions.canPlaceOrder, onDateChange])

  const handleQuantityChange = (meal: keyof typeof quantities, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 0) {
      setQuantities(prev => ({
        ...prev,
        [meal]: numValue
      }))
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return
    
    const validation = userRole ? validateCustomOrderDate(date, userRole, currentTime) : { isValid: false, reason: 'User role not loaded' }
    if (!validation.isValid) {
      showToast.error(validation.reason || 'Invalid date selected')
      return
    }
    
    onDateChange(date)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderLogic?.permissions.canPlaceOrder) {
      showToast.error(orderLogic?.permissions.reason || 'Orders not allowed at this time')
      return
    }
    
    if (!selectedCustomer) {
      showToast.error('Please select a customer')
      return
    }
    
    const totalQuantity = quantities.breakfast + quantities.lunch + quantities.dinner
    if (totalQuantity === 0) {
      showToast.error('Please select at least one meal')
      return
    }
    
    const orderData = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      orderFor: format(orderForDate, 'yyyy-MM-dd'),
      meals: quantities,
      total: totalQuantity,
      createdBy: userName,
      userRole: userRole
    }
    
    onAddOrder(orderData)
    
    // Reset form
    setSelectedCustomer(null)
    setQuantities({ breakfast: 0, lunch: 0, dinner: 0 })
  }

  const totalQuantity = quantities.breakfast + quantities.lunch + quantities.dinner

  if (settingsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Create Order
          </CardTitle>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Badge variant={isAdmin ? 'default' : isPrivileged ? 'secondary' : 'outline'}>
              {userRole} User
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Status Alert */}
        <AlertCard className={cn(
          "p-4 border",
          orderLogic?.permissions.canPlaceOrder 
            ? "border-green-200 bg-green-50" 
            : "border-red-200 bg-red-50"
        )}>
          <div className="flex gap-3">
            <AlertCircle className={cn(
              "h-5 w-5 mt-0.5 flex-shrink-0",
              orderLogic?.permissions.canPlaceOrder ? "text-green-600" : "text-red-600"
            )} />
            <div className={cn(
              "text-sm",
              orderLogic?.permissions.canPlaceOrder ? "text-green-800" : "text-red-800"
            )}>
              {orderLogic?.permissions.canPlaceOrder ? (
                <div>
                  <strong>Orders Allowed</strong>
                  <br />
                  {explanation}
                </div>
              ) : (
                <div>
                  <strong>Orders Blocked</strong>
                  <br />
                  {orderLogic?.permissions.reason}
                </div>
              )}
            </div>
          </div>
        </AlertCard>

        {/* Time Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Current: {format(currentTime, 'hh:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>Morning Window: 12:00 AM - {formatTimeForDisplay(settings.morningWindowEnd)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <span>Cut-off: {formatTimeForDisplay(settings.nightCutOffTime)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Delivery Date {!orderLogic?.permissions.canEditOrderDate && "(Locked)"}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!orderLogic?.permissions.canEditOrderDate || !orderLogic?.permissions.canPlaceOrder}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !orderForDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {orderForDate ? format(orderForDate, "PPP") : "Pick a date"}
                  {orderLogic?.isInMorningWindow && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                      Today Delivery
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={orderForDate}
                  onSelect={handleDateChange}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Customer</Label>
            <select 
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customersData?.data?.find(c => c.id.toString() === e.target.value)
                setSelectedCustomer(customer || null)
              }}
              className="w-full p-2 border rounded-lg"
              disabled={!orderLogic?.permissions.canPlaceOrder}
            >
              <option value="">Choose a customer...</option>
              {customersData?.data?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Meal Quantities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Meal Quantities</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breakfast" className="text-xs text-muted-foreground">
                  Breakfast
                </Label>
                <Input
                  id="breakfast"
                  type="number"
                  min="0"
                  value={quantities.breakfast === 0 ? '' : quantities.breakfast}
                  onChange={(e) => handleQuantityChange('breakfast', e.target.value)}
                  onWheel={preventScrollOnWheel}
                  disabled={!orderLogic?.permissions.canPlaceOrder}
                  className="text-center"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunch" className="text-xs text-muted-foreground">
                  Lunch
                </Label>
                <Input
                  id="lunch"
                  type="number"
                  min="0"
                  value={quantities.lunch === 0 ? '' : quantities.lunch}
                  onChange={(e) => handleQuantityChange('lunch', e.target.value)}
                  onWheel={preventScrollOnWheel}
                  disabled={!orderLogic?.permissions.canPlaceOrder}
                  className="text-center"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dinner" className="text-xs text-muted-foreground">
                  Dinner
                </Label>
                <Input
                  id="dinner"
                  type="number"
                  min="0"
                  value={quantities.dinner === 0 ? '' : quantities.dinner}
                  onChange={(e) => handleQuantityChange('dinner', e.target.value)}
                  onWheel={preventScrollOnWheel}
                  disabled={!orderLogic?.permissions.canPlaceOrder}
                  className="text-center"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Total Summary */}
          {totalQuantity > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">Total Meals:</span>
                <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                  {totalQuantity}
                </Badge>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!orderLogic?.permissions.canPlaceOrder || !selectedCustomer || totalQuantity === 0}
            className="w-full"
          >
            {orderLogic?.permissions.canPlaceOrder ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Create Order
              </div>
            ) : (
              'Orders Not Allowed'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
