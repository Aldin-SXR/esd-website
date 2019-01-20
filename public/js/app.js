const app = angular.module("esd-app", [ "ngRoute" ]);
app.config(($routeProvider) => {
    $routeProvider.when("/", {
        templateUrl: "views/home.html",
        activeTab: "home"
    }).when("/contact", {
        templateUrl: "views/contact.html",
        activeTab: "contact"
    })
})

/* Controllers */
app.controller("newsController", newsController);
app.controller("mapController", mapController);
app.controller("linksController", linksController);