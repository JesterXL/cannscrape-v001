
const tinyreq = require("tinyreq");
const fs = require("fs");

// [jwarden 4.19.2017] Be lazy like me, and use log vs. console.log because fuck mo typing.
const log = console.log;
const RIGHT_BRACE_RIGHT_BRACKET_DELIMENTER = "}];";
const RIGHT_BRACE_COMMA_DELIMENTER = "},";
const COLON_DELIMENTER = ":";
const COMMA_DELIMETER = ",";
const ARCHIVE_FILE_EXTENSION = ".txt"
const RIGHT_BRACKET_DELIMETER = "]; ";
const LEFT_BRACKET_DELIMETER = "[";

const RETAILERS_REQUEST_URL = "http://www.502data.com/retailers";
const WSLCB_MAPS_ARCGIS_COM_APPS_VIEW_INDEX = "http://wslcb.maps.arcgis.com/apps/View/index.html?appid=0c7f98dbf3c14d0aa670252bf26f7602";
const PRODUCER_PROCESSORS_REQUEST_URL = "http://www.502data.com/allproducerprocessors";
const DATABASE_PATH = "/Users/Sean/Desktop/502-scraping/archive/";

const ANGULAR_MODULE_APP_SMART_TABLE_DELIMENTER = "var m = angular.module('app', ['smart-table']);";
const SCOPE_SAFE_LICENSES_CONCAT_DELIMENTER = "$scope.safe_licenses = [].concat($scope.licenses )";

const SCOPE_SAFE_RETAILERS_DELIMETER = "$scope.safe_retailers = [].concat($scope.retailers);";
const RETAILER_CONTROLLER_DELIMENTER = "m.controller('retailercontroller',";
const CONSOLE_LOG_SCOPE_COUNTY_ROWS_DELIMETER = "//console.log($scope.county_rows);";
const SCOPE_FILTER_FUNCTION_DELIMETER = "'$scope', '$filter', function($scope, $filter) {";
const SCOPE_RETAILERS_DELIMETER = "$scope.retailers = [";
const LICENSECONTROLLER_CLEAN_UP_STRING = "m.controller('licensecontroller', ['$scope', '$filter', function($scope,$filter) {";
const SCOPE_LICENSES_CLEAN_UP_STRING = "$scope.licenses =";
const LICENSE_NUMBER_SEARCH_KEY = '"licensenumber"';
const LICENSE_NUMBER_CLEAN_WITH_SINGLE_RIGHT_DOUBLE_QUOTE = '"licensenumber';

const ARCHIVE_UPDATE_FAILURE = "archiveRawCompanyData: ARCHIVE FILE UPDATE ERROR: ";
const COMPANIES_ARCHIVE_FILE_NAME = "companies-database_";
const RETAILERS_ARCHIVE_FILE_NAME = "retailers-database_";
const RETAILERS_ARCHIVE_SAVED_SUCCESS_MESSAGE = "retailers-database saved";

var companiesArray = [];
var retailersArray = [];

/**
function producerProcessorsWSLCBRequest() {//error, body
	console.log("tinyreq("+PRODUCER_PROCESSORS_REQUEST_URL+")");
	body = cleanBodyString(body);
	createCompanies(body);
	var archiveData = buildRawCompanyDataString();
	archiveRawCompanyData(archiveData);
}
**/

// [jwarden 4.19.2017] NOTE: If you're going to abandon OOP, and forego
// the 'this' keyword, then start using "Fat Arrow" or just arrow functions.
// They don't have a this keyword, and if you're just returning a value,
// you don't even need a return if it's just 1 line of code. Notice
// I moved this up, though, because unliked function something,
// you can't call it before it's defined (i.e. if you refactored
// fullCompanyArchivePath to an Array function, it'd fail because
// getNewDateTime is below it)

// function geNewDateTime() {
// 	return new Date().getTime();
// }
const getNewDateTime = new Date().getTime();

function fullCompanyArchivePath() {
	return DATABASE_PATH + 
			COMPANIES_ARCHIVE_FILE_NAME + 
			geNewDateTime() + 
			ARCHIVE_FILE_EXTENSION;
}

