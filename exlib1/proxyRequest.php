<?php

require_once './config.php'; //library credentials

require_once '../library/libZotero/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);


$requestUrl         = isset($_GET["requestUrl"]) ? $_GET["requestUrl"] : false;

//limit requestUrl to zotero.org
if(strpos($requestUrl, 'zotero.org') === false){
    die;
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

$headers = apache_request_headers();

$response = $library->proxyHttpRequest($requestUrl, strtoupper($requestMethod), $rawbody, $headers);

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

echo $response->getBody();

//getHeader function from Zend_Controller_Request_Http
function getHeader($header){
    // Try to get it from the $_SERVER array first
    $temp = 'HTTP_' . strtoupper(str_replace('-', '_', $header));
    if (isset($_SERVER[$temp])) {
        return $_SERVER[$temp];
    }
    
    // This seems to be the only way to get the Authorization header on
    // Apache
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers[$header])) {
            return $headers[$header];
        }
        $header = strtolower($header);
        foreach ($headers as $key => $value) {
            if (strtolower($key) == $header) {
                return $value;
            }
        }
    }
    
    return false;
}

function parsePathVars($basePath, $pathname = null) {
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    
    if(!$pathname){
        $pathname = $this->getRequest()->getRequestUri();
    }
    
    $replaced = trim(str_replace($basePath, '', $pathname), '/');
    
    $split_replaced = explode('/', $replaced);
    $pathVars = array();
    if(count($split_replaced) == 1) return $pathVars;
    for($i = 0; $i < count($split_replaced); $i = $i + 2){
        $pathVar = isset($pathVars[$split_replaced[$i]]) ? $pathVars[$split_replaced[$i]] : null;
        //if var already present change to array and/or push
        if($pathVar){
            if(is_array($pathVar)){
                array_push($pathVar, $split_replaced[$i+1]);
            }
            else{
                $ar = array($pathVar);
                array_push($ar, $split_replaced[$i+1]);
                $pathVar = $ar;
            }
        }
        //otherwise just set the value in the object
        else{
            $pathVar = $split_replaced[$i+1];
        }
        $pathVars[$split_replaced[$i]] = $pathVar;
    }
    return $pathVars;
    
}

function proper_parse_str($str) {
    # result array
    $arr = array();

    # split on outer delimiter
    $pairs = explode('&', $str);

    # loop through each pair
    foreach ($pairs as $i) {
        # split into name and value
        list($name,$value) = explode('=', $i, 2);
        $name = urldecode($name);
        $value = urldecode($value);
        # if name already exists
        if( isset($arr[$name]) ) {
            # stick multiple values into an array
            if( is_array($arr[$name]) ) {
                $arr[$name][] = $value;
            }
            else {
                $arr[$name] = array($arr[$name], $value);
            }
        }
        # otherwise, simply stick it in a scalar
        else {
          $arr[$name] = $value;
        }
    }

    # return result array
    return $arr;
}
