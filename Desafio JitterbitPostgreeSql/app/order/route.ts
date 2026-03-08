/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 */

import { NextResponse } from 'next/server'
import { query, queryOne, transformOrderInput, transformOrderOutput, type OrderInput, type DbOrder, type DbItem } from '@/lib/db'

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
    const existingOrder = await queryOne<DbOrder>(
      'SELECT "orderId" FROM "Order" WHERE "orderId" = $1',
      [order.orderId]
    )

    if (existingOrder) {
      return NextResponse.json(
        { error: `Order with ID ${order.orderId} already exists` },
        { status: 409 }
      )
    }

    // Insert order into database
    await query(
      'INSERT INTO "Order" ("orderId", "value", "creationDate") VALUES ($1, $2, $3)',
      [order.orderId, order.value, order.creationDate.toISOString()]
    )

    // Insert items into database
    for (const item of items) {
      await query(
        'INSERT INTO "Items" ("orderId", "productId", "quantity", "price") VALUES ($1, $2, $3, $4)',
        [item.orderId, item.productId, item.quantity, item.price]
      )
    }

    // Fetch the created order with items
    const createdOrder = await queryOne<DbOrder>(
      'SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = $1',
      [order.orderId]
    )

    const createdItems = await query<DbItem>(
      'SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = $1',
      [order.orderId]
    )

    // Transform and return the response
    const response = transformOrderOutput(createdOrder!, createdItems)

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error while creating order' },
      { status: 500 }
    )
  }
}