function fullRetailArchivePath() {
	return DATABASE_PATH + 
			RETAILERS_ARCHIVE_FILE_NAME + 
			geNewDateTime() + 
			ARCHIVE_FILE_EXTENSION;
}




// [jwarden 4.19.2017] Great opportunity here to start using list
// comprehensions. Below, you take an array, and make a 
// big-ole string out of it. Dope! However, true power
// lies in array comprehensions, so let's refactor the below to a reduce.
// same shit, less code, no "Exceptions".
function buildRawCompanyDataString() {
	var companyCount = companiesArray.length;
	// var allDataString = "";
	// for (var i=0;i<companyCount;i++) {
	// 	var company = companiesArray[i];
	// 	for (var prop in company) {
	// 		//console.log(prop + ":" + company[prop]);
	// 		allDataString += prop + ":" + company[prop];
	// 	}
	// }
	var allDataString = companiesArray.reduce( (allDataString, company) =>
	{
		for (var prop in company) {
			//console.log(prop + ":" + company[prop]);
			allDataString += prop + ":" + company[prop];
		}
		return allDataString;
	}, '');
	allDataString = allDataString.trim();

	return allDataString;
}

function cleanBodyString(body) {
	//console.log("cleanBodyString: "+body);
	var dataParseBeginIndex =  body.indexOf(ANGULAR_MODULE_APP_SMART_TABLE_DELIMENTER);
	dataParseBeginIndex += ANGULAR_MODULE_APP_SMART_TABLE_DELIMENTER.length;
	var dataParseEndIndex =	 body.lastIndexOf(SCOPE_SAFE_LICENSES_CONCAT_DELIMENTER);
	body = body.substring(dataParseBeginIndex, dataParseEndIndex);
	body = body.replace(CLEAN_UP_STRING, "");
	body = body.replace(CLEAN_UP_STRING_2, "");
	body = body.replace(/  +/g, "");
	body = body.replace(RIGHT_BRACE_RIGHT_BRACKET_DELIMENTER, "");
	
	return body;
}

// [jwarden 4.19.2017] Yet another pure function, love it.
// However, if you're going to use mutable state, use let instead of var.
// Knowing you, you'll head to the dark side and continue to a 100% usage of const,
// but situations like this occur where it's easier to just create a var right quick
// and do some line by line parsing, addition, whatever. If you use let,
// the runtime and compilers will help you if you accidentally re-use it,
// ecspecially where you have multiple nested area like in here.
function createCompanies(body) {
	//console.log("createCompanies: "+body);

	let rawCompanyPropertyStringArray = body.split(RIGHT_BRACE_COMMA_DELIMENTER);
	let rawCompanyPropertyStringCount = rawCompanyPropertyStringArray.length;

	for (let i=0;i<rawCompanyPropertyStringCount;i++) {
		let companyString = rawCompanyPropertyStringArray[i];
		let keyValuePairArray = companyString.split(COMMA_DELIMETER);
		let company = {};
		let keyValuePairCount = keyValuePairArray.length;
		for(let j=0;j<keyValuePairCount;j++) {
			let keyValuePair = keyValuePairArray[j].split(COLON_DELIMENTER);
			let propertyName = keyValuePair[0];
			let propertyValue = keyValuePair[1];
			propertyName = propertyName.replace(LICENSE_NUMBER_CLEAN_WITH_SINGLE_RIGHT_DOUBLE_QUOTE, LICENSE_NUMBER_CLEAN_WITH_SINGLE_RIGHT_DOUBLE_QUOTE);
			propertyName = propertyName.replace(LICENSE_NUMBER_CONTAMINATED_02, LICENSE_NUMBER_CLEAN_WITH_SINGLE_RIGHT_DOUBLE_QUOTE);

			company[propertyName] = propertyValue;
		}
		companiesArray.push(company);
	}
}

function cleanRetailBodyString(body) {
	//console.log("cleanRetailBodyString: "+body);
	body = extractSubString(body);
	body = replaceGarbageFromBodyString(body);
	
	return body;
}

