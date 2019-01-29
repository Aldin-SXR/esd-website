const linksController = ($scope, $routeParams, $route) => {
	/* See if logged-in user */
	try {
        let token = jwt_decode(localStorage.getItem("user_token"));
        if (token) {
            $scope.authorized = true;
            $scope.name = token.name;
        }
    } catch (e) {
        $scope.authorized = false;
	}
	
	$scope.$route = $route;
	$scope.$on("$routeChangeSuccess", (event, current, previous) => {
		$scope.activeTab = current.$$route.activeTab;
    });
	
    $scope.status = {
        isOpen: false
    }
}