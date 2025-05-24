// Global variables
let map;
let trafficLayer;
let parkingMarkers = [];
let projectMarkers = [];
let csvData = [];
let projects = [];

// Initialize the map
function initMap() {
    // Default to San Francisco coordinates
    const defaultLocation = { lat: 37.7749, lng: -122.4194 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    // Initialize traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    
    // Load sample data
    loadSampleData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update analytics periodically
    setInterval(updateAnalytics, 30000); // Update every 30 seconds
}

// Load sample CSV data
function loadSampleData() {
    // Simulate loading CSV data
    csvData = [
        { location: 'Downtown', lat: 37.7849, lng: -122.4094, traffic_flow: 1250, parking_occupancy: 85, avg_speed: 15 },
        { location: 'Mission District', lat: 37.7599, lng: -122.4148, traffic_flow: 980, parking_occupancy: 72, avg_speed: 22 },
        { location: 'Financial District', lat: 37.7949, lng: -122.3994, traffic_flow: 1580, parking_occupancy: 91, avg_speed: 12 },
        { location: 'Castro', lat: 37.7609, lng: -122.4350, traffic_flow: 650, parking_occupancy: 45, avg_speed: 28 },
        { location: 'Chinatown', lat: 37.7941, lng: -122.4078, traffic_flow: 890, parking_occupancy: 68, avg_speed: 18 }
    ];
    
    // Create parking markers
    createParkingMarkers();
    
    // Update analytics
    updateAnalytics();
}

// Create parking markers on the map
function createParkingMarkers() {
    csvData.forEach(data => {
        const marker = new google.maps.Marker({
            position: { lat: data.lat, lng: data.lng },
            map: map,
            title: `${data.location} - ${data.parking_occupancy}% occupied`,
            icon: {
                url: getParkingIcon(data.parking_occupancy),
                scaledSize: new google.maps.Size(30, 30)
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div>
                    <h3>${data.location}</h3>
                    <p><strong>Traffic Flow:</strong> ${data.traffic_flow} vehicles/hour</p>
                    <p><strong>Parking Occupancy:</strong> ${data.parking_occupancy}%</p>
                    <p><strong>Average Speed:</strong> ${data.avg_speed} mph</p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        parkingMarkers.push(marker);
    });
}

// Get parking icon based on occupancy
function getParkingIcon(occupancy) {
    if (occupancy > 80) return 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><circle cx="12" cy="12" r="10"/></svg>');
    if (occupancy > 50) return 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange"><circle cx="12" cy="12" r="10"/></svg>');
    return 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green"><circle cx="12" cy="12" r="10"/></svg>');
}

// Update analytics dashboard
function updateAnalytics() {
    const totalTraffic = csvData.reduce((sum, data) => sum + data.traffic_flow, 0);
    const avgOccupancy = csvData.reduce((sum, data) => sum + data.parking_occupancy, 0) / csvData.length;
    const avgSpeed = csvData.reduce((sum, data) => sum + data.avg_speed, 0) / csvData.length;
    const congestionIndex = Math.round((100 - avgSpeed) * (avgOccupancy / 100) * 100) / 100;
    
    document.getElementById('trafficFlow').textContent = totalTraffic.toLocaleString();
    document.getElementById('parkingOccupancy').textContent = Math.round(avgOccupancy);
    document.getElementById('avgSpeed').textContent = Math.round(avgSpeed);
    document.getElementById('congestionIndex').textContent = congestionIndex;
    
    // Update trends (simulated)
    document.getElementById('trafficTrend').textContent = '↑ 5.2% from last hour';
    document.getElementById('parkingTrend').textContent = '↓ 2.1% from last hour';
    document.getElementById('speedTrend').textContent = '↑ 1.8% from last hour';
    document.getElementById('congestionTrend').textContent = '↓ 3.5% from last hour';
    
    // Update last updated time
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
}

// Set up event listeners
function setupEventListeners() {
    // Traffic toggle
    document.getElementById('toggleTraffic').addEventListener('click', () => {
        if (trafficLayer.getMap()) {
            trafficLayer.setMap(null);
        } else {
            trafficLayer.setMap(map);
        }
    });
    
    // Parking toggle
    document.getElementById('toggleParking').addEventListener('click', () => {
        parkingMarkers.forEach(marker => {
            marker.setVisible(!marker.getVisible());
        });
    });
    
    // CSV file input
    document.getElementById('csvInput').addEventListener('change', handleCSVUpload);
    
    // Project modal
    const modal = document.getElementById('projectModal');
    const addProjectBtn = document.getElementById('addProject');
    const closeBtn = document.querySelector('.close');
    
    addProjectBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Project form submission
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmission);
}

// Handle CSV file upload
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            parseCSV(csv);
        };
        reader.readAsText(file);
    }
}