function extractSubString(body) {
	//console.log("extractSubString: "+body);
	var dataParseBeginIndex =  body.indexOf(ANGULAR_MODULE_APP_SMART_TABLE_DELIMENTER);
	dataParseBeginIndex += ANGULAR_MODULE_APP_SMART_TABLE_DELIMENTER.length;
	var dataParseEndIndex =	 body.lastIndexOf(SCOPE_SAFE_RETAILERS_DELIMETER);
	body = body.substring(dataParseBeginIndex, dataParseEndIndex);
	
	return body
}

function replaceGarbageFromBodyString(body) {
	//console.log("replaceGarbageFromBodyString: "+body);
	body = body.replace(RETAILER_CONTROLLER_DELIMENTER, "");
	body = body.replace(SCOPE_FILTER_FUNCTION_DELIMETER, "");
	body = body.replace(SCOPE_RETAILERS_DELIMETER, "");
	body = body.replace(BODY_STRING_GARBAGE_04, "");
	body = body.replace(RIGHT_BRACKET_DELIMETER, "");
	body = body.replace(SCOPE_SAFE_RETAILERS_DELIMETER, "");
	body = body.replace(LEFT_BRACKET_DELIMETER, "");
	body = body.replace(/  +/g, "");
	body = body.replace(RIGHT_BRACE_RIGHT_BRACKET_DELIMENTER, "");
	
	return body;
}

function createRetailers(body) {
	//console.log("createRetailers: "+body);
	var rawCompanyPropertyStringArray = body.split(RIGHT_BRACE_COMMA_DELIMENTER);
	var rawCompanyPropertyStringCount = rawCompanyPropertyStringArray.length;

	for (var i=0;i<rawCompanyPropertyStringCount;i++) {
		var companyString = rawCompanyPropertyStringArray[i];
		var keyValuePairArray = companyString.split(",");
		var retailer = {};
		var keyValuePairCount = keyValuePairArray.length;
		for(var j=0;j<keyValuePairCount;j++) {
			var keyValuePair = keyValuePairArray[j].split(":");
			var propertyName = keyValuePair[0];
			var propertyValue = keyValuePair[1];
			propertyName = propertyName.replace('{"licensenumber', LICENSE_NUMBER_CLEAN_WITH_SINGLE_RIGHT_DOUBLE_QUOTE);
			propertyName = propertyName.replace('["licensenumber', LICENSE_NUMBER_CLEAN_WITH_SINGLE_RIGHT_DOUBLE_QUOTE);

			retailer[propertyName] = propertyValue;
		}
		retailersArray.push(retailer);
	}
}

function buildRawRetailDataString() {
	var retailerCount = retailersArray.length;
	var allRetailerDataString = "";
	for (var i=0;i<retailerCount;i++) {
		var retailer = retailersArray[i];
		for (var prop in retailer) {
			//console.log(prop + ":" + retailer[prop]);
			allRetailerDataString += prop + ":" + retailer[prop];
		}
	}

	allRetailerDataString = allRetailerDataString.trim();

	return allRetailerDataString;
}

function getRetailerByID(id) {
	id = id.toString();
	//console.log("getRetailerByID: "+id);
	var rt;
	var retailerCount = retailersArray.length;
	for (var i=0;i<retailerCount;i++) {
		if (retailersArray[i][LICENSE_NUMBER_SEARCH_KEY]) {
			var currentID = retailersArray[i][LICENSE_NUMBER_SEARCH_KEY];
			currentID = currentID.toString();
			currentID = currentID.substring(1, currentID.length-1);
			var isRetailerIDMatch = (id == currentID);
			if (isRetailerIDMatch) {
				rt = retailersArray[i];
			}
		}
	}
	return rt;
}

function getRetailersByCity(city) {
	//console.log("getRetailersByCity: "+city);
	var retailersByCityArray = [];
	var retailerCount = retailersArray.length;
	for (var i=0;i<retailerCount;i++) {
		if (retailersArray[i]['"city"']) {
			var retailerCity = retailersArray[i]['"city"'];
			retailerCity = retailerCity.toString();
			retailerCity = retailerCity.substring(1, retailerCity.length-1);
			var isCityMatch = (city.toString().toLowerCase() == retailerCity.toLowerCase());
			if (isCityMatch) {
				retailersByCityArray.push(retailersArray[i]);
			}
		}
	}
	return retailersByCityArray;
}

