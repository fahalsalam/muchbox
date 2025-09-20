import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import KitchenDetail from '@/pages/KitchenDetail'
import { useGetOrderSummary } from '@/hooks/queries/useGetOrderSummary'
import { useProcessDeliveryOrders } from '@/hooks/mutations/useProcessDeliveryOrders'
import { showToast } from '@/lib/toast'
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
} from '@/components/ui/alert-dialog'

const Delivery: React.FC = () => {
  const { data, refetch, isFetching } = useGetOrderSummary('Processed')
  const processDeliveryMutation = useProcessDeliveryOrders()
  const rows = data?.data || []
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    if (!rows.length) return []
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null
    return rows.filter(r => {
      const d = new Date(r.OrderDate)
      if (from && d < from) return false
      if (to) {
        const end = new Date(to)
        end.setHours(23,59,59,999)
        if (d > end) return false
      }
      return true
    })
  }, [rows, fromDate, toDate])

  const [processingKey, setProcessingKey] = useState<string | null>(null)
  const handleDeliver = async (entryIso: string, orderForIso: string, display: string) => {
    try {
      const key = `${entryIso}|${orderForIso}`
      setProcessingKey(key)
      
      await processDeliveryMutation.mutateAsync({
        orderDate: entryIso,
        orderFor: orderForIso,
      })
      
      showToast.success('Delivery Processed', `DO processed for ${display}`)
      refetch()
    } catch (e: any) {
      showToast.error('Processing Failed', e?.message || 'Unknown error')
    } finally {
      setProcessingKey(null)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Delivery Summary</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">From</label>
            <Input type="date" className="h-8 text-xs w-[150px]" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">To</label>
            <Input type="date" className="h-8 text-xs w-[150px]" value={toDate} onChange={e=>setToDate(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={()=>{setFromDate(''); setToDate('')}}>Clear</Button>
          <Button className="text-sm" onClick={()=>refetch()} disabled={isFetching}>{isFetching?'Refreshing…':'Refresh'}</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary by Date</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-bounce">
                <span className="text-2xl">🚚</span>
              </div>
              <div className="text-gray-800 font-medium">No data found</div>
              <div className="text-gray-500 text-sm mt-1">Try adjusting the date filters or refresh.</div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={()=>{setFromDate(''); setToDate('')}}>Clear Filters</Button>
                <Button size="sm" onClick={()=>refetch()} disabled={isFetching}>{isFetching? 'Refreshing…' : 'Refresh'}</Button>
              </div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry Date</TableHead>
                <TableHead>Order For</TableHead>
                <TableHead className="text-right">Breakfast</TableHead>
                <TableHead className="text-right">Lunch</TableHead>
                <TableHead className="text-right">Dinner</TableHead>
                <TableHead className="text-right">Processed At</TableHead>
                <TableHead className="text-right">Delivered At</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, idx) => {
                const total = r.Breakfast + r.Lunch + r.Dinner
                const entryStr = new Date(r.OrderDate).toLocaleDateString()
                const orderForStr = r.OrderFor ? new Date(r.OrderFor).toLocaleDateString() : '-'
                const processedStr = r.ProcessDateTime ? format(new Date(r.ProcessDateTime), 'dd/MM/yyyy hh:mm a') : '-'
                const deliveredStr = r.DeliveryDateTime ? format(new Date(r.DeliveryDateTime), 'dd/MM/yyyy hh:mm a') : '-'
                const orderForLocal = r.OrderFor ? format(new Date(r.OrderFor), 'yyyy-MM-dd') : ''
                const entryLocal = format(new Date(r.OrderDate), 'yyyy-MM-dd')
                const hasDelivered = Boolean(r.DeliveryDateTime)
                return (
                  <TableRow key={`${r.OrderDate}-${idx}`}>
                    <TableCell>{entryStr}</TableCell>
                    <TableCell>{orderForStr}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">{r.Breakfast}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-100 text-green-800 border-green-200">{r.Lunch}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">{r.Dinner}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-600">{processedStr}</TableCell>
                    <TableCell className="text-right text-xs text-gray-600">{deliveredStr}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{total}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white hover:from-fuchsia-600 hover:to-rose-600 shadow"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Delivery Details - {entryStr}</DialogTitle>
                          </DialogHeader>
                          <KitchenDetail dateProp={orderForLocal} entryDateProp={entryLocal} />
                        </DialogContent>
                      </Dialog>
                      {!hasDelivered && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" disabled={processingKey === `${entryLocal}|${orderForLocal}`}>
                              {processingKey === `${entryLocal}|${orderForLocal}` ? 'Processing…' : 'Process DO'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Process DO for {entryStr}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will mark orders as delivered for the selected date.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeliver(entryLocal, orderForLocal, entryStr)}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Delivery


