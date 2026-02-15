import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Forki',
  description: 'Forki Terms of Service - Learn about the terms and conditions for using Forki.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0A1128]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#E8E8F0] mb-4">
            Forki — Terms of Service
          </h1>
          <p className="text-[#B8B8C8] italic">
            Last Updated: February 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8 pb-6 border-b border-[#7B68C4]/30">
          <p className="text-[#E8E8F0] leading-relaxed">
            By using Forki (the &ldquo;App&rdquo;), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with these terms, you may not use Forki. The materials and content within Forki are protected by applicable copyright and trademark law.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            By accessing or using Forki, you agree to comply with and be bound by these Terms. If you do not agree, please discontinue use of the App.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            2. Use License
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Forki grants you a limited, revocable, non-transferable license to use the App for personal, non-commercial purposes.
          </p>
          <p className="text-[#E8E8F0] mb-3 leading-relaxed">
            Under this license, you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-[#B8B8C8]">
            <li>Modify or copy any materials or content in the App.</li>
            <li>Use the App for commercial purposes or public display.</li>
            <li>Attempt to reverse engineer, decompile, or extract source code from the App.</li>
            <li>Remove copyright or proprietary notices.</li>
            <li>Transfer your access to another person or &ldquo;mirror&rdquo; the App elsewhere.</li>
          </ul>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            This license automatically terminates if you violate these terms. Upon termination, you must discontinue use of the App and delete any locally stored materials obtained through it.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            3. Disclaimer
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Forki is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We make no warranties, expressed or implied, including without limitation:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-[#B8B8C8]">
            <li>Warranties of merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
          </ul>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            We do not guarantee the accuracy or reliability of nutrition estimates, health insights, or any other data provided by the App.
          </p>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Forki is a general wellness tool and does not provide medical advice.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            4. Limitations of Liability
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            In no event shall Forki or its suppliers be liable for any damages arising from the use or inability to use the App, including:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-[#B8B8C8]">
            <li>Loss of data</li>
            <li>Loss of profits</li>
            <li>Device issues</li>
            <li>Business interruption</li>
          </ul>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Even if Forki has been advised of the possibility of such damage.
          </p>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Some jurisdictions do not allow certain liability limitations, so these restrictions may not apply to you.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            5. Revisions and Updates
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            The materials and features within Forki may include technical, typographical, or other errors. We do not guarantee that all information is accurate or current.
          </p>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Forki may make changes, updates, or improvements to the App at any time without notice.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            6. External Links
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Forki may include links to third-party services (such as APIs used for food recognition). Forki is not responsible for the content or practices of any external site or service. Use of linked services is at your own risk.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            7. Modifications to These Terms
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            Forki may revise these Terms of Service at any time without notice. By continuing to use the App, you agree to the most current version of these Terms.
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            8. Governing Law
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            These Terms are governed by the laws of the State of California, without regard to its conflict-of-law rules.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#E8E8F0] mb-4">
            9. Contact Us
          </h2>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            For questions about these Terms, contact us at:
          </p>
          <p className="text-[#E8E8F0] mb-4 leading-relaxed">
            <a 
              href="mailto:janicechung@usc.edu" 
              className="text-[#8DD4D1] hover:underline"
            >
              janicechung@usc.edu
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

