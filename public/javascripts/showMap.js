// authenticate us which our public token
mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlja3RheSIsImEiOiJjazJ1cTdkNzUwOXZnM2hwYTV2Z3ppa3J3In0.RlGvSEVuNTV8qf0t1zfviw";

// create a new map to display
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/nicktay/ck52xo27i147a1cmihrlmbza8",
  center: campground.geometry.coordinates,
  zoom: 15
});

// create a HTML element for the marker of the location
let el = document.createElement("div");
el.className = "marker";

// create a marker for the location and bind it to the map
new mapboxgl.Marker(el)
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      // add popups which display the name of the campground and of the location
      .setHTML(`<strong>${campground.name}<strong>`)
  )
  .addTo(map);

map.resize();
