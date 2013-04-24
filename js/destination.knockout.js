function DestinationViewModel(data){
  var self = this;
  self.data = ko.observableArray(data);
  self.name = ko.observable();
  self.DisplayName = ko.observable();
  self.isGoogle = false;
  self.itemVisible = ko.observable(true);
  self.QuickLink = ko.observable();
}

function DestinationListViewModel(){
	var self = this;
	//self.GetDestinationDataUrl = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetDestinationDataNew";
	self.GetDestinationDataUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetDestinationDataNew";
	//self.GetDestinationDataUrl = "http://localhost:60001/MobileService.svc/GetDestinationDataNew";
	self.lookup_reference = 'from';
	self.clientID = ko.observable().syncWith('ClientID');
  self.headerText = ko.observable();
	self.data_array2 = ko.observableArray();
	self.data_columns_array = ko.observableArray();
	self.data_columns_value = function(columnId, rowId){
		return self.data_array2()[rowId].columnId;
	};
	
	self.data_storage = new Array();
	self.data_columns_storage = new Array();
	self.selectedFrom_destination = ko.observable().publishOn("newLocationfrom");
	self.selectedTo_destination = ko.observable().publishOn("newLocationto");
	self.searchFrom_visible = ko.observable(true).publishOn('searchVisiblefrom');
	self.searchTo_visible = ko.observable(true).publishOn('searchVisibleto');
	self.PopulateData = function(id){
		self.data_array2.removeAll();
		self.data_columns_array.removeAll();
		var columnIndices = [];

		if(self.data_storage[id] == null){

			self.data_storage[id] = [];
			self.data_columns_storage[id] = [];
			// ajax get destination data
			$.mobile.loading( 'show' );
			$.when( $.getJSON(self.GetDestinationDataUrl + '?DestinationID='+id+'&ClientID='+self.clientID())).then(function(destData){

				var escapedJSON = escapeJSON(destData);
				if(escapedJSON !=''){
					var jsonObject = JSON.parse(escapedJSON);
			
					if(jsonObject.hasOwnProperty("columns")){
						var columnList = jsonObject.columns;
						for(var prop in columnList){
						  if(!isNaN(prop)){
							// TODO: build a way to keep ordering of the columns as defined by the JSON property values
							var columnIndex = parseInt(prop);
							columnIndices[columnIndex] = columnList[prop];
							self.data_columns_array.push({index: columnIndex, name: columnList[prop]});
							self.data_columns_storage[id].push({index: columnIndex, name: columnList[prop]});
							
						  }
						}
					}

					// sort arrays
					self.data_columns_array.sort(function(left, right){
						return left.index == right.index ? 0 : (left.index < right.index ? -1 : 1)
					});

					if(jsonObject.hasOwnProperty("data")){
						if(typeof jsonObject.data !== "undefined" && jsonObject.data !== null){
						  for(var j = 0; j < jsonObject.data.length; j++){
							var tempDataArray = new Array();
							for(var k =0; k < self.data_columns_array().length; k++){
							  var col = self.data_columns_array()[k];
							  if(typeof col.index != 'undefined'){
								tempDataArray[col.index] = jsonObject.data[j][col.index];
							  }
							}
							var dvm2 = new DestinationViewModel(tempDataArray);
							dvm2.QuickLink(jsonObject.data[j].QL);
							dvm2.name(jsonObject.data[j].LinkText);
							dvm2.DisplayName(jsonObject.data[j].LinkText);
							self.data_array2.push(dvm2);
							self.data_storage[id].push(dvm2);
						  }
						}
					}
					//console.log(self.data_columns_array());
					//console.log(self.data_array2());
					self.data_array2.sort(self.sortFunction)
					self.data_storage[id].sort(self.sortFunction)
					$.mobile.loading( 'hide' );
				}
			});
		} else {
			for(var i=0;i<self.data_columns_storage[id].length;i++){
				self.data_columns_array.push(self.data_columns_storage[id][i]);
			}
			for(var i=0;i<self.data_storage[id].length;i++){
				self.data_array2.push(self.data_storage[id][i]);
			}
		}
	}
	self.sortFunction = function(left, right){
		return left.data()['1'] == right.data()['1'] ? 0 : (left.data()['1'] < right.data()['1'] ? -1 : 1) 
	};
	self.itemClicked = function(item){
		if(self.lookup_reference == 'to'){
			self.selectedTo_destination(item);
			self.searchTo_visible(false);
		}else{
			self.selectedFrom_destination(item);
			self.searchFrom_visible(false);
		}
		PushNewState(self.lookup_reference+'='+encodeURIComponent(item.name().replace('#','%23')));
		ChangePage('#home');
		self.data_array2.removeAll();
		self.data_columns_array.removeAll();
		mainVM.storageObject[self.lookup_reference + 'SearchType'] =  'lookup';
	}
	
	self.hasStorage = function(id){
		
	}
}
