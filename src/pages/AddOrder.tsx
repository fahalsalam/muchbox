"use client"

import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addDays, format as formatDate } from 'date-fns'
import { useCreateOrder } from '@/hooks/mutations/useCreateOrder'
import { showToast } from '@/lib/toast'
// import { OrderFormData } from '@/types'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import { CompactOrderForm } from '@/components/orders/CompactOrderForm'
import { CompactOrderSummary } from '@/components/orders/CompactOrderSummary'

interface OrderData {
  customerId: string
  customerName: string
  customerMobile: string
  preference: 'veg' | 'non-veg' | 'none'
  breakfast: number
  lunch: number
  dinner: number
  // optional veg/non-veg splits for API payload
  breakfastVeg?: number
  breakfastNonVeg?: number
  lunchVeg?: number
  lunchNonVeg?: number
  dinnerVeg?: number
  dinnerNonVeg?: number
}

const AddOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [orderForDate, setOrderForDate] = useState<Date>(addDays(new Date(), 1))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const location = useLocation() as { state?: { editOrder?: OrderData; editOrderMeta?: any } } | any
  const navigate = useNavigate()
  const [incomingEditOrder, setIncomingEditOrder] = useState<OrderData | null>(null)
  const [incomingEditMeta, setIncomingEditMeta] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResetToken, setFormResetToken] = useState(0)

  const createOrderMutation = useCreateOrder({
    onSuccess: () => {
      showToast.success(
        'Orders Submitted Successfully!',
        'All orders have been submitted and are being processed.'
      )
      setOrders([])
      setOrderForDate(addDays(new Date(), 1))
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Failed to submit orders. Please try again.'
      showToast.error('Failed to Submit Orders', errorMessage)
    },
  })

  const handleAddOrder = (orderData: OrderData) => {
    if (editingIndex !== null) {
      // Update existing order
      setOrders(prev => prev.map((order, index) => 
        index === editingIndex ? orderData : order
      ))
      setEditingIndex(null)
      // Single toast here (child no longer toasts) to avoid duplicates
      showToast.success('Order Updated', 'Order has been updated successfully.')
    } else {
      // Add new order
      setOrders(prev => [...prev, orderData])
      showToast.success('Order Added', 'Order has been added to the summary.')
    }
  }

  const handleEditOrder = (index: number, _order: OrderData) => {
    setEditingIndex(index)
    // Avoid duplicate toasts; the route-state loader already notifies
  }

  const handleDeleteOrder = (index: number) => {
    setOrders(prev => prev.filter((_, i) => i !== index))
    showToast.success('Order Removed', 'Order has been removed from the summary.')
  }

  const handleDateChange = (date: Date) => {
    setOrderForDate(date)
  }

  // Per-meal totals for quick stats breakdown
  const totals = React.useMemo(() => {
    const breakfast = orders.reduce((sum, o) => sum + o.breakfast, 0)
    const lunch = orders.reduce((sum, o) => sum + o.lunch, 0)
    const dinner = orders.reduce((sum, o) => sum + o.dinner, 0)
    return { breakfast, lunch, dinner, total: breakfast + lunch + dinner }
  }, [orders])

  // Consume an edit order passed via route state from other pages
  useEffect(() => {
    const fromOrder = location?.state?.editOrder as OrderData | undefined
    const fromMeta = location?.state?.editOrderMeta as any | undefined
    if (fromOrder) {
      setIncomingEditOrder(fromOrder)
      setIncomingEditMeta(fromMeta ?? null)
      // Clear the state so refresh doesn't re-apply
      navigate(location.pathname, { replace: true, state: {} })
      showToast.info('Edit Mode', 'Order loaded for editing')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmitOrders = async () => {
    if (orders.length === 0) {
      showToast.error('Validation Error', 'Please add at least one order before submitting.')
      return
    }

    // Build payload per API spec
    const payload = orders.map((o, idx) => ({
      id: idx,
      customerId: o.customerId,
      customerName: o.customerName,
      customerMobile: o.customerMobile,
      preferenceType: o.preference,
      breakfast: {
        vegQuantity: o.breakfastVeg ?? 0,
        nonVegQuantity: o.breakfastNonVeg ?? 0,
        totalQuantity: o.breakfast,
        dietPreference: (o.breakfastVeg ?? 0) > (o.breakfastNonVeg ?? 0) ? 'veg' : 'non-veg',
      },
      lunch: {
        vegQuantity: o.lunchVeg ?? 0,
        nonVegQuantity: o.lunchNonVeg ?? 0,
        totalQuantity: o.lunch,
        dietPreference: (o.lunchVeg ?? 0) > (o.lunchNonVeg ?? 0) ? 'veg' : 'non-veg',
      },
      dinner: {
        vegQuantity: o.dinnerVeg ?? 0,
        nonVegQuantity: o.dinnerNonVeg ?? 0,
        totalQuantity: o.dinner,
        dietPreference: (o.dinnerVeg ?? 0) > (o.dinnerNonVeg ?? 0) ? 'veg' : 'non-veg',
      },
      total: o.breakfast + o.lunch + o.dinner,
      date: new Date().toISOString().split('T')[0],
      orderFor: formatDate(orderForDate, 'yyyy-MM-dd'),
      customerType: 'individual',
    }))

    try {
      setIsSubmitting(true)
      // Debug: surface submission intent and payload size
      console.log('[SubmitOrders] payload', payload)
      // Keep a single toast after success to avoid duplicates
      const isUpdate = Boolean(incomingEditMeta?.orderAID && incomingEditMeta?.orderId)
      const url = isUpdate
        ? `https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/putOrder?orderAID=${encodeURIComponent(incomingEditMeta.orderAID)}&orderId=${encodeURIComponent(incomingEditMeta.orderId)}`
        : 'https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/postOrder'

      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          accept: 'text/plain',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isUpdate ? payload[0] : payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }

      console.log('[SubmitOrders] response OK')
      if (isUpdate) {
        showToast.success('Order Updated Successfully!', 'The order has been updated.')
        setIncomingEditOrder(null)
        setIncomingEditMeta(null)
        setFormResetToken((t) => t + 1)
      } else {
        showToast.success('Orders Submitted Successfully!', 'All orders have been submitted and are being processed.')
        setOrders([])
        setOrderForDate(addDays(new Date(), 1))
      }
    } catch (err: any) {
      console.error('[SubmitOrders] error', err)
      showToast.error('Failed to Submit Orders', err?.message || 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setOrders([])
    setEditingIndex(null)
    setOrderForDate(addDays(new Date(), 1))
    showToast.info('Orders Cancelled', 'All orders have been cleared.')
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl h-full flex flex-col">
        {/* Header with Action Buttons */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Order</h1>
            </div>
            
            {/* Action Buttons - Moved to header */}
            {orders.length > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createOrderMutation.isPending}
                  className="px-6 py-2"
                >
                  Cancel All Orders
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={createOrderMutation.isPending}
                      className="relative px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="absolute left-3 inline-flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                          </span>
                          <span className="opacity-80">{incomingEditOrder ? 'Updating...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">✅</span>
                          {incomingEditOrder ? 'Update Order' : 'Submit All Orders'}
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{incomingEditOrder ? 'Update this order?' : 'Submit all orders?'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {incomingEditOrder
                          ? 'This will update the selected order on the server.'
                          : `This will send ${orders.length} order${orders.length !== 1 ? 's' : ''} to the server.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmitOrders} className="relative">
                        {isSubmitting ? (
                          <>
                            <span className="absolute left-3 inline-flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
                            </span>
                            {incomingEditOrder ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>{incomingEditOrder ? 'Yes, Update' : 'Yes, Submit'}</>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">📦</span>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total Orders</p>
                  <p className="text-xl font-bold text-blue-900">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🍽️</span>
                </div>
                <div>
                  <p className="text-sm text-green-700">Total Meals</p>
                  <p className="text-xl font-bold text-green-900">{totals.total}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5">
                      🍞 <span className="font-medium">Breakfast</span> <span className="font-semibold">{totals.breakfast}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-green-200 px-2 py-0.5">
                      ☀️ <span className="font-medium">Lunch</span> <span className="font-semibold">{totals.lunch}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5">
                      🌙 <span className="font-medium">Dinner</span> <span className="font-semibold">{totals.dinner}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">📅</span>
                </div>
      <div>
                  <p className="text-sm text-purple-700">Order Date</p>
                  <p className="text-lg font-bold text-purple-900">
                    {orderForDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Column - Order Form */}
          <div className="h-full min-h-0 flex flex-col">
            <CompactOrderForm
              onAddOrder={handleAddOrder}
              onDateChange={handleDateChange}
              orderForDate={orderForDate}
              editingOrder={incomingEditOrder ?? (editingIndex !== null ? orders[editingIndex] : null)}
              resetKey={formResetToken}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="h-full min-h-0 flex flex-col">
            <CompactOrderSummary
              orders={orders}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddOrder
