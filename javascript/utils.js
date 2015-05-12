var months = new Array(12);
months[0] = {"long_name":"January", "short_name":"Jan"};
months[1] = {"long_name":"February", "short_name":"Feb"};
months[2] = {"long_name":"March", "short_name":"Mar"};
months[3] = {"long_name":"April", "short_name":"Apr"};
months[4] = {"long_name":"May", "short_name":"May"};
months[5] = {"long_name":"June", "short_name":"Jun"};
months[6] = {"long_name":"July", "short_name":"Jul"};
months[7] = {"long_name":"August", "short_name":"Aug"};
months[8] = {"long_name":"September", "short_name":"Sep"};
months[9] = {"long_name":"October", "short_name":"Oct"};
months[10] = {"long_name":"November", "short_name":"Nov"};
months[11] = {"long_name":"December", "short_name":"Dec"};

//today's date, 100 year date range, date splits
var today = new Date(), range_start = today.getFullYear() - 100, range_end = today.getFullYear();
var front_end = range_end.toString().substr(0,2);
var front_start = range_start.toString().substr(0,2);
var back_first = range_end.toString().charAt(2);
var back_second = range_end.toString().charAt(3);

var date_rgx = "^(((0?[469]|11)\/(0?[1-9]|[1-2]\\d|30))|((0?[13578]|1[02])\/(0?[1-9]|[1-2]\\d|3[01]))|(0?2\/(0?[1-9]|1\\d|2[0-8])))";
	date_rgx += "\/((" + parseInt(front_start) + "(" + parseInt(back_first) + "[" + parseInt(back_second) + "-9]|[";
	date_rgx += (parseInt(back_first) < 9 ? parseInt(back_first) + 1 : 9) + "-9][0-9]))|(" + parseInt(front_end) + "(" + parseInt(back_first) + "[0-" + parseInt(back_second) + "]|";
	date_rgx += (parseInt(back_first) > 0 ? parseInt(back_first) - 1 : 0) + "[0-9])))$";
	
var date_title = "Please enter a valid date between the years " + range_start + " and "+ range_end +" using format MM/DD/YYYY";

var address1_rgx = "(^((\\d{1,6})\\s((([nN]|[sS])([wWeE]?))|([wWeE]?))?\\s?([a-zA-Z]([a-zA-Z]+)\\s){1,3}[a-zA-Z]([a-zA-Z]+)(\\s((([nN]|[sS])([wWeE]?))|([wWeE])))?(\\s(\#\\s?)?[0-9A-Z]*)?)|" //street address
	address1_rgx += "^(([pP].?[oO].?)\\s[bB][oO][xX]\\s\\d{1,})|" //po box
	address1_rgx += "^(([a-zA-Z]([a-zA-Z]+)\\s){1,2}[a-zA-Z]([a-zA-Z]+))|" //company name or recipient line
	address1_rgx += "^([A-Z]{2,4}(\\s(\#\\s?)?[0-9A-Z]{1,5})?))$" //designators, e.g. APT 4B, BLDG 29394, FL 2

var address2_rgx =  "(^((\\d{1,6})\\s((([nN]|[sS])([wWeE]?))|([wWeE]?))?\\s?([a-zA-Z]([a-zA-Z]+)\\s){1,3}[a-zA-Z]([a-zA-Z]+)(\\s((([nN]|[sS])([wWeE]?))|([wWeE])))?(\\s(\#\\s?)?[0-9A-Z]*)?)|" //street address
	address2_rgx += "^(([pP].?[oO].?)\\s[bB][oO][xX]\\s\\d{1,})|" //po box
	address2_rgx += "^([A-Z]{2,4}(\\s(\#\\s?)?[0-9A-Z]{1,5})?))$" //designators, e.g. APT 4B, BLDG 29394, FL 2
	
