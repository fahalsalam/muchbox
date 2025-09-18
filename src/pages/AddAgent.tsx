import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AddAgent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Agent</h1>
        <p className="text-muted-foreground">Create a new sales agent</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent Form</CardTitle>
          <CardDescription>Enter agent details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Agent form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddAgent
