const adminApp = angular.module("esd-admin-app", ["ui.select", "ngAnimate", "ngSanitize", "ui.bootstrap", "ngRoute", "ui.tinymce", "toastr", "720kb.datepicker"]);

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
        viewTitle: "News & Articles"
    }).when("/news/new", {
        templateUrl: "views/admin/news-write.html",
        activeTab: "news",
        viewTitle: "Write an Article"
    }).when("/news/edit/:id", {
        templateUrl: "views/admin/news-write.html",
        activeTab: "news",
        viewTitle: "Edit an Article"
    }).when("/events", {
        templateUrl: "views/admin/event-preview.html",
        activeTab: "events",
        viewTitle: "Events"
    }).when("/events/new", {
        templateUrl: "views/admin/event-create.html",
        activeTab: "news",
        viewTitle: "Create an Event"
    }).when("/events/edit/:id", {
        templateUrl: "views/admin/event-create.html",
        activeTab: "news",
        viewTitle: "Edit an Event"
    }).when("/profile", {
        templateUrl: "views/admin/profile.html",
        activeTab: "profile",
        viewTitle: "My Profile"
    });
})

adminApp.run(['$rootScope', 'toastr', ($rootScope, toastr) => {
    try {
        let token = jwt_decode(localStorage.getItem("admin_token"));
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

    $rootScope.$on("openDrawer", (event, data) => {
        $rootScope.openDrawer = data;
    });
}]);


/* Controllers */
adminApp.controller("dropdownController", dropdownController);
adminApp.controller("adminLinksController", adminLinksController);
adminApp.controller("membersListController", membersListController);
adminApp.controller("newsListController", newsListController);
adminApp.controller("newsWriteController", newsWriteController);
adminApp.controller("dashboardController", dashboardController);
adminApp.controller("eventsListController", eventsListController);
adminApp.controller("eventsCreateController", eventsCreateController);
adminApp.controller("profileController", profileController);