function getRetailersByCounty(county) {
	county = county.toString();
	//console.log("getRetailersByCounty: "+county);
	var a = [];
	var c = retailersArray.length;
	for (var i=0;i<c;i++) {
		if (retailersArray[i]['"county"']) {
			var currentCounty = retailersArray[i]['"county"'];
			currentCounty = currentCounty.toString();
			currentCounty = currentCounty.substring(1, currentCounty.length-1).toLowerCase();
			//console.log("currentCounty: "+currentCounty);
			var isMatch = (county.toLowerCase() == currentCounty);
			if (isMatch) {
				a.push(retailersArray[i]);
			}
		}
	}
	return a;
}

function archiveRawCompanyData(allDataString) {
	//console.log("archiveRawCompanyData: "+allDataString);
	fs.writeFile(fullCompanyArchivePath(), allDataString);
}

function archiveRawRetailData(allDataString) {
	//console.log("archiveRawRetailData: "+allDataString);
	fs.writeFile(fullRetailArchivePath(), allDataString);
}

//(function(){
//  console.log('Hello World!');
//})();



tinyreq(PRODUCER_PROCESSORS_REQUEST_URL, (err, body) => {
    //console.log("err: "+err); //
	start = Date.now();
	end = Date.now();
	producerProcessorsResponse(body);
});

tinyreq(RETAILERS_REQUEST_URL, (err, body) => {
    //console.log("err: "+err); // || body);
	start1 = Date.now();
	end1 = Date.now();
	requestRetailersResponse(body);
});

var start = Date.now();
var end = Date.now();

function requestRetailersResponse(body) {
	//console.log("requestRetailersResponse: "+body);
	body = cleanRetailBodyString(body);
	
	var elapsed = end - start;
	console.log("requestRetailersResponse::elapsed: "+elapsed);
	createRetailers(body);
	var archiveData = buildRawRetailDataString();
	archiveRawRetailData(archiveData);
	return body;
}

var start1 = Date.now();
var end1 = Date.now();

// function producerProcessorsResponse(body) {
// 	//console.log("producerProcessorsResponse: "+body);
	
// 	var elapsed1 = end1 - start1;
// 	console.log("producerProcessorsResponse::elapsed: "+elapsed1);
	
// 	body = cleanRetailBodyString(body);
// 	return body;
// }

//tinyreq(WSLCB_MAPS_ARCGIS_COM_APPS_VIEW_INDEX, producersProcessorsWSLCBRequest);
//const DISPENSARIES_REQUEST_URL = "http://weedmaps.com/dispensaries/in/dispensaries/in/united-states/washington";
//const DISPENSARIES_REQUEST_URL = "http://weedmaps.com/dispensaries/in/united-states/washington/everettsnohomish";
//tinyreq(DISPENSARIES_REQUEST_URL, function (err, body) {

// [jwarden 4.19.2017] Expose these guys so you can test them. In CommonJS and Node, do:
module.exports = {
	RETAILERS_ARCHIVE_SAVED_SUCCESS_MESSAGE: RETAILERS_ARCHIVE_SAVED_SUCCESS_MESSAGE,
	producerProcessorsResponse: producerProcessorsResponse
};

// or this syntax if you don't intend on changing the names, no need for the :
module.exports = {
	RETAILERS_ARCHIVE_SAVED_SUCCESS_MESSAGE,
	producerProcessorsResponse
};

// or in ES6, go:

export function producerProcessorsResponse(body) {
	//console.log("producerProcessorsResponse: "+body);
	
	var elapsed1 = end1 - start1;
	console.log("producerProcessorsResponse::elapsed: "+elapsed1);
	
	body = cleanRetailBodyString(body);
	return body;
}

// or, if it were an Arrow function in ES6, go:

// export const producerProcessorsResponse = body =>
// {
// 	//console.log("producerProcessorsResponse: "+body);
	
// 	var elapsed1 = end1 - start1;
// 	console.log("producerProcessorsResponse::elapsed: "+elapsed1);
	
// 	body = cleanRetailBodyString(body);
// 	return body;
// };