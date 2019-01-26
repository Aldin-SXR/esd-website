const app = angular.module("esd-app", [ "ngAnimate", "ngSanitize", "ui.bootstrap", "ngRoute"]);

app.config(($routeProvider) => {
    $routeProvider.when("/", {
        templateUrl: "views/user/home.html",
        activeTab: "home"
    }).when("/contact", {
        templateUrl: "views/user/contact.html",
        activeTab: "contact"
    }).when("/about", {
        templateUrl: "views/user/about.html",
        activeTab: "about"
    });
})

/* Controllers */
app.controller("newsController", newsController);
app.controller("mapController", mapController);
app.controller("linksController", linksController);
app.controller("membersController", membersController);
app.controller("pageController", pageController);
app.controller("awardsController", awardsController);
app.controller("loginController", loginController);