const membersController = ($scope, $http) => {
    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;

    $http.get("/members/short").then((response) => {
        $scope.members = response.data;
    }, (error) => {
        console.log(error);
    });
}