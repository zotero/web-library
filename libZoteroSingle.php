<?php


/**
 * Zotero specific exception class with no added functionality
 * 
 * @package libZotero
 */
class Zotero_Exception extends Exception
{
    
}


 /**
  * Explicit mappings for Zotero
  *
  * @package    libZotero
  */
class Zotero_Mappings
{
    public $itemTypes = array();
    public $itemFields = array();
    public $itemTypeCreatorTypes = array();
    public $creatorFields = array();
    
    
}



 /**
  * Representation of a Zotero Feed (ATOM)
  * 
  * @package    libZotero
  */
class Zotero_Feed
{
    /**
     * @var string
     */
    public $lastModified;

    /**
     * @var string
     */
    public $title;

    /**
     * @var string
     */
    public $dateUpdated;
    
    /**
     * @var int
     */
    public $totalResults;
    
    /**
     * @var int
     */
    public $apiVersion;
    
    /**
     * @var string
     */
    public $id;
    
    /**
     * @var array
     */
    public $links = array();
    
    /**
     * @var array
     */
    public $entries = array();
    
    public $entryNodes;
    
    public function __construct($doc)
    {
        if(!($doc instanceof DOMDocument)){
            $domdoc = new DOMDocument();
            $domdoc->loadXml($doc);
            $doc = $domdoc;
        }
        
        foreach($doc->getElementsByTagName("feed") as $feed){
            $this->title        = $feed->getElementsByTagName("title")->item(0)->nodeValue;
            $this->id           = $feed->getElementsByTagName("id")->item(0)->nodeValue;
            $this->dateUpdated  = $feed->getElementsByTagName("updated")->item(0)->nodeValue;
            $this->apiVersion   = $feed->getElementsByTagName("apiVersion")->item(0)->nodeValue;
            $this->totalResults = $feed->getElementsByTagName("totalResults")->item(0)->nodeValue;
            
            // Get all of the link elements
            foreach($feed->childNodes as $childNode){
                if($childNode->nodeName == "link"){
                    $linkNode = $childNode;
                    $this->links[$linkNode->getAttribute('rel')] = array('type'=>$linkNode->getAttribute('type'), 'href'=>$linkNode->getAttribute('href'));
                }
            }
            
            $entryNodes = $doc->getElementsByTagName("entry");
            $this->entryNodes = $entryNodes;
            /*
            //detect zotero entry type with sample entry node and parse entries appropriately
            $firstEntry = $entryNodes->item(0);
            $this->entryType = $this->detectZoteroEntryType($firstEntry);
            foreach($entryNodes as $entryNode){
                switch($this->entryType) {
                    case 'item':       $entry = new Zotero_Item($entryNode); break;
                    case 'collection': $entry = new Zotero_Collection($entryNode); break;
                    case 'group':      $entry = new Zotero_Group($entryNode); break;
                    case 'user':       $entry = new Zotero_User($entryNode); break;
                    case 'tag':        $entry = new Zotero_Tag($entryNode); break;
                    default:           throw new Zend_Exception("Unknown entry type");
                }
                $this->entries[] = $entry;
            }
            */
        }
    }
    
    public function detectZoteroEntryType($entryNode){
        $itemTypeNodes = $entryNode->getElementsByTagName("itemType");
        $numCollectionsNodes = $entryNode->getElementsByTagName("numCollections");
        $numItemsNodes = $entryNode->getElementsByTagName("numItems");
        /*
        $itemType = $xpath->evaluate("//zapi:itemType")->item(0)->nodeValue;
        $collectionKey = $xpath->evaluate("//zapi:collectionKey")->item(0)->nodeValue;
        $numItems = $xpath->evaluate("//zapi:numItems")->item(0)->nodeValue;
        */
        if($itemTypeNodes->length) return 'item';
        if($numCollectionsNodes->length) return 'collection';
        if($numItemsNodes->length && !($collectionKeyNodes->length)) return 'tag';
        //if($userID) return 'user';
        //if($groupID) return 'group';
    }
    
    public function nestEntries(){
        // Look for item and collection entries with rel="up" links and move them under their parent entry
        if($nest && ($entryType == "collections" || $entryType == "items")){
            foreach($this->feed->entries as $key => $entry){
                if(isset($entry->links['up']['application/atom+xml'])){                    
                    // This flag will be set to true if a parent is found
                    $this->foundParent = false;
                    // Search for a parent
                    $this->nestEntry($entry, $this->feed->entries);
                    // If we found a parent to nest under, remove the entry from the top level
                    if($this->foundParent == true){
                        unset($this->feed->entries[$key]);
                    }
                }
            }            
        }
    }
    
    public function dataObject()
    {
        $jsonItem = new stdClass;
        
        $jsonItem->lastModified = $this->lastModified;
        $jsonItem->title = $this->title;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->totalResults = $this->totalResults;
        $jsonItem->id = $this->id;
        
//        foreach($this->links as $link){
//            $jsonItem->links[] = $link;
//        }
        $jsonItem->links = $this->links;
        $jsonItem->entries = array();
        foreach($this->entries as $entry){
            $jsonItem->entries[] = $entry->dataObject();
        }
        
        return $jsonItem;
    }
}


 /**
  * Zotero API Feed entry (ATOM)
  * 
  * @package libZotero
  */
class Zotero_Entry
{
    /**
     * @var string
     */
    public $title;
    
    /**
     * @var string
     */
    public $dateAdded;

    /**
     * @var string
     */
    public $dateUpdated;
    
    /**
     * @var string
     */
    public $id;
    
    /**
     * @var array
     */
    public $links = array();
    
    /**
     * @var array
     */
    public $author = array();
    
    public $contentArray = array();
    
    /**
     * @var array
     */
    public $entries = array();
    
    public function __construct($entryNode)
    {
      $parseFields = array('title', 'id', 'dateAdded', 'dateUpdated', 'author');
      $this->title       = $entryNode->getElementsByTagName("title")->item(0)->nodeValue;
      $this->id          = $entryNode->getElementsByTagName("id")->item(0)->nodeValue;
      $this->dateAdded   = $entryNode->getElementsByTagName("published")->item(0)->nodeValue;
      $this->dateUpdated = $entryNode->getElementsByTagName("updated")->item(0)->nodeValue;
      
      //try to parse author node if it's there
      try{
          $author = array();
          $authorNode = $entryNode->getElementsByTagName('author')->item(0);
          $author['name'] = $authorNode->getElementsByTagName('name')->item(0)->nodeValue;
          $author['uri'] = $authorNode->getElementsByTagName('uri')->item(0)->nodeValue;
          
          $this->author = $author;
      }
      catch(Exception $e){
          
      }
    
      // Get all of the link elements
      foreach($entryNode->getElementsByTagName("link") as $linkNode){
          if($linkNode->getAttribute('rel') == "enclosure"){
              $this->links['enclosure'][$linkNode->getAttribute('type')] = array(
                                          'href'=>$linkNode->getAttribute('href'), 
                                          'title'=>$linkNode->getAttribute('title'), 
                                          'length'=>$linkNode->getAttribute('length'));
          }
          else{
              $this->links[$linkNode->getAttribute('rel')][$linkNode->getAttribute('type')] = array(
                                          'href'=>$linkNode->getAttribute('href')
                                          );
          }
      }
      
    }
    
    public function getContentType($entryNode){
      $contentNode = $entryNode->getElementsByTagName('content')->item(0);
      if($contentNode) return $contentNode->getAttribute('type') || $contentNode->getAttribute('zapi:type');
      else return false;
    }
    
}
 /**
  * Representation of a Zotero Collection
  *
  * @package    libZotero
  * @see        Zotero_Entry
  */
class Zotero_Collection extends Zotero_Entry
{
    /**
     * @var int
     */
    public $collectionKey = null;
    
    public $name = '';
    /**
     * @var int
     */
    public $numCollections = 0;
    
    /**
     * @var int
     */
    public $numItems = 0;
    
    public $topLevel;
    /**
     * @var string
     */
    public $parentCollectionKey = false;
    
    public $childKeys = array();
    
    public function __construct($entryNode)
    {
        if(!$entryNode){
            return;
        }
        parent::__construct($entryNode);
        // Extract the collectionKey
        $this->collectionKey = $entryNode->getElementsByTagNameNS('*', 'key')->item(0)->nodeValue;
        $this->numCollections = $entryNode->getElementsByTagName('numCollections')->item(0)->nodeValue;
        $this->numItems = $entryNode->getElementsByTagName('numItems')->item(0)->nodeValue;
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        $contentType = parent::getContentType($entryNode);
        if($contentType == 'application/json'){
            $this->contentArray = json_decode($contentNode->nodeValue, true);
            $this->etag = $contentNode->getAttribute('etag');
            $this->parentCollectionKey = $this->contentArray['parent'];
            $this->name = $this->contentArray['name'];
        }
        elseif($contentType == 'xhtml'){
            //$this->parseXhtmlContent($contentNode);
        }
        
    }
    
    public function collectionJson(){
        return json_encode(array('name'=>$collection->name, 'parent'=>$collection->parentCollectionKey));
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        $jsonItem->links = $this->links;
        
        $jsonItem->collectionKey = $this->collectionKey;
        $jsonItem->childKeys = $this->childKeys;
        $jsonItem->parentCollectionKey = $this->parentCollectionKey;
        return $jsonItem;
    }
}


/**
 * Representation of the set of collections belonging to a particular Zotero library
 * 
 * @package libZotero
 */
class Zotero_Collections
{
    public $orderedArray;
    public $collectionObjects;
    public $dirty;
    public $loaded;
    
    public function __construct(){
        $this->orderedArray = array();
        $this->collectionObjects = array();
    }
    
    public static function sortByTitleCompare($a, $b){
        if(strtolower($a->title) == strtolower($b->title)){
            return 0;
        }
        if(strtolower($a->title) < strtolower($b->title)){
            return -1;
        }
        return 1;
    }
    
    public function addCollection($collection) {
        $this->collectionObjects[$collection->collectionKey] = $collection;
        $this->orderedArray[] = $collection;
    }
    
    public function getCollection($collectionKey) {
        if(isset($this->collectionObjects[$collectionKey])){
            return $this->collectionObjects[$collectionKey];
        }
        return false;
    }
    
    public function addCollectionsFromFeed($feed) {
        $entries = $feed->entryNodes;
        if(empty($entries)){
            var_dump($feed);
            die;
            return array();
        }
        $addedCollections = array();
        foreach($entries as $entry){
            $collection = new Zotero_Collection($entry);
            $this->addCollection($collection);
            $addedCollections[] = $collection;
        }
        return $addedCollections;
    }
    
    //add keys of child collections to array
    public function nestCollections(){
        foreach($this->collectionObjects as $key=>$collection){
            if($collection->parentCollectionKey){
                $parentCollection = $this->getCollection($collection->parentCollectionKey);
                $parentCollection->childKeys[] = $collection->collectionKey;
            }
        }
    }
    
    public function orderCollections(){
        $orderedArray = array();
        foreach($this->collectionObjects as $key=>$collection){
            $orderedArray[] = $collection;
        }
        usort($orderedArray, array('Zotero_Collections', 'sortByTitleCompare'));
        $this->orderedArray = $orderedArray;
        return $this->orderedArray;
    }
    
