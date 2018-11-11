const newsController = ($scope, $http) => {
    $http.get("/news").then(response => {
        $scope.news = response.data;
    }, error => {
        console.log(error);
    })
};