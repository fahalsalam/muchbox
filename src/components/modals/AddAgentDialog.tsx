"use client"

import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateAgentCustomer } from '@/hooks/mutations/useCreateAgentCustomer'
import { useUpdateAgentCustomer } from '@/hooks/mutations/useUpdateAgentCustomer'
import { showToast } from '@/lib/toast'
import { ApiAgentCustomer, QUERY_KEYS } from '@/types'

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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface AddAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent?: ApiAgentCustomer | null
  mode?: 'add' | 'edit'
}

interface AgentFormData {
  fullName: string
  mobile: string
  address: string
  joinedDate: Date | undefined
  breakfastPrice: string
  lunchPrice: string
  dinnerPrice: string
  creditLimit: string
  creditDays: string
}

export function AddAgentDialog({ open, onOpenChange, agent, mode = 'add' }: AddAgentDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<AgentFormData>({
    fullName: '',
    mobile: '',
    address: '',
    joinedDate: new Date(),
    breakfastPrice: '',
    lunchPrice: '',
    dinnerPrice: '',
    creditLimit: '',
    creditDays: '',
  })

  const createAgentMutation = useCreateAgentCustomer({
    onSuccess: async () => {
      showToast.success(
        'Agent Added Successfully!',
        'The new agent has been added to your system.'
      )
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'] })
      await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'] })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to add agent. Please try again.'
      showToast.error('Failed to Add Agent', errorMessage)
    },
  })

  const updateAgentMutation = useUpdateAgentCustomer({
    onSuccess: async () => {
      showToast.success(
        'Agent Updated Successfully!',
        'The agent details have been updated.'
      )
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'] })
      await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CUSTOMERS, 'agent'] })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to update agent. Please try again.'
      showToast.error('Failed to Update Agent', errorMessage)
    },
  })

  const resetForm = () => {
    setFormData({
      fullName: '',
      mobile: '',
      address: '',
      joinedDate: new Date(),
      breakfastPrice: '',
      lunchPrice: '',
      dinnerPrice: '',
      creditLimit: '',
      creditDays: '',
    })
  }

  // Populate form data when agent is provided (edit mode)
  useEffect(() => {
    if (agent && mode === 'edit') {
      const stripAED = (v: string) => v?.startsWith('AED ')
        ? v.replace('AED ', '')
        : v || ''
      setFormData({
        fullName: agent.name,
        mobile: agent.mobile,
        address: agent.address,
        joinedDate: new Date(agent.joinedDate),
        breakfastPrice: stripAED(agent.breakfastPrice),
        lunchPrice: stripAED(agent.lunchPrice),
        dinnerPrice: stripAED(agent.dinnerPrice),
        creditLimit: stripAED(agent.creditLimit),
        creditDays: agent.creditDays?.toString() || '',
      })
    } else if (mode === 'add') {
      resetForm()
    }
  }, [agent, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.fullName || !formData.mobile || !formData.address || 
        !formData.joinedDate || !formData.breakfastPrice || !formData.lunchPrice || 
        !formData.dinnerPrice || !formData.creditLimit || !formData.creditDays) {
      showToast.error('Validation Error', 'Please fill in all required fields.')
      return
    }

    // Prepare API payload
    const agentData = {
      name: formData.fullName,
      mobile: formData.mobile,
      address: formData.address,
      joinedDate: format(formData.joinedDate!, 'yyyy-MM-dd'),
      breakfastPrice: formData.breakfastPrice,
      lunchPrice: formData.lunchPrice,
      dinnerPrice: formData.dinnerPrice,
      creditLimit: formData.creditLimit,
      creditDays: formData.creditDays,
    }

    if (mode === 'add') {
      createAgentMutation.mutate(agentData)
    } else if (mode === 'edit' && agent) {
      const addAED = (v: string) => (v?.startsWith('AED ') ? v : `AED ${v}`)
      const updatePayload = {
        id: agent.id,
        name: agentData.name,
        mobile: agentData.mobile,
        address: agentData.address,
        joinedDate: agentData.joinedDate,
        breakfastPrice: addAED(agentData.breakfastPrice),
        lunchPrice: addAED(agentData.lunchPrice),
        dinnerPrice: addAED(agentData.dinnerPrice),
        creditLimit: addAED(agentData.creditLimit),
        creditDays: agentData.creditDays,
        status: agent.status || 'Active',
      }
      updateAgentMutation.mutate({
        data: updatePayload,
        customerId: agent.id.toString(),
        forzaCustomerID: agent.ForzaCustomerID || undefined
      })
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'add' ? 'Add New Agent' : 'Edit Agent'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Agent Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Agent Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter agent name"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter agent address"
                  rows={3}
                  required
                />
              </div>
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
            </div>
          </div>

          {/* Meal Prices */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                <span className="text-orange-600 text-xs">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Meal Prices (AED)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breakfastPrice" className="text-sm font-medium">
                  Breakfast Price *
                </Label>
                <Input
                  id="breakfastPrice"
                  value={formData.breakfastPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakfastPrice: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunchPrice" className="text-sm font-medium">
                  Lunch Price *
                </Label>
                <Input
                  id="lunchPrice"
                  value={formData.lunchPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, lunchPrice: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dinnerPrice" className="text-sm font-medium">
                  Dinner Price *
                </Label>
                <Input
                  id="dinnerPrice"
                  value={formData.dinnerPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, dinnerPrice: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Credit Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                <span className="text-green-600 text-xs">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Credit Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditLimit" className="text-sm font-medium">
                  Credit Limit (AED) *
                </Label>
                <Input
                  id="creditLimit"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditDays" className="text-sm font-medium">
                  Credit Days *
                </Label>
                <Input
                  id="creditDays"
                  value={formData.creditDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditDays: e.target.value }))}
                  placeholder="30"
                  type="number"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {(createAgentMutation.isPending || updateAgentMutation.isPending) ? (
                <>
                  <span className="mr-2">⏳</span>
                  {mode === 'add' ? 'Adding Agent...' : 'Updating Agent...'}
                </>
              ) : (
                <>
                  <span className="mr-2">✓</span>
                  {mode === 'add' ? 'Add Agent' : 'Update Agent'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
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
