"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const endpoints = [
  {
    method: "POST",
    path: "/order",
    description: "Create a new order",
    required: true,
    requestBody: `{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}`,
    responseBody: `{
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}`,
    curl: `curl --location 'http://localhost:3000/order' \\
--header 'Content-Type: application/json' \\
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'`,
  },
  {
    method: "GET",
    path: "/order/:orderId",
    description: "Get order by ID",
    required: true,
    requestBody: null,
    responseBody: `{
  "orderId": "v10089016vdb",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}`,
    curl: `curl --location 'http://localhost:3000/order/v10089016vdb'`,
  },
  {
    method: "GET",
    path: "/order/list",
    description: "List all orders",
    required: false,
    requestBody: null,
    responseBody: `[
  {
    "orderId": "v10089016vdb",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
]`,
    curl: `curl --location 'http://localhost:3000/order/list'`,
  },
  {
    method: "PUT",
    path: "/order/:orderId",
    description: "Update order by ID",
    required: false,
    requestBody: `{
  "numeroPedido": "v10089016vdb",
  "valorTotal": 15000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "5678",
      "quantidadeItem": 2,
      "valorItem": 7500
    }
  ]
}`,
    responseBody: `{
  "orderId": "v10089016vdb",
  "value": 15000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 5678,
      "quantity": 2,
      "price": 7500
    }
  ]
}`,
    curl: `curl --location --request PUT 'http://localhost:3000/order/v10089016vdb' \\
--header 'Content-Type: application/json' \\
--data '{
  "numeroPedido": "v10089016vdb",
  "valorTotal": 15000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "5678",
      "quantidadeItem": 2,
      "valorItem": 7500
    }
  ]
}'`,
  },
  {
    method: "DELETE",
    path: "/order/:orderId",
    description: "Delete order by ID",
    required: false,
    requestBody: null,
    responseBody: `{
  "message": "Order v10089016vdb deleted successfully"
}`,
    curl: `curl --location --request DELETE 'http://localhost:3000/order/v10089016vdb'`,
  },
]

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
}

const fieldMapping = [
  { input: "numeroPedido", output: "orderId", description: "Order identifier" },
  { input: "valorTotal", output: "value", description: "Total order value" },
  { input: "dataCriacao", output: "creationDate", description: "Order creation date" },
  { input: "idItem", output: "productId", description: "Product identifier" },
  { input: "quantidadeItem", output: "quantity", description: "Item quantity" },
  { input: "valorItem", output: "price", description: "Item price" },
]

export function ApiDocumentation() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Desafio Jitterbit
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
          API RESTful para gerenciamento de pedidos com transformacao automatica de campos
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Feito por Vinicius Cobucci
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Field Mapping</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input to Database Transformation</CardTitle>
            <CardDescription>
              The API automatically transforms Portuguese field names to English when storing data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Input Field (PT)</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Output Field (EN)</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldMapping.map((field, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <code className="bg-muted px-2 py-1 rounded text-sm">{field.input}</code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-muted px-2 py-1 rounded text-sm">{field.output}</code>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => setExpandedEndpoint(expandedEndpoint === index ? null : index)}
              >
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <Badge variant="outline" className={methodColors[endpoint.method]}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                  <div className="flex items-center gap-2">
                    {endpoint.required ? (
                      <Badge variant="secondary">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                    <span className="text-muted-foreground text-sm">
                      {expandedEndpoint === index ? "−" : "+"}
                    </span>
                  </div>
                </CardHeader>
              </button>
              
              {expandedEndpoint === index && (
                <CardContent className="pt-0 pb-6">
                  <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                  
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      {endpoint.requestBody && <TabsTrigger value="request">Request</TabsTrigger>}
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="curl" className="mt-4">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.curl}</code>
                      </pre>
                    </TabsContent>
                    
                    {endpoint.requestBody && (
                      <TabsContent value="request" className="mt-4">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{endpoint.requestBody}</code>
                        </pre>
                      </TabsContent>
                    )}
                    
                    <TabsContent value="response" className="mt-4">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.responseBody}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Database Schema</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">orderId</code>
                  <span className="text-muted-foreground">VARCHAR(100) PK</span>
                </li>
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">value</code>
                  <span className="text-muted-foreground">DECIMAL(10,2)</span>
                </li>
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">creationDate</code>
                  <span className="text-muted-foreground">TIMESTAMP</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">orderId</code>
                  <span className="text-muted-foreground">VARCHAR(100) PK/FK</span>
                </li>
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">productId</code>
                  <span className="text-muted-foreground">INTEGER PK</span>
                </li>
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">quantity</code>
                  <span className="text-muted-foreground">INTEGER</span>
                </li>
                <li className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">price</code>
                  <span className="text-muted-foreground">DECIMAL(10,2)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>Desafio Jitterbit - Feito por Vinicius Cobucci</p>
      </footer>
    </div>
  )
}
