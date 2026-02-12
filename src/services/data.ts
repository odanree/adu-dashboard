/**
 * Data fetching service for ADU Dashboard
 */

import apiClient from './api'
import type { ADUData, ExpenseCategory } from '@types'

const FALLBACK_DATA: ADUData = {
  expenses: [
    // Phase 1: Planning & Design
    { category: 'Phase 1: Planning & Design', items: [{ task: 'Permits', cost: 1500 }, { task: 'Design', cost: 2000 }], total: 3500, phase: 1 },
    // Phase 2: Foundation
    { category: 'Phase 2: Foundation', items: [{ task: 'Excavation', cost: 3000 }, { task: 'Foundation', cost: 5000 }], total: 8000, phase: 2 },
    // Phase 3: Framing
    { category: 'Phase 3: Framing', items: [{ task: 'Structural Framing', cost: 8000 }], total: 8000, phase: 3 },
    // Phase 4: MEP Systems
    { category: 'Phase 4: MEP Systems', items: [{ task: 'Electrical', cost: 4000 }, { task: 'Plumbing', cost: 3000 }, { task: 'HVAC', cost: 3000 }], total: 10000, phase: 4 },
    // Phase 5: Exterior
    { category: 'Phase 5: Exterior', items: [{ task: 'Roofing', cost: 4000 }, { task: 'Siding', cost: 3000 }, { task: 'Windows & Doors', cost: 3000 }], total: 10000, phase: 5 },
    // Phase 6: Interior Finishes
    { category: 'Phase 6: Interior Finishes', items: [{ task: 'Drywall', cost: 2000 }, { task: 'Flooring', cost: 3000 }, { task: 'Painting', cost: 1500 }, { task: 'Fixtures', cost: 2500 }], total: 9000, phase: 6 },
  ],
  lastUpdated: new Date().toISOString(),
}

export const dataService = {
  /**
   * Fetch ADU data from the backend
   */
  async fetchADUData(): Promise<ADUData> {
    try {
      const response = await apiClient.get<ADUData>('/api/data')
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
      const response = await apiClient.get<ADUData>('/api/refresh')
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
      const response = await apiClient.get('/api/sheets-link', {
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
   * Calculate budget utilization percentage
   */
  calculateUtilization(actual: number, planned: number): number {
    if (planned === 0) return 0
    return Math.min((actual / planned) * 100, 100)
  },
}

export default dataService
