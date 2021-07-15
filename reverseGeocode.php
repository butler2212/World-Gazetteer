<?php

ini_set('display_errors', 'On');
error_reporting('E_All');

$latitude = $_REQUEST['latitude'];
$longitude = $_REQUEST['longitude'];

$url='https://api.opencagedata.com/geocode/v1/json?q=' . $latitude . '+' . $longitude . '&key=c479b2c3404346dcae6e1df470071c40';

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode['results'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>