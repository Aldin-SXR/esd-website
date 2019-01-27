const adminApp = angular.module("esd-admin-app", ["ui.select", "ngAnimate", "ngSanitize", "ui.bootstrap", "ngRoute", "ui.tinymce", "toastr"]);

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
        viewTitle: "Write an Article"
    }).when("/news/edit/:id", {
        templateUrl: "views/admin/news-write.html",
        activeTab: "news",
        viewTitle: "Edit an Article"
    })
})

adminApp.run(['$rootScope', 'toastr', ($rootScope, toastr) => {
    try {
        let token = jwt_decode(localStorage.getItem("user_token"));
        if (!token || (token && !token.superuser)) {
            window.location.href = "index.html";
            toastr.error("You are not authorized to access this page.", "Authorization error.");
        }
    } catch (e) {
        window.location.href = "index.html";
        toastr.error("You are not authorized to access this page.", "Authorization error.");
    }

    $rootScope.$on('$routeChangeSuccess', (event, current, previous) => {
        $rootScope.viewTitle = current.$$route.viewTitle;
    });
}]);


/* Controllers */
adminApp.controller("dropdownController", dropdownController);
adminApp.controller("adminLinksController", adminLinksController);
adminApp.controller("membersListController", membersListController);
adminApp.controller("newsListController", newsListController);
adminApp.controller("newsWriteController", newsWriteController);
adminApp.controller("dashboardController", dashboardController);