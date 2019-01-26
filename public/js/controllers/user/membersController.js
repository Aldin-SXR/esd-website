const membersController = ($scope, $http) => {
    $http.get("/user/members/preview").then((response) => {
        $scope.members = response.data;
    }, (error) => {
        console.log(error);
    });
}