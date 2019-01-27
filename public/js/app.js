const app = angular.module("esd-app", [ "ngAnimate", "ngSanitize", "ui.bootstrap", "ngRoute", "toastr"]);

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
    }).when("/news", {
        templateUrl: "views/user/news.html",
        activeTab: "news"
    }).when("/news/article/:id", {
        templateUrl: "views/user/article-single.html",
        activeTab: "news"
    });
})

/* Controllers */
app.controller("latestNewsController", latestNewsController);
app.controller("mapController", mapController);
app.controller("linksController", linksController);
app.controller("membersController", membersController);
app.controller("pageController", pageController);
app.controller("awardsController", awardsController);
app.controller("loginController", loginController);
app.controller("newsPreviewController", newsPreviewController);
app.controller("singleArticleController", singleArticleController);