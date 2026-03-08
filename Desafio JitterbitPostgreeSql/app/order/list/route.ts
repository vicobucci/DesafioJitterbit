/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 */

import { NextResponse } from 'next/server'
import { query, transformOrderOutput, type DbOrder, type DbItem } from '@/lib/db'

// GET /order/list - List all orders
export async function GET() {
  try {
    // Fetch all orders from database
    const orders = await query<DbOrder>(
      'SELECT "orderId", "value", "creationDate" FROM "Order" ORDER BY "creationDate" DESC'
    )

    // Fetch all items
    const items = await query<DbItem>(
      'SELECT "orderId", "productId", "quantity", "price" FROM "Items"'
    )

    // Group items by orderId
    const itemsByOrder = items.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = []
      }
      acc[item.orderId].push(item)
      return acc
    }, {} as Record<string, DbItem[]>)

    // Transform each order with its items
    const response = orders.map((order) => 
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
