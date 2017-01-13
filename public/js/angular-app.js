var myApp = angular.module('myApp', ['ngRoute']);
myApp.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "views/login.html"
    })
    .when("/login", {
      templateUrl: "views/login.html"
    })
    .when("/list", {
      templateUrl: "views/list.html"
    });
});

myApp.run(['$rootScope', '$location', function ($rootScope, $location) {
//  $rootScope.user = 'No user';
var myElement = angular.element( document.querySelector( '#mainuser' ) ).html();
  //console.log(myElement);
  $rootScope.user = myElement;
//  console.log($rootScope.user);
  $rootScope.$on('$routeChangeStart', function (event) {
   // debugger;
    if ($rootScope.user) {
      $location.path('/list');
    }else{
      $location.path('/login');
		
	}
  });
}]);

myApp.controller('AppCtrl', ['$scope', '$http', function ($scope, $http) {
  console.log("Hello World from controller");


  var refresh = function () {
    $http.get('/users').success(function (response) {
      console.log("I got the data I requested");
      $scope.contactlist = response;
      $scope.contact = "";
    });
  };

  refresh();

  $scope.addContact = function () {
    console.log($scope.contact);
    $http.post('/contactlist', $scope.contact).success(function (response) {
      console.log(response);
      refresh();
    });
  };

  $scope.remove = function (id) {
    console.log(id);
    $http.delete('/users/id/' + id).success(function (response) {
      refresh();
    });
  };

  $scope.edit = function (id) {
    console.log(id);
    $http.get('/users/id/' + id).success(function (response) {
      $scope.contact = response;
    });
  };

  $scope.update = function () {
    console.log($scope.contact._id);
    $http.put('/users/id/' + $scope.contact._id, $scope.contact).success(function (response) {
      refresh();
    })
  };

  $scope.deselect = function () {
    $scope.contact = "";
  }

}]);