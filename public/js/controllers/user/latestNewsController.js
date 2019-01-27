const latestNewsController = ($scope, $http, $location, $window) => {
    $scope.category_id = "";

    $scope.getNewsCategories = () => {
        $http.get("/news_categories").then(response => {
            $scope.news_categories = response.data;
        }, error => {
            console.log(error);
        });
    }
    /* */
    $scope.getLatestNews = (category) => {
        $http.get("/news/preview?start=0&limit=5&category_id=" + category).then((response) => {
            if (response.data.news && response.data.news.length) {
                for (let i = 0; i < response.data.news.length; i++) {
                    if (!response.data.news[i].image || response.data.news[i].image === "" || response.data.news[i].image === null) {
                        response.data.news[i].image = "img/no_image_available.png";
                    }
                }
            }
            $scope.news = response.data.news;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.changeCategory = (category_id) => {
        $scope.category_id = category_id;
        $scope.getLatestNews(category_id);
    }

    $scope.openArticle = (id) => {
        $location.path("/news/article/" + id);
        $window.scrollTo(0, 0);
    }

    $scope.getNewsCategories();
    $scope.getLatestNews($scope.category_id);
};