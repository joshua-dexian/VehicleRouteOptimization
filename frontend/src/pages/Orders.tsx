import { useState, useEffect, useRef } from "react"
import { TopNavigation } from "@/components/TopNavigation"
import { OrdersList } from "@/components/OrdersList"
import { DepotManagementDialog } from "@/components/DepotManagementDialog"
import { AddOrderDialog } from "@/components/AddOrderDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus } from "lucide-react"
import { depotsAPI, Depot } from "@/services/api"
import { toast } from "sonner"

const Orders = () => {
  const [showDepotManagement, setShowDepotManagement] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const ordersListRef = useRef<{ fetchOrders: () => Promise<void> } | null>(null)

  const fetchDepots = async () => {
    try {
      setLoading(true)
      const data = await depotsAPI.getAll()
      setDepots(data)
    } catch (error) {
      console.error("Failed to fetch depots:", error)
      toast.error("Failed to fetch depots")
      // Use empty array if API fails
      setDepots([])
    } finally {
      setLoading(false)
    }
  }

  const handleOrderAdded = () => {
    // Refresh orders list when a new order is added
    if (ordersListRef.current) {
      ordersListRef.current.fetchOrders()
    }
  }

  useEffect(() => {
    fetchDepots()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation
        title="Orders"
        actionButton={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowDepotManagement(true)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Manage Depots
            </Button>
            <Button 
              className="bg-agriculture-600 hover:bg-agriculture-700"
              onClick={() => setShowAddOrder(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6">
        {/* Depots Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-agriculture-600" />
              Available Depots
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading depots...</div>
            ) : depots.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No depots found. Add depots to manage your distribution centers.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {depots.map((depot) => (
                  <div key={depot.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-agriculture-600" />
                      <div>
                        <h4 className="font-medium">{depot.name}</h4>
                        <p className="text-sm text-muted-foreground">{depot.address}</p>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                          depot.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {depot.status || "Active"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders List */}
        <OrdersList ref={ordersListRef} />
      </div>

      <DepotManagementDialog 
        open={showDepotManagement} 
        onOpenChange={setShowDepotManagement} 
        onDepotAdded={fetchDepots}
      />
      
      <AddOrderDialog
        open={showAddOrder}
        onOpenChange={setShowAddOrder}
        onOrderAdded={handleOrderAdded}
      />
    </div>
  )
}

export default Orders
