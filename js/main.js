// Initialize the map centered on Wisconsin
var map = L.map('map').setView([44.5, -89.5], 7);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    minZoom: 7,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load both datasets before applying styling
let priceMap = {};  // Stores ZIP-to-price mapping
let geojsonLoaded = false;
let csvLoaded = false;

// Function to apply home price data once both datasets are ready
function applyPriceData() {
    if (!geojsonLoaded || !csvLoaded) return; // Wait until both are ready

    wiZipCodes.eachLayer(function(layer) {
        let zip = layer.feature.properties.ZCTA5CE10;
        if (zip in priceMap) {
            layer.feature.properties.median_price = priceMap[zip];
            layer.setStyle(styleZipCodes(layer.feature));
        }
    });
}

// Load Wisconsin zip codes GeoJSON
var wiZipCodes = new L.GeoJSON.AJAX("data/wi_zipcodes.geojson", {
    style: styleZipCodes,
    onEachFeature: onEachFeature
});

// Mark GeoJSON as loaded and try to apply data
wiZipCodes.on('data:loaded', function() {
    geojsonLoaded = true;
    applyPriceData();
});

// Load CSV housing data and store in priceMap
d3.csv("data/SFR.csv").then(function(data) {
    data.forEach(row => {
        let zip = row["ZIP"];
        let price = +row["SFR"];
        priceMap[zip] = price;
    });

    csvLoaded = true;
    applyPriceData();
});

// LEGEND
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Median Home Price</h4>";
    div.innerHTML += '<i style="background: #66000D"></i> $600,000+<br>';
    div.innerHTML += '<i style="background: #800026"></i> $500,000 - $599,999<br>';
    div.innerHTML += '<i style="background: #BD0026"></i> $400,000 - $499,999<br>';
    div.innerHTML += '<i style="background: #E31A1C"></i> $300,000 - $399,999<br>';
    div.innerHTML += '<i style="background: #FC4E2A"></i> $250,000 - $299,999<br>';
    div.innerHTML += '<i style="background: #FD8D3C"></i> $150,000 - $249,999<br>';
    div.innerHTML += '<i style="background: #FED976"></i> $75,000 - $149,999<br>';
    div.innerHTML += '<i style="background: #FFEDA0"></i> Below $75,000<br>';
    div.innerHTML += '<i style="background: #D3D3D3"></i> No Data<br>';
    return div;
};

legend.addTo(map);

// Show welcome popup on page load
document.addEventListener("DOMContentLoaded", function () {
    let popup = document.getElementById("welcome-popup");
    let closeBtn = document.getElementById("close-popup");

    closeBtn.addEventListener("click", function () {
        popup.style.display = "none";
    });

    // Show popup initially
    popup.style.display = "flex";
});
