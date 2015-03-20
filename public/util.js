function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
   }
  console.log('Query variable %s not found', variable);
}
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos){
      console.log('google:'+google.maps.Geocoder);
      var g = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);;
      g.geocode ({'location':latlng}, function(results, status) {
        if(status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            for(var i=0; i<results[0].address_components.length; i++){
                var types = results[0].address_components[i].types;
                if(types[0]==='postal_code') {
                  var postalCode = results[0].address_components[i].long_name;
                  console.log(postalCode);
                }
            }
         }
        }
      });
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function initialize() {
   console.log('init google:'+google.maps.Geocoder);
}

//not used
function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  //var surl="https://maps.googleapis.com/maps/api/js?key=AIzaSyDZtP55ULHGM5hC9f3V4fCuMoROeoTRLeE&sensor=true";
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' +
      'callback=initialize';
  document.body.appendChild(script);
}
function showPropOnMap(locations) { 
  gmap = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: new google.maps.LatLng(37.42, -122.0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var infowindow = new google.maps.InfoWindow();

  var marker, i;

  for (i = 0; i < locations.length; i++) {  
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: gmap
    });

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent('<a href="http://zillow.com'+locations[i][3]+'">'+locations[i][0]+'</a> '+locations[i][5]+"/"+locations[i][6]+" "+locations[i][4]);
        infowindow.open(gmap, marker);
      }
    })(marker, i));
  }
}
function init(){
  if(getQueryVariable('zipcode')===undefined) {
    getLocation();
  }
  $('#cssurl_btn').click(function() {
    var cssurl=$('#cssurl').val();
    $('link[rel="stylesheet"]').attr('href',cssurl);
  });
}
var gmap;
