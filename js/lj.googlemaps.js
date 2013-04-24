function GoogleDirectionsViewModel(){
  var self = this;
  self.map = null;
  self.errorMessage = ko.observable();
  self.urlBase = "http://maps.google.com/maps?saddr=[START LOCATION]&daddr=[END LOCATION]";
  self.url = ko.observable();
  self.directionsHTML = null;
  self.staticUrl = ko.observable().syncWith('staticUrl');
  self.startinglocationlatlng = ko.observable();
  self.endinglocationlatlng = ko.observable();
  self.googleMapBounds = null;
  self.encodedPath = null;
  self.directionsRenderer = new google.maps.DirectionsRenderer();
  self.directionsRenderer2 = new google.maps.DirectionsRenderer();

  google.maps.event.addListener(self.directionsRenderer, 'directions_changed', function(){
	self.directionsHTML = document.getElementById('directionsPanel').innerHTML;
  });
  
  self.initializeGoogleMap = function(StartingLocationLatLng, EndingLocationLatLng){
	var dfd = new $.Deferred();
    self.startinglocationlatlng(StartingLocationLatLng);
    self.endinglocationlatlng(EndingLocationLatLng);
    if(self.map === null){
      var mapOptions = {
        center: StartingLocationLatLng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map_canvas = document.getElementById('map_canvas');
      self.map = new google.maps.Map(map_canvas, mapOptions);
    }
	//setTimeout(function(){ dfd.resolve();}, 100);
	dfd.resolve();
	return dfd.promise();;
  };

  self.getDirections = function(StartingLocationLatLng, EndingLocationLatLng){
	var dfd = new $.Deferred();
	$.when(self.initializeGoogleMap(StartingLocationLatLng, EndingLocationLatLng)).then(function(){
    var showBoundingBox = false;
    self.directionsRenderer.setMap(null);
    self.directionsRenderer.setMap(self.map);
    self.directionsRenderer2.setMap(null);

    var directionsPanel = document.getElementById('directionsPanel');
    $(directionsPanel).empty();
	
    self.directionsRenderer2.setPanel(document.getElementById('mapsDirections'));
    self.directionsRenderer.setPanel(directionsPanel);


    var directionsService = new google.maps.DirectionsService();
    var request = {
      origin: self.startinglocationlatlng(),
      destination: self.endinglocationlatlng(),
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
      unitSystem: google.maps.DirectionsUnitSystem.IMPERIAL
    };

    var directionsResult = directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
		self.encodedPath = response.routes[0].overview_polyline.points.replace(/\\/g, "\\\\");
        self.directionsRenderer.setDirections(response);
        self.directionsRenderer2.setDirections(response);
		self.staticUrl("http://maps.googleapis.com/maps/api/staticmap?markers=color:red%7clabel:A%7c"+response.routes[0].legs[0].start_location.jb+','+response.routes[0].legs[0].start_location.kb
							+"&markers=color:red%7clabel:B%7c"+response.routes[0].legs[0].end_location.jb+','+response.routes[0].legs[0].end_location.kb
							+"&sensor=false&size=670x300"
							+"&path=enc:"+response.routes[0].overview_polyline.points);
        self.googleMapBounds = response.routes[0].bounds;
        self.map.setCenter(self.googleMapBounds.getCenter());

        if(showBoundingBox === true){
          var ne = self.googleMapBounds.getNorthEast();
          var sw = self.googleMapBounds.getSouthWest();

          var boundingBoxPoints = [
            ne, new google.maps.LatLng(ne.lat(), sw.lng()),
            sw, new google.maps.LatLng(sw.lat(), ne.lng()), ne
          ];

          var boundingBox = new google.maps.Polyline({
            path: boundingBoxPoints,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });

          boundingBox.setMap(self.map);
        }
        self.errorMessage("");
		dfd.resolve();
      } else {
        self.errorMessage("Error: " + status);
		dfd.reject();
      }
    });
	}).fail(function(){dfd.reject();});
	return dfd.promise();
  };
}



