const adminApp = angular.module("esd-admin-app", [ "ui.select", "ngAnimate", "ngSanitize", "ui.bootstrap", "ngRoute", "ui.tinymce"]);

adminApp.config(($routeProvider) => {
    $routeProvider.when("/", {
        templateUrl: "views/admin/dashboard.html",
        activeTab: "dashboard",
        viewTitle: "Dashboard"
    }).when("/members", {
        templateUrl: "views/admin/members.html",
        activeTab: "members",
        viewTitle: "Members"
    }).when("/news", {
        templateUrl: "views/admin/news-preview.html",
        activeTab: "news",
        viewTitle: "News & Posts"
    }).when("/news/new", {
        templateUrl: "views/admin/news-write.html",
        activeTab: "news",
        viewTitle: "News & Posts"
    })
})

adminApp.run(['$rootScope', ($rootScope) => {
    $rootScope.$on('$routeChangeSuccess', (event, current, previous) => {
        $rootScope.viewTitle = current.$$route.viewTitle;
        console.log(current.$$route.viewTitle);
    });
}]);


/* Controllers */
adminApp.controller("dropdownController", dropdownController);
adminApp.controller("adminLinksController", adminLinksController);
adminApp.controller("membersListController", membersListController);
adminApp.controller("newsListController", newsListController);
adminApp.controller("newsWriteController", newsWriteController);