function limit(min, max, value) {
	return((value > max) ? max : ((value < min) ? min : value));
}

function toArray(obj) {
	return Array.prototype.slice.call(obj);
}

Function.prototype.pack = function(beforeArgs, afterArgs, scope) {
	var f = this;
	return function(){
		f.apply(scope || this, beforeArgs.concat(toArray(arguments).concat(afterArgs)));	
	};	
}

Function.prototype.embed = function() {
	return this.pack(toArray(arguments), []);
}

Array.prototype.last = function() {
	return this[this.length - 1];	
}

Graph = {
	Setup: {
		resolution: {x: 5, y: 5} // pixels per unit
		
	},
	init: function(canvas, f) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.zoom = 1;
		this.f = f;
		this.setPosition(0);
		return $.extend({}, this);
	},
	setPosition: function (tCenter) {
		this.left = {t: tCenter - this.dt(this.width / 2), x: 0};
		this.right = {t: tCenter + this.dt(this.width / 2), x: this.width};
		this.center = {t: tCenter, x: this.width / 2};
		this.zero = {t: 0, x: this.width / 2 - this.dx(tCenter)};
	},
	zoom: function(zoom) {
		this.zoom = zoom;
		return this;
	},
	draw: function() {
		for(var px = this.left.x; px <= this.right.x; px++) {
			var t = this.t(px);
			this.point(px, this.y(this.f(t)));
		}
	},
	clear: function(canvas) {
		this.reset(canvas);
	},
	reset: function(canvas) {
		canvas.width = canvas.width;
		canvas.height = canvas.height;	
	}
	
}

$.extend(Graph, { // Utils
	dt: function (dx) {return dx / this.Setup.resolution.x;},
	dx: function (dt) {return dt * this.Setup.resolution.x;},
	dr: function (dy) {return dy / this.Setup.resolution.y;},
	dy: function (dr) {return dr * this.Setup.resolution.y;},
	t: function(x) {return this.left.t + this.dt(x - this.left.x);},
	x: function(t) {return this.zero.x + this.dx(t - this.zero.t);},
	y: function(r) {return this.dy(this.dr(this.height) - r);},
	r: function(y) {return this.dr(this.height - y);},
	xy: function(t, r) {return {x: this.x(r), y: this.y(r || this.f(t))};},
	tr: function(x, y) {return {t: this.t(x), r: (y) ? this.r(y) : this.f(this.t(x))};},
	strokeColor: function(style){this.context.strokeStyle = style; return this;},
	fillColor: function(style){this.context.fillStyle = style; return this;},
	color: function(color){this.strokeColor(color); return this.fillColor(color);},
	strokePath: function(fnc){
		this.context.beginPath();
		fnc(this.context, this);
		this.context.closePath();
		this.context.stroke();
		return this;		 
	}, 
	fillPath: function(fnc){
		this.context.beginPath();
		fnc(this.context, this);
		this.context.closePath();
		this.context.fill();	
		return this;	 
	},
	point: function(x, y) {
		this.fillPath(function(c, g){
			c.arc(x, y, 1, 0, 2*Math.PI, true);	
		});
	}
});

function getFunction() {
	var f = $("#function")[0].value;
	return function(x){
		return eval(f)
	};	
}

$(document).ready(function(e) {
	$canvas = $("#graph");
	$canvas[0].width = parseInt($canvas.css("width"));
	$canvas[0].height = parseInt($canvas.css("height"));
	$canvas = $canvas[0];
	$graphs = [];
	$("#draw").click(function(e) {
	    $graph = Graph.init($canvas, getFunction());
		$graph.draw();
		$graphs.push($graph);
	});
	$("#clear").click(function(e) {
		Graph.clear($canvas);
	});
	
});