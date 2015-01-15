/* Muzik.js 0.9.0, @license MIT, (c) 2014 Eular */
~function (){
	"use strict";

	var $ = function(ele){
		return document.querySelector(ele);
	};

	var Muzik = function (opts){
		this.file = null;
		this.audioContext = null;
		this.source = null;
		this.canvas = null;
		this.opts = opts;
		this.drawOpts = {};
		this.drawFunc = null;
		this.sourceNode = null;

		this._init(opts);

		// seal self to prevent add new property
		Object.seal(this);
	};

	Muzik.prototype = {
		_init: function (opts) {
			var self = this,
				inputFile = $(opts.input),
				dragFile = $(opts.drag),
				loadFile = opts.load;
			self.canvas = $(opts.canvas);
			self.drawOpts = self._initDraw(opts.draw_conf);
			self.drawFunc = self._initDrawFunc(opts.draw_conf.type);

			if (!self.isAudioContextSupported()) {
				return false;
			}
			
			self.audioContext = new window.AudioContext();
			// Bind Event
			inputFile && self.inputEventBind(inputFile, function(file){
				self.file = file;
				self._start();
			});
			dragFile && self.dragEventBind(dragFile, function(file){
				self.file = file;
				self._start();
			});
			loadFile && self._xhrLoadSound(loadFile);
		},

		_xhrLoadSound: function(url){
			var self = this,
				p = new Promise(function(resolve,reject){
					var xhr = new XMLHttpRequest();
					xhr.open('GET',url,true);
					xhr.responseType = 'arraybuffer';
					xhr.onload = function(){
						resolve(xhr.response);
					};
					xhr.send();
				});
			p.then(function(arraybuffer){
				self._audioDecode(arraybuffer);
			});
		},

		_start: function(){
			var self = this,
				fr = new FileReader();

			fr.onload = function(e){
				var fileResult = e.target.result;
				self._audioDecode(fileResult);
			};

			fr.readAsArrayBuffer(self.file);
		},

		_stop: function(){
			this.sourceNode.stop();
		},

		_audioDecode: function(arraybuffer){
			var self = this,
				audioContext = self.audioContext;
			audioContext.decodeAudioData(
				arraybuffer,
				function(buffer){
					self._initRender(audioContext,buffer);
				},
				function(e){
					console.log('Decode failed');
				});
		},

		_initRender: function(audioContext, buffer){
			var audioBufferSourceNode = audioContext.createBufferSource(),
				analyser = audioContext.createAnalyser();
			this.sourceNode = audioBufferSourceNode;

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

				draw(array.subarray(0,730), opt);

				requestAnimationFrame(loopFunc);
			};
			requestAnimationFrame(loopFunc);
		},

		_initDraw: function(opts){
			var canvas = this.canvas,
				w = canvas.width,
				h = canvas.height,
				ctx = canvas.getContext('2d'),
				gradient;

			if (opts.type === 'histogram') {
				var g = opts.grad;
				gradient = ctx.createLinearGradient(0, 0, 0, h);
				if (typeof g === 'string') {
					gradient.addColorStop(1, g);
				}
				else for (var i = 0; i < g.length; i++) {
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
				'foldline': this.draw_foldline,
				'line': this.draw_line,
			};
			return drawMap[type] || 'histogram';
		},

		draw_line: function(buffer, opt){
			var w = opt.w,
				h = opt.h,
				ctx = opt.ctx,
				lineWidth = opt.lineWidth,
				shift = w*opt.k,
				n = opt.n,
				color =opt.color,
				o = h/2,
				step = w/(n+1),
				b_step = Math.floor(buffer.length/n);
			ctx.clearRect(0, 0, w, h);

			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(0,o);
			ctx.lineTo(w,o);
			for (var i = 1; i <= n; i++) {
				var s = shift + step*i,
					t = o+Math.pow(-1,i)*(buffer[b_step*i]%o);
				ctx.moveTo(s,o),
				ctx.lineTo(s,t);
			}
			ctx.lineTo(w,o);
			ctx.closePath();
			ctx.stroke();
		},

		draw_foldline: function(buffer, opt){
			var w = opt.w,
				h = opt.h,
				ctx = opt.ctx,
				lineWidth = opt.lineWidth,
				shift = w*opt.k,
				n = opt.n,
				color =opt.color,
				o = h/2,
				step = w/(n+1),
				b_step = Math.floor(buffer.length/n);
			ctx.clearRect(0, 0, w, h);

			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(0,o);
			ctx.lineTo(shift,o);
			for (var i = 1; i <= n; i++) {
				var s = shift + step*i,
					t = o+Math.pow(-1,i)*(buffer[b_step*i]%o);
				ctx.lineTo(s,t);
			}
			ctx.lineTo(w,o);
			ctx.closePath();
			ctx.stroke();
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
				}
				
				ctx.fillStyle = capStyle;
				if(value < capYPositionArray[i]){
					ctx.fillRect(i*12, h - (--capYPositionArray[i]), meterWidth, capHeight);
				}
				else{
					ctx.fillRect(i*12, h-value, meterWidth, capHeight);
					capYPositionArray[i]=value;
				}
				ctx.fillStyle=gradient;
				ctx.fillRect(i*12, h-value+capHeight, meterWidth, h);
			}
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
			var argv = Array.prototype.slice.call(arguments);
			if (typeof argv[0] === 'string') {
				return argv.join('');
			}
			else if (argv[0] instanceof Array) {
				return argv.reduce(function(a,b){
						return a.concat(b);
				});
			}
			else if (argv[0] instanceof Object) {
				return argv.reduce(function(a,b){
					for (var i in b){
						a[i] = b[i];
					}
					return a;
				});
			}
			else {
				throw new Error('can not be extend');
			}
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