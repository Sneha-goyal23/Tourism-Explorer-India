// Javascript for explore page map
// Addind mao of India using open strret map
var map = L.map("map").setView([22.9734, 78.6569], 4);

L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);

// GeoServer WMS layer
// State Layer
var stateBoundary = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:state_boundary_",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
).addTo(map); // state layer will show on the map

// District Boundary Layer
var districtBoundary = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:district_boundary_n",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
);

// Landuse Layer
var landuse = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:landuse_new_n",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
);

// Natural Layer
var natural = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:natural",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
);

// Places Layer
var places = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:places_new",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
);

// POFW Layer
var pofw = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:pofw",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
);

// POIS Layer
var pois = L.tileLayer.wms(
    "http://localhost:8080/geoserver/tourism/wms",
    {
        layers: "tourism:pois_new",
        format: "image/png",
        transparent: true,
        version: "1.1.1"
    }
);



//creting drop down for states layer
const stateDropdown = document.getElementById("search-state");
const stateWFSUrl ="http://localhost:8080/geoserver/tourism/ows" +"?service=WFS" +"&version=1.0.0" +"&request=GetFeature" +"&typeName=tourism:state_boundary_" +"&outputFormat=application/json" +"&propertyName=STATE";

fetch(stateWFSUrl)
.then(response => {
    if (!response.ok) throw new Error("Failed to load states");
    return response.json();
})
.then(data => {
    const states = [
        ...new Set(
            data.features
                .map(feature => feature.properties.STATE)
                .filter(state => state && state.trim() !== "")
        )
    ].sort((a, b) => a.localeCompare(b));

    stateDropdown.innerHTML = '<option value="">State</option>';

    states.forEach(state => {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateDropdown.appendChild(option);
    });
})
.catch(error => {
    console.error("State dropdown error:", error);
});



//fetching district according to the state layer being selected and zoom to it
const districtDropdown = document.getElementById("search-district");
const stateSelect = document.getElementById("search-state");

const districtWFSUrl =
    "http://localhost:8080/geoserver/tourism/ows";

let selectedDistrictBoundary = null;
let districtGeoJSON = null;

