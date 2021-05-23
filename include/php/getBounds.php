<?php
ini_set('memory_limit', '1024M');
    $countryCode = $_REQUEST['countryCode'];
    $result = array();

    $string = file_get_contents('../js/countries.json');
    $json = json_decode($string, true);
    $baseArray = $json['features'];

    foreach ($baseArray as $key => $value) {;
      if ($value['properties']['ISO_A2'] == $countryCode) {
        $result = $value;
      }
    }

  $output['data'] = $result['geometry'];
  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  echo json_encode($output); 
?>