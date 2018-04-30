angular
	.module("ResearchersApp")
  .factory('httpRequestInterceptor', function ($rootScope) {
    return {
      request: function (config) {
        if (/api\/v1\/researchers.*/.test(config.url)) {
          config.headers['apikey'] = $rootScope.apikeyResearchers;
        }
        // else if (/api\/v1\/universities.*/.test(config.url)) {
        //   config.headers['apikey'] = $rootScope.apikeyUniversities;
        // }
        return config;
      }
    };
  })