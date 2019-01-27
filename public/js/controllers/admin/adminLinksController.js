const adminLinksController = ($scope, $rootScope, $route) => {
	$scope.$route = $route;
	$scope.$on("$routeChangeSuccess", (event, current, previous) => {
		$scope.activeTab = current.$$route.activeTab;
	});

	$scope.getMemberTitle = () => {
		let decoded_token = jwt_decode(localStorage.getItem("user_token"));
		return decoded_token.name;
	}
}