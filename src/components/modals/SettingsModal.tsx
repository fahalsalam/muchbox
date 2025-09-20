"use client"

import { useState, useEffect } from 'react'
import { Clock, Save, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { showToast } from '@/lib/toast'
import { preventScrollOnWheel } from '@/lib/inputUtils'
import { useGetSettings } from '@/hooks/queries/useGetSettings'
import { useUpdateSettings } from '@/hooks/mutations/useUpdateSettings'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SettingsFormData {
  dayCutOffTime: string
  nightCutOffTime: string
  morningWindowEnd: string
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  // Fetch current settings from database (for real-time updates)
  const { data: settingsData, isLoading: isLoadingSettings } = useGetSettings()
  const updateSettingsMutation = useUpdateSettings()

  const [formData, setFormData] = useState<SettingsFormData>({
    dayCutOffTime: '14:30', // Default 2:30 PM
    nightCutOffTime: '22:00', // Default 10:00 PM
    morningWindowEnd: '09:00', // Default 9:00 AM
  })

  // Load settings from localStorage first (populated from login)
  useEffect(() => {
    const saved = localStorage.getItem('munchbox-settings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        setFormData({
          dayCutOffTime: parsedSettings.dayCutOffTime || '14:30',
          nightCutOffTime: parsedSettings.nightCutOffTime || '22:00',
          morningWindowEnd: parsedSettings.morningWindowEnd || '09:00',
        })
        console.log('📖 Settings modal loaded from localStorage:', parsedSettings)
      } catch (error) {
        console.error('Error parsing settings from localStorage:', error)
      }
    }
  }, [open]) // Load when modal opens

  // Update form data when API settings are loaded (for real-time updates)
  useEffect(() => {
    // Since settings API is disabled, this effect won't run
    // Settings are loaded from login response and localStorage only
  }, [settingsData])

  const handleSave = async () => {
    try {
      // Validate time format
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timePattern.test(formData.dayCutOffTime)) {
        showToast.error('Please enter a valid day cut-off time (HH:MM format)')
        return
      }
      if (!timePattern.test(formData.nightCutOffTime)) {
        showToast.error('Please enter a valid night cut-off time (HH:MM format)')
        return
      }

      // Save to database via API
      await updateSettingsMutation.mutateAsync({
        dayCutOffTime: formData.dayCutOffTime,
        nightCutOffTime: formData.nightCutOffTime,
        morningWindowEnd: formData.morningWindowEnd,
      })

      // Update localStorage immediately after successful save
      localStorage.setItem('munchbox-settings', JSON.stringify({
        dayCutOffTime: formData.dayCutOffTime,
        nightCutOffTime: formData.nightCutOffTime,
        morningWindowEnd: formData.morningWindowEnd,
      }))
      console.log('💾 Settings saved to localStorage after API success:', formData)

      // Close modal on success (mutation handles success toast)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      // Error toast is handled by the mutation
    }
  }

  const handleReset = () => {
    setFormData({
      dayCutOffTime: '14:30',
      nightCutOffTime: '22:00',
      morningWindowEnd: '09:00',
    })
  }

  const formatTimeLabel = (time: string) => {
    try {
      const [hours, minutes] = time.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    } catch {
      return time
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            MunchBox Settings
          </DialogTitle>
          <DialogDescription>
            Configure cut-off times for day and night meal orders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Loading State */}
          {isLoadingSettings ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Day Cut-Off Time */}
              <div className="space-y-3">
                <Label htmlFor="dayCutOffTime" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  Morning Window End (Day Cut-Off)
                </Label>
                <div className="space-y-2">
                  <Input
                    id="dayCutOffTime"
                    type="time"
                    value={formData.dayCutOffTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayCutOffTime: e.target.value }))}
                    onWheel={preventScrollOnWheel}
                    className="text-center text-lg font-mono"
                    placeholder="14:30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Orders placed before {formatTimeLabel(formData.dayCutOffTime)} are for today's delivery
                  </p>
                </div>
              </div>

              <Separator />

              {/* Night Cut-Off Time */}
              <div className="space-y-3">
                <Label htmlFor="nightCutOffTime" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  Night Cut-Off Time
                </Label>
                <div className="space-y-2">
                  <Input
                    id="nightCutOffTime"
                    type="time"
                    value={formData.nightCutOffTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, nightCutOffTime: e.target.value }))}
                    onWheel={preventScrollOnWheel}
                    className="text-center text-lg font-mono"
                    placeholder="22:00"
                  />
                  <p className="text-xs text-muted-foreground">
                    No orders accepted after {formatTimeLabel(formData.nightCutOffTime)} until next day
                  </p>
                </div>
              </div>

              <Separator />

              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Current Time Settings</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Morning Window End:</span>
                    <span className="font-mono">{formatTimeLabel(formData.dayCutOffTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Night Cut-Off:</span>
                    <span className="font-mono">{formatTimeLabel(formData.nightCutOffTime)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="text-gray-600"
          >
            Reset to Default
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={updateSettingsMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending || isLoadingSettings}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