var validity = new Array(12);
	validity["date"] = {"regex":date_rgx, "message": date_title};
	validity["text"] = {"regex":"^[A-Za-z0-9\\*]{2,}[A-Za-z0-9\\*\\s\._-]*$", "message": "Enter at least 2 characters. Some special characters are invalid"};
	validity["username"] = {"regex":"^([a-zA-Z\\d]+[a-zA-Z\\d_]*|)[a-zA-Z]+[a-zA-Z\\d._]*$", "message": "You have entered an incorrect username. Remember usernames must contain at least one letter. No spaces or special characters(~!@#$%^&) allowed"};
	validity["password"] = {"regex":"^([\\w]+[\\d]+|[\\d]+[\\w]+)[^\\s]*$", "message": "You have entered an incorrect password. Remember passwords are case sensitive and must contain at least one letter and one number. No spaces allowed"};
	validity["comment"] = {"regex":"^([\\w\\s]+)[\\w]+$", "message": "Enter a brief comment pertaining to the chosen procedure."};
	validity["description"] = {"regex":"^[A-Za-z0-9\\s\._-]{5,}$", "message": "Enter at least 5 characters from the proceeding description you wish to search for"};
	validity["person"] = {"regex":"^[A-Za-z\\*]{2}([A-Za-z\\*\\s\.\-]*)$", "message": "Enter at least 2 letters of this person's first or last name"};
	validity["lawfirm"] = {"regex":"[A-Za-z]{2,}([A-Za-z\\s\.\&]*)$", "message": "Enter at least 2 characters of the lawfirm name"};
	validity["generic_id"] = {"regex":"^[A-Za-z0-9\-]{2}[A-Za-z0-9\\*\-]*$", "message": "Enter at least 2 characters of valid identification number"};
	validity["confirmation_id"] = {"regex":"^[0-9]*$", "message": "Enter the confirmation number of the filing"};
	validity["proceeding_id"] = {"regex":"^(\\d{2}|RM)-(\\d{0,5})$", "message": "Enter a valid proceeding number, e.g. Docket Number (96-45), RM Number (RM-10020) or proposed rulemaking (PRM04MB)"};
	validity["city"] = {"regex":"[A-Za-z]{2,}([A-Za-z\\*\\s]*)$", "message": "Enter at least the 2 leading characters of the city name"};
	validity["zip_cd"] = {"regex":"^\\d{5}(-(\\d{4}))?$", "message": "Enter at least 5 digits of a valid zip code or enter zip code +4, e.g. 32656-5521"};
	validity["email"] = {"regex":"^(([a-zA-Z0-9\-_\.]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$", "message": "Enter a valid primary email address"};
	validity["address1"] = {"regex":address1_rgx, "message": "Enter a valid street address. Please capitalize and abbreviate all designators, e.g. APT, STE, BLDG"};
	validity["address2"] = {"regex":address2_rgx, "message": "Enter additional address information. Please capitalize and abbreviate all designators, e.g. APT, STE, BLDG"};
	
	
Number.prototype.ordinate = function(){
    var num = this,
        ones = num % 10, //gets the last digit
        tens = num % 100, //gets the last two digits
        ord = ["st","nd","rd"][ tens > 10 && tens < 20 ? null : ones-1 ] || 'th';
    return num.toString() + ord;
};

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
}

generateRandomId = function() {
	var id = '';
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	
	for (var i = 1; i <= 10; i++) {
		var randPos = Math.floor(Math.random() * charSet.length);
		id += charSet[randPos];
	}
	return id;
}

function ajaxCall(url, type, async, cache){
	var results = 
		$.ajax({
			async: async, 
			cache: cache, 
			url: url,
			dataType: type
		});
	//console.log(JSON.parse(results.response));
	return JSON.parse(results.response);
}

function isInArray(value, array) {
  //checks to see if a value exists in an array
  //console.log(value, array.indexOf(value), array.indexOf(value) > -1);
  return array.indexOf(value) > -1;
}

function isIE() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE ");
	//var gecko = ua.indexOf("like Gecko");
	//check for ie10 and below or ie. If IE browser, return true. If another browser, return false
	if (msie > 0 || window.navigator.msMaxTouchPoints !== void 0 )    
		return true;
	else    
		return false;
}

function isSafari(){
	isSafari = !!window.navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
	return isSafari;
}

function sortByProperty(property) {
	//sorts json array by a given property name
	return function (a,b){
		var sortStatus = 0;
		if(a[property] instanceof Date){
			if(a[property] < b[property])
				sortStatus = -1;
			else if (a[property] > b[property])
				sortStatus = 1;
		}
		else if(typeof a[property] == 'number' && a[property]%1 == 0){
			if(parseInt(a[property]) < parseInt(b[property]))
				sortStatus = -1;
			else if (parseInt(a[property]) > parseInt(b[property]))
				sortStatus = 1;
		}
		else{
			if(a[property].toLowerCase().trim() < b[property].toLowerCase().trim())
				sortStatus = - 1;
			else if (a[property].toLowerCase().trim() > b[property].toLowerCase().trim())
				sortStatus = 1
		}
		
		return sortStatus;
	};
}

