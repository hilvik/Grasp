export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Your Privacy Matters</h2>
        <p>
          At Grasp, we take your privacy seriously. This policy outlines how we collect, 
          use, and protect your personal information.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Account information (email, display name)</li>
          <li>Location data (country and city) for personalized news</li>
          <li>Reading preferences and interests</li>
          <li>Usage analytics to improve our service</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Personalize your news feed</li>
          <li>Show you how news impacts your local area</li>
          <li>Improve our content recommendations</li>
          <li>Send you important updates (with your permission)</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We use industry-standard encryption and security measures to protect your data. 
          Your information is stored securely and is never sold to third parties.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Update or correct your information</li>
          <li>Delete your account and associated data</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:privacy@grasp.news" className="text-primary hover:underline">
            privacy@grasp.news
          </a>
        </p>
      </div>
    </div>
  );
}