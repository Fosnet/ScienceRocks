import versor from "https://cdn.skypack.dev/versor@0.2";

var rotationDelay = 3000
var scaleFactor = 0.6
var degPerSec = 6
var angles = { x: -20, y: 40, z: 0 }
var colorGraticule = '#696969'
var colorCountry = '#228B22'



//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = { type: 'Sphere' }
var projection = d3.geoOrthographic().precision(0.1)
var graticule = d3.geoGraticule10()
var path = d3.geoPath(projection).context(context)
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height
var land, countries
var countryList
var autorotate, now, diff, roation
var currentCountry

//
// Functions
//

function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function scale() {
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
}

function stopRotation() {
  autorotate.stop()
}

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.mouse(this)))
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this)))
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
  startRotation(rotationDelay)
}



function drawPoints() {
  context.fillStyle = 'red';

  for (var i = 0; i < points.length; i++) {
    var coords = projection([points[i].longitude, points[i].latitude]);
    context.beginPath();
    context.arc(coords[0], coords[1], 5, 0, 2 * Math.PI);
    context.fill();

  }
}


//    if (points[i].clicked) {
//      context.fillStyle = 'yellow'; // Change color to yellow if clicked
//    }
//
//    context.fill();
//
//    var point = points[i];
//
//    canvas.on('click', function () {
//      if (!point.clicked) {
//        point.clicked = true;
//        updatePanelContent(point);
//        render(); // Call render to update the canvas with the new color
//      }
//    });





function render() {
  context.clearRect(0, 0, width, height)
  
  var water_image = document.createElement("img");
  water_image.setAttribute("src", "https://i.pinimg.com/564x/2d/6c/46/2d6c46b7f465abfe74a65f420a102a31.jpg");
  fill(water, water_image)
  stroke(graticule, colorGraticule)
  var land_image = document.createElement("img");
  land_image.setAttribute("src", "https://as2.ftcdn.net/jpg/03/76/96/49/160_F_376964902_mneBDgYwsNtxmtIfl4wpy4c4NiNh6wqj.jpg");
  fill(land, land_image)
  if (currentCountry) {
    colour(currentCountry, colorCountry)
  }
  drawPoints(); 
}

function fill(obj, image) {
  context.beginPath()
  path(obj)
  const pattern = context.createPattern(image, "repeat");
  context.fillStyle = pattern;
  context.fill();
  
}

function colour(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    var rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

function loadData(cb) {
  d3.json('https://unpkg.com/world-atlas@1/world/110m.json', function (error, world) {
    if (error) throw error
    d3.tsv('https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-country-names.tsv', function (error, countries) {
      if (error) throw error
      cb(world, countries)
    })
  })
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
  var n = polygon.length
  var p = polygon[n - 1]
  var x = point[0], y = point[1]
  var x0 = p[0], y0 = p[1]
  var x1, y1
  var inside = false
  for (var i = 0; i < n; ++i) {
    p = polygon[i], x1 = p[0], y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1, y0 = y1
  }
  return inside
}

function mousemove() {
  var c = getCountry(this)
  if (!c) {
    if (currentCountry) {
      currentCountry = undefined
      render()
    }
    return
  }
  if (c === currentCountry) {
    return
  }
  currentCountry = c
  render()
}

function getCountry(event) {
  var pos = projection.invert(d3.mouse(event))
  return countries.features.find(function (f) {
    return f.geometry.coordinates.find(function (c1) {
      return polygonContains(c1, pos) || c1.find(function (c2) {
        return polygonContains(c2, pos)
      })
    })
  })
}

function updatePanelContent(point) {
    if (typeof point !== 'undefined') {
        console.log(point)
        console.log(point.date_str)

        const updatedContent = point.notes
        console.log(">>> this is updated content \n", updatedContent);
        const splitLines = str => str.split(/\r?\n/);
        var display_content = splitLines(updatedContent);
        let list = document.getElementById("panel-content")
        for (var i =0 ; i < display_content.length; i++) {
          let li = document.createElement('li');
          li.innerText = display_content[i];
          list.appendChild(li);
        }

        document.getElementById("panel-title").innerHTML = "Fireball : ";
        document.getElementById("panel-title").textContent += point.date_str;
        // document.getElementById("panel-content").textContent = updatedContent;


    }
}


//
// Initialization
//

setAngles()


// Initial content
updatePanelContent();


canvas
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
  )
  .on('mousemove', mousemove)



var selectedPoint = null;
var minDistance = Infinity;

canvas.on('mousemove', function (event) {
    var mouseCoords = d3.mouse(this)
  var mouseX = mouseCoords[0]
  var mouseY = mouseCoords[1]

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    var coords = projection([point.longitude, point.latitude]);
    var pointX = coords[0];
    var pointY = coords[1];

    var distance = Math.sqrt(Math.pow(pointX - mouseX, 2) + Math.pow(pointY - mouseY, 2));

    if (distance < minDistance) {
      minDistance = distance;
      selectedPoint = point;
    }
  }
});

canvas.on('click', function () {
  if (selectedPoint) {

    

    document.getElementById("panel-content").innerHTML = "";
    // Handle the click on the selected point
    console.log('Selected Point:', selectedPoint);

    // You can update the panel content or perform other actions here
    updatePanelContent(selectedPoint);

    

    // Reset the selected point and minimum distance
    selectedPoint = null;
    minDistance = Infinity;
  }
});


loadData(function (world, cList, airports) {
  land = topojson.feature(world, world.objects.land)
  countries = topojson.feature(world, world.objects.countries)
  // countryList = cList

  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
})