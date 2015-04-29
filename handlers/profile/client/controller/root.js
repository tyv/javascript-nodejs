module.exports = ($scope, $state, $timeout, $http, me, promiseTracker) => {

  //window.me = me;
  $scope.me = me;

  $scope.loadingTracker = promiseTracker();

  var tabs = ['root.aboutme', 'root.account'];
  window.currentUser.profileTabsEnabled.forEach(function(tab) {
    tabs.push('root.' + tab);
  });

  $scope.tabs = tabs.map((stateName) => {
    var state = $state.get(stateName);
    return {
      title: state.title,
      name:  state.name,
      url:   state.url
    };
  });

};
