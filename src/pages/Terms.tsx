/**
 * Terms of Service page
 */

import React from 'react'

export const Terms: React.FC = () => {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8 text-white">
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">Terms of Service</h2>
            <p className="text-gray-200 mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your use of the ADU Dashboard and related services.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-200">
              By accessing and using the ADU Dashboard, you accept and agree to be bound by and comply with these Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">2. Use License</h3>
            <p className="text-gray-200 mb-2">
              Permission is granted to temporarily download one copy of the materials (information or software) on the ADU Dashboard for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
            <p className="text-gray-200">
              Under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mt-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">3. Disclaimer</h3>
            <p className="text-gray-200">
              The materials on the ADU Dashboard are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">4. Limitations</h3>
            <p className="text-gray-200">
              In no event shall the ADU Dashboard or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the ADU Dashboard.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">5. Accuracy of Materials</h3>
            <p className="text-gray-200">
              The materials appearing on the ADU Dashboard could include technical, typographical, or photographic errors. We do not warrant that any of the materials on the ADU Dashboard are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">6. Links</h3>
            <p className="text-gray-200">
              We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">7. Modifications</h3>
            <p className="text-gray-200">
              We may revise these Terms at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">8. Contact Us</h3>
            <p className="text-gray-200">
              If you have questions about these Terms of Service, please contact us through the dashboard.
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

export default Terms
