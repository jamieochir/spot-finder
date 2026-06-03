const params = new URLSearchParams(window.location.search);
const place = {
  name:         params.get("name")         || "Unknown Place",
  address:      params.get("address")      || "Busan, South Korea",
  category:     params.get("category")     || "Spot",
  categoryCode: params.get("categoryCode") || "",
  x:            params.get("x")            || "129.0756",
  y:            params.get("y")            || "35.1796",
  url:          params.get("url")          || "",
};

document.title = `${place.name} — Spot Finder`;
document.getElementById("detail-name").textContent            = place.name;
document.getElementById("detail-badge").textContent           = place.category;
document.getElementById("detail-address").textContent         = place.address;
document.getElementById("detail-address-sidebar").textContent = place.address;
document.getElementById("detail-category-val").textContent    = place.category;

const kakaoLink = document.getElementById("detail-kakao-link");
kakaoLink.href = place.url || `https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`;

document.getElementById("detail-directions").href =
  `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.y},${place.x}`;

const lat   = parseFloat(place.y);
const lon   = parseFloat(place.x);
const delta = 0.008;
document.getElementById("detail-map").src =
  `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;

const tags = [place.category, "Busan", "South Korea", "Date Spot", "Explore"];
const tagContainer = document.getElementById("detail-tags");
tags.forEach((t) => {
  if (!t) return;
  const span = document.createElement("span");
  span.className = "detail-tag";
  span.textContent = t;
  tagContainer.appendChild(span);
});

async function loadPhotos() {
  const photos = await fetchPlacePhotos(place.name, place.categoryCode, 6);
  if (!photos || photos.length === 0) return;

  document.getElementById("detail-hero").style.backgroundImage =
    `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%), url(${photos[0]})`;

  const gallery = document.getElementById("detail-gallery");
  gallery.innerHTML = "";
  photos.forEach((url) => {
    const img     = document.createElement("img");
    img.src       = url;
    img.alt       = place.name;
    img.className = "gallery-img";
    img.loading   = "lazy";
    gallery.appendChild(img);
  });

  document.getElementById("detail-gallery-section").style.display = "block";
}

loadPhotos();
