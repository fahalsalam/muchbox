"use client"

import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface OrderData {
  customerId: string
  customerName: string
  customerMobile: string
  preference: 'veg' | 'non-veg' | 'none'
  breakfast: number
  lunch: number
  dinner: number
}

interface OrderSummaryProps {
  orders: OrderData[]
  onEditOrder: (index: number, order: OrderData) => void
  onDeleteOrder: (index: number) => void
}

export function OrderSummary({ orders, onEditOrder, onDeleteOrder }: OrderSummaryProps) {
  const getPreferenceColor = (preference: string) => {
    switch (preference) {
      case 'veg':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'non-veg':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMealBadgeColor = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'lunch':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'dinner':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (orders.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Orders Summary (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No orders added yet</p>
            <p className="text-sm">Add your first order using the form above</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-green-50">
        <CardTitle className="text-lg">Orders Summary ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4">
                  Customer
                </TableHead>
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4 text-center">
                  Type
                </TableHead>
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4 text-center">
                  Breakfast
                </TableHead>
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4 text-center">
                  Lunch
                </TableHead>
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4 text-center">
                  Dinner
                </TableHead>
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4 text-center">
                  Total
                </TableHead>
                <TableHead className="font-medium text-xs text-muted-foreground uppercase tracking-wide py-3 px-4 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => {
                const total = order.breakfast + order.lunch + order.dinner
                return (
                  <TableRow key={`${order.customerId}-${index}`} className="hover:bg-muted/50">
                    <TableCell className="py-4 px-4">
                      <div>
                        <div className="font-medium text-sm">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerMobile}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={getPreferenceColor(order.preference)}
                      >
                        {order.preference === 'none' ? 'None' : order.preference.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      {order.breakfast > 0 && (
                        <Badge 
                          variant="outline" 
                          className={getMealBadgeColor('breakfast')}
                        >
                          {order.breakfast}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      {order.lunch > 0 && (
                        <Badge 
                          variant="outline" 
                          className={getMealBadgeColor('lunch')}
                        >
                          {order.lunch}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      {order.dinner > 0 && (
                        <Badge 
                          variant="outline" 
                          className={getMealBadgeColor('dinner')}
                        >
                          {order.dinner}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      <Badge 
                        variant="outline" 
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {total}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => onEditOrder(index, order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDeleteOrder(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
