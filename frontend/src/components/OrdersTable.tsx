
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"

const orders = [
  {
    id: "ORD-1",
    status: "Not Scheduled",
    route: "",
    customer: "",
    address: "chennai",
  },
]

export function OrdersTable() {
  const handleRemoveOrder = (orderId: string) => {
    console.log("Removing order:", orderId)
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ROUTIFIC ID</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ROUTE</TableHead>
            <TableHead>CUSTOMER</TableHead>
            <TableHead>ADDRESS</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="crop-decoration">
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.route}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.address}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveOrder(order.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between p-4 border-t">
        <span className="text-sm text-muted-foreground">1 – 1 of 1</span>
        <Button variant="outline" size="sm">
          1
        </Button>
      </div>
    </div>
  )
}
