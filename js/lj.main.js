function MainViewModel() {
    var self = this;
    self.demoUserKey = ko.observable("");
    self.errorMessage = ko.observable("");
    self.LogDemoUserKeyUsed = function () {
        self.errorMessage("");
        var DemoUserKey = self.demoUserKey().toUpperCase();
        if (DemoUserKey.length !=6)
        {
            self.errorMessage("You missed some character(s) in your code.");
            return;
        }
        var first = parseInt("0x" + DemoUserKey[0] + DemoUserKey[1]);
        var second = parseInt("0x" + DemoUserKey[2] + DemoUserKey[3]);
        var check = parseInt("0x" + DemoUserKey[4] + DemoUserKey[5]);

        if (Math.floor((first + second) / 2 )!= check)
        {
            self.errorMessage("You mis-typed some character(s) in your code.");
            return;
        }

        $.ajax(self.LogDemoUserKeyUsedUrl + "?DemoUserKey=" + DemoUserKey)
         .done(function () { window.location.href = self.DemoUrl; });

    };


    self.storageObject = { SessionID: 0 };
    //self.GetMenuDataUrl = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetMobileMenuData";
    self.GetMenuDataUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/GetMobileMenuData";
    //self.GetMenuDataUrl = "http://localhost:60001/MobileService.svc/GetMobileMenuData";
    //self.UpdateSessionURL = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/UpdateActivityForSessionID";
    self.UpdateSessionURL = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/UpdateActivityForSessionID";
    //self.UpdateSessionURL = "http://localhost:60001/MobileService.svc/UpdateActivityForSessionID";
    //self.GetDataByNameUrl = "http://yourdirectroute.com/WayfinderMobile/MobileService.svc/GetDestinationByName";
    self.DemoUrl = "http://wayfindingdemo.azurewebsites.net/";
    //self.GetDataByNameUrl = "http://localhost:60001/MobileService.svc/GetDestinationByName";
    self.LogDemoUserKeyUsedUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/LogDemoUserKeyUsed";
    //self.LogDemoUserKeyUsedUrl = "http://ef76d7d3e6c0436fa4c6c3b4e753c966.cloudapp.net/MobileService.svc/LogDemoUserKeyUsed";
    //self.WalkingMapsUrl = "http://localhost:60001/MobileService.svc/GetSVGXMLData";
    self.GetPrintUrl = "http://localhost:60001/MobileService.svc/GetPrintout";
    self.clientVM = new ClientViewModel();
    self.ljdirectionsVM = new LJDirectionsViewModel();
    self.fromVM = new LocationViewModel("from");
    self.lookupVM = new LookupItemViewModel('main');
    self.dataVM = new DestinationListViewModel();
    self.currentPage = 'home';
    self.printableVM = new PrintableViewModel();
    self.isFooterNavBar = ko.observable(false);
    //self.googleDirectionsVM = new GoogleDirectionsViewModel();
    self.start_location = ko.observable({ name: '' }).syncWith('newLocationfrom');
    self.end_location = ko.observable({ name: '' }).syncWith('newLocationto');
    self.campus_visible = ko.observable(true).syncWith('campusVisible');
    self.searchStart_visible = ko.observable(true).syncWith('searchVisiblefrom');
    self.searchEnd_visible = ko.observable(true).syncWith('searchVisibleto');
    self.guideText = ko.observable();
    self.lookup_breadcrumb = new Array();
    self.directionsHref = ko.observable('#walking');
    self.MenuItems = new Array();
    self.driveMap = true;
    self.resetPage = function () {
        
        self.demoUserKey('');
        self.storageObject = { SessionID: 0 };
       
        getViewState();
        $('#searchFieldFrom').blur();
        self.storageObject.loadTime = new Date().getTime();

    }
    

    self.isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    
}

function escapeJSON(jsonString) {
    // This only replaces new lines. Add more escapes here
    return jsonString.replace(/\r?\n/g, "");
}

function getImageDataURL(url, success, error) {
    var data, canvas, ctx;
    var img = new Image();
    img.onload = function () {
        // Create the canvas element.
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        // Get '2d' context and draw the image.
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // Get canvas data URL
        try {
            data = canvas.toDataURL();
            success({ image: img, data: data });
        } catch (e) {
            error(e);
        }
    }
    // Load image URL.
    try {
        img.src = url;
    } catch (e) {
        error(e);
    }
}



var mainVM = new MainViewModel();
var History = window.History;

function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    //var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regexS = "[\\?&]" + name + "=([^&]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url.toLowerCase());
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(window).resize(function () {
    //resize just happened, pixels changed
    mainVM.clientVM.setLogoImage();
    setNavBar();

});

function setNavBar() {
    if ($(window).width() < 768) {
        mainVM.isFooterNavBar(true);
    } else {
        mainVM.isFooterNavBar(false);
    }
}

