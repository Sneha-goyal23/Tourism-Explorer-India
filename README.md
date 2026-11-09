# Tourism-Explorer-India

An interactive Web GIS application designed to help users explore tourist destinations across India through state-wise and district-wise selection, seasonal suitability information, and category-based exploration.

## 1. Project Overview

Tourism Explorer India is a web-based GIS application developed to make tourism-related geographic information more accessible and easier to explore.

The application allows users to select a state and district, explore different categories of tourist attractions, and view generalized seasonal suitability.
The project integrates spatial datasets with web mapping technologies to provide an interactive tourism exploration experience.

## 2. Project Objectives

- To develop an interactive web-based tourism GIS application for India.
- To provide state-wise and district-wise geographic exploration.
- To identify tourist attractions based on different categories.
- To provide generalized seasonal suitability information for travel planning.
- To demonstrate the practical application of open-source web GIS technologies.

## 3. Key Features

### 3.1 Interactive Map
- Displays geographic information through an interactive map.
- Supports zooming, panning, and map navigation.
- Displays spatial layers published through GeoServer.

### 3.2 State and District Selection
- Allows users to select a state and its corresponding district.
- Retrieves district boundary information using GeoServer WFS.
- Automatically zooms to the selected district.

### 3.3 Seasonal Suitability
Users can explore generalized district-level seasonal suitability for four seasons:

- Summer
- Monsoon
- Winter
- Post-Monsoon

The suitability information is retrieved from a manually generated CSV dataset.

### 3.4 Tourist Place Categories

The application provides different categories for exploring locations:

- Cities and Towns
- Places of Worship
- Natural Attractions
- Parks and Forests
- Facilities and Other Points of Interest

### 3.5 Route to District

The application includes a route-to-district functionality that uses browser geolocation to obtain the user's current location, subject to permission.

### 3.6 Weather Information

The application is designed to display temperature and rainfall information using an external weather API, where configured.

## 4. Technology Stack

| Technology | Purpose |
|---|---|
| HTML | Structure of the web application |
| CSS | Styling and user interface |
| JavaScript | Application logic and functionality |
| Leaflet.js | Interactive map visualization |
| GeoServer | Publishing and serving spatial datasets |
| WMS | Displaying spatial layers on the map |
| WFS | Retrieving geographic features and attributes |
| Turf.js | Spatial analysis and geographic operations |
| OpenStreetMap | Source of geographic datasets and map reference |
| Open-Meteo API | Weather information |
| Browser Geolocation API | Obtaining user's current location |

## 5. Data Sources

### 5.1 OpenStreetMap (OSM)

The geographic datasets used in this project were obtained from OpenStreetMap (OSM).

The required spatial datasets were prepared and published through GeoServer to make them accessible to the web application.

The major spatial layers include:

| Layer | Description |
|---|---|
| State Boundaries | State administrative boundaries |
| District Boundaries | District administrative boundaries |
| places_new | Cities, towns, and settlements |
| pofw | Places of worship |
| natural | Natural attractions |
| landuse | Land-use features, including parks and forests |
| pois | Tourist places and other points of interest |

### 5.2 Seasonal Suitability Dataset

The seasonal suitability dataset was manually generated for this project in CSV format.

It contains generalized district-level suitability information for four seasons:

- Summer
- Monsoon
- Winter
- Post-Monsoon

**Important:** The seasonal suitability dataset is self-generated and based on generalized assessments. It is not an official government dataset or a scientifically validated tourism suitability index. The values are intended for general travel guidance and demonstration purposes.

## 6. Project Workflow

The application follows the workflow below:

1. Spatial datasets obtained from OpenStreetMap are prepared for use in the application.
2. The datasets are published as layers through GeoServer.
3. The HTML application is connected to its CSS and JavaScript files.
4. Leaflet is used to initialize and display the interactive map.
5. GeoServer WMS services are used to display spatial layers.
6. GeoServer WFS services are used to retrieve geographic features and attributes.
7. Users select a state and district through the application interface.
8. The selected district is used to filter and explore available tourist locations.
9. Users select a season to view generalized seasonal suitability information from the CSV dataset.
10. External services provide additional functionality, such as weather information and location-based features, where configured.

