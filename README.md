Muzik.js
========

音乐可视化前端框架

![项目主页](0.png)

[项目主页](http://urinx.github.io/app/muzik-js/)

## Installation

The fastest way to get started is to serve JavaScript from the Github (also you can download it):
```html
<!-- The core Muzik library -->
<script src="http://raw.githubusercontent.com/Urinx/Muzik.js/master/muzik.js"></script>
<!-- Or the compress version -->
<script src="http://raw.githubusercontent.com/Urinx/Muzik.js/master/muzik.min.js"></script>
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

## Draw config
There are some example configs:

`histogram`
```
draw_conf: {
	type: 'histogram',
	meterWidth: 10,
	gap: 2,
	capHeight: 2,
	capStyle: '#fff',
	grad: ['#f00','#ff0','#0f0'],
}
```

`pie`
```
draw_conf: {
	type: 'pie',
	color: '#000',
	lineWidth: 2,
	gap: 5,
}
```

`foldline`
```
draw_conf: {
	type: 'foldline',
	color: '#fff',
	lineWidth: 2,
	k: 0.05,
	n: 30,
}
```

`line`
```
draw_conf: {
	type: 'line',
	color: '#fff',
	lineWidth: 2,
	k: 0.1,
	n: 50,
}
```

## Update

`2015.2.27` Now it can support multiple canvas output like the following example:
```html
<script>
	var M = new Muzik({
			load: './demo.mp3',
			canvas: ['#canvas1','#canvas2'],
			draw_conf: [{
				type: 'line',
				color: '#fff',
				lineWidth: 2,
				k: 0.1,
				n: 50,
			},{
				type: 'foldline',
				color: '#fff',
				lineWidth: 2,
				k: 0.05,
				n: 30,
			}],
		});
</script>
```

## License
Muzik.js is released under the GPL License. See [LICENSE](./LICENSE) file for details.
