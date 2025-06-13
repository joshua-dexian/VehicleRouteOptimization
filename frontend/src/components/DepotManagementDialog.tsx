import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, MapPin, Trash2 } from "lucide-react"
import { depotsAPI, Depot } from "@/services/api"
import { toast } from "sonner"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"

interface DepotManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDepotAdded?: () => void
}

export function DepotManagementDialog({ open, onOpenChange, onDepotAdded }: DepotManagementDialogProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: "",
    // Add geocoding data
    placeId: "",
    lat: null as number | null,
    lng: null as number | null
  })

  const fetchDepots = async () => {
    try {
      setLoading(true)
      const data = await depotsAPI.getAll()
      setDepots(data)
    } catch (error) {
      console.error("Failed to fetch depots:", error)
      toast.error("Failed to fetch depots")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchDepots()
    }
  }, [open])

  const handleAddDepot = async () => {
    if (!formData.name || !formData.address) {
      toast.error("Depot name and address are required")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Map form data to API format
      const depotData: Depot = {
        name: formData.name,
        address: formData.address,
        capacity: formData.capacity || undefined,
        // Add geocoding data if available
        lat: formData.lat || undefined,
        lng: formData.lng || undefined,
        place_id: formData.placeId || undefined
      }
      
      await depotsAPI.create(depotData)
      
      toast.success("Depot added successfully")
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        capacity: "",
        placeId: "",
        lat: null,
        lng: null
      })
      setShowAddForm(false)
      
      // Refresh depots list
      await fetchDepots()
      
      // Notify parent component
      if (onDepotAdded) {
        onDepotAdded()
      }
    } catch (error) {
      console.error("Failed to add depot:", error)
      toast.error("Failed to add depot")
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

  const handleDeleteDepot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this depot?")) {
      return
    }

    try {
      await depotsAPI.delete(id)
      toast.success("Depot deleted successfully")
      
      // Update the depots list
      setDepots(depots.filter(depot => depot.id !== id))
      
      // Notify parent component
      if (onDepotAdded) {
        onDepotAdded()
      }
    } catch (error) {
      console.error("Failed to delete depot:", error)
      toast.error("Failed to delete depot")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Manage Depots
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Existing Depots</h3>
            <Button 
              className="bg-agriculture-600 hover:bg-agriculture-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Depot
            </Button>
          </div>

          {/* Existing Depots */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading depots...</div>
            ) : depots.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No depots found. Add your first depot to get started.
              </div>
            ) : (
              depots.map((depot) => (
                <Card key={depot.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-agriculture-600" />
                        <div>
                          <h4 className="font-medium">{depot.name}</h4>
                          <p className="text-sm text-muted-foreground">{depot.address}</p>
                          {depot.capacity && (
                            <p className="text-sm text-muted-foreground">Capacity: {depot.capacity}</p>
                          )}
                          {depot.lat && depot.lng && (
                            <p className="text-xs text-muted-foreground">
                              Coordinates: {depot.lat.toFixed(6)}, {depot.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{depot.status || "Active"}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => depot.id && handleDeleteDepot(depot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add New Depot Form */}
          {showAddForm && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-4">Add New Depot</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="depotName">Depot Name *</Label>
                    <Input
                      id="depotName"
                      placeholder="Enter depot name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depotAddress">Address *</Label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={(value) => setFormData({...formData, address: value})}
                      onSelect={handleAddressSelect}
                      placeholder="Enter depot address"
                    />
                    {formData.lat && formData.lng && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Coordinates: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depotCapacity">Capacity</Label>
                    <Input
                      id="depotCapacity"
                      placeholder="Enter capacity"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-agriculture-600 hover:bg-agriculture-700" 
                      onClick={handleAddDepot}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Depot"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