// Fetch district boundaries
function loadDistricts() {
    const selectedState = stateSelect.value;

    districtDropdown.innerHTML =
        '<option value="">Loading districts...</option>';

    if (!selectedState) {
        districtDropdown.innerHTML =
            '<option value="">District</option>';
        return;
    }

    const params = new URLSearchParams({
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: "tourism:district_boundary_n",
        outputFormat: "application/json",
        srsName: "EPSG:4326",
        CQL_FILTER: `STATE_UT='${selectedState.replace(/'/g, "''")}'`
    });

    fetch(`${districtWFSUrl}?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch districts");
            }
            return response.json();
        })
        .then(data => {
            districtGeoJSON = data;

            districtDropdown.innerHTML =
                '<option value="">Select District</option>';

            data.features
                .sort((a, b) =>
                    a.properties.DISTRICT.localeCompare(
                        b.properties.DISTRICT
                    )
                )
                .forEach(feature => {
                    const option = document.createElement("option");
                    option.value = feature.properties.DISTRICT;
                    option.textContent = feature.properties.DISTRICT;
                    districtDropdown.appendChild(option);
                });
        })
        .catch(error => {
            console.error("District loading error:", error);
            districtDropdown.innerHTML =
                '<option value="">Failed to load districts</option>';
        });
}

// Reload districts when state changes
stateSelect.addEventListener("change", () => {
    if (selectedDistrictBoundary) {
        map.removeLayer(selectedDistrictBoundary);
        selectedDistrictBoundary = null;
    }

    loadDistricts();
});

// Zoom to selected district and draw its boundary
districtDropdown.addEventListener("change", () => {
    const selectedDistrict = districtDropdown.value;

    if (!selectedDistrict || !districtGeoJSON) return;

    const feature = districtGeoJSON.features.find(
        f => f.properties.DISTRICT === selectedDistrict
    );

    if (!feature) return;

    if (selectedDistrictBoundary) {
        map.removeLayer(selectedDistrictBoundary);
    }

    selectedDistrictBoundary = L.geoJSON(feature, {
        style: {
            color: "#FF5722",
            weight: 3,
            opacity: 1,
            fillColor: "#FFB74D",
            fillOpacity: 0.15
        }
    }).addTo(map);

    map.fitBounds(selectedDistrictBoundary.getBounds(), {
        padding: [20, 20]
    });

    selectedDistrictBoundary.bringToFront();
});



// Cities & Towns — GeoServer WFS
const placesCategory = document.getElementById("search-place");
const districtSelect = document.getElementById("search-district");

const citiesLayerUrl =
    "http://localhost:8080/geoserver/tourism/ows";

let citiesTownLayer = null;

function loadCitiesAndTowns() {
    const districtName = districtSelect.value;

    // Remove previously displayed cities and towns
    if (citiesTownLayer) {
        map.removeLayer(citiesTownLayer);
        citiesTownLayer = null;
    }

   if (!districtName || placesCategory.value !== "places") {
    return;
    }

    // Get the selected district boundary
    const districtFeature = districtGeoJSON?.features.find(
        feature => feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) {
        console.error("Selected district boundary not found.");
        return;
    }

    // Fetch places from GeoServer
    const params = new URLSearchParams({
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: "tourism:places_new",
        outputFormat: "application/json",
        srsName: "EPSG:4326"
    });

    fetch(`${citiesLayerUrl}?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load places.");
            }
            return response.json();
        })
        .then(data => {
           // Keep only places inside the selected district
            const districtPlaces = data.features.filter(feature =>
                feature.geometry &&
                turf.booleanPointInPolygon(feature, districtFeature)
            );

            // Show only 10 place names at a time
            function displayCitiesAndTowns() {
                if (citiesTownLayer) {
                    map.removeLayer(citiesTownLayer);
                }

                const visiblePlaces = districtPlaces
                    .filter(feature => {
                        const latlng = L.latLng(
                            feature.geometry.coordinates[1],
                            feature.geometry.coordinates[0]
                        );

                        return map.getBounds().contains(latlng);
                    })
                    .slice(0, 10);

                citiesTownLayer = L.geoJSON(visiblePlaces, {
                    pointToLayer: (feature, latlng) =>
                        L.circleMarker(latlng, {
                            radius: 5,
                            color: "#ffffff",
                            weight: 1,
                            fillColor: "#8D5EB7",
                            fillOpacity: 1
                        }),

                    onEachFeature: (feature, layer) => {
                        const placeName = feature.properties.name;

                        if (placeName) {
                            layer.bindTooltip(placeName, {
                                permanent: true,
                                direction: "top",
                                offset: [0, -5]
                            });
                        }
                    }
                }).addTo(map);
}

// Display initial 10 places
displayCitiesAndTowns();

// Update places when the user zooms or moves the map
map.on("moveend", displayCitiesAndTowns);
        })
        .catch(error => {
            console.error("Cities & Towns error:", error);
        });
}

// Load when the category changes
placesCategory.addEventListener("change", loadCitiesAndTowns);

// Reload when the district changes
districtSelect.addEventListener("change", loadCitiesAndTowns);



// Places of Worship
let worshipLayer = null;
let worshipFeatures = [];

function displayPlacesOfWorship() {
    if (worshipLayer) {
        map.removeLayer(worshipLayer);
        worshipLayer = null;
    }

    if (districtSelect.value === "" ||
        placesCategory.value !== "worship") {
        return;
    }

    const visiblePlaces = worshipFeatures
        .filter(feature => {
            if (!feature.geometry ||
                feature.geometry.type !== "Point") {
                return false;
            }

            const [lng, lat] = feature.geometry.coordinates;
            return map.getBounds().contains(L.latLng(lat, lng));
        })
        .slice(0, 10);

    worshipLayer = L.geoJSON(visiblePlaces, {
        pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, {
                radius: 6,
                color: "#FFFFFF",
                weight: 1.5,
                fillColor: "#191970",
                fillOpacity: 0.9
            }),

        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;

            if (name) {
                layer.bindTooltip(name, {
                    permanent: true,
                    direction: "top",
                    offset: [0, -6]
                });
            }
        }
    }).addTo(map);
}

