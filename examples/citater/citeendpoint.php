<?php
/*
 *  citeendpoint.php forwards requests from made from JS and forwards it
 *  to the citation or translation server, then returns the response
 */
require_once './config.php'; //endpoints
require_once '../library/libZotero/build/libZoteroSingle.php';


$queryString = $_SERVER['QUERY_STRING'];

$requestUrl = $citationEndpoint . '?' . $queryString;
$requestMethod = 'POST';

//raw body of the request
$rawbody = @file_get_contents('php://input');


$ch = curl_init();
$httpHeaders = array();
$httpHeaders[] = "Content-Type: application/json";

curl_setopt($ch, CURLOPT_URL, $requestUrl);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLINFO_HEADER_OUT, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $rawbody);

$responseBody = curl_exec($ch);
$responseInfo = curl_getinfo($ch);
$zresponse = libZotero_Http_Response::fromString($responseBody);

echo $zresponse->getRawBody();
die;
