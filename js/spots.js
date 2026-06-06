var SPOTS_PER_PAGE = 9;

var TABS = {
  all:        { query: "부산 명소",  code: null  },
  cafe:       { query: "카페",       code: "CE7" },
  restaurant: { query: "맛집",       code: "FD6" },
  tourist:    { query: "관광명소",   code: "AT4" },
  culture:    { query: "문화시설",   code: "CT1" },
};

var DISTRICTS = [
  "",
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

var allSpots    = [];
var currentPage = 1;
var activeTab   = "all";
var districtIdx = 0;
var noMoreData  = false;
var isFetching  = false;

async function kakaoFetch(query, code, page) {
  var requestData = {
    query: query,
    x: "129.0756",
    y: "35.1796",
    radius: 20000,
    size: 15,
    page: page
  };

  if (code) {
    requestData.category_group_code = code;
  }

  return await $.ajax({
    method: "GET",
    url: "https://dapi.kakao.com/v2/local/search/keyword.json",
    data: requestData,
    headers: { Authorization: "KakaoAK " + KAKAO_API_KEY }
  });
}

async function fetchNextBatch() {
  if (noMoreData || isFetching) return;
  isFetching = true;

  while (districtIdx < DISTRICTS.length) {
    var district = DISTRICTS[districtIdx];
    var base  = TABS[activeTab].query;
    var query = district ? base + " " + district : base;
    var code  = TABS[activeTab].code;
    districtIdx++;

    var result1 = await kakaoFetch(query, code, 1);
    var result2 = await kakaoFetch(query, code, 2);
    var result3 = await kakaoFetch(query, code, 3);

    var existingIds = {};
    for (var i = 0; i < allSpots.length; i++) {
      existingIds[allSpots[i].id] = true;
    }

    var added = 0;
    var results = [result1, result2, result3];

    for (var r = 0; r < results.length; r++) {
      var docs = results[r].documents;
      if (!docs) continue;
      for (var j = 0; j < docs.length; j++) {
        let place = docs[j];
        if (!existingIds[place.id]) {
          existingIds[place.id] = true;
          allSpots.push(place);
          added++;
        }
      }
    }

    if (added > 0) break;
  }

  if (districtIdx >= DISTRICTS.length) noMoreData = true;
  isFetching = false;
}

async function renderPage() {
  var grid  = document.getElementById("spots-grid");
  var start = (currentPage - 1) * SPOTS_PER_PAGE;
  var spots = allSpots.slice(start, start + SPOTS_PER_PAGE);

  if (spots.length === 0) {
    grid.innerHTML = "<div class='spots-empty'>No spots found for this category.</div>";
    renderPagination();
    return;
  }

  grid.innerHTML = "";

  for (var i = 0; i < spots.length; i++) {
    let place = spots[i];
    let card = createSpotCard(place, null);
    grid.appendChild(card);

    fetchPlacePhoto(place.place_name).then(function (photoUrl) {
      if (photoUrl) {
        var placeholder = card.querySelector(".card-photo-placeholder");
        if (placeholder) {
          var img = document.createElement("img");
          img.src = photoUrl;
          img.alt = place.place_name;
          img.className = "card-photo";
          placeholder.replaceWith(img);
        }
      }
    });
  }

  renderPagination();

  if (currentPage * SPOTS_PER_PAGE >= allSpots.length && !noMoreData) {
    fetchNextBatch().then(renderPagination);
  }
}

function renderPagination() {
  var pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  var totalPages = Math.ceil(allSpots.length / SPOTS_PER_PAGE);

  var prev = document.createElement("button");
  prev.className = "page-btn";
  prev.textContent = "←";
  prev.disabled = (currentPage === 1);
  prev.addEventListener("click", function () {
    currentPage--;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  pagination.appendChild(prev);

  for (var i = 1; i <= totalPages; i++) {
    let pageNum = i;
    var btn = document.createElement("button");
    btn.className = (pageNum === currentPage) ? "page-btn active" : "page-btn";
    btn.textContent = pageNum;
    btn.addEventListener("click", async function () {
      currentPage = pageNum;
      if (pageNum * SPOTS_PER_PAGE > allSpots.length && !noMoreData) {
        await fetchNextBatch();
      }
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    pagination.appendChild(btn);
  }

  var next = document.createElement("button");
  next.className = "page-btn";
  next.textContent = "→";
  next.disabled = (currentPage === totalPages && noMoreData);
  next.addEventListener("click", async function () {
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

  document.getElementById("spots-grid").innerHTML = "<div class='spots-loading'>Loading spots…</div>";
  document.getElementById("pagination").innerHTML = "";

  await fetchNextBatch();
  renderPage();
}

var urlSearch = window.location.search;
var urlTab = "";
if (urlSearch.indexOf("tab=") !== -1) {
  urlTab = urlSearch.split("tab=")[1].split("&")[0];
}
if (urlTab && TABS[urlTab]) activeTab = urlTab;

var tabButtons = document.querySelectorAll(".category-tab");
for (var t = 0; t < tabButtons.length; t++) {
  let tab = tabButtons[t];
  tab.classList.remove("active");
  if (tab.dataset.tab === activeTab) tab.classList.add("active");

  tab.addEventListener("click", function () {
    var allTabs = document.querySelectorAll(".category-tab");
    for (var j = 0; j < allTabs.length; j++) {
      allTabs[j].classList.remove("active");
    }
    tab.classList.add("active");
    activeTab = tab.dataset.tab;
    init();
  });
}

init();
