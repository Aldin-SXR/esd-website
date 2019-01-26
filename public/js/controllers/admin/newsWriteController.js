const newsWriteController = ($scope, $http, $location) => {
    $scope.loading = false;
    /* Default article */
    $scope.article = { 
        author_id: "test",
        disable_comments: false
    };
    $scope.getNewsCategories = () => {
        $http.get("/news_categories").then(response => {
            $scope.news_categories = response.data;
            $scope.selected = { value: $scope.news_categories[0] }
        }, error => {
            console.log(error);
        });
    }

    $scope.submitArticle = () => {
        $scope.loading = true;
        /* Take current category */
        $scope.article.category_id = $scope.selected.value._id;
        $http.post("/admin/news", $scope.article).then(response => {
            $scope.loading = false;
            $location.path("/news");
        }, error => {

            $scope.loading = false;
        });
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

    /* Default calls to API */
    $scope.getNewsCategories();
}