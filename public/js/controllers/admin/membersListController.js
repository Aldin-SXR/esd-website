const membersListController = ($scope, $http) => {
    $scope.limit = "5";
    $scope.start = "0";
    $scope.page = 1;
    $scope.maxSize = 5;

    $scope.getMembers = (start, limit) => {
        $http.get("/admin/members/preview?start=" + start + "&limit=" + limit).then((response) => {
            $scope.members = response.data.members;
            $scope.totalItems = response.data.numOfMembers;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.changePage = () => {
        $scope.getMembers(($scope.page - 1) * $scope.limit, $scope.limit);
    }
    
    $scope.changeLimit = function() {
        $scope.start = "0";
        $scope.page = 0;
        $scope.getMembers($scope.start, $scope.limit);
    }

    /* Default call */
    $scope.getMembers($scope.start, $scope.limit);
}