import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AddCompany: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Company</h1>
        <p className="text-muted-foreground">Create a new company customer</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Form</CardTitle>
          <CardDescription>Enter company details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Company form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddCompany
