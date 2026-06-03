async function loadFeaturedSpots() {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent("부산 명소")}&x=129.0756&y=35.1796&radius=20000&size=4&page=1`,
      { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
    );
    const data = await res.json();
    if (!data.documents || data.documents.length === 0) return;

    const grid = document.getElementById("featured-grid");
    data.documents.forEach(async (place) => {
      const card = createSpotCard(place, null);
      grid.appendChild(card);

      const photoUrl = await fetchPlacePhoto(place.place_name, place.category_group_code);
      if (photoUrl) {
        const placeholder = card.querySelector(".card-photo-placeholder");
        if (placeholder) {
          const img = document.createElement("img");
          img.src       = photoUrl;
          img.alt       = place.place_name;
          img.className = "card-photo";
          placeholder.replaceWith(img);
        }
      }
    });
  } catch (err) {
    console.error("Featured spots failed:", err);
  }
}

loadFeaturedSpots();
