const pageController = ($scope) => {
    $scope.pageLoaded = false;
    angular.element(document).ready(() => {
        $scope.pageLoaded = true;
    });
}