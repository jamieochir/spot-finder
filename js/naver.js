const PROXY = "http://localhost:3000/api/photos";

async function fetchPlacePhoto(placeName) {
  try {
    const res  = await fetch(`${PROXY}?q=${encodeURIComponent(placeName + " 부산")}&count=1`);
    const data = await res.json();
    if (data.items && data.items.length > 0) return data.items[0].link;
  } catch (err) {
    console.error("fetchPlacePhoto failed:", err);
  }
  return null;
}

async function fetchPlacePhotos(placeName, categoryCode, count = 6) {
  try {
    const res  = await fetch(`${PROXY}?q=${encodeURIComponent(placeName + " 부산")}&count=${count}`);
    const data = await res.json();
    if (data.items && data.items.length > 0) return data.items.map((i) => i.link);
  } catch (err) {
    console.error("fetchPlacePhotos failed:", err);
  }
  return [];
}
