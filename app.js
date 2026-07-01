const map = L.map("map").setView([35.8563, 139.9023], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let baseData = [];
let localReports = JSON.parse(localStorage.getItem("localReports") || "[]");

const layer = L.layerGroup().addTo(map);

// data.json を読み込む
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    baseData = data;
    renderMap();
  })
  .catch(error => {
    console.error("data.json の読み込みに失敗しました:", error);
    renderMap();
  });

// 地図をクリックしたら緯度・経度を入力欄に入れる
map.on("click", function(e) {
  const lat = e.latlng.lat.toFixed(6);
  const lng = e.latlng.lng.toFixed(6);

  document.getElementById("lat").value = lat;
  document.getElementById("lng").value = lng;

  L.popup()
    .setLatLng(e.latlng)
    .setContent("この場所を入力地点にしました。")
    .openOn(map);
});

// 入力フォームからテスト登録
document.getElementById("reportForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const lat = document.getElementById("lat").value;
  const lng = document.getElementById("lng").value;
  const description = document.getElementById("description").value;

  if (!lat || !lng) {
    alert("先に地図上をクリックして場所を選んでください。");
    return;
  }

  if (!description) {
    alert("内容を入力してください。");
    return;
  }

  const newReport = {
    id: "local-" + Date.now(),
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    urgency: document.getElementById("urgency").value,
    lat: Number(lat),
    lng: Number(lng),
    description: description,
    status: "未対応"
  };

  localReports.push(newReport);
  localStorage.setItem("localReports", JSON.stringify(localReports));

  document.getElementById("description").value = "";

  renderMap();
});

// 表示モード・テーマを変えたら再描画
document.getElementById("mapMode").addEventListener("change", renderMap);
document.getElementById("themeFilter").addEventListener("change", renderMap);

function renderMap() {
  layer.clearLayers();

  const mode = document.getElementById("mapMode").value;
  const theme = document.getElementById("themeFilter").value;

  const allData = [...baseData, ...localReports];

  const filteredData = allData.filter(item => {
    if (theme === "all") return true;
    return item.category === theme;
  });

  if (mode === "pins") {
    renderPins(filteredData);
  } else if (mode === "area") {
    renderAreaSummary(filteredData);
  } else if (mode === "heat") {
    renderHeatStyle(filteredData);
  }
}

function renderPins(data) {
  data.forEach(item => {
    const color = getColor(item);

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: 10,
      color: color,
      fillColor: color,
      fillOpacity: 0.7
    }).addTo(layer);

    marker.bindPopup(`
      <strong>${item.type}</strong><br>
      分類：${item.category}<br>
      緊急度：${item.urgency}<br>
      状態：${item.status}<br>
      内容：${item.description}
    `);
  });
}

// 緯度経度を少し丸めて、近い場所を同じエリアとして集計
function renderAreaSummary(data) {
  const groups = {};

  data.forEach(item => {
    const areaLat = item.lat.toFixed(3);
    const areaLng = item.lng.toFixed(3);
    const key = `${areaLat},${areaLng}`;

    if (!groups[key]) {
      groups[key] = {
        lat: Number(areaLat),
        lng: Number(areaLng),
        count: 0,
        categories: {}
      };
    }

    groups[key].count += 1;

    if (!groups[key].categories[item.category]) {
      groups[key].categories[item.category] = 0;
    }

    groups[key].categories[item.category] += 1;
  });

  Object.values(groups).forEach(group => {
    const radius = Math.min(10 + group.count * 5, 50);

    const marker = L.circleMarker([group.lat, group.lng], {
      radius: radius,
      color: "purple",
      fillColor: "purple",
      fillOpacity: 0.4
    }).addTo(layer);

    const categoryText = Object.entries(group.categories)
      .map(([category, count]) => `${category}：${count}件`)
      .join("<br>");

    marker.bindPopup(`
      <strong>このエリアの課題</strong><br>
      合計：${group.count}件<br>
      ${categoryText}
    `);
  });
}

// 本格的なヒートマップではなく、件数が多いほど大きく濃く見せる簡易版
function renderHeatStyle(data) {
  data.forEach(item => {
    const weight = getUrgencyWeight(item.urgency);

    L.circle([item.lat, item.lng], {
      radius: 80 * weight,
      color: "red",
      fillColor: "red",
      fillOpacity: 0.15
    }).addTo(layer);
  });
}

function getColor(item) {
  if (item.type === "SOS") return "red";
  if (item.type === "支援できます") return "green";
  if (item.type === "情報共有") return "orange";
  return "blue";
}

function getUrgencyWeight(urgency) {
  if (urgency === "高") return 3;
  if (urgency === "中") return 2;
  return 1;
}
