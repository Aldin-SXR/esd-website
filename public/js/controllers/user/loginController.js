const loginController = ($scope, $uibModal) => {
    $scope.openLoginModal = () => {
        let modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: "modal-title",
            ariaDescribedBy: "modal-body",
            templateUrl: "views/user/modals/loginModal.html",
            controller: ($scope, $uibModalInstance, $http, data) => {
                $scope.cancel = () => {
                    $uibModalInstance.dismiss("cancel");
                }
            },
            size: "lg",
            resolve: {
                data: () => {
                    return {

                    };
                }
            }
        });
    }
}