    public function topCollectionKeys($collections){
        $topCollections = array();
        foreach($collections as $collection){
            if($collection->parentCollectionKey == false){
                $topCollections[] = $collection->collectionKey;
            }
        }
        return $topCollections;
    }
    
    public function collectionsJson(){
        $collections = array();
        foreach($this->collectionObjects as $collection){
            $collections[] = $collection->dataObject();
        }
        
        return json_encode($collections);
    }
}



/**
 * Representation of a set of items belonging to a particular Zotero library
 * 
 * @package  libZotero
 */
class Zotero_Items
{
    public $itemObjects = array();
    
    //get an item from this container of items by itemKey
    public function getItem($itemKey) {
        if(isset($this->itemObjects[$itemKey])){
            return $this->itemObjects[$itemKey];
        }
        return false;
    }
    
    //add a Zotero_Item to this container of items
    public function addItem($item) {
        $itemKey = $item->itemKey;
        $this->itemObjects[$itemKey] = $item;
    }
    
    //add items to this container from a Zotero_Feed object
    public function addItemsFromFeed($feed) {
        $entries = $feed->entryNodes;
        $addedItems = array();
        foreach($entries as $entry){
            $item = new Zotero_Item($entry);
            $this->addItem($item);
            $addedItems[] = $item;
        }
        return $addedItems;
    }
    
    //replace an item in this container with a new Zotero_Item object with the same itemKey
    //useful for example after updating an item when the etag is out of date and to make sure
    //the current item we have reflects the best knowledge of the api
    public function replaceItem($item) {
        $this->addItem($item);
    }
    
    public function addChildKeys() {
        //empty existing childkeys first
        foreach($this->itemObjects as $key=>$item){
            $item->childKeys = array();
        }
        
        //run through and add item keys to their parent's item if we have the parent
        foreach($this->itemObjects as $key=>$item){
            if($item->parentKey){
                $pitem = $this->getItem($item->parentKey);
                if($pitem){
                    $pitem->childKeys[] = $item->itemKey;
                }
            }
        }
    }
    
    public function getPreloadedChildren($item){
        $children = array();
        foreach($item->childKeys as $childKey){
            $childItem = $this->getItem($childKey);
            if($childItem){
                $children[] = $childItem;
            }
        }
        return $children;
    }
}


/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://framework.zend.com/license/new-bsd
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@zend.com so we can send you a copy immediately.
 *
 * @category   Zend
 * @package    Zend_Http
 * @subpackage Response
 * @version    $Id: Response.php 23484 2010-12-10 03:57:59Z mjh_ca $
 * @copyright  Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */

/**
 * Zend_Http_Response represents an HTTP 1.0 / 1.1 response message. It
 * includes easy access to all the response's different elemts, as well as some
 * convenience methods for parsing and validating HTTP responses.
 *
 * @package    Zend_Http
 * @subpackage Response
 * @copyright  Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
//class Zend_Http_Response
class libZotero_Http_Response
{
    /**
     * List of all known HTTP response codes - used by responseCodeAsText() to
     * translate numeric codes to messages.
     *
     * @var array
     */
    protected static $messages = array(
        // Informational 1xx
        100 => 'Continue',
        101 => 'Switching Protocols',

        // Success 2xx
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative Information',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',

        // Redirection 3xx
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',  // 1.1
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        // 306 is deprecated but reserved
        307 => 'Temporary Redirect',

        // Client Error 4xx
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Timeout',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Long',
        415 => 'Unsupported Media Type',
        416 => 'Requested Range Not Satisfiable',
        417 => 'Expectation Failed',

        // Server Error 5xx
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Timeout',
        505 => 'HTTP Version Not Supported',
        509 => 'Bandwidth Limit Exceeded'
    );

    /**
     * The HTTP version (1.0, 1.1)
     *
     * @var string
     */
    protected $version;

    /**
     * The HTTP response code
     *
     * @var int
     */
    protected $code;

    /**
     * The HTTP response code as string
     * (e.g. 'Not Found' for 404 or 'Internal Server Error' for 500)
     *
     * @var string
     */
    protected $message;

    /**
     * The HTTP response headers array
     *
     * @var array
     */
    protected $headers = array();

    /**
     * The HTTP response body
     *
     * @var string
     */
    protected $body;

    /**
     * HTTP response constructor
     *
     * In most cases, you would use Zend_Http_Response::fromString to parse an HTTP
     * response string and create a new Zend_Http_Response object.
     *
     * NOTE: The constructor no longer accepts nulls or empty values for the code and
     * headers and will throw an exception if the passed values do not form a valid HTTP
     * responses.
     *
     * If no message is passed, the message will be guessed according to the response code.
     *
     * @param int    $code Response code (200, 404, ...)
     * @param array  $headers Headers array
     * @param string $body Response body
     * @param string $version HTTP version
     * @param string $message Response code as text
     * @throws Exception
     */
    public function __construct($code, array $headers, $body = null, $version = '1.1', $message = null)
    {
        // Make sure the response code is valid and set it
        if (self::responseCodeAsText($code) === null) {
            
            throw new Exception("{$code} is not a valid HTTP response code");
        }

        $this->code = $code;

        foreach ($headers as $name => $value) {
            if (is_int($name)) {
                $header = explode(":", $value, 2);
                if (count($header) != 2) {
                    
                    throw new Exception("'{$value}' is not a valid HTTP header");
                }

                $name  = trim($header[0]);
                $value = trim($header[1]);
            }

            $this->headers[ucwords(strtolower($name))] = $value;
        }

        // Set the body
        $this->body = $body;

        // Set the HTTP version
        if (! preg_match('|^\d\.\d$|', $version)) {
            
            throw new Exception("Invalid HTTP response version: $version");
        }

        $this->version = $version;

        // If we got the response message, set it. Else, set it according to
        // the response code
        if (is_string($message)) {
            $this->message = $message;
        } else {
            $this->message = self::responseCodeAsText($code);
        }
    }

    /**
     * Check whether the response is an error
     *
     * @return boolean
     */
    public function isError()
    {
        $restype = floor($this->code / 100);
        if ($restype == 4 || $restype == 5) {
            return true;
        }

        return false;
    }

    /**
     * Check whether the response in successful
     *
     * @return boolean
     */
    public function isSuccessful()
    {
        $restype = floor($this->code / 100);
        if ($restype == 2 || $restype == 1) { // Shouldn't 3xx count as success as well ???
            return true;
        }

        return false;
    }

    /**
     * Check whether the response is a redirection
     *
     * @return boolean
     */
    public function isRedirect()
    {
        $restype = floor($this->code / 100);
        if ($restype == 3) {
            return true;
        }

        return false;
    }

    /**
     * Get the response body as string
     *
     * This method returns the body of the HTTP response (the content), as it
     * should be in it's readable version - that is, after decoding it (if it
     * was decoded), deflating it (if it was gzip compressed), etc.
     *
     * If you want to get the raw body (as transfered on wire) use
     * $this->getRawBody() instead.
     *
     * @return string
     */
    public function getBody()
    {
        //added by fcheslack - curl adapter handles these things already so they are transparent to Zend_Response
        return $this->getRawBody();
        
        
        $body = '';

        // Decode the body if it was transfer-encoded
        switch (strtolower($this->getHeader('transfer-encoding'))) {

            // Handle chunked body
            case 'chunked':
                $body = self::decodeChunkedBody($this->body);
                break;

            // No transfer encoding, or unknown encoding extension:
            // return body as is
            default:
                $body = $this->body;
                break;
        }

        // Decode any content-encoding (gzip or deflate) if needed
        switch (strtolower($this->getHeader('content-encoding'))) {

            // Handle gzip encoding
            case 'gzip':
                $body = self::decodeGzip($body);
                break;

            // Handle deflate encoding
            case 'deflate':
                $body = self::decodeDeflate($body);
                break;

            default:
                break;
        }

        return $body;
    }

    /**
     * Get the raw response body (as transfered "on wire") as string
     *
     * If the body is encoded (with Transfer-Encoding, not content-encoding -
     * IE "chunked" body), gzip compressed, etc. it will not be decoded.
     *
     * @return string
     */
    public function getRawBody()
    {
        return $this->body;
    }

    /**
     * Get the HTTP version of the response
     *
     * @return string
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Get the HTTP response status code
     *
     * @return int
     */
    public function getStatus()
    {
        return $this->code;
    }

    /**
     * Return a message describing the HTTP response code
     * (Eg. "OK", "Not Found", "Moved Permanently")
     *
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Get the response headers
     *
     * @return array
     */
    public function getHeaders()
    {
        return $this->headers;
    }

    /**
     * Get a specific header as string, or null if it is not set
     *
     * @param string$header
     * @return string|array|null
     */
    public function getHeader($header)
    {
        $header = ucwords(strtolower($header));
        if (! is_string($header) || ! isset($this->headers[$header])) return null;

        return $this->headers[$header];
    }

    /**
     * Get all headers as string
     *
     * @param boolean $status_line Whether to return the first status line (IE "HTTP 200 OK")
     * @param string $br Line breaks (eg. "\n", "\r\n", "<br />")
     * @return string
     */
    public function getHeadersAsString($status_line = true, $br = "\n")
    {
        $str = '';

        if ($status_line) {
            $str = "HTTP/{$this->version} {$this->code} {$this->message}{$br}";
        }

        // Iterate over the headers and stringify them
        foreach ($this->headers as $name => $value)
        {
            if (is_string($value))
                $str .= "{$name}: {$value}{$br}";

            elseif (is_array($value)) {
                foreach ($value as $subval) {
                    $str .= "{$name}: {$subval}{$br}";
                }
            }
        }

        return $str;
    }

    /**
     * Get the entire response as string
     *
     * @param string $br Line breaks (eg. "\n", "\r\n", "<br />")
     * @return string
     */
    public function asString($br = "\n")
    {
        return $this->getHeadersAsString(true, $br) . $br . $this->getRawBody();
    }

    /**
     * Implements magic __toString()
     *
     * @return string
     */
    public function __toString()
    {
        return $this->asString();
    }

    /**
     * A convenience function that returns a text representation of
     * HTTP response codes. Returns 'Unknown' for unknown codes.
     * Returns array of all codes, if $code is not specified.
     *
     * Conforms to HTTP/1.1 as defined in RFC 2616 (except for 'Unknown')
     * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10 for reference
     *
     * @param int $code HTTP response code
     * @param boolean $http11 Use HTTP version 1.1
     * @return string
     */
    public static function responseCodeAsText($code = null, $http11 = true)
    {
        $messages = self::$messages;
        if (! $http11) $messages[302] = 'Moved Temporarily';

        if ($code === null) {
            return $messages;
        } elseif (isset($messages[$code])) {
            return $messages[$code];
        } else {
            return 'Unknown';
        }
    }

    /**
     * Extract the response code from a response string
     *
     * @param string $response_str
     * @return int
     */
    public static function extractCode($response_str)
    {
        preg_match("|^HTTP/[\d\.x]+ (\d+)|", $response_str, $m);

        if (isset($m[1])) {
            return (int) $m[1];
        } else {
            return false;
        }
    }

    /**
     * Extract the HTTP message from a response
     *
     * @param string $response_str
     * @return string
     */
    public static function extractMessage($response_str)
    {
        preg_match("|^HTTP/[\d\.x]+ \d+ ([^\r\n]+)|", $response_str, $m);

        if (isset($m[1])) {
            return $m[1];
        } else {
            return false;
        }
    }

    /**
     * Extract the HTTP version from a response
     *
     * @param string $response_str
     * @return string
     */
    public static function extractVersion($response_str)
    {
        preg_match("|^HTTP/([\d\.x]+) \d+|", $response_str, $m);

        if (isset($m[1])) {
            return $m[1];
        } else {
            return false;
        }
    }

    /**
     * Extract the headers from a response string
     *
     * @param   string $response_str
     * @return  array
     */
    public static function extractHeaders($response_str)
    {
        $headers = array();

        // First, split body and headers
        $parts = preg_split('|(?:\r?\n){2}|m', $response_str, 2);
        if (! $parts[0]) return $headers;

        // Split headers part to lines
        $lines = explode("\n", $parts[0]);
        unset($parts);
        $last_header = null;

        foreach($lines as $line) {
            $line = trim($line, "\r\n");
            if ($line == "") break;

            // Locate headers like 'Location: ...' and 'Location:...' (note the missing space)
            if (preg_match("|^([\w-]+):\s*(.+)|", $line, $m)) {
                unset($last_header);
                $h_name = strtolower($m[1]);
                $h_value = $m[2];

                if (isset($headers[$h_name])) {
                    if (! is_array($headers[$h_name])) {
                        $headers[$h_name] = array($headers[$h_name]);
                    }

                    $headers[$h_name][] = $h_value;
                } else {
                    $headers[$h_name] = $h_value;
                }
                $last_header = $h_name;
            } elseif (preg_match("|^\s+(.+)$|", $line, $m) && $last_header !== null) {
                if (is_array($headers[$last_header])) {
                    end($headers[$last_header]);
                    $last_header_key = key($headers[$last_header]);
                    $headers[$last_header][$last_header_key] .= $m[1];
                } else {
                    $headers[$last_header] .= $m[1];
                }
            }
        }

        return $headers;
    }

    /**
     * Extract the body from a response string
     *
     * @param string $response_str
     * @return string
     */
    public static function extractBody($response_str)
    {
        $parts = preg_split('|(?:\r?\n){2}|m', $response_str, 2);
        if (isset($parts[1])) {
            return $parts[1];
        }
        return '';
    }

    /**
     * Decode a "chunked" transfer-encoded body and return the decoded text
     *
     * @param string $body
     * @return string
     */
    public static function decodeChunkedBody($body)
    {
        // Added by Dan S. -- don't fail on Transfer-encoding:chunked response
        //that isn't really chunked
        if (! preg_match("/^([\da-fA-F]+)[^\r\n]*\r\n/sm", trim($body), $m)) {
            return $body;
        }
       
        $decBody = '';

        // If mbstring overloads substr and strlen functions, we have to
        // override it's internal encoding
        if (function_exists('mb_internal_encoding') &&
           ((int) ini_get('mbstring.func_overload')) & 2) {

            $mbIntEnc = mb_internal_encoding();
            mb_internal_encoding('ASCII');
        }

        while (trim($body)) {
            if (! preg_match("/^([\da-fA-F]+)[^\r\n]*\r\n/sm", $body, $m)) {
                
                throw new Exception("Error parsing body - doesn't seem to be a chunked message");
            }

            $length = hexdec(trim($m[1]));
            $cut = strlen($m[0]);
            $decBody .= substr($body, $cut, $length);
            $body = substr($body, $cut + $length + 2);
        }

        if (isset($mbIntEnc)) {
            mb_internal_encoding($mbIntEnc);
        }

        return $decBody;
    }

    /**
     * Decode a gzip encoded message (when Content-encoding = gzip)
     *
     * Currently requires PHP with zlib support
     *
     * @param string $body
     * @return string
     */
    public static function decodeGzip($body)
    {
        if (! function_exists('gzinflate')) {
            
            throw new Exception(
                'zlib extension is required in order to decode "gzip" encoding'
            );
        }

        return gzinflate(substr($body, 10));
    }

    /**
     * Decode a zlib deflated message (when Content-encoding = deflate)
     *
     * Currently requires PHP with zlib support
     *
     * @param string $body
     * @return string
     */
    public static function decodeDeflate($body)
    {
        if (! function_exists('gzuncompress')) {
            
            throw new Exception(
                'zlib extension is required in order to decode "deflate" encoding'
            );
        }

        /**
         * Some servers (IIS ?) send a broken deflate response, without the
         * RFC-required zlib header.
         *
         * We try to detect the zlib header, and if it does not exsit we
         * teat the body is plain DEFLATE content.
         *
         * This method was adapted from PEAR HTTP_Request2 by (c) Alexey Borzov
         *
         * @link http://framework.zend.com/issues/browse/ZF-6040
         */
        $zlibHeader = unpack('n', substr($body, 0, 2));
        if ($zlibHeader[1] % 31 == 0) {
            return gzuncompress($body);
        } else {
            return gzinflate($body);
        }
    }

    /**
     * Create a new Zend_Http_Response object from a string
     *
     * @param string $response_str
     * @return Zend_Http_Response
     */
    public static function fromString($response_str)
    {
        $code    = self::extractCode($response_str);
        $headers = self::extractHeaders($response_str);
        $body    = self::extractBody($response_str);
        $version = self::extractVersion($response_str);
        $message = self::extractMessage($response_str);

        return new libZotero_Http_Response($code, $headers, $body, $version, $message);
    }
}

 /**
  * Representation of a Zotero Item
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */

