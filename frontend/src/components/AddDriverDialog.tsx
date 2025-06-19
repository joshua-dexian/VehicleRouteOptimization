import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { driversAPI } from "@/services/api"
import { toast } from "sonner"

interface AddDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddDriverDialog({ open, onOpenChange, onSuccess }: AddDriverDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    experience: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }
    
    try {
      setIsLoading(true)
      await driversAPI.create(formData)
      toast.success("Driver added successfully")
      onOpenChange(false)
      setFormData({ name: "", email: "", phone: "", license_number: "", experience: "" })
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error adding driver:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add driver")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Driver
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driverName">Driver Name *</Label>
            <Input
              id="driverName"
              placeholder="Enter driver name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverEmail">Email *</Label>
            <Input
              id="driverEmail"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverPhone">Phone</Label>
            <Input
              id="driverPhone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              placeholder="Enter license number"
              value={formData.license_number}
              onChange={(e) => setFormData({...formData, license_number: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              placeholder="Enter years of experience"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              className="bg-agriculture-600 hover:bg-agriculture-700" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Driver"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
