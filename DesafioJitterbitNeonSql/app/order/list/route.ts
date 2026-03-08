/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 */

import { NextResponse } from 'next/server'
import { sql, transformOrderOutput } from '@/lib/db'

// GET /order/list - List all orders
export async function GET() {
  try {
    // Fetch all orders from database
    const orders = await sql`
      SELECT "orderId", "value", "creationDate" FROM "Order" ORDER BY "creationDate" DESC
    `

    // Fetch all items
    const items = await sql`
      SELECT "orderId", "productId", "quantity", "price" FROM "Items"
    `

    // Group items by orderId
    const itemsByOrder = (items as { orderId: string; productId: number; quantity: number; price: number }[])
      .reduce((acc, item) => {
        if (!acc[item.orderId]) {
          acc[item.orderId] = []
        }
        acc[item.orderId].push(item)
        return acc
      }, {} as Record<string, { orderId: string; productId: number; quantity: number; price: number }[]>)

    // Transform each order with its items
    const response = (orders as { orderId: string; value: number; creationDate: Date }[]).map((order) => 
      transformOrderOutput(order, itemsByOrder[order.orderId] || [])
    )

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error listing orders:', error)
    return NextResponse.json(
      { error: 'Internal server error while listing orders' },
      { status: 500 }
    )
  }
}
