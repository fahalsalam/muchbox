import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { ApiResponse } from '@/types'

export interface OrderPivotRow {
  OrderDate: string
  Breakfast_Total: number
  Breakfast_Company: number
  Breakfast_Agent: number
  Breakfast_Individual: number
  Lunch_Total: number
  Lunch_Company: number
  Lunch_Agent: number
  Lunch_Individual: number
  Dinner_Total: number
  Dinner_Company: number
  Dinner_Agent: number
  Dinner_Individual: number
}

export const useGetOrderPivot = (
  orderDate: string,
  orderFor?: string,
  options?: Omit<UseQueryOptions<ApiResponse<OrderPivotRow[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['order-pivot', orderDate, orderFor],
    queryFn: async () => {
      const base = 'https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/getOrderPivot'
      const url = `${base}?orderDate=${encodeURIComponent(orderDate)}${orderFor ? `&OrderFor=${encodeURIComponent(orderFor)}` : ''}`
      const res = await fetch(url, { headers: { accept: 'text/plain', orderStatus: 'Orderd' } })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }
      return (await res.json()) as ApiResponse<OrderPivotRow[]>
    },
    enabled: Boolean(orderDate),
    ...options,
  })
}

export default useGetOrderPivot
// legacy version removed
