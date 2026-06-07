var PROXY = "/api/photos";

function fetchPlacePhoto(placeName) {
  var request = $.ajax({
    method: "GET",
    url: PROXY,
    data: {
      q: placeName + " 부산",
      count: 1
    }
  });

  return request.then(
    function (data) {
      if (data.items && data.items.length > 0) {
        return data.items[0].link;
      }
      return null;
    },
    function () {
      return null;
    }
  );
}

function fetchPlacePhotos(placeName, categoryCode, count) {
  if (!count) count = 6;

  var request = $.ajax({
    method: "GET",
    url: PROXY,
    data: {
      q: placeName + " 부산",
      count: count
    }
  });

  return request.then(
    function (data) {
      if (data.items && data.items.length > 0) {
        var links = [];
        for (var i = 0; i < data.items.length; i++) {
          links.push(data.items[i].link);
        }
        return links;
      }
      return [];
    },
    function () {
      return [];
    }
  );
}
