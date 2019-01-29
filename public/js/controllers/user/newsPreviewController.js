const newsPreviewController = ($scope, $http, $location, $window) => {
    $scope.category_id = "";
    $scope.limit = "3";
    $scope.start = "0";
    $scope.page = 1;
    $scope.maxSize = 3;

    $scope.getNewsCategories = () => {
        $http.get("/news_categories").then(response => {
            $scope.news_categories = response.data;
        }, error => {
            console.log(error);
        });
    }
    /* */
    $scope.getNewsPreviews = (start, limit, category) => {
        $http.get("/news/preview?start=" + start + "&limit=" + limit + "&category_id=" + category).then((response) => {
            if (response.data.news && response.data.news.length) {
                for (let i = 0; i < response.data.news.length; i++) {
                    /* Convert to human-friendly dates */
                    response.data.news[i].published_at = new Date(response.data.news[i].published_at).toLocaleDateString();
                }
            }
            $scope.news = response.data.news;
            $scope.totalItems = response.data.numOfNews;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.changePage = () => {
        $scope.getNewsPreviews(($scope.page - 1) * $scope.limit, $scope.limit, $scope.category_id);
        $window.scrollTo(0, 0);
    }

    $scope.changeCategory = (category_id) => {
        $scope.category_id = category_id;
        $scope.getNewsPreviews($scope.start, $scope.limit, category_id);
    }

    // $scope.getArticle = (article) => {
    //     $http.get("/news/" + article._id).then(response => {
    //         article.content = response.data.content;
    //         $scope.article = article;
    //     }, error => {
    //         console.log(error);
    //     });
    // }

    $scope.openArticle = (article) => {
        $location.path("/news/article/" + article._id);
        $window.scrollTo(0, 0);
    }

    $scope.getNewsCategories();
    $scope.getNewsPreviews($scope.start, $scope.limit, $scope.category_id);
};