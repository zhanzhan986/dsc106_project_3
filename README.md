# Primary Energy Consumptions in the World: Which Countries are Consuming More?

We selected data on global energy consumption and aimed to export the total energy consumption for all countries worldwide. Our goal was to create a comprehensive visualization that could analyze changes in energy consumption over time across all countries. To achieve this, we decided on a world map visualization, utilizing color variations to represent each country's data. However, during the data import, we encountered discrepancies in country names between our dataset and the world geographical map file. As a solution, we conducted data cleaning to standardize country names, ensuring alignment between the two.

Upon completion of data cleaning, we observed that color changes on the map were not sufficiently noticeable, primarily due to the vast range of consumption data. To address this issue, we implemented a logarithmic color encoding scheme to enhance the visibility of color changes on the map. If the color of the countries is gray in the map, it means that there is no data for that country in the corresponding year. The redder the color is, the higher the consumption the country demands for that year. 

To provide more detailed information, we incorporated tooltips for each country, displaying consumption data. Users can easily access this information by hovering over a specific country region with their mouse. Additionally, we introduced some user-friendly features—a timeline bar, a search bar for years and country—to allow users to select different years and countries for analysis. The timeline bar on the top right corner allows users to move to select the year they want. For the input bar, the country that users enter will be highlighted on the map and the data on that year will show in a sentence which helps users to find the data they need without finding the country in the map and moving the timeline bar at the sametime. Additionally, we can use reset to clean all the search information users enter if users want to do another search.

Our collaborative work was organized through Zoom meetings, where we brainstormed ideas, established a conceptual framework, and communicated effectively to devise the best approach for presenting our data. We all write our own code and choose the best one as our final project to present. The tasks were distributed among team members, with Haoyang doing the data cleaning and matching the country names between the geographical map file and data file, and also help to generate the color scales appear in the map; Steven wrote the best version of our project baseline and write the most parts of the code, so we made all changes based on his version; Jessie Zhang did the subsequent enhancements, such as coming up with adding timeline bars and tooltips and also writing the write-up and conclusion for the project. 

The collaborative effort was pivotal in successfully importing data into the visualization and designing dynamic color changes over time. It took us about 2 or 3 hours to get them done. It takes about 5 hours for each of us to finish this project since we did it together using zoom and update to each other if we make some changes or have some new ideas.
