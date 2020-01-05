mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlja3RheSIsImEiOiJjazJ1cTdkNzUwOXZnM2hwYTV2Z3ppa3J3In0.RlGvSEVuNTV8qf0t1zfviw";

// set basic map
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-94.955795, 40.764287],
  zoom: 3
});

// add search bar
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl
  })
);

// when the map has completed the loading
map.on("load", function() {
  // add the locations of the campgrounds
  map.addSource("campgrounds", {
    type: "geojson",
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });
  // add circles (which changes depending on the distances) to the clusters
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "campgrounds",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        100,
        "#f1f075",
        750,
        "#f28cb1"
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
    }
  });
  // add the number of the points the clusters has
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "campgrounds",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12
    }
  });
  // add a sample blue circle to the points which are not clusters
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "campgrounds",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 5,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff"
    }
  });
  // when the user clicks on an unclustered-point
  map.on("click", "unclustered-point", function(e) {
    var coordinates = e.features[0].geometry.coordinates;
    var description = e.features[0].properties.description;
    console.log(e.features);

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // show a popup over that point with properties.description as content
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  // when the user clicks a cluster
  map.on("click", "clusters", function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    var clusterId = features[0].properties.cluster_id;

    // zoom the clicked cluster out
    map
      .getSource("campgrounds")
      .getClusterExpansionZoom(clusterId, function(err, zoom) {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
  });
});

// function to change the cursor from the hand to a pointer
var mouseenterCursor = function() {
  map.getCanvas().style.cursor = "pointer";
};
// function to change the cursor from the pointer to the hand
var mouseLeaveCursor = function() {
  map.getCanvas().style.cursor = "";
};

// when the users enter with the mouse on a cluster change the cursor to a pointer
map.on("mouseenter", "clusters", mouseenterCursor);
// when the users leave with the mouse on a cluster change the cursor back to a hand
map.on("mouseleave", "clusters", mouseLeaveCursor);
// when the users enter with the mouse on an unclusterd-point change the cursor to a pointer
map.on("mouseenter", "unclustered-point", mouseenterCursor);
// when the users enter with the mouse on an unclusterd-point change the cursor back to a hand
map.on("mouseleave", "unclustered-point", mouseLeaveCursor);
