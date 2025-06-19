import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, X } from "lucide-react"
import { ordersAPI, Order } from "@/services/api"
import { toast } from "sonner"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderAdded?: () => void
}

export function AddOrderDialog({ open, onOpenChange, onOrderAdded }: AddOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    capacity: "",
    startTime: "",
    endTime: "",
    orderNumber: "",
    customerName: "",
    phone: "",
    email: "",
    notes: "",
    duration: "",
    placeId: "",
    lat: null as number | null,
    lng: null as number | null
  })

  const handleSubmit = async () => {
    if (!formData.address) {
      toast.error("Address is required")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Map form data to API format
      const orderData: Order = {
        address: formData.address,
        order_number: formData.orderNumber || undefined,
        customer_name: formData.customerName || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
        duration: formData.duration || undefined,
        load: formData.capacity || undefined,
        start_time: formData.startTime || undefined,
        end_time: formData.endTime || undefined,
        lat: formData.lat || undefined,
        lng: formData.lng || undefined,
        place_id: formData.placeId || undefined
      }
      
      await ordersAPI.create(orderData)
      
      toast.success("Order added successfully")
      
      // Reset form
      setFormData({
        address: "",
        capacity: "",
        startTime: "",
        endTime: "",
        orderNumber: "",
        customerName: "",
        phone: "",
        email: "",
        notes: "",
        duration: "",
        placeId: "",
        lat: null,
        lng: null
      })
      
      // Close dialog
      onOpenChange(false)
      
      // Refresh orders list
      if (onOrderAdded) {
        onOrderAdded()
      }
    } catch (error) {
      console.error("Failed to add order:", error)
      toast.error("Failed to add order")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle address selection from autocomplete
  const handleAddressSelect = (place: { address: string; placeId: string; lat?: number; lng?: number }) => {
    setFormData({
      ...formData,
      address: place.address,
      placeId: place.placeId,
      lat: place.lat || null,
      lng: place.lng || null
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add an order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <Badge variant="destructive">Required</Badge>
            </div>
            
            {/* Map placeholder */}
            <div className="h-64 bg-blue-100 rounded-lg flex items-center justify-center relative">
              <div className="text-blue-600 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive Map</p>
                <p className="text-sm">Click to select location</p>
              </div>
              
              {/* Map controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button size="sm" variant="outline" className="w-8 h-8 p-0">+</Button>
                <Button size="sm" variant="outline" className="w-8 h-8 p-0">-</Button>
                <Button size="sm" variant="outline" className="w-8 h-8 p-0">⌖</Button>
              </div>
            </div>

            {/* Address input tabs */}
            <div className="flex gap-2">
              <Button variant="default" className="flex-1">Address</Button>
              <Button variant="outline" className="flex-1">Coordinates</Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(value) => setFormData({...formData, address: value})}
                onSelect={handleAddressSelect}
                placeholder="Enter address"
              />
              {formData.lat && formData.lng && (
                <div className="text-xs text-muted-foreground mt-1">
                  Coordinates: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                placeholder="Enter capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Time Window (From)</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Time Window (Till)</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order number</Label>
                <Input
                  id="orderNumber"
                  placeholder="Enter order number"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="Enter duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
