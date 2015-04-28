module.exports = ($scope, $state, $timeout, $http, me, promiseTracker) => {

  //window.me = me;
  $scope.me = me;

  $scope.loadingTracker = promiseTracker();

  $scope.states = $state.get()
    .filter((state) => {
      return !state.abstract;
    })
    .map((state) => {
      return {
        title: state.title,
        name:  state.name,
        url:   state.url
      };
    });

};
