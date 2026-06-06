function loadFeaturedSpots() {
  var request = $.ajax({
    method: "GET",
    url: "https://dapi.kakao.com/v2/local/search/keyword.json",
    data: {
      query: "부산 명소",
      x: "129.0756",
      y: "35.1796",
      radius: 20000,
      size: 4,
      page: 1
    },
    headers: { Authorization: "KakaoAK " + KAKAO_API_KEY }
  });

  request.done(function (data) {
    if (!data.documents || data.documents.length === 0) return;

    var grid = document.getElementById("featured-grid");

    for (var i = 0; i < data.documents.length; i++) {
      let place = data.documents[i];
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
  });

  request.fail(function (jqXHR, textStatus) {
    console.error("Featured spots failed: " + textStatus);
  });
}

loadFeaturedSpots();
