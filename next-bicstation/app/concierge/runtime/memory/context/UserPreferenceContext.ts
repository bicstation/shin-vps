// /app/concierge/runtime/memory/context/UserPreferenceContext.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  UserPreference,
} from '@/app/concierge/contracts/user/UserPreference'

/* =========================================
🔥 User Preference Context
========================================= */

export type UserPreferenceContext = {

  preferences?: UserPreference

  lastUpdated?: Date
}

/* =========================================
🔥 Utility
========================================= */

export function
createUserPreferenceContext(
  initial?: UserPreference
): UserPreferenceContext {

  return {

    preferences: initial,
    lastUpdated: new Date(),
  }
}