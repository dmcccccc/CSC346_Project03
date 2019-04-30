window.onload = function () {
    query();
};

function query() {

    const url = "http://" + window.location.hostname + ":" + window.location.port + "/";

    var temp = window.location.href;

    var args = temp.split("?")[1];
    var id = args.split("&")[1];

    const query = "?command=getCharacter&" + id;

    console.log("id = " + id);

    fetch(url + query)
        .then(checkStatus)
        .then(function (responseText) {
            let q = JSON.parse(responseText);
            setTable(q);
            setRadarChart(q);
            setPhoto(q);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function setPhoto(q) {
    var result = q[0];
    //var charactertName = result.characterName;

    // Imports the Google Cloud client library
   // const {Storage} = require('@google-cloud/storage');

    // Creates a client
   // const storage = new Storage();

   // const bucketName = 'csc346project03photo';
   // const srcFilename = charactertName + '.jpg';
    //const destFilename = charactertName + '.jpg';

    //const options = {
        // The path to which the file should be downloaded, e.g. "./file.txt"
      //  destination: './image/' + destFilename,
    //};

    // Downloads the file
    //storage
      //  .bucket(bucketName)
        //.file(srcFilename)
        //.download(options);

    //console.log(
     //   `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    //);

    // var ACCESS_TOKEN = 'XWBvqWaFf2AAAAAAAAAAE9GJQZZpOVL0AUhx9AFeZLx7K_jloUv7LXrLVifNbcRJ';
    // var SHARED_LINK = 'https://www.dropbox.com/s/u8trf0n8eamgg31/' + result.photofilename;
    // var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
    // dbx.sharingGetSharedLinkFile({url: SHARED_LINK})
    //     .then(function(data) {
    //         var downloadUrl = URL.createObjectURL(data.fileBlob);
    //         var downloadButton = document.createElement('a');
    //         downloadButton.setAttribute('href', downloadUrl);
    //         downloadButton.setAttribute('download', data.name);
    //         downloadButton.setAttribute('class', 'button');
    //         downloadButton.innerText = 'Download: ' + data.name;
    //         document.getElementById('results').appendChild(downloadButton);
    //     })
    //     .catch(function(error) {
    //         console.error(error);
    //     });

    var imageDiv = document.getElementById("image")
    var img = new Image(100,100);
    img.id = "photo";
    img.src = 'https://www.dropbox.com/s/u8trf0n8eamgg31/' + result.photofilename;
    imageDiv.appendChild(img);
}

// Setup tables
function setTable(q) {
    var result = q[0];
    document.getElementById("playerName").innerHTML = result.username;
    document.getElementById("characterName").innerHTML = result.characterName;
    document.getElementById("level").innerHTML = result.lvl;
    document.getElementById("role").innerHTML = result.role;
    document.getElementById("strength").innerHTML = result.strength;
    document.getElementById("constitution").innerHTML = result.constitution;
    document.getElementById("dexterity").innerHTML = result.dexterity;
    document.getElementById("intelligence").innerHTML = result.intelligence;
    document.getElementById("wisdom").innerHTML = result.wisdom;
    document.getElementById("charisma").innerHTML = result.charisma;
}

// ----------------------------------------------------------
// when called
// 1. check for status send back from http
// 2. if status is between 200 and 300,
//    then status is okay return the response
// 3. if status is 404 or other status,
//    then reject and sent back an error message.
// ----------------------------------------------------------
function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.text();
    } else if (response.status == 404) {
        // error
        return Promise.reject(new Error("cannot find page!"));
    } else {
        return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
}

//Set up radar chart
function setRadarChart(q) {
    var result = q[0];
    var data = {
        names: ['Strength', 'Constitution', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma'],
        values: [[result.strength, result.constitution, result.dexterity, result.intelligence, result.wisdom, result.charisma]]
    };

    var radarChart = d3.select("#radarChart").append('g')
        .classed('radarChart', true)
        .attr('transform', "translate(100,100)");

    var radius = 50,
        edge = 6,
        depth = 5,
        rangeMin = 0,
        rangeMax = 100,
        circle = 2 * Math.PI;

    // Variable to hold each arc
    var arc = circle / edge;

    // Variable to hold the polygons
    var polygons = {
        webs: [],
        webPoints: []
    };
    for (var j = depth; j > 0; j--) {
        var webs = '',
            webPoints = [];
        var r = radius / depth * j;
        for (var i = 0; i < edge; i++) {
            var x = r * Math.sin(i * arc),
                y = r * Math.cos(i * arc);
            webs += x + ',' + y + ' ';
            webPoints.push({
                x: x,
                y: y
            });
        }
        polygons.webs.push(webs);
        polygons.webPoints.push(webPoints);
    }

    // Draw the webs
    var webs = radarChart.append('g')
        .classed('webs', true);
    webs.selectAll('polygon')
        .data(polygons.webs)
        .enter()
        .append('polygon')
        .attr('points', function (d) {
            return d;
        });


    // Draw the axises
    var lines = radarChart.append('g')
        .classed('lines', true);
    lines.selectAll('line')
        .data(polygons.webPoints[0])
        .enter()
        .append('line')
        .attr("stroke", "black")
        .attr("stroke-dasharray", "10 5")
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', function (d) {
            return d.x;
        })
        .attr('y2', function (d) {
            return d.y;
        });


    // Caluculate the location of points
    var areasData = [];
    var values = data.values;
    for (var i = 0; i < values.length; i++) {
        var value = values[i],
            area = '',
            points = [];
        for (var k = 0; k < edge; k++) {
            var r = radius * (value[k] - rangeMin) / (rangeMax - rangeMin);
            var x = r * Math.sin(k * arc),
                y = r * Math.cos(k * arc);
            area += x + ',' + y + ' ';
            points.push({
                x: x,
                y: y
            })
        }
        areasData.push({
            polygon: area,
            points: points
        });
    }

    // Add areas
    var areas = radarChart.append('g')
        .classed('areas', true);
    // Plot the points and areas
    areas.selectAll('g')
        .data(areasData)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return 'area' + (i + 1);
        });
    for (var i = 0; i < areasData.length; i++) {
        var area = areas.select('.area' + (i + 1)),
            areaData = areasData[i];
        area.append('polygon')
            .attr('points', areaData.polygon)
            .attr('stroke', function (d, index) {
                return "lightgray";
            })
            .attr('fill', function (d, index) {
                return "lightgray";
            });
    }

    // Calculate the location of tags
    var textPoints = [];
    var textRadius = radius + 20;
    for (var i = 0; i < edge; i++) {
        var x = textRadius * Math.sin(i * arc),
            y = textRadius * Math.cos(i * arc);
        textPoints.push({
            x: x,
            y: y
        });
    }

    // Plot the tags
    var texts = radarChart.append('g')
        .classed('texts', true)
        .attr('transform', "translate(-30,6)");
    texts.selectAll('text')
        .data(textPoints)
        .enter()
        .append('text')
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        })
        .text(function (d, i) {
            return data.names[i];
        });
}
