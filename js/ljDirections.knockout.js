function LJDirectionsViewModel(){
	var self = this;
	self.SVGLinkBase = "https://svgmaps.blob.core.windows.net/";
	//self.ShortestPathURLBase = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetShortestPathWithDropOffPathPointsOnly";
	self.ShortestPathURLBase = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetShortestPathWithDropOffPathPointsOnly";
	//self.ShortestPathURLBase = "http://localhost:60001/MobileService.svc/GetShortestPathWithDropOffPathPointsOnly";
	//self.WalkingDirectionsUrl = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetWalkingDirectionsWithDropOffPathPointsOnly";
	self.WalkingDirectionsUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetWalkingDirectionsWithDropOffPathPointsOnly";
	//self.WalkingDirectionsUrl = "http://localhost:60001/MobileService.svc/GetWalkingDirectionsWithDropOffPathPointsOnly";
	self.filesObject = null;
	self.svg = null;
	//self.svghtml = ko.observable('');
	self.directionsHTML = ko.observable('');
	self.estimatedWalkingTime = ko.observable('');
	self.directionsParams = '';
	self.mapParams = '';
	self.currentStepNumber = 0;
	self.currentStepName = ko.observable('First Floor');
	self.currentStepText = ko.observable('Step 0 of 0');
	self.currentFileObject = null;
	self.updateSVGSize = function(){
		self.UpdateStepInfo(self.currentStepNumber);
	}
	self.UpdateStepInfo = function(stepNumber){
		var count = 0;
		for (k in self.filesObject) if (self.filesObject.hasOwnProperty(k)) count++;
		var propName = 'f' + stepNumber.toString()
		if(self.filesObject && self.filesObject.hasOwnProperty(propName)){
			self.currentStepNumber = stepNumber;
			self.currentStepText('Step ' + self.currentStepNumber.toString() + ' of ' + count.toString());
			self.currentStepName(self.filesObject[propName].title);
			var funcwithdelay = $.debounce(function(event){
				self.RedrawSVG(self.filesObject[propName]);
				//if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
			}, 300);
			funcwithdelay();
		}
		if($("#previousButton").hasClass('ui-disabled')) $("#previousButton").removeClass('ui-disabled');
		if($("#nextButton").hasClass('ui-disabled')) $("#nextButton").removeClass('ui-disabled');
		if(self.currentStepNumber - 1 <= 0){
			//disable previous
			if(!$("#previousButton").hasClass('ui-disabled')) $("#previousButton").addClass('ui-disabled');
		}
		if(self.filesObject && !self.filesObject.hasOwnProperty('f'+(self.currentStepNumber + 1).toString())){
			//disableN next
			if(!$("#nextButton").hasClass('ui-disabled')) $("#nextButton").addClass('ui-disabled');
		}
	}
	self.goNext = function(){
		self.UpdateStepInfo(self.currentStepNumber + 1);
	}
	self.goPrevious = function(){
		self.UpdateStepInfo(self.currentStepNumber - 1);
	}
	self.resetPage = function(){
		$("#SVGBox").empty();
		self.currentStepName('First Floor');
		self.currentStepText('Step 0 of 0');
		self.currentStepNumber = 0;
		self.filesObject = null;
		self.svg = null;
	}
	self.RedrawSVG = function(currentFileObject){
		$("#SVGBox").empty();
		self.currentFileObject = currentFileObject;
		var BBox = getBoundingBox(currentFileObject.pathpoints); 	
		CURRENT_ZOOM = BBox[6];
		var array = currentFileObject.pathpoints.split(' ');
		var xypoints1 = array[0].split(',');
		var xypoints2 = array[array.length-1].split(',');
		
		//Check if 

		var points = currentFileObject.pathpoints.split(/\s+|,/);
		var x0=points.shift(), y0=points.shift();
		var pathpoints_p = 'M'+x0+','+y0+'L'+points.join(' ');
		//var svg = d3.select("body").append("svg") //if we need to add directly to body
		self.svg = d3.select("#SVGBox").append("svg")
			.attr("width", "100%")
			.attr("height", "100%")	 
			//.append("g").attr("transform", "scale("+ ZOOM_SCALE +")")
			.call(zm)
			.append("g");
		  //Add the svg file here
		d3.xml(mainVM.WalkingMapsUrl + "?FileName=" + currentFileObject.url, "image/svg+xml", function(error, xml) {
            if (error) return console.warn(error);
			var importedNode = document.importNode(xml.documentElement, true);
			self.svg.node().appendChild(importedNode);
			//Add Rectangle to trace
			//self.svg.append("rect").attr("x", BBox[2]).attr("y", BBox[3])
            //               .attr("width", BBox[4])
            //               .attr("height", BBox[5]).attr("stroke-width", "2").attr("stroke", "#ff0000").attr("fill", "none");
			//Add Path
			self.svg.append('svg:path').attr("d",pathpoints_p).attr("fill", "none").attr("stroke-width", "3").attr("stroke", "#009eff");
			//Add Node A
			self.svg.append('svg:circle').attr("r","10").attr("cx",xypoints1[0]).attr("cy",xypoints1[1]).attr("fill","#2A9FDA").attr("stroke","#e9e9e9").attr("stroke-width",".5");	
			self.svg.append('svg:circle').attr("r","9").attr("cx",xypoints1[0]).attr("cy",xypoints1[1]).attr("fill","#2A9FDA").attr("stroke","#white").attr("stroke-width","1");
			self.svg.append('text').attr("x",((xypoints1[0]) - 4)).attr("y",(parseFloat(xypoints1[1]) + 3))
				.attr("font-family",'verdana').attr("font-size","10").text("A").attr("fill","white");
			//Add Node B		
			self.svg.append('svg:circle').attr("r","10").attr("cx",xypoints2[0]).attr("cy",xypoints2[1]).attr("fill","#2A9FDA").attr("stroke","#e9e9e9").attr("stroke-width",".5");	
			self.svg.append('svg:circle').attr("r","9").attr("cx",xypoints2[0]).attr("cy",xypoints2[1]).attr("fill","#2A9FDA").attr("stroke","#white").attr("stroke-width","1");
			self.svg.append('text').attr("x",((xypoints2[0]) - 4)).attr("y",(parseFloat(xypoints2[1]) + 3))
				.attr("font-family",'verdana').attr("font-size","10").text("B").attr("fill","white");	
			
				 }); 
		
		self.svg.attr("transform", "translate( -" + (  BBox[0]) + ",-" + (BBox[1])  + ")scale(" + CURRENT_ZOOM + ")")		
		RESET=[-(BBox[0]),-(BBox[1])];
		RESET_SCALE=CURRENT_ZOOM;
		zm.translate([-(BBox[0]),-(BBox[1])]).scale(CURRENT_ZOOM);
		DrawControls();
		 };
	self.updateLink = function(clientID, startPoint, endPoint, parkingType){
		if(self.mapParams.indexOf("ClientID="+clientID)<0 || 
			self.mapParams.indexOf("StartPoint="+startPoint)<0 || 
			self.mapParams.indexOf("EndPoint="+endPoint)<0 || 
			self.mapParams.indexOf("ParkingType="+parkingType)<0)
			//self.svghtml('<embed src="'+ self.SVGLinkBase + "?ClientID=" + clientID + "&StartPoint="+ startPoint + "&EndPoint="+ endPoint+"&ParkingType="+parkingType +'" id="svgMap"></embed>');
			$.when($.getJSON(self.ShortestPathURLBase + "?ClientID=" + clientID + "&StartPoint="+ startPoint + "&EndPoint="+ endPoint+"&ParkingType="+parkingType)).then(function(data){
			  self.mapParams = 'StartPoint=' + startPoint + '&EndPoint=' + endPoint + '&ClientID=' + clientID+"&ParkingType="+parkingType;
			  var escapedJSON = escapeJSON(data);
			  self.filesObject = jQuery.parseJSON(escapedJSON);
				var count = 0;
				for (k in self.filesObject) if (self.filesObject.hasOwnProperty(k)) count++;
				mainVM.printableVM.svgDivs.removeAll();
				var stepNumber = 1;
			  for(var i=1;i<=count;i++){
				var propName = 'f' + stepNumber.toString()
				if(self.filesObject && self.filesObject.hasOwnProperty(propName)){
					stepNumber += 1;
					currentFileObject = self.filesObject[propName];
					var array = currentFileObject.pathpoints.split(' ');
					var xypoints1 = array[0].split(',');
					var xypoints2 = array[array.length-1].split(',');

					var points = currentFileObject.pathpoints.split(/\s+|,/);
					var x0=points.shift(), y0=points.shift();
					var pathpoints_p = 'M'+x0+','+y0+'L'+points.join(' ');
					var mapHTML = '<br/><br/><br/><br/>Downloading map...';
					var BBox = getBoundingBox(currentFileObject.pathpoints, 320, 320);
				  //var mapHTML = '<svg width="320" height="320" style="margin-top:25px; margin-left:5px; margin-right: 10px;"><g transform="translate( -1845.905874786382,-2048.6671312439016)scale(0.989375)"><image width="4035" type="image/svg+xml" height="4100" xlink:href="' + self.WalkingMapsUrl + "?FileName=" + currentFileObject.url + '" /></g></svg>';
					var pathText = "";
					pathText += '<path d="'+pathpoints_p + '" fill="none" stroke-width="3" stroke="#009eff"/>';
					//Add Node A
					pathText += '<circle r="10" cx="' + xypoints1[0].toString() + '" cy="' + xypoints1[1].toString() + '" fill="#2A9FDA" stroke="#e9e9e9" stroke-width=".5"/>';
					pathText += '<circle r="9" cx="' + xypoints1[0].toString() + '" cy="' + xypoints1[1].toString() + '" fill="#2A9FDA" stroke="#white" stroke-width="1"/>';
					pathText += '<text x="' + (xypoints1[0] - 4).toString() + '" y="' + (parseFloat(xypoints1[1]) + 3) + '" font-family="verdana" font-size="10" fill="white">A</text>';
					//Add Node B		
					pathText += '<circle r="10" cx="' + xypoints2[0].toString() + '" cy="' + xypoints2[1].toString() + '" fill="#2A9FDA" stroke="#e9e9e9" stroke-width=".5"/>';
					pathText += '<circle r="9" cx="' + xypoints2[0].toString() + '" cy="' + xypoints2[1].toString() + '" fill="#2A9FDA" stroke="#white" stroke-width="1"/>';
					pathText += '<text x="' + (xypoints2[0] - 4).toString() + '" y="' + (parseFloat(xypoints2[1]) + 3) + '" font-family="verdana" font-size="10" fill="white">B</text>';
				  mainVM.printableVM.svgDivs.push({divHTML: ko.observable(mapHTML), mapFileName: currentFileObject.url, divVisible: true, isMap: true, divClear: 'none', xLeft: -(BBox[0]), yTop: -(BBox[1]), zoom: BBox[6], path: pathText});
				}
			  }
			  self.UpdateStepInfo(1);
		    });
	};
	self.updateWalkingDirections = function(ClientID, Begin, End, parkingType){
		if(self.directionsParams.indexOf("ClientID="+ClientID)<0 || 
			self.directionsParams.indexOf("StartPoint="+Begin)<0 || 
			self.directionsParams.indexOf("EndPoint="+ End)<0 || 
			self.directionsParams.indexOf("ParkingType="+parkingType)<0){
				$.when($.getJSON(self.WalkingDirectionsUrl+'?StartPoint=' + Begin + '&EndPoint=' + End + '&ClientID=' + ClientID+"&ParkingType="+parkingType+"&SessionData="+(mainVM.storageObject.isRefresh ? null : JSON.stringify(mainVM.storageObject))))
				  .then(function(directionsData){
					self.directionsParams = 'StartPoint=' + Begin + '&EndPoint=' + End + '&ClientID=' + ClientID+"&ParkingType="+parkingType;
					self.RenderDirections(directionsData);
				});
		}
	};

	self.RenderDirectionSteps = function(directions){
	  if(typeof directions == 'object' && directions.length > 0){
		var i = 0;
		var directionsList = "<ol class='directions'>";

		for(i = 0; i < directions.length; i++){
		  var direction = directions[i];
		  var liclass = self.GetDirectionClass(direction.Direction);

		  if(direction.Distance == 0 && direction.Direction === ""){
			liclass = self.GetDirectionClass("START");
			directionsList += self.ListItem(liclass, direction.Description);
			continue;
		  }
		  directionsList += self.ListItem(liclass, direction.Description);
		}

		directionsList += "</ol>";

		return directionsList;
	  }else{
		return false;
	  }
	}

	self.RenderPrintableDirectionSteps = function(directions){
	  if(typeof directions == 'object' && directions.length > 0){
		var i = 0;
		var directionsList = "<ol>";

		for(i = 0; i < directions.length; i++){
		  var direction = directions[i];
		  directionsList += self.ListItem("", direction.Description);
		  directionsList += "<hr/>";
		}

		directionsList += "</ol>";

		return directionsList;
	  }else{
		return false;
	  }
	}

	self.RenderDirections = function(data){
	  var escapedJSON = escapeJSON(data);
	  var jsonObject = jQuery.parseJSON(escapedJSON);
	  var dHtml = "";
		mainVM.printableVM.walkingDivs.removeAll();

	  //$("#directions div[data-role='header'] h1").html("Directions to: " + DestinationName);
	  //$(contentContainerElement).closest("div[data-role='page']").find("a.back").attr("href", "#" + DestinationTypeID);

	  for (var key in jsonObject){
		if(key === "Note:"){
      self.estimatedWalkingTime(jsonObject[key]);
		} else if(key == "SessionID"){
			mainVM.storageObject[key] = jsonObject[key];
		}else if(key.indexOf("Step") === 0){
		  dHtml += "<h3>" + key + "</h3>";
		  dHtml += self.RenderDirectionSteps(jsonObject[key]);
		  var printHTML = "<h4>" + key + "</h4>";
		  printHTML += self.RenderPrintableDirectionSteps(jsonObject[key], true);
		  mainVM.printableVM.walkingDivs.push({divHTML: printHTML, divVisible: true, isMap: false, divClear: 'none'});
		}
	  }
	  self.directionsHTML(dHtml);
	}

	self.GetDirectionClass = function(direction){
    if(typeof(direction) == "undefined" || direction === null || direction === ""){ 
      return "";
    }

	  switch(direction){
		case "RIGHT":
		case "IMMEDIATE RIGHT":
		case "SLIGHT RIGHT":
		  return "right";
		  break;
		case "SLIGHT LEFT":
		case "LEFT":
		case "IMMEDIATE LEFT":
		  return "left";
		  break;
		case "PARKING":
		  return "parking";
		  break;
		case "GO STRAIGHT":
		case "STRAIGHT":
		case "CONTINUE":
		  return "straight";
		  break;
		case "FLOOR-FLOOR":
		  return "elevator";
		  break;
		case "START":
		  return "start";
		  break;
		case "END":
		case "Arrive at Destination":
		  return "end";
		  break;
		case "BACK":
		  return "back";
		  break;
	  }
	}

	self.ListItem = function(liClass, liHtml){
	  var classString = "";
	  if(liClass !== ""){
		classString = "class ='" + liClass + "'";
	  }
	  return "<li " +  classString + ">" + liHtml + "</li>";
	}
	
	self.resizeSVG = function(){
		var BBox = getBoundingBox(self.currentFileObject.pathpoints);
		CURRENT_ZOOM = BBox[6];
		self.svg.attr("transform", "translate( -" + (  BBox[0]) + ",-" + (BBox[1])  + ")scale(" + CURRENT_ZOOM + ")");
	};
}