function loadPlacesOfWorship() {
    const districtName = districtSelect.value;

    if (worshipLayer) {
        map.removeLayer(worshipLayer);
        worshipLayer = null;
    }

    worshipFeatures = [];

    if (!districtName || placesCategory.value !== "worship") {
        return;
    }

    const districtFeature = districtGeoJSON?.features.find(
        feature => feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) return;

    const params = new URLSearchParams({
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: "tourism:pofw",
        outputFormat: "application/json",
        srsName: "EPSG:4326"
    });

    fetch(`http://localhost:8080/geoserver/tourism/ows?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load places of worship");
            }
            return response.json();
        })
        .then(data => {
            worshipFeatures = data.features.filter(feature =>
                feature.geometry &&
                turf.booleanPointInPolygon(feature, districtFeature)
            );

            displayPlacesOfWorship();
        })
        .catch(error => {
            console.error("Places of Worship error:", error);
        });
}

// Update when category or district changes
placesCategory.addEventListener("change", loadPlacesOfWorship);
districtSelect.addEventListener("change", loadPlacesOfWorship);

// Update visible places after map movement or zoom
map.on("moveend", displayPlacesOfWorship);



// Natural Attractions
let naturalLayer = null;
let naturalFeatures = [];

function displayNaturalAttractions() {
    if (naturalLayer) {
        map.removeLayer(naturalLayer);
        naturalLayer = null;
    }

    if (
        !districtSelect.value ||
        placesCategory.value !== "natural"
    ) {
        return;
    }

    const visiblePlaces = naturalFeatures
        .filter(feature => {
            if (
                !feature.geometry ||
                feature.geometry.type !== "Point"
            ) {
                return false;
            }

            const [lng, lat] = feature.geometry.coordinates;
            return map.getBounds().contains(L.latLng(lat, lng));
        })
        .slice(0, 10);

    naturalLayer = L.geoJSON(visiblePlaces, {
        pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, {
                radius: 6,
                color: "#FFFFFF",
                weight: 1.5,
                fillColor: "#8B4513",
                fillOpacity: 0.9
            }),

        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;

            if (name) {
                layer.bindTooltip(name, {
                    permanent: true,
                    direction: "top",
                    offset: [0, -6]
                });
            }
        }
    }).addTo(map);
}

function loadNaturalAttractions() {
    const districtName = districtSelect.value;

    if (naturalLayer) {
        map.removeLayer(naturalLayer);
        naturalLayer = null;
    }

    naturalFeatures = [];

    if (!districtName || placesCategory.value !== "natural") {
        return;
    }

    const districtFeature = districtGeoJSON?.features.find(
        feature => feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) return;

    const params = new URLSearchParams({
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: "tourism:natural",
        outputFormat: "application/json",
        srsName: "EPSG:4326"
    });

    fetch(`http://localhost:8080/geoserver/tourism/ows?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load natural attractions");
            }
            return response.json();
        })
        .then(data => {
            naturalFeatures = data.features.filter(feature =>
                feature.geometry &&
                turf.booleanPointInPolygon(feature, districtFeature)
            );

            displayNaturalAttractions();
        })
        .catch(error => {
            console.error("Natural Attractions error:", error);
        });
}

// Update when category or district changes
placesCategory.addEventListener("change", loadNaturalAttractions);
districtSelect.addEventListener("change", loadNaturalAttractions);

// Update visible attractions after map movement or zoom
map.on("moveend", displayNaturalAttractions);



// Parks & Forests — Landuse
let landuseLayer = null;
let landuseFeatures = [];

