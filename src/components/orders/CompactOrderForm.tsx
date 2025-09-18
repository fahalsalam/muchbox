"use client"

import { useEffect, useRef, useState } from 'react'
import { CalendarIcon, Plus, Search, X, User, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useGetIndividualCustomers } from '@/hooks/queries/useGetIndividualCustomers'
import { useGetCompanyCustomers } from '@/hooks/queries/useGetCompanyCustomers'
import { useGetAgentCustomers } from '@/hooks/queries/useGetAgentCustomers'
import { showToast } from '@/lib/toast'
import { ApiIndividualCustomer } from '@/types'

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
  const [selectedCustomer, setSelectedCustomer] = useState<ApiIndividualCustomer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerType, setCustomerType] = useState<'individual' | 'company' | 'agent'>('individual')
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
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const { data: indivData, isLoading: indivLoading } = useGetIndividualCustomers()
  const { data: companyData, isLoading: companyLoading } = useGetCompanyCustomers()
  const { data: agentData, isLoading: agentLoading } = useGetAgentCustomers()

  const customersLoading =
    (customerType === 'individual' && indivLoading) ||
    (customerType === 'company' && companyLoading) ||
    (customerType === 'agent' && agentLoading) ||
    false

  const customersData =
    customerType === 'individual'
      ? indivData
      : customerType === 'company'
      ? companyData
      : agentData

  const filteredCustomers = (customersData?.data || [])
    .filter((customer: any) =>
      (customer?.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer?.mobile || '').includes(customerSearch)
    )

  const handleCustomerSelect = (customer: ApiIndividualCustomer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
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
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
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
      dietPreference: 'veg',
    } as unknown as ApiIndividualCustomer)
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
    <Card className="h-full overflow-hidden flex flex-col">
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
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
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
      
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        

        {/* Customer Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Customer Type</Label>
          <RadioGroup value={customerType} onValueChange={(v)=> setCustomerType(v as any)} className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="ct-ind" />
              <Label htmlFor="ct-ind" className="text-sm">Individual</Label>
            </div>
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
                        onClick={() => handleCustomerSelect(customer as ApiIndividualCustomer)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{customer.mobile}</div>
                        </div>
                        {customer.dietPreference && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ml-2 ${
                              customer.dietPreference === 'veg' 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {customer.dietPreference}
                          </Badge>
                        )}
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
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    selectedCustomer.dietPreference === 'veg' 
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {selectedCustomer.dietPreference}
                </Badge>
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
            disabled={!selectedCustomer || totalQuantity === 0}
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
