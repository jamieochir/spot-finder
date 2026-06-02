function createSpotCard(place, photoUrl) {
  const icon = CATEGORY_ICON[place.category_group_code] || DEFAULT_ICON;
  const tag =
    icon.label ||
    place.category_group_name ||
    (place.category_name ? place.category_name.split(" > ")[0] : "Spot");

  const card = document.createElement("div");
  card.className = "spot-card";

  card.innerHTML = `
    <div class="card-photo-wrapper">
      ${
        photoUrl
          ? `<img src="${photoUrl}" alt="${place.place_name}" class="card-photo" />`
          : `<div class="card-photo-placeholder">${icon.emoji}</div>`
      }
      <span class="card-badge">${tag}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${place.place_name}</h3>
      <p class="card-address">📍 ${place.address_name}</p>
      <a
        href="/html/detail.html?id=${place.id}&name=${encodeURIComponent(place.place_name)}&address=${encodeURIComponent(place.address_name)}&category=${encodeURIComponent(tag)}&categoryCode=${place.category_group_code || ""}&x=${place.x}&y=${place.y}&url=${encodeURIComponent(place.place_url || "")}"
        class="card-btn"
      >View Details →</a>
    </div>
  `;

  return card;
}
