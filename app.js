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
map.on("click", function(e) {
  const lat = e.latlng.lat.toFixed(6);
  const lng = e.latlng.lng.toFixed(6);

  L.popup()
    .setLatLng(e.latlng)
    .setContent(`
      <strong>この場所にピンを立てる場合</strong><br>
      lat: ${lat}<br>
      lng: ${lng}<br><br>
      この数値を data.json に入れてください。
    `)
    .openOn(map);
});
