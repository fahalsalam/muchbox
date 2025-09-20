import { useState, useEffect } from 'react'
import { useGetSettings } from './queries/useGetSettings'
import { AppSettings } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  dayCutOffTime: '14:30', // 2:30 PM (used for display purposes)
  nightCutOffTime: '22:00', // 10:00 PM
  morningWindowEnd: '14:30', // Morning Window End = DayCutOffTime (2:30 PM)
}

export function useSettings() {
  const { data: settingsData, isLoading } = useGetSettings()
  const [localSettings, setLocalSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  
  // Load settings from localStorage on mount (populated from login)
  useEffect(() => {
    console.log('🔍 useSettings - useEffect running...');
    const saved = localStorage.getItem('munchbox-settings')
    console.log('🔍 useSettings - Raw localStorage data:', saved);
    
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        console.log('🔍 useSettings - Parsed settings:', parsedSettings);
        setLocalSettings(parsedSettings)
        console.log('📖 Loaded settings from localStorage:', parsedSettings)
      } catch (error) {
        console.error('Error parsing settings from localStorage:', error)
      }
    } else {
      console.log('🔍 useSettings - No settings found in localStorage');
    }
  }, [])

  // Update local settings when API data changes (for real-time updates)
  useEffect(() => {
    // Since settings API is disabled, this effect won't run
    // Settings are loaded from login response and localStorage only
  }, [settingsData])
  
  // Use local settings (from login or API updates)
  const settings: AppSettings = localSettings

  // Utility functions to check if current time is within cut-off
  const isWithinDayCutoff = (): boolean => {
    const now = new Date()
    const [hours, minutes] = settings.dayCutOffTime.split(':').map(Number)
    const cutoffTime = new Date()
    cutoffTime.setHours(hours, minutes, 0, 0)
    
    return now <= cutoffTime
  }

  const isWithinNightCutoff = (): boolean => {
    const now = new Date()
    const [hours, minutes] = settings.nightCutOffTime.split(':').map(Number)
    const cutoffTime = new Date()
    cutoffTime.setHours(hours, minutes, 0, 0)
    
    return now <= cutoffTime
  }

  const canAcceptOrders = (): boolean => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [nightHours, nightMinutes] = settings.nightCutOffTime.split(':').map(Number)
    const nightCutoffMinutes = nightHours * 60 + nightMinutes

    // If current time is after night cutoff, orders are closed
    return currentTime <= nightCutoffMinutes
  }

  const getTimeUntilNextOrder = (): string => {
    if (canAcceptOrders()) return ''

    // Calculate time until next day at 00:00
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return {
    settings,
    isLoading,
    isWithinDayCutoff,
    isWithinNightCutoff,
    canAcceptOrders,
    getTimeUntilNextOrder,
  }
}