// Parse CSV data
// New variables for time-based queries
let historicalData = [];
let currentQueryTime = null;
let predictionMode = false;

// Enhanced CSV parsing to handle your data format
function parseCSV(csv) {
    const lines = csv.split('\n');
    const newData = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            if (values.length >= 4) {
                const row = {
                    timestamp: values[0].trim(),
                    coordinates: values[1].trim(),
                    location: values[2].replace(/"/g, '').trim(),
                    traffic_level: parseInt(values[3].trim()),
                    // Convert traffic level to more detailed metrics
                    traffic_flow: parseInt(values[3].trim()) * 300 + Math.random() * 200,
                    parking_occupancy: Math.max(20, Math.min(95, parseInt(values[3].trim()) * 20 + Math.random() * 30)),
                    avg_speed: Math.max(8, 40 - parseInt(values[3].trim()) * 8 + Math.random() * 10)
                };
                
                // Extract lat/lng from coordinates if possible
                const coordMatch = row.coordinates.match(/\((\d+),\s*(\d+),\s*\d+\)/);
                if (coordMatch) {
                    // Convert to approximate SF coordinates (this is a simplified conversion)
                    row.lat = 37.7749 + (parseInt(coordMatch[1]) % 1000) / 10000;
                    row.lng = -122.4194 + (parseInt(coordMatch[2]) % 1000) / 10000;
                } else {
                    // Default coordinates for known locations
                    const locationCoords = getLocationCoordinates(row.location);
                    row.lat = locationCoords.lat;
                    row.lng = locationCoords.lng;
                }
                
                newData.push(row);
            }
        }
    }
    
    historicalData = newData;
    csvData = aggregateDataByLocation(newData);
    
    // Clear existing markers and create new ones
    parkingMarkers.forEach(marker => marker.setMap(null));
    parkingMarkers = [];
    
    createParkingMarkers();
    updateAnalytics();
    populateLocationDropdown();
    
    alert('CSV data loaded successfully! ' + newData.length + ' records processed.');
}

// Get coordinates for known locations
function getLocationCoordinates(location) {
    const coords = {
        'San Francisco – Oakland Bay Bridge': { lat: 37.7983, lng: -122.3778 },
        'The Embarcadero': { lat: 37.7955, lng: -122.3937 },
        'Market Street': { lat: 37.7879, lng: -122.4075 },
        'Mission Street': { lat: 37.7599, lng: -122.4148 },
        'Van Ness Avenue': { lat: 37.7849, lng: -122.4194 }
    };
    
    return coords[location] || { lat: 37.7749, lng: -122.4194 };
}

// Aggregate data by location for current display
function aggregateDataByLocation(data) {
    const locationMap = new Map();
    
    data.forEach(record => {
        if (!locationMap.has(record.location)) {
            locationMap.set(record.location, {
                location: record.location,
                lat: record.lat,
                lng: record.lng,
                traffic_flow: [],
                parking_occupancy: [],
                avg_speed: []
            });
        }
        
        const loc = locationMap.get(record.location);
        loc.traffic_flow.push(record.traffic_flow);
        loc.parking_occupancy.push(record.parking_occupancy);
        loc.avg_speed.push(record.avg_speed);
    });
    
    // Calculate averages
    const result = [];
    locationMap.forEach(loc => {
        result.push({
            location: loc.location,
            lat: loc.lat,
            lng: loc.lng,
            traffic_flow: Math.round(loc.traffic_flow.reduce((a, b) => a + b, 0) / loc.traffic_flow.length),
            parking_occupancy: Math.round(loc.parking_occupancy.reduce((a, b) => a + b, 0) / loc.parking_occupancy.length),
            avg_speed: Math.round(loc.avg_speed.reduce((a, b) => a + b, 0) / loc.avg_speed.length)
        });
    });
    
    return result;
}

// Populate location dropdown
function populateLocationDropdown() {
    const dropdown = document.getElementById('queryLocation');
    const locations = [...new Set(historicalData.map(d => d.location))];
    
    // Clear existing options except "All Locations"
    dropdown.innerHTML = '<option value="all">All Locations</option>';
    
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        dropdown.appendChild(option);
    });
}

