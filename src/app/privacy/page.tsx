import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Forki',
  description: 'Forki Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Forki — Privacy Policy
          </h1>
          <p className="text-muted-foreground italic">
            Last Updated: November 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8 pb-6 border-b border-border">
          <p className="text-foreground leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how Forki ("we," "us," or "our") collects, uses, and protects personal information. By using the Forki mobile application, you agree to the practices described below.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            1. Information We Collect
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            We collect only the information necessary to provide the core features of Forki and improve the user experience. Before or at the time information is collected, we will identify the purposes for which it is being used.
          </p>
          
          <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
            Information You Provide
          </h3>
          <p className="text-foreground mb-3 leading-relaxed">
            We may collect the following information directly from you:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-foreground">
            <li>Name (used to personalize the in-app experience)</li>
            <li>Age, gender, height, and weight (used to calculate BMI and create your Wellness Snapshot)</li>
            <li>Eating habits and lifestyle inputs (used to determine your persona and recommendations)</li>
            <li>Manually entered or logged meals</li>
            <li>Notes related to food entries</li>
          </ul>
          <p className="text-foreground mb-4 leading-relaxed">
            This information is used only to support functionality within the app.
          </p>

          <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
            Camera Access
          </h3>
          <p className="text-foreground mb-3 leading-relaxed">
            Forki requests camera access solely to allow you to capture photos of meals for calorie and nutrient estimation.
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-foreground">
            <li>Camera access is used only when you take a photo.</li>
            <li>Images are processed for analysis and are not stored or reused unless you explicitly save them.</li>
            <li>Forki does not access your camera in the background.</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
            Information We Do Not Collect
          </h3>
          <p className="text-foreground mb-3 leading-relaxed">
            Forki does not collect or access:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-foreground">
            <li>Device location or GPS</li>
            <li>Contacts, messages, or personal files</li>
            <li>Photos or your photo library</li>
            <li>Payment or financial information</li>
            <li>Biometric identifiers</li>
            <li>HealthKit data</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            2. Use of Information
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            We use the information you provide for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-foreground">
            <li>Generating your Wellness Snapshot and recommendations</li>
            <li>Tracking meals, calories, and macronutrients</li>
            <li>Supporting habit-building features such as streaks and consistency tracking</li>
            <li>Powering the companion pet's responses</li>
            <li>Improving the overall functionality of the app</li>
          </ul>
          <p className="text-foreground mb-4 leading-relaxed">
            Information will be used only for these purposes unless additional consent is obtained or required by law.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            3. Data Retention
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            We retain personal information only as long as necessary to fulfill the purposes for which it was collected.
          </p>
          <p className="text-foreground mb-4 leading-relaxed">
            You may clear your information manually or delete all data by uninstalling the app.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            4. Data Protection
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            We use reasonable security safeguards to protect personal information against loss, theft, unauthorized access, disclosure, copying, use, or modification.
          </p>
          <p className="text-foreground mb-4 leading-relaxed">
            While we take appropriate precautions, no method of electronic storage or transmission is completely secure. We cannot guarantee absolute security, but we are committed to protecting your information to the best of our ability.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            5. Third-Party Services
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            Forki may use third-party services to process meal images for calorie estimation. These services are required to:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-foreground">
            <li>Use the images only for processing your request</li>
            <li>Not store images</li>
            <li>Not use the images for advertising or unrelated model training</li>
          </ul>
          <p className="text-foreground mb-4 leading-relaxed">
            We do not sell or share your personal information with any third parties.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            6. Children's Privacy
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            Forki is intended for individuals aged 13 and older.
          </p>
          <p className="text-foreground mb-4 leading-relaxed">
            We do not knowingly collect information from children under 13.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            7. Transparency
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            We will make information about our privacy practices available to users upon request.
          </p>
          <p className="text-foreground mb-4 leading-relaxed">
            You may contact us at any time with questions regarding how your information is collected or used.
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            8. Policy Changes
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            We may update this Privacy Policy as needed.
          </p>
          <p className="text-foreground mb-4 leading-relaxed">
            Revisions will be posted within the app. By continuing to use Forki, you agree to the current version of the policy.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            9. Contact Information
          </h2>
          <p className="text-foreground mb-4 leading-relaxed">
            For questions or concerns about this Privacy Policy, you may contact us at:
          </p>
          <p className="text-foreground mb-4 leading-relaxed">
            <a 
              href="mailto:janicechung@usc.edu" 
              className="text-primary hover:underline"
            >
              janicechung@usc.edu
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

