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

$Game = {
	Setup: {
		backgroundColor: "#FFFFFF",
		mainColor: "#000000",
		secondaryColor: "#FF0000",
		carColor: "rgba(200, 50, 50, 0.5)",
		//obstacleColor: "rgba(50, 50, 200, 1)",
		eraseCoeficient: 1.1
	},
	init: function(canvas){
		$Game.canvas = canvas;
		$Game.context = $Game.canvas.getContext("2d");
		$Game.context.reset = function(){
			$Game.canvas.width = $Game.canvas.width;
			$Game.canvas.height = $Game.canvas.height;
		};	
		$Game.Helper.fillColor($Game.Setup.backgroundColor).rectangle(0, 0, $Game.canvas.width, $Game.canvas.height);
		$Game.Helper.color($Game.Setup.mainColor);
	}
};

$Game.Helper = {
	strokeColor: function(style){
		$Game.context.strokeStyle = style;
		return this;		
	},
	fillColor: function(style){
		$Game.context.fillStyle = style;
		return this;				
	},
	color: function(color){
		this.strokeColor(color);
		this.fillColor(color);
		return this;				
	},
	strokePath: function(fnc){
		$Game.context.beginPath();
		fnc($Game.context, $Game.Helper);
		$Game.context.closePath();
		$Game.context.stroke();
		return this;		 
	}, 
	fillPath: function(fnc){
		$Game.context.beginPath();
		fnc($Game.context, $Game.Helper);
		$Game.context.closePath();
		$Game.context.fill();	
		return this;	 
	},
	circle: function(x, y, r){
		return this.fillPath(function(c){
			c.arc(x, y, r, 0, 2*Math.PI, true);
		});
	},
	circumference: function(x, y, r){
		return this.strokePath(function(c){
			c.arc(x, y, r, 0, 2*Math.PI, true);
		});
	},
	rectangle: function(x, y, w, h){
		return this.fillPath(function(c){
			c.rect(x, y, w, h);
		});
	},
	rectLine: function(x, y, w, h){
		return this.strokePath(function(c){
			c.rect(x, y, w, h);
		});
	},
	rotate: function(x, y, angle, fnc){
		$Game.context.translate(x, y);
		$Game.context.rotate(angle);
		fnc($Game.context, $Game.Helper);
		$Game.context.rotate(-angle);
		$Game.context.translate(-x, -y);
		return this;		
	}
	
};

$Game.Helper.Liner = {
	set: function(opts){
		for(attr in opts){$Game.context[attr] = opts[attr];}
		return this;
	}, 
	init: function(x, y){
		$Game.context.beginPath();
		$Game.context.moveTo(x, y);
		this.position = {x: x, y: y};
		return this;
	},
	move: function(){
		$Game.context.lineTo(
			this.position.x, 
			this.position.y
		);
		return this;
	},
	up: function(l){
		this.position.y -= l;
		return this.move();
	},
	right: function(l){
		this.position.x += l;
		return this.move();
	},
	down: function(l){
		this.position.y += l;
		return this.move();
	},
	left: function(l){
		this.position.x -= l;
		return this.move();
	},
	x: function(x){
		this.position.x = x;
		return this.move();		
	},
	y: function(y){
		this.position.y = y;
		return this.move();		
	},
	to: function(x, y){
		this.position.x = x;
		this.position.y = y;
		return this.move();		
	},
	polar: function(r, a){
		this.position.x = this.position.x + r * Math.cos(a);
		this.position.y = this.position.y - r * Math.sin(a);
		return this.move();
	},
	run: function(fnc){
		fnc($Game.context);
		return this;
	},
	close: function(){
		$Game.context.closePath();
		return this;			
	},
	finish: function(){
		$Game.context.stroke();
		$Game.context.closePath();
		return this;
	}
};

