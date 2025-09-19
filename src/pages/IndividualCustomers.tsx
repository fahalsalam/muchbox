import React, { useState, useMemo } from 'react'
import { Search, Edit, UserPlus, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useGetIndividualCustomers } from '@/hooks/queries/useGetIndividualCustomers'
import { EditCustomerDialog } from '@/components/modals/EditCustomerDialog'
import { ApiIndividualCustomer } from '@/types'
import { useUpdateCustomerStatus } from '@/hooks/mutations/useUpdateCustomerStatus'
import { showToast } from '@/lib/toast'

const IndividualCustomers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [dietFilter, setDietFilter] = useState<'All' | 'veg' | 'non-veg'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ApiIndividualCustomer | null>(null)
  const itemsPerPage = 10
  
  const { data: customersData, isLoading, error } = useGetIndividualCustomers()
  
  const updateStatusMutation = useUpdateCustomerStatus({
    onSuccess: () => {
      showToast.success('Customer status updated successfully')
    },
    onError: (error) => {
      showToast.error(`Failed to update customer status: ${error.message}`)
    }
  })

  // Parse meals JSON string to get individual meal preferences
  const parseMeals = (mealsString: string) => {
    try {
      const meals = JSON.parse(mealsString)
      return {
        breakfast: meals.Breakfast || false,
        lunch: meals.Lunch || false,
        dinner: meals.Dinner || false,
      }
    } catch {
      return { breakfast: false, lunch: false, dinner: false }
    }
  }

  // Filter customers based on search term, status, and diet preference
  const filteredCustomers = useMemo(() => {
    if (!customersData?.data) return []

    return customersData.data.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.mobile.includes(searchTerm) ||
                           customer.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'All' || customer.status === statusFilter
      const matchesDiet = dietFilter === 'All' || customer.dietPreference === dietFilter

      return matchesSearch && matchesStatus && matchesDiet
    })
  }, [customersData, searchTerm, statusFilter, dietFilter])
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditCustomer = (customer: ApiIndividualCustomer) => {
    setSelectedCustomer(customer)
    setIsEditCustomerOpen(true)
  }

  const handleStatusToggle = (customer: ApiIndividualCustomer) => {
    const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active'
    // FIXED LOGIC: If currently Active (enabled) and want to disable → isDelete: false
    // If currently Inactive (disabled) and want to enable → isDelete: true
    const isDelete = customer.status === 'Active' ? false : true
    
    console.log('🎯 Toggle clicked:', { 
      customerId: customer.id, 
      currentStatus: customer.status, 
      newStatus, 
      isDelete 
    });
    
    updateStatusMutation.mutate({
      customerId: customer.id.toString(),
      isDelete,
      customerType: 'individual'
    })
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsAddCustomerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Error loading customers. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Individual Customers</h1>
        </div>
        <Button onClick={handleAddCustomer}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px] justify-between">
                {statusFilter === 'All' ? 'All Status' : statusFilter}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[120px]">
              <DropdownMenuItem onClick={() => setStatusFilter('All')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Inactive')}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Diet Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px] justify-between">
                {dietFilter === 'All' ? 'All Diet' : dietFilter === 'veg' ? 'Veg' : dietFilter === 'non-veg' ? 'Non-Veg' : 'All Diet'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[120px]">
              <DropdownMenuItem onClick={() => setDietFilter('All')}>
                All Diet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDietFilter('veg')}>
                Veg
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDietFilter('non-veg')}>
                Non-Veg
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCustomers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="h-[700px] overflow-auto">
          {filteredCustomers.length === 0 ? (
            <EmptyState
              title="No individual customers"
              description="Add a customer or try changing your search and filters."
              className="h-[700px]"
              action={<Button onClick={handleAddCustomer}><UserPlus className="mr-2 h-4 w-4" />Add Customer</Button>}
            />
          ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[80px]">S.NO</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[200px]">NAME</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[140px]">MOBILE NO</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[120px]">JOINED DATE</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[100px]">PRICE</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[140px] text-center">MEALS QUANTITY</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[160px] text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.map((customer, index) => {
                const meals = parseMeals(customer.meals)
                const formattedDate = new Date(customer.joinedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
                
                return (
                  <TableRow key={customer.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="py-4 px-4 w-[80px]">
                      <span className="font-medium text-gray-900 text-sm">{startIndex + index + 1}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[200px]">
                      <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[140px]">
                      <span className="text-gray-700 text-sm">{customer.mobile}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[120px]">
                      <span className="text-gray-700 text-sm">{formattedDate}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[100px]">
                      <span className="font-semibold text-green-600">{customer.price}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[140px]">
                      <div className="flex items-center justify-center">
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-medium flex gap-1">
                          {meals.breakfast && <span>B</span>}
                          {meals.breakfast && meals.lunch && <span>,</span>}
                          {meals.lunch && <span>L</span>}
                          {(meals.lunch && meals.dinner) && <span>,</span>}
                          {meals.dinner && <span>D</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[160px]">
                      <div className="flex items-center justify-center gap-3">
                        {/* Edit Icon */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 h-8 w-8 hover:bg-gray-100"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        
                        {/* Status Toggle Switch */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleStatusToggle(customer)}
                            disabled={updateStatusMutation.isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              customer.status === 'Active' ? 'bg-blue-500' : 'bg-gray-300'
                            } ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              customer.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        {/* Renew Button */}
                        <Button 
                          size="sm" 
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 h-7 text-xs font-medium"
                        >
                          🔄 RENEW
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
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
      )}

      {/* Add Customer Dialog */}
      <EditCustomerDialog 
        open={isAddCustomerOpen} 
        onOpenChange={setIsAddCustomerOpen}
        customer={null}
        mode="add"
      />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog 
        open={isEditCustomerOpen} 
        onOpenChange={setIsEditCustomerOpen}
        customer={selectedCustomer}
        mode="edit"
      />
    </div>
  )
}

export default IndividualCustomers