function displayLandusePlaces() {
    if (landuseLayer) {
        map.removeLayer(landuseLayer);
        landuseLayer = null;
    }

    if (
        !districtSelect.value ||
        placesCategory.value !== "landuse"
    ) {
        return;
    }

    const visiblePlaces = landuseFeatures
        .filter(feature => {
            if (
                !feature.geometry ||
                feature.geometry.type !== "Point"
            ) {
                return false;
            }

            const [lng, lat] = feature.geometry.coordinates;
            return map.getBounds().contains(L.latLng(lat, lng));
        })
        .slice(0, 10);

    landuseLayer = L.geoJSON(visiblePlaces, {
        pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, {
                radius: 6,
                color: "#FFFFFF",
                weight: 1.5,
                fillColor: "#006B3C",
                fillOpacity: 0.9
            }),

        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;

            if (name) {
                layer.bindTooltip(name, {
                    permanent: true,
                    direction: "top",
                    offset: [0, -6]
                });
            }
        }
    }).addTo(map);
}

function loadLandusePlaces() {
    const districtName = districtSelect.value;

    if (landuseLayer) {
        map.removeLayer(landuseLayer);
        landuseLayer = null;
    }

    landuseFeatures = [];

    if (!districtName || placesCategory.value !== "landuse") {
        return;
    }

    const districtFeature = districtGeoJSON?.features.find(
        feature => feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) return;

    const params = new URLSearchParams({
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: "tourism:landuse_new_n",
        outputFormat: "application/json",
        srsName: "EPSG:4326"
    });

    fetch(`http://localhost:8080/geoserver/tourism/ows?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load parks and forests");
            }
            return response.json();
        })
        .then(data => {
            landuseFeatures = data.features.filter(feature =>
                feature.geometry &&
                turf.booleanPointInPolygon(feature, districtFeature)
            );

            displayLandusePlaces();
        })
        .catch(error => {
            console.error("Parks & Forests error:", error);
        });
}

// Update when category or district changes
placesCategory.addEventListener("change", loadLandusePlaces);
districtSelect.addEventListener("change", loadLandusePlaces);

// Update visible places after map movement or zoom
map.on("moveend", displayLandusePlaces);



// Facilities — ATMs, Banks, etc.
let facilitiesLayer = null;
let facilitiesFeatures = [];

function displayFacilities() {
    if (facilitiesLayer) {
        map.removeLayer(facilitiesLayer);
        facilitiesLayer = null;
    }

    if (
        !districtSelect.value ||
        placesCategory.value !== "facilities"
    ) {
        return;
    }

    const visiblePlaces = facilitiesFeatures
        .filter(feature => {
            if (
                !feature.geometry ||
                feature.geometry.type !== "Point"
            ) {
                return false;
            }

            const [lng, lat] = feature.geometry.coordinates;
            return map.getBounds().contains(L.latLng(lat, lng));
        })
        .slice(0, 10);

    facilitiesLayer = L.geoJSON(visiblePlaces, {
        pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, {
                radius: 6,
                color: "#FFFFFF",
                weight: 1.5,
                fillColor: "#36454F",
                fillOpacity: 0.9
            }),

        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;

            if (name) {
                layer.bindTooltip(name, {
                    permanent: true,
                    direction: "top",
                    offset: [0, -6]
                });
            }
        }
    }).addTo(map);
}

function loadFacilities() {
    const districtName = districtSelect.value;

    if (facilitiesLayer) {
        map.removeLayer(facilitiesLayer);
        facilitiesLayer = null;
    }

    facilitiesFeatures = [];

    if (!districtName || placesCategory.value !== "facilities") {
        return;
    }

    const districtFeature = districtGeoJSON?.features.find(
        feature => feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) return;

    const params = new URLSearchParams({
        service: "WFS",
        version: "1.0.0",
        request: "GetFeature",
        typeName: "tourism:pois_new",
        outputFormat: "application/json",
        srsName: "EPSG:4326"
    });

    fetch(`http://localhost:8080/geoserver/tourism/ows?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load facilities");
            }
            return response.json();
        })
        .then(data => {
            facilitiesFeatures = data.features.filter(feature =>
                feature.geometry &&
                turf.booleanPointInPolygon(feature, districtFeature)
            );

            displayFacilities();
        })
        .catch(error => {
            console.error("Facilities error:", error);
        });
}

// Update when category or district changes
placesCategory.addEventListener("change", loadFacilities);
districtSelect.addEventListener("change", loadFacilities);

// Update visible facilities after map movement or zoom
map.on("moveend", displayFacilities);



