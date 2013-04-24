function CategoryViewModel(name){
	var self = this;
	self.categoryName = ko.observable(name);
	self.results = ko.observableArray();
}

function autoCompleteViewModel(location){
  var self = this;
  //self.GetTop10Url = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetTopDestinations";
  self.GetTop10Url = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetTopDestinations";
  //self.GetTop10Url = "http://localhost:60001/MobileService.svc/GetTopDestinations";
  //self.GetSearchUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetSearchDestinations";
  self.GetSearchUrl = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetSearchDestinations";
  //self.GetSearchUrl = "http://localhost:60001/MobileService.svc/GetSearchDestinations";
  self.lookupReference = location;
  self.clientID = ko.observable().syncWith('ClientID');
  self.search_visible = ko.observable(true).syncWith('searchVisible'+self.lookupReference);
  self.results_visible = ko.observable(false);
  self.saved_name = ko.observable('');
  self.saved_value = ko.observable().syncWith('newLocation'+self.lookupReference);
  self.categoryVMs = ko.observableArray();
  self.searchType = 'top10'
  self.categories = [];
  self.topCategoryVMs = [];
  self.searchCategoryVMs = [];
  self.PopulateTop10Results = function(){
	if(self.topCategoryVMs.length==0){
		$.mobile.loading( 'show' );
		$.when( $.getJSON(self.GetTop10Url + '?ClientID='+self.clientID()+'&DCount=10')).then(function(destData){

		var escapedJSON = escapeJSON(destData);
		if(escapedJSON !=''){
			var jsonObject = JSON.parse(escapedJSON);
			var topDestinations = (self.lookupReference == 'to' ? jsonObject.TopDestinations.EndDestinations : jsonObject.TopDestinations.StartDestinations);
			self.categoryVMs.push(new CategoryViewModel((self.lookupReference == 'to' ? 'Top Destinations' : 'Top Starting Locations')));
			self.topCategoryVMs.push(self.categoryVMs()[0]);
			for(var i=0; i<topDestinations.length; i++) {
				var dvm = new DestinationViewModel([]);
				dvm.QuickLink(topDestinations[i].QuickLink);
				dvm.name(topDestinations[i].DestinationName);
				dvm.DisplayName(topDestinations[i].DestinationText);
				self.categoryVMs()[0].results.push(dvm);
			}
		}
		$.mobile.loading( 'hide' );

		});
	} else {
		for(var i=0; i<self.topCategoryVMs.length; i++) {
			self.categoryVMs.push(self.topCategoryVMs[i]);
		}
	}
  }
  self.PopulateSearchResults = function(searchString){
	if(self.searchCategoryVMs[searchString.substring(0,3)]==null){
		self.searchCategoryVMs[searchString.substring(0,3)] = new Array();
		$.mobile.loading( 'show' );
		$.when( $.getJSON(self.GetSearchUrl + '?ClientID='+self.clientID()+'&SearchString='+searchString.substring(0,3))).then(function(destData){

		var escapedJSON = escapeJSON(destData);
		if(escapedJSON !=''){
			var jsonObject = JSON.parse(escapedJSON);
			if(Array.isArray(jsonObject)){
				for(var i=0;i<jsonObject.length;i++){
					if(jQuery.inArray(jsonObject[i].DestinationTypeLabel, self.categories)<0){
						self.categories.push(jsonObject[i].DestinationTypeLabel);
						self.searchCategoryVMs[searchString.substring(0,3)].push(new CategoryViewModel(jsonObject[i].DestinationTypeLabel));
					}
					for(var j=0; j<self.searchCategoryVMs[searchString.substring(0,3)].length;j++){
						if(self.searchCategoryVMs[searchString.substring(0,3)][j].categoryName()==jsonObject[i].DestinationTypeLabel){
							var dvm = new DestinationViewModel([]);
							dvm.name(jsonObject[i].DestinationText);
							dvm.DisplayName(jsonObject[i].DestinationText);
							dvm.QuickLink(jsonObject[i].QuickLink);
							self.searchCategoryVMs[searchString.substring(0,3)][j].results.push(dvm);
						}
					}
				}
			}		
			self.RepopulateSearchArray(searchString);
		}
		$.mobile.loading( 'hide' );

		});
	} else {
		self.RepopulateSearchArray(searchString);
	}
		
  }
  
  self.RepopulateSearchArray = function(searchString){
	for(var i=0;i<self.searchCategoryVMs[searchString.substring(0,3)].length;i++){
		var visible = false;
		for(var j=0;j<self.searchCategoryVMs[searchString.substring(0,3)][i].results().length;j++){
			if(self.searchCategoryVMs[searchString.substring(0,3)][i].results()[j].name().toLowerCase().indexOf(searchString.toLowerCase())!==-1){
				self.searchCategoryVMs[searchString.substring(0,3)][i].results()[j].itemVisible(true);
				visible = true;
			} else {
				self.searchCategoryVMs[searchString.substring(0,3)][i].results()[j].itemVisible(false);
			}
		}
		//self.searchCategoryVMs[i].hasVisibleItems(visible);
		if(visible) self.categoryVMs.push(self.searchCategoryVMs[searchString.substring(0,3)][i]);
	}
  }
  self.PopulateSuggestions = function(text){
	self.categoryVMs.removeAll();
	self.categories = [];
	if(text.length == 0) {
		self.searchType = 'top10'
		self.PopulateTop10Results();
	} else if(text.length >= 3) {
		self.searchType = 'search'
		self.PopulateSearchResults(text);
	}
  }
  self.changeSavedValue = function(suggestion){
	if(suggestion.QuickLink() == ""){
		alert('Cannot get directions to this location, please try another.');
	} else {
		self.saved_value(suggestion);
		//self.saved_name(suggestion.name()); 
		self.search_visible(false);
		PushNewState(self.lookupReference+'='+encodeURIComponent(suggestion.name().replace('#','%23')))
		mainVM.storageObject[self.lookupReference + 'SearchType'] =  self.searchType;
	}
	//self.results_visible(false);
  }
  self.saved_name.subscribe(function(newValue){
	var text = newValue;
	self.PopulateSuggestions(text);
  });
};
