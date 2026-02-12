/**
 * Data fetching service for ADU Dashboard
 */

import apiClient from './api'
import type { ADUData, ExpenseCategory, PaymentMilestone } from '@types'

const FALLBACK_DATA: ADUData = {
  payments: [
    {
      num: 1,
      title: 'Initial Deposit & Site Mobilization',
      planned: 21800,
      actual: 21800,
    },
    { num: 2, title: 'Foundation & Under-Slab Inspection', planned: 26000, actual: 47800 },
    { num: 3, title: 'Rough MEP Inspection', planned: 34100, actual: 47800 },
    { num: 4, title: 'Framing Inspection / Dry-In', planned: 28000, actual: 47800 },
    {
      num: 5,
      title: 'Insulation & Drywall Inspections',
      planned: 59000,
      actual: 47800,
    },
    { num: 6, title: 'Final Inspection & Project Completion', planned: 56300, actual: 47800 },
  ],
  expenses: [
    // Phase 1: Site Mobilization
    { category: 'Phase 1: Site Mobilization', items: [{ task: 'Architect and Engineering', cost: 8000 }], total: 21800, phase: 1 },
    // Phase 2: Foundation
    { category: 'Phase 2: Foundation', items: [{ task: 'Footings', cost: 26000 }], total: 26000, phase: 2 },
    // Phase 3: Rough MEP
    { category: 'Phase 3: Rough MEP', items: [{ task: 'Plumbing, gas, and electrical', cost: 9500 }, { task: 'HVAC & Mechanical', cost: 7400 }, { task: 'Electrical', cost: 12000 }, { task: 'Plumbing', cost: 5200 }], total: 34100, phase: 3 },
    // Phase 4: Framing
    { category: 'Phase 4: Framing', items: [{ task: 'Framing', cost: 28000 }], total: 28000, phase: 4 },
    // Phase 5: Exterior
    { category: 'Phase 5: Exterior', items: [{ task: 'Roofing', cost: 17000 }, { task: 'Doors and Windows', cost: 11500 }, { task: 'Exterior Stucco', cost: 12000 }, { task: 'Exterior Stairs', cost: 3000 }, { task: 'Insulation', cost: 4000 }, { task: 'Drywall', cost: 11500 }], total: 59000, phase: 5 },
    // Phase 6: Final Completion
    { category: 'Phase 6: Final Completion', items: [{ task: 'Interior Painting', cost: 4400 }, { task: 'Flooring', cost: 6576 }, { task: 'ADU Kitchen', cost: 5500 }, { task: 'ADU Bathroom 1', cost: 9500 }, { task: 'Powder Room', cost: 5800 }, { task: 'Lighting', cost: 4500 }, { task: 'Baseboards', cost: 2700 }, { task: 'Door Trim', cost: 2600 }, { task: 'Paving', cost: 2500 }, { task: 'Deputy Inspection', cost: 1500 }], total: 45176, phase: 6 },
  ],
  lastUpdated: new Date().toISOString(),
}

export const dataService = {
  /**
   * Fetch ADU data from the backend
   */
  async fetchADUData(): Promise<ADUData> {
    try {
      const response = await apiClient.get<ADUData>('/data')
      return response.data
    } catch (error) {
      console.error('Error fetching ADU data:', error)
      // Return fallback data if fetch fails
      return FALLBACK_DATA
    }
  },

  /**
   * Refresh ADU data from Google Sheets
   */
  async refreshData(): Promise<ADUData> {
    try {
      const response = await apiClient.get<ADUData>('/refresh')
      return response.data
    } catch (error) {
      console.error('Error refreshing data:', error)
      return FALLBACK_DATA
    }
  },

  /**
   * Get Google Sheets link if authorized
   */
  async getSheetsLink(email: string): Promise<{ authorized: boolean; url?: string; message?: string }> {
    try {
      const response = await apiClient.get('/sheets-link', {
        params: { email },
      })
      console.log('getSheetsLink response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting sheets link:', error)
      // Return structured error response instead of throwing
      return {
        authorized: false,
        message: error instanceof Error ? error.message : 'Unable to check authorization'
      }
    }
  },

  /**
   * Calculate total expenses
   */
  calculateTotalExpenses(expenses: ExpenseCategory[]): number {
    return expenses.reduce((sum, category) => sum + category.total, 0)
  },

  /**
   * Calculate total payments
   */
  calculateTotalPayments(payments: PaymentMilestone[]): number {
    return payments.reduce((sum, payment) => sum + payment.actual, 0)
  },

  /**
   * Calculate budget utilization percentage
   */
  calculateUtilization(actual: number, planned: number): number {
    if (planned === 0) return 0
    return Math.min((actual / planned) * 100, 100)
  },
}

export default dataService
