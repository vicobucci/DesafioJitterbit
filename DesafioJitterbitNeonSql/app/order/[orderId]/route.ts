/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 */

import { NextResponse } from 'next/server'
import { sql, transformOrderInput, transformOrderOutput, type OrderInput } from '@/lib/db'

// GET /order/:orderId - Get order by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Fetch order from database
    const orders = await sql`
      SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = ${orderId}
    `

    if (orders.length === 0) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    // Fetch items for the order
    const items = await sql`
      SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = ${orderId}
    `

    // Transform and return the response
    const response = transformOrderOutput(
      orders[0] as { orderId: string; value: number; creationDate: Date },
      items as { orderId: string; productId: number; quantity: number; price: number }[]
    )

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
    const existingOrder = await sql`
      SELECT "orderId" FROM "Order" WHERE "orderId" = ${orderId}
    `

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    // Transform Portuguese input to English database format
    const { order, items } = transformOrderInput(body)

    // Update order
    await sql`
      UPDATE "Order" 
      SET "value" = ${order.value}, "creationDate" = ${order.creationDate.toISOString()}
      WHERE "orderId" = ${orderId}
    `

    // Delete existing items and insert new ones
    await sql`DELETE FROM "Items" WHERE "orderId" = ${orderId}`

    for (const item of items) {
      await sql`
        INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
        VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price})
      `
    }

    // Fetch the updated order with items
    const updatedOrder = await sql`
      SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = ${orderId}
    `

    const updatedItems = await sql`
      SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = ${orderId}
    `

    // Transform and return the response
    const response = transformOrderOutput(
      updatedOrder[0] as { orderId: string; value: number; creationDate: Date },
      updatedItems as { orderId: string; productId: number; quantity: number; price: number }[]
    )

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
    const existingOrder = await sql`
      SELECT "orderId" FROM "Order" WHERE "orderId" = ${orderId}
    `

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    // Delete items first (due to foreign key constraint)
    await sql`DELETE FROM "Items" WHERE "orderId" = ${orderId}`

    // Delete order
    await sql`DELETE FROM "Order" WHERE "orderId" = ${orderId}`

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
