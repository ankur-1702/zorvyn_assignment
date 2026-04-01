"use client"

import { useFinance, Role } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, User, Shield } from "lucide-react"

export function DashboardHeader() {
  const { role, setRole, isDarkMode, toggleDarkMode } = useFinance()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">F</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">FinanceFlow</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Dashboard
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:block">Role:</span>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-24 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Viewer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Indicator */}
          <Badge 
            variant={role === "admin" ? "default" : "secondary"}
            className={`hidden sm:flex ${role === "admin" ? "bg-primary" : ""}`}
          >
            {role === "admin" ? "Full Access" : "View Only"}
          </Badge>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="shrink-0"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
