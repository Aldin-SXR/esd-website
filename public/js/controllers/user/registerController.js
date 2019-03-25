const registerController = ($scope, $uibModal, toastr) => {
    $scope.openRegisterModal = (registerData) => {
        let modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: "modal-title",
            ariaDescribedBy: "modal-body",
            templateUrl: "views/user/modals/registerModal.html",
            controller: ($scope, $uibModalInstance, $http, data) => {
                $scope.registerData = data.registerData;

                $scope.departments = [
                    { id: 1, name: "Electrical And Electronics Engineering" },
                    { id: 2, name: "Information Technologies" },
                    { id: 3, name: "Genetics and Bioengineering" },
                    { id: 4, name: "Architecture" },
                    { id: 5, name: "Civil Engineering" }
                ];
            
                $scope.years = [
                    { id: 1, year: 1 },
                    { id: 2, year: 2 },
                    { id: 3, year: 3 },
                    { id: 4, year: 'Alumni' }
                ];
            
                $scope.selectedDepartment = { value: $scope.departments[0] };
                $scope.selectedYear = { value: $scope.years[0] };

                $scope.checkForInstitution = (item) => {
                    if (item.year === 'Alumni') {
                        $scope.askForInstitution = true;
                    } else {
                        $scope.askForInstitution = false;
                    }
                }
                
                $scope.loading = false;
                $scope.cancel = () => {
                    $uibModalInstance.dismiss("cancel");
                }
                /* Sign up controller */
                $scope.signUp = () => {
                    $scope.registerData.department = $scope.selectedDepartment.value.name;
                    $scope.registerData.year = $scope.selectedYear.value.year;
                    $scope.loading = true;
                    $http.post("/register", $scope.registerData).then(response => {
                        toastr.success(response.data.message, "Successful registration");
                        $scope.loading = false;
                        $scope.cancel();
                    }, error => {
                        toastr.error(error.data.message, "Unsuccessful registration");
                        $scope.loading = false;
                    });
                }
            },
            size: "lg",
            resolve: {
                data: () => {
                    return {
                        registerData: registerData
                    };
                }
            }
        }).result.then(function () { }, function (res) { });
    }
}