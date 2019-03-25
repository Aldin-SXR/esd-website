const latestEventsController = ($scope, $http, $location, $window) => {
    $scope.category_id = "";

    $scope.getEventCategories = () => {
        $http.get("/event_categories").then(response => {
            $scope.event_categories = response.data;
        }, error => {
            console.log(error);
        });
    }
    /* */
    $scope.getLatestEvents = (category) => {
        $http.get("/events/preview?start=0&limit=4&completed=0&category_id=" + category).then((response) => {
            if (response.data.events && response.data.events.length) {
                for (let i = 0; i < response.data.events.length; i++) {
                    /* Convert to human-friendly dates */
                    response.data.events[i].start_date = new Date(response.data.events[i].start_date).toLocaleDateString();
                    response.data.events[i].end_date = new Date(response.data.events[i].end_date).toLocaleDateString();
                }
            }
            $scope.events = response.data.events;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.changeCategory = (category_id) => {
        $scope.category_id = category_id;
        $scope.getLatestEvents(category_id);
    }

    $scope.openEvent = (id) => {
        $location.path("/events/" + id);
        $window.scrollTo(0, 0);
    }

    $scope.getEventCategories();
    $scope.getLatestEvents($scope.category_id);
};