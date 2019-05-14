const alumniController = ($scope, $http) => {
    $http.get("/members/alumni").then((response) => {
        $scope.alumni = response.data;
    }, (error) => {
        console.log(error);
    });
}