class Zotero_Item extends Zotero_Entry
{
    /**
     * @var int
     */
    public $itemKey = '';

    /**
     * @var string
     */
    public $itemType = null;
    
    /**
     * @var string
     */
    public $creatorSummary = '';
    
    /**
     * @var string
     */
    public $numChildren = 0;

    /**
     * @var string
     */
    public $numTags = 0;
    
    /**
     * @var array
     */
    public $childKeys = array();
    
    /**
     * @var string
     */
    public $parentKey = '';
    
    /**
     * @var array
     */
    public $creators = array(); 

    /**
     * @var string
     */
    public $createdByUserID = null;
    
    /**
     * @var string
     */
    public $lastModifiedByUserID = null;
    
    /**
     * @var string
     */
    public $note = null;
    
    /**
     * @var int Represents the relationship of the child to the parent. 0:file, 1:file, 2:snapshot, 3:web-link
     */
    public $linkMode = null;
    
    /**
     * @var string
     */
    public $mimeType = null;
    
    public $parsedJson = null;
    public $etag = '';
    
    /**
     * @var string content node of response useful if formatted bib request and we need to use the raw content
     */
    public $content = null;
    
    public $bibContent = null;
    
    public $subContents = array();
    
    public $apiObject = array();
    
    /**
     * @var array
     */
    public static $fieldMap = array(
        "creator"             => "Creator",
        "itemType"            => "Type",
        "title"               => "Title",
        "dateAdded"           => "Date Added",
        "dateModified"        => "Modified",
        "source"              => "Source",
        "notes"               => "Notes",
        "tags"                => "Tags",
        "attachments"         => "Attachments",
        "related"             => "Related",
        "url"                 => "URL",
        "rights"              => "Rights",
        "series"              => "Series",
        "volume"              => "Volume",
        "issue"               => "Issue",
        "edition"             => "Edition",
        "place"               => "Place",
        "publisher"           => "Publisher",
        "pages"               => "Pages",
        "ISBN"                => "ISBN",
        "publicationTitle"    => "Publication",
        "ISSN"                => "ISSN",
        "date"                => "Date",
        "section"             => "Section",
        "callNumber"          => "Call Number",
        "archiveLocation"     => "Loc. in Archive",
        "distributor"         => "Distributor",
        "extra"               => "Extra",
        "journalAbbreviation" => "Journal Abbr",
        "DOI"                 => "DOI",
        "accessDate"          => "Accessed",
        "seriesTitle"         => "Series Title",
        "seriesText"          => "Series Text",
        "seriesNumber"        => "Series Number",
        "institution"         => "Institution",
        "reportType"          => "Report Type",
        "code"                => "Code",
        "session"             => "Session",
        "legislativeBody"     => "Legislative Body",
        "history"             => "History",
        "reporter"            => "Reporter",
        "court"               => "Court",
        "numberOfVolumes"     => "# of Volumes",
        "committee"           => "Committee",
        "assignee"            => "Assignee",
        "patentNumber"        => "Patent Number",
        "priorityNumbers"     => "Priority Numbers",
        "issueDate"           => "Issue Date",
        "references"          => "References",
        "legalStatus"         => "Legal Status",
        "codeNumber"          => "Code Number",
        "artworkMedium"       => "Medium",
        "number"              => "Number",
        "artworkSize"         => "Artwork Size",
        "libraryCatalog"      => "Library Catalog",
        "videoRecordingType"  => "Recording Type",
        "interviewMedium"     => "Medium",
        "letterType"          => "Type",
        "manuscriptType"      => "Type",
        "mapType"             => "Type",
        "scale"               => "Scale",
        "thesisType"          => "Type",
        "websiteType"         => "Website Type",
        "audioRecordingType"  => "Recording Type",
        "label"               => "Label",
        "presentationType"    => "Type",
        "meetingName"         => "Meeting Name",
        "studio"              => "Studio",
        "runningTime"         => "Running Time",
        "network"             => "Network",
        "postType"            => "Post Type",
        "audioFileType"       => "File Type",
        "version"             => "Version",
        "system"              => "System",
        "company"             => "Company",
        "conferenceName"      => "Conference Name",
        "encyclopediaTitle"   => "Encyclopedia Title",
        "dictionaryTitle"     => "Dictionary Title",
        "language"            => "Language",
        "programmingLanguage" => "Language",
        "university"          => "University",
        "abstractNote"        => "Abstract",
        "websiteTitle"        => "Website Title",
        "reportNumber"        => "Report Number",
        "billNumber"          => "Bill Number",
        "codeVolume"          => "Code Volume",
        "codePages"           => "Code Pages",
        "dateDecided"         => "Date Decided",
        "reporterVolume"      => "Reporter Volume",
        "firstPage"           => "First Page",
        "documentNumber"      => "Document Number",
        "dateEnacted"         => "Date Enacted",
        "publicLawNumber"     => "Public Law Number",
        "country"             => "Country",
        "applicationNumber"   => "Application Number",
        "forumTitle"          => "Forum/Listserv Title",
        "episodeNumber"       => "Episode Number",
        "blogTitle"           => "Blog Title",
        "caseName"            => "Case Name",
        "nameOfAct"           => "Name of Act",
        "subject"             => "Subject",
        "proceedingsTitle"    => "Proceedings Title",
        "bookTitle"           => "Book Title",
        "shortTitle"          => "Short Title",
        "docketNumber"        => "Docket Number",
        "numPages"            => "# of Pages"
    );
    