// Query historical data
function queryHistoricalData() {
    const date = document.getElementById('queryDate').value;
    const time = document.getElementById('queryTime').value;
    const location = document.getElementById('queryLocation').value;
    
    const queryDateTime = `${date} ${time}:00:00`;
    currentQueryTime = queryDateTime;
    predictionMode = false;
    
    let filteredData = historicalData.filter(record => {
        const matchesTime = record.timestamp === queryDateTime;
        const matchesLocation = location === 'all' || record.location === location;
        return matchesTime && matchesLocation;
    });
    
    if (filteredData.length === 0) {
        alert('No data found for the selected time and location.');
        return;
    }
    
    // Update map with queried data
    updateMapWithQueryData(filteredData);
    updateAnalyticsWithQueryData(filteredData);
}

// Predict future traffic
function predictFutureTraffic() {
    const date = document.getElementById('queryDate').value;
    const time = document.getElementById('queryTime').value;
    const location = document.getElementById('queryLocation').value;
    
    predictionMode = true;
    
    // Simple prediction based on historical patterns
    const hour = parseInt(time.split(':')[0]);
    const dayOfWeek = new Date(date).getDay();
    
    let predictions = [];
    
    if (location === 'all') {
        const locations = [...new Set(historicalData.map(d => d.location))];
        locations.forEach(loc => {
            predictions.push(generatePrediction(loc, hour, dayOfWeek));
        });
    } else {
        predictions.push(generatePrediction(location, hour, dayOfWeek));
    }
    
    updateMapWithQueryData(predictions);
    updateAnalyticsWithQueryData(predictions);
    
    alert('Showing traffic predictions based on historical patterns.');
}

// Generate prediction for a location
function generatePrediction(location, hour, dayOfWeek) {
    // Get historical data for this location and hour
    const historicalForLocation = historicalData.filter(d => 
        d.location === location && 
        new Date(d.timestamp).getHours() === hour
    );
    
    if (historicalForLocation.length === 0) {
        const coords = getLocationCoordinates(location);
        return {
            location: location,
            lat: coords.lat,
            lng: coords.lng,
            traffic_flow: 500,
            parking_occupancy: 50,
            avg_speed: 25,
            predicted: true
        };
    }
    
    // Calculate averages with some variation for prediction
    const avgTraffic = historicalForLocation.reduce((sum, d) => sum + d.traffic_flow, 0) / historicalForLocation.length;
    const avgParking = historicalForLocation.reduce((sum, d) => sum + d.parking_occupancy, 0) / historicalForLocation.length;
    const avgSpeed = historicalForLocation.reduce((sum, d) => sum + d.avg_speed, 0) / historicalForLocation.length;
    
    // Add some variation based on day of week (weekends typically have different patterns)
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.0;
    const rushHourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 1.0;
    
    return {
        location: location,
        lat: historicalForLocation[0].lat,
        lng: historicalForLocation[0].lng,
        traffic_flow: Math.round(avgTraffic * weekendFactor * rushHourFactor),
        parking_occupancy: Math.round(avgParking * weekendFactor * rushHourFactor),
        avg_speed: Math.round(avgSpeed / (weekendFactor * rushHourFactor)),
        predicted: true
    };
}