$Game.Helper.Point = {
	directionAngle: function(angle){
		angle %= Math.PI;
		if(angle < 0){angle += Math.PI;}
		return angle;		
	},
	init: function(point){
		this.x = point.x;
		this.y = point.y;
		return this;
	},
	at: function(x, y){
		return this.init({x: x, y: y});
	},
	// Given two points, P and Q, and two angles a and b, find the intersection between
	// the lines generated by the points and the direction
	intersect: function(p, a, q, b){
		a = this.directionAngle(a);
		b = this.directionAngle(b);
		var t = ((q.x * Math.sin(b) + q.y * Math.cos(b)) - (p.x * Math.sin(b) + p.y * Math.cos(b))) / Math.sin(b - a);
		this.x = p.x + t * Math.cos(a);
		this.y = p.y - t * Math.sin(a);
		return this;		
	},
	rotate: function(o, a){
		p = $.extend({}, this);
		// a' = -a
		// P' = O + (P - O) * cis(a')
		// (x, y) = (o.x, o.y) + (p.x - o.x, p.y - o.y) * (cos(a), -sin(a))
		// (x, y) = (o.x, o.y) + ((p.x - o.x)cos(a) + (p.y - o.y)sin(a), -(p.x - o.x)sin(a) + (p.y - o.y)cos(a))
		this.x = o.x + (p.x - o.x) * Math.cos(a) + (p.y - o.y) * Math.sin(a);
		this.y = o.y - (p.x - o.x) * Math.sin(a) + (p.y - o.y) * Math.cos(a);
		return this;
	},
	move: function(r, a){
		this.x = this.x + r * Math.cos(a);
		this.y = this.y - r * Math.sin(a);
		return this;
	},
	distanceFrom: function(p){
		return Math.pow(Math.pow((this.x - p.x), 2) + Math.pow((this.y - p.y), 2), 0.5);
	}
}

function $P(a, b){
	p = $.extend({}, $Game.Helper.Point);
	return (b || b == 0) ? p.at(a, b) : ((a) ? p.init(a) : p);
}


$Game.SterringSlider = {
	Setup: {
		sliderWidth: 0.2
	},
	init: function(x, y, w, h){
		this.position = {x: x, y: y};
		this.width = w;
		this.height = h;
		$Game.context.lineWidth = 1;
		$Game.Helper.color($Game.Setup.secondaryColor).rectangle(x, y, w, h);
		$Game.Helper.color($Game.Setup.mainColor).rectLine(x, y, w, h);
		//Put the background rectangle
		return this.draw(0);
	},
	sliderWidth: function(){
		return this.Setup.sliderWidth * this.width;
	},
	sliderX: function(amount){
		// amount [-1, 1] -> [0, 1] <==> amount <- (amount + 1)/2
		return this.position.x +((amount + 1)/2 * (this.width - this.sliderWidth()));
	},
	redraw: function(){
		return this.erase().draw(this.amount);
	},
	draw: function(amount){
		this.amount = amount;
		$Game.context.lineWidth = 1;
		$Game.Helper.color($Game.Setup.mainColor).rectangle(
			this.sliderX(amount),
			this.position.y,
			this.sliderWidth(),
			this.height
		);
		return this;
	},
	erase: function(){
		$Game.Helper.color($Game.Setup.secondaryColor).rectangle(this.position.x, this.position.y, this.width, this.height);
		$Game.Helper.color($Game.Setup.mainColor).rectLine(this.position.x, this.position.y, this.width, this.height);	
		return this;
	},
	slideTo: function(amount){
		return this.erase().draw(amount);
	}
	
};

$Game.SterringWheel = {
	Setup: {
		amplitude: 2,
		thickness: function(r) {return 0.1*r;},
		innerCircleRadius: function(r) {return 0.2*r;}
	},
	redraw: function(){
		return this.erase().draw(this.position.x, this.position.y, this.radius);
	},
	draw: function(x, y, r){
		$Game.Helper.color($Game.Setup.mainColor).circle(x, y, r).color($Game.Setup.backgroundColor).circle(x, y, r - this.Setup.thickness(r));
		$Game.Helper.Liner.set({
			lineWidth: this.Setup.thickness(r), 
			strokeStyle: $Game.Setup.mainColor
		}).init(x - r, y).right(2*r).finish().init(x, y).down(r).finish().set({
			lineWidth: 1 // Reset the line width!
		});
		$Game.Helper.color($Game.Setup.mainColor).circle(x, y, this.Setup.innerCircleRadius(r));
		return this;
	},
	init: function(x, y, r){
		this.position = {x: x, y: y};
		this.radius = r;
		this.turnedAmount = 0; 
		this.laps = this.Setup.amplitude;
		this.amplitude = 2 * Math.PI * this.laps;
		return this.draw(x, y, r);
	},
	erase: function(){
		$Game.Helper.color($Game.Setup.backgroundColor).circle(
			this.position.x,
			this.position.y,
			($Game.Setup.eraseCoeficient * this.radius)
		);
		return this;
	},
	spinTo: function(amount){
		this.turnedAmount = limit(-1, 1, amount);
		this.erase();
		$Game.Helper.rotate(
			this.position.x,
			this.position.y, 
			this.turnedAmount * this.amplitude,
			this.draw.embed(0, 0, this.radius).bind(this)
		);	
		return this;
	},
	spin: function(amount){
		return this.spinTo(this.turnedAmount + amount);
	}
	
};