// SEASONAL SUITABILITY — CSV INTEGRATION
let seasonalSuitabilityData = [];

const suitabilityState = document.getElementById("search-state");
const suitabilityDistrict = document.getElementById("search-district");

// Load CSV
fetch("CSV.csv")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not load suitability CSV");
        }
        return response.text();
    })
    .then(csvText => {
        seasonalSuitabilityData = parseSuitabilityCSV(csvText);
        console.log(
            "Seasonal suitability loaded:",
            seasonalSuitabilityData.length,
            "districts"
        );
    })
    .catch(error => {
        console.error("Suitability CSV error:", error);
    });

// Parse CSV, including quoted values
function parseSuitabilityCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    text = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"' && quoted && text[i + 1] === '"') {
            cell += '"';
            i++;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === "," && !quoted) {
            row.push(cell.trim());
            cell = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && text[i + 1] === "\n") i++;

            row.push(cell.trim());

            if (row.some(value => value !== "")) {
                rows.push(row);
            }

            row = [];
            cell = "";
        } else {
            cell += char;
        }
    }

    if (cell || row.length) {
        row.push(cell.trim());
        rows.push(row);
    }

    const headers = rows.shift().map(header => header.trim());

    return rows.map(values =>
        Object.fromEntries(
            headers.map((header, index) => [
                header,
                values[index] ?? ""
            ])
        )
    );
}

// Find the selected district's CSV record
function getSelectedSuitability() {
    const normalize = value =>
        String(value ?? "")
            .normalize("NFKC")
            .trim()
            .toLowerCase()
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ");

    const state = normalize(suitabilityState.value);
    const district = normalize(suitabilityDistrict.value);

    console.log("Selected state:", JSON.stringify(state));
    console.log("Selected district:", JSON.stringify(district));
    console.log("CSV row count:", seasonalSuitabilityData.length);
    console.log("First CSV record:", seasonalSuitabilityData[0]);

    const record = seasonalSuitabilityData.find(row =>
        normalize(row.STATE_UT) === state &&
        normalize(row.District) === district
    );

    console.log("MATCHED RECORD:", record);

    return record;
}

// SEASON DROPDOWN — SUITABILITY
const seasonSelect = document.getElementById("search-season");

function updateSeasonalSuitability() {
    const season = seasonSelect.value;

    if (!season || season === "select") {
        return;
    }

    const record = getSelectedSuitability();

    if (!record) {
        console.warn("No suitability record found for this district.");
        return;
    }

    
const suitabilityColumns = {
    summer: "Summer_Suitability",
    monsoon: "Monsoon_Suitability",
    winter: "Winter_Suitability",
    "post-monsoon": "Post_Monsoon_Suitability"
};

const suitabilityColumn = suitabilityColumns[season];


    console.log("Selected season:", season);
    console.log("Seasonal suitability:", record[suitabilityColumn]);
    console.log("Overall remark:", record.Remark);

    // Display suitability in the right panel
    document.getElementById("suitability").textContent =
        record[suitabilityColumn] || "No data available";
}

// Update when state, district, or season changes
suitabilityState.addEventListener("change", updateSeasonalSuitability);
suitabilityDistrict.addEventListener("change", updateSeasonalSuitability);
seasonSelect.addEventListener("change", updateSeasonalSuitability);



// ROUTE TO SELECTED DISTRICT
let districtRouteLayer = null;

