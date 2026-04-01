"use client"

import { useFinance, Category } from "@/context/finance-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
  "var(--color-muted-foreground)",
  "var(--color-accent)"
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function SpendingChart() {
  const { transactions } = useFinance()

  const chartData = useMemo(() => {
    const expensesByCategory = new Map<Category, number>()
    
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const current = expensesByCategory.get(t.category) || 0
        expensesByCategory.set(t.category, current + t.amount)
      })

    return Array.from(expensesByCategory.entries())
      .map(([category, amount]) => ({ name: category, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [transactions])

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
        <CardDescription>Expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    const percentage = ((data.value / total) * 100).toFixed(1)
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="font-medium text-card-foreground">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.value)} ({percentage}%)
                        </p>
                      </div>
                    )
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: "12px", paddingLeft: "10px" }}
                  formatter={(value: string, entry) => {
                    const data = entry.payload as { value: number }
                    const percentage = ((data.value / total) * 100).toFixed(0)
                    return (
                      <span className="text-foreground">
                        {value} ({percentage}%)
                      </span>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
