// Initialize the map centered on Wisconsin
var map = L.map('map').setView([44.5, -89.5], 7);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    minZoom: 7,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



// Function to get color based on home price
function getColor(price) {
    return price > 600000 ? '#66000D' : // very dark red
           price > 500000 ? '#800026' : // dark red
           price > 400000 ? '#BD0026' : // red
           price > 300000 ? '#E31A1C' : // light red
           price > 250000 ? '#FC4E2A' : // orange-red
           price > 150000 ? '#FD8D3C' : // orange
           price > 75000  ? '#FED976' : // yellow-orange
           price > 1      ? '#FFEDA0' : // vanilla
                            '#D3D3D3'; // light gray for no data 
}


// Function to style zip code polygons
function styleZipCodes(feature) {
    return {
        color: "black",
        weight: 1,
        fillColor: getColor(feature.properties.median_price || 0), 
        fillOpacity: 0.7
    };
}

// Function to handle click event and show popups
function onEachFeature(feature, layer) {
    layer.on("click", function () {
        let zip = feature.properties.ZCTA5CE10 || "Unknown"; //field name is weird (ZCTA5CE10)
        let price = feature.properties.median_price ? `$${feature.properties.median_price.toLocaleString()}` : "No Data";

        layer.bindPopup(`<b>ZIP Code:</b> ${zip}<br><b>Median Home Price:</b> ${price}`).openPopup();
    });
}

// Load Wisconsin zip codes GeoJSON
var wiZipCodes = new L.GeoJSON.AJAX("data/wi_zipcodes.geojson", {
    style: styleZipCodes,
    onEachFeature: onEachFeature
}).addTo(map);

// Load CSV housing data and match with ZIP codes
d3.csv("data/SFR.csv").then(function(data) {
    let priceMap = {};
    
    data.forEach(row => {
        let zip = row["ZIP"];
        let price = +row["SFR"];
        priceMap[zip] = price;
    });

    wiZipCodes.on('data:loaded', function() {
        setTimeout(() => { // Small delay to ensure CSV is loaded
            wiZipCodes.eachLayer(function(layer) {
                let zip = layer.feature.properties.ZCTA5CE10;
                if (zip in priceMap) {
                    layer.feature.properties.median_price = priceMap[zip];
                    layer.setStyle(styleZipCodes(layer.feature));
                }
            });
        }, 100); // 100ms delay ensures proper data sync
    });
    
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
