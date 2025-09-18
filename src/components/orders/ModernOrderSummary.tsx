"use client"

import { Edit, Trash2, ShoppingCart, User, Phone, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface ModernOrderSummaryProps {
  orders: OrderData[]
  onEditOrder: (index: number, order: OrderData) => void
  onDeleteOrder: (index: number) => void
}

export function ModernOrderSummary({ orders, onEditOrder, onDeleteOrder }: ModernOrderSummaryProps) {
  const getPreferenceColor = (preference: string) => {
    switch (preference) {
      case 'veg':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'non-veg':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return '🌅'
      case 'lunch':
        return '☀️'
      case 'dinner':
        return '🌙'
      default:
        return '🍽️'
    }
  }


  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl text-gray-600">Your Cart is Empty</CardTitle>
          <p className="text-gray-500 mt-2">Add some orders to get started</p>
        </CardHeader>
      </Card>
    )
  }

  const totalMeals = orders.reduce((sum, order) => sum + order.breakfast + order.lunch + order.dinner, 0)

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Order Cart</h3>
            <p className="text-sm text-green-700">{orders.length} order{orders.length !== 1 ? 's' : ''} • {totalMeals} total meals</p>
          </div>
        </div>
        <Badge className="bg-green-600 text-white text-lg px-3 py-1">
          {orders.length}
        </Badge>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order, index) => {
          const total = order.breakfast + order.lunch + order.dinner
          return (
            <Card key={`${order.customerId}-${index}`} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {order.customerName}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        {order.customerMobile}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getPreferenceColor(order.preference)}
                  >
                    {order.preference === 'none' ? 'None' : order.preference.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Meal Quantities */}
                <div className="space-y-2">
                  {order.breakfast > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMealIcon('breakfast')}</span>
                        <span className="text-sm font-medium text-orange-800">Breakfast</span>
                      </div>
                      <Badge className="bg-orange-600 text-white">
                        {order.breakfast}
                      </Badge>
                    </div>
                  )}
                  
                  {order.lunch > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMealIcon('lunch')}</span>
                        <span className="text-sm font-medium text-green-800">Lunch</span>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        {order.lunch}
                      </Badge>
                    </div>
                  )}
                  
                  {order.dinner > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMealIcon('dinner')}</span>
                        <span className="text-sm font-medium text-purple-800">Dinner</span>
                      </div>
                      <Badge className="bg-purple-600 text-white">
                        {order.dinner}
                      </Badge>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <Badge className="bg-blue-600 text-white">
                      {total} meals
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => onEditOrder(index, order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onDeleteOrder(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}