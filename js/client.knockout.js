function ClientViewModel(){
	var self = this;
	self.clientID = ko.observable().syncWith('ClientID');
	self.imagePath = ko.observable('');	
	self.cssPath = ko.observable("css/themes/logicjunction.min.css");
	self.locationName = ko.observable('Wilmington VA Medical Center');
	self.CompanyName = ko.observable('LogicJunction, Inc.');
	self.address = ko.observable('23950 Commerce Park Rd.\nBeachwood, Ohio');
	self.phone = ko.observable('(877) 286-2631');
	self.fax = ko.observable('(216) 292-6661');
	self.webtext = ko.observable('www.logicjunction.com');
	self.weblink = ko.observable('http://www.logicjunction.com');
	self.apptLink = ko.observable('#');
	self.apptText = ko.observable('Make an appointment online today!');
	self.mainLatLng = new google.maps.LatLng(39.740619,-75.606773);
	self.legendArray = ko.observableArray([{source:"images/parking.png", text: 'Parking'}, 
											{source:"images/busstop.png", text: 'Bus Stop'}, 
											{source:"images/restroom.png", text: 'Restrooms'},
											{source:"images/elevators.png", text: 'Elevator'},
											{source:"images/atm.png", text: 'ATM'},
											{source:"images/vending.png", text: 'Vending'}]);
  self.setLogoImage = function(){
    var logoNormal = "images/LJlogo.png";
    var logoSmall = "images/LJlogo-small.png";
    if($(window).width() < 768){
      self.imagePath(logoSmall);
    }else{
      self.imagePath(logoNormal);
    }
  };
}
