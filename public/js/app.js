const app = angular.module("esd-app", [ "ngRoute" ]);
app.config(($routeProvider) => {
    $routeProvider.when("/", {
        templateUrl: "views/home.html"
    }).when("/contact", {
        templateUrl: "views/contact.html"    
    })
})

/* Controllers */
app.controller("newsController", newsController);
app.controller("mapController", mapController);