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
        jQuery.support.cors = true;
        $.ajax(self.LogDemoUserKeyUsedUrl + "?DemoUserKey=" + DemoUserKey + "&callback?")
         .done(function () { window.location.href = self.DemoUrl; })
         .fail(function (jqXHR, textStatus, errorThrown) { self.errorMessage(errorThrown); })
    };
    self.DemoUrl = "http://yourhospital.yourdirectroute.com/";
    self.LogDemoUserKeyUsedUrl = "http://wayfinderlj-restservice.cloudapp.net/MobileService.svc/LogDemoUserKeyUsed";
    //self.LogDemoUserKeyUsedUrl = "http://ef76d7d3e6c0436fa4c6c3b4e753c966.cloudapp.net/MobileService.svc/LogDemoUserKeyUsed";
	self.clientVM = new ClientViewModel();

    self.resetPage = function () {
        
        self.demoUserKey('');

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

var mainVM = new MainViewModel();

$(window).resize(function () {
    //resize just happened, pixels changed
    mainVM.clientVM.setLogoImage();

});

window.onload = function () {
    //if(!mainVM) mainVM;
    ko.applyBindings(mainVM, document.getElementById("mainBody"));
    mainVM.clientVM.clientID('4');
    mainVM.clientVM.setLogoImage();
}