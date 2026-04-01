"use client"

import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type TimeRange = "7d" | "30d" | "90d" | "180d"

export function BalanceChart() {
  const { transactions } = useFinance()
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 180
    const today = new Date()
    const data: { date: string; balance: number; income: number; expenses: number }[] = []

    // Group transactions by date
    const transactionsByDate = new Map<string, { income: number; expenses: number }>()
    
    transactions.forEach(t => {
      const existing = transactionsByDate.get(t.date) || { income: 0, expenses: 0 }
      if (t.type === "income") {
        existing.income += t.amount
      } else {
        existing.expenses += t.amount
      }
      transactionsByDate.set(t.date, existing)
    })

    // Calculate running balance for each day
    let runningBalance = 0
    
    // First, calculate the initial balance (from transactions before our range)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - days)
    
    transactions.forEach(t => {
      const transactionDate = new Date(t.date)
      if (transactionDate < startDate) {
        runningBalance += t.type === "income" ? t.amount : -t.amount
      }
    })

    // Then build the chart data
    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      
      const dayData = transactionsByDate.get(dateStr) || { income: 0, expenses: 0 }
      runningBalance += dayData.income - dayData.expenses
      
      data.push({
        date: dateStr,
        balance: runningBalance,
        income: dayData.income,
        expenses: dayData.expenses
      })
    }

    return data
  }, [transactions, timeRange])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Balance Trend</CardTitle>
          <CardDescription>Your balance over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="180d">Last 180 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
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
                        <p className="mb-2 text-sm font-medium text-card-foreground">{formatDate(label)}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Balance: <span className="font-medium text-primary">{formatCurrency(payload[0].value as number)}</span>
                          </p>
                        </div>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
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
