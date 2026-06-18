function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
// 避難所・給水所データを読み込む
fetch("data/shelters.geojson")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 8
        });
      },
      onEachFeature: function (feature, layer) {
        const name = feature.properties.name || "名称未設定";
        const type = feature.properties.type || "施設";
        const memo = feature.properties.memo || "";

        layer.bindPopup(`
          <strong>${name}</strong><br>
          種別：${type}<br>
          ${memo}
        `);
      }
    }).addTo(map);
  })
  .catch(function (error) {
    console.error("GeoJSONを読み込めませんでした。", error);
  });