## 7. How to Run the Project

### Requirements

- A web browser
- Visual Studio Code
- GeoServer
- Required spatial layers published in GeoServer
- Internet connection

### Steps

1. Start the GeoServer application.
2. Ensure that the required workspace and spatial layers are published successfully.
3. Verify that the WMS and WFS services are accessible.
4. Open the project folder in Visual Studio Code.
5. Ensure that the HTML file is correctly connected to the CSS and JavaScript files.
6. Run the HTML file using the Live Server extension.
7. Open the application in your browser.
8. Verify that the GeoServer service URLs in the JavaScript file point to the correct GeoServer instance.

**Note:** If GeoServer is running locally, the application will access it through the local server address. Other users cannot access your computer's localhost through a shared website link.

## 8. Project Limitations

### 8.1 GeoServer Dependency
The application depends on GeoServer for accessing and displaying spatial datasets. If GeoServer is unavailable or stopped, the corresponding map layers and geographic functions may not work.

### 8.2 Local Server Accessibility
GeoServer is connected through a locally running server. Therefore, the application is dependent on the availability of the local GeoServer instance. Sharing the frontend files alone does not make the spatial layers accessible to other users.

### 8.3 Dataset Accuracy and Completeness
The geographic datasets are obtained from OpenStreetMap. Their accuracy, completeness, and level of detail may vary depending on the geographical area and available contributions. Some tourist locations may be missing, outdated, or incorrectly classified.

### 8.4 Generalized Seasonal Suitability
The seasonal suitability dataset is manually generated and uses generalized district-level assessments. It does not represent actual weather conditions or account for all local environmental variations, elevation differences, or sudden weather events.

### 8.5 External API Dependency
Weather-related functionality depends on external API services. Network issues, service downtime, API limitations, or changes in service availability may affect the results.

### 8.6 Geolocation Limitations
The route-to-district functionality requires browser location permission. If permission is denied or location services are unavailable, the application may not be able to identify the user's current location.

### 8.7 Routing Limitations
Route calculations depend on the available road network and routing service. They may not reflect real-time traffic, temporary road closures, or local travel restrictions.

### 8.8 Internet Connectivity
An internet connection is required to access GeoServer services, basemap resources, and external APIs. Offline functionality is not currently supported.

### 8.9 Mobile Compatibility
The application may experience performance or display issues on certain mobile devices, particularly when loading multiple spatial layers or handling large datasets. Further mobile optimization is required.

### 8.10 No Booking or Live Destination Verification
The application is designed for geographic exploration and general travel planning. It does not provide hotel bookings, ticket reservations, verified opening hours, live crowd information, or official travel advisories.

## 9. Future Scope

The project can be improved further through the following developments:

- Hosting GeoServer on a publicly accessible server.
- Improving the application's accessibility across different devices.
- Integrating more detailed and updated tourism datasets.
- Improving the methodology used for seasonal suitability assessment.
- Adding more tourism-related categories and destination information.
- Improving spatial query performance and map visualization.
- Integrating additional weather and environmental parameters.
- Providing more detailed route and travel planning functionality.

## 10. Acknowledgements

- **OpenStreetMap (OSM):** For providing the geographic datasets used in the project.
- **GeoServer:** For publishing and serving spatial datasets.
- **Leaflet.js:** For interactive web mapping functionality.
- **Turf.js:** For client-side spatial analysis.
- **Open-Meteo:** For weather-related API services, where configured.

## 11. Disclaimer

Tourism Explorer India is an academic and demonstration-based Web GIS project developed for tourism exploration and general travel planning.

The geographic information is based on available OpenStreetMap datasets, while seasonal suitability values are generalized assessments generated specifically for this project.

Users are advised to independently verify weather conditions, destination accessibility, route information, and local travel guidelines before making travel decisions.
**Project:** Tourism Explorer India  
**Domain:** Geographic Information Systems (GIS) and Web Mapping  
**Application Type:** Interactive Web GIS Portal