// Update map with query/prediction data
function updateMapWithQueryData(data) {
    // Clear existing markers
    parkingMarkers.forEach(marker => marker.setMap(null));
    parkingMarkers = [];
    
    // Create new markers for queried data
    data.forEach(record => {
        const marker = new google.maps.Marker({
            position: { lat: record.lat, lng: record.lng },
            map: map,
            title: `${record.location} - ${record.parking_occupancy}% occupied${record.predicted ? ' (Predicted)' : ''}`,
            icon: {
                url: record.predicted ? getPredictionIcon(record.parking_occupancy) : getParkingIcon(record.parking_occupancy),
                scaledSize: new google.maps.Size(30, 30)
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div>
                    <h3>${record.location}${record.predicted ? ' (Predicted)' : ''}</h3>
                    <p><strong>Traffic Flow:</strong> ${Math.round(record.traffic_flow)} vehicles/hour</p>
                    <p><strong>Parking Occupancy:</strong> ${Math.round(record.parking_occupancy)}%</p>
                    <p><strong>Average Speed:</strong> ${Math.round(record.avg_speed)} mph</p>
                    ${currentQueryTime ? `<p><strong>Time:</strong> ${currentQueryTime}</p>` : ''}
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        parkingMarkers.push(marker);
    });
}

// Get prediction icon (different style for predictions)
function getPredictionIcon(occupancy) {
    const color = occupancy > 80 ? 'purple' : occupancy > 50 ? 'blue' : 'cyan';
    return 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><polygon points="12,2 22,20 2,20"/></svg>`);
}

// Update analytics with query data
function updateAnalyticsWithQueryData(data) {
    if (data.length === 0) return;
    
    const totalTraffic = data.reduce((sum, d) => sum + d.traffic_flow, 0);
    const avgOccupancy = data.reduce((sum, d) => sum + d.parking_occupancy, 0) / data.length;
    const avgSpeed = data.reduce((sum, d) => sum + d.avg_speed, 0) / data.length;
    const congestionIndex = Math.round((100 - avgSpeed) * (avgOccupancy / 100) * 100) / 100;
    
    document.getElementById('trafficFlow').textContent = totalTraffic.toLocaleString();
    document.getElementById('parkingOccupancy').textContent = Math.round(avgOccupancy);
    document.getElementById('avgSpeed').textContent = Math.round(avgSpeed);
    document.getElementById('congestionIndex').textContent = congestionIndex;
    
    // Update trends
    const trendSuffix = predictionMode ? ' (Predicted)' : currentQueryTime ? ' (Historical)' : '';
    document.getElementById('trafficTrend').textContent = '📊 Queried Data' + trendSuffix;
    document.getElementById('parkingTrend').textContent = '📊 Queried Data' + trendSuffix;
    document.getElementById('speedTrend').textContent = '📊 Queried Data' + trendSuffix;
    document.getElementById('congestionTrend').textContent = '📊 Queried Data' + trendSuffix;
    
    document.getElementById('lastUpdated').textContent = currentQueryTime || 'Prediction for ' + document.getElementById('queryDate').value + ' ' + document.getElementById('queryTime').value;
}

// Novita.ai API integration for report generation
const NOVITA_API_KEY = 'sk_mNVRgZceaur6h3LwZLR5WzZz3iUP09phH1_nlcUvAic'; // This should be loaded from environment variables in production

// Enhanced event listeners
function setupEventListeners() {
    // ... existing event listeners ...
    
    // New event listeners for time-based queries
    document.getElementById('queryData').addEventListener('click', queryHistoricalData);
    document.getElementById('predictTraffic').addEventListener('click', predictFutureTraffic);
    
    // Report generation
    document.getElementById('generateReport').addEventListener('click', generateReport);
    
    // Update report time/location display when query controls change
    document.getElementById('queryDate').addEventListener('change', updateReportTimeLocation);
    document.getElementById('queryTime').addEventListener('change', updateReportTimeLocation);
    document.getElementById('queryLocation').addEventListener('change', updateReportTimeLocation);
    
    // Reset to current view
    document.getElementById('toggleTraffic').addEventListener('click', () => {
        currentQueryTime = null;
        predictionMode = false;
        if (trafficLayer.getMap()) {
            trafficLayer.setMap(null);
        } else {
            trafficLayer.setMap(map);
        }
        // Reset to aggregated view
        parkingMarkers.forEach(marker => marker.setMap(null));
        parkingMarkers = [];
        createParkingMarkers();
        updateAnalytics();
        updateReportTimeLocation();
    });
}



// Generate report using Novita.ai API
async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportFormat = document.getElementById('reportFormat').value;
    const date = document.getElementById('queryDate').value;
    const time = document.getElementById('queryTime').value;
    const location = document.getElementById('queryLocation').value;
    const statusElement = document.getElementById('reportStatus');
    
    if (!date || !time) {
        statusElement.innerHTML = '<div class="report-error">Please select a date and time first</div>';
        return;
    }
    
    // Show loading status
    statusElement.innerHTML = '<div>Generating report... Please wait.</div>';
    
    try {
        // Get data for the report
        let reportData;
        if (predictionMode) {
            // Use prediction data
            reportData = getPredictionDataForReport(reportType, date, time, location);
        } else {
            // Use historical data
            reportData = getHistoricalDataForReport(reportType, date, time, location);
        }
        
        if (!reportData || reportData.length === 0) {
            statusElement.innerHTML = '<div class="report-error">No data available for the selected criteria</div>';
            return;
        }
        
        // Format data for Novita.ai API
        const apiData = {
            report_type: reportType,
            format: reportFormat,
            timestamp: `${date}T${time}:00`,
            start_date: date,  // Add this for date range support
            end_date: date,    // Add this for date range support
            location: location === 'all' ? 'San Francisco' : location,
            data: reportData,
            is_prediction: predictionMode
        };
        
        // Make actual API call to Novita.ai
        fetch('https://api.novita.ai/v1/reports/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NOVITA_API_KEY}`
            },
            body: JSON.stringify(apiData)
        })
        .then(response => response.json())
        .then(data => {
            // Handle the Novita.ai response, e.g., show download link or preview
            // Example: data.report_url or data.report_content
            const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${location === 'all' ? 'San Francisco' : location}`;
            const reportDate = new Date(date + 'T' + time).toLocaleString();
            let downloadLink = '';
            if (data.report_url) {
                downloadLink = `<a href="${data.report_url}" class="report-download" target="_blank">Download Report</a>`;
            } else {
                downloadLink = `<a href="#" class="report-download" onclick="downloadReport('${reportType}', '${reportFormat}', '${date}', '${time}', '${location}')">Download Report</a>`;
            }
            const reportHtml = `
                <div class="report-result">
                    <h4>${reportTitle}</h4>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <p>Data timestamp: ${reportDate}</p>
                    <p>Format: ${reportFormat.charAt(0).toUpperCase() + reportFormat.slice(1)} Compliance Standard</p>
                    <p>Contains data for ${reportData.length} locations</p>
                    ${downloadLink}
                </div>
            `;
            statusElement.innerHTML = reportHtml;
        })
        .catch(error => {
            statusElement.innerHTML = `<div class="report-error">Error generating report: ${error.message}</div>`;
        });
        
    } catch (error) {
        console.error('Error generating report:', error);
        statusElement.innerHTML = `<div class="report-error">Error generating report: ${error.message}</div>`;
    }
}

// Get historical data formatted for report
function getHistoricalDataForReport(reportType, date, time, location) {
    const queryDateTime = `${date} ${time}:00:00`;
    
    let filteredData = historicalData.filter(record => {
        const matchesTime = record.timestamp === queryDateTime;
        const matchesLocation = location === 'all' || record.location === location;
        return matchesTime && matchesLocation;
    });
    
    if (filteredData.length === 0) {
        return null;
    }
    
    // Format data based on report type
    if (reportType === 'traffic') {
        return filteredData.map(record => ({
            location: record.location,
            coordinates: `${record.lat},${record.lng}`,
            timestamp: record.timestamp,
            traffic_level: record.traffic_level,
            traffic_flow: Math.round(record.traffic_flow),
            avg_speed: Math.round(record.avg_speed)
        }));
    } else { // parking report
        return filteredData.map(record => ({
            location: record.location,
            coordinates: `${record.lat},${record.lng}`,
            timestamp: record.timestamp,
            occupancy_percentage: Math.round(record.parking_occupancy),
            available_spots: Math.round(100 - record.parking_occupancy) * 2 // Simulated calculation
        }));
    }
}

// Get prediction data formatted for report
function getPredictionDataForReport(reportType, date, time, location) {
    const hour = parseInt(time.split(':')[0]);
    const dayOfWeek = new Date(date).getDay();
    
    let predictions = [];
    
    if (location === 'all') {
        const locations = [...new Set(historicalData.map(d => d.location))];
        locations.forEach(loc => {
            predictions.push(generatePrediction(loc, hour, dayOfWeek));
        });
    } else {
        predictions.push(generatePrediction(location, hour, dayOfWeek));
    }
    
    // Format data based on report type
    if (reportType === 'traffic') {
        return predictions.map(record => ({
            location: record.location,
            coordinates: `${record.lat},${record.lng}`,
            timestamp: `${date} ${time}:00:00`,
            traffic_level: Math.ceil(record.traffic_flow / 300),
            traffic_flow: Math.round(record.traffic_flow),
            avg_speed: Math.round(record.avg_speed),
            is_prediction: true
        }));
    } else { // parking report
        return predictions.map(record => ({
            location: record.location,
            coordinates: `${record.lat},${record.lng}`,
            timestamp: `${date} ${time}:00:00`,
            occupancy_percentage: Math.round(record.parking_occupancy),
            available_spots: Math.round(100 - record.parking_occupancy) * 2, // Simulated calculation
            is_prediction: true
        }));
    }
}

// Simulate report download
function downloadReport(reportType, format, date, time, location) {
    // In a real implementation, this would generate and download an actual report file
    // For demo purposes, we'll create a simple text file
    
    const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${location === 'all' ? 'San_Francisco' : location.replace(/\s+/g, '_')}`;
    const reportDate = date.replace(/-/g, '') + '_' + time.replace(':', '');
    const filename = `${reportTitle}_${reportDate}_${format}.txt`;
    
    const content = `${reportType.toUpperCase()} REPORT\n` +
                   `Format: ${format.toUpperCase()} COMPLIANCE STANDARD\n` +
                   `Location: ${location === 'all' ? 'San Francisco (All Areas)' : location}\n` +
                   `Date/Time: ${new Date(date + 'T' + time).toLocaleString()}\n` +
                   `Generated: ${new Date().toLocaleString()}\n\n` +
                   `This report was generated using Novita.ai API for official ${format} compliance reporting.\n` +
                   `The data contained in this report ${predictionMode ? 'is predicted based on historical patterns' : 'represents historical measurements'}.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Handle project form submission
function handleProjectSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const project = {
        id: Date.now(),
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        location: document.getElementById('projectLocation').value,
        type: document.getElementById('projectType').value,
        startDate: document.getElementById('projectStartDate').value
    };
    
    // Geocode the location
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: project.location }, (results, status) => {
        if (status === 'OK') {
            project.lat = results[0].geometry.location.lat();
            project.lng = results[0].geometry.location.lng();
            
            projects.push(project);
            addProjectToMap(project);
            updateProjectsList();
            
            // Close modal and reset form
            document.getElementById('projectModal').style.display = 'none';
            document.getElementById('projectForm').reset();
        } else {
            alert('Could not geocode the location. Please try a different address.');
        }
    });
}

// Add project marker to map
function addProjectToMap(project) {
    const marker = new google.maps.Marker({
        position: { lat: project.lat, lng: project.lng },
        map: map,
        title: project.name,
        icon: {
            url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue"><polygon points="12,2 22,20 2,20"/></svg>'),
            scaledSize: new google.maps.Size(30, 30)
        }
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div>
                <h3>${project.name}</h3>
                <p><strong>Type:</strong> ${project.type}</p>
                <p><strong>Description:</strong> ${project.description}</p>
                <p><strong>Start Date:</strong> ${project.startDate}</p>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    projectMarkers.push({ marker, project });
}

// Update projects list in the UI
function updateProjectsList() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item';
        projectElement.innerHTML = `
            <div class="project-info">
                <h4>${project.name}</h4>
                <p>${project.description}</p>
                <p><strong>Type:</strong> ${project.type} | <strong>Start:</strong> ${project.startDate}</p>
            </div>
            <div class="project-actions">
                <button onclick="focusOnProject(${project.id})">View on Map</button>
                <button onclick="removeProject(${project.id})">Remove</button>
            </div>
        `;
        projectsList.appendChild(projectElement);
    });
}

// Focus on project on map
function focusOnProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        map.setCenter({ lat: project.lat, lng: project.lng });
        map.setZoom(15);
        
        // Find and click the marker
        const markerData = projectMarkers.find(m => m.project.id === projectId);
        if (markerData) {
            google.maps.event.trigger(markerData.marker, 'click');
        }
    }
}

// Remove project
function removeProject(projectId) {
    if (confirm('Are you sure you want to remove this project?')) {
        // Remove from projects array
        projects = projects.filter(p => p.id !== projectId);
        
        // Remove marker from map
        const markerIndex = projectMarkers.findIndex(m => m.project.id === projectId);
        if (markerIndex !== -1) {
            projectMarkers[markerIndex].marker.setMap(null);
            projectMarkers.splice(markerIndex, 1);
        }
        
        // Update UI
        updateProjectsList();
    }
}

// Tab functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove('active');
    }
    
    const tabbuttons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Initialize map when page loads
window.onload = initMap;

// Add this minimal report generation logic at the end of your script.js

document.getElementById('generateReport').addEventListener('click', async () => {
  const statusElement = document.getElementById('reportStatus');
  statusElement.innerHTML = 'Generating report...';
  try {
    const response = await fetch('http://localhost:8000/generate_report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate a basic traffic report.' })
    });
    const data = await response.json();
    document.getElementById('reportPreview').textContent = data.report || 'No report generated.';
    statusElement.innerHTML = 'Report generated successfully.';
  } catch (error) {
    statusElement.innerHTML = 'Error generating report.';
  }
});

// Enhanced event listeners
function setupEventListeners() {
    // ... existing event listeners ...
    
    // Report generation
    document.getElementById('generateReport').addEventListener('click', generateReport);
    
    // Date range type toggle
    document.getElementById('rangeLast30').addEventListener('change', toggleCustomDateInputs);
    document.getElementById('rangeCustom').addEventListener('change', toggleCustomDateInputs);
    
    // Initialize date inputs with default values
    initializeDateRangeInputs();
    
    // Populate report location dropdown when historical data is loaded
    document.getElementById('csvInput').addEventListener('change', function(event) {
        handleCSVUpload(event);
        populateReportLocationDropdown();
    });
}



// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}





// Enhanced report generation with date range and visualizations
async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportFormat = document.getElementById('reportFormat').value;
    const location = document.getElementById('reportLocation').value;
    const statusElement = document.getElementById('reportStatus');
    const previewElement = document.getElementById('reportPreview');
    
    // Get date range
    let startDate, endDate;
    if (document.getElementById('rangeLast30').checked) {
        // Find the min and max dates in the historical data
        const dates = historicalData.map(record => new Date(record.timestamp.split(' ')[0]));
        endDate = new Date(Math.max.apply(null, dates));
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7); // Use last 7 days of data
        
        console.log(`Using data range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
    } else {
        startDate = new Date(document.getElementById('rangeStartDate').value);
        endDate = new Date(document.getElementById('rangeEndDate').value);
    }
    
    // Validate date range
    if (startDate > endDate) {
        statusElement.innerHTML = '<div class="report-error">Start date cannot be after end date</div>';
        return;
    }
    
    // Show loading status
    statusElement.innerHTML = '<div>Generating comprehensive report... Please wait.</div>';
    previewElement.innerHTML = '';
    previewElement.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:8001/generate_report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                report_type: reportType,
                format: reportFormat,
                date_range: {
                    start: formatDateForInput(startDate),
                    end: formatDateForInput(endDate)
                },
                location: location === 'all' ? 'San Francisco' : location
            })
        });
        
        const result = await response.json();
        
        // Display the report summary
        if (result.summary) {
            displayDataSummary(result.summary);
        }
        
        // If we have a report URL, open it in a new tab
        if (result.report_url) {
            window.open(result.report_url, '_blank');
        }
        
        // Update status
        statusElement.innerHTML = `
            <div class="report-success">
                <h4>Report Generated Successfully</h4>
                <p>A comprehensive ${reportType} report has been generated.</p>
                <p>Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>
                ${result.report_url ? 
                    `<a href="${result.report_url}" class="report-download" target="_blank">View Report</a>` : 
                    `<a href="#" class="report-download" onclick="downloadFullReport('${reportType}', '${reportFormat}', '${formatDateForInput(startDate)}', '${formatDateForInput(endDate)}')">Download Full Report</a>`
                }
            </div>
        `;
        
    } catch (error) {
        console.error('Error generating report:', error);
        statusElement.innerHTML = `<div class="report-error">Error generating report: ${error.message}</div>`;
    }
}

