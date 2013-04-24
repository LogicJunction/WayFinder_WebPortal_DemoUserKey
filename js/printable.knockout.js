function PrintableViewModel(){
	var self = this;
	self.staticUrl = ko.observable().syncWith('staticUrl');
	self.onoff = ko.observable().syncWith('onoff');
	self.walkingDivs = ko.observableArray();
	self.svgDivs = ko.observableArray();
	self.printableDivs = ko.observableArray();
	self.onCampusVisible = ko.computed(function(){
		return self.onoff() == 'on' || self.onoff() == '';
	});
	self.offCampusVisible = ko.computed(function(){
		return self.onoff() == 'off';
	});
	self.fromURL = false;
	self.start_location = ko.observable({name:''}).subscribeTo('newLocationfrom');
	self.end_location = ko.observable({name:''}).subscribeTo('newLocationto');
	self.drivingMapVisible = ko.observable(false);
	self.drivingDirectionsVisible = ko.observable(false);
	self.walkingMapVisible = ko.observable(false);
	self.walkingDirectionsVisible = ko.observable(false);
	self.numMapsShown = 0;
	self.resetLoading = function(){
		self.numMapsShown = 0;
		$.mobile.loading( 'show', {
			text: 'Loading maps, please wait...',
			textVisible: true,
			theme: 'b'
		});
	}
	self.getTrueSVG = function(array, item){
		//var mapHTML = '<svg width="320" height="320" style="margin-top:25px; margin-left:5px; margin-right: 10px;"><g transform="translate( -1845.905874786382,-2048.6671312439016)scale(0.989375)"><image width="4035" type="image/svg+xml" height="4100" xlink:href="' + self.WalkingMapsUrl + "?FileName=" + currentFileObject.url + '" /></g></svg>';
		if(item.isMap){
			$.when($.get(mainVM.WalkingMapsUrl + "?FileName=" + item.mapFileName)).then(function(data){
				item.divHTML('<svg width="320" height="320" style="margin-top:25px; margin-left:5px; margin-right: 10px;"><g transform="translate( ' + item.xLeft.toString() +', ' + item.yTop.toString() + ')scale(' + item.zoom.toString() + ')">' + 
					data + item.path
				+'</g></svg>');
				self.numMapsShown += 1;
				if(self.numMapsShown == self.svgDivs().length) $.mobile.loading( 'hide' );
			}).fail(function(error){
				alert(error);
				$.mobile.loading( 'hide' )
			});
		}
	};
	self.walkingDivs.subscribe(function(){
		self.updateWalkingDivs();
	});
	self.svgDivs.subscribe(function(){
		self.updateWalkingDivs();
	});
	self.updateWalkingDivs = function(){
		self.printableDivs.removeAll();
		if(self.svgDivs().length == self.walkingDivs().length){
			var count = 0;
			for(var i=0;i<self.walkingDivs().length;i++){
				if(self.svgDivs()[i] && self.walkingDivs()[i]){
					if(self.walkingMapVisible()){
						self.svgDivs()[i].divVisible = self.walkingMapVisible();
						self.svgDivs()[i].divClear = count % 2 ? 'none':'left';
						if(self.svgDivs()[i].divVisible) count+=1;
						self.printableDivs.push(self.svgDivs()[i]);
					}
					if(self.walkingDirectionsVisible()){
						self.walkingDivs()[i].divVisible = self.walkingDirectionsVisible();
						self.walkingDivs()[i].divClear = count % 2 ? 'none':'left';
						if(self.walkingDivs()[i].divVisible) count+=1;
						self.printableDivs.push(self.walkingDivs()[i]);
					}
				}
			}
		}
	}
	
	self.drivingMapVisible.subscribe(function(newValue){
		if(self.fromURL) return;
		var printing = parseInt(getParameterByName(window.location.href, 'printing'));
		if(printing) printing = newValue ? printing | 8 : printing & 7;
		else printing = newValue ? printing | 8 : printing & 7;
		PushNewState('printing='+printing);
	});
	
	self.drivingDirectionsVisible.subscribe(function(newValue){
		if(self.fromURL) return;
		var printing = parseInt(getParameterByName(window.location.href, 'printing'));
		if(printing) printing = newValue ? printing | 4 : printing & 11;
		else printing = newValue ? printing | 4 : printing & 11;
		PushNewState('printing='+printing);
	});
	
	self.walkingMapVisible.subscribe(function(newValue){
		if(self.fromURL) return;
		var printing = parseInt(getParameterByName(window.location.href, 'printing'));
		if(printing) printing = newValue ? printing | 2 : printing & 13;
		else printing = newValue ? printing | 2 : printing & 13;
		self.updateWalkingDivs();
		PushNewState('printing='+printing);
	});
	
	self.walkingDirectionsVisible.subscribe(function(newValue){
		if(self.fromURL) return;
		var printing = parseInt(getParameterByName(window.location.href, 'printing'));
		if(printing) printing = newValue ? printing | 1 : printing & 14;
		else printing = newValue ? printing | 1 : printing & 14;
		self.updateWalkingDivs();
		PushNewState('printing='+printing);
	});
	
	self.setPrinting = function(value){
		self.fromURL = true;
		self.drivingMapVisible(value & 8);
		self.drivingDirectionsVisible(value & 4);
		self.walkingMapVisible(value & 2);
		self.walkingDirectionsVisible(value & 1);
		self.fromURL = false;
	};
}