export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Agreement to Terms</h2>
        <p>
          By using Grasp, you agree to these Terms of Service. If you don't agree to these terms, 
          please don't use our service.
        </p>

        <h2>Use of Service</h2>
        <p>Grasp provides news aggregation and simplification services. You may use our service for:</p>
        <ul>
          <li>Personal, non-commercial use</li>
          <li>Staying informed about global events</li>
          <li>Educational purposes</li>
        </ul>

        <h2>User Accounts</h2>
        <p>
          When you create an account, you're responsible for maintaining the security of your 
          account and password. You agree to provide accurate information and keep it updated.
        </p>

        <h2>Content</h2>
        <p>
          The news content on Grasp is aggregated from various sources. We do not own this content 
          but provide it under fair use for educational and informational purposes. All content 
          remains the property of its respective owners.
        </p>

        <h2>Prohibited Uses</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for any illegal purposes</li>
          <li>Attempt to bypass any security measures</li>
          <li>Scrape or copy content in bulk</li>
          <li>Impersonate others or provide false information</li>
        </ul>

        <h2>Limitation of Liability</h2>
        <p>
          Grasp is provided "as is" without warranties of any kind. We are not responsible for 
          the accuracy of news content from third-party sources.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We may update these terms from time to time. We'll notify you of any significant changes 
          via email or through the service.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, contact us at{' '}
          <a href="mailto:legal@grasp.news" className="text-primary hover:underline">
            legal@grasp.news
          </a>
        </p>
      </div>
    </div>
  );
}