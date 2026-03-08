/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 */

import { NextResponse } from 'next/server'
import { sql, transformOrderInput, transformOrderOutput, type OrderInput } from '@/lib/db'

// POST /order - Create a new order
export async function POST(request: Request) {
  try {
    const body: OrderInput = await request.json()

    // Validate required fields
    if (!body.numeroPedido || body.valorTotal === undefined || !body.dataCriacao || !body.items) {
      return NextResponse.json(
        { error: 'Missing required fields: numeroPedido, valorTotal, dataCriacao, items' },
        { status: 400 }
      )
    }

    // Transform Portuguese input to English database format
    const { order, items } = transformOrderInput(body)

    // Check if order already exists
    const existingOrder = await sql`
      SELECT "orderId" FROM "Order" WHERE "orderId" = ${order.orderId}
    `

    if (existingOrder.length > 0) {
      return NextResponse.json(
        { error: `Order with ID ${order.orderId} already exists` },
        { status: 409 }
      )
    }

    // Insert order into database
    await sql`
      INSERT INTO "Order" ("orderId", "value", "creationDate")
      VALUES (${order.orderId}, ${order.value}, ${order.creationDate.toISOString()})
    `

    // Insert items into database
    for (const item of items) {
      await sql`
        INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
        VALUES (${item.orderId}, ${item.productId}, ${item.quantity}, ${item.price})
      `
    }

    // Fetch the created order with items
    const createdOrder = await sql`
      SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = ${order.orderId}
    `

    const createdItems = await sql`
      SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = ${order.orderId}
    `

    // Transform and return the response
    const response = transformOrderOutput(
      createdOrder[0] as { orderId: string; value: number; creationDate: Date },
      createdItems as { orderId: string; productId: number; quantity: number; price: number }[]
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error while creating order' },
      { status: 500 }
    )
  }
}
