const contactController = ($scope, $http, toastr) => {
    $scope.loading = false;
    $scope.contactData = { };
    try {
        let token = jwt_decode(localStorage.getItem("user_token"));
        if (token) {
            $scope.contactData.email_address = token.email_address;
            $scope.contactData.name = token.name;
        }
    } catch (e) {
        console.log(e);
    }

    $scope.sendMessage = () => {
        $scope.loading = true;
        $http.post("/contact", $scope.contactData).then(response => {
            $scope.loading = false;
            toastr.success(response.data.message, "Success");
            $scope.contactData.subject = "";
            $scope.contactData.message = "";
        }, error => {
            $scope.loading = false;
            toastr.error(error.data.message, "Unknown error");
        });
    }
}