window.onload = function () {
    //if(!mainVM) mainVM;
    checkRefresh();
    if (!mainVM.storageObject.loadTime) { mainVM.storageObject.loadTime = new Date().getTime(); }
    History = window.History;
    //initializeGoogle();
    //mainVM.googleDirectionsVM.initializeGoogleMap(mainVM.clientVM.mainLatLng, mainVM.clientVM.mainLatLng);
    ko.applyBindings(mainVM, document.getElementById("mainBody"));
    mainVM.clientVM.clientID('4');
    mainVM.clientVM.setLogoImage();
    setNavBar();
    //mainVM.clientVM.imagePath("images/LJlogo.png");
    PopulateLookup();
    //mainVM.fromVM.PopulateParking()
    //if(!window.chrome){
    getViewState();
    //}
}

function getViewState(newHash) {
    var pageID = newHash ? newHash : getParameterByName(window.location.href, 'page');
    if (!pageID)
        pageID = 'home';
    if (mainVM.currentPage != pageID) {
        ChangePage('#' + pageID);
        recreateBindings();
        mainVM.searchStart_visible(true);
        mainVM.searchEnd_visible(true);
        
    }  if (pageID == 'home') {
      
    }
}




function PopulateLookup() {
    $.mobile.loading('show');
    $.when($.getJSON(mainVM.GetMenuDataUrl + '?ClientID=' + mainVM.clientVM.clientID())).then(function (destData) {

        var escapedJSON = escapeJSON(destData);
        var jsonObject = JSON.parse(escapedJSON);
        if (Array.isArray(jsonObject)) {
            for (var i = 0; i < jsonObject.length; i++) {
                var parent;
                if (jsonObject[i].ParentID == "") {
                    parent = mainVM.lookupVM;
                } else {
                    parent = FindParent(jsonObject[i].ParentID, mainVM.lookupVM);
                }
                var livm = new LookupItemViewModel(jsonObject[i].ActionID);
                livm.headerText = jsonObject[i].MenuLabel.replace('&amp;', '&');
                livm.data_id = jsonObject[i].OnClick;
                livm.ID = jsonObject[i].ID;
                if (parent != null)
                    parent.subItems.push(livm);
            }
        }
        mainVM.lookupVM.mainHeaderText('PlaceHolder');
        $.mobile.loading('hide');

    });
}

function ResetLookup(location) {
    mainVM.lookup_breadcrumb = Array();
    mainVM.dataVM.lookup_reference = location;
    mainVM.lookupVM.selectedSubItem(mainVM.lookupVM);
    var funcwithdelay = $.debounce(function (event) {
        $('#lookup').trigger('create');
    }, 1);
    funcwithdelay();
    if (location == "to")
        mainVM.lookupVM.mainHeaderText('Select Destination');
    else
        mainVM.lookupVM.mainHeaderText('');
}


function MouseDownFromItem(event) {
    cancelFromBlur = true;
}

function MouseDownToItem(event) {
    cancelToBlur = true;
}

function focusTo() {
    var funcwithdelay = $.debounce(function (event) {
        mainVM.toVM.searchVM.PopulateSuggestions(mainVM.toVM.searchVM.saved_name());
        mainVM.toVM.searchVM.results_visible(true);
        //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
    }, 0);
    funcwithdelay();
}

function blurTo() {
    if (cancelToBlur) {
        cancelToBlur = false;
    } else {
        var funcwithdelay = $.debounce(function (event) {
            mainVM.toVM.searchVM.results_visible(false);
            //if(mainVM.toVM.searchVM.saved_value() != null) mainVM.toVM.searchVM.search_visible(false);
        }, 0);
        funcwithdelay();
    }
}

$(document).bind('pageinit', function () {
    //$('#parkingpopup').popup({ history: false });
    //$('#printpopup').popup({ history: false });
    //$.mobile.changePage.defaults.changeHash = false;
    // Bind to StateChange Event
    History.Adapter.bind(window, 'statechange', function (evt) { // Note: We are using statechange instead of popstate
        getViewState();
        //var State = History.getState(); // Note: We are using History.getState() instead of event.state
        //History.log(State.data, State.title, State.url);
    });

    $('.pageButton').on('click', function (evt) {
        if ($(this).hasClass('pageButton')) {
            evt.preventDefault();
            if ($(this).attr('href').replace('#', '') == 'printable') {
                mainVM.printableVM.resetLoading();
            }
            if ($(this).attr('id') == 'continueBtn' || $(this).attr('id') == 'directionsBtn') {
                if (!mainVM.storageObject.directionsTime) { mainVM.storageObject.directionsTime = new Date().getTime(); }
                getViewState($(this).attr('href').replace('#', ''));
            }
            if ($.mobile.activePage[0].id != $(this).attr('href').replace('#', '')) {
                ChangePage($(this).attr('href'));
            }
            if ($.mobile.activePage[0].id == "walking") mainVM.ljdirectionsVM.updateSVGSize();
            if (mainVM.storageObject.SessionID) $.ajax(mainVM.UpdateSessionURL + "?SessionID=" + mainVM.storageObject.SessionID);
        }
    });
    //if(!window.chrome){
    //$('.getDirectionsButton').on('click',function(){
    //DrawDirections();
    //  });
    //}
    //$('[data-role=footer]').fixedtoolbar({ tapToggle:false });
});

