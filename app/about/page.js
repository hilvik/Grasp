export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About Grasp</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2>Our Mission</h2>
        <p>
          Grasp is on a mission to make global news accessible and understandable for everyone. 
          We believe that staying informed shouldn't require a degree in international relations 
          or hours of reading complex articles.
        </p>

        <h2>What We Do</h2>
        <p>
          We aggregate news from trusted sources around the world and use cutting-edge AI technology to:
        </p>
        <ul>
          <li>Simplify complex articles into easy-to-understand summaries</li>
          <li>Show you how global events impact your daily life</li>
          <li>Visualize news on an interactive world map</li>
          <li>Analyze sentiment and bias across different sources</li>
        </ul>

        <h2>Why Grasp?</h2>
        <p>
          In today's fast-paced world, it's harder than ever to stay truly informed. News is often 
          filled with jargon, lacks context, or doesn't explain why it matters to you personally. 
          Grasp bridges this gap by making news personal, visual, and simple.
        </p>

        <h2>Our Team</h2>
        <p>
          Grasp was founded by a team of journalists, technologists, and educators who believe 
          that everyone deserves access to clear, unbiased, and relevant news.
        </p>

        <h2>Contact Us</h2>
        <p>
          Have questions or feedback? We'd love to hear from you at{' '}
          <a href="mailto:hello@grasp.news" className="text-primary hover:underline">
            hello@grasp.news
          </a>
        </p>
      </div>
    </div>
  );
}