// place files you want to import through the `$lib` alias in this folder.
let tempData = [];

onMount(async () => {

    const res = await fetch('energy.csv'); 

    const csv = await res.text();

    tempData = d3.csvParse(csv, d3.autoType)

    console.log(tempData);

});