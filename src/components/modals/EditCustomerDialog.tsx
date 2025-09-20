"use client"

import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateIndividualCustomer } from '@/hooks/mutations/useCreateIndividualCustomer'
import { useUpdateCustomer } from '@/hooks/mutations/useUpdateCustomer'
import { showToast } from '@/lib/toast'
import { ApiIndividualCustomer, QUERY_KEYS } from '@/types'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: ApiIndividualCustomer | null
  mode: 'add' | 'edit'
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
}

export function EditCustomerDialog({ open, onOpenChange, customer, mode }: EditCustomerDialogProps) {
  const queryClient = useQueryClient()
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
  })

  // Parse meals JSON string to get individual meal preferences
  const parseMeals = (mealsString: string) => {
    try {
      const meals = JSON.parse(mealsString)
      return {
        breakfast: meals.Breakfast || false,
        lunch: meals.Lunch || false,
        dinner: meals.Dinner || false,
      }
    } catch {
      return { breakfast: false, lunch: false, dinner: false }
    }
  }

  // Populate form data when customer is provided (edit mode)
  useEffect(() => {
    if (customer && mode === 'edit') {
      const meals = parseMeals(customer.meals)
      setFormData({
        fullName: customer.name,
        mobile: customer.mobile,
        address: customer.address,
        joinedDate: new Date(customer.joinedDate),
        price: customer.price,
        paymentMode: customer.paymentMode,
        meals: meals,
        dietPreference: customer.dietPreference,
      })
    } else if (mode === 'add') {
      // Reset form for add mode
      setFormData({
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
      })
    }
  }, [customer, mode])

  const createCustomerMutation = useCreateIndividualCustomer({
    onSuccess: async () => {
      showToast.success(
        'Customer Added Successfully!',
        'The new customer has been added to your system.'
      )
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'individual'] })
      await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'individual'] })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to add customer. Please try again.'
      showToast.error('Failed to Add Customer', errorMessage)
    },
  })

  const updateCustomerMutation = useUpdateCustomer({
    onSuccess: async () => {
      showToast.success(
        'Customer Updated Successfully!',
        'The customer information has been updated.'
      )
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'individual'] })
      await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'individual'] })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to update customer. Please try again.'
      showToast.error('Failed to Update Customer', errorMessage)
    },
  })

  const resetForm = () => {
    setFormData({
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
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.fullName || !formData.mobile || !formData.address || 
        !formData.joinedDate || !formData.price || !formData.paymentMode || 
        !formData.dietPreference) {
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
      customerCode: customer?.CustomerCode || 'IND-001', // Use existing customer code or default
    }

    if (mode === 'add') {
      createCustomerMutation.mutate(customerData)
    } else if (mode === 'edit' && customer) {
      updateCustomerMutation.mutate({
        data: customerData,
        customerId: customer.id.toString(),
        customerType: 'individual',
        forzaCustomerID: customer.ForzaCustomerID || undefined
      })
    }
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

  const isLoading = createCustomerMutation.isPending || updateCustomerMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'add' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading 
                ? (mode === 'add' ? 'Adding Customer...' : 'Updating Customer...') 
                : (mode === 'add' ? 'Add Customer' : 'Update Customer')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
