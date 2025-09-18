import React, { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type DoRow = {
  date: string
  type: 'Individual' | 'Company' | 'Agent'
  customer: string
  items: Array<{ label: string; qty: number; amount: number }>
  amount: number
  payMode: 'CASH' | 'CREDIT'
}

type Invoice = {
  date: string
  invoiceNo: string
  type: 'Individual' | 'Company' | 'Agent'
  customer: string
  items: Array<{ label: string; qty: number; amount: number }>
  amount: number
  payMode: 'CASH' | 'CREDIT'
  paid: boolean
}

const seedDOs: DoRow[] = [
  {
    date: '2025-01-01',
    type: 'Individual',
    customer: 'Mr. Chandran',
    items: [{ label: 'Mess individual', qty: 1, amount: 300 }],
    amount: 300,
    payMode: 'CASH',
  },
  {
    date: '2025-01-01',
    type: 'Individual',
    customer: 'Mr. Aneesh',
    items: [{ label: 'Mess individual', qty: 1, amount: 300 }],
    amount: 300,
    payMode: 'CASH',
  },
  {
    date: '2025-01-31',
    type: 'Company',
    customer: 'ABC Company',
    items: [
      { label: 'Breakfast', qty: 2, amount: 40 },
      { label: 'Lunch', qty: 2, amount: 60 },
      { label: 'Dinner', qty: 2, amount: 80 },
    ],
    amount: 3450,
    payMode: 'CREDIT',
  },
  {
    date: '2025-01-31',
    type: 'Agent',
    customer: 'XYZ Agent',
    items: [
      { label: 'Breakfast', qty: 2, amount: 40 },
      { label: 'Lunch', qty: 2, amount: 60 },
      { label: 'Dinner', qty: 2, amount: 80 },
    ],
    amount: 3450,
    payMode: 'CREDIT',
  },
]

const Invoices: React.FC = () => {
  const [dos] = useState<DoRow[]>(seedDOs)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [forceEndOfMonth, setForceEndOfMonth] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    invoiceNo: '',
    type: '' as Invoice['type'],
    customer: '',
    amount: 0,
    payMode: 'CASH' as Invoice['payMode'],
    paid: false,
  })

  const today = new Date()
  const isLastDayOfMonth = useMemo(() => {
    if (forceEndOfMonth) return true
    const test = new Date(today)
    const next = new Date(test.getFullYear(), test.getMonth(), test.getDate() + 1)
    return next.getDate() === 1
  }, [today, forceEndOfMonth])

  const individualDOs = dos.filter(d => d.type === 'Individual')
  const companyAndAgentDOs = dos.filter(d => d.type !== 'Individual')

  const handleProcessInvoices = () => {
    // Aggregate Company and Agent DOs into one invoice per customer
    const group = new Map<string, DoRow[]>()
    companyAndAgentDOs.forEach(row => {
      const key = `${row.type}|${row.customer}`
      const list = group.get(key) || []
      list.push(row)
      group.set(key, list)
    })

    const newInvoices: Invoice[] = []

    // Company/Agent: one invoice per customer for the month
    group.forEach((rows, key) => {
      const [type, customer] = key.split('|') as ['Company' | 'Agent', string]
      const amount = rows.reduce((sum, r) => sum + r.amount, 0)
      const items = rows.flatMap(r => r.items)
      newInvoices.push({
        date: format(new Date(), 'yyyy-MM-dd'),
        invoiceNo: `${Math.floor(100000 + Math.random() * 900000)}`,
        type,
        customer,
        items,
        amount,
        payMode: 'CREDIT',
        paid: false,
      })
    })

    // Individuals: invoice each DO immediately (already CASH)
    individualDOs.forEach(r => {
      newInvoices.push({
        date: r.date,
        invoiceNo: `${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'Individual',
        customer: r.customer,
        items: r.items,
        amount: r.amount,
        payMode: 'CASH',
        paid: true, // assume cash collected on creation
      })
    })

    setInvoices(newInvoices)
  }

  const markPaid = (invoiceNo: string) => {
    setInvoices(prev => prev.map(inv => inv.invoiceNo === invoiceNo ? { ...inv, paid: true } : inv))
  }

  const openEdit = (inv: Invoice | DoRow) => {
    // Convert DoRow to Invoice format if needed
    const invoiceData: Invoice = 'invoiceNo' in inv ? inv as Invoice : {
      date: inv.date,
      invoiceNo: `TEMP-${Math.random().toString(36).substr(2, 9)}`,
      type: inv.type,
      customer: inv.customer,
      items: inv.items,
      amount: inv.amount,
      payMode: inv.payMode,
      paid: inv.payMode === 'CASH'
    }
    setEditingInvoice(invoiceData)
    setIsEditOpen(true)
  }

  useEffect(() => {
    if (!editingInvoice) return
    setEditForm({
      date: editingInvoice.date,
      invoiceNo: editingInvoice.invoiceNo,
      type: editingInvoice.type,
      customer: editingInvoice.customer,
      amount: editingInvoice.amount,
      payMode: editingInvoice.payMode,
      paid: editingInvoice.paid,
    })
  }, [editingInvoice])

  const saveEdit = () => {
    if (editingInvoice?.invoiceNo.startsWith('TEMP-')) {
      // This is a DoRow being edited, we can't actually save it since it's not an invoice yet
      // Just close the dialog
      setIsEditOpen(false)
      setEditingInvoice(null)
      return
    }
    
    setInvoices(prev => prev.map(inv => inv.invoiceNo === editForm.invoiceNo ? {
      ...inv,
      date: editForm.date,
      customer: editForm.customer,
      amount: editForm.amount,
      payMode: editForm.payMode,
      paid: editForm.paid,
    } : inv))
    setIsEditOpen(false)
    setEditingInvoice(null)
  }

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditingInvoice(null)
    setEditForm({
      date: '',
      invoiceNo: '',
      type: '' as Invoice['type'],
      customer: '',
      amount: 0,
      payMode: 'CASH' as Invoice['payMode'],
      paid: false,
    })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoice Summary</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Demo: force end-of-month</label>
            <Input type="checkbox" checked={forceEndOfMonth} onChange={e=>setForceEndOfMonth(e.target.checked)} className="h-4 w-4" />
          </div>
          <Button 
            onClick={handleProcessInvoices} 
            disabled={!isLastDayOfMonth}
            className="text-sm"
          >
            Process Invoices
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary by Date</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 && companyAndAgentDOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-bounce">
                <span className="text-2xl">📄</span>
              </div>
              <div className="text-gray-800 font-medium">No data found</div>
              <div className="text-gray-500 text-sm mt-1">Try adjusting the filters or refresh.</div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Inv No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Pay Mode</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                companyAndAgentDOs.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{format(new Date(r.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.customer}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{r.amount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-100 text-green-800 border-green-200">{r.payMode}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">PENDING</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600 shadow" onClick={() => openEdit(r)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                invoices.map(inv => (
                  <TableRow key={inv.invoiceNo}>
                    <TableCell>{format(new Date(inv.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{inv.invoiceNo}</TableCell>
                    <TableCell>{inv.type}</TableCell>
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{inv.amount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={inv.payMode === 'CASH' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                        {inv.payMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.paid ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">PAID</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">UNPAID</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!inv.paid && (
                        <Button size="sm" onClick={() => markPaid(inv.invoiceNo)}>Mark Paid</Button>
                      )}
                      <Button size="sm" className="bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white hover:from-fuchsia-600 hover:to-rose-600 shadow" onClick={() => openEdit(inv)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Invoice No</Label>
                <Input id="invoiceNo" value={editForm.invoiceNo} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={editForm.type} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payMode">Pay Mode</Label>
                <select id="payMode" className="border rounded h-9 px-3 text-sm" value={editForm.payMode} onChange={e => setEditForm(f => ({ ...f, payMode: e.target.value as Invoice['payMode'] }))}>
                  <option value="CASH">CASH</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input id="customer" value={editForm.customer} onChange={e => setEditForm(f => ({ ...f, customer: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value || 0) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid">Status</Label>
                <select id="paid" className="border rounded h-9 px-3 text-sm" value={editForm.paid ? 'PAID' : 'UNPAID'} onChange={e => setEditForm(f => ({ ...f, paid: e.target.value === 'PAID' }))}>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Invoices
