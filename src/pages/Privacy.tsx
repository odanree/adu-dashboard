/**
 * Privacy Policy page
 */

import React from 'react'

export const Privacy: React.FC = () => {
  const handleNavigate = (page: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: page }))
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-4">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => handleNavigate('dashboard')}
            className="mb-4 text-sm hover:underline bg-none border-none cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8 text-white">
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">Privacy Policy</h2>
            <p className="text-gray-200 mb-4">
              This Privacy Policy describes how the ADU Dashboard (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares your information.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
            <p className="text-gray-200 mb-2">We may collect the following information:</p>
            <ul className="list-disc list-inside text-gray-200 space-y-1">
              <li>Email address (when you sign in)</li>
              <li>Session information for authentication purposes</li>
              <li>Google Sheets data you authorize us to access</li>
              <li>Usage analytics and error logs</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">How We Use Your Information</h3>
            <p className="text-gray-200 mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-200 space-y-1">
              <li>Authenticate and authorize your access</li>
              <li>Display your ADU construction data</li>
              <li>Improve the dashboard functionality</li>
              <li>Debug and fix technical issues</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Data Security</h3>
            <p className="text-gray-200">
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
            <p className="text-gray-200">
              If you have questions about this Privacy Policy, please contact us through the dashboard.
            </p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
}

export default Privacy