function ChangePage(newHash) {
    if (mainVM.currentPage != newHash.replace('#', '')) {
        mainVM.currentPage = newHash.replace('#', '');
        
        $.mobile.changePage(newHash, { transition: "fade", changeHash: false, allowSamePageTransition: true }); // Use this to transition and leave a hash page in history
    }
}


$(document).bind("pagechange", function (event, data) {
    if (data.toPage[0].id == 'printable') {
        mainVM.printableVM.resetLoading();
    }

    if (mainVM.clientVM.clientID())
        getViewState();
    var pageId = data.toPage[0].id;
    if (pageId === "driving" || pageId === "drivingdirections") {
        // resize the google map and directions before switching to the page

        if (mainVM.googleDirectionsVM.map !== null) {
            google.maps.event.addListenerOnce(mainVM.googleDirectionsVM.map, 'resize', function () {
                // listens for the resize event and centers the map based on the bounds
                mainVM.googleDirectionsVM.map.fitBounds(mainVM.googleDirectionsVM.googleMapBounds);
            });

            // resizes and refreshes the map whenever we switch to the google map page
            google.maps.event.trigger(mainVM.googleDirectionsVM.map, 'resize');
        }
    }
});

var refresh_prepare = 1;

function checkRefresh() {
    // Get the time now and convert to UTC seconds
    var today = new Date();
    var now = today.getUTCSeconds();

    // Get the cookie
    var cookie = document.cookie;
    var cookieArray = cookie.split('; ');

    // Parse the cookies: get the stored time
    for (var loop = 0; loop < cookieArray.length; loop++) {
        var nameValue = cookieArray[loop].split('=');
        // Get the cookie time stamp
        if (nameValue[0].toString() == 'SHTS') {
            var cookieTime = parseInt(nameValue[1]);
        }
            // Get the cookie page
        else if (nameValue[0].toString() == 'SHTSP') {
            var cookieName = nameValue[1];
        }
    }

    if (cookieName &&
		cookieTime &&
		cookieName == escape(location.href) &&
		Math.abs(now - cookieTime) < 5) {
        for (var loop = 0; loop < cookieArray.length; loop++) {
            var nameValue = cookieArray[loop].split('=');
            // Get the cookie time stamp
            mainVM.storageObject[nameValue[0].toString()] = nameValue[1] == "undefined" || nameValue[1] == "null" ? null : nameValue[1];
        }
        mainVM.storageObject.isRefresh = true;
        if (mainVM.storageObject.SessionID) $.ajax(mainVM.UpdateSessionURL + "?SessionID=" + mainVM.storageObject.SessionID);
        // Refresh detected

        // Insert code here representing what to do on
        // a refresh

        // If you would like to toggle so this refresh code
        // is executed on every OTHER refresh, then 
        // uncomment the following line
        // refresh_prepare = 0; 
    } else {
        mainVM.storageObject.isRefresh = false;
    }

    // You may want to add code in an else here special 
    // for fresh page loads
}

function prepareForRefresh() {
    if (refresh_prepare > 0) {
        // Turn refresh detection on so that if this
        // page gets quickly loaded, we know it's a refresh
        var today = new Date();
        var now = today.getUTCSeconds();
        document.cookie = 'SHTS=' + now;
        document.cookie = 'SHTSP=' + escape(location.href);
        document.cookie = 'loadTime=' + mainVM.storageObject.loadTime;
        document.cookie = 'toSearchType=' + mainVM.storageObject.toSearchType;
        document.cookie = 'fromSearchType=' + mainVM.storageObject.fromSearchType;
        document.cookie = 'directionsTime=' + mainVM.storageObject.directionsTime;
        document.cookie = 'SessionID=' + mainVM.storageObject.SessionID;
        document.cookie = 'StartDestinationName=' + mainVM.storageObject.StartDestinationName;;
        document.cookie = 'EndDestinationName=' + mainVM.storageObject.EndDestinationName;;
    }
    else {
        // Refresh detection has been disabled
        document.cookie = 'SHTS=';
        document.cookie = 'SHTSP=';
        document.cookie = 'toSearchType=';
        document.cookie = 'fromSearchType=';
        document.cookie = 'directionsTime=';
        document.cookie = 'SessionID=0';
        document.cookie = 'StartDestinationName=';
        document.cookie = 'EndDestinationName=';
    }
}

