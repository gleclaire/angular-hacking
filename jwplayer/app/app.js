'use strict';

var myApp = angular.module('myApp', ['ng-jwplayer', 'nvd3', 'rzModule', 'ui.bootstrap']);

myApp.controller('mainController', ['$scope', '$log', '$sce', 'jwplayerService', 'ResourceService',
    function ($scope, $log, $sce, jwplayerService, ResourceService) {

        $scope.name1 = 'JWPlayer Player 1';


        $scope.high_eq_slider = {
            value: 0,
            options: {
                floor: -40,
                ceil: 40,
                step: 1,
                showTicks: true,
                onChange: function () {
                    $scope.onSliderChange('high_eq_slider');
                }
            }
        };

        $scope.mid_eq_slider = {
            value: 0,
            options: {
                floor: -40,
                ceil: 40,
                step: 1,
                showTicks: true,
                onChange: function () {
                    $scope.onSliderChange('mid_eq_slider');
                }
            }
        };

        $scope.low_eq_slider = {
            value: 0,
            options: {
                floor: -40,
                ceil: 40,
                step: 1,
                showTicks: true,
                onChange: function () {
                    $scope.onSliderChange('low_eq_slider');
                }
            }
        };

        $scope.gain_slider = {
            value: 3,
            options: {
                floor: 0,
                ceil: 10,
                step: 1,
                showTicks: true,
                onChange: function () {
                    $scope.onSliderChange('gain');
                }
            }
        };


        $scope.options1 = {
            type: 'mp4'
        };

        // Bar Chart
        // discreteBarChart for type
        // discretebar for dispatch event
        //
        // Line Chart
        // lineChart for type
        // lines for dispatch event
        //
        $scope.barOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 55
                },
                x: function(d) { return d.x; },
                y: function(d){return d.y; },
                showValues: false,
                valueFormat: function(d){return d3.format(',.4f')(d);},
                transitionDuration: 1,
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e){ console.log("stateChange"); },
                    changeState: function(e){ console.log("changeState"); },
                    tooltipShow: function(e){ console.log("tooltipShow"); },
                    tooltipHide: function(e){ console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: '',
                    showMaxMin: false,
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }
                },
                yAxis: {
                    axisLabel: '',
                    axisLabelDistance: 30
                },
                callback: function(chart){
                    console.log("!!! lineChart callback !!!");
                },
                lines: {
                    dispatch: {
                        elementClick: function(e){ $scope.graphClick(e) }
                    }
                }

            }
        };

        $scope.barConfig = {
            visible: true, // default: true
            extended: false, // default: false
            disabled: false, // default: false
            refreshDataOnly: true, // default: true
            deepWatchOptions: true, // default: true
            deepWatchData: true, // default: true
            deepWatchDataDepth: 1, // default: 2
            debounce: 10 // default: 10
        };

        // file:///Users/garvin/Downloads/HLM/2_big_buck_bunnies.txt
        $scope.graphData = [{
            key: "Cumulative Return",
            values: [
                { "x" : 1 , "y" : 29.765957771107 },
                { "x" : 2 , "y" : 0 },
                { "x" : 3 , "y" : 32.807804682612 },
                { "x" : 4 , "y" : 196.45946739256 },
                { "x" : 5 , "y" : 0.19434030906893 },
                { "x" : 6 , "y" : 98.079782601442 },
                { "x" : 7 , "y" : 13.925743130903 },
                { "x" : 8 , "y" : 5.1387322875705 }
            ]
        }];


        $scope.file1 = $sce.trustAsResourceUrl('https://s3.amazonaws.com/hlm-vms-dev/videos/4309_Demo_Human_SRT.mp4');

        $scope.$on('ng-jwplayer-ready', function(event, args) {

            $log.info('Player ' + args.playerId + ' ready. Playing video');

            $scope.audioInit();

            $scope.player = jwplayerService.myPlayer[args.playerId];
            $scope.player.play(true);
        });

        $scope.graphClick = function (e) {

            //Bar Chart
            // var time = e.data.x;

            //Line Chart
            var time = e[0].pointIndex;

            console.log('click at ' + time + ' sec');

            $scope.player.seek(time);

        };

        $scope.audioInit = function () {
            $scope.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            $scope.playerElement = document.getElementById('jwplayer');
            // var renderingMode = playerElement.getRenderingMode();

            $scope.audioElement = $scope.playerElement.getElementsByTagName('video')[0];
            $scope.audioElement.crossOrigin = "anonymous";

            $scope.audioSrc = $scope.audioCtx.createMediaElementSource($scope.audioElement);
            $scope.audioSrc.crossOrigin = "anonymous";

            $scope.gainNode = $scope.audioCtx.createGain();
            $scope.low_eq = $scope.audioCtx.createBiquadFilter();
            $scope.mid_eq = $scope.audioCtx.createBiquadFilter();
            $scope.high_eq = $scope.audioCtx.createBiquadFilter();
            $scope.analyser = $scope.audioCtx.createAnalyser();

            // Bind our analyser to the media element source.
            $scope.audioSrc.connect($scope.gainNode);
            $scope.gainNode.connect($scope.low_eq);
            $scope.low_eq.connect($scope.mid_eq);
            $scope.mid_eq.connect($scope.high_eq);
            $scope.high_eq.connect($scope.analyser);
            $scope.analyser.connect($scope.audioCtx.destination);

            $scope.audioSrc.connect($scope.gainNode);

            $log.info('recovered frequencyData ');

            // Set the gain node
            // $scope.gainNode.gain.value = 10.0;
            $scope.gainNode.gain.value = $scope.gain_slider.value;

            // Manipulate the Biquad filter
            /* low EQ */
            $scope.low_eq.type = "peaking";
            $scope.low_eq.frequency.value = 120;
            $scope.low_eq.Q.value = 1.5;
            // $scope.low_eq.gain.value = 1.0;
            $scope.low_eq.gain.value = $scope.low_eq_slider.value;

            /* mid EQ */
            $scope.mid_eq.type = "peaking";
            $scope.mid_eq.frequency.value = 4000;
            $scope.mid_eq.Q.value = 1.5;
            // $scope.mid_eq.gain.value = 1.0;
            $scope.mid_eq.gain.value = $scope.mid_eq_slider.value;

            /* high EQ */
            $scope.high_eq.type = "peaking";
            $scope.high_eq.frequency.value = 8000;
            $scope.high_eq.Q.value = 1.5;
            // $scope.high_eq.gain.value = 1.0;
            $scope.high_eq.gain.value = $scope.high_eq_slider.value;

            /* Analyser settings */
            $scope.analyser.smoothingTimeConstant = "0.25"; // not much smoothing
            $scope.analyser.fftSize = 512;
            $scope.analyser.maxDecibels = 0;
            // $scope.frequencyData = new Uint8Array($scope.analyser.frequencyBinCount);

            // $scope.analyser.getByteFrequencyData($scope.frequencyData);

            $scope.canvas = document.getElementById("analyser_canvas");
            $scope.draw_ctx = $scope.canvas.getContext('2d');

            $scope.updateAnalysers();

        };

        $scope.onSliderStart = function () {
        };


        $scope.onSliderEnd = function () {
        };

        $scope.formatDuration = function (value) {
        };

        $log.info('All Set...');

        $scope.onSliderChange =  function(type) {
            console.info('type of slider change is ' + type);

            if (type == 'gain') {
                $scope.gainNode.gain.value = $scope.gain_slider.value;
            } else if (type == 'high_eq_slider') {
                $scope.high_eq.gain.value = $scope.high_eq_slider.value;
            } else if (type == 'mid_eq_slider') {
                $scope.mid_eq.gain.value = $scope.mid_eq_slider.value;
            } else if (type == 'low_eq_slider') {
                $scope.low_eq.gain.value = $scope.low_eq_slider.value;
            }
        };


        $scope.updateAnalysers = function(time) {
            var rAF = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame;
            rAF( $scope.updateAnalysers );

            // $scope.updateAnalyser($scope.analyser);
            // $scope.updateBarChart($scope.analyser);
            $scope.updateAnalyser($scope.analyser);
        };


        $scope.updateAnalyser =function(a){
            var SPACER_WIDTH = 1;
            var BAR_WIDTH = 1;
            var OFFSET = 100;
            var CUTOFF = 23;
            var ctx = $scope.draw_ctx;
            var canvas = ctx.canvas;

            var canvasWidth = canvas.offsetWidth;
            var canvasHeight = canvas.offsetHeight;

            var numBars = Math.round(canvasWidth / SPACER_WIDTH);
            var freqByteData = new Uint8Array(a.frequencyBinCount);
            // var freqByteData = new Float32Array(a.frequencyBinCount);

            a.getByteFrequencyData(freqByteData);
            // a.getFloatFrequencyData(freqByteData);
            // a.getByteTimeDomainData(freqByteData);
            // a.getFloatTimeDomainData(freqByteData);

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = '#F6D565';
            ctx.lineCap = 'round';
            var multiplier = a.frequencyBinCount / numBars;

            // Draw rectangle for each frequency bin.
            for (var i = 0; i < numBars; ++i) {
                var magnitude = 0;
                var offset = Math.floor( i * multiplier );
                // gotta sum/average the block, or we miss narrow-bandwidth spikes
                for (var j = 0; j< multiplier; j++)
                    magnitude += freqByteData[offset + j];
                magnitude = magnitude / multiplier;
                var magnitude2 = freqByteData[i * multiplier];
                ctx.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
                ctx.fillRect(i * SPACER_WIDTH, canvasHeight, BAR_WIDTH, -magnitude);
            }
        };

        $scope.updateBarChart =function(a){
            var SPACER_WIDTH = 1;
            var BAR_WIDTH = 1;
            var CHART_WIDTH = 300;

            // var numBars = Math.round(CHART_WIDTH / SPACER_WIDTH);
            var numBars = a.frequencyBinCount;
            var freqByteData = new Uint8Array(a.frequencyBinCount);

            a.getByteFrequencyData(freqByteData);
            // a.getByteTimeDomainData(freqByteData);

            var multiplier = a.frequencyBinCount / numBars;

            var data = [{
                key: "updateBarChart",
                values: []
            }];


            // Draw rectangle for each frequency bin.
            for (var i = 0; i < numBars; ++i) {
                if (i == numBars) {
                    console.log('damn it i is ' + i)
                }
                var magnitude = 0;
                var offset = Math.floor( i * multiplier );
                // gotta sum/average the block, or we miss narrow-bandwidth spikes
                magnitude = freqByteData[offset];
                magnitude = magnitude / multiplier;
                data[0].values.push({ "series": 0, "x": i , "y": magnitude });
            }

            $scope.graphData = data;


            // $scope.api.refresh();

        };

        $scope.loadWaves = function() {
            ResourceService.getGraphData().then(function (response) {
                $scope.graphData = response.data;
            });
        };

        $scope.loadWaves();


    }])
    .service('ResourceService', function ($http, $sce) {

        var baseUrl = 'https://api.github.com/users/';

        this.getGraphData = function (username) {
            if (typeof username == 'undefined') {
                username = null;
            }
            var url = 'https://s3.amazonaws.com/hlm-vms-dev/videos/4309_Demo_Human_SRT.json';
            return $http.get(url, {});
        };


    })
;
