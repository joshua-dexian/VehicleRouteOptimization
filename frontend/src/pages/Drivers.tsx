import { useState, useEffect } from "react"
import { TopNavigation } from "@/components/TopNavigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AddDriverDialog } from "@/components/AddDriverDialog"
import { AddVehicleDialog } from "@/components/AddVehicleDialog"
import { Users, Truck, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { driversAPI, vehiclesAPI, Driver, Vehicle } from "@/services/api"
import { toast } from "sonner"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  
  const [deleteDriverId, setDeleteDriverId] = useState<number | null>(null)
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [driversData, vehiclesData] = await Promise.all([
        driversAPI.getAll(),
        vehiclesAPI.getAll()
      ])
      
      setDrivers(driversData)
      setVehicles(vehiclesData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data. Please try again.")
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const handleDeleteDriver = async () => {
    if (!deleteDriverId) return
    
    setIsDeleting(true)
    try {
      await driversAPI.delete(deleteDriverId)
      setDrivers(drivers.filter(driver => driver.id !== deleteDriverId))
      toast.success("Driver deleted successfully")
    } catch (err) {
      console.error("Error deleting driver:", err)
      toast.error("Failed to delete driver")
    } finally {
      setIsDeleting(false)
      setDeleteDriverId(null)
    }
  }
  
  const handleDeleteVehicle = async () => {
    if (!deleteVehicleId) return
    
    setIsDeleting(true)
    try {
      await vehiclesAPI.delete(deleteVehicleId)
      setVehicles(vehicles.filter(vehicle => vehicle.id !== deleteVehicleId))
      toast.success("Vehicle deleted successfully")
    } catch (err) {
      console.error("Error deleting vehicle:", err)
      toast.error("Failed to delete vehicle")
    } finally {
      setIsDeleting(false)
      setDeleteVehicleId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation
        title="Drivers & Vehicles"
        actionButton={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowAddVehicle(true)}
            >
              <Truck className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
            <Button 
              className="bg-agriculture-600 hover:bg-agriculture-700"
              onClick={() => setShowAddDriver(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-agriculture-600" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
              <p className="text-lg font-medium">{error}</p>
              <Button 
                onClick={fetchData} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Drivers Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-agriculture-600" />
                  Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {drivers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No drivers found. Add a driver to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {drivers.map((driver) => (
                      <Card key={driver.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-agriculture-100 text-agriculture-700">
                                  {driver.name ? driver.name[0].toUpperCase() : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{driver.name}</h3>
                                <p className="text-sm text-muted-foreground">{driver.email}</p>
                                {driver.phone && (
                                  <p className="text-xs text-muted-foreground">{driver.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="crop-decoration">
                                Active
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteDriverId(driver.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicles Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-agriculture-600" />
                  Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No vehicles found. Add a vehicle to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <Card key={vehicle.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-agriculture-100 rounded-lg">
                                <Truck className="h-5 w-5 text-agriculture-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{vehicle.plate_number}</h3>
                                <p className="text-sm text-muted-foreground">{vehicle.type} {vehicle.capacity && `- ${vehicle.capacity}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                Available
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteVehicleId(vehicle.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <AddDriverDialog 
        open={showAddDriver} 
        onOpenChange={setShowAddDriver} 
        onSuccess={fetchData}
      />
      <AddVehicleDialog 
        open={showAddVehicle} 
        onOpenChange={setShowAddVehicle}
        onSuccess={fetchData}
      />
      
      {/* Delete Driver Confirmation */}
      <AlertDialog open={deleteDriverId !== null} onOpenChange={() => setDeleteDriverId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this driver? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDriver}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Vehicle Confirmation */}
      <AlertDialog open={deleteVehicleId !== null} onOpenChange={() => setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Drivers
