"use client"

import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateCompanyCustomer } from '@/hooks/mutations/useCreateCompanyCustomer'
import { showToast } from '@/lib/toast'
import { ApiCompanyCustomer, QUERY_KEYS } from '@/types'

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
// Removed unused Select imports
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
// import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface AddCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editCompany?: ApiCompanyCustomer | null
  mode?: 'add' | 'edit'
}

interface CompanyFormData {
  companyName: string
  contactPerson: string
  mobile: string
  employeeCount: string
  address: string
  registeredDate: Date | undefined
  tradeLicense: string
  taxNumber: string
  creditLimit: string
  dueDays: string
  breakfastPrice: string
  lunchPrice: string
  dinnerPrice: string
}

export function AddCompanyDialog({ open, onOpenChange, editCompany, mode = 'add' }: AddCompanyDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    contactPerson: '',
    mobile: '',
    employeeCount: '',
    address: '',
    registeredDate: new Date(),
    tradeLicense: '',
    taxNumber: '',
    creditLimit: '',
    dueDays: '',
    breakfastPrice: '',
    lunchPrice: '',
    dinnerPrice: '',
  })

  // Populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && editCompany) {
      setFormData({
        companyName: editCompany.name || '',
        contactPerson: editCompany.contactPerson || '',
        mobile: editCompany.mobile || '',
        employeeCount: '', // Not in API response, keep empty
        address: editCompany.address || '',
        registeredDate: editCompany.registeredDate ? new Date(editCompany.registeredDate) : new Date(),
        tradeLicense: editCompany.tradeLicense || '',
        taxNumber: editCompany.taxNumber || '',
        creditLimit: editCompany.creditLimit?.replace('AED ', '') || '',
        dueDays: editCompany.creditDays?.toString() || '',
        breakfastPrice: editCompany.breakfastPrice?.replace('AED ', '') || '',
        lunchPrice: editCompany.lunchPrice?.replace('AED ', '') || '',
        dinnerPrice: editCompany.dinnerPrice?.replace('AED ', '') || '',
      })
    } else {
      // Reset form for add mode
      setFormData({
        companyName: '',
        contactPerson: '',
        mobile: '',
        employeeCount: '',
        address: '',
        registeredDate: new Date(),
        tradeLicense: '',
        taxNumber: '',
        creditLimit: '',
        dueDays: '',
        breakfastPrice: '',
        lunchPrice: '',
        dinnerPrice: '',
      })
    }
  }, [mode, editCompany, open])

  const createCompanyMutation = useCreateCompanyCustomer({
    onSuccess: async () => {
      showToast.success(
        mode === 'edit' ? 'Company Updated Successfully!' : 'Company Added Successfully!',
        mode === 'edit' ? 'The company has been updated.' : 'The new company has been added to your system.'
      )
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'company'] })
      await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'company'] })
      onOpenChange(false)
    },
    onError: (error) => {
      const errorMessage = error?.message || `Failed to ${mode} company. Please try again.`
      showToast.error(`Failed to ${mode === 'edit' ? 'Update' : 'Add'} Company`, errorMessage)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.companyName || !formData.contactPerson || !formData.mobile || 
        !formData.address || !formData.registeredDate || !formData.tradeLicense || 
        !formData.taxNumber || !formData.creditLimit || !formData.dueDays ||
        !formData.breakfastPrice || !formData.lunchPrice || !formData.dinnerPrice) {
      showToast.error('Validation Error', 'Please fill in all required fields.')
      return
    }

    // Prepare API payload
    const companyData = {
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      mobile: formData.mobile,
      address: formData.address,
      registeredDate: format(formData.registeredDate!, 'yyyy-MM-dd'),
      tradeLicense: formData.tradeLicense,
      taxNumber: formData.taxNumber,
      breakfastPrice: formData.breakfastPrice,
      lunchPrice: formData.lunchPrice,
      dinnerPrice: formData.dinnerPrice,
      creditLimit: formData.creditLimit,
      creditDays: formData.dueDays,
    }

    createCompanyMutation.mutate(companyData)
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Company' : 'Add New Company'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs">🏢</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            </div>
            
            {/* Company Name and Contact Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-sm font-medium">
                  Contact Person *
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person"
                  required
                />
              </div>
            </div>

            {/* Mobile Number and Employee Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="employeeCount" className="text-sm font-medium">
                  Employees Count
                </Label>
                <Input
                  id="employeeCount"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
                  placeholder="Enter employee count"
                  type="number"
                />
              </div>
            </div>

            {/* Company Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Company Address *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter company address"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Business Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
            </div>

            {/* Registered Date and Trade License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Registered Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.registeredDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.registeredDate ? (
                        format(formData.registeredDate, "dd/MM/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.registeredDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, registeredDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tradeLicense" className="text-sm font-medium">
                  Trade License *
                </Label>
                <Input
                  id="tradeLicense"
                  value={formData.tradeLicense}
                  onChange={(e) => setFormData(prev => ({ ...prev, tradeLicense: e.target.value }))}
                  placeholder="Enter trade license"
                  required
                />
              </div>
            </div>

            {/* Tax Number and Credit Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber" className="text-sm font-medium">
                  Tax Number *
                </Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                  placeholder="Enter tax number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit" className="text-sm font-medium">
                  Credit Limit (AED) *
                </Label>
                <Input
                  id="creditLimit"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
                  placeholder="Enter credit limit"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Due Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDays" className="text-sm font-medium">
                  Due Days *
                </Label>
                <Input
                  id="dueDays"
                  value={formData.dueDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDays: e.target.value }))}
                  placeholder="Enter due days"
                  type="number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Meal Prices Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                <span className="text-orange-600 text-xs">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Meal Prices (AED)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Breakfast */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">🥐</span>
                  </div>
                  <Label className="text-sm font-medium">Breakfast</Label>
                </div>
                <Input
                  value={formData.breakfastPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakfastPrice: e.target.value }))}
                  placeholder="Price"
                  type="number"
                  required
                />
              </div>

              {/* Lunch */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">🍽️</span>
                  </div>
                  <Label className="text-sm font-medium">Lunch</Label>
                </div>
                <Input
                  value={formData.lunchPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, lunchPrice: e.target.value }))}
                  placeholder="Price"
                  type="number"
                  required
                />
              </div>

              {/* Dinner */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🌙</span>
                  </div>
                  <Label className="text-sm font-medium">Dinner</Label>
                </div>
                <Input
                  value={formData.dinnerPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, dinnerPrice: e.target.value }))}
                  placeholder="Price"
                  type="number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={createCompanyMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {createCompanyMutation.isPending ? (
                <>
                  <span className="mr-2">⏳</span>
                  {mode === 'edit' ? 'Updating Company...' : 'Adding Company...'}
                </>
              ) : (
                <>
                  <span className="mr-2">✓</span>
                  {mode === 'edit' ? 'Update Company' : 'Add Company'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createCompanyMutation.isPending}
              className="w-32"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
