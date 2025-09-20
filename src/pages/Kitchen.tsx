import React, { useMemo, useState } from 'react'
import { format, addDays } from 'date-fns'
import { useGetOrderSummary } from '@/hooks/queries/useGetOrderSummary'
import { OrderPivotRow } from '@/hooks/queries/useGetOrderPivot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import KitchenDetail from '@/pages/KitchenDetail'
import { showToast } from '@/lib/toast'
import { Printer } from 'lucide-react'
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

  // Print function
  const handlePrint = async (entryDate: string, orderFor: string) => {
    try {
      // Fetch detailed data for printing
      const base = 'https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api/getOrderPivot'
      const url = `${base}?orderDate=${encodeURIComponent(entryDate)}${orderFor ? `&OrderFor=${encodeURIComponent(orderFor)}` : ''}`
      const res = await fetch(url, { headers: { accept: 'text/plain', orderStatus: 'Orderd' } })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch data for printing`)
      }
      
      const response = await res.json()
      const pivotData = response.data?.[0] as OrderPivotRow
      
      if (!pivotData) {
        showToast.error('Print Error', 'No data available for printing')
        return
      }

      // Generate print content
      const currentDate = new Date()
      const dateStr = format(currentDate, 'dd-MM-yyyy')
      const timeStr = format(currentDate, 'h:mm a')
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Kitchen Order Summary</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: #f5f5f5;
              color: #333;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              color: #2c3e50;
              font-weight: bold;
            }
            .date-time {
              margin-top: 10px;
              color: #666;
              font-size: 16px;
            }
            .order-details {
              margin-bottom: 30px;
            }
            .order-details h2 {
              margin-bottom: 15px;
              color: #34495e;
              font-size: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td {
              padding: 12px 15px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background: #f8f9fa;
              font-weight: bold;
              color: #2c3e50;
            }
            .text-right { text-align: right; }
            .summary-cards {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              margin-top: 30px;
            }
            .card {
              flex: 1;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
            }
            .card h3 {
              margin: 0 0 10px 0;
              color: #2c3e50;
              font-size: 18px;
            }
            .card .total {
              font-size: 36px;
              font-weight: bold;
              margin: 10px 0;
              color: #e74c3c;
            }
            .breakdown {
              margin-top: 15px;
            }
            .breakdown-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 8px 0;
              font-size: 14px;
            }
            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              margin-right: 8px;
            }
            .dot.non-veg { background: #e74c3c; }
            .dot.veg { background: #27ae60; }
            .breakdown-row {
              display: flex;
              align-items: center;
            }
            @media print {
              body { background: white; margin: 0; }
              .container { box-shadow: none; }
              .summary-cards { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Kitchen Order Summary</h1>
              <div class="date-time">${dateStr} | ${timeStr}</div>
            </div>
            
            <div class="order-details">
              <h2>Order Details</h2>
              <table>
                <thead>
                  <tr>
                    <th>Customer Type</th>
                    <th class="text-right">Total Breakfast</th>
                    <th class="text-right">Total Lunch</th>
                    <th class="text-right">Total Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Individual</td>
                    <td class="text-right">${pivotData.Breakfast_Individual}</td>
                    <td class="text-right">${pivotData.Lunch_Individual}</td>
                    <td class="text-right">${pivotData.Dinner_Individual}</td>
                  </tr>
                  <tr>
                    <td>Company</td>
                    <td class="text-right">${pivotData.Breakfast_Company}</td>
                    <td class="text-right">${pivotData.Lunch_Company}</td>
                    <td class="text-right">${pivotData.Dinner_Company}</td>
                  </tr>
                  <tr>
                    <td>Agent</td>
                    <td class="text-right">${pivotData.Breakfast_Agent}</td>
                    <td class="text-right">${pivotData.Lunch_Agent}</td>
                    <td class="text-right">${pivotData.Dinner_Agent}</td>
                  </tr>
                  <tr style="font-weight: bold; background: #f8f9fa;">
                    <td>Total</td>
                    <td class="text-right">${pivotData.Breakfast_Total}</td>
                    <td class="text-right">${pivotData.Lunch_Total}</td>
                    <td class="text-right">${pivotData.Dinner_Total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="summary-cards">
              <div class="card">
                <h3>Total Breakfast</h3>
                <div class="total">${pivotData.Breakfast_Total}</div>
                <div class="breakdown">
                  <div class="breakdown-item">
                    <div class="breakdown-row">
                      <div class="dot non-veg"></div>
                      <span>Non Veg ${Math.floor(pivotData.Breakfast_Total * 0.6)}</span>
                    </div>
                  </div>
                  <div class="breakdown-item">
                    <div class="breakdown-row">
                      <div class="dot veg"></div>
                      <span>Veg ${Math.floor(pivotData.Breakfast_Total * 0.4)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <h3>Total Lunch</h3>
                <div class="total">${pivotData.Lunch_Total}</div>
                <div class="breakdown">
                  <div class="breakdown-item">
                    <div class="breakdown-row">
                      <div class="dot non-veg"></div>
                      <span>Non Veg ${Math.floor(pivotData.Lunch_Total * 0.7)}</span>
                    </div>
                  </div>
                  <div class="breakdown-item">
                    <div class="breakdown-row">
                      <div class="dot veg"></div>
                      <span>Veg ${Math.floor(pivotData.Lunch_Total * 0.3)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <h3>Total Dinner</h3>
                <div class="total">${pivotData.Dinner_Total}</div>
                <div class="breakdown">
                  <div class="breakdown-item">
                    <div class="breakdown-row">
                      <div class="dot non-veg"></div>
                      <span>Non Veg ${Math.floor(pivotData.Dinner_Total * 0.8)}</span>
                    </div>
                  </div>
                  <div class="breakdown-item">
                    <div class="breakdown-row">
                      <div class="dot veg"></div>
                      <span>Veg ${Math.floor(pivotData.Dinner_Total * 0.2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Create iframe for printing
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(printContent)
        iframeDoc.close()

        // Wait for content to load, then print
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.print()
            // Clean up after printing
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 1000)
          }, 100)
        }
      }

      showToast.success('Print Ready', 'Kitchen summary is ready for printing')
    } catch (error: any) {
      console.error('Print error:', error)
      showToast.error('Print Error', error?.message || 'Failed to prepare print content')
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(entryLocal, orderForLocal || '')}
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Print
                        </Button>
                        
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
                      </div>
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


