const dashboardController = ($scope, $http, $location, $window) => {
    $http.get("/private/news/count", HTTP_CONFIG).then(response => {
        $scope.newsCount = response.data.count;
    }, error => {
        console.log(error);
    });

    $http.get("/private/members/approved/count", HTTP_CONFIG).then(response => {
        $scope.activeMembersCount = response.data.count;
    }, error => {
        console.log(error);
    });

    $http.get("/private/members/pending/count", HTTP_CONFIG).then(response => {
        $scope.pendingMembersCount = response.data.count;
    }, error => {
        console.log(error);
    });

    $scope.goToNews = () => {
        $location.path("/news");
        $window.scrollTo(0, 0);
    }

    $scope.goToMembers = () => {
        $location.path("/members");
        $window.scrollTo(0, 0);
    }
}