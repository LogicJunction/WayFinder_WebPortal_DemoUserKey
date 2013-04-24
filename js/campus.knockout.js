function LocationViewModel(location){
	var self = this;
	//self.GetParkingUrl = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetParkingTypes";
	self.GetParkingUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetParkingTypes";
	//self.GetParkingUrl = "http://localhost:60001/MobileService.svc/GetParkingTypes";
	self.lookupReference = location;
	self.onoff = ko.observable('').syncWith('onoff');
	self.parkingTypes = ko.observableArray([]).extend({pauseable: true});
	self.selectedParking = null;
	self.lastQL = '';
	self.selectedParkingID = ko.observable().extend({pauseable: true});
	//self.selectedParkingID2 = ko.observable().extend({pauseable: true});
  self.campus_visible = ko.observable(true).syncWith('campusVisible');
	self.onCampusVisible = ko.computed(function(){
		return self.onoff() == 'on' || self.onoff() == '';
	});
	self.offCampusVisible = ko.computed(function(){
		return self.onoff() == 'off';
	});
	self.isSearchDisabled = ko.computed(function(){
		return self.onoff() == '';
	});

	self.lookUpVisible = ko.computed(function() {
		return self.onCampusVisible();
	}, this);
	 
	self.searchVM = new autoCompleteViewModel(location);
	self.googleVM = new GoogleMapsViewModel();
	/*self.selectedParkingID2.subscribe(function(newValue){
		if(newValue != 0 && (!self.selectedParkingID() || self.selectedParkingID()!=newValue)){
			self.selectedParkingID(newValue);
		}
	});*/
	self.selectedParkingID.subscribe(function(newValue){
		if(!self.selectedParking || self.selectedParking.ID!=newValue){
			for(i=0;i<self.parkingTypes().length;i++){
				if(newValue == self.parkingTypes()[i].ID){
					self.selectedParking = self.parkingTypes()[i];
					PushNewState('parking='+encodeURIComponent(newValue).replace('#','%23'));
					break;
				}
			}
		}
		if(newValue > 0 && $("#continueBtn").hasClass('ui-disabled')) $("#continueBtn").removeClass('ui-disabled');
		else if(newValue <= 0 && !$("#continueBtn").hasClass('ui-disabled')) $("#continueBtn").addClass('ui-disabled');
	});
	
	self.GetSelectedParking = function(clientID, parkingID, Destination){
		var dfd = new $.Deferred();
		if(self.parkingTypes().length>0){
			for(var i=0;i<self.parkingTypes().length;i++){
				if(self.parkingTypes()[i].ID == parkingID){
					self.selectedParking = self.parkingTypes()[i];
					break;
				}
			}
			dfd.resolve();
		} else {
			$.when(self.PopulateParking(clientID, Destination.QuickLink())).then(function(){
				self.selectedParkingID(parkingID);
				dfd.resolve();
			}).fail(function(){
				dfd.reject();
			});
		}
		return dfd.promise();
	}
	self.redraw = function(event, item){
		$('#'+item.ID.toString()+'radio').checkboxradio();
		$('#'+item.ID.toString()+'radio').checkboxradio('refresh');
	}
	self.PopulateParking = function(ClientID, QL){
		if(QL != self.lastQL){
			var deferred = $.Deferred();
			$.when( $.getJSON(self.GetParkingUrl+'?ClientID='+ClientID+'&QuickLink='+QL)).then(function(parkingData){
				//self.selectedParkingID2.pause();
				self.selectedParkingID.pause();
				self.parkingTypes.pause();
				var store = self.selectedParkingID() ? self.selectedParkingID() : 0;
				//self.parkingTypes.removeAll();
				var escapedJSON = escapeJSON(parkingData);
				var jsonObject = JSON.parse(escapedJSON);
				if(Array.isArray(jsonObject)){
					for(var i=0;i<jsonObject.length;i++){
						var found = false;
						for(var j=0;j<self.parkingTypes().length;j++){
							if(jsonObject[i].ID == self.parkingTypes()[j].ID){
								found = true;
								self.parkingTypes()[j].Latitude = jsonObject[i].Latitude;
								self.parkingTypes()[j].Longitude = jsonObject[i].Longitude;
								self.parkingTypes()[j].LotName = jsonObject[i].LotName;
								self.parkingTypes()[j].ParkingType = jsonObject[i].ParkingType;
							}
						}
						if(!found){
							self.parkingTypes.push(jsonObject[i]);
						}
					}
					for(var j=self.parkingTypes().length-1;j>=0;j--){
						var found = false;
						var id = self.parkingTypes()[j].ID;
						for(var i=0;i<jsonObject.length;i++){
							if(jsonObject[i].ID == id){
								found = true;
							}
						}
						if(!found){
							self.parkingTypes.splice(j,1);
						}
					}
				}
				self.parkingTypes.sort(function(left, right){
					return left.ID == right.ID ? 0 : (left.ID < right.ID ? -1 : 1)
				});
				//self.selectedParkingID2(store);
				self.selectedParkingID(store);
				//self.selectedParkingID2.resume();
				self.selectedParkingID.resume();
				self.parkingTypes.resume();
				//if(self.parkingTypes().length>0 && !self.selectedParking()) self.selectedParking(self.parkingTypes()[0]);
				self.lastQL = QL;
				deferred.resolve();	
			}).fail(function(){
				self.parkingTypes.removeAll();
				deferred.reject();	
			});
			return deferred.promise();
		}
	};
	self.onoff.subscribe(function(newValue){
		if(newValue) self.campus_visible(false);
	});
	
	self.lookupClick = function(){
		ResetLookup(self.lookupReference);
		ChangePage('#lookup');
	};
	
	self.setParkingViaURL = function(url){
		var deferred = $.Deferred();

		var parkingID = getParameterByName(url, 'parking');
		if(parkingID){
			self.selectedParkingID(parkingID);
			deferred.resolve();		
		}else{
			deferred.resolve();
		}
		return deferred.promise();
	};
}