$Game.WheelAxis = {
	Setup: { // Defined in $Game.Axis, not here!
		width: 50,
		wheel: {
			width: 8,
			length: 20 
		}
	},
	_init: function(x, y, transversalDirection){
		this.position = {x: x, y: y};
		this.angle = transversalDirection;
		this.axisAngle = this.angle + Math.PI / 2;
		this.wheels = [
			$P(x, y).move(this.Setup.width / 2, this.axisAngle),
			$P(x, y).move(-this.Setup.width / 2, this.axisAngle)
		];
		return this;
	},
	drawAxis: function(lineWidth, strokeStyle){
		var x = this.position.x; var y = this.position.y;
		$Game.Helper.Liner.set({
			lineWidth: lineWidth || 1, 
			strokeStyle: strokeStyle || $Game.Setup.mainColor
		}).init(x, y).to(this.wheels[0].x, this.wheels[0].y).finish().init(x, y).to(this.wheels[1].x, this.wheels[1].y).finish();
		return this;
	},
	eraseAxis: function(){ //Remember to draw wheels again!
		return this.drawAxis(Math.pow($Game.Setup.eraseCoeficient, 30), $Game.Setup.backgroundColor);
	},
	drawWheel: function(xC, yC, angle){
		var w = this.Setup.wheel.length;
		var l = this.Setup.wheel.width;
		var x = -w/2; var y = -l/2;
		$Game.Helper.rotate(xC, yC, -angle, function(c, h){
			h.color($Game.Setup.mainColor).rectangle(-w/2, -l/2, w, l);
		});
		return this;
	},
	eraseWheel: function(xC, yC, angle){ //Remember to draw the axis again!
		var x = Math.pow($Game.Setup.eraseCoeficient, 4) * (-this.Setup.wheel.length/2);
		var y = Math.pow($Game.Setup.eraseCoeficient, 4) * (-this.Setup.wheel.width/2);
		var w = $Game.Setup.eraseCoeficient * (-2*x); 
		var l = $Game.Setup.eraseCoeficient * (-2*y);
		$Game.Helper.rotate(xC, yC, -angle, function(c, h){
			h.color($Game.Setup.backgroundColor).rectangle(x, y, w, l);
		});
		return this;
	},
	drawWheels: function(){
		this.drawWheel(this.wheels[0].x, this.wheels[0].y, this.angle);
		this.drawWheel(this.wheels[1].x, this.wheels[1].y, this.angle);
		return this;
	},
	eraseWheels: function(){
		this.eraseWheel(this.wheels[0].x, this.wheels[0].y, this.angle);
		this.eraseWheel(this.wheels[1].x, this.wheels[1].y, this.angle);
		return this;
	},
	_rotate: function(r, angle){
		//r += this.Setup.width / 2; // Comment this in order to let r not  be the distant to the center of the axis
		this.eraseWheels().eraseAxis();
		p = $P(this.position).rotate($P(this.position).move(r, this.axisAngle), angle)
		this.init(p.x, p.y, this.angle + angle);
		return this;
	}
}

$Game.RearWheelAxis = $.extend({}, $Game.WheelAxis, {
	init: function(x, y, transversalDirection){
		this._init(x, y, transversalDirection);
		this.drawAxis().drawWheels();
		return this;
	},
	rotate: $Game.WheelAxis._rotate
});

