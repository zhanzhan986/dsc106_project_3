<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { geoNaturalEarth1, geoPath } from 'd3-geo';
  
    let energyData = [], mapData;
    let year, minYear, maxYear;
    const colorScale = d3.scaleSequential(d3.interpolateTurbo);
    let tooltipContent = '', tooltipX = 0, tooltipY = 0, showTooltip = false;
  
    onMount(async () => {
      const energyRes = await fetch('energy.csv');
      const csvText = await energyRes.text();
      energyData = d3.csvParse(csvText, d3.autoType)
                      .filter(d => d.primary_energy_consumption > 0);
  
      minYear = d3.min(energyData, d => d.year);
      maxYear = d3.max(energyData, d => d.year);
      year = minYear; // Initialize with the earliest year
  
      const logDomain = d3.extent(energyData, d => Math.log(d.primary_energy_consumption + 1));
      colorScale.domain(logDomain);
  
      const mapRes = await fetch('/world.geojson');
      mapData = await mapRes.json();
  
      drawMap();
    });
  
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
    }
  
    function updateYear(newYear) {
      year = newYear;
      drawMap(); // Redraw map with the newly selected year's data
    }
  </script>
  
  <style>
    #map {
      width: 100%;
      height: 500px;
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