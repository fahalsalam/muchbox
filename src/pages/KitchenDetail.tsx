import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useGetOrderPivot } from '@/hooks/queries/useGetOrderPivot'

interface KitchenDetailProps {
  dateProp?: string
  entryDateProp?: string
}

const KitchenDetail: React.FC<KitchenDetailProps> = ({ dateProp, entryDateProp }) => {
  const param = useParams().date
  const date = (dateProp ?? param) || ''
  const entry = entryDateProp || date
  const display = date ? new Date(date).toLocaleDateString() : ''
  const { data, isLoading, error } = useGetOrderPivot(entry, date)
  const row = data?.data?.[0]
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Kitchen Details - {display}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-6 text-sm text-gray-500">Loading…</div>
          )}
          {!isLoading && error && (
            <div className="py-6 text-sm text-red-600">Failed to load details. Please try again.</div>
          )}
          {!isLoading && !error && !row && (
            <div className="py-6 text-sm text-gray-600">No details available for this date.</div>
          )}
          {row && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Company</TableHead>
                  <TableHead className="text-right">Agent</TableHead>
                  <TableHead className="text-right">Individual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Breakfast</TableCell>
                  <TableCell className="text-right"><Badge className="bg-orange-100 text-orange-800 border-orange-200">{row.Breakfast_Total}</Badge></TableCell>
                  <TableCell className="text-right">{row.Breakfast_Company}</TableCell>
                  <TableCell className="text-right">{row.Breakfast_Agent}</TableCell>
                  <TableCell className="text-right">{row.Breakfast_Individual}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lunch</TableCell>
                  <TableCell className="text-right"><Badge className="bg-green-100 text-green-800 border-green-200">{row.Lunch_Total}</Badge></TableCell>
                  <TableCell className="text-right">{row.Lunch_Company}</TableCell>
                  <TableCell className="text-right">{row.Lunch_Agent}</TableCell>
                  <TableCell className="text-right">{row.Lunch_Individual}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Dinner</TableCell>
                  <TableCell className="text-right"><Badge className="bg-purple-100 text-purple-800 border-purple-200">{row.Dinner_Total}</Badge></TableCell>
                  <TableCell className="text-right">{row.Dinner_Company}</TableCell>
                  <TableCell className="text-right">{row.Dinner_Agent}</TableCell>
                  <TableCell className="text-right">{row.Dinner_Individual}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default KitchenDetail