// Get data for date range
function getDataForDateRange(reportType, startDate, endDate, location) {
    // Filter historical data based on date range and location
    const filteredData = historicalData.filter(record => {
        const recordDate = new Date(record.timestamp.split(' ')[0]);
        const matchesDateRange = recordDate >= startDate && recordDate <= endDate;
        const matchesLocation = location === 'all' || record.location === location;
        return matchesDateRange && matchesLocation;
    });
    
    if (filteredData.length === 0) {
        return null;
    }
    
    // Format data based on report type
    if (reportType === 'traffic') {
        return filteredData.map(record => ({
            location: record.location,
            coordinates: `${record.lat},${record.lng}`,
            timestamp: record.timestamp,
            traffic_level: record.traffic_level,
            traffic_flow: Math.round(record.traffic_flow),
            avg_speed: Math.round(record.avg_speed)
        }));
    } else { // parking report
        return filteredData.map(record => ({
            location: record.location,
            coordinates: `${record.lat},${record.lng}`,
            timestamp: record.timestamp,
            occupancy_percentage: Math.round(record.parking_occupancy),
            available_spots: Math.round(100 - record.parking_occupancy) * 2 // Simulated calculation
        }));
    }
}

// Function to display data summary
function displayDataSummary(summary) {
    const previewElement = document.getElementById('reportPreview');
    
    if (!summary) {
        previewElement.innerHTML = '<div class="report-error">No summary data available</div>';
        previewElement.style.display = 'block';
        return;
    }
    
    const summaryHtml = `
        <div class="report-summary">
            <h3>Data Summary</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-value">${summary.total_records}</span>
                    <span class="stat-label">Total Records</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${summary.unique_roads}</span>
                    <span class="stat-label">Unique Roads</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${summary.average_traffic_level}</span>
                    <span class="stat-label">Avg Traffic Level</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${summary.peak_traffic_percentage}%</span>
                    <span class="stat-label">Peak Traffic</span>
                </div>
            </div>
        </div>
    `;
    
    previewElement.innerHTML = summaryHtml;
    previewElement.style.display = 'block';
}

