/**
 * TestSignIn component - allows testing different user roles
 * For development/testing only
 */

import React, { useState } from 'react'
import authService from '@services/auth'

interface TestSignInProps {
  onSignIn: (email: string) => void
  onClose: () => void
}

export const TestSignIn: React.FC<TestSignInProps> = ({ onSignIn, onClose }) => {
  const [selectedUser, setSelectedUser] = useState<'whitelisted' | 'public'>('public')

  const testUsers = {
    whitelisted: {
      email: 'whitelisted@example.com',
      label: '👤 Whitelisted User',
      description: 'Sees full budget: $225,200 (includes overhead/profit)',
      color: 'bg-green-50 border-green-200',
    },
    public: {
      email: 'public-user@example.com',
      label: '👥 Public/Non-Whitelisted User',
      description: 'Sees project budget: $214,476 (no overhead)',
      color: 'bg-blue-50 border-blue-200',
    },
  }

  const currentUser = testUsers[selectedUser]

  const handleSignIn = () => {
    // Simulate sign-in by saving session
    authService.saveSession(currentUser.email)
    onSignIn(currentUser.email)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full my-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">🧪 Test Sign In</h2>

          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Development/Testing Only - Select a test user to simulate sign-in
            </p>
          </div>

          {/* User Selection */}
          <div className="space-y-2 mb-4">
            {(Object.keys(testUsers) as Array<'whitelisted' | 'public'>).map((userType) => (
              <button
                key={userType}
                onClick={() => setSelectedUser(userType)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
                  selectedUser === userType
                    ? `${testUsers[userType].color} border-opacity-100 shadow-md`
                    : `${testUsers[userType].color} border-opacity-30 hover:border-opacity-50`
                }`}
              >
                <div className="font-semibold text-gray-900 text-sm">{testUsers[userType].label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{testUsers[userType].email}</div>
                <div className="text-xs text-gray-500 mt-1">{testUsers[userType].description}</div>
              </button>
            ))}
          </div>

          {/* Current Selection Preview */}
          <div className={`p-3 rounded-lg border-2 mb-4 ${currentUser.color}`}>
            <div className="text-xs font-medium text-gray-900 mb-1">Selected User:</div>
            <div className="text-base font-bold text-gray-900">{currentUser.email}</div>
            <div className="text-xs text-gray-600 mt-1">Budget: {currentUser.description.split(': ')[1]}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSignIn}
              className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-sm"
            >
              Sign In
            </button>
          </div>

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            💡 <strong>Tip:</strong> Refresh page to clear session.
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestSignIn
