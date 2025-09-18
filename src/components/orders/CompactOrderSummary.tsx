"use client"

import { Edit, Trash2, ShoppingCart, User, Phone, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OrderData {
  customerId: string
  customerName: string
  customerMobile: string
  preference: 'veg' | 'non-veg' | 'none'
  breakfast: number
  lunch: number
  dinner: number
  // Optional splits for API submission
  breakfastVeg?: number
  breakfastNonVeg?: number
  lunchVeg?: number
  lunchNonVeg?: number
  dinnerVeg?: number
  dinnerNonVeg?: number
}

interface CompactOrderSummaryProps {
  orders: OrderData[]
  onEditOrder: (index: number, order: OrderData) => void
  onDeleteOrder: (index: number) => void
}

export function CompactOrderSummary({ orders, onEditOrder, onDeleteOrder }: CompactOrderSummaryProps) {

  const totalMeals = orders.reduce((sum, order) => sum + order.breakfast + order.lunch + order.dinner, 0)

  if (orders.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-semibold">Order Cart</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Your cart is empty</p>
          <p className="text-gray-400 text-xs">Add some orders to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0 relative">
        <div className="flex items-center justify-between pr-8">
          <CardTitle className="text-base font-semibold">Order Cart</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{totalMeals} total meals</span>
        </div>
        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shadow">
          {orders.length}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-3">
            {orders.map((order, index) => {
              const total = order.breakfast + order.lunch + order.dinner
              return (
                <div key={`${order.customerId}-${index}`} className="bg-white border rounded-md p-3 hover:shadow-sm transition-all duration-200 mb-2 last:mb-0">
                  {/* Customer Info */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{order.customerName}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {order.customerMobile}
                      </div>
                    </div>
                  </div>
                  
                  {/* Meal Quantities - Single Row */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Breakfast */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🍞</span>
                      <span className="text-xs font-medium text-orange-700">Breakfast</span>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] px-1.5 py-0.5 rounded-full">
                        {order.breakfast}
                      </Badge>
                    </div>
                    
                    {/* Lunch */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">☀️</span>
                      <span className="text-xs font-medium text-green-700">Lunch</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] px-1.5 py-0.5 rounded-full">
                        {order.lunch}
                      </Badge>
                    </div>
                    
                    {/* Dinner */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🌙</span>
                      <span className="text-xs font-medium text-purple-700">Dinner</span>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] px-1.5 py-0.5 rounded-full">
                        {order.dinner}
                      </Badge>
                    </div>
                  </div>

                  {/* Total and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Total:</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0.5 rounded-full">
                        {total}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full"
                        onClick={() => onEditOrder(index, order)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 rounded-full"
                        onClick={() => onDeleteOrder(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