    /**
     * @var array
     */
    public static $typeMap = array(
        "note"                => "Note",
        "attachment"          => "Attachment",
        "book"                => "Book",
        "bookSection"         => "Book Section",
        "journalArticle"      => "Journal Article",
        "magazineArticle"     => "Magazine Article",
        "newspaperArticle"    => "Newspaper Article",
        "thesis"              => "Thesis",
        "letter"              => "Letter",
        "manuscript"          => "Manuscript",
        "interview"           => "Interview",
        "film"                => "Film",
        "artwork"             => "Artwork",
        "webpage"             => "Web Page",
        "report"              => "Report",
        "bill"                => "Bill",
        "case"                => "Case",
        "hearing"             => "Hearing",
        "patent"              => "Patent",
        "statute"             => "Statute",
        "email"               => "E-mail",
        "map"                 => "Map",
        "blogPost"            => "Blog Post",
        "instantMessage"      => "Instant Message",
        "forumPost"           => "Forum Post",
        "audioRecording"      => "Audio Recording",
        "presentation"        => "Presentation",
        "videoRecording"      => "Video Recording",
        "tvBroadcast"         => "TV Broadcast",
        "radioBroadcast"      => "Radio Broadcast",
        "podcast"             => "Podcast",
        "computerProgram"     => "Computer Program",
        "conferencePaper"     => "Conference Paper",
        "document"            => "Document",
        "encyclopediaArticle" => "Encyclopedia Article",
        "dictionaryEntry"     => "Dictionary Entry",
    );
    
    /**
     * @var array
     */
    public static $creatorMap = array(
        "author"         => "Author",
        "contributor"    => "Contributor",
        "editor"         => "Editor",
        "translator"     => "Translator",
        "seriesEditor"   => "Series Editor",
        "interviewee"    => "Interview With",
        "interviewer"    => "Interviewer",
        "director"       => "Director",
        "scriptwriter"   => "Scriptwriter",
        "producer"       => "Producer",
        "castMember"     => "Cast Member",
        "sponsor"        => "Sponsor",
        "counsel"        => "Counsel",
        "inventor"       => "Inventor",
        "attorneyAgent"  => "Attorney/Agent",
        "recipient"      => "Recipient",
        "performer"      => "Performer",
        "composer"       => "Composer",
        "wordsBy"        => "Words By",
        "cartographer"   => "Cartographer",
        "programmer"     => "Programmer",
        "reviewedAuthor" => "Reviewed Author",
        "artist"         => "Artist",
        "commenter"      => "Commenter",
        "presenter"      => "Presenter",
        "guest"          => "Guest",
        "podcaster"      => "Podcaster"
    );
    
    
    public function __construct($entryNode=null)
    {
        if(!$entryNode){
            return;
        }
        elseif(is_string($entryNode)){
            $xml = $entryNode;
            $doc = new DOMDocument();
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        
        parent::__construct($entryNode);
        
        //check if we have multiple subcontent nodes
        $subcontentNodes = $entryNode->getElementsByTagNameNS("*", "subcontent");
        
        //save raw Content node in case we need it
        if($entryNode->getElementsByTagName("content")->length > 0){
            $d = $entryNode->ownerDocument;
            $this->contentNode = $entryNode->getElementsByTagName("content")->item(0);
            $this->content = $d->saveXml($this->contentNode);
        }
        
        
        // Extract the itemId and itemType
        $this->itemKey = $entryNode->getElementsByTagNameNS('*', 'key')->item(0)->nodeValue;
        $this->itemType = $entryNode->getElementsByTagNameNS('*', 'itemType')->item(0)->nodeValue;
        
        // Look for numChildren node
        $numChildrenNode = $entryNode->getElementsByTagNameNS('*', "numChildren")->item(0);
        if($numChildrenNode){
            $this->numChildren = $numChildrenNode->nodeValue;
        }
        
        // Look for numTags node
        $numTagsNode = $entryNode->getElementsByTagNameNS('*', "numTags")->item(0);
        if($numTagsNode){
            $this->numTags = $numTagsNode->nodeValue;
        }
        
        $creatorSummaryNode = $entryNode->getElementsByTagNameNS('*', "creatorSummary")->item(0);
        if($creatorSummaryNode){
            $this->creatorSummary = $creatorSummaryNode->nodeValue;
        }
        
        if($subcontentNodes->length > 0){
            for($i = 0; $i < $subcontentNodes->length; $i++){
                $scnode = $subcontentNodes->item($i);
                $type = $scnode->getAttribute('zapi:type');
                if($type == 'application/json' || $type == 'json'){
                    $this->apiObject = json_decode($scnode->nodeValue, true);
                    $this->etag = $scnode->getAttribute('zapi:etag');
                    if(isset($this->apiObject['creators'])){
                        $this->creators = $this->apiObject['creators'];
                    }
                    else{
                        $this->creators = array();
                    }
                }
                elseif($type == 'bib'){
                    $bibNode = $scnode->getElementsByTagName('div')->item(0);
                    $this->bibContent = $bibNode->ownerDocument->saveXML($bibNode);
                }
                
                $contentString = '';
                $childNodes = $scnode->childNodes;
                foreach($childNodes as $childNode){
                    $contentString .= $bibNode->ownerDocument->saveXML($childNode);
                }
                $this->subContents[$type] = $contentString;
            }
        }
        else{
            $contentNode = $entryNode->getElementsByTagName('content')->item(0);
            $contentType = $contentNode->getAttribute('type');
            $zType = $contentNode->getAttribute('zapi:type');
            
            if($contentType == 'application/json' || $contentType == 'json' || $zType == 'json'){
                $this->apiObject = json_decode($contentNode->nodeValue, true);
                $this->etag = $contentNode->getAttribute('zapi:etag');
                if(isset($this->apiObject['creators'])){
                    $this->creators = $this->apiObject['creators'];
                }
                else{
                    $this->creators = array();
                }
            }
            elseif($contentType == 'bib' || $zType == 'bib'){
                $bibNode = $contentNode->getElementsByTagName('div')->item(0);
                $this->bibContent = $bibNode->ownerDocument->saveXML($bibNode);
            }
            else{
                //didn't find a content type we deal with
            }
        }
        
        if(isset($this->links['up'])){
            $parentLink = $this->links['up']['application/atom+xml']['href'];
            $matches = array();
            preg_match("/items\/([A-Z0-9]{8})/", $parentLink, $matches);
            if(count($matches) == 2){
                $this->parentKey = $matches[1];
            }
        }
        else{
            $this->parentKey = false;
        }
    }
    
    public function get($key){
        if($key == 'tags'){
            if(isset($this->apiObject['tags'])){
                return $this->apiObject['tags'];
            }
        }
        elseif($key == 'creators'){
            //special case
            if(isset($this->apiObject['creators'])){
                return $this->apiObject['creators'];
            }
        }
        else{
            if(isset($this->apiObject[$key])){
                return $this->apiObject[$key];
            }
            else{
                return null;
            }
        }
    }
    
    public function set($key, $val){
        if($key == 'creators' || $key == 'tags'){
            //TODO: special case empty value and correctly in arrays
            $this->apiObject[$key] = $val;
        }
        else{
            //if(in_array($key, array_keys($this->fieldMap))) {
                $this->apiObject[$key] = $val;
            //}
        }
    }
    
    public function addCreator($creatorArray){
        $this->creators[] = $creatorArray;
        $this->apiObject['creators'][] = $creatorArray;
    }
    
    public function updateItemObject(){
        $updateItem = $this->apiObject;
        //remove notes as they can't be in update json
        unset($updateItem['notes']);
        $newCreatorsArray = array();
        foreach($updateItem['creators'] as $creator){
            if($creator['creatorType']){
                if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                    continue;
                }
                else{
                    $newCreatorsArray[] = $creator;
                }
            }
        }
        $updateItem['creators'] = $newCreatorsArray;
        return $updateItem;
    }
    
    public function newItemObject(){
        $newItem = $this->apiObject;
        $newCreatorsArray = array();
        if(isset($newItem['creators'])) {
            foreach($newItem['creators'] as $creator){
                if($creator['creatorType']){
                    if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                        continue;
                    }
                    else{
                        $newCreatorsArray[] = $creator;
                    }
                }
            }
            $newItem['creators'] = $newCreatorsArray;
        }
        
        return $newItem;
    }
    
    public function isAttachment(){
        if($this->itemType == 'attachment'){
            return true;
        }
    }
    
    public function hasFile(){
        if(!$this->isAttachment()){
            return false;
        }
        $hasEnclosure = isset($this->links['enclosure']);
        $linkMode = $this->apiObject['linkMode'];
        if($hasEnclosure && ($linkMode == 0 || $linkMode == 1)){
            return true;
        }
    }
    
    public function json(){
        return json_encode($this->apiObject());
    }
    
    public function fullItemJSON(){
        return json_encode($this->fullItemArray());
    }
    
    public function fullItemArray(){
        $jsonItem = array();
        
        //inherited from Entry
        $jsonItem['title'] = $this->title;
        $jsonItem['dateAdded'] = $this->dateAdded;
        $jsonItem['dateUpdated'] = $this->dateUpdated;
        $jsonItem['id'] = $this->id;
        
        $jsonItem['links'] = $this->links;
        
        //Item specific vars
        $jsonItem['itemKey'] = $this->itemKey;
        $jsonItem['itemType'] = $this->itemType;
        $jsonItem['creatorSummary'] = $this->creatorSummary;
        $jsonItem['numChildren'] = $this->numChildren;
        $jsonItem['numTags'] = $this->numTags;
        
        $jsonItem['creators'] = $this->creators;
        $jsonItem['createdByUserID'] = $this->createdByUserID;
        $jsonItem['lastModifiedByUserID'] = $this->lastModifiedByUserID;
        $jsonItem['note'] = $this->note;
        $jsonItem['linkMode'] = $this->linkMode;
        $jsonItem['mimeType'] = $this->mimeType;
        
        $jsonItem['apiObject'] = $this->apiObject;
        return $jsonItem;
    }
    
    public function formatItemField($field){
        switch($field){
            case "title":
                return htmlspecialchars($this->title);
                break;
            case "creator":
                if(isset($this->creatorSummary)){
                    return htmlspecialchars($this->creatorSummary);
                }
                else{
                    return '';
                }
                break;
            case "dateModified":
            case "dateUpdated":
                return htmlspecialchars($this->dateUpdated);
                break;
            case "dateAdded":
                return htmlspecialchars($this->dateAdded);
                break;
            default:
                if(isset($this->apiObject[$field])){
                    return htmlspecialchars($this->apiObject[$field]);
                }
                else{
                    return '';
                }
        }
    }
    
    public function compareItem($otherItem){
        $diff = array_diff_assoc($this->apiObject, $otherItem->apiObject);
        return $diff;
    }
}

 /**
  * Representation of a Zotero Group
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */
class Zotero_Group extends Zotero_Entry
{
    /**
     * @var array
     */
    public $properties;
    
    /**
     * @var int
     */
    public $id;
    
    /**
     * @var int
     */
    public $groupID;
    
    /**
     * @var int
     */
    public $owner;
    
    /**
     * @var string
     */
    public $type;
    
    /**
     * @var string
     */
    public $name;
    
    /**
     * @var bool
     */
    public $libraryEnabled;
    
    /**
     * @var string
     */
    public $libraryEditing;
    
    /**
     * @var string
     */
    public $libraryReading;
    
    /**
     * @var string
     */
    public $fileEditing;
    
    /**
     * @var bool
     */
    public $hasImage;
    
    /**
     * @var string
     */
    public $description;
    
    /**
     * @var array
     */
    public $disciplines;
    
    /**
     * @var bool
     */
    public $enableComments;
    
