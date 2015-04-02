// First, create an object containing LatLng and population for each city.
var citymap = {
  "Москва":          {
    "location": {
      "lat": 55.755826,
      "lng": 37.6173
    },
    radius:     20000
  },
  "Екатеринбург":    {
    "location": {
      "lat": 56.83892609999999,
      "lng": 60.6057025
    },

    radius: 10000
  },
  "Ярославль":       {
    "location": {
      "lat": 57.62607440000001,
      "lng": 39.8844708
    },

    radius: 10000
  },
  "Новосибирск":     {
    "location": {
      "lat": 55.00835259999999,
      "lng": 82.9357327
    },

    radius: 10000
  },
  "Казань":          {
    "location": {
      "lat": 55.790278,
      "lng": 49.134722
    },

    radius: 10000
  },
  "Самара":          {
    "location": {
      "lat": 53.202778,
      "lng": 50.140833
    },

    radius: 10000
  },
  "Пермь":           {
    "location": {
      "lat": 58.00000000000001,
      "lng": 56.316667
    },

    radius: 10000
  },
  "Белгород":        {

    "location": {
      "lat": 50.5997134,
      "lng": 36.5982621
    },

    radius: 10000
  },
  "Ростов-на-Дону":  {
    "location": {
      "lat": 47.23333299999999,
      "lng": 39.7
    },

    radius: 10000
  },
  "Санкт-Петербург": {
    "location": {
      "lat": 59.9342802,
      "lng": 30.3350986
    },
    radius:     15000
  },
  "Калининград":     {

    "location": {
      "lat": 54.716667,
      "lng": 20.516667
    },

    radius: 10000
  },
  "Киев":            {

    "location": {
      "lat": 50.4501,
      "lng": 30.5234
    },

    radius: 20000
  },
  "Харьков":         {

    "location": {
      "lat": 49.9935,
      "lng": 36.230383
    },

    radius: 18000
  },
  "Днепропетровск":  {

    "location": {
      "lat": 48.464717,
      "lng": 35.046183
    },

    radius: 10000
  },
  "Одесса":          {

    "location": {
      "lat": 46.482526,
      "lng": 30.7233095
    },

    radius: 10000
  },
  "Львов":           {

    "location": {
      "lat": 49.839683,
      "lng": 24.029717
    },

    radius: 10000
  },
  "Херсон":          {

    "location": {
      "lat": 46.635417,
      "lng": 32.616867
    },

    radius: 10000
  },
  "Донецк":          {

    "location": {
      "lat": 48.015883,
      "lng": 37.80285
    },

    radius: 10000
  },
  "Винница":         {

    "location": {
      "lat": 49.233083,
      "lng": 28.468217
    },

    radius: 10000
  },
  "Минск":           {

    "location": {
      "lat": 53.90453979999999,
      "lng": 27.5615244
    },

    radius: 10000
  }


};

var cityCircle;

function initialize() {
  // Create the map.
  var mapOptions = {
    zoom:               5,
    center:             new google.maps.LatLng(54.231473, 37.734144),
    mapTypeId:          google.maps.MapTypeId.TERRAIN,
    scrollwheel:        false, // Disable Mouse Scroll zooming (Essential for responsive sites!)
    panControl:         false, // Set to false to disable
    mapTypeControl:     false, // Disable Map/Satellite switch
    scaleControl:       true, // Set to false to hide scale
    streetViewControl:  false, // Set to disable to hide street view
    overviewMapControl: false, // Set to false to remove overview control
    rotateControl:      false, // Set to false to disable rotate control
    styles:             [{
      "featureType": "all",
      "elementType": "all",
      "stylers":     [{"weight": 0.1}, {"hue": "#a39b00"}, {"saturation": -85}, {"lightness": 0}, {"gamma": 1.1}]
    }, {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers":     [{"hue": "#226c94"}, {"saturation": 8}, {"lightness": -10}]
    }]

  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  // Construct the circle for each value in citymap.
  // Note: We scale the area of the circle based on the population.
  for (var city in citymap) {
    var circleOptions = {
      strokeColor:   '#C13335',
      fillColor:     '#C13335',
      strokeOpacity: 1,
      fillOpacity:   1,
      map:           map,
      center:        new google.maps.LatLng(citymap[city].location.lat, citymap[city].location.lng),
      radius:        citymap[city].radius
    };
    // Add the circle for this city to the map.
    cityCircle = new google.maps.Circle(circleOptions);
  }
}

initialize();
