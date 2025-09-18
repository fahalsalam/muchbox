import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { ApiResponse } from '@/types'

export interface OrderSummaryRow {
  OrderDate: string
  OrderFor?: string
  Breakfast: number
  Lunch: number
  Dinner: number
  ProcessDateTime?: string | null
  DeliveryDateTime?: string | null
}

export const useGetOrderSummary = (
  orderStatus: 'Orderd' | 'Processed' = 'Orderd',
  options?: Omit<UseQueryOptions<ApiResponse<OrderSummaryRow[]>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['order-summary', orderStatus],
    queryFn: async () => {
      const res = await fetch('https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/getOrderSummary', {
        method: 'GET',
        headers: { accept: 'text/plain', orderStatus },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }
      return (await res.json()) as ApiResponse<OrderSummaryRow[]>
    },
    ...options,
  })
}

export default useGetOrderSummary
