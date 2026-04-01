"use client"

import { FinanceProvider } from "@/context/finance-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { BalanceChart } from "@/components/dashboard/balance-chart"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { InsightsSection } from "@/components/dashboard/insights-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Receipt, Lightbulb, BarChart3 } from "lucide-react"

export default function DashboardPage() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Track and manage your financial activity
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="inline-flex h-auto w-full flex-wrap gap-1 p-1 sm:w-auto sm:flex-nowrap">
              <TabsTrigger value="overview" className="flex items-center gap-2 px-3 py-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2 px-3 py-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 px-3 py-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 px-3 py-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SummaryCards />
              
              <div className="grid gap-6 lg:grid-cols-3">
                <BalanceChart />
                <SpendingChart />
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
                <TransactionTable />
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <SummaryCards />
              <TransactionTable />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <SummaryCards />
              
              <div className="grid gap-6 lg:grid-cols-3">
                <BalanceChart />
                <SpendingChart />
              </div>
              
              <IncomeExpenseChart />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <SummaryCards />
              <InsightsSection />
              
              <div className="grid gap-6 lg:grid-cols-3">
                <BalanceChart />
                <SpendingChart />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t bg-card py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>FinanceFlow Dashboard - Built with Next.js, React, and Tailwind CSS</p>
            <p className="mt-1">Data persisted in localStorage for demonstration purposes</p>
          </div>
        </footer>
      </div>
    </FinanceProvider>
  )
}
