const eventsPreviewController = ($scope, $http, $location, $window, toastr) => {
    /* Detect logged-in user */
    $scope.authorized = false;
    $scope.loading = false;

    $scope.getEnrolledEvents = () => {
        let name = jwt_decode(localStorage.getItem("user_token")).name;
        $http.post("/private/events/applications", { member_name: name }, HTTP_CONFIG_USER).then(response => {
            $scope.enrolledEvents = response.data;
        }, error => {
            console.log(error);
        });
    }

    try {
        let token = jwt_decode(localStorage.getItem("user_token"));
        if (token) {
            $scope.authorized = true;
            $scope.getEnrolledEvents();
        }
    } catch (e) {
        $scope.authorized = false;
    }

    $scope.category_id = "";
    $scope.limit = "3";
    $scope.start = "0";
    $scope.page = 1;
    $scope.maxSize = 3;

    $scope.getEventCategories = () => {
        $http.get("/event_categories").then(response => {
            $scope.event_categories = response.data;
        }, error => {
            console.log(error);
        });
    }
    /* */
    $scope.getEventPreviews = (start, limit, category) => {
        $http.get("/events/preview?completed=0&start=" + start + "&limit=" + limit + "&category_id=" + category).then((response) => {
            if (response.data.events && response.data.events.length) {
                for (let i = 0; i < response.data.events.length; i++) {
                    /* Convert to human-friendly dates */
                    response.data.events[i].start_date = new Date(response.data.events[i].start_date).toLocaleDateString();
                    response.data.events[i].end_date = new Date(response.data.events[i].end_date).toLocaleDateString();
                }
            }
            $scope.events = response.data.events;
            $scope.totalItems = response.data.numOfEvents;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.changePage = () => {
        $scope.getEventPreviews(($scope.page - 1) * $scope.limit, $scope.limit, $scope.category_id);
        $window.scrollTo(0, 0);
    }

    $scope.changeCategory = (category_id) => {
        $scope.category_id = category_id;
        $scope.getEventPreviews($scope.start, $scope.limit, category_id);
    }

    // $scope.getArticle = (article) => {
    //     $http.get("/event/" + article._id).then(response => {
    //         article.content = response.data.content;
    //         $scope.article = article;
    //     }, error => {
    //         console.log(error);
    //     });
    // }

    $scope.openEvent = (event) => {
        $location.path("/events/" + event._id);
        $window.scrollTo(0, 0);
    }

    $scope.cancelApplication = (event_id) => {
        $scope.loading = true;
        let name = jwt_decode(localStorage.getItem("user_token")).name;
        $http.put("/private/events/" + event_id +"/cancel", { member_name: name }, HTTP_CONFIG_USER).then(response => {
            $scope.loading = false;
            $scope.enrolled = false;
            toastr.success(response.data.message, "Success");
            $scope.getEnrolledEvents();
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while cancelling the event application.", "Unknown error");
        });
    }

    $scope.getEventCategories();
    $scope.getEventPreviews($scope.start, $scope.limit, $scope.category_id);
};