    /**
     * @var string
     */
    public $url = '';
    
    /**
     * @var array
     */
    public $adminIDs;
    
    /**
     * @var array
     */
    public $memberIDs;
    
    
    public function __construct($entryNode = null)
    {
        if(!$entryNode){
            return;
        }
        elseif(is_string($entryNode)){
            $xml = $entryNode;
            $doc = new DOMDocument();
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        parent::__construct($entryNode);
        
        if(!$entryNode){
            return;
        }
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        $contentType = parent::getContentType($entryNode);
        if($contentType == 'application/json'){
            $this->apiObject = json_decode($contentNode->nodeValue, true);
            //$this->etag = $contentNode->getAttribute('etag');
            $this->name = $this->apiObject['name'];
            $this->ownerID = $this->apiObject['owner'];
            $this->groupType = $this->apiObject['type'];
            $this->description = $this->apiObject['description'];
            $this->url = $this->apiObject['url'];
            $this->libraryEnabled = $this->apiObject['libraryEnabled'];
            $this->libraryEditing = $this->apiObject['libraryEditing'];
            $this->libraryReading = $this->apiObject['libraryReading'];
            $this->fileEditing = $this->apiObject['fileEditing'];
        }
        
        if(!empty($this->apiObject['admins'])){
            $this->adminIDs = $this->apiObject['admins'];
        }
        else {
            $this->adminIDs = array();
        }
        
        if($this->ownerID){
            $this->adminIDs[] = $this->ownerID;
        }
        
        if(!empty($this->apiObject['members'])){
            $this->memberIDs = $this->apiObject['members'];
        }
        else{
            $this->memberIDs = array();
        }
        
        $this->numItems = $entryNode->getElementsByTagNameNS('*', 'numItems')->item(0)->nodeValue;
        
        $contentNodes = $entryNode->getElementsByTagName("content");
        if($contentNodes->length > 0){
            $cNode = $contentNodes->item(0);
            if($cNode->getAttribute('type') == 'application/json'){
                $jsonObject = json_decode($cNode->nodeValue, true);
                //parse out relevant values from the json and put them on our object
                $this->name = $jsonObject['name'];
                $this->ownerID = $jsonObject['owner'];
                $this->owner = $this->ownerID;
                $this->type = $jsonObject['type'];
                $this->groupType = $this->type;
                $this->description = urldecode($jsonObject['description']);
                $this->url = $jsonObject['url'];
                $this->hasImage = isset($jsonObject['hasImage']) ? $jsonObject['hasImage'] : 0;
                $this->libraryEnabled = $jsonObject['libraryEnabled'];
                $this->libraryEditing = $jsonObject['libraryEditing'];
                $this->memberIDs = isset($jsonObject['members']) ? $jsonObject['members'] : array();
                $this->members = $this->memberIDs;
                $this->adminIDs = isset($jsonObject['admins']) ? $jsonObject['admins'] : array();
                $this->adminIDs[] = $jsonObject['owner'];
                $this->admins = $this->adminIDs;
            }
            elseif($cNode->getAttribute('type') == 'application/xml'){
                $groupElements = $entryNode->getElementsByTagName("group");
                $groupElement = $groupElements->item(0);
                if(!$groupElement) return;
                
                $groupAttributes = $groupElement->attributes;
                $this->properties = array();
                
                foreach($groupAttributes as $attrName => $attrNode){
                    $this->properties[$attrName] = urldecode($attrNode->value);
                    if($attrName == 'name'){
                        $this->$attrName = $attrNode->value;
                    }
                    else{
                        $this->$attrName = urldecode($attrNode->value);
                    }
                }
                $this->groupID = $this->properties['id'];
                
                $description = $entryNode->getElementsByTagName("description")->item(0);
                if($description) {
                    $this->properties['description'] = urldecode($description->nodeValue);
                    $this->description = urldecode($description->nodeValue);
                }
                
                $url = $entryNode->getElementsByTagName("url")->item(0);
                if($url) {
                    $this->properties['url'] = $url->nodeValue;
                    $this->url = $url->nodeValue;
                }
                
                $this->adminIDs = array();
                $admins = $entryNode->getElementsByTagName("admins")->item(0);
                if($admins){
                    $this->adminIDs = $admins === null ? array() : explode(" ", $admins->nodeValue);
                }
                $this->adminIDs[] = $this->owner;
                
                $this->memberIDs = array();
                $members = $entryNode->getElementsByTagName("members")->item(0);
                if($members){
                    $this->memberIDs = ($members === null ? array() : explode(" ", $members->nodeValue));
                }
                
                //initially disallow library access
                $this->userReadable = false;
                $this->userEditable = false;
            }
        }
        
        //get groupID from zapi:groupID if available
        if($entryNode->getElementsByTagNameNS('*', 'groupID')->length > 0){
            $this->groupID = $entryNode->getElementsByTagNameNS('*', 'groupID')->item(0)->nodeValue;
            $this->id = $this->groupID;
        }
        else{
            //get link nodes and extract groupID
            $linkNodes = $entryNode->getElementsByTagName("link");
            if($linkNodes->length > 0){
                for($i = 0; $i < $linkNodes->length; $i++){
                    $linkNode = $linkNodes->item($i);
                    if($linkNode->getAttribute('rel') == 'self'){
                        $selfHref = $linkNode->getAttribute('href');
                        $matches = array();
                        preg_match('/^https:\/\/.{3,6}\.zotero\.org\/groups\/([0-9]+)$/', $selfHref, $matches);
                        if(isset($matches[1])){
                            $this->groupID = intval($matches[1]);
                            $this->id = $this->groupID;
                        }
                    }
                }
            }
        }
        
        //initially disallow library access
        $this->userReadable = false;
        $this->userEditable = false;
    }
    
    public function setProperty($key, $val)
    {
        $this->properties[$key] = $val;
        return $this;
    }
    
    public function updateString()
    {
        $doc = new DOMDocument();
        $el = $doc->appendChild(new DOMElement('group'));
        $el->appendChild(new DOMElement('description', urlencode($this->description)));
        $el->appendChild(new DOMElement('url', $this->url));
        if($this->groupID){
            $el->setAttribute('id', $this->groupID);
        }
        $el->setAttribute('owner', $this->ownerID);
        $el->setAttribute('type', $this->type);
        $el->setAttribute('name', $this->name);// str_replace('&#039;', '&apos;', htmlspecialchars($this->name, ENT_QUOTES)));
        $el->setAttribute('libraryEnabled', $this->libraryEnabled);
        $el->setAttribute('libraryEditing', $this->libraryEditing);
        $el->setAttribute('libraryReading', $this->libraryReading);
        $el->setAttribute('fileEditing', $this->fileEditing);
        $el->setAttribute('hasImage', $this->hasImage);
        
        return $doc->saveXML($el);
    }
    
    public function propertiesArray()
    {
        $properties = array();
        $properties['owner'] = $this->owner;
        $properties['type'] = $this->type;
        $properties['name'] = $this->name;
        $properties['libraryEnabled'] = $this->libraryEnabled;
        $properties['libraryEditing'] = $this->libraryEditing;
        $properties['libraryReading'] = $this->libraryReading;
        $properties['fileEditing'] = $this->fileEditing;
        $properties['hasImage'] = $this->hasImage;
        $properties['disciplines'] = $this->disciplines;
        $properties['enableComments'] = $this->enableComments;
        $properties['description'] = $this->description;
        
        return $properties;
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        
        //Group vars
        $jsonItem->groupID = $this->groupID;
        $jsonItem->owner = $this->owner;
        $jsonItem->memberIDs = $this->memberIDs;
        $jsonItem->adminIDs = $this->adminIDs;
        $jsonItem->type = $this->type;
        $jsonItem->name = $this->name;
        $jsonItem->libraryEnabled = $this->libraryEnabled;
        $jsonItem->libraryEditing = $this->libraryEditing;
        $jsonItem->libraryReading = $this->libraryReading;
        $jsonItem->hasImage = $this->hadImage;
        $jsonItem->description = $this->description;
        $jsonItem->url = $this->url;
        
        return $jsonItem;
    }
}

 /**
  * Representation of a Zotero Tag
  * 
  * @package libZotero
  */
class Zotero_Tag extends Zotero_Entry
{
    /**
     * @var int
     */
/*    public $tagID;
    
    public $libraryID;
    
    public $key;
    
    public $name;
    
    public $dateAdded;
    
    public $dateModified;
    
    public $type;
*/    
    public $numItems = 0;
    
    public function __construct($entryNode)
    {
        if(!$entryNode){
            libZoteroDebug( "no entryNode in tag constructor\n" );
            return;
        }
        elseif(is_string($entryNode)){
            libZoteroDebug( "entryNode is string in tag constructor\n" );
            $xml = $entryNode;
            $doc = new DOMDocument();
            libZoteroDebug( $xml );
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        parent::__construct($entryNode);
        
        $this->name = $this->title;
        
        if(!$entryNode){
            libZoteroDebug( "second no entryNode in tag constructor\n" );
            return;
        }
        
        $numItems = $entryNode->getElementsByTagNameNS('*', "numItems")->item(0);
        if($numItems) {
            $this->numItems = (int)$numItems->nodeValue;
        }
        
        $tagElements = $entryNode->getElementsByTagName("tag");
        $tagElement = $tagElements->item(0);
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        
        $jsonItem->properties = $this->properties;
        
        return $jsonItem;
    }
}


 /**
  * Representation of a Zotero User
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */
class Zotero_User extends Zotero_Entry
{
    /**
     * @var int
     */
    public $userID;

    public function __construct($entryNode)
    {
        parent::__construct($entryNode);
        
    }
}


 /**
  * Representation of a Zotero Item Creator
  *
  * @package    libZotero
  */
class Zotero_Creator
{
    public $creatorType = null;
    public $localized = null;
    public $firstName = null;
    public $lastName = null;
    public $name = null;
    
    public function getWriteObject(){
        if(empty($this->creatorType) || (empty($this->name) && empty($this->firstName) && empty($this->lastName) ) ){
            return false;
        }
        $a = array('creatorType'=>$this->creatorType);
        if(!empty($this->name)){
            $a['name'] = $this->name;
        }
        else{
            $a['firstName'] = $this->firstName;
            $a['lastName'] = $this->lastName;
        }
        
        return $a;
    }
}

define('LIBZOTERO_DEBUG', 0);
function libZoteroDebug($m){
    if(LIBZOTERO_DEBUG){
        echo $m;
    }
    return;
}

/**
 * Interface to API and storage of a Zotero user or group library
 * 
 * @package libZotero
 */
class Zotero_Library
{
    const ZOTERO_URI = 'https://api.zotero.org';
    const ZOTERO_WWW_URI = 'http://www.zotero.org';
    const ZOTERO_WWW_API_URI = 'http://www.zotero.org/api';
    protected $_apiKey = '';
    protected $_ch = null;
    protected $_followRedirects = true;
    public $libraryType = null;
    public $libraryID = null;
    public $libraryString = null;
    public $libraryUrlIdentifier = null;
    public $libraryBaseWebsiteUrl = null;
    public $items = null;
    public $collections = null;
    public $dirty = null;
    public $useLibraryAsContainer = true;
    protected $_lastResponse = null;
    protected $_lastFeed = null;
    protected $_cacheResponses = false;
    protected $_cachettl = 0;
    protected $_cachePrefix = 'libZotero';
    
