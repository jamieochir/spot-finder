const KAKAO_API_KEY = "d80e4b6959493a29990be815c71b87b9";
const BUSAN_X = "129.0756";
const BUSAN_Y = "35.1796";

const BLOCKED_CATEGORIES = new Set([
  "BK9", // banks
  "HP8", // hospitals
  "PM9", // pharmacies
  "OL7", // gas stations
  "PK6", // parking lots
  "SW8", // subway stations
  "SC4", // schools
  "PS3", // kindergartens
  "AC5", // academies
  "AG2", // real estate
  "PO3", // public offices
  "MT1", // supermarkets
  "CS2", // convenience stores
]);

const CATEGORY_ICON = {
  CE7: { emoji: "☕", color: "#fff3e0", label: "Cafe" },
  FD6: { emoji: "🍽️", color: "#fce4ec", label: "Restaurant" },
  AT4: { emoji: "🏛️", color: "#e8f5e9", label: "Tourist Spot" },
  CT1: { emoji: "🎭", color: "#ede7f6", label: "Culture" },
  AD5: { emoji: "🏨", color: "#e3f2fd", label: "Stay" },
};

const DEFAULT_ICON = { emoji: "📍", color: "#f5f5f5", label: null };

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
let debounceTimer;

searchInput.addEventListener("input", function () {
  const query = this.value.trim();
  clearTimeout(debounceTimer);
  searchResults.innerHTML = "";

  if (!query) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.innerHTML = `<div class="search-no-result">Searching...</div>`;
  searchResults.style.display = "block";
  debounceTimer = setTimeout(() => searchKakao(query), 350);
});

async function searchKakao(query) {
  const params = new URLSearchParams({
    query,
    x: BUSAN_X,
    y: BUSAN_Y,
    radius: 20000,
    size: 15,
  });

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
    );
    const data = await res.json();
    searchResults.innerHTML = "";

    if (!res.ok) {
      console.error("Kakao API error:", data);
      searchResults.innerHTML = `<div class="search-no-result">API error: ${data.message || res.status}</div>`;
      return;
    }

    const filtered = (data.documents || []).filter(
      (p) => !BLOCKED_CATEGORIES.has(p.category_group_code)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = `<div class="search-no-result">No spots found</div>`;
      return;
    }

    filtered.slice(0, 8).forEach(async (place) => {
      const icon = CATEGORY_ICON[place.category_group_code] || DEFAULT_ICON;
      const tag = icon.label || place.category_group_name || (place.category_name ? place.category_name.split(" > ")[0] : "Spot");
      const item = document.createElement("div");
      item.className = "search-item";
      item.innerHTML = `
        <div class="search-item-icon" style="background:${icon.color}">${icon.emoji}</div>
        <div class="search-item-info">
          <div class="search-item-top">
            <span class="search-item-name">${place.place_name}</span>
            <span class="search-item-tag">${tag}</span>
          </div>
          <p class="search-item-desc">${place.address_name}</p>
        </div>
      `;
      item.addEventListener("click", () => {
        const p = new URLSearchParams({
          name:         place.place_name,
          address:      place.address_name,
          category:     tag,
          categoryCode: place.category_group_code || "",
          x:            place.x,
          y:            place.y,
          url:          place.place_url || "",
        });
        window.location.href = `/html/detail.html?${p}`;
      });
      searchResults.appendChild(item);

      const photoUrl = await fetchPlacePhoto(place.place_name, place.category_group_code);
      if (photoUrl) {
        const iconEl = item.querySelector(".search-item-icon");
        iconEl.style.background = "none";
        iconEl.style.padding    = "0";
        iconEl.style.overflow   = "hidden";
        iconEl.innerHTML = `<img src="${photoUrl}" alt="${place.place_name}" class="search-item-photo" />`;
      }
    });
  } catch (err) {
    console.error("Kakao fetch failed:", err);
    searchResults.innerHTML = `<div class="search-no-result">Something went wrong</div>`;
  }
}

document.addEventListener("click", function (e) {
  if (!e.target.closest(".search-wrapper")) {
    searchResults.style.display = "none";
  }
});
