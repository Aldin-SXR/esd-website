const awardsController = ($scope, $http) => {
    $http.get("/awards").then((response) => {
        $scope.awards = response.data;
    }, (error) => {
        console.log(error);
    });
}