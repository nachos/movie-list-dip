'use strict';

angular.module('movieListApp')
  .controller('Settings', function ($scope, $timeout, $mdToast, $state) {
    $scope.config = {};

    var globalConfig = dipApi.global();
    var instance = dipApi.instance();

    globalConfig.get()
      .then(function (config) {
        $timeout(function () {
          $scope.config.global = config;
        });
      })
      .catch(function (err) {
        notify(err);
      });

    instance.get()
      .then(function (config) {
        $timeout(function () {
          $scope.config.instance = config;
        });
      })
      .catch(function (err) {
        notify(err);
      });

    instance.onChange(function (config) {
      $timeout(function () {
        $scope.config = config;
      });
    });

    $scope.fileChanged = function (ele) {
      $timeout(function () {
        if (!$scope.config.instance) {
          $scope.config.instance = {};
        }
        $scope.config.instance.directory = ele.files[0].path;
      });
    };

    $scope.save = function () {
      instance.save($scope.config.instance)
        .then(function () {
          notify('Changes saved!');

          $state.go('main');
        })
        .catch(function (err) {
          notify(err);
        });
    };

    function notify(msg) {
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('bottom right')
      );
    }
  });
