const membersListController = ($scope, $http, toastr, $uibModal, $rootScope) => {
    $scope.limit = "5";
    $scope.start = "0";
    $scope.page = 1;
    $scope.maxSize = 5;

    $scope.getPendingMembers = () => {
        $http.get("/private/members/pending", HTTP_CONFIG).then((response) => {
            $scope.pendingMembers = response.data;
            console.log($scope.pendingMembers);
        }, (error) => {
            console.log(error);
        });
    }

    $scope.approveMembership = (id) => {
        $http.put("/private/members/approve/" + id, { }, HTTP_CONFIG).then(response => {
            toastr.success(response.data.message, "Successful approval");
            /* Repopulate the lists */
            $scope.getMembers($scope.start, $scope.limit);
            $scope.getPendingMembers();
        }, error => {
            toastr.error("There has been an error while approving the membership.", "Unknown error");
        });
    }

    $scope.getMembers = (start, limit) => {
        $http.get("/private/members/approved?start=" + start + "&limit=" + limit, HTTP_CONFIG).then((response) => {
            $scope.members = response.data.members;
            $scope.totalItems = response.data.numOfMembers;
        }, (error) => {
            console.log(error);
        });
    }

    /* Listen for membership updates */
    $rootScope.$on("membershipUpdate", (event, data) => {
            /* Repopulate the lists */
            $scope.getMembers($scope.start, $scope.limit);
            $scope.getPendingMembers();
    });
    

    $scope.openRejectModal = (data) => {
        let modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: "modal-title",
            ariaDescribedBy: "modal-body",
            templateUrl: "views/admin/modals/rejectMembership.html",
            controller: ($scope, $uibModalInstance, $http, data, $rootScope) => {
                $scope.member = data;
                $scope.rejectMembership = (member) => {
                    $http.delete("/private/members/" + member._id, HTTP_CONFIG).then(response => {
                        toastr.success(response.data.message, "Successful revocation.");
                        $uibModalInstance.close();
                        $rootScope.$emit("membershipUpdate", [ ]);
                    }, error => {
                        toastr.error("There has been an error while removing the member.", "Unknown error");
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
        $scope.getMembers(($scope.page - 1) * $scope.limit, $scope.limit);
    }
    
    $scope.changeLimit = function() {
        $scope.start = "0";
        $scope.page = 0;
        $scope.getMembers($scope.start, $scope.limit);
    }

    /* Default call */
    $scope.getMembers($scope.start, $scope.limit);
    $scope.getPendingMembers();
}