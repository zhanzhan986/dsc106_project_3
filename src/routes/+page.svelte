<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { geoNaturalEarth1, geoPath } from 'd3-geo';

  let energyData = [], mapData;
  let year;
  let minYear = 1965;
  let maxYear = 2021;
  const colorScale = d3.scaleSequential().interpolator(d3.interpolateRgb("#f0ee99", "#eb4034"));
  let tooltipContent = '', tooltipX = 0, tooltipY = 0, showTooltip = false;
  let searchCountry = '', searchYear = ''; // Variables for search inputs
  let searchResult = ''; // For displaying search results on the page
  let countrySuggestions = [];

  // Assuming you have a list of all country names in your data
  let allCountries = []; // This will be populated with unique country names
  
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

    // After fetching and processing your data, populate allCountries
    allCountries = Array.from(new Set(energyData.map(d => d.country))).sort();
  });

  // Watch for changes in searchCountry and update suggestions
  $: if (searchCountry) {
    countrySuggestions = allCountries.filter(country => 
      country.toLowerCase().includes(searchCountry.toLowerCase())
    ).slice(0, 5); // Limit the number of suggestions
  } else {
    countrySuggestions = [];
  }

  $: if (searchCountry) {
    const exactMatch = allCountries.find(country => country.toLowerCase() === searchCountry.toLowerCase());
    countrySuggestions = allCountries.filter(country => 
      country.toLowerCase().includes(searchCountry.toLowerCase()) && country !== exactMatch
    ).slice(0, 5); // Limit the number of suggestions
  } else {
    countrySuggestions = [];
  }

  function drawLegend() {
    const svg = d3.select('#map');
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const width = +svg.style('width').replace('px', '') - margin.left - margin.right;
    const height = +svg.style('height').replace('px', '') - margin.top - margin.bottom;

    // Define legend properties
    const legendWidth = 400; // Adjust based on your needs
    const legendHeight = 20; // Adjust based on your needs
    const legendPositionX = (width - legendWidth) / 2; // Center horizontally
    const legendPositionY = height - legendHeight - 100; // Position at the bottom with some padding

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
      .style('fill', 'white') 
      .text('0'); // Minimum value

    // Add maximum value label at the right side of the legend
    svg.append('text')
      .attr('x', legendPositionX + legendWidth)
      .attr('y', legendPositionY + legendHeight + 20) // Adjust position as needed
      .style('text-anchor', 'end') // Anchor text at end for right alignment
      .style('fill', 'white') 
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
         tooltipContent = countryData ?
                   `${d.properties.name}: ${countryData.primary_energy_consumption} Terawatt-Hours` :
                   `${d.properties.name}: No data`; // Include country name before "No data"
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
    if (searchCountry) highlightCountry(searchCountry); // Re-highlight if a country was searched
  }

  function searchData() {
    if (!searchCountry || !searchYear) {
        searchResult = 'Please enter both country and year.';
        return;
    }

    const yearInt = parseInt(searchYear, 10);
    if (yearInt < 1965 || yearInt > 2021) {
        searchResult = 'Year must be between 1965 and 2021.';
        return;
    }

    const filteredData = energyData.filter(d => 
      d.country.toLowerCase() === searchCountry.toLowerCase() && d.year === parseInt(searchYear, 10)
    );
    
    if (filteredData.length > 0) {
        // Data exists, update the year and the map visualization
        year = yearInt; // Update the year
        searchResult = `${searchCountry} in ${searchYear}: ${filteredData[0].primary_energy_consumption} Terawatt-Hours`;

        // Trigger map update for the new year
        updateYear(year);

        // Highlight the searched country
        highlightCountry(searchCountry);
    } else {
        searchResult = `${searchCountry} in ${searchYear}: No data`;
    }

    // Clear the countrySuggestions to hide the list of hints
    countrySuggestions = [];
  }

  function highlightCountry(countryName) {
    // Normalize the search input to lowercase
    const searchNameLower = countryName.toLowerCase();

    // Reset any previous highlights
    d3.select('#map').selectAll('path')
        .style('stroke', null)
        .style('stroke-width', null);

    // Apply a stroke to the searched country for highlighting
    d3.select('#map').selectAll('path')
        .filter(d => d.properties.name.toLowerCase() === searchNameLower)
        .style('stroke', 'blue') // Highlight color
        .style('stroke-width', 2); // Highlight width
  }

 function selectCountry(country) {
  searchCountry = country; // Update the search input with the selected country
  countrySuggestions = []; // Clear suggestions
  }

  function resetSearch() {
    searchCountry = '';
    searchYear = '';
    searchResult = '';
    countrySuggestions = []; // Clear country suggestions

    // Optionally reset the year to its initial value or a default value
    year = minYear; // Assuming you want to revert to the initial state

    // Clear any highlights from the map
    d3.select('#map').selectAll('path')
      .style('stroke', null)
      .style('stroke-width', null);

    // Redraw the map if necessary to remove any highlights
    drawMap();
  }
  
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      searchData();
    }
  }
