'use strict';

angular.module('movieListApp')
  .controller('MovieList', function ($scope, $timeout, $log, $mdToast, $state, $q) {
    var movieList = require('movie-list');
    var movieInfo = require('movie-info');
    var _ = require('lodash');

    var sortMovies = function (movies) {
      return _.sortBy(movies, function (movie) {
        return movie.response.imdbRating;
      }).reverse();
    };

    var getBackdrop = function (chosenMovie) {
      if (!chosenMovie.backdrop) {
        $scope.loading = true;
        return $q.nfcall(movieInfo, chosenMovie.response.Title)
          .then(function (res) {
            chosenMovie.backdrop = "https://image.tmdb.org/t/p/w780" + res.backdrop_path;
            return $q.resolve();
          });
      }

      return $q.resolve();
    };

    $scope.initialLoading = true;

    $scope.chooseMovie = function (chosenMovie) {
      getBackdrop(chosenMovie)
        .then(function () {
          $timeout(function () {
            $scope.chosenMovie = chosenMovie;
            $scope.loading = false;
          });
        });
    };

    $scope.playChosen = function () {
      dipApi.system.open({path: $scope.chosenMovie.path});
    };

    var loadMovies = function () {
      if (!$scope.config.instance.directory) {
        $state.go('settings');
      }

      $scope.movies = [];
      $scope.loading = true;

      return movieList.listFolder($scope.config.instance.directory)
        .then(function (listData) {
          if (!listData.succeeded) {
            notify('Empty movie directory');

            $state.go('settings');
          }

          $timeout(function () {
            $scope.movies = sortMovies(listData.succeeded);

            var mostRanked = _.first($scope.movies);

            $scope.chooseMovie(mostRanked);
          });
        });
    };

    function notify(msg) {
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('bottom right')
      );
    }

    $scope.config = {};

    var globalConfig = dipApi.global();
    var instance = dipApi.instance();

    globalConfig.get()
      .then(function (config) {
        $scope.config.global = config;

        return instance.get()
          .then(function (config) {
            $scope.config.instance = config;
            return loadMovies()
              .then(function () {
                $scope.initialLoading = false;
              });
          });
      });

    instance.onChange(function (config) {
      $scope.config.instance = config;
      $timeout(function () {
        loadMovies()
          .then(function () {
            $scope.initialLoading = true;
          });
      });
    });

    globalConfig.onChange(function (config) {
      $scope.config.global = config;
      $timeout(function () {
        $scope.initialLoading = true;

        loadMovies()
          .then(function () {
            $scope.initialLoading = false;
          });
        notify('Global settings changed');
      });
    });
  });
