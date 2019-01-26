const newsListController = ($scope, $http, $location) => {
    $scope.limit = "5";
    $scope.start = "0";
    $scope.page = 1;
    $scope.maxSize = 5;

    $scope.getNews = (start, limit) => {
        $http.get("/news/preview?start=" + start + "&limit=" + limit).then((response) => {
            $scope.newsPreview = response.data.news;
            $scope.totalItems = response.data.numOfNews;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.changePage = () => {
        $scope.getNews(($scope.page - 1) * $scope.limit, $scope.limit);
    }
    
    $scope.changeLimit = function() {
        $scope.start = "0";
        $scope.page = 0;
        $scope.getNews($scope.start, $scope.limit);
    }

    $scope.writeNewArticle = () => {
        $location.path("/news/new");
    }

    /* Default call */
    $scope.getNews($scope.start, $scope.limit);
}