function getRouteToDistrict() {
    const districtName = districtSelect.value;

    if (!districtName) {
        alert("Please select a district first.");
        return;
    }

    // Find the selected district polygon
    const districtFeature = districtGeoJSON?.features.find(
        feature =>
            feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) {
        alert("District boundary not found.");
        return;
    }

    // Find a point guaranteed to lie on the district feature
    const destination = turf.pointOnFeature(districtFeature);
    const [destinationLng, destinationLat] =
        destination.geometry.coordinates;

    // Request the user's current location
    if (!navigator.geolocation) {
        alert("Your browser does not support location access.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Remove previous route
            if (districtRouteLayer) {
                map.removeLayer(districtRouteLayer);
                districtRouteLayer = null;
            }

            try {
                // OSRM uses longitude,latitude coordinate order
                const routeURL =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${userLng},${userLat};` +
                    `${destinationLng},${destinationLat}` +
                    `?overview=full&geometries=geojson`;

                const response = await fetch(routeURL);

                if (!response.ok) {
                    throw new Error("Routing service unavailable.");
                }

                const data = await response.json();

                if (data.code !== "Ok" || !data.routes.length) {
                    throw new Error("No driving route found.");
                }

                const route = data.routes[0];
                // Display only the distance in the right panel
                document.getElementById("distance").textContent =
                    (route.distance / 1000).toFixed(1) + " km";

                // Draw route on the existing Leaflet map
                districtRouteLayer = L.geoJSON(route.geometry, {
                    style: {
                        color: "#2563EB",
                        weight: 5,
                        opacity: 0.85
                    }
                }).addTo(map);

                // Show route from user's location to district point
                map.fitBounds(districtRouteLayer.getBounds(), {
                    padding: [30, 30]
                });

                alert(
                    `Route to ${districtName}\n` +
                    `Distance: ${(route.distance / 1000).toFixed(1)} km\n` +
                    `Estimated driving time: ` +
                    `${Math.round(route.duration / 60)} minutes`
                );

            } catch (error) {
                console.error("District routing error:", error);
                alert("Unable to calculate the route. Please try again.");
            }
        },
        error => {
            alert(
                "Location access is required to calculate the route. " +
                "Please allow location access in your browser."
            );
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }
    );
}



// Connect left panel selections to the right panel
function updateRightPanel() {
    document.getElementById("selected-state").textContent =
        document.getElementById("search-state").selectedOptions[0]?.text || "None";

    document.getElementById("selected-district").textContent =
        document.getElementById("search-district").selectedOptions[0]?.text || "None";

    document.getElementById("selected-season").textContent =
        document.getElementById("search-season").selectedOptions[0]?.text || "None";

    document.getElementById("selected-place").textContent =
        document.getElementById("search-place").selectedOptions[0]?.text || "None";
}

// Update the right panel whenever a selection changes
["search-state", "search-district", "search-season", "search-place"]
    .forEach(id => {
        document.getElementById(id).addEventListener("change", updateRightPanel);
    });




/* OPEN-METEO WEATHER — DISTRICT TEMPERATURE & RAINFALL */

async function updateDistrictWeather() {
    const districtName = districtSelect.value;

    const temperatureElement = document.getElementById("temperature");
    const rainfallElement = document.getElementById("rainfall");

    if (!districtName) {
        temperatureElement.textContent = "—";
        rainfallElement.textContent = "—";
        return;
    }

    // Find the selected district boundary
    const districtFeature = districtGeoJSON?.features.find(
        feature =>
            feature.properties.DISTRICT === districtName
    );

    if (!districtFeature) {
        temperatureElement.textContent = "Unavailable";
        rainfallElement.textContent = "Unavailable";
        console.warn("District boundary not found:", districtName);
        return;
    }

    // Get a representative point inside the district
    const point = turf.pointOnFeature(districtFeature);
    const [longitude, latitude] = point.geometry.coordinates;

    temperatureElement.textContent = "Loading...";
    rainfallElement.textContent = "Loading...";

    try {
        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m` +
            `&daily=precipitation_sum` +
            `&forecast_days=1` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather API request failed.");
        }

        const data = await response.json();

        // Display current temperature
        const temperature = data.current?.temperature_2m;
        temperatureElement.textContent =
            temperature != null
                ? `${temperature} ${data.current_units?.temperature_2m || "°C"}`
                : "Unavailable";

        // Display today's forecast rainfall
        const rainfall = data.daily?.precipitation_sum?.[0];
        rainfallElement.textContent =
            rainfall != null
                ? `${rainfall} ${data.daily_units?.precipitation_sum || "mm"}`
                : "Unavailable";

    } catch (error) {
        console.error("Open-Meteo weather error:", error);
        temperatureElement.textContent = "Unavailable";
        rainfallElement.textContent = "Unavailable";
    }
}

// Fetch weather whenever the selected district changes
districtSelect.addEventListener("change", updateDistrictWeather);