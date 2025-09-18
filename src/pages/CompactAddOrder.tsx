"use client"

import { useState } from 'react'
import { addDays } from 'date-fns'
import { useCreateOrder } from '@/hooks/mutations/useCreateOrder'
import { showToast } from '@/lib/toast'
import { OrderFormData } from '@/types'
import { CheckCircle2, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
}

const CompactAddOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [orderForDate, setOrderForDate] = useState<Date>(addDays(new Date(), 1))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const createOrderMutation = useCreateOrder({
    onSuccess: () => {
      showToast.success(
        '🎉 Orders Submitted Successfully!',
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
      setOrders(prev => prev.map((order, index) => 
        index === editingIndex ? orderData : order
      ))
      setEditingIndex(null)
      showToast.success('Order Updated', 'Order has been updated successfully.')
    } else {
      setOrders(prev => [...prev, orderData])
      showToast.success('Order Added!', 'Order has been added to your cart.')
    }
  }

  const handleEditOrder = (index: number, _order: OrderData) => {
    setEditingIndex(index)
    showToast.info('Edit Mode', 'Modify the order details and click "Add to Cart" to update.')
  }

  const handleDeleteOrder = (index: number) => {
    setOrders(prev => prev.filter((_, i) => i !== index))
    showToast.success('Order Removed', 'Order has been removed from your cart.')
  }

  const handleDateChange = (date: Date) => {
    setOrderForDate(date)
  }

  const handleSubmitOrders = () => {
    if (orders.length === 0) {
      showToast.error('Empty Cart', 'Please add at least one order before submitting.')
      return
    }

    const orderFormData: OrderFormData = {
      customerId: orders[0].customerId,
      orderForDate: orderForDate.toISOString().split('T')[0],
      items: orders.flatMap(order => [
        ...(order.breakfast > 0 ? [{
          itemId: 'breakfast',
          name: 'Breakfast',
          quantity: order.breakfast,
          unitPrice: 0,
          category: 'breakfast' as const,
        }] : []),
        ...(order.lunch > 0 ? [{
          itemId: 'lunch',
          name: 'Lunch',
          quantity: order.lunch,
          unitPrice: 0,
          category: 'lunch' as const,
        }] : []),
        ...(order.dinner > 0 ? [{
          itemId: 'dinner',
          name: 'Dinner',
          quantity: order.dinner,
          unitPrice: 0,
          category: 'dinner' as const,
        }] : []),
      ]),
    }

    createOrderMutation.mutate(orderFormData)
  }

  const handleCancel = () => {
    setOrders([])
    setEditingIndex(null)
    setOrderForDate(addDays(new Date(), 1))
    showToast.info('Orders Cancelled', 'All orders have been cleared.')
  }

  const totalMeals = orders.reduce((sum, order) => sum + order.breakfast + order.lunch + order.dinner, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Order</h1>
          <p className="text-gray-600">Manage customer orders efficiently</p>
        </div>

        {/* Quick Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Total Orders</p>
                    <p className="text-xl font-bold text-blue-900">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Total Meals</p>
                    <p className="text-xl font-bold text-green-900">{totalMeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
          {/* Left Column - Order Form */}
          <div className="h-full">
            <CompactOrderForm
              onAddOrder={handleAddOrder}
              onDateChange={handleDateChange}
              orderForDate={orderForDate}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="h-full">
            <CompactOrderSummary
              orders={orders}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        {orders.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={createOrderMutation.isPending}
              className="px-6 py-2"
            >
              Cancel All Orders
            </Button>
            <Button
              onClick={handleSubmitOrders}
              disabled={createOrderMutation.isPending}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {createOrderMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit All Orders
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompactAddOrder
