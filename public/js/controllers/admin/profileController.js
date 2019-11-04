const profileController = ($scope, $http, toastr) => {
    $scope.loading = false;
    $scope.passLoading = false;
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
        { id: 3, year: 3 }
    ];

    $scope.getProfile = () => {
        let token = jwt_decode(localStorage.getItem("admin_token"));
        $http.get("/private/profile/" + token._id, HTTP_CONFIG).then(response => {
            $scope.profile = response.data;
            /* Set year */
            for (let i = 0; i < $scope.departments.length; i++) {
                if (response.data.department == $scope.departments[i].name) {
                    $scope.selectedDepartment = { value: $scope.departments[i] };
                }
            }
            /* Set department */
            for (let i = 0; i < $scope.years.length; i++) {
                if (response.data.year == $scope.years[i].year) {
                    $scope.selectedYear = { value: $scope.years[i] };
                }
            }
            $scope.editableProfile = angular.copy(response.data);
        }, error => {
            console.log(error);
        });
    }

    $scope.updateProfile = () => {
        let token = jwt_decode(localStorage.getItem("admin_token"));
        $scope.loading = true;
        /* Take current category */
        $scope.editableProfile.department = $scope.selectedDepartment.value.name;
        $scope.editableProfile.year = $scope.selectedYear.value.year;
        /* Send update request */
        $http.put("/private/profile/" + token._id, $scope.editableProfile, HTTP_CONFIG).then(response => {
            $scope.loading = false;
            toastr.success(response.data.message, "Success");
            $scope.getProfile();
        }, error => {
            $scope.loading = false;
            toastr.error("There has been an error while updating your profile.", "Unknown error");
        });
    }

    $scope.updatePassword = () => {
        let token = jwt_decode(localStorage.getItem("admin_token"));
        $scope.passLoading = true;

        /* Check empty fields */
        if (!$scope.password || ($scope.password.new == '' || $scope.password.reNew == '' || $scope.password.old == '')) {
            toastr.error('The passwords cannot be empty.', "Empty password");
            $scope.passLoading = false;
            return;
        }
        
        /* Check matching passwords */
        if ($scope.password.new !== $scope.password.reNew) {
            toastr.error('The passwords do not match.', "Incorrect password");
            $scope.passLoading = false;
            return;
        }

        /* Send update request */
        $http.put("/private/profile/" + token._id + '/password', $scope.password, HTTP_CONFIG).then(response => {
            $scope.passLoading = false;
            toastr.success(response.data.message, "Success");
            // let controlNames = Object.keys($scope.passwordForm).filter(key => key.indexOf('$') !== 0);
            // for (let name of controlNames) {
            //     let control = form[name];
            //     control.$setViewValue(undefined);
            // }
            delete $scope.password; 
            $scope.passwordForm.$setPristine();
            $scope.passwordForm.$setUntouched();
        }, error => {
            $scope.passLoading = false;
            toastr.error(error.data.message, "Password update error");
        });
    }

    /* Defautl calls */
    $scope.getProfile();
}