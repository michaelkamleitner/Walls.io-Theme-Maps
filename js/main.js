var posts = [];
var map = null;;
var lastMarker = null;

var formatDate = function(date) {
  date = new Date(date);
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var appendixDate = "th";
  var lastDigit = date.getDate().toString().substring((date.getDate().toString().length)-1,date.getDate().toString().length);

  if (lastDigit == 1) {
    appendixDate = "st";
  } else if (lastDigit == 2) {
    appendixDate = "nd";
  } else if (lastDigit == 3) {
    appendixDate = "rd";
  }
  var result = months[date.getMonth()] + " " +
               date.getDate() + appendixDate + " " +
               date.getFullYear() + " - " +
               date.getHours() + ":" + date.getMinutes();
  return result;
}

var showPost = function() {
  if (post = posts.shift()) {
    console.log(post);
    if (lastMarker) {
      lastMarker.setMap(null);
    }
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(post.latitude, post.longitude),
        map: map,
    });

    marker.info = new google.maps.InfoWindow({
      content: '<div class="post">'+
               '<img class="" src="' + post.external_image + '"/>'+
               '<b>' + post.external_name + ':</b> '+ post.comment + '&nbsp;-&nbsp;' +
               '<span class="timestamp">' + formatDate(post.external_created) + '</span>'+
               (post.post_image ? '<img class="post" style="background-image:url(' + post.post_image + ');"/>' : '')+
               '</div>'
    });
    marker.info.open(map, marker);
    google.maps.event.addListener(marker, 'click', function() {
      marker.info.open(map, marker);
    });
    lastMarker = marker;
    /*setTimeout(function () {
      marker.setMap(null);
    }, 10000);*/
  }
}

$(document).ready(function() {

  // When the window has finished loading create our google map below
  google.maps.event.addDomListener(window, 'load', init);

  function init() {
    console.log('init');
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 6,

        // The latitude and longitude to center the map (always required)
        center: new google.maps.LatLng(40.6700, -73.9400), // New York

        // How you would like to style the map.
        // This is where you would paste any style found on Snazzy Maps.
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
    };

    // Get the HTML DOM element that will contain your map
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map');

    // Create the Google Map using our element and options defined above
    map = new google.maps.Map(mapElement, mapOptions);

    var stream = new WallStreamCore({
      wallId: "14239", // required
      host: "beta.walls.io",
      port: 81,
      onPost: function(post) {
        if (post.longitude && post.latitude) {
          posts.push(post);
        }
      }
    });

    setInterval(function() {
      showPost(posts);
    }, 4000 + Math.random() * (3000 - 0) + 0);
  }
});
