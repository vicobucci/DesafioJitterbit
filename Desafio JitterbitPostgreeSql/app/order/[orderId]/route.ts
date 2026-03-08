/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 */

import { NextResponse } from 'next/server'
import { query, queryOne, transformOrderInput, transformOrderOutput, type OrderInput, type DbOrder, type DbItem } from '@/lib/db'

// GET /order/:orderId - Get order by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Fetch order from database
    const order = await queryOne<DbOrder>(
      'SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = $1',
      [orderId]
    )

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    // Fetch items for the order
    const items = await query<DbItem>(
      'SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = $1',
      [orderId]
    )

    // Transform and return the response
    const response = transformOrderOutput(order, items)

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching order' },
      { status: 500 }
    )
  }
}

// PUT /order/:orderId - Update order by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body: OrderInput = await request.json()

    // Check if order exists
    const existingOrder = await queryOne<DbOrder>(
      'SELECT "orderId" FROM "Order" WHERE "orderId" = $1',
      [orderId]
    )

    if (!existingOrder) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    // Transform Portuguese input to English database format
    const { order, items } = transformOrderInput(body)

    // Update order
    await query(
      'UPDATE "Order" SET "value" = $1, "creationDate" = $2 WHERE "orderId" = $3',
      [order.value, order.creationDate.toISOString(), orderId]
    )

    // Delete existing items and insert new ones
    await query('DELETE FROM "Items" WHERE "orderId" = $1', [orderId])

    for (const item of items) {
      await query(
        'INSERT INTO "Items" ("orderId", "productId", "quantity", "price") VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.price]
      )
    }

    // Fetch the updated order with items
    const updatedOrder = await queryOne<DbOrder>(
      'SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = $1',
      [orderId]
    )

    const updatedItems = await query<DbItem>(
      'SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = $1',
      [orderId]
    )

    // Transform and return the response
    const response = transformOrderOutput(updatedOrder!, updatedItems)

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating order' },
      { status: 500 }
    )
  }
}

// DELETE /order/:orderId - Delete order by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Check if order exists
    const existingOrder = await queryOne<DbOrder>(
      'SELECT "orderId" FROM "Order" WHERE "orderId" = $1',
      [orderId]
    )

    if (!existingOrder) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    // Delete items first (due to foreign key constraint)
    await query('DELETE FROM "Items" WHERE "orderId" = $1', [orderId])

    // Delete order
    await query('DELETE FROM "Order" WHERE "orderId" = $1', [orderId])

    return NextResponse.json(
      { message: `Order ${orderId} deleted successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Internal server error while deleting order' },
      { status: 500 }
    )
  }
}
