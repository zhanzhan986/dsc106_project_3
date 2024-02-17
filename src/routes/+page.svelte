<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { geoNaturalEarth1, geoPath } from 'd3-geo';
  
    let energyData = [], mapData;
    let year, minYear, maxYear;
    const colorScale = d3.scaleSequential().interpolator(d3.interpolateRgb("#f0ee99", "#eb4034"));
    let tooltipContent = '', tooltipX = 0, tooltipY = 0, showTooltip = false;
    
    const renameMap = {
        // Example: 'CSV Name': 'GeoJSON Name',
        'United States':'United States of America',
        "United States Territories (Shift)" : 'United States of America',
        "United States Virgin Islands" : "U.S. Virgin Is.",
        "Western Sahara" : 'W. Sahara',
        'Democratic Republic of Congo': 'Dem. Rep. Congo',
        'Central African Republic': 'Central African Rep.',
        "Cote d'Ivoire": "Côte d'Ivoire",
        "Cape Verde": "Cabo Verde",
        "Cook Islands": "Cook Is.",
        'Equatorial Guinea': 'Eq. Guinea',
        'South Sudan': 'S. Sudan',
        'Dominican Republic':'Dominican Rep.',
        'Solomon Islands': 'Solomon Is.',
        'Cayman Islands': 'Cayman Is.',
        'East Timor': 'Timor-Leste',
        'British Virgin Islands': 'British Virgin Is.',
        'Bosnia and Herzegovina':'Bosnia and Herz.',
        'Falkland Islands':'Falkland Is.',
        'Saint Pierre and Miquelon': 'St. Pierre and Miquelon',
        'Sao Tome and Principe': 'São Tomé and Principe',
        'Saint Kitts and Nevis': "St. Kitts and Nevis",
        'Saint Vincent and the Grenadines':'St. Vin. and Gren.',
        'Northern Mariana Islands' :'N. Mariana Is.'
        };

    onMount(async () => {
      const energyRes = await fetch('energy.csv');
      const csvText = await energyRes.text();
      energyData = d3.csvParse(csvText, d => {
            // Use the rename map to correct country names
            if (renameMap[d.country]) {
            d.country = renameMap[d.country];
            }
            return d3.autoType(d);
        })
                      .filter(d => d.primary_energy_consumption > 0);
  
      minYear = d3.min(energyData, d => d.year);
      maxYear = d3.max(energyData, d => d.year)-1;
      year = minYear; // Initialize with the earliest year
  
      const logDomain = d3.extent(energyData, d => Math.log(d.primary_energy_consumption + 1));
      colorScale.domain(logDomain);
  
      const baseURL = location.hostname === 'localhost' ? '' : '/dsc106_project_3_draft';

      const mapRes = await fetch(`${baseURL}/world.geojson`);
      mapData = await mapRes.json();
  
      drawMap();
    });

    function drawLegend() {
      const svg = d3.select('#map');
      const margin = { top: 20, right: 20, bottom: 30, left: 20 };
      const width = +svg.style('width').replace('px', '') - margin.left - margin.right;
      const height = +svg.style('height').replace('px', '') - margin.top - margin.bottom;

      // Define legend properties
      const legendWidth = 400; // Adjust based on your needs
      const legendHeight = 20; // Adjust based on your needs
      const legendPositionX = (width - legendWidth) / 2; // Center horizontally
      const legendPositionY = height - legendHeight - 10; // Position at the bottom with some padding

      // Sample gradient for the legend - replace with your color scale
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale.range()[0]); // Starting color

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale.range()[1]); // Ending color

      // Draw the legend rectangle
      svg.append('rect')
        .attr('x', legendPositionX)
        .attr('y', legendPositionY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#gradient)');

      svg.append('text')
        .attr('x', legendPositionX)
        .attr('y', legendPositionY + legendHeight + 20) // Adjust position as needed
        .style('text-anchor', 'start') // Anchor text at start for left alignment
        .text('0'); // Minimum value

      // Add maximum value label at the right side of the legend
      svg.append('text')
        .attr('x', legendPositionX + legendWidth)
        .attr('y', legendPositionY + legendHeight + 20) // Adjust position as needed
        .style('text-anchor', 'end') // Anchor text at end for right alignment
        .text('45,000 TWH'); // Maximum value
    }



    function drawMap() {
      const svg = d3.select('#map').html('');
      const projection = geoNaturalEarth1();
      const pathGenerator = geoPath().projection(projection);
  
      const yearData = energyData.filter(d => d.year === year);
  
      svg.selectAll('path')
         .data(mapData.features)
         .join('path')
         .attr('d', pathGenerator)
         .attr('fill', d => {
           const countryData = yearData.find(cd => cd.country === d.properties.name);
           return countryData ? colorScale(Math.log(countryData.primary_energy_consumption + 1)) : '#ddd';
         })
         .on('mousemove', (event, d) => {
           const countryData = yearData.find(cd => cd.country === d.properties.name);
           tooltipContent = countryData ? `${d.properties.name}: ${countryData.primary_energy_consumption} Terawatt-Hours` : 'No data';
           tooltipX = event.pageX;
           tooltipY = event.pageY - 28; // Adjust Y position to avoid cursor overlap
           showTooltip = true;
         })
         .on('mouseleave', () => {
           showTooltip = false;
         });
      drawLegend();
    }
  
    function updateYear(newYear) {
      year = newYear;
      drawMap(); // Redraw map with the newly selected year's data
    }
  </script>
  
  <style>
    #map {
      width: 100%;
      height: 600px;
      position: relative;
    }
    .tooltip {
      position: fixed;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      font-size: 14px;
      z-index: 100;
    }
    .tooltip.show {
      opacity: 1;
    }
    .slider-container {
      position: absolute;
      top: 0;
      right: 20px;
      width: 200px;
    }
    .year-display {
      text-align: center;
      margin-top: 5px;
    }
  </style>
  
  <h1>World Primary Energy Consumption by Year</h1>
  <svg id="map"></svg>
  <div class="slider-container">
    <input type="range" min={minYear} max={maxYear} value={year} class="slider" on:input="{e => updateYear(+e.target.value)}">
    <div class="year-display">Year: {year}</div> <!-- Display the current year here -->
  </div>
  <!-- Tooltip element -->
  <div class="tooltip" style="top: {tooltipY}px; left: {tooltipX}px;" class:show="{showTooltip}">
    {tooltipContent}
  </div>