$Game.FrontWheelAxis = $.extend({}, $Game.WheelAxis, {
	Setup: $.extend({}, $Game.WheelAxis.Setup, { // Defined in $Game.Axis, not here!
		betweenAxisLength: 80,
		maximumTurningAngle: Math.PI / 4
	}),
	turnSide: function(){
		return this.turnedWheel * 2 - 1;
	},
	secondWheelTurningAngle: function(angle){
		return Math.atan(1 / ((1/Math.tan(angle)) - this.turnSide() * (this.Setup.width / this.Setup.betweenAxisLength)));
	},
	opositeWheel: function(turnedWheel){
		return (turnedWheel == 0) ? 1 : 0;
	},
	turningPoint: function(){
		return $P().intersect(this.wheels[0], this.angle + this.wheels[0].angle + (Math.PI / 2), this.wheels[1], this.angle + this.wheels[1].angle + (Math.PI / 2));
	},
	init: function(x, y, transversalDirection, turnedWheel, turningAngle){ //Always the inside turning wheel
		this._init(x, y, transversalDirection);
		this.turnedWheel = turnedWheel
		this.secondWheel = this.opositeWheel(turnedWheel);
		this.wheels[this.turnedWheel].angle = turningAngle;
		this.wheels[this.secondWheel].angle = this.secondWheelTurningAngle(turningAngle);
		this.drawAxis().drawWheels();
		return this;
	},
	drawWheels: function(){
		this.drawWheel(this.wheels[0].x, this.wheels[0].y, this.angle + this.wheels[0].angle);
		this.drawWheel(this.wheels[1].x, this.wheels[1].y, this.angle + this.wheels[1].angle);
		return this;
	},
	eraseWheels: function(){
		this.eraseWheel(this.wheels[0].x, this.wheels[0].y, this.angle + this.wheels[0].angle);
		this.eraseWheel(this.wheels[1].x, this.wheels[1].y, this.angle + this.wheels[1].angle);
		return this;
	},
	rotate: function(angle){
		this.eraseWheels().eraseAxis();
		var turningPoint = this.turningPoint();
		$.extend(this.wheels[this.turnedWheel], $P(this.wheels[this.turnedWheel]).rotate(turningPoint, angle));
		$.extend(this.wheels[this.secondWheel], $P(this.wheels[this.secondWheel]).rotate(turningPoint, angle));
		$.extend(this.position, $P(this.position).rotate(turningPoint, angle));
		this.angle += angle;
		this.drawAxis().drawWheels();
		return this;
	},
	turnWheels: function(amount){ // Assuming linear relation
		this.eraseWheels().eraseAxis();
		this.init(this.position.x, this.position.y, this.angle, (amount > 0) ? 1 : 0, - amount * (this.Setup.maximumTurningAngle));
		return this;
	}
});

$Game.Axis = {
	Setup: { 
		betweenAxisLength: 80, 
		width: 50,
		wheel: {
			width: 8,
			length: 20 
		},
		maximumTurningAngle: Math.PI / 4	
	},
	init: function(x, y, transversalDirection){
		this.position = $P(x, y);
		this.angle = transversalDirection;
		var p = $P(x, y).move(- this.Setup.betweenAxisLength / 2, this.angle)
		this.Rear = $Game.RearWheelAxis;
		this.Rear.Setup = this.Setup;
		this.Rear.init(p.x, p.y, this.angle);
		p.move(this.Setup.betweenAxisLength, this.angle);
		this.Front = $Game.FrontWheelAxis;		
		this.Front.Setup = this.Setup;
		this.Front.init(p.x, p.y, this.angle, 0, 0);
		return this;
	},
	draw: function(){
		return this.init(this.position.x, this.position.y, this.angle);
	},
	erase: function(){
		this.Front.eraseWheels().eraseAxis();
		this.Rear.eraseWheels().eraseAxis();
		return this;
	},
	turnWheels: function(amount){
		this.Front.turnWheels(amount);
		return this;
	},
	rearAxisRadius: function(){
		return this.Front.turningPoint().distanceFrom(this.Rear.position);
	},
	isTurned: function(){
		return((Math.round(this.Front.wheels[this.Front.turnedWheel].angle * 10)/10) != 0);
	},
	turn: function(angle){
		if(!this.isTurned()){return this;}
		this.Front.rotate(- this.Front.turnSide() * angle);
		this.Rear.rotate(- this.Front.turnSide() * this.rearAxisRadius(), - this.Front.turnSide() * angle);
		this.position = $P(
			(this.Front.position.x + this.Rear.position.x)/2,
			(this.Front.position.y + this.Rear.position.y)/2
		);
		this.angle = this.Front.angle;
		return this;
	},
	move: function(pixels){
		if(this.isTurned()){
			this.turn(pixels / this.rearAxisRadius());
		} else {
			var p = this.position.move(pixels, this.angle);
			this.erase().init(p.x, p.y, this.angle);				
		}
		return this;
	}
};

