const UNSPLASH_ACCESS_KEY = "1D77uZa9mQnHGY53DmVJ6xYLlvjtRfblDQ4SUup3o-Q";

const CATEGORY_QUERIES = {
  CE7: "busan cafe aesthetic interior",
  FD6: "busan korean food restaurant",
  AT4: "busan tourist landmark attraction",
  CT1: "busan culture museum art",
  AD5: "busan hotel accommodation",
};

function _buildUnsplashQuery(placeName, categoryCode) {
  return CATEGORY_QUERIES[categoryCode] || "busan south korea city";
}

async function _unsplashFallback(placeName, categoryCode) {
  const query = _buildUnsplashQuery(placeName, categoryCode);
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } },
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) return data.results[0].urls.small;
    return null;
  } catch {
    return null;
  }
}

async function _unsplashFallbackMultiple(placeName, categoryCode, count = 6) {
  const query = _buildUnsplashQuery(placeName, categoryCode);
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } },
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) return data.results.map((r) => r.urls.regular);
    return [];
  } catch {
    return [];
  }
}
