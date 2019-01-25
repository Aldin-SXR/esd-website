const mapController = ($scope) => {
    $scope.initializeMap = () => {
        let myOptions = {
            zoom: 16,
            center: new google.maps.LatLng(43.8191235, 18.3120915), //change the coordinates
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false,
            }
        let map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
        let marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(43.8191235, 18.3120915) //change the coordinates
        });
        let contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h4 id="firstHeading" class="firstHeading">International Burch University</h4>'+
            '<div id="bodyContent">'+
            '<p><b><img style="margin: 10px 10px 10px 0px; witdth: 100px; height: 100px;" align="left" src="img/burch_logo.jpg"><a href="https://www.ibu.edu.ba">International Burch University (IBU)</a></b> was established in 2008 in Sarajevo, capital of Bosnia and Herzegovina, with the goal of presenting a unique opportunity to rethink the very idea of a modern university and formulate a blueprint for the future. Burch University began with a determined mission: “To advance learning and transform lives”. Now University pursues to adapt successfully to the needs of students by investing in world-class facilities for teaching, learning, research and recreation. With some of the highest quality teaching and research and the broadest spread o academic subjects, we will be able to complete in order being recognized as one of the leading universities in the region.</p>' +
            '</div>'+
            '</div>';
    
        let infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        google.maps.event.addListener(marker, "click", function() {
            infowindow.open(map, marker);
        });
    };
    google.maps.event.addDomListener(window, 'load', $scope.initializeMap);
} 