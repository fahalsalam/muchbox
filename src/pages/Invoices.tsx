import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMonthlyInvoiceSummary } from '@/hooks/queries/useGetMonthlyInvoiceSummary'
import { usePostInvoice } from '@/hooks/mutations/usePostInvoice'
import { PostInvoiceRequest, MonthlyInvoiceSummary } from '@/types'
import { showToast } from '@/lib/toast'

const Invoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Fetch invoice data from API
  const { data: invoiceData, isLoading, error, refetch, isFetching } = useGetMonthlyInvoiceSummary()
  const postInvoiceMutation = usePostInvoice()
  
  const invoices = invoiceData?.data?.headers || []
  const invoiceDetails = invoiceData?.data?.details || []
  const [processingInvoices, setProcessingInvoices] = useState<Set<number>>(new Set())
  const [processedInvoices, setProcessedInvoices] = useState<Set<number>>(new Set())

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    if (!invoices.length) return []
    
    // Search filtering
    if (searchTerm) {
      return invoices.filter(invoice => 
        invoice.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.CustomerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.InvoiceNo.toString().includes(searchTerm)
      )
    }
    
    return invoices
  }, [invoices, searchTerm])
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Process invoice function
  const processInvoice = async (invoice: MonthlyInvoiceSummary) => {
    try {
      // Add to processing set
      setProcessingInvoices(prev => new Set(prev).add(invoice.InvoiceNo))
      
      // Get details for this invoice
      const invoiceDetailItems = invoiceDetails.filter(detail => 
        detail.OrderAID === invoice.OrderAID && detail.OrderId === invoice.OrderId
      )
      
      // Create the request payload
      const payload: PostInvoiceRequest = {
        header: {
          referenceNo: `INV-${invoice.InvoiceNo}`,
          prefix: 'INV',
          suffix: invoice.InvoiceNo.toString(),
          lpoDate: new Date().toISOString(),
          entryDate: new Date().toISOString(),
          customerId: parseInt(invoice.CustomerId),
          invoiceAmount: invoice.TotalAmount,
          paymentCollectionXml: '',
          taxPostingXml: '',
          termsXml: '',
          messagesXml: '',
          otherChargesXml: ''
        },
        details: invoiceDetailItems.map(detail => ({
          sl: detail.SL,
          barCode: detail.Barcode,
          itemName: detail.ItemName,
          unitPrice: detail.UnitPrice,
          quantity: detail.Quantity,
          total: detail.Total,
          vatValue: detail.VatValue,
          vatId: detail.VatId
        }))
      }
      
      await postInvoiceMutation.mutateAsync(payload)
      
      // Remove from processing and add to processed
      setProcessingInvoices(prev => {
        const newSet = new Set(prev)
        newSet.delete(invoice.InvoiceNo)
        return newSet
      })
      setProcessedInvoices(prev => new Set(prev).add(invoice.InvoiceNo))
      
      showToast.success('Invoice Processed', `Invoice #${invoice.InvoiceNo} processed successfully`)
      
    } catch (error: any) {
      // Remove from processing set on error
      setProcessingInvoices(prev => {
        const newSet = new Set(prev)
        newSet.delete(invoice.InvoiceNo)
        return newSet
      })
      
      showToast.error('Processing Failed', `Failed to process Invoice #${invoice.InvoiceNo}: ${error?.message || 'Unknown error'}`)
    }
  }

  // Process all invoices
  const processAllInvoices = async () => {
    const unprocessedInvoices = filteredInvoices.filter(invoice => 
      !processedInvoices.has(invoice.InvoiceNo) && !processingInvoices.has(invoice.InvoiceNo)
    )
    
    for (const invoice of unprocessedInvoices) {
      await processInvoice(invoice)
      // Small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Invoices</div>
          <div className="text-gray-600 mb-4">Failed to load invoice data</div>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoice Summary</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Search</label>
            <Input 
              placeholder="Search invoices..." 
              className="h-8 text-xs w-[200px]" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button variant="outline" size="sm" onClick={()=>{setSearchTerm('')}}>Clear</Button>
          <Button 
            className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg" 
            onClick={processAllInvoices} 
            disabled={isFetching || processingInvoices.size > 0 || filteredInvoices.length === 0}
          >
            {processingInvoices.size > 0 ? `Processing... (${processingInvoices.size})` : 'Process Invoice'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📄</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                AED {invoices.reduce((sum, inv) => sum + inv.TotalAmount, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">💰</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
              <p className="text-2xl font-bold text-emerald-600">
                {invoices.filter(inv => inv.PayStatus === 'Paid').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-lg">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-amber-600">
                {invoices.filter(inv => inv.PayStatus === 'Pending').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 text-lg">⏳</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary by Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-bounce">
                <span className="text-2xl">📄</span>
              </div>
              <div className="text-gray-800 font-medium">No data found</div>
              <div className="text-gray-500 text-sm mt-1">Try adjusting the filters or refresh.</div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={()=>{setSearchTerm('')}}>Clear Filters</Button>
                <Button size="sm" onClick={()=>refetch()} disabled={isFetching}>{isFetching? 'Refreshing…' : 'Refresh'}</Button>
              </div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead className="text-right">Breakfast</TableHead>
                <TableHead className="text-right">Lunch</TableHead>
                <TableHead className="text-right">Dinner</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Payment Mode</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentInvoices.map((invoice) => (
                <TableRow key={`${invoice.CustomerId}-${invoice.InvoiceNo}`}>
                  <TableCell className="font-medium text-blue-600">
                    #{invoice.InvoiceNo}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.CustomerName}</div>
                      <div className="text-xs text-gray-500">ID: {invoice.CustomerId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.CustomerType === 'individual' ? 'default' :
                      invoice.CustomerType === 'company' ? 'secondary' : 'outline'
                    }>
                      {invoice.CustomerType.charAt(0).toUpperCase() + invoice.CustomerType.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{invoice.InvoiceMonth}</div>
                      <div className="text-gray-500">{invoice.InvoiceYear}</div>
                    </div>
                  </TableCell>
                    <TableCell className="text-right">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">{invoice.BreakfastTotal}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Badge className="bg-green-100 text-green-800 border-green-200">{invoice.LunchTotal}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">{invoice.DinnerTotal}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      AED {invoice.TotalAmount.toLocaleString()}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Badge className={invoice.PaymentMode === 'Cash' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                      {invoice.PaymentMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Badge className={invoice.PayStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                      {invoice.PayStatus}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {processingInvoices.has(invoice.InvoiceNo) ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            Processing...
                          </Badge>
                        ) : processedInvoices.has(invoice.InvoiceNo) ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            ✅ Processed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processInvoice(invoice)}
                            disabled={processingInvoices.has(invoice.InvoiceNo)}
                            className="text-xs"
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
            
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <TableRow className="border-t-2 border-gray-200">
                <TableCell colSpan={11} className="py-4 px-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 font-medium">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} invoices
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Invoices