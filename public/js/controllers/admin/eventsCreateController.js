const eventsCreateController = ($scope, $http, $location, $routeParams, toastr, $window) => {
    $scope.loading = false;
    /* Date-picker formats */
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    
    $scope.startDate = {
        opened: false
    }

    $scope.openStartDate = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.startDate.opened = true;
    }

    $scope.getEventCategories = () => {
        $http.get("/event_categories").then(response => {
            $scope.event_categories = response.data;
            /* If route params are set */
            if ($routeParams.id) {
                for (let i = 0; i < $scope.event_categories.length; i++) {
                    if ($scope.event.category_id == $scope.event_categories[i]._id) {
                        $scope.selected = { value: $scope.event_categories[i] }
                        break;
                    }
                }
            } else {
                $scope.selected = { value: $scope.event_categories[0] }
            }
        }, error => {
            console.log(error);
        });
    }

    if ($routeParams.id) {
        $scope.event_id = $routeParams.id;
        $http.get("/events/" + $routeParams.id).then(response => {
            response.data.start_date = new Date(response.data.start_date).toLocaleDateString();
            response.data.end_date = new Date(response.data.end_date).toLocaleDateString();
            $scope.event = response.data;
            $scope.getEventCategories();
        }, error => {
            console.log(error);
        });
    } else {
        /* Default article */
        $scope.event = {};
        $scope.getEventCategories();
    }

    $scope.submitEvent = () => {
        $scope.loading = true;
        /* Take current category */
        $scope.event.category_id = $scope.selected.value._id;
        $http.post("/private/events", $scope.event, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            toastr.success("Successfully created a new event.", "Success");
            $location.path("/events");
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while creating the event.", "Unknown error");
        });
    }

    $scope.editEvent = () => {
        $scope.loading = true;
        /* Take current category */
        $scope.event.category_id = $scope.selected.value._id;
        $http.put("/private/events/" + $scope.event_id, $scope.event, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            toastr.success(response.data.message, "Success");
            $location.path("/events");
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while updating the event.", "Unknown error");
        });
    }

    $scope.goBack = () => {
        $location.path("/events");
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