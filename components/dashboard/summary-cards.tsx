"use client"

import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function SummaryCards() {
  const { totalBalance, totalIncome, totalExpenses, transactions } = useFinance()

  // Calculate month-over-month changes
  const today = new Date()
  const thisMonth = today.getMonth()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const thisYear = today.getFullYear()
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const lastMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  const thisMonthIncome = thisMonthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const incomeChange = lastMonthIncome ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0

  const thisMonthExpenses = thisMonthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const expenseChange = lastMonthExpenses ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      icon: Wallet,
      change: null,
      description: "Current available balance",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      change: incomeChange,
      description: "vs last month",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      change: expenseChange,
      description: "vs last month",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: savingsRate >= 0 ? ArrowUpRight : ArrowDownRight,
      change: null,
      description: "of total income saved",
      color: savingsRate >= 20 ? "text-success" : savingsRate >= 0 ? "text-warning" : "text-destructive",
      bgColor: savingsRate >= 20 ? "bg-success/10" : savingsRate >= 0 ? "bg-warning/10" : "bg-destructive/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {card.change !== null && (
                <span className={card.change >= 0 ? "text-success" : "text-destructive"}>
                  {card.change >= 0 ? "+" : ""}{card.change.toFixed(1)}%
                </span>
              )}
              <span>{card.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