// Download full report with visualizations
function downloadFullReport(reportType, format, startDate, endDate, location) {
    // In a real implementation, this would generate and download an actual report file with visualizations
    // For demo purposes, we'll create a simple text file
    
    const reportTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${location === 'all' ? 'San_Francisco' : location.replace(/\s+/g, '_')}`;
    const dateRange = `${startDate.replace(/-/g, '')}_to_${endDate.replace(/-/g, '')}`;
    const filename = `${reportTitle}_${dateRange}_${format}.txt`;
    
    const content = `${reportType.toUpperCase()} COMPREHENSIVE REPORT\n` +
                   `Format: ${format.toUpperCase()} COMPLIANCE STANDARD\n` +
                   `Location: ${location === 'all' ? 'San Francisco (All Areas)' : location}\n` +
                   `Date Range: ${startDate} to ${endDate}\n` +
                   `Generated: ${new Date().toLocaleString()}\n\n` +
                   `This report was generated using Novita.ai API for official ${format} compliance reporting.\n` +
                   `The report includes comprehensive data analysis, visualizations, and recommendations based on historical data.\n\n` +
                   `Note: In the actual implementation, this would be a PDF or HTML file with interactive visualizations and detailed analysis.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Handle project form submission
function handleProjectSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const project = {
        id: Date.now(),
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        location: document.getElementById('projectLocation').value,
        type: document.getElementById('projectType').value,
        startDate: document.getElementById('projectStartDate').value
    };
    
    // Geocode the location
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: project.location }, (results, status) => {
        if (status === 'OK') {
            project.lat = results[0].geometry.location.lat();
            project.lng = results[0].geometry.location.lng();
            
            projects.push(project);
            addProjectToMap(project);
            updateProjectsList();
            
            // Close modal and reset form
            document.getElementById('projectModal').style.display = 'none';
            document.getElementById('projectForm').reset();
        } else {
            alert('Could not geocode the location. Please try a different address.');
        }
    });
}

