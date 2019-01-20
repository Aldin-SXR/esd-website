const linksController = ($scope, $routeParams, $route) => {
    $scope.$route = $route;
    $scope.$on("$routeChangeSuccess", (event, current, previous) => {
      $scope.activeTab = current.$$route.activeTab;
    });
}