    /**
     * Constructor for Zotero_Library
     *
     * @param string $libraryType user|group
     * @param string $libraryID id for zotero library, unique when combined with libraryType
     * @param string $libraryUrlIdentifier library identifier used in urls, either ID or slug
     * @param string $apiKey zotero api key
     * @param string $baseWebsiteUrl base url to use when generating links to the website version of items
     * @param string $cachettl cache time to live in seconds, cache disabled if 0
     * @return Zotero_Library
     */
    public function __construct($libraryType = null, $libraryID = 'me', $libraryUrlIdentifier = null, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org", $cachettl=0)
    {
        $this->_apiKey = $apiKey;
        if (extension_loaded('curl')) {
            //$this->_ch = curl_init();
        } else {
            throw new Exception("You need cURL");
        }
        
        $this->libraryType = $libraryType;
        $this->libraryID = $libraryID;
        $this->libraryString = $this->libraryString($this->libraryType, $this->libraryID);
        $this->libraryUrlIdentifier = $libraryUrlIdentifier;
        
        $this->libraryBaseWebsiteUrl = $baseWebsiteUrl . '/';
        if($this->libraryType == 'group'){
            $this->libraryBaseWebsiteUrl .= 'groups/';
        }
        $this->libraryBaseWebsiteUrl .= $this->libraryUrlIdentifier . '/items';
        
        $this->items = new Zotero_Items();
        $this->collections = new Zotero_Collections();
        $this->collections->libraryUrlIdentifier = $this->libraryUrlIdentifier;
        
        $this->dirty = false;
        if($cachettl > 0){
            $this->_cachettl = $cachettl;
            $this->_cacheResponses = true;
        }
    }
    
    /**
     * Destructor, closes cURL.
     */
    public function __destruct() {
        //curl_close($this->_ch);
    }
    
    /**
     * Set _followRedirect, controlling whether curl automatically follows location header redirects
     * @param bool $follow automatically follow location header redirect
     */
    public function setFollow($follow){
        $this->_followRedirects = $follow;
    }

    /**
     * set the cache time to live after initialization
     *
     * @param int $cachettl cache time to live in seconds, 0 disables
     * @return null
     */
    public function setCacheTtl($cachettl){
        if($cachettl == 0){
            $this->_cacheResponses = false;
            $this->_cachettl = 0;
        }
        else{
            $this->_cacheResponses = true;
            $this->_cachettl = $cachettl;
        }
    }
    
    /**
     * Make http request to zotero api
     *
     * @param string $url target api url
     * @param string $method http method GET|POST|PUT|DELETE
     * @param string $body request body if write
     * @param array $headers headers to set on request
     * @return HTTP_Response
     */
    public function _request($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array()) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        //disable Expect header
        $httpHeaders[] = 'Expect:';
        
        if(!empty($basicauth)){
            $passString = $basicauth['username'] . ':' . $basicauth['password'];
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
            curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
        }
        else{
            curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        if($this->_followRedirects){
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        }
        else{
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
        }
        
        $umethod = strtoupper($method);
        switch($umethod){
            case "GET":
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                break;
            case "POST":
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "PUT":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "DELETE":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
                break;
        }
        
        $gotCached = false;
        if($this->_cacheResponses && $umethod == 'GET'){
            $cachedResponse = apc_fetch($url, $success);
            if($success){
                $responseBody = $cachedResponse['responseBody'];
                $responseInfo = $cachedResponse['responseInfo'];
                $zresponse = libZotero_Http_Response::fromString($responseBody);
                $gotCached = true;
            }
        }
        
        if(!$gotCached){
            $responseBody = curl_exec($ch);
            $responseInfo = curl_getinfo($ch);
            //libZoteroDebug( "{$method} url:" . $url . "\n");
            //libZoteroDebug( "%%%%%" . $responseBody . "%%%%%\n\n");
            $zresponse = libZotero_Http_Response::fromString($responseBody);
            
            //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
            //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
            //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
            //until a non-redirect is read
            if($this->_followRedirects){
                while($zresponse->isRedirect()){
                    $redirectedBody = $zresponse->getBody();
                    $zresponse = libZotero_Http_Response::fromString($redirectedBody);
                }
            }
            
            $saveCached = array(
                'responseBody'=>$responseBody,
                'responseInfo'=>$responseInfo,
            );
            if($this->_cacheResponses){
                apc_store($url, $saveCached, $this->_cachettl);
            }
        }
        $this->_lastResponse = $zresponse;
        return $zresponse;
    }
    
    public function proxyHttpRequest($url, $method='GET', $body=null, $headers=array()) {
        $endPoint = $url;
        try{
            $response = $this->_request($url, $method, $body, $headers);
            if($response->getStatus() == 303){
                //this might not account for GET parameters in the first url depending on the server
                $newLocation = $response->getHeader("Location");
                $reresponse = $this->_request($newLocation, $method, $body, $headers);
                return $reresponse;
            }
        }
        catch(Exception $e){
            $r = new libZotero_Http_Response(500, array(), $e->getMessage());
            return $r;
        }
        
        return $response;
    }
    
    
    public function _cacheSave(){
        
    }
    
    public function _cacheLoad(){
        
    }
    
    
    /**
     * get the last HTTP_Response returned
     *
     * @return HTTP_Response
     */
    public function getLastResponse(){
        return $this->_lastResponse;
    }
    
    /**
     * get the last status code from last HTTP_Response returned
     *
     * @return HTTP_Response
     */
    public function getLastStatus(){
        return $this->_lastResponse->getStatus();
    }
    
    /**
     * Get the last Zotero_Feed parsed
     *
     * @return Zotero_Feed
     */
    public function getLastFeed(){
        return $this->_lastFeed;
    }
    
    /**
     * Construct a string that uniquely identifies a library
     * This is not related to the server GUIDs
     *
     * @return string
     */
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring .= $libraryID;
        return $lstring;
    }
    
    /**
     * generate an api url for a request based on array of parameters
     *
     * @param array $params list of parameters that define the request
     * @param string $base the base api url
     * @return string
     */
    public function apiRequestUrl($params = array(), $base = Zotero_Library::ZOTERO_URI) {
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        //special case for www based api requests until those methods are mapped for api.zotero
        if($params['target'] == 'user' || $params['target'] == 'cv'){
            $base = Zotero_Library::ZOTERO_WWW_API_URI;
        }
        
        //allow overriding of libraryType and ID in params if they are passed
        //otherwise use the settings for this instance of library
        if(!empty($params['libraryType']) && !empty($params['libraryID'])){
            $url = $base . '/' . $params['libraryType'] . 's/' . $params['libraryID'];
        }
        else{
            $url = $base . '/' . $this->libraryType . 's/' . $this->libraryID;
        }
        
        if(!empty($params['collectionKey'])){
            if($params['collectionKey'] == 'trash'){
                $url .= '/items/trash';
                return $url;
            }
            else{
                $url .= '/collections/' . $params['collectionKey'];
            }
        }
        
        switch($params['target']){
            case 'items':
                $url .= '/items';
                break;
            case 'item':
                if($params['itemKey']){
                    $url .= '/items/' . $params['itemKey'];
                }
                else{
                    $url .= '/items';
                }
                break;
            case 'collections':
                $url .= '/collections';
                break;
            case 'collection':
                break;
            case 'tags':
                $url .= '/tags';
                break;
            case 'children':
                $url .= '/items/' . $params['itemKey'] . '/children';
                break;
            case 'itemTemplate':
                $url = $base . '/items/new';
                break;
            case 'key':
                $url = $base . '/users/' . $params['userID'] . '/keys/' . $params['apiKey'];
                break;
            case 'userGroups':
                $url = $base . '/users/' . $params['userID'] . '/groups';
                break;
            case 'groups':
                $url = $base . '/groups';
                break;
            case 'trash':
                $url .= '/items/trash';
                break;
            case 'cv':
                $url .= '/cv';
                break;
            default:
                return false;
        }
        if(isset($params['targetModifier'])){
            switch($params['targetModifier']){
                case 'top':
                    $url .= '/top';
                    break;
                case 'children':
                    $url .= '/children';
                    break;
                case 'file':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file';
                    break;
                case 'fileview':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file/view';
                    break;
            }
        }
        //print "apiRequestUrl: " . $url . "\n";
        return $url;
    }
    
    /**
     * generate an api query string for a request based on array of parameters
     *
     * @param array $passedParams list of parameters that define the request
     * @return string
     */
    public function apiQueryString($passedParams=array()){
        // Tags query formats
        //
        // ?tag=foo
        // ?tag=foo bar // phrase
        // ?tag=-foo // negation
        // ?tag=\-foo // literal hyphen (only for first character)
        // ?tag=foo&tag=bar // AND
        // ?tag=foo&tagType=0
        // ?tag=foo bar || bar&tagType=0
        
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'q',
                                 'itemType',
                                 'locale',
                                 'key',
                                 'itemKey',
                                 'tag',
                                 'tagType',
                                 'style',
                                 'format',
                                 'linkMode',
                                 'linkwrap'
                                 );
        //build simple api query parameters object
        if((!isset($passedParams['key'])) && $this->_apiKey){
            $passedParams['key'] = $this->_apiKey;
        }
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                //check if itemKey belongs in the url or the querystring
                if($val == 'itemKey' && isset($passedParams['target']) && ($passedParams['target'] != 'items') ) continue;
                $queryParams[$val] = $passedParams[$val];
            }
        }
        
