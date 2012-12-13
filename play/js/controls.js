function stepCoef(speed){
	return (speed / 10.0) * 2;
}
function updateSpeed(){
	$carSpeed = limit(0, 10, $carSpeed);
	$wheelSpeed = limit(0, 10, $wheelSpeed);
	$("#car-speed").text($carSpeed);
	$("#wheel-speed").text($wheelSpeed);
	updateM();
}


$(document).ready(function(){
	$carSpeed = 5;
	$wheelSpeed = 5;
	$("#invert-controls").click(function(e){
		$controlMode = [1, 0][$controlMode];
		var options = ["Mousewheel", "Mousebuttons"];
		$("#sterring-wheel").text(options[$controlMode]);
		$("#pedal").text(options.reverse()[$controlMode]);
	});
	$("#invert-controls").click().click();
	$("#more-car-speed").click(function(){$carSpeed++; updateSpeed();});
	$("#less-car-speed").click(function(){$carSpeed--; updateSpeed();});
	$("#more-wheel-speed").click(function(){$wheelSpeed++; updateSpeed();});
	$("#less-wheel-speed").click(function(){$wheelSpeed--; updateSpeed();});
	$("#more-m").click(function(){$M++; updateM();});
	$("#less-m").click(function(){$M--; updateM();});
	updateSpeed();
	$draw = false;
	$drawing = false;
	$obstacles = [];
	$("#draw").click(function(){
		$draw = true;
		$(this).attr("disabled", "disabled");
	});
});
