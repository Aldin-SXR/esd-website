const newsListController = ($scope, $http, $location, $uibModal, toastr, $rootScope) => {
    $scope.limit = "5";
    $scope.start = "0";
    $scope.page = 1;
    $scope.maxSize = 5;
    
    /* UI Select */
    $scope.pageSizes = [
        { id: 1, size: 5 },
        { id: 2, size: 10 },
        { id: 3, size: 25 },
        { id: 4, size: 50 }
    ];
    $scope.selectedSize = { value: $scope.pageSizes[0] };

    $scope.getNews = (start, limit) => {
        $http.get("/news/preview?start=" + start + "&limit=" + limit).then((response) => {
            for (let i = 0; i < response.data.news.length; i++) {
                response.data.news[i].published_at = new Date(response.data.news[i].published_at).toLocaleDateString();
                response.data.news[i].last_edited_at = response.data.news[i].last_edited_at ? new Date(response.data.news[i].last_edited_at).toLocaleDateString() : null;
            }
            $scope.newsPreview = response.data.news;
            $scope.totalItems = response.data.numOfNews;
        }, (error) => {
            console.log(error);
        });
    }

    /* Listen for news updates */
    $rootScope.$on("newsListUpdate", (event, data) => {
        $scope.getNews();
    });

    $scope.openDeleteModal = (data) => {
        let modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: "modal-title",
            ariaDescribedBy: "modal-body",
            templateUrl: "views/admin/modals/deleteModal.html",
            controller: ($scope, $uibModalInstance, $http, data, $rootScope) => {
                $scope.article = data;
                $scope.deleteArticle = (article) => {
                    $http.delete("/private/news/" + article._id, HTTP_CONFIG).then(response => {
                        toastr.success(response.data.message, "Successful deletion");
                        $uibModalInstance.close();
                        $rootScope.$emit("newsListUpdate", [ ]);
                    }, error => {
                        toastr.error("There has been an error while deleting the article.", "Unknown error");
                    });
                }
                $scope.cancel = () => {
                    $uibModalInstance.dismiss("cancel");
                }
            },
            size: "md",
            resolve: {
                data: () => {
                    return data;
                }
            }
        });
    }

    $scope.changePage = () => {
        $scope.getNews(($scope.page - 1) * $scope.limit, $scope.limit);
    }
    
    $scope.changeLimit = function() {
        $scope.limit = $scope.selectedSize.value.size;
        $scope.start = "0";
        $scope.page = 0;
        $scope.getNews($scope.start, $scope.limit);
    }

    $scope.writeNewArticle = () => {
        $location.path("/news/new");
    }

    $scope.editArticle = (id) => {
        $location.path("/news/edit/" + id);
    }

    /* Default call */
    $scope.getNews($scope.start, $scope.limit);
}