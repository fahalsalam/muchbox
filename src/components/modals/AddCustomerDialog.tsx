"use client"

import React, { useState, useEffect } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateIndividualCustomer } from '@/hooks/mutations/useCreateIndividualCustomer'
import { useGetIndividualCustomers } from '@/hooks/queries/useGetIndividualCustomers'
import { showToast } from '@/lib/toast'
import { generateCustomerCode } from '@/lib/customerCode'
import { preventScrollOnWheel } from '@/lib/inputUtils'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CustomerFormData {
  fullName: string
  mobile: string
  address: string
  joinedDate: Date | undefined
  price: string
  paymentMode: string
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  dietPreference: 'veg' | 'non-veg' | ''
  customerCode: string
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    mobile: '',
    address: '',
    joinedDate: new Date(),
    price: '',
    paymentMode: '',
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    dietPreference: '',
    customerCode: '',
  })

  // Fetch existing customers to generate next customer code
  const { data: customersData } = useGetIndividualCustomers()

  // Generate customer code when dialog opens
  useEffect(() => {
    if (open && customersData?.data) {
      // Extract existing customer codes
      const existingCodes = customersData.data
        .map(customer => customer.CustomerCode)
        .filter((code): code is string => code != null && code.trim() !== '')
      
      // Generate next customer code
      const customerCode = generateCustomerCode('individual', existingCodes)
      setFormData(prev => ({ ...prev, customerCode }))
    } else if (open) {
      // Fallback: generate first customer code if no data available
      const customerCode = generateCustomerCode('individual')
      setFormData(prev => ({ ...prev, customerCode }))
    }
  }, [open, customersData?.data])

  const createCustomerMutation = useCreateIndividualCustomer({
    onSuccess: () => {
      showToast.success(
        'Customer Added Successfully!',
        'The new customer has been added to your system.'
      )
      // Reset form and regenerate customer code
      const resetFormData: CustomerFormData = {
        fullName: '',
        mobile: '',
        address: '',
        joinedDate: new Date(),
        price: '',
        paymentMode: '',
        meals: {
          breakfast: false,
          lunch: false,
          dinner: false,
        },
        dietPreference: '' as 'veg' | 'non-veg' | '',
        customerCode: '',
      }
      setFormData(resetFormData)
      onOpenChange(false)
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to add customer. Please try again.'
      showToast.error('Failed to Add Customer', errorMessage)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.fullName || !formData.mobile || !formData.address || 
        !formData.joinedDate || !formData.price || !formData.paymentMode || 
        !formData.dietPreference || !formData.customerCode) {
      showToast.error('Validation Error', 'Please fill in all required fields.')
      return
    }

    // Check if at least one meal is selected
    if (!formData.meals.breakfast && !formData.meals.lunch && !formData.meals.dinner) {
      showToast.error('Validation Error', 'Please select at least one meal.')
      return
    }

    // Prepare API payload
    const customerData = {
      name: formData.fullName,
      mobile: formData.mobile,
      address: formData.address,
      joinedDate: format(formData.joinedDate!, 'yyyy-MM-dd'),
      price: formData.price,
      paymentMode: formData.paymentMode,
      dietPreference: formData.dietPreference as 'veg' | 'non-veg',
      meals: {
        breakfast: formData.meals.breakfast,
        lunch: formData.meals.lunch,
        dinner: formData.meals.dinner,
      },
      customerCode: formData.customerCode,
    }

    createCustomerMutation.mutate(customerData)
  }

  const handleMealToggle = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [meal]: !prev.meals[meal]
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Customer
          </DialogTitle>
          <DialogDescription>
            Create a new individual customer with auto-generated customer code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Code */}
          <div className="space-y-2">
            <Label htmlFor="customerCode" className="text-sm font-medium">
              Customer Code *
            </Label>
            <Input
              id="customerCode"
              value={formData.customerCode}
              placeholder="Auto-generated customer code"
              required
              readOnly
              className="bg-gray-100 font-mono cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">This code is auto-generated and cannot be modified</p>
          </div>

          {/* Full Name and Mobile Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number *
              </Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter mobile number"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address *
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
              rows={3}
              required
            />
          </div>

          {/* Joined Date, Price, Payment Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Joined Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.joinedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.joinedDate ? (
                      format(formData.joinedDate, "dd/MM/yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.joinedDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, joinedDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (AED) *
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                onWheel={preventScrollOnWheel}
                placeholder="Enter price"
                type="number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Mode *</Label>
              <Select value={formData.paymentMode} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMode: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meals Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Meals Selection *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Breakfast */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breakfast"
                  checked={formData.meals.breakfast}
                  onCheckedChange={() => handleMealToggle('breakfast')}
                />
                <Label htmlFor="breakfast" className="text-sm font-medium">
                  Breakfast
                </Label>
              </div>

              {/* Lunch */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lunch"
                  checked={formData.meals.lunch}
                  onCheckedChange={() => handleMealToggle('lunch')}
                />
                <Label htmlFor="lunch" className="text-sm font-medium">
                  Lunch
                </Label>
              </div>

              {/* Dinner */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dinner"
                  checked={formData.meals.dinner}
                  onCheckedChange={() => handleMealToggle('dinner')}
                />
                <Label htmlFor="dinner" className="text-sm font-medium">
                  Dinner
                </Label>
              </div>
            </div>
          </div>

          {/* Diet Preference */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Diet Preference *</Label>
            <Select value={formData.dietPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, dietPreference: value as 'veg' | 'non-veg' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select diet preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createCustomerMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? 'Adding Customer...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
