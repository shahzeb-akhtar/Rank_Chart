# Create a Rank Chart
This project creates an interactive rank chart

## Table of Contents
<ol>
   <li><a href="#head1"> Description of the project</a>
   <li><a href="#head2"> Libraries used </a>
   <li><a href="#head3"> Directory structure </a>
   <li><a href="#head4"> Usage </a>
   <li><a href="#head5"> Author </a>
   <li><a href="#head6"> License </a>
</ol>



<h2 id="head1"> Description of the project </h2>
Given JSON array of object with the following properties, it creates an interactive rank chart:
<ul>
   <li>Year
   <li>Name
   <li>Rank
   <li>Value
</ul>

<h2 id="head2"> Libraries used </h2>

<ul>
 <li> d3.js
</ul>

<h2 id="head3"> Directory structure </h2>
```
.
├── data                                                    # Folder to hold data files
    ├── data.csv                                            # Data in CSV format
    ├── data.js                                             # Data in JSON format
    ├── data_dummy.csv                                      # Dummy data to test in CSV format
    ├── data_dummy.js                                       # Dummy data to test in JSON format 
├── js                                                      # Folder to hold JS files
    ├── d3-v4.js                                            # d3 v4 file
    ├── RankChart.js                                        # Main JS code for rank chart creation
├── index.html                                              # Index HTML file
├── README.md                                               # ReadMe file

```

<h2 id="head4"> Usage </h2>
To create any rank chart update the JSON data in data.js and open index.html file

## Interaction
On mouseover a particular line or circle for a name - trend for that names gets highlighted, while other trends gets faded away. Also, ranks for all years show up in circles

<h2 id="head5"> Author </h2>
Shahzeb Akhtar
https://www.linkedin.com/in/shahzebakhtar/

<h2 id="head6"> License </h2>
