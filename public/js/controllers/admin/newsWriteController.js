const newsWriteController = ($scope, $http, $location, $routeParams, toastr, $window) => {
    $scope.loading = false;
    $scope.getNewsCategories = () => {
        $http.get("/news_categories").then(response => {
            $scope.news_categories = response.data;
            /* If route params are set */
            if ($routeParams.id) {
                for (let i = 0; i < $scope.news_categories.length; i++) {
                    if ($scope.article.category_id == $scope.news_categories[i]._id) {
                        $scope.selected = { value: $scope.news_categories[i] }
                        break;
                    }
                }
            } else {
                $scope.selected = { value: $scope.news_categories[0] }
            }
        }, error => {
            console.log(error);
        });
    }
    
    if ($routeParams.id) {
        $scope.article_id = $routeParams.id;
        $http.get("/news/" + $routeParams.id).then(response => {
            $scope.article = response.data;
            $scope.getNewsCategories();
        }, error => {
            console.log(error);
        });
    } else {
        /* Default article */
        $scope.article = { 
            author_id: jwt_decode(localStorage.getItem("user_token"))._id,
            disable_comments: false
        };
        $scope.getNewsCategories();
    }

    $scope.submitArticle = () => {
        $scope.loading = true;
        /* Take current category */
        $scope.article.category_id = $scope.selected.value._id;
        $http.post("/private/news", $scope.article, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            toastr.success("Successfully posted a new article.", "Success");
            $location.path("/news");
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while posting the article.", "Unknown error");
        });
    }

    $scope.editArticle = () => {
        $scope.loading = true;
        /* Take current category */
        $scope.article.category_id = $scope.selected.value._id;
        $http.put("/private/news/" + $scope.article_id, $scope.article, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            toastr.success(response.data.message, "Success");
            $location.path("/news");
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while posting the article.", "Unknown error");
        });
    }

    $scope.goBack = () => {
        $location.path("/news");
        $window.scrollTo(0, 0);
    }

    $scope.tinymceOptions = {
        onChange: function (e) {
            // put logic here for keypress and cut/paste changes
        },
        inline: false,
       // height: "500",
        plugins: 'advlist textcolor autoresize autolink link image imagetools lists charmap print preview searchreplace',
        skin: 'lightgray',
        toolbar1: 'undo redo | styleselect sizeselect fontselect |  fontsizeselect | bold italic underline | forecolor backcolor |' + 
                        'alignleft aligncenter alignright alignjustify |' + 
                        'bullist numlist outdent indent | link image | searchreplace',
        theme: 'modern',
        autoresize_max_height: 500
    };
}