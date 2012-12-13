$SmartCalc = {};

$SmartCalc.Value = {
	init: function(value, error){
		this.value = value;
		this.error = error;
	}
	
}

$SmartCalc.Operations = {
	Base = {
		init: function(){
			
			
		}
	}
	
}

$SmartCalc.Operations.Sum = $.extend({}, $SmartCalc.Operations.Base, {
	init: function(a, b){
		
	},
	execute: function(){
		$SmartCalc.Value.
	}
});

$(document).ready(function(){
});