</script>

<style>
  h1 {
  text-align: center; /* Centers the title text */
  }
  :global(html) {
    height: 100%; /* Ensure the root element fills the entire viewport */
    background-image: url('/dsc106_project_3_draft/background3.jpg'); /* Relative path to your image */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative; 
  }
  :global(html)::before {
    content: ''; /* Required for a pseudo-element */
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.3); /* Semi-transparent white overlay; adjust the alpha value as needed */
    z-index: -1; /* Ensures the overlay is behind the content */
  }
  #map {
    width: 80%; /* Adjust the width as needed */
    min-height: 700px; /* Adjust the height as needed */
    margin: 0 auto; /* This centers the map horizontally */
    display: block; /* Ensures the map is treated as a block-level element, which respects margin auto for centering */
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
      top: 110px;
      right: 20px;
      width: 400px;
    }
  .year-display {
    text-align: justify;
    margin-top: 5px;
  }
  .search-container {
    position: relative;
    display: inline-block; /* Ensure the container only takes the width of its content */
  }
  .search-container input,
  .search-results {
    margin-top: 20px;
    text-align: left; /* Aligns the text of the search results to the left */
    padding-left: 20px; /* Adds some padding to align with the search bar, adjust as needed */
    font-size: 16px;
    color: #333;
  }
  .autocomplete-suggestions {
    position: absolute;
    width: calc(100% - 80px); /* Set width relative to the country input field (adjust the value according to your layout) */
    background-color: #e7f0fa; /* Light blue background */
    border-radius: 5px; /* Rounded corners */
    border: 1px solid #ccc; /* Border color */
    box-sizing: border-box; /* Ensure padding and border are included in the width */
    margin-bottom: 10px; /* Add some bottom margin for spacing */
  }
  .autocomplete-suggestions li {
    padding: 5px;
    cursor: pointer;
  }
  .autocomplete-suggestions li:hover {
    background-color: #f0f0f0;
  }
</style>

<h1>Primary Energy Consumptions in the World: Which countries are Consuming More?</h1>
<div class="search-container">
  <input type="text" 
  placeholder="Country" 
  bind:value={searchCountry}
  on:keydown={handleKeydown}>

<input type="number" 
  placeholder="Year" 
  bind:value={searchYear} 
  min="1965" 
  max="2021"
  on:keydown={handleKeydown}>

<button on:click={searchData}>Search</button>
  <button on:click={resetSearch}>Reset</button> <!-- Add this line for the Reset button -->
  {#if countrySuggestions.length > 0}
    <ul class="autocomplete-suggestions">
      {#each countrySuggestions as suggestion}
        <li on:click={() => selectCountry(suggestion)}>{suggestion}</li>
      {/each}
    </ul>
  {/if}
</div>
<!-- Search results are now directly under the search bar -->
<div class="search-results">{searchResult}</div>

<svg id="map"></svg>
<div class="slider-container">
  <input type="range" min={minYear} max={maxYear} value={year} class="slider" on:input="{e => updateYear(+e.target.value)}">
  <div class="year-display">Year: {year}</div>
</div>
<div class="tooltip" style="top: {tooltipY}px; left: {tooltipX}px;" class:show="{showTooltip}">
  {tooltipContent}
</div>