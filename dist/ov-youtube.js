(function(){

'use strict';

/**
 * Youtube IFrame Embed API Angular wrapper
 * For 'playerVars' see: https://developers.google.com/youtube/player_parameters?playerVersion=HTML5#Parameters
 */
angular.module('ov.directives', [])
    .constant('YT_STATUS', { // YOUTUBE Constants
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        VIDEO_CUED: 5
    })
    .constant('YT_EVENT', {
        STOP: 'yt_stop',
        PLAY: 'yt_play',
        PAUSE: 'yt_pause'
    })
    .constant('YT_ERROR', {
        INVALID_PARAM: 2,
        CANNOT_PLAY: 5,
        NOT_FOUND: 100,
        NOT_ALLOWED: [101, 150]
    })

    .directive('ovYoutube', ['$window', 'YT_STATUS', 'YT_EVENT', 'YT_ERROR', function ($window, YT_STATUS, YT_EVENT, YT_ERROR) {
        return {
            restrict: 'E',
            scope: {
                videoId: '@',
                height: '@',
                width: '@',
                autoplay: '@',
                autohide: '@',
                loop: '@',
                color: '@',
                controls: '@',
                iv_load_policy: '@', // jshint ignore:line
                fs: '@',
                showinfo: '@',
                modestbranding: '@',
                theme: '@',
                onStatusChanged: '&',
                onError: '&'
            },
            template: '<div></div>',
            link: function (scope, element /*, attrs, controller*/) {
                var player,
                    tag = document.createElement('script'),
                    scriptTag = document.getElementsByTagName('script')[0];

                tag.src = 'https://www.youtube.com/iframe_api';
                scriptTag.parentNode.insertBefore(tag, scriptTag);

                $window.onYouTubeIframeAPIReady = function () {
                    player = new YT.Player(element.children()[0], {
                        videoId: scope.videoId,
                        height: scope.height,
                        width: scope.width,
                        playerVars: {
                            autoplay: (scope.autoplay) ? 1 : 0,
                            autohide: scope.autohide,
                            loop: scope.loop || 0,
                            color: scope.color,
                            controls: scope.controls,
                            iv_load_policy: scope.iv_load_policy, // jshint ignore:line
                            fs: scope.fs,
                            showinfo: scope.showinfo,
                            modesbranding: scope.modesbranding,
                            theme: scope.theme,
                            html5: 1
                        },
                        events: {
                            'onError': function (event) {
                                var o = {
                                    error: ''
                                };
                                if (YT_ERROR.NOT_ALLOWED.indexOf(event.data) !== -1) {
                                    o.error = YT_ERROR.NOT_ALLOWED;
                                } else {
                                    switch (event.data) {
                                        case YT_ERROR.NOT_FOUND:
                                            o.error = YT_ERROR.NOT_FOUND;
                                            break;
                                        case YT_ERROR.CANNOT_PLAY:
                                            o.error = YT_ERROR.CANNOT_PLAY;
                                            break;
                                        case YT_ERROR.INVALID_PARAM:
                                            o.error = YT_ERROR.INVALID_PARAM;
                                            break;
                                    }
                                }
                                scope.onError(o);
                            },
                            'onStateChange': function (event) {
                                var o = {
                                    status: ''
                                };
                                switch (event.data) {
                                    case YT.PlayerState.ENDED:
                                        o.status = YT_STATUS.ENDED;
                                        break;
                                    case YT.PlayerState.PLAYING:
                                        o.status = YT_STATUS.PLAYING;
                                        break;
                                    case YT.PlayerState.PAUSED:
                                        o.status = YT_STATUS.PAUSED;
                                        break;
                                    case YT.PlayerState.UNSTARTED:
                                        o.status = YT_STATUS.UNSTARTED;
                                        break;
                                    case YT.PlayerState.BUFFERING:
                                        o.status = YT_STATUS.BUFFERING;
                                        break;
                                    case YT.PlayerState.CUED:
                                        o.status = YT_STATUS.VIDEO_CUED;
                                        break;
                                }
                                scope.onStatusChanged(o);
                            }
                        }
                    });
                };

                scope.$watch('height + width', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    player.setSize(scope.width, scope.height);
                });

                scope.$watch('videoId', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    player.cueVideoById(scope.videoid);
                });

                scope.$on(YT_EVENT.STOP, function () {
                    player.seekTo(0);
                    player.stopVideo();
                });

                scope.$on(YT_EVENT.PLAY, function () {
                    player.playVideo();
                });

                scope.$on(YT_EVENT.PAUSE, function () {
                    player.pauseVideo();
                });
            }
        };
    }]);

})();