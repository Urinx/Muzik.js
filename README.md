Muzik.js
========

音乐可视化前端框架

## Installation

The fastest way to get started is to serve JavaScript from the Github (also you can download it):
```html
<!-- The core Muzik library -->
<script src="http://github.com/urinx/muzik.js"></script>
<!-- Or the compress version -->
<script src="http://github.com/urinx/muzik.min.js"></script>
```

## Get started

```html
// Assume you have the following two elements
<input type="file" id="uploadedFile">
<canvas id="canvas" width="600" height="300"></canvas>
// It's very easy to use Muzik.js
<script>
	var M = new Muzik({
		input: '#uploadedFile',
		drag: '#canvas',
		canvas: '#canvas',
	});
</script>
```

You can load online music(.mp3) file:
```html
<script>
	var M = new Muzik({
			load: './demo.mp3',
			canvas: '#canvas',
			draw_conf: {
				type: 'line',
				color: '#fff',
				lineWidth: 2,
				k: 0.1,
				n: 50,
			},
		});
</script>
```

You can upload local music(.mp3) file:
```html
<script>
	var M = new Muzik({
		input: '#uploadedFile',
		canvas: '#canvas',
	});
</script>
```

You can drag local music(.mp3) file:
```html
<script>
	var M = new Muzik({
		input: '#uploadedFile',
		canvas: '#canvas',
	});
</script>
```