$Game.Car = {
	Setup: {
		backLength: 70,
		frontLength: 70,
		width: 60
	},
	refreshPosition: function(){
		this.position = this.Axis.position;
		this.angle = this.Axis.angle;
		return this;
	},
	init: function(x, y, longitudinalDirection){
		this.Axis = $Game.Axis.init(x, y, longitudinalDirection);
		return this.refreshPosition().draw();
	},
	draw: function(){
		var self = this;
		$Game.Helper.fillColor($Game.Setup.carColor).rotate(this.position.x, this.position.y, -this.angle, function(c, h){
			h.rectangle(- self.Setup.backLength, - self.Setup.width / 2, self.Setup.backLength + self.Setup.frontLength, self.Setup.width);
		});
		return this;
	},
	erase: function(){
		var self = this;
		$Game.Helper.fillColor($Game.Setup.backgroundColor).rotate(this.position.x, this.position.y, -this.angle, function(c, h){
			h.rectangle(
				- $Game.Setup.eraseCoeficient * self.Setup.backLength, 
				- $Game.Setup.eraseCoeficient * self.Setup.width / 2, 
				$Game.Setup.eraseCoeficient * (self.Setup.backLength + self.Setup.frontLength), 
				$Game.Setup.eraseCoeficient * self.Setup.width
			);
		});
		return this;
	},
	move: function(pixels){
		this.erase().Axis.move(pixels);		
		return this.refreshPosition().draw();
	},
	turnWheels: function(amount){
		this.Axis.erase();
		this.erase().Axis.draw().turnWheels(amount);
		return this.draw();		
	}	
};

function moveCar(step){
	step *= stepCoef($carSpeed);
	$C.move(step * 0.7);
	var xLimit = $SS.position.x - $C.Setup.backLength - $C.Setup.frontLength;
	var yLimit = $SS.position.y - $C.Setup.backLength - $C.Setup.frontLength
	if($C.position.x > xLimit && $C.position.y > yLimit){
		$SS.redraw(); // Redraw the controls
		$SW.redraw();
	}
}

function turnWheel(step){
	step *= stepCoef($wheelSpeed);
	StepAmount = -(1 / ($SW.Setup.amplitude)) / 7;
	$SW.spin(step * StepAmount);
	$SS.slideTo($SW.turnedAmount);
	$C.turnWheels($SW.turnedAmount);	
}

function updateM(value){
	if(value || value == 0){$M = value;}
	$("#m").text($M);
}

function mousewheel(e, d){
	[turnWheel, function(step){
		moveCar(step * 4);
	}][$controlMode](d);
}

function getMousePoint(e){
	return $P(
		e.pageX - $("#game")[0].offsetLeft,
		e.pageY - $("#game")[0].offsetTop
	);
}

function mousedown(e){
	if($draw){
		$drawing = true;
		$drawn = {start: getMousePoint(e), end: getMousePoint(e)};
		$obstacle = $("<div/>", {
			id: $obstacles.length
		}).addClass("obstacle").css({
			position: "absolute"			
		}).appendTo("#obstacles");
		$obstacles.push($obstacle);
	} else {
		updateM($M - (e.which - 2));
		if(e.which == 2){$("#invert-controls").click();}
	}
}

function mousemove(e){
	if($draw && $drawing){
		$drawn.end = getMousePoint(e);
		$obstacle.css({
			left: ($drawn.start.x < $drawn.end.x) ? $drawn.start.x : $drawn.end.x,
			top: ($drawn.start.y < $drawn.end.y) ? $drawn.start.y : $drawn.end.y,
			width: Math.abs($drawn.end.x - $drawn.start.x),
			height: Math.abs($drawn.end.y - $drawn.start.y)
		});
	}
}

function mouseup(e){
	if($draw){finishDrawing();}
	else{updateM($M + (e.which - 2));}
}

function watcher(){
	[moveCar, function(step){
		turnWheel(step * 0.25)
	}][$controlMode]($M);
}

function finishDrawing(){
	$draw = false;
	$drawing = false;
	var i = $obstacles.length - 1;
	var obstacle = $obstacle;
	$("<button/>", {
		id: "obstacle-" + i + "-mapper",
		text: i
	}).click(function(e){
		$obstacles[i] = null;
		$(obstacle).remove();
		$(this).remove();
	}).appendTo("#obstacles-mapping");
	$("#draw").removeAttr("disabled");
}

$(document).ready(function(){
	$Game.init($("#workarea")[0]);
	var radius = 50;
	;
	$SW = $Game.SterringWheel.init(
		$Game.canvas.width - radius - 15,
		$Game.canvas.height - radius - 15,
		radius
	);
	$SS = $Game.SterringSlider.init(
		$Game.canvas.width - (2 * radius) - 15 - 5,
		$Game.canvas.height - (2 * radius) - (2 * 15) - 5,
		2 * radius + 10,
		10
	);
	$C = $Game.Car.init(80, 120, 0);
	$controlMode = 0;
	$A = $C.Axis;
	$("#game").mousedown(mousedown).mousewheel(mousewheel).mousemove(mousemove).mouseup(mouseup).contextmenu(function(){return false;});
	$M = 0;
	$I = setInterval(watcher, 10);
});
