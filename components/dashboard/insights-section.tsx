"use client"

import { useFinance, Category } from "@/context/finance-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ArrowUp, ArrowDown } from "lucide-react"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface Insight {
  title: string
  description: string
  value: string
  icon: typeof TrendingUp
  type: "positive" | "negative" | "neutral" | "warning"
}

export function InsightsSection() {
  const { transactions } = useFinance()

  const insights = useMemo(() => {
    const result: Insight[] = []
    const today = new Date()
    const thisMonth = today.getMonth()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const thisYear = today.getFullYear()
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    // Filter transactions for this month and last month
    const thisMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })

    const lastMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    })

    // Calculate expense totals by category
    const expensesByCategory = new Map<Category, number>()
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const current = expensesByCategory.get(t.category) || 0
        expensesByCategory.set(t.category, current + t.amount)
      })

    // Highest spending category
    let highestCategory: Category | null = null
    let highestAmount = 0
    expensesByCategory.forEach((amount, category) => {
      if (amount > highestAmount) {
        highestAmount = amount
        highestCategory = category
      }
    })

    if (highestCategory) {
      result.push({
        title: "Top Spending Category",
        description: `${highestCategory} is your highest expense category`,
        value: formatCurrency(highestAmount),
        icon: TrendingUp,
        type: "neutral"
      })
    }

    // Monthly comparison - expenses
    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    if (lastMonthExpenses > 0) {
      const expenseChange = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      result.push({
        title: "Monthly Expense Change",
        description: expenseChange > 0 
          ? "Your spending increased compared to last month"
          : "Your spending decreased compared to last month",
        value: `${expenseChange > 0 ? "+" : ""}${expenseChange.toFixed(1)}%`,
        icon: expenseChange > 0 ? ArrowUp : ArrowDown,
        type: expenseChange > 0 ? "warning" : "positive"
      })
    }

    // Monthly comparison - income
    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    if (lastMonthIncome > 0) {
      const incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
      result.push({
        title: "Monthly Income Change",
        description: incomeChange > 0 
          ? "Your income increased compared to last month"
          : "Your income decreased compared to last month",
        value: `${incomeChange > 0 ? "+" : ""}${incomeChange.toFixed(1)}%`,
        icon: incomeChange > 0 ? TrendingUp : TrendingDown,
        type: incomeChange > 0 ? "positive" : "negative"
      })
    }

    // Average transaction size
    const avgExpense = transactions.filter(t => t.type === "expense")
    const avgAmount = avgExpense.length > 0 
      ? avgExpense.reduce((sum, t) => sum + t.amount, 0) / avgExpense.length 
      : 0

    if (avgAmount > 0) {
      result.push({
        title: "Average Transaction",
        description: "Your typical expense amount",
        value: formatCurrency(avgAmount),
        icon: Lightbulb,
        type: "neutral"
      })
    }

    // Savings warning
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    if (savingsRate < 20 && totalIncome > 0) {
      result.push({
        title: "Low Savings Alert",
        description: `Consider reducing expenses to improve your ${savingsRate.toFixed(1)}% savings rate`,
        value: "Below 20%",
        icon: AlertTriangle,
        type: "warning"
      })
    }

    // Transaction frequency
    const daysSinceFirst = transactions.length > 0
      ? Math.ceil((today.getTime() - new Date(transactions[transactions.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    if (daysSinceFirst > 0) {
      const avgTransactionsPerWeek = (transactions.length / daysSinceFirst) * 7
      result.push({
        title: "Transaction Frequency",
        description: "Average transactions per week",
        value: avgTransactionsPerWeek.toFixed(1),
        icon: Lightbulb,
        type: "neutral"
      })
    }

    return result.slice(0, 6)
  }, [transactions])

  const getTypeStyles = (type: Insight["type"]) => {
    switch (type) {
      case "positive":
        return "bg-success/10 text-success"
      case "negative":
        return "bg-destructive/10 text-destructive"
      case "warning":
        return "bg-warning/10 text-warning-foreground"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Insights</CardTitle>
        <CardDescription>Key observations from your financial data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="rounded-lg border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${getTypeStyles(insight.type)}`}>
                  <insight.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  <p className="text-lg font-bold">{insight.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
