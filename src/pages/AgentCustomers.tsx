import React, { useState, useMemo } from 'react'
import { Search, UserPlus, Edit, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useGetAgentCustomers } from '@/hooks/queries/useGetAgentCustomers'
import { AddAgentDialog } from '@/components/modals/AddAgentDialog'
import { ApiAgentCustomer } from '@/types'
import { useUpdateCustomerStatus } from '@/hooks/mutations/useUpdateCustomerStatus'
import { showToast } from '@/lib/toast'

const AgentCustomers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false)
  const [isEditAgentOpen, setIsEditAgentOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<ApiAgentCustomer | null>(null)
  // const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const itemsPerPage = 10
  
  const { data: customersData, isLoading, error } = useGetAgentCustomers()
  
  const updateStatusMutation = useUpdateCustomerStatus({
    onSuccess: () => {
      showToast.success('Agent status updated successfully')
    },
    onError: (error) => {
      showToast.error(`Failed to update agent status: ${error.message}`)
    }
  })

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    if (!customersData?.data) return []
    
    return customersData.data.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.mobile.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'All' || customer.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [customersData?.data, searchTerm, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleAddAgent = () => {
    setEditingAgent(null)
    setIsAddAgentOpen(true)
  }

  const handleEditAgent = (agent: ApiAgentCustomer) => {
    setEditingAgent(agent)
    setIsEditAgentOpen(true)
  }

  const handleStatusToggle = (agent: ApiAgentCustomer) => {
    const newStatus = agent.status === 'Active' ? 'Inactive' : 'Active'
    // FIXED LOGIC: If currently Active (enabled) and want to disable → isDelete: false
    // If currently Inactive (disabled) and want to enable → isDelete: true
    const isDelete = agent.status === 'Active' ? false : true
    
    console.log('🎯 Agent toggle clicked:', { 
      customerId: agent.id, 
      currentStatus: agent.status, 
      newStatus, 
      isDelete 
    });
    
    updateStatusMutation.mutate({
      customerId: agent.id.toString(),
      isDelete,
      customerType: 'agent'
    })
  }

  const handleCloseDialog = () => {
    setIsAddAgentOpen(false)
    setIsEditAgentOpen(false)
    setEditingAgent(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Failed to load agent customers</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Customers</h1>
        </div>
        <Button onClick={handleAddAgent}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search agents..."
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

        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="h-[700px] overflow-auto">
          {filteredCustomers.length === 0 ? (
            <EmptyState 
              title="No agent customers"
              description="Add an agent or adjust your search and filters."
              className="h-[700px]"
              action={<Button onClick={handleAddAgent}><UserPlus className="mr-2 h-4 w-4" />Add Agent</Button>}
            />
          ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[80px]">SL NO</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[200px]">NAME</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[140px]">MOBILE</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[200px]">ADDRESS</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[120px]">JOINED DATE</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wide py-3 px-4 w-[120px] text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.map((customer, index) => {
                const formattedDate = new Date(customer.joinedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
                
                return (
                  <TableRow key={customer.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="py-4 px-4 w-[80px]">
                      <span className="font-medium text-blue-600 text-sm">{startIndex + index + 1}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[200px]">
                      <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[140px]">
                      <span className="text-gray-700 text-sm">{customer.mobile}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[200px]">
                      <span className="text-gray-700 text-sm">{customer.address}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[120px]">
                      <span className="text-gray-700 text-sm">{formattedDate}</span>
                    </TableCell>
                    <TableCell className="py-4 px-4 w-[120px]">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 h-8 w-8 hover:bg-gray-100"
                          onClick={() => handleEditAgent(customer)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
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
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={pageNumber === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
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

      {/* Add Agent Dialog */}
      <AddAgentDialog 
        open={isAddAgentOpen} 
        onOpenChange={handleCloseDialog}
        agent={null}
        mode="add"
      />

      {/* Edit Agent Dialog */}
      <AddAgentDialog 
        open={isEditAgentOpen} 
        onOpenChange={handleCloseDialog}
        agent={editingAgent}
        mode="edit"
      />
    </div>
  )
}

export default AgentCustomers
