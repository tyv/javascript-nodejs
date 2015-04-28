var notification = require('client/notification');
var angular = require('angular');

angular.module('profile')
  .directive('orderParticipants', function(promiseTracker, $http, $timeout) {
    return {
      templateUrl: '/profile/templates/partials/orderParticipants',
      scope:       {
        order:       '='
      },
      replace:     true,
      link:        function(scope, element, attrs, noCtrl, transclude) {

        scope.participants = angular.copy(scope.order.participants);
        // add empty fields up to order.count
        while(scope.participants.length != scope.order.count) {
          scope.participants.push({
            accepted: false,
            email: ""
          });
        }

        scope.loadingTracker = promiseTracker();

        // returns true iff any of participants was removed
        function editingParticipantsRemoved(order) {
          var removedEmails = [];
          for (var i = 0; i < order.participants.length; i++) {
            var oldParticipant = order.participants[i];
            var wasRemoved = !scope.participants.some(function(newParticipant) {
              return newParticipant.email == oldParticipant.email;
            });
            if (wasRemoved) removedEmails.push(oldParticipant.email);
          }

          return removedEmails;
        }

        scope.submit = function() {
          if (this.participantsForm.$invalid) return;

          // if the order is paid, warn that removing participants is bad
          if (scope.order.status == 'success') {
            var removedEmails = editingParticipantsRemoved(scope.order);
            var isOk = confirm("Вы удалили участников, которые получили приглашения на курс: " + removedEmails + ".\nПри продолжении их приглашения станут недействительными.\nПродолжить?");

            if (!isOk) return;
          }

          var formData = new FormData();

          formData.append("orderNumber", scope.order.number);
          var emails = scope.participants.map(function(participant) {
            if (participant.accepted) return; // cannot modify accepted, server will give error if I try
            return participant.email;
          }).filter(Boolean);

          formData.append("emails", emails);

          $http({
            method:           'PATCH',
            url:              '/courses/order',
            tracker:          this.loadingTracker,
            headers:          {'Content-Type': undefined},
            transformRequest: angular.identity,
            data:             formData
          }).then((response) => {

            new notification.Success("Информация обновлена.");
            scope.order.participants = angular.copy(scope.participants);

          }, (response) => {
            if (response.status == 400) {
              new notification.Error(response.data.message);
            } else {
              new notification.Error("Ошибка загрузки, статус " + response.status);
            }
          });

        };



      }
    };

  });



