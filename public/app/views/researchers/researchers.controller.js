angular
	.module("ResearchersApp")
	.controller("ResearchersCtrl", function ($scope, $rootScope, $http) {

		function refresh() {
			$http.get("api/v1/researchers")
				.then(function (response) {
					$scope.researchers = response.data;
					$scope.copyResearchers = angular.copy($scope.researchers);
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		// API functions

		$scope.getResearchers = function () {
			$http.get("api/v1/researchers")
				.then(function (response) {
					$scope.researchers = response.data;
					$scope.copyResearchers = angular.copy($scope.researchers);
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		$scope.getResearcher = function () {
			$http.get("api/v1/researchers/"+$scope.currentOrcid)
				.then(function (response) {
					$scope.researchers = [];
					$scope.researchers[0] = response.data;
					$scope.copyResearchers = angular.copy($scope.researchers);
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		$scope.addResearcher = function () {
			$http
				.post("/api/v1/researchers", $scope.newResearcher)
				.then(function () {
					refresh();
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		$scope.modifyResearcher = function (orcid) {
			var researcher = _.find(angular.copy($scope.researchers), {'ORCID': orcid});
			delete researcher.ORCID;
			$http
				.put("/api/v1/researchers/"+orcid, researcher)
				.then(function () {
					refresh();
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		$scope.deleteResearcher = function (orcid) {
			var researcher = _.find($scope.researchers, {'ORCID': orcid});
			$http
				.delete("/api/v1/researchers/"+orcid)
				.then(function () {
					refresh();
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		$scope.deleteAllResearchers = function () {
			$http
				.delete("/api/v1/researchers")
				.then(function () {
					refresh();
				})
				.catch(function (error) {
					console.log(error);
					$scope.errorReturned = error;
					$('#errorResearchersModal').modal('show');
				});
		}

		// Auxiliary variables and functions to control UI

		$rootScope.apikeyResearchers = '';

		$scope.selectResearcher = function(researcher) {
			$scope.selectedResearcher = researcher;
		}
		$scope.deleteProject = function(projectIndex, isNewResearcher) {
			if (!isNewResearcher) {
				var researcherIndex = _.findIndex($scope.researchers, { 'ORCID': $scope.selectedResearcher.ORCID });
				$scope.researchers[researcherIndex].projects.splice(projectIndex, 1);
			} else {
				$scope.newResearcher.projects.splice(projectIndex, 1);
			}
		}
		$scope.addProject = function (isNewResearcher) {
			if (!isNewResearcher) {
				var researcherIndex = _.findIndex($scope.researchers, {'ORCID': $scope.selectedResearcher.ORCID});
				$scope.researchers[researcherIndex].projects.push('');
			} else {
				$scope.newResearcher.projects.push('');
			}
		}

		$scope.showEditFields = false;
		$scope.toggleEditFields = function () {
			$scope.showEditFields = !$scope.showEditFields;
		};
		$scope.hideEditFields = function () {
			$scope.showEditFields = false;
		};

		$scope.closeAddResearcherModal = function () {
			$('#addResearcherModal').modal('hide');
		}

	});