function objectReverseSort(obj){
	var indices = [];
	
	for(var o in obj)
		indices.push(obj[o]);

	indices.reverse();

	var new_object = {};
	for (var i = 0; i < indices.length; i++){
		var curr_index = indices[i];
		new_object[curr_index.label] = curr_index;
	}
	

	return new_object;
}

function objectPropertySort(obj, property){
	var indices = [];

	for(var o in obj){
		var index = [];
		var curr_obj = obj[o];
		for (var c in curr_obj)
			index[c] = curr_obj[c];
		indices.push(index);
	}

	indices.sort(sortByProperty(property));

	var new_object = {};
	for (var i = 0; i < indices.length; i++){
		var base_object = {};
		var curr_obj = indices[i];
		for (var k in curr_obj)
			base_object[k] = curr_obj[k];
		new_object[base_object.label] = base_object;	
	}
	
	return new_object;
}

function sortByMultipleProperties(property1, property2) {

	var property_a = property_b = property1;
    return function (a, b) {

        var sortStatus = 0;
		
		if(typeof(a[property_a]) == "undefined")
			property_a = property2;
		if(typeof(b[property_b]) == "undefined")
			property_b = property2;
		
        if (a[property_a].toLowerCase().trim() < b[property_b].toLowerCase().trim())
            sortStatus = -1;
        else if (a[property_a].toLowerCase().trim() > b[property_b].toLowerCase().trim())
            sortStatus = 1;
 
		property_a = property_b = property1;
        return sortStatus;
    };
}

function getStringArray(object) {
	return object = typeof object == 'string' ? [object] : object;
}

function toCamelCase(str) {
	return str.replace(/(?:^|\s)\w/g, function(match) {
	  return match.toUpperCase();
	});
}

function validEmail(item) {
	
	var value = null;
	
	if(item.value) value = item.value;
	else value = item;
		
	var filter = /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/;
	return filter.test(value);
}

function stringToDate(text){
	var pattern1 = /\d{4}\d{2}\d{2}/;
	var pattern2 = /\d{4}\-\d{2}\-\d{2}/;
	var pattern3 = /\d{2}\/\d{2}\/\d{4}/;
	var dt = "";
	
	if(pattern1.exec(text))
		dt = new Date(text.substring(0,4), parseInt(text.substring(4,6)) - 1, text.substring(6,8)); // - 1 because months starts from 0.
	else if (pattern2.exec(text)){
		text = text.split("-");
		dt = new Date(text[0], parseInt(text[1]) - 1, text[2]); // - 1 because months starts from 0.
	}
	else if (pattern3.exec(text)){
		text = text.split("/");
		dt = new Date(text[2], parseInt(text[0]) - 1, text[1]); // - 1 because months starts from 0.
	}
	else
		dt = new Date(text);

	return dt;
}

function dateToString(date, separator){
	var date_month = "",
	date_day = "",
	date_year = "",
	string_date = "";
	
	if(separator == "ordinal"){
		date_month = date.getMonth();
		date_day = date.getDate();
		
		string_date = months[date_month].short_name + ' ' + date_day.ordinate();
	}
	else{
		date_month = (date.getMonth() + 1).toString().length == 1? "0" + (date.getMonth() + 1).toString() : date.getMonth() + 1;
		date_day = (date.getDate()).toString().length == 1? "0" + (date.getDate()).toString() : date.getDate();
		date_year = date.getFullYear();
		
		string_date = date_month + separator + date_day + separator + date_year;
	}
	
	
	return string_date;
}

function getUrlParams(param_name)
{
       var query = window.location.search.substring(1);
       var params = query.split("&");
       for (var i=0;i<params.length;i++) {
               var pair = params[i].split("=");
               if(pair[0] == param_name){return pair[1];}
       }
       return "";
}

function hasLowerCase(str) {
    if(str.toUpperCase() != str) {
        return true;
    }
    return false;
}

function hasUpperCase(str) {
    if(str.toLowerCase() != str) {
        return true;
    }
    return false;
}

function findUpperCaseLetters(str) {
	var uc = [];
	for(x=0;x<str.length;x++){
		if(str.charAt(x) >= 'A' && str.charAt(x) <= 'Z')
			uc.push(str.indexOf(str.charAt(x)));
	}
	
	return uc;
}

function isValidForm(id){
	var valid = true;
	$.each(id[0],function(ndx, field){
		if(field.validity.valid == false){
			valid = false;
			return false;
		}
	});
	
	return valid; 
}