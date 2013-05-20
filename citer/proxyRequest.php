<?php

require_once './config.php'; //library credentials

require_once '../library/libZotero/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);


$requestUrl         = isset($_GET["requestUrl"]) ? $_GET["requestUrl"] : false;

//limit requestUrl to zotero.org
if(strpos($requestUrl, 'zotero.org') === false){
//    die;
    $ignoreHeaders = true;
}
else {
    $ignoreHeaders = false;
}

//optionally add api key to request here so JS does not need a copy
if(isset($addKeyAtProxy) && $addKeyAtProxy === true){
    if(strpos($requestUrl, '?') !== false){
        $requestUrl .= "&key=$apiKey";
    }
    else {
        $requestUrl .= "?key=$apiKey";
    }
}

//act as transparent proxy until JS lib can make requests directly to api
$requestMethod = $_SERVER['REQUEST_METHOD'];

//raw body of the request
$rawbody = @file_get_contents('php://input');

$relevantHeaders = array("If-Modified-Since", 
                         "If-Modified-Since-Version", 
                         "Last-Modified", 
                         "Last-Modified-Version", 
                         "If-Unmodified-Since-Version", 
                         "Zotero-Write-Token",
                         "If-Match",
                         "If-None-Match",
                         "Zotero-API-Version",
                         "Backoff",
                         "Retry-After",
                         "Content-Type"
                          );
$aheaders = apache_request_headers();
$headers = array();
foreach($aheaders as $key=>$val){
    if(in_array($key, $relevantHeaders)){
        $headers[$key] = $val;
    }
}
$response = $library->proxyHttpRequest($requestUrl, strtoupper($requestMethod), $rawbody, $headers);

$ignoreResponseHeaders = array("transfer-encoding");

if($ignoreHeaders){
    echo $response->getRawBody();
    die;
}

//take the http response we got and send all of it along
$httpHeaders = $response->getHeaders();
$statusSent = false;
foreach($httpHeaders as $key=>$val){
    $headerText = $key . ': ' . $val;
    if(!$statusSent){
        header($headerText, true, $response->getStatus());
        $statusSent = true;
    }
    else{
        header($headerText);
    }
}

echo $response->getRawBody();
