// place files you want to import through the `$lib` alias in this folder.
<<<<<<< HEAD
let energyData = [];
=======
let tempData = [];
>>>>>>> 1a975c8f594909695bbe97480a1b640c39322c01

onMount(async () => {

    const res = await fetch('energy.csv'); 

    const csv = await res.text();

<<<<<<< HEAD
    energyData = d3.csvParse(csv, d3.autoType)

    console.log(energyData);
=======
    tempData = d3.csvParse(csv, d3.autoType)

    console.log(tempData);
>>>>>>> 1a975c8f594909695bbe97480a1b640c39322c01

});