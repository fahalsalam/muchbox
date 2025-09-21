"use client"

import { useState } from 'react'
import { Plus, Search, X, User, Utensils, CheckCircle2 } from 'lucide-react'
import { useGetIndividualCustomers } from '@/hooks/queries/useGetIndividualCustomers'
import { showToast } from '@/lib/toast'
import { ApiIndividualCustomer } from '@/types'
import { preventScrollOnWheel } from '@/lib/inputUtils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Removed unused imports - Calendar and Popover components
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface OrderData {
  customerId: string
  customerName: string
  customerMobile: string
  preference: 'veg' | 'non-veg' | 'none'
  breakfast: number
  lunch: number
  dinner: number
}

interface ModernOrderFormProps {
  onAddOrder: (orderData: OrderData) => void
  onDateChange: (date: Date) => void
  orderForDate: Date
}

export function ModernOrderForm({ onAddOrder }: ModernOrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<ApiIndividualCustomer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [preference, setPreference] = useState<'veg' | 'non-veg' | 'none'>('none')
  const [quantities, setQuantities] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  })
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  // Removed showDatePicker state - now handled in main header

  const { data: customersData, isLoading: customersLoading } = useGetIndividualCustomers()

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
      showToast.error('Please select a customer first', 'Choose a customer to continue')
      return
    }

    const totalQuantity = quantities.breakfast + quantities.lunch + quantities.dinner
    if (totalQuantity === 0) {
      showToast.error('Please add meal quantities', 'Enter at least one meal quantity')
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
    showToast.success('Order Added!', 'Order has been added to your cart')
  }

  const totalQuantity = quantities.breakfast + quantities.lunch + quantities.dinner

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Customer & Preference */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Select Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers by name or mobile..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="pl-10 pr-10 h-11"
                />
                {selectedCustomer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-gray-100"
                    onClick={handleClearCustomer}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Customer Dropdown */}
              {showCustomerDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white p-2 shadow-lg">
                  {customersLoading ? (
                    <div className="p-3 text-center text-gray-500">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">No customers found</div>
                  ) : (
                    <div className="max-h-60 overflow-auto space-y-1">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex cursor-pointer items-center justify-between rounded-md p-3 hover:bg-blue-50 transition-colors"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.mobile}</div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              customer.dietPreference === 'veg' 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {customer.dietPreference}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Customer Display */}
              {selectedCustomer && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">{selectedCustomer.name}</div>
                      <div className="text-sm text-green-700">{selectedCustomer.mobile}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preference Selection */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Diet Preference</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={preference} onValueChange={(value) => setPreference(value as 'veg' | 'non-veg' | 'none')}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="veg" id="veg" />
                    <Label htmlFor="veg" className="cursor-pointer flex-1">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="non-veg" id="non-veg" />
                    <Label htmlFor="non-veg" className="cursor-pointer flex-1">Non-Veg</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="cursor-pointer flex-1">None</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Meal Quantities */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Meal Quantities</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Breakfast */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-orange-700">Breakfast</Label>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Morning Meal
                </Badge>
              </div>
              <Input
                type="number"
                min="0"
                value={quantities.breakfast}
                onChange={(e) => handleQuantityChange('breakfast', e.target.value)}
                onWheel={preventScrollOnWheel}
                className="h-12 text-center text-lg font-semibold"
                placeholder="0"
              />
            </div>

            <Separator />

            {/* Lunch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-green-700">Lunch</Label>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Afternoon Meal
                </Badge>
              </div>
              <Input
                type="number"
                min="0"
                value={quantities.lunch}
                onChange={(e) => handleQuantityChange('lunch', e.target.value)}
                onWheel={preventScrollOnWheel}
                className="h-12 text-center text-lg font-semibold"
                placeholder="0"
              />
            </div>

            <Separator />

            {/* Dinner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-purple-700">Dinner</Label>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Evening Meal
                </Badge>
              </div>
              <Input
                type="number"
                min="0"
                value={quantities.dinner}
                onChange={(e) => handleQuantityChange('dinner', e.target.value)}
                onWheel={preventScrollOnWheel}
                className="h-12 text-center text-lg font-semibold"
                placeholder="0"
              />
            </div>

            {/* Total Summary */}
            {totalQuantity > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Total Meals:</span>
                  <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                    {totalQuantity}
                  </Badge>
                </div>
              </div>
            )}

            {/* Add Order Button */}
            <Button
              onClick={handleAddOrder}
              disabled={!selectedCustomer || totalQuantity === 0}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
