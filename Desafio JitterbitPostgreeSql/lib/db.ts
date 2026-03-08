/**
 * Desafio Jitterbit - Order Management API
 * Feito por Vinicius Cobucci
 * 
 * Database connection and transformation utilities
 * 
 * Suporta qualquer banco PostgreSQL (Neon, Supabase, local, Docker, etc.)
 * Basta configurar a variavel DATABASE_URL
 */

import { Pool } from 'pg'

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
})

// Helper function to execute SQL queries
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

// Helper function to execute single row queries
export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params)
  return (result.rows[0] as T) || null
}

// Type definitions for database entities (camelCase to match new schema)
export interface DbOrder {
  orderId: string
  value: number
  creationDate: Date
}

export interface DbItem {
  orderId: string
  productId: number
  quantity: number
  price: number
}

// Type definitions for API request/response (Portuguese input)
export interface OrderInput {
  numeroPedido: string
  valorTotal: number
  dataCriacao: string
  items: ItemInput[]
}

export interface ItemInput {
  idItem: string
  quantidadeItem: number
  valorItem: number
}

// Type definitions for transformed data (English output)
export interface OrderOutput {
  orderId: string
  value: number
  creationDate: string
  items: ItemOutput[]
}

export interface ItemOutput {
  productId: number
  quantity: number
  price: number
}

// Transform functions: Portuguese input -> English database format
export function transformOrderInput(input: OrderInput): { order: DbOrder; items: DbItem[] } {
  const order: DbOrder = {
    orderId: input.numeroPedido,
    value: input.valorTotal,
    creationDate: new Date(input.dataCriacao),
  }

  const items: DbItem[] = input.items.map((item) => ({
    orderId: input.numeroPedido,
    productId: parseInt(item.idItem, 10),
    quantity: item.quantidadeItem,
    price: item.valorItem,
  }))

  return { order, items }
}

// Transform functions: Database format -> English output
export function transformOrderOutput(order: DbOrder, items: DbItem[]): OrderOutput {
  return {
    orderId: order.orderId,
    value: Number(order.value),
    creationDate: new Date(order.creationDate).toISOString(),
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }
}
