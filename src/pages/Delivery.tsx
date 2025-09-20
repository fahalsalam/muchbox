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
import { deliveryService } from '@/api/services'
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
  const [printingKey, setPrintingKey] = useState<string | null>(null)
  
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

  // Print delivery orders function
  const handlePrintDelivery = async (entryDate: string, orderFor: string, display: string) => {
    try {
      const key = `${entryDate}|${orderFor}`
      setPrintingKey(key)
      
      // Fetch delivery print data
      const response = await deliveryService.getDeliveryPrintData(entryDate, orderFor)
      const deliveryOrders = response.data || []
      
      if (!deliveryOrders.length) {
        showToast.error('Print Error', 'No delivery data available for printing')
        return
      }

      // Generate print content for all orders using exact Order List design
      let allPrintContent = ''
      
      deliveryOrders.forEach((order: any, index: number) => {
        const deliveryOrderNumber = `DEL${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000) + index).padStart(3, '0')}-1`
        
        const orderPrintContent = `
          <div class="delivery-order" style="page-break-after: ${index < deliveryOrders.length - 1 ? 'always' : 'auto'};">
            <div class="main-container">
              <!-- Header -->
              <div class="header">
                <h1>Catering Delivery Order</h1>
              </div>
              
              <!-- Order Information Section -->
              <div class="section">
                <div class="section-title">Order Info</div>
                <div class="info-grid">
                  <div class="info-row">
                    <span class="label">Delivery Order No</span>
                    <span class="colon">:</span>
                    <span class="value">${deliveryOrderNumber}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Date</span>
                    <span class="colon">:</span>
                    <span class="value">${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Delivery Time</span>
                    <span class="colon">:</span>
                    <span class="value">_________________</span>
                  </div>
                </div>
              </div>
              
              <!-- Customer Information Section -->
              <div class="section">
                <div class="section-title">Customer Info</div>
                <div class="info-grid">
                  <div class="info-row">
                    <span class="label">Client / Company Name</span>
                    <span class="colon">:</span>
                    <span class="value">${order.customerName || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Contact Number</span>
                    <span class="colon">:</span>
                    <span class="value">${order.customerMobile || '_________________'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Customer Type</span>
                    <span class="colon">:</span>
                    <span class="value">${order.customerType || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <!-- Order Details Section -->
              <div class="section">
                <div class="section-title">Order Details</div>
                <table class="order-table">
                  <thead>
                    <tr>
                      <th>Meal Type</th>
                      <th>Quantity</th>
                      <th>Veg</th>
                      <th>Non Veg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Breakfast</td>
                      <td>${order.breakfastTotal || 0}</td>
                      <td>${order.breakfastVeg || 0}</td>
                      <td>${order.breakfastNonVeg || 0}</td>
                    </tr>
                    <tr>
                      <td>Lunch</td>
                      <td>${order.lunchTotal || 0}</td>
                      <td>${order.lunchVeg || 0}</td>
                      <td>${order.lunchNonVeg || 0}</td>
                    </tr>
                    <tr>
                      <td>Dinner</td>
                      <td>${order.dinnerTotal || 0}</td>
                      <td>${order.dinnerVeg || 0}</td>
                      <td>${order.dinnerNonVeg || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Signatures Section -->
              <div class="signature-section">
                <div class="signature-row">
                  <span class="signature-label">Delivered By (Signature & Name)</span>
                  <span class="colon">:</span>
                  <span class="signature-line"></span>
                </div>
                <div class="signature-row">
                  <span class="signature-label">Received By (Signature and Name, Company Name)</span>
                  <span class="colon">:</span>
                  <span class="signature-line"></span>
                </div>
              </div>
              
              <!-- Notes Section -->
              <div class="notes-section">
                <div class="notes-title">Notes</div>
                <ul class="notes-list">
                  <li>Please Verify Quantity Upon Delivery Time</li>
                  <li>Any discrepancy should be reported immediately</li>
                  <li>Customer Type: ${order.customerType || 'N/A'}</li>
                  <li>Delivery Date: ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</li>
                </ul>
              </div>
            </div>
          </div>
        `
        
        allPrintContent += orderPrintContent
      })

      const fullPrintContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Delivery Orders - ${display}</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm; 
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.3; 
              color: #000;
              background-color: #f5f5f5;
            }
            
            .delivery-order {
              background-color: #f5f5f5;
              padding: 0;
              margin: 0;
            }
            
            .main-container {
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 25px;
              background-color: #333;
              color: white;
              padding: 12px;
            }
            
            .header h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
              color:#000;
            }
            
            .section {
              margin-bottom: 20px;
              background-color: transparent;
            }
            
            .section-title {
              font-weight: bold;
              font-size: 13px;
              margin-bottom: 12px;
              color: #000;
              padding-bottom: 3px;
            }
            
            .info-grid {
              display: block;
            }
            
            .info-row {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              min-height: 18px;
            }
            
            .label {
              font-weight: 500;
              width: 160px;
              flex-shrink: 0;
              font-size: 12px;
              color: #787878 !important;
            }
            
            .colon {
              margin: 0 8px;
              font-weight: normal;
            }
            
            .value {
              flex: 1;
              font-weight: normal;
              border-bottom: 1px dashed #ACACAC;
              min-height: 16px;
              padding-bottom: 1px;
            }
            
            .order-table {
              width: 100%;
              border: 1px solid #000;
              margin: 10px 0;
              background-color: white;
              border-collapse: collapse;
            }
            
            .order-table th {
              background-color: #333;
              color: white;
              padding: 8px 6px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
              border: 1px solid #333;
            }
            
            .order-table td {
              padding: 8px 6px;
              text-align: center;
              border: 1px solid #333;
              background-color: white;
              font-size: 12px;
            }
            
            .order-table td:first-child {
              text-align: left;
              font-weight: normal;
            }
            
            .signature-section {
              margin: 25px 0;
            }
            
            .signature-row {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
            }
            
            .signature-label {
              width: 280px;
              flex-shrink: 0;
              font-size: 12px;
              font-weight: normal;
            }
            
            .signature-line {
              flex: 1;
              border-bottom: 1px dashed  #ACACAC;
              height: 16px;
              margin-left: 8px;
            }
            
            .notes-section {
              margin-top: 25px;
            }
            
            .notes-title {
              font-weight: bold;
              font-size: 13px;
              margin-bottom: 8px;
              color:  #787878;
              padding-bottom: 3px;
            }
            
            .notes-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .notes-list li {
              margin-bottom: 4px;
              font-size: 12px;
              line-height: 1.3;
              position: relative;
              padding-left: 12px;
              color: #787878;
            }
            
            .notes-list li:before {
              content: "•";
              position: absolute;
              left: 0;
              font-weight: bold;
            }
            
            @media print {
              body { 
                background-color: white;
                margin: 0;
                padding: 0;
              }
              
              .delivery-order {
                background-color: white;
              }
            }
          </style>
        </head>
        <body>
          ${allPrintContent}
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
        iframeDoc.write(fullPrintContent)
        iframeDoc.close()

        // Wait for content to load then print
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.print()
            
            // Remove iframe after printing
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 1000)
          }, 100)
        }
      }

      showToast.success('Print Ready', `${deliveryOrders.length} delivery orders ready for printing`)
    } catch (error: any) {
      console.error('Print error:', error)
      showToast.error('Print Error', error?.message || 'Failed to prepare print content')
    } finally {
      setPrintingKey(null)
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintDelivery(entryLocal, orderForLocal, entryStr)}
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          disabled={printingKey === `${entryLocal}|${orderForLocal}`}
                        >
                          {printingKey === `${entryLocal}|${orderForLocal}` ? (
                            <>
                              <div className="w-4 h-4 mr-1 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              Printing...
                            </>
                          ) : (
                            <>
                              <Printer className="w-4 h-4 mr-1" />
                              Print
                            </>
                          )}
                        </Button>
                        
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

export default Delivery


