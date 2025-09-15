"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, DollarSign, Calendar, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Order {
  _id: string
  customerId: string
  customerName?: string
  customerEmail?: string
  orderDate: string
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
}

interface Customer {
  _id: string
  name: string
  email: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    totalAmount: 0,
    status: "pending" as const,
    items: [{ productName: "", quantity: 1, price: 0 }],
  })

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setOrders(data)
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders)
        } else {
          console.warn("API response is not an array:", data)
          setOrders([])
          toast({
            title: "Warning",
            description: "Unexpected data format from server",
            variant: "destructive",
          })
        }
      } else {
        console.error("Failed to fetch orders, status:", response.status)
        setOrders([])
        toast({
          title: "Error",
          description: `Failed to fetch orders (${response.status})`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setCustomers(data)
        } else if (data && Array.isArray(data.customers)) {
          setCustomers(data.customers)
        } else {
          console.warn("Customers API response is not an array:", data)
          setCustomers([])
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      setCustomers([])
    }
  }

  const handleCreateOrder = async () => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      })

      if (response.ok) {
        const result = await response.json()
        const createdOrder = result.order || result
        setOrders([createdOrder, ...orders])
        setIsDialogOpen(false)
        setNewOrder({
          customerId: "",
          totalAmount: 0,
          status: "pending",
          items: [{ productName: "", quantity: 1, price: 0 }],
        })
        toast({
          title: "Success",
          description: "Order created successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || error.message || "Failed to create order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      })
    }
  }

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productName: "", quantity: 1, price: 0 }],
    })
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = newOrder.items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
    setNewOrder({
      ...newOrder,
      items: updatedItems,
      totalAmount,
    })
  }

  const removeOrderItem = (index: number) => {
    if (newOrder.items.length > 1) {
      const updatedItems = newOrder.items.filter((_, i) => i !== index)
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
      setNewOrder({
        ...newOrder,
        items: updatedItems,
        totalAmount,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage customer orders and track fulfillment</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>Add a new order for a customer</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={newOrder.customerId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newOrder.status}
                    onValueChange={(value: any) => setNewOrder({ ...newOrder, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Order Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2 p-3 border rounded">
                      <div className="flex-1">
                        <Input
                          placeholder="Product name"
                          value={item.productName}
                          onChange={(e) => updateOrderItem(index, "productName", e.target.value)}
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      {newOrder.items.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeOrderItem(index)}>
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <Label className="text-lg font-semibold">Total: ₹{newOrder.totalAmount.toFixed(2)}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={!newOrder.customerId || newOrder.items.some((item) => !item.productName)}
                >
                  Create Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm ? "No orders match your search criteria." : "Get started by creating your first order."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Order
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {order.customerName || "Unknown Customer"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-1 mt-2 text-lg font-semibold">
                        <DollarSign className="h-4 w-4" />₹{order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Order Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span>{item.productName}</span>
                        <span className="text-gray-600">
                          {item.quantity} × ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
