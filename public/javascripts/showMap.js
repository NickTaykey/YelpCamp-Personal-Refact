// authenticate us which our public token
mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlja3RheSIsImEiOiJjazJ1cTdkNzUwOXZnM2hwYTV2Z3ppa3J3In0.RlGvSEVuNTV8qf0t1zfviw";

// create a new map to display
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
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
      .setHTML(campground.propreties.description)
  )
  .addTo(map);

/* let canvas = document.getElementsByClassName("mapboxgl-canvas")[0];
canvas.style.display = "block;";
canvas.style.width = "600px!important;"; */

map.resize();
