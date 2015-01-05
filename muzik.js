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
		this.drawFunc = null;

		this._init(opts);
	};

	Muzik.prototype = {
		_init: function (opts) {
			var self = this,
				inputFile = document.querySelector(opts.input),
				dragFile = document.querySelector(opts.drag);
			self.canvas = document.querySelector(opts.canvas);
			self.drawOpts = self._initDraw(opts.draw_conf);
			self.drawFunc = self._initDrawFunc(opts.draw_conf.type);

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
			
			this._render(analyser, this.drawOpts, this.drawFunc);
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

		_initDraw: function(opts){
			var canvas = self.canvas,
				w = canvas.width,
				h = canvas.height,
				ctx = canvas.getContext('2d'),
				gradient;

			if (opts.type == 'histogram') {
				var g = opts.grad;
				gradient = ctx.createLinearGradient(0, 0, 0, h);
				for (var i = 0; i < g.length; i++) {
					gradient.addColorStop(i/(g.length-1), g[i]);
				}
			}

			return this.extend({
				w: w,
				h: h,
				ctx: ctx,
				gradient: gradient,
			},opts);
		},

		/**
		 *  ==========Draw Function==========
		**/
		_initDrawFunc: function(type){
			var drawMap= {
				'histogram': this.draw_histogram,
				'pie': this.draw_pie,
			};
			return drawMap[type];
		},

		draw_pie: function(buffer, opt){
			var w = opt.w,
				h = opt.h,
				ctx = opt.ctx,
				gradient = opt.gradient,
				color = opt.color,
				lineWidth = opt.lineWidth,
				gap = opt.gap,
				x = w/2,
				y = h/2,
				R = x<y?x-lineWidth:y-lineWidth,
				r = buffer[10]%R;
			ctx.clearRect(0, 0, w, h);

			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(x+r,y);
			ctx.arc(x,y,r,0,2*Math.PI,true);
			ctx.closePath();
			ctx.fill();

			ctx.strokeStyle = color;
			ctx.lineWidth = lineWidth;
			ctx.beginPath();
			ctx.moveTo(x+r+gap,y);
			ctx.arc(x,y,r+gap,0,2*Math.PI,true);
			ctx.closePath();
			ctx.stroke();
		},

		draw_histogram: function(buffer, opt){
			var w = opt.w,
				h = opt.h,
				ctx = opt.ctx,
				gradient = opt.gradient,
				meterWidth = opt.meterWidth,
				capHeight = opt.capHeight,
				capStyle = opt.capStyle,
				gap = opt.gap,
				meterNum = w / (meterWidth+gap),
				capYPositionArray = [],
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

		extend: function(){
			var argv = [];
			for (var i = 0; i < arguments.length; i++) {
				argv.push(arguments[i]);
			}
			if (typeof argv[0] === 'string') {
				return argv.join('');
			}
			else if (typeof argv[0] === 'object') {
				if ('concat' in argv[0]) {
					return argv.reduce(function(a,b){
						return a.concat(b);
					});
				}
				return argv.reduce(function(a,b){
					Object.keys(b).map(function(i){
						a[i] = b[i];
					});
					return a;
				});
			}
			else {
				throw new Error('can not be extend');
			};
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