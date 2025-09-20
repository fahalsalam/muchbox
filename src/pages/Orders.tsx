import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useGetOrders } from '@/hooks/queries/useGetOrders'
import { useDeliverAndProcessNotes } from '@/hooks/mutations/useDeliverAndProcessNotes'
import { showToast } from '@/lib/toast'
import { Skeleton } from '@/components/ui/skeleton'

const Orders: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const mountedAtRef = useRef<number>(Date.now())
  const itemsPerPage = 10
  const navigate = useNavigate()
  
  const [orderDate, setOrderDate] = useState<string | undefined>(undefined)
  const [orderForDate, setOrderForDate] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  // const lastFiltersRef = React.useRef<{ orderDate?: string; orderForDate?: string } | null>(null)
  const { data: ordersData, isLoading, error, refetch, isFetching } = useGetOrders({ orderDate, orderForDate })
  const deliverAndProcessMutation = useDeliverAndProcessNotes()


  // Filter orders based on status
  const filteredOrders = React.useMemo(() => {
    const orders = ordersData?.data || []
    if (!statusFilter) return orders
    return orders.filter((order: any) => order.OrderStatus === statusFilter)
  }, [ordersData?.data, statusFilter])

  // Always load latest data when page opens and when window regains focus
  useEffect(() => {
    // Initial load: refresh without toast to avoid duplicate with focus or initial fetch
    refetch().then(() => {
      setLastUpdated(new Date())
    })
    const onFocus = () => {
      // Avoid double toast if focus fires immediately after mount
      if (Date.now() - mountedAtRef.current < 600) return
      refetch().then(() => {
        const now = new Date()
        setLastUpdated(now)
        showToast.success('Orders refreshed', now.toLocaleTimeString())
      })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refetch])
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Single order print handler
  const handleSingleOrderPrint = (order: any) => {
    // Check if order is eligible for printing (Processed or Delivered status)
    if (!['Processed', 'Delivered'].includes(order.OrderStatus)) {
      alert('Only Processed and Delivered orders can be printed.');
      return;
    }

    // Check if customer type is eligible (Company or Agent)
    if (!['company', 'agent'].includes(order.CustomerType)) {
      alert('Only Company and Agent orders can be printed.');
      return;
    }

    // Generate delivery note for single order
    const deliveryOrderNumber = `DEL${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-1`;
    const label = order.OrderStatus === 'Processed' ? 'Kitchen' : 'Delivery'

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${label} Order</title>
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
        <div class="delivery-order">
          <div class="main-container">
            <!-- Header -->
            <div class="header">
              <h1>Catering ${label} Order</h1>
            </div>
            
            <!-- Order Information Section -->
            <div class="section">
              <div class="section-title">Order Info</div>
              <div class="info-grid">
                <div class="info-row">
                  <span class="label">${label} Order No</span>
                  <span class="colon">:</span>
                  <span class="value">${deliveryOrderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Date</span>
                  <span class="colon">:</span>
                  <span class="value">${order.OrderDate || new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div class="info-row">
                  <span class="label">${label} Time</span>
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
                  <span class="value">${order.CustomerName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Contact Number</span>
                  <span class="colon">:</span>
                  <span class="value">${order.CustomerMobile || '_________________'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Customer Type</span>
                  <span class="colon">:</span>
                  <span class="value">${order.CustomerType}</span>
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
                <li>Please Verify Quantity Upon ${label} Time</li>
                <li>Any discrepancy should be reported immediately</li>
                <li>Customer Type: ${order.CustomerType}</li>
                <li>${label} Date: ${order.OrderDate || new Date().toLocaleDateString('en-GB')}</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Print using iframe approach to avoid background pages
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();
      
      // Wait for content to load then print
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  }

  // Process orders handler
  const handleProcessOrders = async () => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    try {
      await deliverAndProcessMutation.mutateAsync({
        orderDate: today,
        orderFor: today,
      });
      
      showToast.success('Orders processed successfully!');
      
      // Refresh the orders list
      await refetch();
    } catch (error) {
      console.error('Error processing orders:', error);
      showToast.error('Failed to process orders. Please try again.');
    }
  };


  // Summary totals based on the SAME filtered dataset powering the table
  const totals = React.useMemo(() => {
    const src = filteredOrders
    const breakfast = src.reduce((sum: number, o: any) => sum + Number(o.breakfastTotal ?? 0), 0)
    const lunch = src.reduce((sum: number, o: any) => sum + Number(o.lunchTotal ?? 0), 0)
    const dinner = src.reduce((sum: number, o: any) => sum + Number(o.dinnerTotal ?? 0), 0)
    const vegBreakfast = src.reduce((sum: number, o: any) => sum + Number(o.breakfastVeg ?? 0), 0)
    const nonVegBreakfast = src.reduce((sum: number, o: any) => sum + Number(o.breakfastNonVeg ?? 0), 0)
    const vegLunch = src.reduce((sum: number, o: any) => sum + Number(o.lunchVeg ?? 0), 0)
    const nonVegLunch = src.reduce((sum: number, o: any) => sum + Number(o.lunchNonVeg ?? 0), 0)
    const vegDinner = src.reduce((sum: number, o: any) => sum + Number(o.dinnerVeg ?? 0), 0)
    const nonVegDinner = src.reduce((sum: number, o: any) => sum + Number(o.dinnerNonVeg ?? 0), 0)
    return { breakfast, lunch, dinner, vegBreakfast, nonVegBreakfast, vegLunch, nonVegLunch, vegDinner, nonVegDinner }
  }, [filteredOrders])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-4">
          <Skeleton className="h-20 w-48" />
          <Skeleton className="h-20 w-48" />
          <Skeleton className="h-20 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Error loading orders. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards - computed from filteredOrders so it always matches the table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-orange-800">Breakfast</div>
            <div className="text-lg font-bold text-orange-900">{totals.breakfast}</div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1 text-green-700"><span className="w-2 h-2 bg-green-500 rounded-full"></span>{totals.vegBreakfast}</div>
            <div className="flex items-center gap-1 text-red-700"><span className="w-2 h-2 bg-red-500 rounded-full"></span>{totals.nonVegBreakfast}</div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-green-800">Lunch</div>
            <div className="text-lg font-bold text-green-900">{totals.lunch}</div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1 text-green-700"><span className="w-2 h-2 bg-green-500 rounded-full"></span>{totals.vegLunch}</div>
            <div className="flex items-center gap-1 text-red-700"><span className="w-2 h-2 bg-red-500 rounded-full"></span>{totals.nonVegLunch}</div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-purple-800">Dinner</div>
            <div className="text-lg font-bold text-purple-900">{totals.dinner}</div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1 text-green-700"><span className="w-2 h-2 bg-green-500 rounded-full"></span>{totals.vegDinner}</div>
            <div className="flex items-center gap-1 text-red-700"><span className="w-2 h-2 bg-red-500 rounded-full"></span>{totals.nonVegDinner}</div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Entry Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs"
              value={orderDate ?? ''}
              onChange={(e) => setOrderDate(e.target.value || undefined)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Order For</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs"
              value={orderForDate ?? ''}
              onChange={(e) => setOrderForDate(e.target.value || undefined)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Status</label>
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Orderd">📝 Ordered</SelectItem>
                <SelectItem value="Processed">✅ Processed</SelectItem>
                <SelectItem value="Delivered">🚚 Delivered</SelectItem>
                <SelectItem value="Cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-500">Last updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch().then(() => {
                const now = new Date()
                setLastUpdated(now)
                showToast.success('Refreshed', now.toLocaleTimeString())
              })
            }}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcessOrders}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg"
            disabled={deliverAndProcessMutation.isPending}
          >
            {deliverAndProcessMutation.isPending ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Process Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="h-[700px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[80px]">ORDER ID</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[200px]">CUSTOMER</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[120px]">STATUS</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[120px]">TYPE</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[140px] text-center">BREAKFAST</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[140px] text-center">LUNCH</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[140px] text-center">DINNER</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[100px] text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order, index) => (
                <TableRow key={`${order.OrderAID ?? 'aid'}-${order.orderId ?? 'oid'}-${startIndex + index}`} className="hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="py-4 px-4 w-[80px]">
                    <span className="font-medium text-blue-600 text-sm">{startIndex + index + 1}</span>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[200px]">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 text-sm">{order.CustomerName}</div>
                      <div className="text-xs text-gray-500">{order.CustomerType}</div>
                      <div className="text-xs text-gray-400">{order.CustomerMobile}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[120px]">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      order.OrderStatus === 'Processed' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : order.OrderStatus === 'Delivered'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : order.OrderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {order.OrderStatus === 'Processed' && '✅ Processed'}
                      {order.OrderStatus === 'Delivered' && '🚚 Delivered'}
                      {order.OrderStatus === 'Cancelled' && '❌ Cancelled'}
                      {order.OrderStatus === 'Orderd' && '📝 Ordered'}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[120px]">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      order.CustomerType === 'agent' 
                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                        : order.CustomerType === 'company'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {order.CustomerType === 'agent' && '👤 Agent'}
                      {order.CustomerType === 'company' && '🏢 Company'}
                      {order.CustomerType === 'individual' && '👤 Individual'}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[140px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-md font-semibold text-sm min-w-[40px] text-center">
                        {order.breakfastTotal}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">{order.breakfastVeg}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">{order.breakfastNonVeg}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[140px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-md font-semibold text-sm min-w-[40px] text-center">
                        {order.lunchTotal}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">{order.lunchVeg}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">{order.lunchNonVeg}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[140px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-md font-semibold text-sm min-w-[40px] text-center">
                        {order.dinnerTotal}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">{order.dinnerVeg}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">{order.dinnerNonVeg}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 w-[100px]">
                    <div className="flex gap-2 justify-center">
                      {/* Edit Button - Blue Theme */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`p-2 h-8 w-8 ${
                          order.OrderStatus === 'Processed' || order.OrderStatus === 'Delivered'
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
                        }`}
                        disabled={order.OrderStatus === 'Processed' || order.OrderStatus === 'Delivered'}
                        onClick={() => {
                          if (order.OrderStatus === 'Processed' || order.OrderStatus === 'Delivered') {
                            return; // Do nothing if disabled
                          }
                          
                          const editOrder = {
                            customerId: String(order.CustomerId ?? ''),
                            customerName: order.CustomerName,
                            customerMobile: String(order.CustomerMobile ?? ''),
                            preference: 'none',
                            breakfast: Number(order.breakfastTotal ?? 0),
                            lunch: Number(order.lunchTotal ?? 0),
                            dinner: Number(order.dinnerTotal ?? 0),
                          }
                          const editOrderMeta = {
                            orderAID: order.OrderAID,
                            orderId: order.orderId,
                            customerType: order.CustomerType ?? 'individual',
                            date: order.OrderDate ?? undefined,
                            orderFor: order.OrderDate ?? undefined,
                          }
                          navigate('/add-order', { state: { editOrder, editOrderMeta } })
                        }}
                        title="Edit Order"
                      >
                        <Edit className={`h-4 w-4 ${
                          order.OrderStatus === 'Processed' || order.OrderStatus === 'Delivered'
                            ? 'text-gray-400'
                            : 'text-blue-600'
                        }`} />
                      </Button>
                      
                      {/* Print Button - Green Theme */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 h-8 w-8 border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400"
                        title="Print Order"
                        onClick={() => handleSingleOrderPrint(order)}
                        disabled={!['company', 'agent'].includes(order.CustomerType) || !['Processed', 'Delivered'].includes(order.OrderStatus)}
                      >
                        <Printer className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <TableRow className="border-t-2 border-gray-200">
                <TableCell colSpan={8} className="py-4 px-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 font-medium">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1
                          
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          }
                          
                          // Show ellipsis for gaps
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          
                          return null
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Orders
