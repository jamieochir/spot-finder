//for the header
window.addEventListener("scroll", function () {
  const header = document.getElementById("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
    header.classList.remove("scrolling");
  } else if (window.scrollY > 20) {
    header.classList.add("scrolling");
    header.classList.remove("scrolled");
  } else {
    header.classList.remove("scrolling");
    header.classList.remove("scrolled");
  }
});

const KAKAO_API_KEY = "d80e4b6959493a29990be815c71b87b9";
const BUSAN_X = "129.0756";
const BUSAN_Y = "35.1796";

// Categories on kakao developers

// MT1	Supermarket
// CS2	Convenience store
// PS3	Daycare center, kindergarten
// SC4	School
// AC5	Hagwon such as cram school, private learning institute
// PK6	Parking lot
// OL7	Gas station, LPG station
// SW8	Subway station
// BK9	Bank
// CT1	Cultural facility
// AG2	Real estate agency
// PO3	Public institutions
// AT4	Attractions
// AD5	Accommodation
// FD6	Restaurant
// CE7	Cafe
// HP8	Hospital
// PM9	Pharmacy

const ALLOWED_CATEGORIES = new Set(["CT1", "AT4", "AD5", "FD6", "CE7"]);

const BLOCKED_CATEGORIES = new Set([
  "MT1",
  "CS2",
  "PS3",
  "SC4",
  "AC5",
  "PK6",
  "OL7",
  "SW8",
  "BK9",
  "AG2",
  "PO3",
  "HP8",
  "PM9",
]);

const CATEGORY_ICON = {
  CE7: { emoji: "☕", color: "#fff3e0", label: "Cafe" },
  FD6: { emoji: "🍽️", color: "#fce4ec", label: "Restaurant" },
  AT4: { emoji: "🏛️", color: "#e8f5e9", label: "Tourist Spot" },
  CT1: { emoji: "🎭", color: "#ede7f6", label: "Culture" },
  AD5: { emoji: "🏨", color: "#e3f2fd", label: "Accommodation" },
};

const DEFAULT_ICON = { emoji: "📍", color: "#f5f5f5", label: null };

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

let debounceTimer;

searchInput.addEventListener("input", function () {
  var query = this.value.trim();

  clearTimeout(debounceTimer);
  searchResults.innerHTML = "";

  if (query.length < 1) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.innerHTML = "<div class='search-no-result'>Searching...</div>";
  searchResults.style.display = "block";

  debounceTimer = setTimeout(function () {
    searchKakao(query);
  }, 350);
});

// Main kakao request
function searchKakao(query) {
  var request = $.ajax({
    method: "GET",
    url: "https://dapi.kakao.com/v2/local/search/keyword.json",
    data: {
      query: query,
      x: BUSAN_X,
      y: BUSAN_Y,
      radius: 20000,
      size: 15,
    },
    headers: { Authorization: "KakaoAK " + KAKAO_API_KEY },
  });

  request.done(function (data) {
    searchResults.innerHTML = "";

    var places = data.documents;
    var count = 0;

    for (var i = 0; i < places.length && count < 8; i++) {
      let place = places[i];

      if (BLOCKED_CATEGORIES.has(place.category_group_code)) {
        continue;
      }

      let icon = CATEGORY_ICON[place.category_group_code] || DEFAULT_ICON;

      let tag;
      if (icon.label) {
        tag = icon.label;
      } else if (place.category_group_name) {
        tag = place.category_group_name;
      } else {
        tag = "Spot";
      }

      let item = document.createElement("div");
      item.className = "search-item";
      item.innerHTML =
        "<div class='search-item-icon' style='background:" +
        icon.color +
        "'>" +
        icon.emoji +
        "</div>" +
        "<div class='search-item-info'>" +
        "<div class='search-item-top'>" +
        "<span class='search-item-name'>" +
        place.place_name +
        "</span>" +
        "<span class='search-item-tag'>" +
        tag +
        "</span>" +
        "</div>" +
        "<p class='search-item-desc'>" +
        place.address_name +
        "</p>" +
        "</div>";

      item.addEventListener("click", function () {
        var detailUrl = "/html/detail.html?";
        detailUrl += "name="          + place.place_name;
        detailUrl += "&address="      + place.address_name;
        detailUrl += "&category="     + tag;
        detailUrl += "&categoryCode=" + (place.category_group_code || "");
        detailUrl += "&x="            + place.x;
        detailUrl += "&y="            + place.y;
        detailUrl += "&url="          + (place.place_url || "");
        window.location.href = detailUrl;
      });

      searchResults.appendChild(item);
      count++;

      // Ask Naver for a photo of this place.
      // .then() works like request.done() - it runs when the photo arrives.
      // If a photo URL is found, replace the emoji icon with the actual image.
      fetchPlacePhoto(place.place_name).then(function (photoUrl) {
        if (photoUrl) {
          var iconEl = item.querySelector(".search-item-icon");
          iconEl.style.background = "none";
          iconEl.style.padding = "0";
          iconEl.style.overflow = "hidden";
          iconEl.innerHTML =
            "<img src='" +
            photoUrl +
            "' alt='" +
            place.place_name +
            "' class='search-item-photo' />";
        }
      });
    }

    if (count === 0) {
      searchResults.innerHTML =
        "<div class='search-no-result'>No spots found</div>";
    }
  });

  request.fail(function (jqXHR, textStatus) {
    console.error("Kakao request failed: " + textStatus);
    searchResults.innerHTML =
      "<div class='search-no-result'>Something went wrong</div>";
  });
}

document.addEventListener("click", function (e) {
  if (!e.target.closest(".search-wrapper")) {
    searchResults.style.display = "none";
  }
});
