angular
	.module("ResearchersApp")
	.controller("DepartmentsCtrl", function ($scope, $rootScope, $http, $compile) {

		// API functions

		$scope.getDepartment = function () {
			$http.get("api/v1/departments/"+$scope.departmentName)
				.then(function (response) {
					$scope.department = response.data;
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorDepartmentsModal').modal('show');
				});
		}

		// The following function calls the API and fills datalist with all departments on success
		$scope.getDepartments = function () {
			$http.get("api/v1/departments")
				.then(function (response) {
					// debugger
					$scope.departments = response.data.map(department => {
						return department.groupName;
					})
					var datalist = $compile('\
						<option value="{{departmentItem}}" ng-repeat="departmentItem in departments"></option>'
					)($scope);
					$('#departmentName').append(datalist);
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorDepartmentsModal').modal('show');
				});
		}

		// Auxiliary variables
		$scope.departmentName = '';

		// Get departments on controller start, so as to show them while searching in the input box
		$scope.getDepartments();
	});
