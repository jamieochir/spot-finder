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

function getImageSize(url) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = url;
  });
}

async function chooseHeroPhoto(photos) {
  const blockedWords = [
    "news",
    "news1",
    "newsis",
    "yna",
    "donga",
    "chosun",
    "joongang",
  ];

  const loadedImages = await Promise.all(
    photos.map((url) => getImageSize(url))
  );

  const candidates = loadedImages.filter((img) => {
    if (!img) return false;

    const url = img.url.toLowerCase();
    const isBlocked = blockedWords.some((word) => url.includes(word));
    const isLargeEnough = img.width >= 900 && img.height >= 450;
    const isWideEnough = img.width / img.height >= 1.4;

    return !isBlocked && isLargeEnough && isWideEnough;
  });

  candidates.sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaB - areaA;
  });

  return candidates[0]?.url || photos[1] || photos[0];
}

async function loadPhotos() {
  const photos = await fetchPlacePhotos(place.name, place.categoryCode, 6);
  if (!photos || photos.length === 0) return;

  const heroPhoto = await chooseHeroPhoto(photos);

  document.getElementById("detail-hero").style.backgroundImage =
    `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%), url(${heroPhoto})`;

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
