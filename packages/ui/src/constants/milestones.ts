/**
 * Milestone configuration.
 *
 * `date` is the inspection / completion date for each phase, in MM/DD/YYYY.
 * A literal `'TBD'` means the milestone has not yet completed — phases past
 * the last completed milestone are excluded from progress calculations.
 */

export interface Milestone {
  title: string
  date: string
  icon: string
}

export const PROJECT_START_DATE = new Date('2025-10-08')

export const MILESTONE_DATA: readonly Milestone[] = [
  { title: 'Initial Deposit & Site Mobilization', date: '10/08/2025', icon: '🏗️' },
  { title: 'Foundation & Under-Slab Inspection', date: '11/06/2025', icon: '✅' },
  { title: 'Rough MEP Inspection', date: '02/12/2026', icon: '🔧' },
  { title: 'Framing Inspection / Dry-In', date: '02/19/2026', icon: '🪵' },
  { title: 'Insulation & Drywall Inspections', date: '03/02/2026', icon: '🧱' },
  { title: 'Final Inspection & Project Completion', date: 'TBD', icon: '🎉' },
]
