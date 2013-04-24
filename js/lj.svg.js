var translate, scale,width, height, RESET, RESET_SCALE, ZOOM_SCALE, CURRENT_ZOOM, ZOOM_INCREMENT, BBOX_PADDING;
ZOOM_INCREMENT=1;
BBOX_PADDING = 20; //in percent
var zm = d3.behavior.zoom().scaleExtent([-18, 18]).on("zoom", zoom);
//Define scales
var margin = {top: 0, right: 0, bottom: 0, left: 0}; 
width = (GetWidth()) - margin.left - margin.right; 
height = (GetHeight()) - margin.top - margin.bottom; 

var AREA = height;

//var getBBox = getBoundingBox(files.f1.pathpoints);
//var BBoxArea = (getBBox[2] - getBBox[0]);
var ASPECT_RATIO = width/height; //Full size is one

//ZOOM_SCALE = 1.17;
//CURRENT_ZOOM =ZOOM_SCALE;
			
 //Calculate the viewbox area	
function zoom() {

if((!!zm.translate()) && (!!zm.scale()))
{
//calculate the centroid
var translate = zm.translate();
var scale = zm.scale();
CURRENT_ZOOM=scale;

 mainVM.ljdirectionsVM.svg.attr("transform", "translate(" + (translate[0]) +","+ (translate[1]) + ")scale(" + scale + ")")
}
else
{
   CURRENT_ZOOM = d3.event.scale;
   zm.translate([d3.event.translate[0], d3.event.translate[1]]);
   //zoom();
   svg.attr("transform", "translate(" + d3.event.translate[0] + "," +  d3.event.translate[1] + ")scale(" + d3.event.scale + ")")
}

}
  
function getBoundingBox(pathpoints, w, h)
  {
  var VBoxvalues = pathpoints.split(' ').join(' ').split(',').join(' ').split(' ');
		var Vvalues = pathpoints.split(' ');
		var Xvalues, zoomLevel;
		var Yvalues;
		for(i =0;i<Vvalues.length;i++)
		{
			var splitval = Vvalues[i].split(',')
			if(i==0){
				Xvalues = splitval[0];
				Yvalues = splitval[1];
			}
			else{
				Xvalues = Xvalues + " " + splitval[0];
				Yvalues = Yvalues + " " + splitval[1];
			 }
		}
		var XBoxvalues = Xvalues.split(' ');
		var YBoxvalues = Yvalues.split(' ');
		
		var Xmax = Math.max.apply(Math, XBoxvalues);	
		var Xmin = Math.min.apply(Math, XBoxvalues);
		var Ymax = Math.max.apply(Math, YBoxvalues);	
		var Ymin = Math.min.apply(Math, YBoxvalues);
			
		width = (w ? w : $("#SVGBox").width());
		height = (h ? h : $("#SVGBox").height());
		
		width = width * (100 - BBOX_PADDING)/100
		height = height * (100 - BBOX_PADDING)/100
		
		ASPECT_RATIO = width/height; //Aspect Ratio of the SVG BOX
		
		var xDist =(Xmax-Xmin);
		var yDist =(Ymax-Ymin);
		
		var SP_ASPECT_RATIO = xDist/yDist; //ASPECT RATIO of the Shortest Path Bounding Box
		
		if(SP_ASPECT_RATIO >=ASPECT_RATIO) //if the aspect ratio of the SP Bounding Box is greater than the SVG BOX aspect ratio we should consider width for the aspect ratio
		{
			ZOOM_SCALE = width / xDist;
			zoomLevel =ZOOM_SCALE;			
		}
		else //if the aspect ratio of the SP Bounding Box is less than the SVG BOX aspect ratio we should consider height for the aspect ratio
		{
			ZOOM_SCALE = height/ yDist;
			zoomLevel = ZOOM_SCALE;			
		}	
		
		var Xp = width * (BBOX_PADDING)/2/100 //+ BBOX_PADDING
		var Yp = height * (BBOX_PADDING)/2/100 //+ BBOX_PADDING
		
		var XScaled = Xp + (width / 2)
        var YScaled = Yp + (height / 2)

		var x3 = XScaled - ((xDist*zoomLevel)/ 2)
		var y3 = YScaled - ((yDist*zoomLevel)/ 2)
		

		var xLeft =  (Xmin*zoomLevel - x3)
		var yTop =  (Ymin*zoomLevel - y3)
		
		DrawControls();

		return [(xLeft),(yTop), Xmin, Ymin, xDist, yDist, zoomLevel];
  }
  
 
