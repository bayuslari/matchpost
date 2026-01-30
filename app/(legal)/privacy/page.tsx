import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
                1. Introduction
              </h2>
              <p>
                Welcome to MatchPost. We respect your privacy and are committed to protecting
                your personal data. This privacy policy explains how we collect, use, and
                safeguard your information when you use our tennis match tracking application.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                2. Information We Collect
              </h2>
              <p>We collect the following types of information:</p>

              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
                Account Information
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Email address</li>
                <li>Name (from Google account if using Google Sign-In)</li>
                <li>Profile picture (from Google account)</li>
                <li>Username you create</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
                Match Data
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Match scores and results</li>
                <li>Opponent names</li>
                <li>Match dates and locations</li>
                <li>Match type (singles/doubles)</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">
                Usage Data
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Device information</li>
                <li>App usage patterns</li>
                <li>Error logs for debugging</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                3. How We Use Your Information
              </h2>
              <p>We use your information to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide and maintain the MatchPost service</li>
                <li>Create and manage your account</li>
                <li>Track and display your match history and statistics</li>
                <li>Generate shareable story cards</li>
                <li>Improve our services and user experience</li>
                <li>Communicate with you about updates or issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                4. Data Storage and Security
              </h2>
              <p>
                Your data is stored securely using Supabase, a trusted database platform with
                industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Encrypted data at rest</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                5. Data Sharing
              </h2>
              <p>
                We do not sell your personal data. We may share your information only in the
                following circumstances:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>When you create public story cards that you choose to share</li>
                <li>With service providers who help us operate MatchPost</li>
                <li>When required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your match data</li>
                <li>Opt out of non-essential communications</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us at{' '}
                <a
                  href="mailto:hello@bayuslari.com"
                  className="text-yellow-600 dark:text-yellow-400 hover:underline"
                >
                  hello@bayuslari.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                7. Cookies and Tracking
              </h2>
              <p>
                MatchPost uses essential cookies to maintain your session and preferences.
                We do not use third-party tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                8. Third-Party Services
              </h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Supabase</strong> - Database and authentication</li>
                <li><strong>Google Sign-In</strong> - Optional authentication method</li>
                <li><strong>Vercel</strong> - Application hosting</li>
              </ul>
              <p className="mt-2">
                Each of these services has their own privacy policies governing their use of data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                9. Children&apos;s Privacy
              </h2>
              <p>
                MatchPost is not intended for children under 13 years of age. We do not
                knowingly collect personal information from children under 13. If you are
                a parent and believe your child has provided us with personal information,
                please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of
                any changes by posting the new policy on this page and updating the
                &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                11. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
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
                href="/terms"
                className="text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                Terms of Service
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
