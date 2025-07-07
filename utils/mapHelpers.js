// Country coordinates for common country codes
export const countryCoordinates = {
  // North America
  US: { lat: 39.8283, lng: -98.5795, name: 'United States' },
  CA: { lat: 56.1304, lng: -106.3468, name: 'Canada' },
  MX: { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
  
  // Europe
  GB: { lat: 55.3781, lng: -3.4360, name: 'United Kingdom' },
  FR: { lat: 46.2276, lng: 2.2137, name: 'France' },
  DE: { lat: 51.1657, lng: 10.4515, name: 'Germany' },
  IT: { lat: 41.8719, lng: 12.5674, name: 'Italy' },
  ES: { lat: 40.4637, lng: -3.7492, name: 'Spain' },
  NL: { lat: 52.1326, lng: 5.2913, name: 'Netherlands' },
  BE: { lat: 50.5039, lng: 4.4699, name: 'Belgium' },
  CH: { lat: 46.8182, lng: 8.2275, name: 'Switzerland' },
  AT: { lat: 47.5162, lng: 14.5501, name: 'Austria' },
  SE: { lat: 60.1282, lng: 18.6435, name: 'Sweden' },
  NO: { lat: 60.4720, lng: 8.4689, name: 'Norway' },
  DK: { lat: 56.2639, lng: 9.5018, name: 'Denmark' },
  FI: { lat: 61.9241, lng: 25.7482, name: 'Finland' },
  PL: { lat: 51.9194, lng: 19.1451, name: 'Poland' },
  GR: { lat: 39.0742, lng: 21.8243, name: 'Greece' },
  PT: { lat: 39.3999, lng: -8.2245, name: 'Portugal' },
  IE: { lat: 53.4129, lng: -8.2439, name: 'Ireland' },
  
  // Asia
  CN: { lat: 35.8617, lng: 104.1954, name: 'China' },
  JP: { lat: 36.2048, lng: 138.2529, name: 'Japan' },
  IN: { lat: 20.5937, lng: 78.9629, name: 'India' },
  KR: { lat: 35.9078, lng: 127.7669, name: 'South Korea' },
  TH: { lat: 15.8700, lng: 100.9925, name: 'Thailand' },
  SG: { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  MY: { lat: 4.2105, lng: 101.9758, name: 'Malaysia' },
  ID: { lat: -0.7893, lng: 113.9213, name: 'Indonesia' },
  PH: { lat: 12.8797, lng: 121.7740, name: 'Philippines' },
  VN: { lat: 14.0583, lng: 108.2772, name: 'Vietnam' },
  PK: { lat: 30.3753, lng: 69.3451, name: 'Pakistan' },
  TR: { lat: 38.9637, lng: 35.2433, name: 'Turkey' },
  SA: { lat: 23.8859, lng: 45.0792, name: 'Saudi Arabia' },
  AE: { lat: 23.4241, lng: 53.8478, name: 'United Arab Emirates' },
  IL: { lat: 31.0461, lng: 34.8516, name: 'Israel' },
  
  // Oceania
  AU: { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  NZ: { lat: -40.9006, lng: 174.8860, name: 'New Zealand' },
  
  // South America
  BR: { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  AR: { lat: -38.4161, lng: -63.6167, name: 'Argentina' },
  CL: { lat: -35.6751, lng: -71.5430, name: 'Chile' },
  CO: { lat: 4.5709, lng: -74.2973, name: 'Colombia' },
  PE: { lat: -9.1900, lng: -75.0152, name: 'Peru' },
  VE: { lat: 6.4238, lng: -66.5897, name: 'Venezuela' },
  
  // Africa
  ZA: { lat: -30.5595, lng: 22.9375, name: 'South Africa' },
  EG: { lat: 26.8206, lng: 30.8025, name: 'Egypt' },
  NG: { lat: 9.0820, lng: 8.6753, name: 'Nigeria' },
  KE: { lat: -0.0236, lng: 37.9062, name: 'Kenya' },
  MA: { lat: 31.7917, lng: -7.0926, name: 'Morocco' },
  
  // Add more as needed
};

// Get coordinates for a country code
export function getCountryCoordinates(countryCode) {
  if (!countryCode) return null;
  return countryCoordinates[countryCode.toUpperCase()] || null;
}

// Calculate distance between two points (in km)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get articles within radius of a point
export function getArticlesNearLocation(articles, lat, lng, radiusKm) {
  return articles.filter(article => {
    if (!article.latitude || !article.longitude) return false;
    const distance = calculateDistance(lat, lng, article.latitude, article.longitude);
    return distance <= radiusKm;
  });
}

// Cluster articles by proximity
export function clusterArticles(articles, clusterRadius = 50) {
  const clusters = [];
  const processed = new Set();

  articles.forEach((article, i) => {
    if (processed.has(i)) return;

    const cluster = [article];
    processed.add(i);

    articles.forEach((otherArticle, j) => {
      if (i === j || processed.has(j)) return;
      
      const distance = calculateDistance(
        article.latitude, 
        article.longitude,
        otherArticle.latitude,
        otherArticle.longitude
      );

      if (distance <= clusterRadius) {
        cluster.push(otherArticle);
        processed.add(j);
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}

// Get bounds for a set of articles
export function getArticlesBounds(articles) {
  if (!articles || articles.length === 0) return null;

  let minLat = articles[0].latitude;
  let maxLat = articles[0].latitude;
  let minLng = articles[0].longitude;
  let maxLng = articles[0].longitude;

  articles.forEach(article => {
    if (article.latitude < minLat) minLat = article.latitude;
    if (article.latitude > maxLat) maxLat = article.latitude;
    if (article.longitude < minLng) minLng = article.longitude;
    if (article.longitude > maxLng) maxLng = article.longitude;
  });

  return [[minLat, minLng], [maxLat, maxLng]];
}

// Format location name
export function formatLocation(article) {
  const parts = [];
  
  if (article.city) parts.push(article.city);
  if (article.country_code) {
    const country = countryCoordinates[article.country_code.toUpperCase()];
    if (country) {
      parts.push(country.name);
    } else {
      parts.push(article.country_code.toUpperCase());
    }
  }
  
  return parts.join(', ') || 'Unknown Location';
}