function GetWidth()
  {
          var x = 0;
          if($('#SVGBox').width()){
			x = $('#SVGBox').width();
		  }else if(self.innerHeight)
          {
                  x = self.innerWidth;
          }
          else if (document.documentElement && document.documentElement.clientHeight)
          {
                  x = document.documentElement.clientWidth;
          }
          else if (document.body)
          {
                  x = document.body.clientWidth;
          }
          return x;
  }

  function GetHeight()
  {
          var y = 0;
          if($('#SVGBox').height()){
			y = $('#SVGBox').height();
		  }else if (self.innerHeight)
          {
                  y = self.innerHeight;
          }
          else if (document.documentElement && document.documentElement.clientHeight)
          {
                  y = document.documentElement.clientHeight;
          }
          else if (document.body)
          {
                  y = document.body.clientHeight;
          }
          return y;
  }
  
  function DrawControls(){
				 
		 var GToolBar = d3.select("svg").append("g");
		  var defs =  GToolBar.append("svg:defs")
		var gradient = defs.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "0%")
			.attr("y2", "100%");
			//.attr("gradientUnits" , "userSpaceOnUse");

		gradient.append("svg:stop")
		  .attr("offset", "0%")
		  .attr("stop-color", "#4CC8ED")
		  .attr("stop-opacity", "1");
		  
			 
		gradient.append("svg:stop")
		  .attr("offset", "100%")
		  .attr("stop-color", "#0376B9")
		   .attr("stop-opacity", "1");
		  
		  
		  
		var bargradient = defs.append("svg:linearGradient")
			.attr("id", "bargradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "0%")
			.attr("y2", "100%")
			.attr("gradientUnits" , "objectBoundingBox");


		bargradient.append("svg:stop")
		  .attr("offset", 0)
		  .attr("stop-color", "#FFFFFF");
		  
			 
		bargradient.append("svg:stop")
		  .attr("offset", 1)
		  .attr("stop-color", "#DBDBDB");
		  
		  
		  
		var Compassgradient = defs.append("svg:linearGradient")
			.attr("id", "Compassgradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "0%")
			.attr("y2", "100%")
			.attr("gradientUnits" , "objectBoundingBox");


		Compassgradient.append("svg:stop")
		  .attr("offset", 0)
		  .attr("stop-color", "#4CC8ED");
		  
			 
		Compassgradient.append("svg:stop")
		  .attr("offset", 1)
		  .attr("stop-color", "#0376B9");
		  
		var g1 = d3.select("svg").append('g').attr("transform" ," translate(-20, 0)");
		var Zoomin= g1.append("g").attr("id" ,"ZoomIn"); 
		  
		Zoomin.append("svg:path")
					.attr("d","M49.408,15.021c-10.784,0-19.525,8.742-19.525,19.525c0,10.784,8.742,19.525,19.525,19.525c10.783,0,19.525-8.741,19.525-19.525C68.934,23.764,60.191,15.021,49.408,15.021z M49.408,52.221c-9.76,0-17.672-7.913-17.672-17.674c0-9.76,7.912-17.672,17.672-17.672s17.673,7.912,17.673,17.672C67.081,44.308,59.168,52.221,49.408,52.221z")
					.style("fill", "#ffffff");
		Zoomin.append("svg:path")
					.attr("d","M49.408,16.875c-9.76,0-17.672,7.912-17.672,17.672c0,9.761,7.912,17.674,17.672,17.674s17.673-7.913,17.673-17.674C67.081,24.787,59.168,16.875,49.408,16.875z M61.754,37H51.428v10.289H48V37H37.495v-3.428H48V23.029h3.428v10.543h10.326V37z")
					.attr("fill", "url(#gradient)");			
		Zoomin.append("svg:polygon")
					.attr("points","48,37 48,47.289 51.428,47.289 51.428,37 61.754,37 61.754,33.572 51.428,33.572 51.428,23.029 48,23.029 48,33.572 37.495,33.572 37.495,37")
					.attr("fill", "#ffffff");
		Zoomin.on('click', function() {
				//zm.scale(zm.scale() * ZOOM_SCALE);
				CURRENT_ZOOM=CURRENT_ZOOM + ((ZOOM_INCREMENT / 100) + .007) ;
				var CurrTranslate = zm.translate();
				zm.translate([(CurrTranslate[0] - (30)),(CurrTranslate[1] - (30))]);
				zm.scale(CURRENT_ZOOM);	
				zoom();
			});	
			
		var g2 = d3.select("svg").append('g').attr("transform" ," translate(-15, 45)");	
		 
		var Zoomout= g2.append("g").attr("id" ,"ZoomOut");  
		 Zoomout.append("svg:path")
					.attr("d","M44.408,11.881c-10.835,0-19.619,8.784-19.619,19.618c0,10.836,8.784,19.619,19.619,19.619c10.835,0,19.619-8.783,19.619-19.619C64.027,20.666,55.244,11.881,44.408,11.881z M44.409,49.172c-9.76,0-17.673-7.912-17.673-17.673c0-9.76,7.913-17.672,17.673-17.672c9.76,0,17.671,7.912,17.671,17.672C62.08,41.26,54.168,49.172,44.409,49.172z")
					.attr("fill", "#ffffff");
		  
		Zoomout.append("svg:path")
					.attr("d","M44.409,13.828c-9.76,0-17.673,7.912-17.673,17.672c0,9.761,7.913,17.673,17.673,17.673c9.76,0,17.671-7.912,17.671-17.673C62.08,21.74,54.168,13.828,44.409,13.828z M56.754,33.953H32.495v-3.428h24.259V33.953z")
					.attr("fill", "url(#gradient)");
					
		Zoomout.append('rect').attr({x: 32.495, y: 30.525, width: 24.259, height: 3.428})
					.attr("fill", "#ffffff");	
		Zoomout.on('click', function() {
				//zm.scale(zm.scale() / ZOOM_SCALE);
				CURRENT_ZOOM= CURRENT_ZOOM - ((ZOOM_INCREMENT / 100) + .007) ;
				var CurrTranslate = zm.translate();
				zm.translate([(CurrTranslate[0] + (30)),(CurrTranslate[1] + (30))]);
				zm.scale(CURRENT_ZOOM);
				zoom();
			});

		var g3 = d3.select("svg").append('g').attr("transform" ," translate(-19, 87)");	
		 
		var Reset= g3.append("g").attr("id" ,"Reset");  
		 Reset.append("svg:path")
					.attr("d","M47.679,11.881c-10.835,0-19.619,8.783-19.619,19.619c0,10.835,8.784,19.618,19.619,19.618c10.835,0,19.619-8.783,19.619-19.618C67.297,20.665,58.514,11.881,47.679,11.881z M47.679,49.172c-9.76,0-17.672-7.912-17.672-17.672c0-9.761,7.912-17.674,17.672-17.674S65.351,21.74,65.351,31.5C65.351,41.26,57.439,49.172,47.679,49.172z")
					.attr("fill", "#ffffff");
		  
		Reset.append("svg:path")
					.attr("d","M47.679,13.827c-9.76,0-17.672,7.913-17.672,17.674c0,9.76,7.912,17.672,17.672,17.672S65.351,41.26,65.351,31.5C65.351,21.74,57.439,13.827,47.679,13.827z M48.169,44.11c-2.938,0-5.637-1.025-7.761-2.734l2.132-1.258c1.54,1.072,3.41,1.703,5.429,1.703c5.254,0,9.615-3.839,9.971-9.082c0.457-6.729-5.007-11.113-10.261-11.113c-2.356,0-5.066,1.213-6.564,3.762l2.559,1.219l-6.839,3.554l-0.612-7.106l2.715,1.295c2.301-3.73,5.259-5.025,9.232-5.025c6.845,0,12.394,5.549,12.394,12.394S55.014,44.11,48.169,44.11z")
					.attr("fill", "url(#gradient)");
					
		Reset.append('svg:path').attr("d","M48.169,19.323c-3.974,0-6.932,1.295-9.232,5.025l-2.715-1.295l0.612,7.106l6.839-3.554l-2.559-1.219c1.498-2.549,4.208-3.762,6.564-3.762c5.254,0,10.718,4.385,10.261,11.113c-0.356,5.243-4.717,9.082-9.971,9.082c-2.019,0-3.889-0.631-5.429-1.703l-2.132,1.258c2.125,1.709,4.823,2.734,7.761,2.734c6.845,0,12.394-5.549,12.394-12.394S55.014,19.323,48.169,19.323z")
					.attr("fill", "#ffffff");
		Reset.on('click', function() {
				  //zm.translate([ 300, 0]).scale(0.27);
		zm.translate([RESET[0], RESET[1]]);
		zm.scale(RESET_SCALE);
		
		zoom();
			});	

		var g4 = d3.select("svg").append('g').attr("transform" ," translate(" + (GetWidth()-100) +", -10)");	
		var Compass= g4.append("g").attr("id" ,"Compass"); 
		 
		 Compass.append('circle').attr({r : "24.12891", cy:"67.08331", cx:"36.33328", fill:"white"})

		 Compass.append("svg:path")
					.attr("d","M61.694,66.223c-0.249-13.468-10.786-24.345-23.896-24.729l-0.838-4.047l-0.818,4.053c-13.163,0.507-23.684,11.595-23.684,25.209c0,0.083,0.005,0.164,0.006,0.247l-3.855,0.963l3.924,0.664c0.915,12.754,11.075,22.87,23.645,23.336l0.783,4.052l0.814-4.046c12.891-0.366,23.305-10.876,23.903-24.022l3.879-0.816L61.694,66.223z M59.298,65.688l-11.499-2.569l3.295-10.729l-10.184,4.126l-2.603-12.563C49.691,44.586,58.795,53.991,59.298,65.688z M47.545,63.061l-5.534-1.235l-1.038-5.009l9.745-3.956L47.545,63.061z M35.644,43.969l-2.5,12.386L23.069,52.39l3.917,10.937L14.85,66.358C15.025,54.428,24.144,44.722,35.644,43.969z M33.086,56.646l-1.096,5.429l-4.709,1.178L23.487,52.86L33.086,56.646z M14.952,68.991l11.718,1.981l-3.601,10.054l10.417-3.042l2.215,11.468C24.802,88.768,16.025,80.043,14.952,68.991z M26.997,71.027l5.32,0.9l1.123,5.816l-9.953,2.896L26.997,71.027z M38.269,89.467l2.366-11.753l10.459,3.313l-2.832-10.3l10.993-2.314C58.433,79.803,49.448,88.864,38.269,89.467z M40.691,77.439l1.076-5.346l6.252-1.316l2.801,9.968L40.691,77.439z M41.477,71.777L36.97,94.791l-4.375-23.105l-22.942-3.84l22.68-5.499l4.629-23.387l4.803,23.183l22.458,4.911L41.477,71.777z")
					.attr("fill", "#5A595E");
		Compass.append("svg:path")
					.attr("d","M51.095,52.39l-3.295,10.729l11.499,2.569c-0.503-11.696-9.607-21.102-20.99-21.735l2.603,12.563L51.095,52.39z")
					.attr("fill", "#5A595E");
					
		Compass.append("svg:path")
					.attr("d","M51.095,52.39l-3.295,10.729l11.499,2.569c-0.503-11.696-9.607-21.102-20.99-21.735l2.603,12.563L51.095,52.39z")
					.attr("fill", "url(#Compassgradient)");
		Compass.append("svg:path")
					.attr("d","M51.095,81.026l-10.459-3.313l-2.366,11.753c11.179-0.603,20.164-9.664,20.986-21.055l-10.993,2.314L51.095,81.026z")
					.attr("fill", "#5A595E");
		Compass.append("svg:path")
					.attr("d","M51.095,81.026l-10.459-3.313l-2.366,11.753c11.179-0.603,20.164-9.664,20.986-21.055l-10.993,2.314L51.095,81.026z")
					.attr("fill", "url(#Compassgradient)");	
		Compass.append("svg:path")
					.attr("d","M23.069,81.026l3.601-10.054l-11.718-1.981c1.073,11.052,9.85,19.776,20.749,20.461l-2.215-11.468L23.069,81.026z")
					.attr("fill", "#5A595E");
		Compass.append("svg:path")
					.attr("d","M23.069,81.026l3.601-10.054l-11.718-1.981c1.073,11.052,9.85,19.776,20.749,20.461l-2.215-11.468L23.069,81.026z")
					.attr("fill", "url(#Compassgradient)");	
		Compass.append("svg:path")
					.attr("d","M23.069,52.39l10.075,3.965l2.5-12.386c-11.5,0.753-20.619,10.459-20.794,22.39l12.136-3.032L23.069,52.39z")
					.attr("fill", "#5A595E");
		Compass.append("svg:path")
					.attr("d","M23.069,52.39l10.075,3.965l2.5-12.386c-11.5,0.753-20.619,10.459-20.794,22.39l12.136-3.032L23.069,52.39z")
					.attr("fill", "url(#Compassgradient)");	
		Compass.append("svg:polygon").attr("points", "31.99,62.075 33.086,56.646 23.487,52.86 27.281,63.253").attr("fill", "#FFFFFF");
		Compass.append("svg:polygon").attr("points", "32.316,71.928 26.997,71.027 23.487,80.641 33.439,77.744").attr("fill", "#FFFFFF");
		Compass.append("svg:polygon").attr("points", "42.011,61.825 47.545,63.061 50.718,52.86 40.973,56.816").attr("fill", "#FFFFFF");
		Compass.append("svg:polygon").attr("points", "41.767,72.094 40.691,77.439 50.82,80.745 48.019,70.777").attr("fill", "#FFFFFF");
		Compass.append("svg:polygon").attr("points", "41.765,62.143 36.961,38.96 32.333,62.347 9.652,67.846 32.595,71.686 36.97,94.791 41.477,71.77764.222,67.054").attr("fill", "#FFFFFF");				
					
		Compass.append('svg:path').attr("d","M33.588,29.381c0-2.735-0.023-4.715-0.143-6.791l0.071-0.024c0.787,1.783,1.859,3.664,2.979,5.497l5.1,8.354h2.098V19.951h-1.955v6.89c0,2.565,0.048,4.568,0.238,6.767l-0.071,0.024c-0.739-1.686-1.692-3.42-2.86-5.35l-5.124-8.331h-2.288v16.466h1.954V29.381z")
					.attr("fill", "#5A595E");	

  }