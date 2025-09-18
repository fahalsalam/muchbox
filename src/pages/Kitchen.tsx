import React, { useMemo, useState } from 'react'
import { format, addDays } from 'date-fns'
import { useGetOrderSummary } from '@/hooks/queries/useGetOrderSummary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import KitchenDetail from '@/pages/KitchenDetail'
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

const Kitchen: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useGetOrderSummary()
  // const navigate = useNavigate()
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const rows = data?.data || []
  const filtered = useMemo(() => {
    if (!rows.length) return []
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null
    return rows.filter(r => {
      const d = new Date(r.OrderDate)
      if (from && d < from) return false
      if (to) {
        // include end date day
        const end = new Date(to)
        end.setHours(23,59,59,999)
        if (d > end) return false
      }
      return true
    })
  }, [rows, fromDate, toDate])

  // Only show processing for current day rows; no fallback to latest

  const [processingKey, setProcessingKey] = React.useState<string | null>(null)
  const handleProcess = async (entryIso: string, orderForIso: string, display: string) => {
    try {
      const key = `${entryIso}|${orderForIso}`
      setProcessingKey(key)
      const url = `https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/processOrders?orderDate=${encodeURIComponent(entryIso)}&orderFor=${encodeURIComponent(orderForIso)}`
      const res = await fetch(url, { method: 'POST', headers: { accept: 'text/plain' } })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }
      showToast.success('Kitchen Processed', `Orders processed for ${display}`)
      refetch()
    } catch (e: any) {
      showToast.error('Processing Failed', e?.message || 'Unknown error')
    } finally {
      setProcessingKey(null)
    }
  }

  // Reverted: processing is handled inside the popup detail, not in the table

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-sm text-red-600">Failed to load order summary.</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kitchen Summary</h1>
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
                <span className="text-2xl">🍽️</span>
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
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, idx) => {
                const total = r.Breakfast + r.Lunch + r.Dinner
                const dateStr = new Date(r.OrderDate).toLocaleDateString()
                const orderForStr = r.OrderFor ? new Date(r.OrderFor).toLocaleDateString() : '-'
                const processedStr = r.ProcessDateTime ? format(new Date(r.ProcessDateTime), 'dd/MM/yyyy hh:mm a') : '-'
                const orderForLocal = r.OrderFor ? format(new Date(r.OrderFor), 'yyyy-MM-dd') : undefined
                const entryLocal = format(new Date(r.OrderDate), 'yyyy-MM-dd')
                const tomorrowLocal = format(addDays(new Date(), 1), 'yyyy-MM-dd')
                const isProcessable = orderForLocal === tomorrowLocal
                const hasProcessed = Boolean(r.ProcessDateTime)
                return (
                  <TableRow key={`${r.OrderDate}-${idx}`}>
                    <TableCell>{dateStr}</TableCell>
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
                    <TableCell className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{total}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600 shadow"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Kitchen Details - {dateStr}</DialogTitle>
                          </DialogHeader>
                          <KitchenDetail dateProp={orderForLocal || ''} entryDateProp={format(new Date(r.OrderDate), 'yyyy-MM-dd')} />
                        </DialogContent>
                      </Dialog>
                      {isProcessable && !hasProcessed && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" disabled={processingKey === `${entryLocal}|${orderForLocal}` }>
                              {processingKey === `${entryLocal}|${orderForLocal}` ? 'Processing…' : 'Process Kitchen'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Process kitchen for {dateStr}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will process all orders for the selected date.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleProcess(entryLocal, orderForLocal || '', dateStr)}>
                                Confirm
                              </AlertDialogAction>
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

export default Kitchen


