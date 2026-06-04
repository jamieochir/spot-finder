function createSpotCard(place, photoUrl) {
  let icon = CATEGORY_ICON[place.category_group_code] || DEFAULT_ICON;

  let tag;
  if (icon.label) {
    tag = icon.label;
  } else if (place.category_group_name) {
    tag = place.category_group_name;
  } else {
    tag = "Spot";
  }

  let photoHtml;
  if (photoUrl) {
    photoHtml = "<img src='" + photoUrl + "' alt='" + place.place_name + "' class='card-photo' />";
  } else {
    photoHtml = "<div class='card-photo-placeholder'>" + icon.emoji + "</div>";
  }

  let detailUrl = "/html/detail.html?";
  detailUrl += "name="          + place.place_name;
  detailUrl += "&address="      + place.address_name;
  detailUrl += "&category="     + tag;
  detailUrl += "&categoryCode=" + (place.category_group_code || "");
  detailUrl += "&x="            + place.x;
  detailUrl += "&y="            + place.y;
  detailUrl += "&url="          + (place.place_url || "");

  let card = document.createElement("div");
  card.className = "spot-card";
  card.innerHTML =
    "<div class='card-photo-wrapper'>" +
      photoHtml +
      "<span class='card-badge'>" + tag + "</span>" +
    "</div>" +
    "<div class='card-body'>" +
      "<h3 class='card-title'>" + place.place_name + "</h3>" +
      "<p class='card-address'>📍 " + place.address_name + "</p>" +
      "<a href='" + detailUrl + "' class='card-btn'>View Details →</a>" +
    "</div>";

  return card;
}