        $queryString = '?';
        $queryParamsArray = array();
        foreach($queryParams as $index=>$value){
            if(is_array($value)){
                foreach($value as $key=>$val){
                    if(is_string($val) || is_int($val)){
                        $queryParamsArray[] = urlEncode($index) . '=' . urlencode($val);
                    }
                }
            }
            elseif(is_string($value) || is_int($value)){
                $queryParamsArray[] = urlencode($index) . '=' . urlencode($value);
            }
        }
        $queryString .= implode('&', $queryParamsArray);
        //print "apiQueryString: " . $queryString . "\n";
        return $queryString;
    }
    
    /**
     * parse a query string and separate into parameters
     * without using the php way of representing query strings
     *
     * @param string $query
     * @return array
     */
    public function parseQueryString($query){
        $params = explode('&', $query);
        $aparams = array();
        foreach($params as $val){
            $t = explode('=', $val);
            $aparams[urldecode($t[0])] = urldecode($t[1]);
        }
        return $aparams;
    }
    
    /**
     * Load all collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchAllCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        do{
            $response = $this->_request($reqUrl);
            if($response->isError()){
                throw new Exception("Error fetching collections");
            }
            $body = $response->getRawBody();
            $doc = new DOMDocument();
            $doc->loadXml($body);
            $feed = new Zotero_Feed($doc);
            $this->collections->addCollectionsFromFeed($feed);
            
            if(isset($feed->links['next'])){
                $nextUrl = $feed->links['next']['href'];
                $parsedNextUrl = parse_url($nextUrl);
                $parsedNextUrl['query'] = $this->apiQueryString(array_merge(array('key'=>$this->_apiKey), $this->parseQueryString($parsedNextUrl['query']) ) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
                $reqUrl = false;
            }
        } while($reqUrl);
        
        $this->collections->loaded = true;
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl);
        if($response->isError()){
            return false;
            throw new Exception("Error fetching collections");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $addedCollections = $this->collections->addCollectionsFromFeed($feed);
        
        if(isset($feed->links['next'])){
            $nextUrl = $feed->links['next']['href'];
            $parsedNextUrl = parse_url($nextUrl);
            $parsedNextUrl['query'] = $this->apiQueryString(array_merge(array('key'=>$this->_apiKey), $this->parseQueryString($parsedNextUrl['query']) ) );
            $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
        }
        else{
            $reqUrl = false;
        }
        return $addedCollections;
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Zotero_Collection
     */
    public function fetchCollection($collectionKey){
        $aparams = array('target'=>'collection', 'content'=>'json', 'collectionKey'=>$collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching collection");
        }
        
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $entries = $doc->getElementsByTagName("entry");
        if(!$entries->length){
            return false;
            throw new Exception("no collection with specified key found");
        }
        else{
            $entry = $entries->item(0);
            $collection = new Zotero_Collection($entry);
            $this->collections->addCollection($collection);
            return $collection;
        }
    }
    
    /**
     * Make a single request loading top level items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemsTop($params=array()){
        $params['targetModifier'] = 'top';
        return $this->fetchItems($params);
    }
    
    /**
     * Make a single request loading item keys
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemKeys($params=array()){
        $fetchedKeys = array();
        $aparams = array_merge(array('target'=>'items', 'format'=>'keys'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching item keys");
        }
        $body = $response->getRawBody();
        $fetchedKeys = explode("\n", trim($body) );
        
        return $fetchedKeys;
    }
    
    /**
     * Make a single request loading items in the trash
     *
     * @param array $params list of parameters additionally filtering the request
     * @return array of fetched items
     */
    public function fetchTrashedItems($params=array()){
        $fetchedItems = array();
        $aparams = array_merge(array('target'=>'trash', 'content'=>'json'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        libZoteroDebug( "\n");
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $fetchedItems = $this->items->addItemsFromFeed($feed);
        
        return $fetchedItems;
    }
    
    /**
     * Make a single request loading a list of items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItems($params = array()){
        $fetchedItems = array();
        $aparams = array_merge(array('target'=>'items', 'content'=>'json'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        libZoteroDebug( "\n" );
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $fetchedItems = $this->items->addItemsFromFeed($feed);
        
        return $fetchedItems;
    }
    
    /**
     * Make a single request loading a list of items
     *
     * @param string $itemKey key of item to stop retrieval at
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemsAfter($itemKey, $params = array()){
        $fetchedItems = array();
        $itemKeys = $this->fetchItemKeys($params);
        if($itemKey != ''){
            $index = array_search($itemKey, $itemKeys);
            if($index == false){
                return array();
            }
        }
        
        $offset = 0;
        while($offset < $index){
            if($index - $offset > 50){
                $uindex = $offset + 50;
            }
            else{
                $uindex = $index;
            }
            $itemKeysToFetch = array_slice($itemKeys, 0, $uindex);
            $offset == $uindex;
            $params['itemKey'] = implode(',', $itemKeysToFetch);
            $fetchedSet = $this->fetchItems($params);
            $fetchedItems = array_merge($fetchedItems, $fetchedSet);
        }
        
        return $fetchedItems;
    }
    
    
    /**
     * Load a single item by itemKey
     *
     * @param string $itemKey
     * @return Zotero_Item
     */
    public function fetchItem($itemKey){
        $aparams = array('target'=>'item', 'content'=>'json', 'itemKey'=>$itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $entries = $doc->getElementsByTagName("entry");
        if(!$entries->length){
            return false;
            throw new Exception("no item with specified key found");
        }
        else{
            $entry = $entries->item(0);
            $item = new Zotero_Item($entry);
            $this->items->addItem($item);
            return $item;
        }
    }
    
    /**
     * Load a single item bib by itemKey
     *
     * @param string $itemKey
     * @return Zotero_Item
     */
    public function fetchItemBib($itemKey, $style){
        //TODO:parse correctly and return just bib
        $aparams = array('target'=>'item', 'content'=>'bib', 'itemKey'=>$itemKey);
        if($style){
            $aparams['style'] = $style;
        }
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $entries = $doc->getElementsByTagName("entry");
        if(!$entries->length){
            return false;
            throw new Exception("no item with specified key found");
        }
        else{
            $entry = $entries->item(0);
            $item = new Zotero_Item($entry);
            $this->items->addItem($item);
            return $item;
        }
    }

    /**
     * construct the url for file download of the item if it exists
     *
     * @param string $itemKey
     * @return string
     */
    public function itemDownloadLink($itemKey){
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey, 'targetModifier'=>'file');
        return $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
    }
    
    /**
     * Write a modified item back to the api
     *
     * @param Zotero_Item $item the modified item to be written back
     * @return Zotero_Response
     */
    public function writeUpdatedItem($item){
        if(is_string($item)){
            $itemKey = $item;
            $item = $this->items->getItem($itemKey);
        }
        $updateItemJson = json_encode($item->updateItemObject());
        $etag = $item->etag;
        
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'PUT', $updateItemJson, array('If-Match'=>$etag));
        return $response;
    }
    
    public function uploadNewAttachedFile($item, $fileContents, $fileinfo=array()){
        //get upload authorization
        $aparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $postData = "md5={$fileinfo['md5']}&filename={$fileinfo['filename']}&filesize={$fileinfo['filesize']}&mtime={$fileinfo['mtime']}";
        //$postData = $fileinfo;
        libZoteroDebug("uploadNewAttachedFile postData: $postData");
        $headers = array('If-None-Match'=>'*');
        $response = $this->_request($reqUrl, 'POST', $postData, $headers);
        
        if($response->getStatus() == 200){
            libZoteroDebug("200 response from upload authorization ");
            $body = $response->getRawBody();
            $resObject = json_decode($body, true);
            if(!empty($resObject['exists'])){
                libZoteroDebug("File already exists ");
                return true;//api already has a copy, short-circuit with positive result
            }
            else{
                libZoteroDebug("uploading filecontents padded as specified ");
                //upload file padded with information we just got
                $uploadPostData = $resObject['prefix'] . $fileContents . $resObject['suffix'];
                libZoteroDebug($uploadPostData);
                $uploadHeaders = array('Content-Type'=>$resObject['contentType']);
                $uploadResponse = $this->_request($resObject['url'], 'POST', $uploadPostData, $uploadHeaders);
                if($uploadResponse->getStatus() == 201){
                    libZoteroDebug("got upload response 201 ");
                    //register upload
                    $ruparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->itemKey);
                    $registerReqUrl = $this->apiRequestUrl($ruparams) . $this->apiQueryString($ruparams);
                    //$registerUploadData = array('upload'=>$resObject['uploadKey']);
                    $registerUploadData = "upload=" . $resObject['uploadKey'];
                    libZoteroDebug("<br />Register Upload Data <br /><br />");
                    
                    $regUpResponse = $this->_request($registerReqUrl, 'POST', $registerUploadData, array('If-None-Match'=>'*'));
                    if($regUpResponse->getStatus() == 204){
                        libZoteroDebug("successfully registered upload ");
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
        }
        else{
            libZoteroDebug("non-200 response from upload authorization ");
            return false;
        }
    }
    
    public function createAttachmentItem($parentItem, $attachmentInfo){
        //get attachment template
        $templateItem = $this->getTemplateItem('attachment', 'imported_file');
        $templateItem->parentKey = $parentItem->itemKey;
        
        //create child item
        return $this->createItem($templateItem);
    }
    
    /**
     * Make API request to create a new item
     *
     * @param Zotero_Item $item the newly created Zotero_Item to be added to the server
     * @return Zotero_Response
     */
    public function createItem($item){
        $createItemObject = $item->newItemObject();
        //unset variables the api won't accept
        unset($createItemObject['mimeType']);
        unset($createItemObject['charset']);
        unset($createItemObject['contentType']);
        unset($createItemObject['filename']);
        unset($createItemObject['md5']);
        unset($createItemObject['mtime']);
        unset($createItemObject['zip']);
        
        $createItemJson = json_encode(array('items'=>array($createItemObject)));;
        libZoteroDebug("create item json: " . $createItemJson);
        //libZoteroDebug( $createItemJson );die;
        $aparams = array('target'=>'items');
        //alter if item is a child
        if($item->parentKey){
            $aparams['itemKey'] = $item->parentKey;
            $aparams['target'] = 'item';
            $aparams['targetModifier'] = 'children';
        }
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $createItemJson);
        return $response;
    }
    
    /**
     * Get a template for a new item of a certain type
     *
     * @param string $itemType type of item the template is for
     * @return Zotero_Item
     */
    public function getTemplateItem($itemType, $linkMode=null){
        $newItem = new Zotero_Item();
        $aparams = array('target'=>'itemTemplate', 'itemType'=>$itemType);
        if($linkMode){
            $aparams['linkMode'] = $linkMode;
        }
        
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        libZoteroDebug($reqUrl);
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error with api");
        }
        libZoteroDebug($response->getRawBody());
        $itemTemplate = json_decode($response->getRawBody(), true);
        $newItem->apiObject = $itemTemplate;
        return $newItem;
    }
    
    /**
     * Add child notes to a parent item
     *
     * @param Zotero_Item $parentItem the item the notes are to be children of
     * @param Zotero_Item|array $noteItem the note item or items
     * @return Zotero_Response
     */
    public function addNotes($parentItem, $noteItem){
        $aparams = array('target'=>'children', 'itemKey'=>$parentItem->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        if(!is_array($noteItem)){
            $noteJson = json_encode(array('items'=>array($noteItem->newItemObject())));
        }
        else{
            $notesArray = array();
            foreach($noteItem as $nitem){
                $notesArray[] = $nitem->newItemObject();
            }
            $noteJson = json_encode(array('items'=>$notesArray));
        }
        
        $response = $this->_request($reqUrl, 'POST', $noteJson);
        return $response;
    }
    
    /**
     * Create a new collection in this library
     *
     * @param string $name the name of the new item
     * @param Zotero_Item $parent the optional parent collection for the new collection
     * @return Zotero_Response
     */
    public function createCollection($name, $parent = false){
        $collection = new Zotero_Collection();
        $collection->name = $name;
        $collection->parentCollectionKey = $parent;
        $json = $collection->collectionJson();
        
        $aparams = array('target'=>'collections');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $json);
        return $response;
    }
    
    /**
     * Delete a collection from the library
     *
     * @param Zotero_Collection $collection collection object to be deleted
     * @return Zotero_Response
     */
    public function removeCollection($collection){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /**
     * Add Items to a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param array $items
     * @return Zotero_Response
     */
    public function addItemsToCollection($collection, $items){
        $aparams = array('target'=>'items', 'collectionKey'=>$collection->collectionKey);
        $itemKeysString = '';
        foreach($items as $item){
            $itemKeysString .= $item->itemKey;
        }
        $itemKeysString = trim($itemKeysString);
        
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $itemKeysString);
        return $response;
    }
    
    /**
     * Remove items from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param array $items
     * @return array $removedItemKeys list of itemKeys successfully removed
     */
    public function removeItemsFromCollection($collection, $items){
        $removedItemKeys = array();
        foreach($items as $item){
            $response = $this->removeItemFromCollection($collection, $item);
            if(!$response->isError()){
                $removedItemKeys[] = $item->itemKey;
            }
        }
        return $removedItemKeys;
    }
    
    /**
     * Remove a single item from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function removeItemFromCollection($collection, $item){
        $aparams = array('target'=>'items', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /**
     * Write a modified collection object back to the api
     *
     * @param Zotero_Collection $collection to modify
     * @return Zotero_Response
     */
    public function writeUpdatedCollection($collection){
        $json = $collection->collectionJson();
        
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'PUT', $json, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /**
     * Permanently delete an item from the API
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function deleteItem($item){
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$item->etag));
        return $response;
    }
    
    /**
     * Put an item in the trash
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function trashItem($item){
        $item->set('deleted', 1);
        $this->writeUpdatedItem($item);
    }
    
    /**
     * Fetch any child items of a particular item
     *
     * @param Zotero_Item $item
     * @return array $fetchedItems
     */
    public function fetchItemChildren($item){
        $aparams = array('target'=>'children', 'itemKey'=>$item->itemKey, 'content'=>'json');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        
        //load response into item objects
        $fetchedItems = array();
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $fetchedItems = $this->items->addItemsFromFeed($feed);
        return $fetchedItems;
    }
    
    /**
     * Get the list of itemTypes the API knows about
     *
     * @return array $itemTypes
     */
    public function getItemTypes(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemTypes';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemTypes");
        }
        $itemTypes = json_decode($response->getBody(), true);
        return $itemTypes;
    }
    
    /**
     * Get the list of item Fields the API knows about
     *
     * @return array $itemFields
     */
    public function getItemFields(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemFields';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemFields");
        }
        $itemFields = json_decode($response->getBody(), true);
        return $itemFields;
    }
    
    /**
     * Get the creatorTypes associated with an itemType
     *
     * @param string $itemType
     * @return array $creatorTypes
     */
    public function getCreatorTypes($itemType){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemTypeCreatorTypes?itemType=' . $itemType;
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorTypes");
        }
        $creatorTypes = json_decode($response->getBody(), true);
        return $creatorTypes;
    }
    
    /**
     * Get the creator Fields the API knows about
     *
     * @return array $creatorFields
     */
    public function getCreatorFields(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'creatorFields';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorFields");
        }
        $creatorFields = json_decode($response->getBody(), true);
        return $creatorFields;
    }
    
    /**
     * Fetch all the tags defined by the passed parameters
     *
     * @param array $params list of parameters defining the request
     * @return array $tags
     */
    public function fetchAllTags($params){
        $aparams = array_merge(array('target'=>'tags', 'content'=>'json', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        do{
            $response = $this->_request($reqUrl, 'GET');
            if($response->isError()){
                return false;
            }
            $doc = new DOMDocument();
            $doc->loadXml($response->getBody());
            $feed = new Zotero_Feed($doc);
            $entries = $doc->getElementsByTagName('entry');
            $tags = array();
            foreach($entries as $entry){
                $tag = new Zotero_Tag($entry);
                $tags[] = $tag;
            }
            if(isset($feed->links['next'])){
                $nextUrl = $feed->links['next']['href'];
                $parsedNextUrl = parse_url($nextUrl);
                $parsedNextUrl['query'] = $this->apiQueryString(array_merge(array('key'=>$this->_apiKey), $this->parseQueryString($parsedNextUrl['query']) ) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
                $reqUrl = false;
            }
        } while($reqUrl);
        
        return $tags;
    }
    
    /**
     * Make a single request for Zotero tags in this library defined by the passed parameters
     *
     * @param array $params list of parameters defining the request
     * @return array $tags
     */
    public function fetchTags($params){
        $aparams = array_merge(array('target'=>'tags', 'content'=>'json', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getMessage() . "\n" );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $feed = new Zotero_Feed($doc);
        $entries = $doc->getElementsByTagName('entry');
        $tags = array();
        foreach($entries as $entry){
            $tag = new Zotero_Tag($entry);
            $tags[] = $tag;
        }
        
        return $tags;
    }
    
    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    public function getKeyPermissions($userID=null, $key=false) {
        if($userID === null){
            $userID = $this->libraryID;
        }
        if($key == false){
            if($this->_apiKey == '') {
                false;
            }
            $key = $this->_apiKey;
        }
        
        $reqUrl = $this->apiRequestUrl(array('target'=>'key', 'apiKey'=>$key, 'userID'=>$userID));
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        $body = $response->getBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $keyNode = $doc->getElementsByTagName('key')->item(0);
        $keyPerms = $this->parseKey($keyNode);
        return $keyPerms;
    }
    
    /**
     * Parse a key response into an array
     *
     * @param $keyNode DOMNode from key response
     * @return array $keyPermissions
     */
    public function parseKey($keyNode){
        $key = array();
        $keyPerms = array("library"=>"0", "notes"=>"0", "write"=>"0", 'groups'=>array());
        
        $accessEls = $keyNode->getElementsByTagName('access');
        foreach($accessEls as $access){
            if($libraryAccess = $access->getAttribute("library")){
                $keyPerms['library'] = $libraryAccess;
            }
            if($notesAccess = $access->getAttribute("notes")){
                $keyPerms['notes'] = $notesAccess;
            }
            if($groupAccess = $access->getAttribute("group")){
                $groupPermission = $access->getAttribute("write") == '1' ? 'write' : 'read';
                $keyPerms['groups'][$groupAccess] = $groupPermission;
            }
            elseif($writeAccess = $access->getAttribute("write")) {
                $keyPerms['write'] = $writeAccess;
            }
            
        }
        return $keyPerms;
    }
    
    
    /**
     * Get groups a user belongs to
     *
     * @param string $userID
     * @return array $groups
     */
    public function fetchGroups($userID=''){
        if($userID == ''){
            $userID = $this->libraryID;
        }
        $aparams = array('target'=>'userGroups', 'userID'=>$userID, 'content'=>'json', 'order'=>'title');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getStatus() );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $entries = $doc->getElementsByTagName('entry');
        $groups = array();
        foreach($entries as $entry){
            $group = new Zotero_Group($entry);
            $groups[] = $group;
        }
        return $groups;
    }
    
    /**
     * Get recently created public groups
     *
     * @return array $groups
     */
    public function fetchRecentGroups(){
        return array();
        $aparams = array('target'=>'groups', 'limit'=>'10', 'content'=>'json', 'order'=>'dateAdded', 'sort'=>'desc', 'fq'=>'-GroupType:Private');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $entries = $doc->getElementsByTagName('entry');
        $groups = array();
        foreach($entries as $entry){
            $group = new Zotero_Group($entry);
            $groups[] = $group;
        }
        return $groups;
    }
    
    /**
     * Get CV for a user
     *
     * @param string $userID
     * @return array $groups
     */
    public function getCV($userID=''){
        if($userID == '' && $this->libraryType == 'user'){
            $userID = $this->libraryID;
        }
        $aparams = array('target'=>'cv', 'libraryType'=>'user', 'libraryID'=>$userID, 'linkwrap'=>'1');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $sectionNodes = $doc->getElementsByTagNameNS('*', 'cvsection');
        $sections = array();
        foreach($sectionNodes as $sectionNode){
            $sectionTitle = $sectionNode->getAttribute('title');
            $c = $doc->saveHTML($sectionNode);// $sectionNode->nodeValue;
            $sections[] = array('title'=> $sectionTitle, 'content'=>$c);
        }
        return $sections;
    }
    
    //these functions aren't really necessary for php since serializing
    //or apc caching works fine, with only the possible loss of a curl
    //handle that will be re-initialized
    public function saveLibrary(){
        $serialized = serialize($this);
        return $serialized;
    }
    
    public static function loadLibrary($dump){
        return unserialize($dump);
    }
}


/**
 * Utility functions for libZotero
 * 
 * @package libZotero
 */
class Zotero_Lib_Utils
{
    const ZOTERO_URI = 'https://api.zotero.org';
    const ZOTERO_WWW_URI = 'http://www.zotero.org';
    const ZOTERO_WWW_API_URI = 'http://www.zotero.org/api';
    
    public static function wrapLinks($txt, $nofollow=false){
        //extremely ugly wrapping of urls in html
        if($nofollow){
            $repstring = " <a rel='nofollow' href='$1'>$1</a>";
        }
        else{
            $repstring = " <a href='$1'>$1</a>";
        }
        //will break completely on CDATA with unescaped brackets, and probably on alot of malformed html
        return preg_replace('/(http:\/\/[-a-zA-Z0-9._~:\/?#\[\]@!$&\'\(\)*+,;=]+)(?=\.|,|;|\s)(?![^<]*>)/i', $repstring, $txt);
        
        
        //alternative regexes
        /*
        return preg_replace('/(?<!<[^>]*)(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        return preg_replace('/<(?[^>]+>)(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        
        return preg_replace('/\s(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        */
    }
    
    public static function wrapDOIs($txt){
        
    }
    
    public static function utilRequest($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array() ) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        //disable Expect header
        $httpHeaders[] = 'Expect:';
        
        if(!empty($basicauth)){
            $passString = $basicauth['username'] . ':' . $basicauth['password'];
            /*
            echo $passString;
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
            curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
             */
            $authHeader = 'Basic ' . base64_encode($passString);
            $httpHeaders[] = "Authorization: {$authHeader}";
        }
        else{
            $passString = '';
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        
        //FOLLOW LOCATION HEADERS
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $umethod = strtoupper($method);
        switch($umethod){
            case "GET":
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                break;
            case "POST":
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "PUT":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "DELETE":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
                break;
        }
        
        $responseBody = curl_exec($ch);
        $responseInfo = curl_getinfo($ch);
        
        $zresponse = libZotero_Http_Response::fromString($responseBody);
        
        //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
        //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
        //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
        //until a non-redirect is read
        while($zresponse->isRedirect()){
            $redirectedBody = $zresponse->getBody();
            $zresponse = libZotero_Http_Response::fromString($redirectedBody);
        }
        
        curl_close($ch);
        
        return $zresponse;
    }
    
    public static function apiQueryString($passedParams=array()){
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'q',
                                 'fq',
                                 'itemType',
                                 'locale',
                                 'key',
                                 'itemKey',
                                 'tag',
                                 'tagType',
                                 'style',
                                 'format',
                                 'linkMode',
                                 'linkwrap'
                                 );
        //build simple api query parameters object
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                //check if itemKey belongs in the url or the querystring
                if($val == 'itemKey' && isset($passedParams['target']) && ($passedParams['target'] != 'items') ) continue;
                $queryParams[$val] = $passedParams[$val];
            }
        }
        
        $queryString = '?';
        $queryParamsArray = array();
        foreach($queryParams as $index=>$value){
            if(is_array($value)){
                foreach($value as $key=>$val){
                    if(is_string($val) || is_int($val)){
                        $queryParamsArray[] = urlEncode($index) . '=' . urlencode($val);
                    }
                }
            }
            elseif(is_string($value) || is_int($value)){
                $queryParamsArray[] = urlencode($index) . '=' . urlencode($value);
            }
        }
        $queryString .= implode('&', $queryParamsArray);
        //print "apiQueryString: " . $queryString . "\n";
        return $queryString;
    }
    
}


?>