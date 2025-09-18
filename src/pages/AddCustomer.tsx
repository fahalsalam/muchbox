import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AddCustomer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Customer</h1>
        <p className="text-muted-foreground">Create a new individual customer</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Form</CardTitle>
          <CardDescription>Enter customer details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddCustomer
