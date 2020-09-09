export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoiam9yZ2VzY3JpcHQiLCJhIjoiY2tlbG0xdzE0MGlqejJ5bXN2dHNycTdzMCJ9.r9f8EvZrmU_7xSHVNxJ4YA";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/jorgescript/ckeln8rrn1ax319qni6rfv84x",
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((location) => {
    /* Creamos el elemento que estara dentro del mapa */
    const el = document.createElement("div");
    el.className = "marker";
    /* Añadimos el elemento al mapa */
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(location.coordinates)
      .addTo(map);
    /* Pop-up */
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);
    /* Hacemos el que mapa incluya la posicion actual */
    bounds.extend(location.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
