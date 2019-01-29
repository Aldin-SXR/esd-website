const adminLinksController = ($scope, $rootScope, $route, $location, $window) => {
	$scope.toggleNavigation = () => {
		$rootScope.$emit("openDrawer", true);
	}

	$scope.closeNavigation = () => {
		$rootScope.$emit("openDrawer", false);
	}

	$scope.$route = $route;
	$scope.$on("$routeChangeSuccess", (event, current, previous) => {
		$scope.activeTab = current.$$route.activeTab;
		$scope.closeNavigation();
	});

	$scope.getMemberTitle = () => {
		let decoded_token = jwt_decode(localStorage.getItem("admin_token"));
		return decoded_token.name;
	}

	$scope.logOut = () => {
		localStorage.removeItem("admin_token");
		window.location.href = "index.html";
	}

	$scope.goToProfile = () => {
		$location.path("/profile");
		$window.scrollTo(0, 0);
	}
}