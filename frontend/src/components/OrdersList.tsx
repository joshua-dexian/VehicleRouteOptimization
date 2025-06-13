import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, MapPin, Phone, Mail, FileText, Clock, Package } from "lucide-react"
import { ordersAPI, Order } from "@/services/api"
import { toast } from "sonner"

export interface OrdersListRef {
  fetchOrders: () => Promise<void>
}

export const OrdersList = forwardRef<OrdersListRef>((props, ref) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersAPI.getAll()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  // Expose fetchOrders method to parent components
  useImperativeHandle(ref, () => ({
    fetchOrders
  }));

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return
    }

    try {
      await ordersAPI.delete(id)
      toast.success("Order deleted successfully")
      // Update the orders list
      setOrders(orders.filter(order => order.id !== id))
    } catch (error) {
      console.error("Failed to delete order:", error)
      toast.error("Failed to delete order")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-agriculture-600" />
          Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found. Add your first order to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-blue-50 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">
                          {order.order_number ? `#${order.order_number}` : "Order"}
                        </h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => order.id && handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm">{order.address}</p>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {order.customer_name && (
                      <div className="text-sm">
                        <span className="font-medium">Customer:</span> {order.customer_name}
                      </div>
                    )}
                    
                    {order.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {order.phone}
                      </div>
                    )}
                    
                    {order.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {order.email}
                      </div>
                    )}
                    
                    {(order.start_time || order.end_time) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {order.start_time && order.end_time 
                          ? `${order.start_time} - ${order.end_time}`
                          : order.start_time || order.end_time
                        }
                      </div>
                    )}
                    
                    {order.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="flex-1">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}) 