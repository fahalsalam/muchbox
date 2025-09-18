import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Agents: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
        <p className="text-muted-foreground">Manage sales agents</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent List</CardTitle>
          <CardDescription>All sales agents</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Agent list will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Agents
