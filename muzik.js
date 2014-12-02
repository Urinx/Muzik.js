/* Muzik.js 0.9.0, @license MIT, (c) 2014 Eular */
~function (){
	"use strict";

	var Muzik = function (){
		this.file = null;
		this.filename = null;
		this.audioContext = null;
		this.source = null;
	};
	Muzik.prototype = {
		_prepareAPI: function(){
			// check support
			window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
			window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

			try{
				this.audioContext = new window.AudioContext();
			}
			catch(e){
				console.log('Your browser does not support AudioContext!');
			}
		},

		_addEventListener: function(){
			var self = this,
				audioInput = document.querySelector('#uploadedFile'),
				dropContainer = document.querySelector('#canvas');

			audioInput.addEventListener('change', function(){
				if (audioInput.files.length !== 0) {
					self.file = audioInput.files[0];
					self.filename = self.file.name;
					self._start();
				};
			},false);

			dropContainer.addEventListener('dragenter',function(){
				self._updateInfo('Drop it on the page',true);
			},false);
			dropContainer.addEventListener('dragover',function(e){
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			},false);
			dropContainer.addEventListener('drop',function(e){
				e.stopPropagation();
				e.preventDefault();
				self.file = e.dataTransfer.files[0];
				self.filename = self.file.name;
				self._start();
			},false);
		},

		_start: function(){
			var self = this,
				file = self.file,
				fr = new FileReader();

			fr.onload = function(e){
				var fileResult = e.target.result,
					audioContext = self.audioContext;
				audioContext.decodeAudioData(fileResult,function(buffer){
					self._visualize(audioContext,buffer);
				},function(e){
					console.log('Decode failed');
				});
			};

			fr.readAsArrayBuffer(file);
		},

		_visualize: function(audioContext, buffer){
			var audioBufferSourceNode = audioContext.createBufferSource(),
				analyser = audioContext.createAnalyser();
			audioBufferSourceNode.connect(analyser);
			analyser.connect(audioContext.destination);
			audioBufferSourceNode.buffer = buffer;
			audioBufferSourceNode.start(0);
			this._drawSpectrum(analyser);
		},

		_drawSpectrum: function(analyser){
			var canvas = document.querySelector('#canvas'),
				cwidth = canvas.width,
				cheight = canvas.height -2,
				meterWidth = 10,
				gap = 2,
				capHeight = 2,
				capStyle = '#fff',
				meterNum = 800/(10+2),
				capYPositionArray = [],
				ctx = canvas.getContext('2d'),
				gradient = ctx.createLinearGradient(0, 0, 0, 300);

			gradient.addColorStop(1,'#0f0');
			gradient.addColorStop(0.5,'#ff0');
			gradient.addColorStop(0,'#f00');

			var drawMeter = function(){
				var array =new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				var step = Math.round(array.length/meterNum);
				ctx.clearRect(0,0,cwidth,cheight);

				for (var i = 0; i < meterNum; i++) {
					var value = array[i*step];
					if (capYPositionArray.length<Math.round(meterNum)) {
						capYPositionArray.push(value);
					};
					ctx.fillStyle = capStyle;
					if(value < capYPositionArray[i]){
						ctx.fillRect(i*12,cheight - (--capYPositionArray[i]), meterWidth,capHeight);
					}
					else{
						ctx.fillRect(i*12,cheight-value,meterWidth,capHeight);
						capYPositionArray[i]=value;
					}
					ctx.fillStyle=gradient;
					ctx.fillRect(i*12,cheight-value+capHeight,meterWidth,cheight);
				};
				
				requestAnimationFrame(drawMeter);
			};

			requestAnimationFrame(drawMeter);
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