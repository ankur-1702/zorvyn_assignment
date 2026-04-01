"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

export type Role = "viewer" | "admin"
export type TransactionType = "income" | "expense"
export type Category = 
  | "Salary" 
  | "Freelance" 
  | "Investments" 
  | "Food & Dining" 
  | "Transportation" 
  | "Shopping" 
  | "Entertainment" 
  | "Bills & Utilities" 
  | "Healthcare" 
  | "Education"
  | "Other"

export interface Transaction {
  id: string
  date: string
  amount: number
  category: Category
  type: TransactionType
  description: string
}

interface FinanceContextType {
  role: Role
  setRole: (role: Role) => void
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  editTransaction: (id: string, transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  filters: {
    search: string
    type: TransactionType | "all"
    category: Category | "all"
    sortBy: "date" | "amount"
    sortOrder: "asc" | "desc"
  }
  setFilters: (filters: Partial<FinanceContextType["filters"]>) => void
  filteredTransactions: Transaction[]
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// Mock data generator
const generateMockTransactions = (): Transaction[] => {
  const incomeCategories: Category[] = ["Salary", "Freelance", "Investments"]
  const expenseCategories: Category[] = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment", 
    "Bills & Utilities", "Healthcare", "Education", "Other"
  ]
  
  const transactions: Transaction[] = []
  const today = new Date()
  
  // Generate transactions for the past 6 months
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 180)
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    
    const isIncome = Math.random() > 0.7
    const type: TransactionType = isIncome ? "income" : "expense"
    const category = isIncome 
      ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
      : expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
    
    const amount = isIncome 
      ? Math.floor(Math.random() * 5000) + 1000
      : Math.floor(Math.random() * 500) + 20
    
    const descriptions: Record<Category, string[]> = {
      "Salary": ["Monthly salary", "Bonus payment", "Overtime pay"],
      "Freelance": ["Web development project", "Consulting work", "Design commission"],
      "Investments": ["Dividend payment", "Stock sale", "Interest income"],
      "Food & Dining": ["Grocery shopping", "Restaurant dinner", "Coffee shop", "Takeout order"],
      "Transportation": ["Gas station", "Uber ride", "Bus pass", "Car maintenance"],
      "Shopping": ["Amazon purchase", "Clothing store", "Electronics", "Home supplies"],
      "Entertainment": ["Netflix subscription", "Movie tickets", "Concert tickets", "Gaming"],
      "Bills & Utilities": ["Electricity bill", "Internet service", "Phone bill", "Water bill"],
      "Healthcare": ["Doctor visit", "Pharmacy", "Gym membership", "Health insurance"],
      "Education": ["Online course", "Books", "Tuition fee", "Learning subscription"],
      "Other": ["Miscellaneous", "Gift purchase", "Donation", "Pet supplies"]
    }
    
    transactions.push({
      id: `txn-${i + 1}`,
      date: date.toISOString().split("T")[0],
      amount,
      category,
      type,
      description: descriptions[category][Math.floor(Math.random() * descriptions[category].length)]
    })
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const STORAGE_KEY = "finance-dashboard-data"

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [filters, setFiltersState] = useState<FinanceContextType["filters"]>({
    search: "",
    type: "all",
    category: "all",
    sortBy: "date",
    sortOrder: "desc"
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setTransactions(parsed.transactions || generateMockTransactions())
        setRole(parsed.role || "admin")
      } catch {
        setTransactions(generateMockTransactions())
      }
    } else {
      setTransactions(generateMockTransactions())
    }

    // Check for dark mode preference
    const darkModePreference = localStorage.getItem("dark-mode")
    if (darkModePreference === "true") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, role }))
    }
  }, [transactions, role])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem("dark-mode", String(newValue))
      if (newValue) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      return newValue
    })
  }, [])

  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn-${Date.now()}`
    }
    setTransactions(prev => [newTransaction, ...prev])
  }, [])

  const editTransaction = useCallback((id: string, transaction: Omit<Transaction, "id">) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...transaction, id } : t)
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const setFilters = useCallback((newFilters: Partial<FinanceContextType["filters"]>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         t.category.toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = filters.type === "all" || t.type === filters.type
    const matchesCategory = filters.category === "all" || t.category === filters.category
    return matchesSearch && matchesType && matchesCategory
  }).sort((a, b) => {
    const multiplier = filters.sortOrder === "desc" ? -1 : 1
    if (filters.sortBy === "date") {
      return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    return multiplier * (a.amount - b.amount)
  })

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpenses

  return (
    <FinanceContext.Provider value={{
      role,
      setRole,
      transactions,
      addTransaction,
      editTransaction,
      deleteTransaction,
      filters,
      setFilters,
      filteredTransactions,
      totalBalance,
      totalIncome,
      totalExpenses,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
