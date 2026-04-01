"use client"

import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts"

export function IncomeExpenseChart() {
  const { transactions } = useFinance()

  const chartData = useMemo(() => {
    const monthlyData = new Map<string, { income: number; expenses: number }>()
    
    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const existing = monthlyData.get(monthKey) || { income: 0, expenses: 0 }
      
      if (t.type === "income") {
        existing.income += t.amount
      } else {
        existing.expenses += t.amount
      }
      
      monthlyData.set(monthKey, existing)
    })

    return Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, data]) => {
        const [year, monthNum] = month.split("-")
        const date = new Date(parseInt(year), parseInt(monthNum) - 1)
        return {
          month: date.toLocaleDateString("en-US", { month: "short" }),
          income: data.income,
          expenses: data.expenses,
          net: data.income - data.expenses
        }
      })
  }, [transactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Monthly comparison over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  width={60}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="mb-2 text-sm font-medium text-card-foreground">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Income: </span>
                            <span className="font-medium text-success">{formatCurrency(payload[0]?.value as number || 0)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Expenses: </span>
                            <span className="font-medium text-destructive">{formatCurrency(payload[1]?.value as number || 0)}</span>
                          </p>
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
                <Bar 
                  dataKey="income" 
                  name="Income"
                  fill="var(--color-success)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Expenses"
                  fill="var(--color-destructive)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
