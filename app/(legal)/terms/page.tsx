import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="font-outfit text-xl font-bold text-gray-800 dark:text-white">
            Terms of Service
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* Logo */}
          <div className="text-center mb-8 not-prose">
            <h2 className="font-outfit text-2xl font-black tracking-wider uppercase">
              <span className="text-gray-800 dark:text-white">MATCH</span>
              <span className="text-yellow-500">POST</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: January 30, 2026
            </p>
          </div>

          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using MatchPost, you accept and agree to be bound by the terms
                and provisions of this agreement. If you do not agree to abide by these terms,
                please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                2. Description of Service
              </h2>
              <p>
                MatchPost is a tennis match tracking application that allows users to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Record and track tennis match results</li>
                <li>Create and share match story cards</li>
                <li>View match statistics and history</li>
                <li>Connect with other tennis players</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                3. User Accounts
              </h2>
              <p>
                To use certain features of MatchPost, you must create an account. You are
                responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account.
              </p>
              <p className="mt-2">
                You agree to provide accurate, current, and complete information during the
                registration process and to update such information to keep it accurate,
                current, and complete.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                4. User Content
              </h2>
              <p>
                You retain ownership of all content you submit to MatchPost. By submitting
                content, you grant us a non-exclusive, worldwide, royalty-free license to
                use, display, and distribute your content in connection with the service.
              </p>
              <p className="mt-2">
                You agree not to submit content that is illegal, offensive, or infringes
                on the rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                5. Prohibited Activities
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Interfere with the proper functioning of the service</li>
                <li>Impersonate any person or entity</li>
                <li>Collect user data without consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                6. Intellectual Property
              </h2>
              <p>
                The MatchPost name, logo, and all related names, logos, product and service
                names, designs, and slogans are trademarks of MatchPost. You may not use
                these marks without our prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                7. Disclaimer of Warranties
              </h2>
              <p>
                The service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties
                of any kind, either express or implied. We do not warrant that the service
                will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                8. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, MatchPost shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages arising
                out of or relating to your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                9. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users
                of any material changes by posting the new terms on this page and updating
                the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                10. Contact Us
              </h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a
                  href="mailto:hello@bayuslari.com"
                  className="text-yellow-600 dark:text-yellow-400 hover:underline"
                >
                  hello@bayuslari.com
                </a>
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 not-prose">
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
