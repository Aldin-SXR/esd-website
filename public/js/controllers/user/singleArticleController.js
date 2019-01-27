const singleArticleController = ($scope, $http, $routeParams, $sce) => {
    /* Load a single article */
    $http.get("/news/" + $routeParams.id).then(response => {
        $scope.article = response.data;
        $scope.article.content = $sce.trustAsHtml($scope.article.content);
        /* Load author data */
        $http.get("/author/" + $scope.article.author_id).then(response => {
            $scope.article.author_name = response.data.name;
            $scope.article.author_title = response.data.title;
            $scope.article.author_picture = response.data.picture;
        }, error => {
            console.log(error);
        });
        /* Load category data */
        $http.get("/category/" + $scope.article.category_id).then(response => {
            $scope.article.category_name = response.data.name;
        }, error => {
            console.log(error);
        });
    }, error => {
        console.log(error);
    });
}