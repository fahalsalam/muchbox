"use client"

import { useState } from 'react'
import { CalendarIcon, Plus, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { useGetIndividualCustomers } from '@/hooks/queries/useGetIndividualCustomers'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface OrderFormProps {
  onAddOrder: (orderData: OrderData) => void
  onDateChange: (date: Date) => void
  orderForDate: Date
}

interface OrderData {
  customerId: string
  customerName: string
  customerMobile: string
  preference: 'veg' | 'non-veg' | 'none'
  breakfast: number
  lunch: number
  dinner: number
}

export function OrderForm({ onAddOrder, onDateChange, orderForDate }: OrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<ApiIndividualCustomer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [preference, setPreference] = useState<'veg' | 'non-veg' | 'none'>('none')
  const [quantities, setQuantities] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  })
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const { data: customersData, isLoading: customersLoading } = useGetIndividualCustomers()

  // Filter customers based on search
  const filteredCustomers = customersData?.data?.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.mobile.includes(customerSearch)
  ) || []

  const handleCustomerSelect = (customer: ApiIndividualCustomer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setShowCustomerDropdown(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerSearch('')
  }

  const handleQuantityChange = (meal: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    const numValue = parseInt(value) || 0
    setQuantities(prev => ({
      ...prev,
      [meal]: Math.max(0, numValue)
    }))
  }

  const handleAddOrder = () => {
    if (!selectedCustomer) {
      showToast.error('Validation Error', 'Please select a customer.')
      return
    }

    const totalQuantity = quantities.breakfast + quantities.lunch + quantities.dinner
    if (totalQuantity === 0) {
      showToast.error('Validation Error', 'Please enter at least one meal quantity.')
      return
    }

    const orderData: OrderData = {
      customerId: selectedCustomer.id.toString(),
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      preference,
      breakfast: quantities.breakfast,
      lunch: quantities.lunch,
      dinner: quantities.dinner,
    }

    onAddOrder(orderData)
    
    // Reset form
    setQuantities({ breakfast: 0, lunch: 0, dinner: 0 })
    setPreference('none')
  }

  const totalQuantity = quantities.breakfast + quantities.lunch + quantities.dinner

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Add New Order</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Entry Date:</span>
              <span className="font-medium">{format(new Date(), 'dd-MM-yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Order For:</span>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(orderForDate, 'dd/MM/yyyy')}
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
      
      <CardContent className="space-y-6">
        {/* Preference Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Preference</Label>
          <RadioGroup value={preference} onValueChange={(value) => setPreference(value as 'veg' | 'non-veg' | 'none')}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="veg" />
                <Label htmlFor="veg" className="text-sm">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-veg" id="non-veg" />
                <Label htmlFor="non-veg" className="text-sm">Non-Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="text-sm">None</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Customer Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Customer</Label>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Create New
            </Button>
          </div>
          
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Select a customer..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setShowCustomerDropdown(true)
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="pl-10 pr-10"
              />
              {selectedCustomer && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
                  onClick={handleClearCustomer}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Customer Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {customersLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading customers...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No customers found</div>
                ) : (
                  <div className="max-h-60 overflow-auto">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.mobile}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.dietPreference}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
                value={quantities.breakfast}
                onChange={(e) => handleQuantityChange('breakfast', e.target.value)}
                onWheel={preventScrollOnWheel}
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
                value={quantities.lunch}
                onChange={(e) => handleQuantityChange('lunch', e.target.value)}
                onWheel={preventScrollOnWheel}
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
                value={quantities.dinner}
                onChange={(e) => handleQuantityChange('dinner', e.target.value)}
                onWheel={preventScrollOnWheel}
                className="text-center"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Add Order Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAddOrder}
            disabled={!selectedCustomer || totalQuantity === 0}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
