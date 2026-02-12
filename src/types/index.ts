/**
 * Core type definitions for the ADU Dashboard
 */

export interface PaymentMilestone {
  num: number
  title: string
  planned: number
  actual: number
}

export interface ExpenseItem {
  task: string
  cost: number
}

export interface ExpenseCategory {
  category: string
  items: ExpenseItem[]
  total: number
  phase: number
}

export interface ADUData {
  expenses: ExpenseCategory[]
  lastUpdated: string
}

export interface AuthSession {
  email: string
  signedInAt: number
}

export interface SheetsLinkResponse {
  authorized: boolean
  url?: string
  message?: string
}

export interface APIError {
  message: string
  status?: number
  code?: string
}
