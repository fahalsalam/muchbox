import React from 'react'
import { 
  Users, 
  Building2, 
  UserCheck, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Clock,
  Package
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
// import LoadingSpinner from '@/components/ui/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetDashboard } from '@/hooks/queries/useGetDashboard'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useGetDashboard()
  const navigate = useNavigate()

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Dashboard</h3>
          <p className="text-muted-foreground">Unable to load dashboard data. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening in your kitchen today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => navigate('/add-order')}>
            <Package className="mr-2 h-4 w-4" />
            Quick Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {dashboardData?.data?.summary?.totalActiveCustomers || 0}
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
                  <span className="text-emerald-700 dark:text-emerald-300">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-900/10 border-sky-200 dark:border-sky-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-sky-900 dark:text-sky-200">Today's Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sky-900 dark:text-sky-100">
                  {dashboardData?.data?.recentActivity?.length || 0}
                </div>
                <p className="text-xs text-sky-800/80 dark:text-sky-200/80">
                  <span className="text-sky-700 dark:text-sky-300">+8%</span> from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {formatCurrency(
                    dashboardData?.data?.recentActivity?.reduce((total, activity) => total + activity.total, 0) || 0
                  )}
                </div>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                  <span className="text-amber-700 dark:text-amber-300">+15%</span> from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/10 border-rose-200 dark:border-rose-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-200">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-rose-700 dark:text-rose-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                  {dashboardData?.data?.recentActivity?.filter(activity => 
                    activity.activityType === 'Order Placed'
                  ).length || 0}
                </div>
                <p className="text-xs text-rose-800/80 dark:text-rose-200/80">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest orders and customer activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.data?.recentActivity?.slice(0, 5).map((activity) => (
                    <TableRow key={`${activity.customerId}-${activity.orderId}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{activity.customerName}</div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {activity.customerType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>#{activity.orderId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {activity.activityType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(activity.total)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(activity.activityDate)}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No recent activities found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>
              Key business metrics at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Building2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">Companies</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {dashboardData?.data?.summary?.totalCompanies || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <UserCheck className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">Agents</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {dashboardData?.data?.summary?.totalAgents || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium">Individual Customers</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {dashboardData?.data?.summary?.totalIndividualCustomers || 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
