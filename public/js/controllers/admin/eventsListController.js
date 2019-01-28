const eventsListController = ($scope, $http, $location, $uibModal, toastr, $rootScope) => {
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

    $scope.getEvents = (start, limit) => {
        $http.get("/events/preview?start=" + start + "&limit=" + limit + "&completed=0").then((response) => {
            for (let i = 0; i < response.data.events.length; i++) {
                response.data.events[i].start_date = new Date(response.data.events[i].start_date).toLocaleDateString();
                response.data.events[i].end_date = new Date(response.data.events[i].end_date).toLocaleDateString();
                response.data.events[i].enrolled_members = (response.data.events[i].enrolled_members).join(", ");
            }
            $scope.eventsPreview = response.data.events;
            $scope.totalActiveItems = response.data.numOfEvents;
        }, (error) => {
            console.log(error);
        });
    }

    $scope.getCompletedEvents = (start, limit) => {
        $http.get("/events/preview?start=" + start + "&limit=" + limit + "&completed=1").then((response) => {
            for (let i = 0; i < response.data.events.length; i++) {
                response.data.events[i].enrolled_members = (response.data.events[i].enrolled_members).join(", ");
                response.data.events[i].start_date = new Date(response.data.events[i].start_date).toLocaleDateString();
                response.data.events[i].end_date = new Date(response.data.events[i].end_date).toLocaleDateString();
            }
            $scope.completedEvents = response.data.events;
            $scope.totalCompletedItems = response.data.numOfEvents;
        }, (error) => {
            console.log(error);
        });
    }

    /* Listen for event updates */
    $rootScope.$on("eventsListUpdate", (event, data) => {
        $scope.getEvents();
        $scope.getCompletedEvents();
    });

    $scope.openDeleteModal = (data) => {
        let modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: "modal-title",
            ariaDescribedBy: "modal-body",
            templateUrl: "views/admin/modals/deleteModal.html",
            controller: ($scope, $uibModalInstance, $http, data, $rootScope) => {
                $scope.event = data;
                $scope.deleteEvent = (event) => {
                    $http.delete("/private/events/" + event._id, HTTP_CONFIG).then(response => {
                        toastr.success(response.data.message, "Successful deletion");
                        $uibModalInstance.close();
                        $rootScope.$emit("eventsListUpdate", [ ]);
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

    $scope.markAsCompleted = (event) => {
        $http.put("/private/events/" + event._id, { completed: 1 }, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            toastr.success(response.data.message, "Success");
            $location.path("/events");
            /* Reload data */
            $scope.getEvents($scope.start, $scope.limit);
            $scope.getCompletedEvents($scope.start, $scope.limit);
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while updating the event.", "Unknown error");
        });
    }

    $scope.changeActivePage = () => {
        $scope.getEvents(($scope.page - 1) * $scope.limit, $scope.limit);
    }

    $scope.changeCompletedPage = () => {
        $scope.getCompletedEvents(($scope.page - 1) * $scope.limit, $scope.limit);
    }
    
    $scope.changeLimit = function() {
        $scope.limit = $scope.selectedSize.value.size;
        $scope.start = "0";
        $scope.page = 0;
        $scope.getEvents($scope.start, $scope.limit);
    }

    $scope.createNewEvent = () => {
        $location.path("/events/new");
    }

    $scope.editEvent = (id) => {
        $location.path("/events/edit/" + id);
    }

    /* Default call */
    $scope.getEvents($scope.start, $scope.limit);
    $scope.getCompletedEvents($scope.start, $scope.limit);
}