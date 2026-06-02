const SPOTS_PER_PAGE = 9;

const TABS = {
  all:        { query: "부산 명소",   code: null  },
  cafe:       { query: "카페",        code: "CE7" },
  restaurant: { query: "맛집",        code: "FD6" },
  tourist:    { query: "관광명소",    code: "AT4" },
  culture:    { query: "문화시설",    code: "CT1" },
};

const DISTRICTS = [
  "",        // whole Busan (first batch, no district)
  "해운대",
  "서면",
  "광안리",
  "남포동",
  "동래",
  "기장",
  "수영",
  "사하",
  "연제",
];

let allSpots    = [];
let currentPage = 1;
let activeTab   = "all";
let districtIdx = 0;
let noMoreData  = false;
let isFetching  = false;

async function kakaoFetch(query, code, page) {
  const params = new URLSearchParams({
    query,
    x: "129.0756",
    y: "35.1796",
    radius: 20000,
    size: 15,
    page,
  });
  if (code) params.append("category_group_code", code);
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
  );
  return res.json();
}

async function fetchNextBatch() {
  if (noMoreData || isFetching) return;
  isFetching = true;

  while (districtIdx < DISTRICTS.length) {
    const district = DISTRICTS[districtIdx];
    const base  = TABS[activeTab].query;
    const query = district ? `${base} ${district}` : base;
    const code  = TABS[activeTab].code;
    districtIdx++;

    const results = await Promise.all([
      kakaoFetch(query, code, 1),
      kakaoFetch(query, code, 2),
      kakaoFetch(query, code, 3),
    ]);

    const existingIds = new Set(allSpots.map((s) => s.id));
    let added = 0;

    results.forEach((data) => {
      if (!data.documents) return;
      data.documents.forEach((place) => {
        if (!existingIds.has(place.id)) {
          existingIds.add(place.id);
          allSpots.push(place);
          added++;
        }
      });
    });

    if (added > 0) break;
  }

  if (districtIdx >= DISTRICTS.length) noMoreData = true;
  isFetching = false;
}

async function renderPage() {
  const grid  = document.getElementById("spots-grid");
  const start = (currentPage - 1) * SPOTS_PER_PAGE;
  const spots = allSpots.slice(start, start + SPOTS_PER_PAGE);

  if (spots.length === 0) {
    grid.innerHTML = `<div class="spots-empty">No spots found for this category.</div>`;
    renderPagination();
    return;
  }

  grid.innerHTML = "";

  spots.forEach(async (place) => {
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

  renderPagination();

  // Pre-fetch next batch in background when one page away from end
  if (currentPage * SPOTS_PER_PAGE >= allSpots.length && !noMoreData) {
    fetchNextBatch().then(renderPagination);
  }
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(allSpots.length / SPOTS_PER_PAGE);

  const prev = document.createElement("button");
  prev.className = "page-btn";
  prev.textContent = "←";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => {
    currentPage--;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  pagination.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.textContent = i;
    btn.addEventListener("click", async () => {
      currentPage = i;
      if (i * SPOTS_PER_PAGE > allSpots.length && !noMoreData) {
        await fetchNextBatch();
      }
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    pagination.appendChild(btn);
  }

  const next = document.createElement("button");
  next.className = "page-btn";
  next.textContent = "→";
  next.disabled = currentPage === totalPages && noMoreData;
  next.addEventListener("click", async () => {
    currentPage++;
    if ((currentPage - 1) * SPOTS_PER_PAGE >= allSpots.length && !noMoreData) {
      await fetchNextBatch();
    }
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  pagination.appendChild(next);
}

async function init() {
  allSpots    = [];
  currentPage = 1;
  districtIdx = 0;
  noMoreData  = false;
  isFetching  = false;

  document.getElementById("spots-grid").innerHTML = `<div class="spots-loading">Loading spots…</div>`;
  document.getElementById("pagination").innerHTML = "";

  await fetchNextBatch();
  renderPage();
}

// Read ?tab= from URL
const urlParams = new URLSearchParams(window.location.search);
const tabParam  = urlParams.get("tab");
if (tabParam && TABS[tabParam]) activeTab = tabParam;

document.querySelectorAll(".category-tab").forEach((tab) => {
  tab.classList.remove("active");
  if (tab.dataset.tab === activeTab) tab.classList.add("active");
  tab.addEventListener("click", () => {
    document.querySelectorAll(".category-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.tab;
    init();
  });
});

init();
