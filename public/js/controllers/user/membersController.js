const membersController = ($scope, $http) => {
    $http.get("/leaders/short").then((response) => {
        $scope.members = response.data;
    }, (error) => {
        console.log(error);
    });
}