// Add project marker to map
function addProjectToMap(project) {
    const marker = new google.maps.Marker({
        position: { lat: project.lat, lng: project.lng },
        map: map,
        title: project.name,
        icon: {
            url: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue"><polygon points="12,2 22,20 2,20"/></svg>'),
            scaledSize: new google.maps.Size(30, 30)
        }
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div>
                <h3>${project.name}</h3>
                <p><strong>Type:</strong> ${project.type}</p>
                <p><strong>Description:</strong> ${project.description}</p>
                <p><strong>Start Date:</strong> ${project.startDate}</p>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    projectMarkers.push({ marker, project });
}

// Update projects list in the UI
function updateProjectsList() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item';
        projectElement.innerHTML = `
            <div class="project-info">
                <h4>${project.name}</h4>
                <p>${project.description}</p>
                <p><strong>Type:</strong> ${project.type} | <strong>Start:</strong> ${project.startDate}</p>
            </div>
            <div class="project-actions">
                <button onclick="focusOnProject(${project.id})">View on Map</button>
                <button onclick="removeProject(${project.id})">Remove</button>
            </div>
        `;
        projectsList.appendChild(projectElement);
    });
}

// Focus on project on map
function focusOnProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        map.setCenter({ lat: project.lat, lng: project.lng });
        map.setZoom(15);
        
        // Find and click the marker
        const markerData = projectMarkers.find(m => m.project.id === projectId);
        if (markerData) {
            google.maps.event.trigger(markerData.marker, 'click');
        }
    }
}

// Remove project
function removeProject(projectId) {
    if (confirm('Are you sure you want to remove this project?')) {
        // Remove from projects array
        projects = projects.filter(p => p.id !== projectId);
        
        // Remove marker from map
        const markerIndex = projectMarkers.findIndex(m => m.project.id === projectId);
        if (markerIndex !== -1) {
            projectMarkers[markerIndex].marker.setMap(null);
            projectMarkers.splice(markerIndex, 1);
        }
        
        // Update UI
        updateProjectsList();
    }
}

// Tab functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove('active');
    }
    
    const tabbuttons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Initialize map when page loads
window.onload = initMap;

// Add this minimal report generation logic at the end of your script.js

document.getElementById('generateReport').addEventListener('click', async () => {
  const statusElement = document.getElementById('reportStatus');
  statusElement.innerHTML = 'Generating report...';
  try {
    const response = await fetch('http://localhost:8000/generate_report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate a basic traffic report.' })
    });
    const data = await response.json();
    document.getElementById('reportPreview').textContent = data.report || 'No report generated.';
    statusElement.innerHTML = 'Report generated successfully.';
  } catch (error) {
    statusElement.innerHTML = 'Error generating report.';
  }
});