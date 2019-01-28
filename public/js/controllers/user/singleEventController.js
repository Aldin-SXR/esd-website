const singleEventController = ($scope, $http, $routeParams, $sce, toastr) => {
    /* Detect logged-in user */
    $scope.authorized = false;
    $scope.loading = false;
    try {
        let token = jwt_decode(localStorage.getItem("user_token"));
        if (token) {
            $scope.authorized = true;;
        }
    } catch (e) {
        $scope.authorized = false;
    }
    /* Load a single article */
    $http.get("/events/" + $routeParams.id).then(response => {
        /* Human-friendly date strings */
        response.data.start_date = new Date(response.data.start_date).toLocaleDateString();
        response.data.end_date = new Date(response.data.end_date).toLocaleDateString();
        $scope.event = response.data;
        $scope.event.description = $sce.trustAsHtml($scope.event.description);
        /* Load category data */
        $http.get("/event_category/" + $scope.event.category_id).then(response => {
            $scope.event.category_name = response.data.name;
        }, error => {
            console.log(error);
        });
        /* Check enrollment status */
        let name = jwt_decode(localStorage.getItem("user_token")).name;
        $http.post("/private/events/" + $routeParams.id + "/check_application", { member_name: name }, HTTP_CONFIG).then(response => {
            $scope.enrolled = response.data.enrolled;
        }, error => {
            console.log(error);
        });
    }, error => {
        console.log(error);
    });

    $scope.applyForEvent = (event_id) => {
        $scope.loading = true;
        let name = jwt_decode(localStorage.getItem("user_token")).name;
        $http.put("/private/events/" + event_id +"/apply", { member_name: name }, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            $scope.enrolled = true;
            toastr.success(response.data.message, "Success");
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while applying for the event.", "Unknown error");
        });
    }

    $scope.cancelApplication = (event_id) => {
        $scope.loading = true;
        let name = jwt_decode(localStorage.getItem("user_token")).name;
        $http.put("/private/events/" + event_id +"/cancel", { member_name: name }, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            $scope.enrolled = false;
            toastr.success(response.data.message, "Success");
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while cancelling the event application.", "Unknown error");
        });
    }
}