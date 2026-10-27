'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Package, Plus, Search, AlertTriangle, RefreshCw, Edit2, TrendingDown,
  ChevronDown, ChevronUp, ArrowUpDown, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { ITEM_CATEGORIES } from '@/lib/utils'

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: 'text-green-400',
  GOOD: 'text-blue-400',
  FAIR: 'text-yellow-400',
  POOR: 'text-orange-400',
  DAMAGED: 'text-red-400',
}

const EMPTY_FORM = {
  name: '',
  category: 'VEHICLE',
  availableQty: 1,
  minThreshold: 2,
  unit: 'units',
  condition: 'GOOD',
  locationId: '',
  notes: '',
}

export default function InventoryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [locationFilter, setLocationFilter] = useState('ALL')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [adjustItem, setAdjustItem] = useState<any>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [adjustType, setAdjustType] = useState('STOCK_IN')
  const [adjustQty, setAdjustQty] = useState(1)
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [movLoading, setMovLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
    if (locationFilter !== 'ALL') params.set('locationId', locationFilter)
    try {
      const res = await fetch(`/api/inventory?${params}`)
      if (res.ok) {
        const data = await res.json()
        let itemList = data.items || []
        if (lowStockOnly) itemList = itemList.filter((i: any) => i.isLowStock)
        setItems(itemList)
        if (data.locations) setLocations(data.locations)
      }
    } catch {}
    setLoading(false)
  }, [search, categoryFilter, locationFilter, lowStockOnly])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM, locationId: locations[0]?.id || '' })
    setAddOpen(true)
  }

  const openEdit = (item: any) => {
    setEditItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      availableQty: item.availableQty,
      minThreshold: item.minThreshold,
      unit: item.unit,
      condition: item.condition,
      locationId: item.location?.id || '',
      notes: item.notes || '',
    })
  }

  const saveItem = async () => {
    setSaving(true)
    try {
      const url = editItem ? `/api/inventory/${editItem.id}` : '/api/inventory'
      const method = editItem ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast({ title: editItem ? 'Item Updated' : 'Item Added' })
        setAddOpen(false)
        setEditItem(null)
        fetchItems()
      } else {
        const d = await res.json()
        toast({ title: 'Error', description: d.error || 'Failed to save', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const doAdjust = async () => {
    if (!adjustItem) return
    setAdjusting(true)
    try {
      const res = await fetch(`/api/inventory/${adjustItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustQty: { type: adjustType, quantity: adjustQty, reason: adjustReason } }),
      })
      if (res.ok) {
        toast({ title: 'Stock Adjusted' })
        setAdjustItem(null)
        setAdjustQty(1)
        setAdjustReason('')
        fetchItems()
      } else {
        const d = await res.json()
        toast({ title: 'Error', description: d.error || 'Adjustment failed', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setAdjusting(false)
    }
  }

  const toggleHistory = async (item: any) => {
    if (expandedId === item.id) { setExpandedId(null); return }
    setExpandedId(item.id)
    setMovLoading(true)
    try {
      const res = await fetch(`/api/inventory/${item.id}`)
      if (res.ok) {
        const data = await res.json()
        setMovements(data.item?.movements || [])
      }
    } catch {}
    setMovLoading(false)
  }

  const lowStockCount = items.filter((i) => i.isLowStock).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {items.length} items · {lowStockCount > 0 && <span className="text-amber-600">{lowStockCount} low stock</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchItems} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{lowStockCount} item{lowStockCount > 1 ? 's' : ''}</span> below minimum threshold. Review and restock soon.
          </p>
          <button onClick={() => setLowStockOnly(true)} className="ml-auto text-xs text-amber-700 hover:underline font-medium">
            View low stock →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {ITEM_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Locations</SelectItem>
            {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setLowStockOnly((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            lowStockOnly ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          {lowStockOnly ? 'Showing Low Stock' : 'Low Stock Only'}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Name','Category','Location','Available','Reserved','Dispatched','Condition','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>))}</tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400">No inventory items found</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className={`transition-colors ${item.isLowStock ? 'bg-amber-50/60' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.isLowStock && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" aria-label="Low stock" />}
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {ITEM_CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.location?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${item.isLowStock ? 'text-amber-600' : 'text-green-600'}`}>
                          {item.availableQty}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ min {item.minThreshold}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.reservedQty}</td>
                      <td className="px-4 py-3 text-slate-500">{item.dispatchedQty}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${CONDITION_COLORS[item.condition] || 'text-slate-500'}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => openEdit(item)} title="Edit">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-amber-500 hover:text-amber-700" onClick={() => setAdjustItem(item)} title="Adjust Stock">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleHistory(item)} title="Movement History">
                            {expandedId === item.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={8} className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Movement History</p>
                          {movLoading ? (
                            <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                          ) : movements.length === 0 ? (
                            <p className="text-xs text-slate-400">No movement history.</p>
                          ) : (
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {movements.map((m: any) => (
                                <div key={m.id} className="flex items-center gap-3 text-xs text-slate-500">
                                  <span className={`font-medium w-24 flex-shrink-0 ${
                                    m.type === 'STOCK_IN' ? 'text-green-600'
                                    : m.type === 'DISPATCH' ? 'text-cyan-600'
                                    : m.type === 'RESERVE' ? 'text-blue-600'
                                    : 'text-red-600'
                                  }`}>{m.type}</span>
                                  <span className={m.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                                  </span>
                                  {m.reason && <span className="text-slate-400">{m.reason}</span>}
                                  {m.performedBy && <span className="text-slate-400">by {m.performedBy.name}</span>}
                                  <span className="text-slate-400 ml-auto">{new Date(m.createdAt).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen || !!editItem} onOpenChange={(o) => { if (!o) { setAddOpen(false); setEditItem(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input className="mt-1" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={formData.locationId} onValueChange={(v) => setFormData({ ...formData, locationId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Available Quantity</Label>
              <Input type="number" min={0} className="mt-1" value={formData.availableQty} onChange={(e) => setFormData({ ...formData, availableQty: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Min Threshold (Alert)</Label>
              <Input type="number" min={0} className="mt-1" value={formData.minThreshold} onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input className="mt-1" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g., units, boats, kits" />
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['EXCELLENT','GOOD','FAIR','POOR','DAMAGED'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Notes (optional)</Label>
              <Input className="mt-1" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null) }}>Cancel</Button>
            <Button onClick={saveItem} disabled={saving || !formData.name}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjustItem} onOpenChange={(o) => !o && setAdjustItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Stock — {adjustItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Adjustment Type</Label>
              <Select value={adjustType} onValueChange={setAdjustType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCK_IN">Stock In (Add)</SelectItem>
                  <SelectItem value="STOCK_OUT">Stock Out (Remove)</SelectItem>
                  <SelectItem value="DAMAGED">Mark as Damaged</SelectItem>
                  <SelectItem value="EXPIRED">Mark as Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" min={1} className="mt-1" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} />
            </div>
            <div>
              <Label>Reason</Label>
              <Input className="mt-1" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason for adjustment…" />
            </div>
            {adjustItem && (
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-xs text-slate-500 space-y-1">
                <p>Current available: <span className="text-slate-800 font-medium">{adjustItem.availableQty} {adjustItem.unit}</span></p>
                <p>Min threshold: <span className="text-slate-800 font-medium">{adjustItem.minThreshold} {adjustItem.unit}</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustItem(null)}>Cancel</Button>
            <Button onClick={doAdjust} disabled={adjusting || adjustQty < 1}>
              {adjusting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
