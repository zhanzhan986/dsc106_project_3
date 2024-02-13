<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    let energyData = [];
  
    onMount(async () => {
      const res = await fetch('energy.csv');
      const csv = await res.text();
      energyData = d3.csvParse(csv, d3.autoType);
      console.log(energyData);
    });
  </script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
