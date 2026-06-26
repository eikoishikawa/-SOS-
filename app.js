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
const map = L.map("map").setView([35.8563, 139.9023], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      let iconColor = "blue";

      if (item.type === "SOS") {
        iconColor = "red";
      } else if (item.type === "支援できます") {
        iconColor = "green";
      } else if (item.type === "情報共有") {
        iconColor = "orange";
      }

      const marker = L.circleMarker([item.lat, item.lng], {
        radius: 10,
        color: iconColor,
        fillColor: iconColor,
        fillOpacity: 0.7
      }).addTo(map);

      marker.bindPopup(`
        <strong>${item.type}</strong><br>
        分類：${item.category}<br>
        緊急度：${item.urgency}<br>
        状態：${item.status}<br>
        内容：${item.description}
      `);
    });
  })
  .catch(error => {
    console.error("データの読み込みに失敗しました:", error);
  });
