const loginController = ($scope, $uibModal, toastr) => {
    $scope.openLoginModal = () => {
        let modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: "modal-title",
            ariaDescribedBy: "modal-body",
            templateUrl: "views/user/modals/loginModal.html",
            controller: ($scope, $uibModalInstance, $http, data) => {
                $scope.loginData = { };
                $scope.loading = false;
                $scope.cancel = () => {
                    $uibModalInstance.dismiss("cancel");
                }
                /* Log in controller */
                $scope.logIn = () => {
                    $scope.loading = true;
                    $http.post("/login", $scope.loginData).then(response => {
                        toastr.success(response.data.message, "Successful log in");
                        $scope.loading = false;
                        localStorage.setItem("user_token", response.data.token);
                        /* Appropriate redirect based on user type */
                        if (response.data.superuser) {
                            window.location.href = "admin.html";
                        }
                    }, error => {
                        toastr.error(error.data.message, "Error " + error.status);
                        $scope.loading = false;
                    });
                }
            },
            size: "md",
            resolve: {
                data: () => {
                    return {

                    };
                }
            }
        }).result.then(function () { }, function (res) { });
    }
}