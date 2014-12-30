/* Muzik.js 0.9.0, @license MIT, (c) 2014 Eular */
~function (){
	"use strict";

	var Muzik = function (opts){
		this.file = null;
		this.audioContext = null;
		this.source = null;
		this.canvas = null;
		this.opts = opts;
		this.drawOpts = {};

		this._init(opts);
	};

	Muzik.prototype = {
		_init: function (opts) {
			var self = this,
				inputFile = document.querySelector(opts.input),
				dragFile = document.querySelector(opts.drag);
			self.canvas = document.querySelector(opts.canvas);
			self.drawOpts = self._initDraw();

			if (!self.isAudioContextSupported()) {
				return false;
			}
			
			self.audioContext = new window.AudioContext();
			// Bind Event
			self.inputEventBind(inputFile, function(file){
				self.file = file;
				self._start();
			});
			self.dragEventBind(dragFile, function(file){
				self.file = file;
				self._start();
			});
		},

		_start: function(){
			var self = this,
				audioContext = self.audioContext,
				fr = new FileReader();

			fr.onload = function(e){
				var fileResult = e.target.result;

				audioContext.decodeAudioData(
					fileResult,
					function(buffer){
						self._initRender(audioContext,buffer);
					},
					function(e){
						console.log('Decode failed');
					});
			};

			fr.readAsArrayBuffer(self.file);
		},

		_initRender: function(audioContext, buffer){
			var audioBufferSourceNode = audioContext.createBufferSource(),
				analyser = audioContext.createAnalyser();

			audioBufferSourceNode.connect(analyser);
			analyser.connect(audioContext.destination);

			audioBufferSourceNode.buffer = buffer;
			audioBufferSourceNode.start(0);
			
			this._render(analyser, this.drawOpts, this._draw);
		},

		_render: function(analyser, opt, draw){
			var loopFunc = function(){
				var array =new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);

				draw(array, opt);

				requestAnimationFrame(loopFunc);
			};
			requestAnimationFrame(loopFunc);
		},

		_initDraw: function(){
			var canvas = self.canvas,
				w = canvas.width,
				h = canvas.height-2,
				meterWidth = 10,
				gap = 2,
				capHeight = 2,
				capStyle = '#fff',
				meterNum = w/(meterWidth+gap),
				capYPositionArray = [],
				ctx = canvas.getContext('2d'),
				gradient = ctx.createLinearGradient(0, 0, 0, h);

			gradient.addColorStop(1, '#0f0');
			gradient.addColorStop(0.5, '#ff0');
			gradient.addColorStop(0, '#f00');

			return {
				w: w,
				h: h,
				meterWidth: meterWidth,
				capHeight: capHeight,
				capStyle: capStyle,
				meterNum: meterNum,
				capYPositionArray: capYPositionArray,
				ctx: ctx,
				gradient: gradient,
			};
		},

		_draw: function(buffer, opt){
			var w = opt.w,
				h = opt.h,
				meterWidth = opt.meterWidth,
				capHeight = opt.capHeight,
				capStyle = opt.capStyle,
				meterNum = opt.meterNum,
				capYPositionArray = opt.capYPositionArray,
				ctx = opt.ctx,
				gradient = opt.gradient,
				step = Math.round( buffer.length/meterNum );
			ctx.clearRect(0, 0, w, h);

			for (var i = 0; i < meterNum; i++) {
				var value = buffer[i*step];
				
				if (capYPositionArray.length<Math.round(meterNum)) {
					capYPositionArray.push(value);
				};
				
				ctx.fillStyle = capStyle;
				if(value < capYPositionArray[i]){
					ctx.fillRect(i*12, h - (--capYPositionArray[i]), meterWidth,capHeight);
				}
				else{
					ctx.fillRect(i*12, h-value, meterWidth,capHeight);
					capYPositionArray[i]=value;
				}
				ctx.fillStyle=gradient;
				ctx.fillRect(i*12, h-value+capHeight, meterWidth, h);
			};
		},

		/**
		 *  ==========Public Method==========
		**/
		inputEventBind: function(obj,func){
			var events = {
				'change': function(){
					if (this.files.length !== 0) {
						func(this.files[0]);
					}
				},
			};
			for (var ev in events) {
				obj.addEventListener(ev, events[ev], false);
			}
		},

		dragEventBind: function(obj,func){
			var events = {
				'dragenter': function(){
					console.log('Drop it on the page');
				},
				'dragover': function(e){
					e.stopPropagation();
					e.preventDefault();
					e.dataTransfer.dropEffect = 'copy';
				},
				'drop': function(e){
					console.log('Drop down');
					e.stopPropagation();
					e.preventDefault();
					func(e.dataTransfer.files[0]);
				},
			};
			for (var ev in events) {
				obj.addEventListener(ev, events[ev], false);
			}
		},

		isAudioContextSupported: function(){
			// API Compatible Support
			window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
			window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
			// Check API
			try{
				var tmp = new window.AudioContext();
			}
			catch(e){
				console.log('Your browser does not support AudioContext!');
				return false;
			}
			return true;
		},

		// To Do
		loadSound: function(url){
			var xhr = new XMLHttpRequest();
			xhr.open('GET',url,true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function(){
				var arraybuffer = xhr.response;
			};
			xhr.send();
		},
	};

	if (typeof exports === 'object') {
		// CommonJS support
		module.exports = Muzik;
	}
	else if (typeof define === 'function' && define.amd) {
		// support AMD
		define(function() { return Muzik; });
	}
	else {
		// support browser
		window.Muzik = Muzik;
	}

}();