function GoogleMapsViewModel(){
	var self= this;
	self.isTracking = false;
	self.start_location = ko.observable().syncWith('newLocationfrom');
	self.searchStart_visible = ko.observable().syncWith('searchVisiblefrom');
	self.lastAddress = '';
	self.useMyLocation = function(){
		try {
		  if (typeof navigator.geolocation === 'undefined'){
			gl = google.gears.factory.create('beta.geolocation');
		  } else {
			gl = navigator.geolocation;
		  }
		} catch(e) {}

		if (gl) {
		  if(!self.isTracking && (!self.start_location() || !self.start_location().timestamp || (new Date() - self.start_location().timestamp > 100000))){
			self.isTracking = true;
			gl.getCurrentPosition(self.displayPosition, self.displayError);
			 mainVM.storageObject['fromSearchType'] = 'google';
		  }
		} else {
		  alert("Geolocation services are not supported by your web browser.");
		}
	}

	self.displayPosition = function(position) {
		var data = new Array();
		var dvm = new DestinationViewModel(data);
		dvm.name("My Location");
		dvm.DisplayName("My Location");
		dvm.QuickLink(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
		dvm.isGoogle = true;
		self.start_location(dvm);
		self.searchStart_visible(false);
		mainVM.fromVM.campus_visible(false);
		mainVM.storageObject['StartDestinationName'] =  self.start_location().name();
		PushNewState('address='+"My Location");
		self.isTracking = false;
	}
	self.displayError = function(positionError) {
		alert("Could not get your location: error " + positionError.code);
		self.isTracking = false;
	}
	
  self.GetLocationViaUrl = function(url){
    var deferred = $.Deferred();

    var address = getParameterByName(url, 'address');
    if(address && (self.lastAddress.toLowerCase() != address.toLowerCase() || !self.start_location())){
      if(address.toLowerCase() == 'my location'){
        try {
          if (typeof navigator.geolocation === 'undefined'){
            gl = google.gears.factory.create('beta.geolocation');
          } else {
            gl = navigator.geolocation;
          }
        } catch(e) {}

        if (gl) {
			if(!self.isTracking && (!self.start_location() || !self.start_location().timestamp || (new Date() - self.start_location().timestamp > 100000))){
				self.isTracking = true;
			  gl.getCurrentPosition(function(position){
				self.displayPosition(position);
				self.lastAddress = address;
				if(!mainVM.storageObject['fromSearchType']) mainVM.storageObject['fromSearchType']
				deferred.resolve();
			  }, function(position){
				self.displayError(position);
				deferred.reject();
			  },{timeout:50000});
		  }
        } else {
          alert("Geolocation services are not supported by your web browser.");
        }
      } else {

        geocoder = new google.maps.Geocoder();
        if(geocoder)
          {
            geocoder.geocode({ 'address': address}, function(results){
              var data = new Array();
              $("#searchFieldGoogle").val(results[0].formatted_address);
				self.lastAddress = address;
              var dvm = new DestinationViewModel(data);
			  dvm.name(results[0].formatted_address);
			  dvm.DisplayName(results[0].formatted_address);
              dvm.QuickLink(results[0].geometry.location);
			  dvm.isGoogle = true;
              self.start_location(dvm);
			  mainVM.fromVM.campus_visible(false);
              self.searchStart_visible(false);
              mainVM.fromVM.onoff('off');
			  if(!mainVM.storageObject['fromSearchType']) mainVM.storageObject['fromSearchType'] = 'prepop';
			  mainVM.storageObject['StartDestinationName'] =  self.start_location().name();
              deferred.resolve();
            }, function(position){
				alert("error");
				deferred.reject();
			  });
          }
      }
    }else if(!address && !getParameterByName(url, 'from')){
		mainVM.fromVM.campus_visible(true);
		self.searchStart_visible(true);
		mainVM.fromVM.searchVM.saved_name('');
		$("#searchFieldGoogle").val('');
		mainVM.fromVM.onoff('');
		mainVM.storageObject['StartDestinationName'] = '';
		//self.start_location(new DestinationViewModel([]));
		deferred.resolve();
	} else if(self.start_location()){
		self.searchStart_visible(false);
		mainVM.storageObject['StartDestinationName'] =  (typeof(self.start_location().name) == "function" ? self.start_location().name() : self.start_location().name);
		deferred.resolve();
	} else {
      deferred.resolve();
    }
    return deferred.promise();
  }
}

function initializeGoogle() {

  var input = document.getElementById('searchFieldGoogle');
  var options = {
    componentRestrictions: {country: 'us'}
  }

  var autocomplete = new google.maps.places.Autocomplete(input, options);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    //input.className = '';
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // Inform the user that the place was not found and return.
      input.className += ' notfound';
      // make sure notfound is removed before the next search
      return;
    }
    // set starting location
	var data = new Array();
	data['1'] = $("#searchFieldGoogle").val();
	var dvm = new DestinationViewModel(data);
    dvm.isGoogle = true;
    dvm.name(data['1']);
    dvm.DisplayName(data['1']);
	dvm.QuickLink(place.geometry.location);
	mainVM.fromVM.googleVM.start_location(dvm);
    mainVM.fromVM.googleVM.searchStart_visible(false);
	mainVM.fromVM.campus_visible(false);
	mainVM.storageObject['fromSearchType'] = 'google';
	mainVM.storageObject['StartDestinationName'] =  mainVM.start_location().name();
	PushNewState('address='+encodeURIComponent($("#searchFieldGoogle").val().replace('#','%23')));
  });
}
