<?php
ini_set('memory_limit', '1024M');
ini_set('display_errors', 'On');
error_reporting('E_All');

//Global Variables
$countryCode = $_REQUEST['countryCode'];
$count = $_REQUEST['count'];

//REST Countries API Call
$RESTStartTime = microtime(true);
$url='https://restcountries.eu/rest/v2/alpha/' . $countryCode . '?fields=name;callingCodes;capital;population;latlng;timezones;borders;currencies;languages;flag';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeRestCountries = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === 'false') {
    $error_msg = curl_error($ch);
    $output['status']['restCountries'] = $responseCode;
}
else {
    $output['status']['restCountries'] = '200';
    $output['data']['restCountries'] = $decodeRestCountries;
    $output['data']['restCountries']['capitalCity'] = $decodeRestCountries['capital'];
    $output['data']['restCountries']['executedIn'] = intval((microtime(true) - $RESTStartTime) * 1000) . " ms";
}
    //REST Countries Variables for use in other API calls
    $capitalCityPre = $decodeRestCountries['capital'];
    $capitalCity = str_replace(" ", "+", $capitalCityPre);
    $currency = $decodeRestCountries['currencies'][0]['code']; 
    $language = $decodeRestCountries['languages'][0]['iso639_1']; 
    $countryPre = $decodeRestCountries['name'];
    $country = str_replace(" ", "+", $countryPre);


//OpenCage API Call
$openCageStartTime = microtime(true);
$url='https://api.opencagedata.com/geocode/v1/json?q=' . $capitalCity . '&key=15f42192f2eb48ae9ea03a488b763e6e&limit=1';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeOpenCage = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['openCage'] = $responseCode;
}
else {
    $output['status']['openCage'] = '200';
    $output['data']['openCage']['lnglat'] = $decodeOpenCage['results'][0]['geometry'];
    $output['data']['openCage']['driveOn'] = $decodeOpenCage['results'][0]['annotations']['roadinfo'];
    $output['data']['openCage']['timezone'] = $decodeOpenCage['results'][0]['annotations']['timezone'];
    $output['data']['openCage']['sun'] = $decodeOpenCage['results'][0]['annotations']['sun'];
    $output['data']['openCage']['executedIn'] = intval((microtime(true) - $openCageStartTime) * 1000) . " ms";
}
    //OpenCage Variables for use in other API calls. 
    $capitalLat = $decodeOpenCage['results'][0]['geometry']['lat'];
    $capitalLong = $decodeOpenCage['results'][0]['geometry']['lng'];



//Get Landmarks
$url = 'https://discover.search.hereapi.com/v1/discover?apiKey=3S-zrJQXSo9U-XZPmLE5hNkbu1AFhh6RCkiYfDXgfWM&q=historical+monument&in=circle:' . $capitalLat . ',' . $capitalLong . ';r=1000000&limit=50&lang=en';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeLandmarks = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['landMarks'] = $responseCode;
}
else {
    $output['status']['landMarks'] = '200';
    $output['data']['landMarks'] = $decodeLandmarks;
}

//Get Hotels
$url = 'https://discover.search.hereapi.com/v1/discover?apiKey=3S-zrJQXSo9U-XZPmLE5hNkbu1AFhh6RCkiYfDXgfWM&q=hotels&in=circle:' . $capitalLat . ',' . $capitalLong . ';r=1000000&limit=50&lang=en';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeHotels = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['hotels'] = $responseCode;
}
else {
    $output['status']['hotels'] = '200';
    $output['data']['hotels'] = $decodeHotels;
}



//Open Weather API Call 
$openWeatherStartTime = microtime(true);
$url='api.openweathermap.org/data/2.5/weather?q=' . $capitalCity . '&appid=eba38bbee9357eefd11c81f48c80296d&units=metric';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeOpenWeather = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['openWeather'] = $responseCode;
}
else {
    $output['status']['openWeather'] = '200';
    $output['data']['openWeather']['temp'] = $decodeOpenWeather['main'];
    $output['data']['openWeather']['weather'] = $decodeOpenWeather['weather'][0];
    $output['data']['openWeather']['wind'] = $decodeOpenWeather['wind']['speed']; 
    $output['data']['openWeather']['executedIn'] = intval((microtime(true) - $openWeatherStartTime) * 1000) . " ms";
}




//Imgur API Call
$imgurStartTime = microtime(true);
$url = 'https://api.imgur.com/3/gallery/search/sort=top?q=' . $country . '+landscape';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Client-ID 29c53e267ee3462"]);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);

$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false || $result === null) {
    $error_msg = curl_error($ch);
    $output['status']['imgur'] = $responseCode;
}
else {
    $decodeImgur = json_decode($result,true);
    $output['status']['imgur'] = '200';
    $output['data']['imgur'] = $decodeImgur['data'][0]['images'][0]; 
    $output['data']['imgur']['executedIn'] = intval((microtime(true) - $imgurStartTime) * 1000) . " ms";
}




//Wikipedia API Call
$wikiStartTime = microtime(true);
$url = 'http://api.geonames.org/wikipediaSearchJSON?q=' . $country . '&title&maxRows=3&username=butler2212';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeWiki = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['wiki'] = $responseCode;
}
else {
    $output['status']['wiki'] = '200';
    $output['data']['wiki'] = $decodeWiki['geonames'];
    $output['data']['wiki']['executedIn'] = intval((microtime(true) - $wikiStartTime) * 1000) . " ms";
}




//Covid-19 Global Tracker API call
$covidStartTime = microtime(true);
$url = 'https://covid-19-data.p.rapidapi.com/country/code?code=' . $countryCode . '&date=2020-06-10';
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: covid-19-data.p.rapidapi.com", "x-rapidapi-key: 57f3999ddamshed3b5eb66730263p1a5d3cjsn452d978dc8dd"]);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result = curl_exec($ch);
curl_close($ch);
$decodeCovid = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['covid'] = $responseCode;
}
else {
    $output['status']['covid'] = '200';
    $output['data']['covid'] = $decodeCovid; 
    $output['data']['covid']['executedIn'] = intval((microtime(true) - $covidStartTime) * 1000) . " ms";
}





//Open Exchange Rates API Call
$exchangeStartTime = microtime(true);
$curl = curl_init();
$url='https://api.exchangerate.host/convert?from=GPB&to=' . $currency;
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
$result=curl_exec($ch);
curl_close($ch);
$decodeExchangeRate = json_decode($result,true);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $error_msg = curl_error($ch);
    $output['status']['exchangeRate'] = $responseCode;
}
else {
    $output['status']['exchangeRate'] = '200';
    $output['data']['exchangeRate'] = $decodeExchangeRate;
    $output['data']['exchangeRate']['executedIn'] = intval((microtime(true) - $exchangeStartTime) * 1000) . " ms";
}


//header('Content-Type: application/json; charset=UTF-8');
$output['status']['name'] == 'ok';
echo json_encode($output); 
