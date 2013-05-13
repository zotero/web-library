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
            //$this->apiVersion   = $feed->getElementsByTagName("apiVersion")->item(0)->nodeValue;//apiVersion being removed from zotero responses
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
    
    /**
     * @var int
     */
    public $version = 0;
    
    public $contentArray = array();
    
    /**
     * @var array
     */
    public $entries = array();
    
    public function __construct($entryNode)
    {
      if(!($entryNode instanceof DOMNode)){
          if(is_string($entryNode)){
            $doc = new DOMDocument();
            $doc->loadXml($entryNode);
            $entryNodes = $doc->getElementsByTagName("entry");
            if($entryNodes->length){
              $entryNode = $entryNodes->item(0);
            }
            else {
              return null;
            }
          }
      }
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
      if($contentNode) return $contentNode->getAttribute('type') || $contentNode->getAttributeNS('http://zotero.org/ns/api', 'type');
      else return false;
    }
    
    public function associateWithLibrary($library){
        $this->libraryType = $library->libraryType;
        $this->libraryID = $library->libraryID;
        $this->owningLibrary = $library;
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
    public $collectionVersion = 0;
    
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
    
    public $apiObject = array();
    
    public $pristine = array();
    
    public $childKeys = array();
    
    public function __construct($entryNode, $library=null)
    {
        if(!$entryNode){
            return;
        }
        parent::__construct($entryNode);
        
        $this->name = $this->title; //collection name is the Entry title
        
        //parse zapi tags
        $this->collectionKey = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'key')->item(0)->nodeValue;
        $this->collectionVersion = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'version')->item(0)->nodeValue;
        $this->numCollections = $entryNode->getElementsByTagName('numCollections')->item(0)->nodeValue;
        $this->numItems = $entryNode->getElementsByTagName('numItems')->item(0)->nodeValue;
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        if($contentNode){
            $contentType = $contentNode->getAttribute('type');
            if($contentType == 'application/json'){
                $this->pristine = json_decode($contentNode->nodeValue);
                $this->apiObject = json_decode($contentNode->nodeValue, true);
                $this->parentCollectionKey = $this->apiObject['parentCollection'];
                $this->name = $this->apiObject['name'];
            }
            elseif($contentType == 'xhtml'){
                //$this->parseXhtmlContent($contentNode);
            }
        }
        
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function get($key){
        switch($key){
            case 'title':
            case 'name':
                return $this->name;
            case 'collectionKey':
            case 'key':
                return $this->collectionKey;
            case 'parentCollection':
            case 'parentCollectionKey':
                return $this->parentCollectionKey;
            case 'collectionVersion':
            case 'version':
                return $this->collectionVersion;
        }
        
        if(array_key_exists($key, $this->apiObject)){
            return $this->apiObject[$key];
        }
        
        if(property_exists($this, $key)){
            return $this->$key;
        }
        return null;
    }
    
    public function set($key, $val){
        switch($key){
            case 'title':
            case 'name':
                $this->name = $val;
                $this->apiObject['name'] = $val;
                break;
            case 'collectionKey':
            case 'key':
                $this->collectionKey = $val;
                $this->apiObject['collectionKey'] = $val;
                break;
            case 'parentCollection':
            case 'parentCollectionKey':
                $this->parentCollectionKey = $val;
                $this->apiObject['parentCollection'] = $val;
                break;
            case 'collectionVersion':
            case 'version':
                $this->collectionVersion = $val;
                $this->apiObject['collectionVersion'] = $val;
                break;
        }
        
        if(array_key_exists($key, $this->apiObject)){
            $this->apiObject[$key] = $val;
        }
        
        if(property_exists($this, $key)){
            $this->$key = $val;
        }
    }
    
    public function collectionJson(){
        return json_encode($this->writeApiObject());
    }
    
    public function writeApiObject() {
        $updateItem = array_merge($this->pristine, $this->apiObject);
        return $updateItem;
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
    
    public function writeCollection($collection){
        $cols = $this->writeCollections(array($collection));
        if($cols === false){
            return false;
        }
        return $cols[0];
    }
    
    public function writeCollections($collections){
        $writeCollections = array();
        
        foreach($collections as $collection){
            $collectionKey = $collection->get('collectionKey');
            if($collectionKey == ""){
                $newCollectionKey = Zotero_Lib_Utils::getKey();
                $collection->set('collectionKey', $newCollectionKey);
                $collection->set('collectionVersion', 0);
            }
            $writeCollections[] = $collection;
        }
        
        $config = array('target'=>'collections', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'content'=>'json');
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        
        $chunks = array_chunk($writeCollections, 50);
        foreach($chunks as $chunk){
            $writeArray = array();
            foreach($chunk as $collection){
                $writeArray[] = $collection->writeApiObject();
            }
            $requestData = json_encode(array('collections'=>$writeArray));
            
            $writeResponse = $this->owningLibrary->_request($requestUrl, 'POST', $requestData, array('Content-Type'=> 'application/json'));
            if($writeResponse->isError()){
                foreach($chunk as $collection){
                    $collection->writeFailure = array('code'=>$writeResponse->getStatus(), 'message'=>$writeResponse->getBody());
                }
            }
            else {
                Zotero_Lib_Utils::UpdateObjectsFromWriteResponse($chunk, $writeResponse);
            }
        }
        return $writeCollections;
    }
    
    public function writeUpdatedCollection($collection){
        $this->writeCollections(array($collection));
        return $collection;
    }
    
    /**
     * Load all collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchAllCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), $params);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        do{
            $response = $this->owningLibrary->_request($reqUrl);
            if($response->isError()){
                throw new Exception("Error fetching collections");
            }
            
            $feed = new Zotero_Feed($response->getRawBody());
            $this->addCollectionsFromFeed($feed);
            
            if(isset($feed->links['next'])){
                $nextUrl = $feed->links['next']['href'];
                $parsedNextUrl = parse_url($nextUrl);
                $parsedNextUrl['query'] = $this->owningLibrary->apiQueryString($this->parseQueryString($parsedNextUrl['query']) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
                $reqUrl = false;
            }
        } while($reqUrl);
        
        $this->loaded = true;
        return $this->orderedArray;
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), $params);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl);
        if($response->isError()){
            return false;
            throw new Exception("Error fetching collections");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
        $this->owningLibrary->_lastFeed = $feed;
        $addedCollections = $this->addCollectionsFromFeed($feed);
        
        if(isset($feed->links['next'])){
            $nextUrl = $feed->links['next']['href'];
            $parsedNextUrl = parse_url($nextUrl);
            $parsedNextUrl['query'] = $this->apiQueryString($this->parseQueryString($parsedNextUrl['query']) );
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
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        
        $response = $this->owningLibrary->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching collection");
        }
        
        $entry = Zotero_Lib_Utils::getFirstEntryNode($response->getRawBody());
        if($entry == null){
            return false;
        }
        $collection = new Zotero_Collection($entry, $this);
        $this->addCollection($collection);
        return $collection;
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
    public $owningLibrary;
    public $itemsVersion = 0;
    
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
        if($this->owningLibrary){
            $item->associateWithLibrary($this->owningLibrary);
        }
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
    
    public function writeItem($item){
        return $this->writeItems(array($item));
    }
    
    //accept an array of `Zotero_Item`s
    public function writeItems($items){
        $writeItems = array();
        
        foreach($items as $item){
            $itemKey = $item->get('itemKey');
            if($itemKey == ""){
                $newItemKey = Zotero_Lib_Utils::getKey();
                $item->set('itemKey', $newItemKey);
                $item->set('itemVersion', 0);
            }
            $writeItems[] = $item;
            
            //add separate note items if this item has any
            $itemNotes = $item->get('notes');
            if($itemNotes && (count($itemNotes) > 0) ){
                foreach($itemNotes as $note){
                    $note->set('parentItem', $item->get('itemKey'));
                    $note->set('itemKey', Zotero_Lib_Utils::getKey());
                    $note->set('itemVersion', 0);
                    $writeItems[] = $note;
                }
            }
        }
        
        $config = array('target'=>'items', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'content'=>'json');
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        $chunks = array_chunk($writeItems, 50);
        foreach($chunks as $chunk){
            $writeArray = array();
            foreach($chunk as $item){
                $writeArray[] = $item->writeApiObject();
            }
            $requestData = json_encode(array('items'=>$writeArray));
            
            $writeResponse = $this->owningLibrary->_request($requestUrl, 'POST', $requestData, array('Content-Type'=> 'application/json'));
            if($writeResponse->isError()){
                foreach($chunk as $item){
                    $item->writeFailure = array('code'=>$writeResponse->getStatus(), 'message'=>$writeResponse->getBody());
                }
            }
            else {
                Zotero_Lib_Utils::UpdateObjectsFromWriteResponse($chunk, $writeResponse);
            }
        }
        return $writeItems;
    }
    
    public function trashItem($item){
        $item->trashItem();
        return $item->save();
    }
    
    public function trashItems($items){
        foreach($items as $item){
            $item->trashItem();
        }
        return $this->writeItems($items);
    }
    
    public function deleteItem($item){
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl, 'DELETE', null, array('If-Unmodified-Since-Version'=>$item->itemVersion));
        return $response;
    }
    
    //delete multiple items
    //modified version we submit to the api falls back from explicit argument, to $items->itemsVersion
    //if set and non-zero, to the max itemVersion of items passed for deletion
    public function deleteItems($items, $version=null){
        if(count($items) > 50){
            throw new Exception("Too many items to delete");
        }
        $itemKeys = array();
        $latestItemVersion = 0;
        foreach($items as $item){
            array_push($itemKeys, $item->get('itemKey'));
            $v = $item->get('version');
            if($v > $latestItemVersion){
                $latestItemVersion = $v;
            }
        }
        if($version === null){
            if($this->itemsVersion !== 0){
                $version = $this->itemsVersion;
            }
            else {
                $version = $latestItemVersion;
            }
        }
        
        $aparams = array('target'=>'items', 'itemKey'=>$itemKeys);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl, 'DELETE', null, array('If-Unmodified-Since-Version'=>$version));
        return $response;
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

class Zotero_Cite {
    private static $citePaperJournalArticleURL = false;

    //
    // Ported from cite.js in the Zotero client
    //
    
    /**
     * Mappings for names
     * Note that this is the reverse of the text variable map, since all mappings should be one to one
     * and it makes the code cleaner
     */
    private static $zoteroNameMap = array(
        "author" => "author",
        "editor" => "editor",
        "bookAuthor" => "container-author",
        "composer" => "composer",
        "interviewer" => "interviewer",
        "recipient" => "recipient",
        "seriesEditor" => "collection-editor",
        "translator" => "translator"
    );
    
    /**
     * Mappings for text variables
     */
    private static $zoteroFieldMap = array(
        "title" => array("title"),
        "container-title" => array("publicationTitle",  "reporter", "code"), /* reporter and code should move to SQL mapping tables */
        "collection-title" => array("seriesTitle", "series"),
        "collection-number" => array("seriesNumber"),
        "publisher" => array("publisher", "distributor"), /* distributor should move to SQL mapping tables */
        "publisher-place" => array("place"),
        "authority" => array("court"),
        "page" => array("pages"),
        "volume" => array("volume"),
        "issue" => array("issue"),
        "number-of-volumes" => array("numberOfVolumes"),
        "number-of-pages" => array("numPages"),
        "edition" => array("edition"),
        "version" => array("version"),
        "section" => array("section"),
        "genre" => array("type", "artworkSize"), /* artworkSize should move to SQL mapping tables, or added as a CSL variable */
        "medium" => array("medium", "system"),
        "archive" => array("archive"),
        "archive_location" => array("archiveLocation"),
        "event" => array("meetingName", "conferenceName"), /* these should be mapped to the same base field in SQL mapping tables */
        "event-place" => array("place"),
        "abstract" => array("abstractNote"),
        "URL" => array("url"),
        "DOI" => array("DOI"),
        "ISBN" => array("ISBN"),
        "call-number" => array("callNumber"),
        "note" => array("extra"),
        "number" => array("number"),
        "references" => array("history"),
        "shortTitle" => array("shortTitle"),
        "journalAbbreviation" => array("journalAbbreviation"),
        "language" => array("language")
    );
    
    private static $zoteroDateMap = array(
        "issued" => "date",
        "accessed" => "accessDate"
    );
    
    private static $zoteroTypeMap = array(
        'book' => "book",
        'bookSection' => "chapter",
        'journalArticle' => "article-journal",
        'magazineArticle' => "article-magazine",
        'newspaperArticle' => "article-newspaper",
        'thesis' => "thesis",
        'encyclopediaArticle' => "entry-encyclopedia",
        'dictionaryEntry' => "entry-dictionary",
        'conferencePaper' => "paper-conference",
        'letter' => "personal_communication",
        'manuscript' => "manuscript",
        'interview' => "interview",
        'film' => "motion_picture",
        'artwork' => "graphic",
        'webpage' => "webpage",
        'report' => "report",
        'bill' => "bill",
        'case' => "legal_case",
        'hearing' => "bill",                // ??
        'patent' => "patent",
        'statute' => "bill",                // ??
        'email' => "personal_communication",
        'map' => "map",
        'blogPost' => "webpage",
        'instantMessage' => "personal_communication",
        'forumPost' => "webpage",
        'audioRecording' => "song",     // ??
        'presentation' => "speech",
        'videoRecording' => "motion_picture",
        'tvBroadcast' => "broadcast",
        'radioBroadcast' => "broadcast",
        'podcast' => "song",            // ??
        'computerProgram' => "book"     // ??
    );
    
    private static $quotedRegexp = '/^".+"$/';
    
    public static function convertItem($zoteroItem) {
        if (!$zoteroItem) {
            throw new Exception("Zotero item not provided");
        }
        
        // don't return URL or accessed information for journal articles if a
        // pages field exists
        $itemType = $zoteroItem->get("itemType");//Zotero_ItemTypes::getName($zoteroItem->itemTypeID);
        $cslType = isset(self::$zoteroTypeMap[$itemType]) ? self::$zoteroTypeMap[$itemType] : false;
        if (!$cslType) $cslType = "article";
        $ignoreURL = (($zoteroItem->get("accessDate") || $zoteroItem->get("url")) &&
                in_array($itemType, array("journalArticle", "newspaperArticle", "magazineArticle"))
                && $zoteroItem->get("pages")
                && self::$citePaperJournalArticleURL);
        
        $cslItem = array(
            'id' => $zoteroItem->owningLibrary->libraryID . "/" . $zoteroItem->get("key"),
            'type' => $cslType
        );
        
        // get all text variables (there must be a better way)
        // TODO: does citeproc-js permit short forms?
        foreach (self::$zoteroFieldMap as $variable=>$fields) {
            if ($variable == "URL" && $ignoreURL) continue;
            
            foreach($fields as $field) {
                $value = $zoteroItem->get($field);
                if ($value !== "" && $value !== null) {
                    // Strip enclosing quotes
                    if (preg_match(self::$quotedRegexp, $value)) {
                        $value = substr($value, 1, strlen($value)-2);
                    }
                    $cslItem[$variable] = $value;
                    break;
                }
            }
        }
        
        // separate name variables
        $creators = $zoteroItem->get('creators');
        foreach ($creators as $creator) {
            $creatorType = $creator['creatorType'];// isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
            if (!$creatorType) continue;
            
            if(isset($creator["name"])){
                $nameObj = array('literal' => $creator['name']);
            }
            else {
                $nameObj = array('family' => $creator['lastName'], 'given' => $creator['firstName']);
            }
            
            if (isset($cslItem[$creatorType])) {
                $cslItem[$creatorType][] = $nameObj;
            }
            else {
                $cslItem[$creatorType] = array($nameObj);
            }
        }
        
        // get date variables
        foreach (self::$zoteroDateMap as $key=>$val) {
            $date = $zoteroItem->get($val);
            if ($date) {
                $cslItem[$key] = array("raw" => $date);
            }
        }
        
        return $cslItem;
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
    public $itemVersion = 0;
    
    /**
     * @var int
     */
    public $itemKey = '';
    
    /**
     * @var Zotero_Library
     */
    public $owningLibrary = null;
    
    /**
     * @var string
     */
    public $itemType = null;
    
    /**
     * @var string
     */
    public $year = '';
    
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
    public $parentItemKey = '';
    
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
    public $notes = array();
    
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
    
    public $writeFailure = null;
    
    /**
     * @var string content node of response useful if formatted bib request and we need to use the raw content
     */
    public $content = null;
    
    public $bibContent = null;
    
    public $subContents = array();
    
    public $apiObject = array('itemType'=>null, 'tags'=>array(), 'collections'=>array(), 'relations'=>array());
    
    public $pristine = null;
    
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
    
    
    public function __construct($entryNode=null, $library=null)
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
        $subcontentNodes = $entryNode->getElementsByTagNameNS("http://zotero.org/ns/api", "subcontent");
        
        // Extract the zapi elements: object key, version, itemType, year, numChildren, numTags
        $this->itemKey = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'key')->item(0)->nodeValue;
        $this->itemVersion = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'version')->item(0)->nodeValue;
        $this->itemType = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'itemType')->item(0)->nodeValue;
        // Look for numTags node
        // this may be always present in v2 api
        $numTagsNode = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', "numTags")->item(0);
        if($numTagsNode){
            $this->numTags = $numTagsNode->nodeValue;
        }
        
        // Look for year node
        $yearNode = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', "year")->item(0);
        if($yearNode){
            $this->year = $yearNode->nodeValue;
        }
        
        // Look for numChildren node
        $numChildrenNode = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', "numChildren")->item(0);
        if($numChildrenNode){
            $this->numChildren = $numChildrenNode->nodeValue;
        }
        
        // Look for creatorSummary node - only present if there are non-empty creators
        $creatorSummaryNode = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', "creatorSummary")->item(0);
        if($creatorSummaryNode){
            $this->creatorSummary = $creatorSummaryNode->nodeValue;
        }
        
        // pull out and parse various subcontent nodes, or parse the single content node
        if($subcontentNodes->length > 0){
            for($i = 0; $i < $subcontentNodes->length; $i++){
                $scnode = $subcontentNodes->item($i);
                $this->parseContentNode($scnode);
            }
        }
        else{
            $contentNode = $entryNode->getElementsByTagName('content')->item(0);
            $this->parseContentNode($contentNode);
        }
        
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function parseContentNode($node){
        $type = $node->getAttributeNS('http://zotero.org/ns/api', 'type');
        if($type == 'application/json' || $type == 'json'){
            $this->pristine = json_decode($node->nodeValue, true);
            $this->apiObject = json_decode($node->nodeValue, true);
            $this->apiObj = &$this->apiObject;
            if(isset($this->apiObject['creators'])){
                $this->creators = $this->apiObject['creators'];
            }
            else{
                $this->creators = array();
            }
            $this->itemVersion = isset($this->apiObject['itemVersion']) ? $this->apiObject['itemVersion'] : 0;
            $this->parentItemKey = isset($this->apiObject['parentItem']) ? $this->apiObject['parentItem'] : false;
            
            if($this->itemType == 'attachment'){
                $this->mimeType = $this->apiObject['contentType'];
                $this->translatedMimeType = Zotero_Lib_Utils::translateMimeType($this->mimeType);
            }
            if(array_key_exists('linkMode', $this->apiObject)){
                $this->linkMode = $this->apiObject['linkMode'];
            }
            $this->synced = true;
        }
        elseif($type == 'bib'){
            $bibNode = $node->getElementsByTagName('div')->item(0);
            $this->bibContent = $bibNode->ownerDocument->saveXML($bibNode);
        }
        
        $contentString = '';
        $childNodes = $node->childNodes;
        foreach($childNodes as $childNode){
            $contentString .= $childNode->ownerDocument->saveXML($childNode);
        }
        $this->subContents[$type] = $contentString;
    }
    
    public function initItemFromTemplate($template){
        $this->itemVersion = 0;
        
        $this->itemType = $template['itemType'];
        $this->itemKey = '';
        $this->pristine = $template;
        $this->apiObject = $template;
    }
    
    public function get($key){
        switch($key){
            case 'key':
            case 'itemKey':
                return $this->itemKey;
            case 'itemVersion':
            case 'version':
                return $this->itemVersion;
            case 'title':
                return $this->title;
            case 'creatorSummary':
                return $this->creatorSummary;
            case 'year':
                return $this->year;
            case 'parentItem':
            case 'parentItemKey':
                return $this->parentItemKey;
        }
        
        if(array_key_exists($key, $this->apiObject)){
            return $this->apiObject[$key];
        }
        
        if(property_exists($this, $key)){
            return $this->$key;
        }
        return null;
    }
    
    public function set($key, $val){
        if(array_key_exists($key, $this->apiObject)){
            $this->apiObject[$key] = $val;
        }
        
        switch($key){
            case "itemKey":
            case "key":
                $this->itemKey = $val;
                $this->apiObject['itemKey'] = $val;
                break;
            case "itemVersion":
            case "version":
                $this->itemVersion = $val;
                $this->apiObject["itemVersion"] = $val;
                break;
            case "title":
                $this->title = $val;
                break;
            case "itemType":
                $this->itemType = $val;
                //TODO: translate api object to new item type
                break;
            case "linkMode":
                //TODO: something here?
                break;
            case "deleted":
                $this->apiObject["deleted"] = $val;
                break;
            case "parentItem":
            case "parentKey":
            case "parentItemKey":
                if( $val === '' ){ $val = false; }
                $this->parentItemKey = $val;
                $this->apiObject["parentItem"] = $val;
                break;
        }
    }
    
    public function addCreator($creatorArray){
        $this->creators[] = $creatorArray;
        $this->apiObject['creators'][] = $creatorArray;
    }
    
    public function updateItemObject(){
        return $this->writeApiObject();
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
    
    public function attachmentIsSnapshot(){
        if(!isset($this->links['enclosure'])) return false;
        if(!isset($this->links['enclosure']['text/html'])) return false;
        $tail = substr($this->links['enclosure']['text/html']['href'], -4);
        if($tail == "view") return true;
        return false;
    }
    
    public function json(){
        return json_encode($this->apiObject());
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
    
    public function addToCollection($collection){
        if(is_string($collection)){
            $collectionKey = $collection;
        }
        else {
            $collectionKey = $collection->get('collectionKey');
        }
        
        $memberCollectionKeys = $this->get('collections');
        if(!is_array($memberCollectionKeys)){
            $memberCollectionKeys = array($collectionKey);
            $this->set('collections', $memberCollectionKeys);
        }
        else {
            if(!in_array($collectionKey, $memberCollectionKeys)) {
                $memberCollectionKeys[] = $collectionKey;
                $this->set('collections', $memberCollectionKeys);
            }
        }
    }
    
    public function removeFromCollection($collection){
        if(is_string($collection)){
            $collectionKey = $collection;
        }
        else {
            $collectionKey = $collection->get('collectionKey');
        }
        
        $memberCollectionKeys = $this->get('collections');
        if(!is_array($memberCollectionKeys)){
            $memberCollectionKeys = array($collectionKey);
            $this->set('collections', $memberCollectionKeys);
        }
        else {
            $ind = array_search($collectionKey, $memberCollectionKeys);
            if($ind !== false){
                array_splice($memberCollectionKeys, $ind, 1);
                $this->set('collections', $memberCollectionKeys);
            }
        }
    }
    
    public function addTag($newtagname, $type=null){
        $itemTags = $this->get('tags');
        //assumes we'll get an array
        foreach($itemTags as $tag){
            if(is_string($tag) && $tag == $newtagname){
                return;
            }
            elseif(is_array($tag) && isset($tag['tag']) && $tag['tag'] == $newtagname) {
                return;
            }
        }
        if($type !== null){
            $itemTags[] = array('tag'=>$newtagname, 'type'=>$type);
        }
        else {
            $itemTags[] = array('tag'=>$newtagname);
        }
        $this->set('tags', $itemTags);
    }
    
    public function removeTag($rmtagname){
        $itemTags = $this->get('tags');
        //assumes we'll get an array
        foreach($itemTags as $ind=>$tag){
            if( (is_string($tag) && $tag == $rmtagname) ||
                (is_array($tag) && isset($tag['tag']) && $tag['tag'] == $rmtagname) ){
                array_splice($itemTags, $ind, 1);
                $this->set('tags', $itemTags);
                return;
            }
        }
    }
    
    public function addNote($noteItem){
        $this->notes[] = $noteItem;
    }
    
    public function uploadFile(){
        
    }
    
    public function uploadChildAttachment(){
        
    }
    
    public function writeApiObject(){
        $updateItem = array_merge($this->pristine, $this->apiObject);
        if(empty($updateItem['creators'])){
            return $updateItem;
        }
        
        $newCreators = array();
        foreach($updateItem['creators'] as $creator){
            if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                continue;
            }
            else {
                $newCreators[] = $creator;
            }
        }
        $updateItem['creators'] = $newCreators;
        return $updateItem;
    }
    
    public function writePatch(){
        
    }
    
    public function trashItem(){
        $this->set('deleted', 1);
    }
    
    public function untrashItem(){
        $this->set('deleted', 0);
    }
    
    public function save() {
        return $this->owningLibrary->items->writeItems(array($this));
    }
    
    public function getChildren(){
        //short circuit if has item has no children
        if(!($this->numChildren)){//} || (this.parentItemKey !== false)){
            return array();
        }
        
        $config = array('target'=>'children', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'itemKey'=>$this->itemKey, 'content'=>'json');
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        
        $response = $this->owningLibrary->_request($requestUrl, 'GET');
        
        //load response into item objects
        $fetchedItems = array();
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
        $fetchedItems = $this->owningLibrary->items->addItemsFromFeed($feed);
        return $fetchedItems;
    }
    
    public function getCSLItem(){
        return Zotero_Cite::convertItem($this);
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
    public $ownerID;
    
    /**
     * @var string
     */
    public $type;
    
    /**
     * @var string
     */
    public $name;
    
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
            $this->owner = $this->ownerID;
            $this->groupType = $this->apiObject['type'];
            $this->description = $this->apiObject['description'];
            $this->url = $this->apiObject['url'];
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
        
        $this->numItems = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'numItems')->item(0)->nodeValue;
        
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
                $this->description = $jsonObject['description'];
                $this->url = $jsonObject['url'];
                $this->hasImage = isset($jsonObject['hasImage']) ? $jsonObject['hasImage'] : 0;
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
                    $this->properties['description'] = $description->nodeValue;
                    $this->description = $description->nodeValue;
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
        if($entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'groupID')->length > 0){
            $this->groupID = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'groupID')->item(0)->nodeValue;
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
        $el->appendChild(new DOMElement('description', $this->description));
        $el->appendChild(new DOMElement('url', $this->url));
        if($this->groupID){
            $el->setAttribute('id', $this->groupID);
        }
        $el->setAttribute('owner', $this->ownerID);
        $el->setAttribute('type', $this->type);
        $el->setAttribute('name', $this->name);
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
        
        $numItems = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', "numItems")->item(0);
        if($numItems) {
            $this->numItems = (int)$numItems->nodeValue;
        }
        
        $tagElements = $entryNode->getElementsByTagName("tag");
        $tagElement = $tagElements->item(0);
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        if($contentNode){
            $contentType = $contentNode->getAttribute('type');
            if($contentType == 'application/json'){
                $this->pristine = json_decode($contentNode->nodeValue, true);
                $this->apiObject = json_decode($contentNode->nodeValue, true);
            }
            elseif($contentType == 'xhtml'){
                //$this->parseXhtmlContent($contentNode);
            }
        }
    }
    
    public function get($key) {
        switch($key){
            case "tag":
            case "name":
            case "title":
                return $this->name;
        }
        
        if(array_key_exists($key, $this->apiObject)){
            return $this->apiObject[$key];
        }
        
        if(property_exists($this, $key)){
            return $this->$key;
        }
        return null;
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
define('ZOTERO_API_VERSION', 2);
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
    public $_apiKey = '';
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
    public $libraryVersion = 0;
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
    public function __construct($libraryType = null, $libraryID = null, $libraryUrlIdentifier = null, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org", $cachettl=0)
    {
        $this->_apiKey = $apiKey;
        if (!extension_loaded('curl')) {
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
        $this->items->owningLibrary = $this;
        $this->collections = new Zotero_Collections();
        $this->collections->owningLibrary = $this;
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
        //set api version - allowed to be overridden by passed in value
        if(!isset($headers['Zotero-API-Version'])){
            $headers['Zotero-API-Version'] = ZOTERO_API_VERSION;
        }
        
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
            if($this->_cacheResponses && !($zresponse->isError()) ){
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
                if(!empty($params['itemKey'])){
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
            case 'cv':
                $url .= '/cv';
                break;
            case 'deleted':
                $url .= '/deleted';
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
        ksort($queryParams);
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
        return $queryString;
    }
    
    public function apiRequestString($params = array(), $base = Zotero_Library::ZOTERO_URI) {
        return $this->apiRequestUrl($params) . $this->apiQueryString($params);
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
        return $this->collections->fetchAllCollections($params);
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchCollections($params = array()){
        return $this->collections->fetchCollections($params);
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Zotero_Collection
     */
    public function fetchCollection($collectionKey){
        return $this->collections->fetchCollection($collectionKey);
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
        $reqUrl = $this->apiRequestString($aparams);
        
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
        $aparams = array_merge(array('content'=>'json'), array('key'=>$this->_apiKey), $params, array('collectionKey'=>'trash'));
        $reqUrl = $this->apiRequestString($aparams);
        libZoteroDebug( "\n");
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
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
        $reqUrl = $this->apiRequestString($aparams);
        libZoteroDebug( $reqUrl . "\n" );
        
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
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
    public function fetchItem($itemKey, $params=array()){
        $aparams = array_merge(array('target'=>'item', 'content'=>'json', 'itemKey'=>$itemKey), $params);
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $entry = Zotero_Lib_Utils::getFirstEntryNode($response->getRawBody());
        if($entry == null) return false;
        $item = new Zotero_Item($entry, $this);
        $this->items->addItem($item);
        return $item;
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
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $entry = Zotero_Lib_Utils::getFirstEntryNode($response->getRawBody());
        if($entry == null) return false;
        $item = new Zotero_Item($entry, $this);
        $this->items->addItem($item);
        return $item;
    }

    /**
     * construct the url for file download of the item if it exists
     *
     * @param string $itemKey
     * @return string
     */
    public function itemDownloadLink($itemKey){
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey, 'targetModifier'=>'file');
        return $this->apiRequestString($aparams);
    }
    
    /**
     * Write a modified item back to the api
     *
     * @param Zotero_Item $item the modified item to be written back
     * @return Zotero_Response
     */
    public function writeUpdatedItem($item){
        if($item->owningLibrary == null) {
            $item->associateWithLibrary($this);
        }
        return $this->items->writeItem($item);
    }
    
    public function uploadNewAttachedFile($item, $fileContents, $fileinfo=array()){
        //get upload authorization
        $aparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestString($aparams);
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
        $this->items->writeItems(array($item));
    }
    
    /**
     * Get a template for a new item of a certain type
     *
     * @param string $itemType type of item the template is for
     * @return Zotero_Item
     */
    public function getTemplateItem($itemType, $linkMode=null){
        $newItem = new Zotero_Item(null, $this);
        $aparams = array('target'=>'itemTemplate', 'itemType'=>$itemType);
        if($linkMode){
            $aparams['linkMode'] = $linkMode;
        }
        
        $reqUrl = $this->apiRequestString($aparams);
        libZoteroDebug($reqUrl);
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("API error retrieving item template - {$response->getStatus()} : {$response->getRawBody()}");
        }
        libZoteroDebug($response->getRawBody());
        $itemTemplate = json_decode($response->getRawBody(), true);
        $newItem->initItemFromTemplate($itemTemplate);
        return $newItem;
    }
    
    /**
     * Add child notes to a parent item
     *
     * @param Zotero_Item $parentItem the item the notes are to be children of
     * @param Zotero_Item|array $noteItem the note item or items
     * @return array of Zotero_Item
     */
    public function addNotes($parentItem, $noteItem){
        $aparams = array('target'=>'items');
        $reqUrl = $this->apiRequestString($aparams);
        $noteWriteItems = array();
        if(!is_array($noteItem)){
            if(get_class($noteItem) == "Zotero_Item"){
                $noteWriteItems[] = $noteItem;
            }
            else {
                throw new Exception("Unexpected note item type");
            }
        }
        else{
            foreach($noteItem as $nitem){
                $noteWriteItems[] = $nitem;
            }
        }
        
        //set parentItem for all notes
        $parentItemKey = $parentItem->get("itemKey");
        foreach($noteWriteItems as $nitem){
            $nitem->set("parentItem", $parentItemKey);
        }
        return $this->items->writeItems($noteWriteItems);
    }
    
    /**
     * Create a new collection in this library
     *
     * @param string $name the name of the new item
     * @param Zotero_Item $parent the optional parent collection for the new collection
     * @return Zotero_Response
     */
    public function createCollection($name, $parent = false){
        $collection = new Zotero_Collection(null, $this);
        $collection->set('name', $name);
        $collection->set('parentCollectionKey', $parent);
        return $this->collections->writeCollection($collection);
    }
    
    /**
     * Delete a collection from the library
     *
     * @param Zotero_Collection $collection collection object to be deleted
     * @return Zotero_Response
     */
    public function removeCollection($collection){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Unmodified-Since-Version'=>$collection->get('collectionVersion')));
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
        foreach($items as $item){
            $item->addToCollection($collection);
        }
        $updatedItems = $this->items->writeItems($items);
        return $updatedItems;
    }
    
    /**
     * Remove items from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param array $items
     * @return array $removedItemKeys list of itemKeys successfully removed
     */
    public function removeItemsFromCollection($collection, $items){
        foreach($items as $item){
            $item->removeFromCollection($collection);
        }
        $updatedItems = $this->items->writeItems($items);
        return $updatedItems;
    }
    
    /**
     * Remove a single item from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function removeItemFromCollection($collection, $item){
        $item->removeFromCollection($collection);
        return $this->items->writeItems(array($item));
    }
    
    /**
     * Write a modified collection object back to the api
     *
     * @param Zotero_Collection $collection to modify
     * @return Zotero_Response
     */
    public function writeUpdatedCollection($collection){
        return $this->collections->writeUpdatedCollection($collection);
    }
    
    /**
     * Permanently delete an item from the API
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function deleteItem($item){
        $this->items->deleteItem($item);
    }
    
    public function deleteItems($items, $version=null){
        $this->items->deleteItems($items, $version);
    }
    
    /**
     * Put an item in the trash
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function trashItem($item){
        return $item->trashItem();
    }
    
    /**
     * Fetch any child items of a particular item
     *
     * @param Zotero_Item $item
     * @return array $fetchedItems
     */
    public function fetchItemChildren($item){
        if(is_string($item)){
            $itemKey = $item;
        }
        else {
            $itemKey = $item->itemKey;
        }
        $aparams = array('target'=>'children', 'itemKey'=>$itemKey, 'content'=>'json');
        $reqUrl = $this->apiRequestString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        
        //load response into item objects
        $fetchedItems = array();
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
        
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
        $reqUrl = $this->apiRequestString($aparams);
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
    public function fetchTags($params = array()){
        $aparams = array_merge(array('target'=>'tags', 'content'=>'json', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getMessage() . "\n" );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        
        $entries = Zotero_Lib_Utils::getEntryNodes($response->getRawBody());
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
        return Zotero_Lib_Utils::parseKey($keyNode);
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
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getStatus() );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        
        $entries = Zotero_Lib_Utils::getEntryNodes($response->getRawBody());
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
        $reqUrl = $this->apiRequestString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $entries = Zotero_Lib_Utils::getEntryNodes($response->getRawBody());
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
        $reqUrl = $this->apiRequestString($aparams);
        
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
    
    public static function randomString($len=0, $chars=null) {
        if ($chars === null) {
            $chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if ($len==0) {
            $len = 8;
        }
        $randomstring = '';
        for ($i = 0; $i < $len; $i++) {
            $rnum = rand(0, strlen($chars) - 1);
            $randomstring .= $chars[$rnum];
        }
        return $randomstring;
    }
    
    public static function getKey() {
        $baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero_Lib_Utils::randomString(8, $baseString);
    }
    
    //update items appropriately based on response to multi-write request
    //for success:
    //  update objectKey if item doesn't have one yet (newly created item)
    //  update itemVersion to response's Last-Modified-Version header
    //  mark as synced
    //for unchanged:
    //  don't need to do anything? itemVersion should remain the same?
    //  mark as synced if not already?
    //for failed:
    //  do something. flag as error? display some message to user?
    public static function updateObjectsFromWriteResponse($objectsArray, $response){
        $data = json_decode($response->getRawBody(), true);
        if($response->getStatus() == 200){
            $newLastModifiedVersion = $response->getHeader("Last-Modified-Version");
            if(isset($data['success'])){
                foreach($data['success'] as $ind=>$key){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    
                    $objectKey = $object->get('key');
                    if($objectKey != '' && $objectKey != $key){
                        throw new Exception("Item key mismatch in multi-write request");
                    }
                    if($objectKey == ''){
                        $object->set('key', $key);
                    }
                    $object->set('version', $newLastModifiedVersion);
                    $object->synced = true;
                    $object->writeFailure = false;
                }
            }
            if(isset($data['failed'])){
                foreach($data['failed'] as $ind=>$val){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    $object->writeFailure = $val;
                }
            }
        }
        elseif($response->getStatus() == 204){
            $objectsArray[0]->synced = true;
        }
    }
    
    public static function parseKey($keynode){
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
    
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring += $libraryID;
        return $lstring;
    }
    
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
        $matches = array();
        $doi = preg_match("(10\.[^\s\/]+\/[^\s]+)", $txt, $matches);
        $m1 = htmlspecialchars($matches[0]);
        $safetxt = htmlspecialchars($txt);
        return "<a href=\"http://dx.doi.org/{$matches[0]}\" rel=\"nofollow\">{$safetxt}</a>";
    }
    
    public static function getFirstEntryNode($body){
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $entryNodes = $doc->getElementsByTagName("entry");
        if($entryNodes->length){
            return $entryNodes->item(0);
        }
        else {
            return null;
        }
    }
    
    public static function getEntryNodes($body){
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $entryNodes = $doc->getElementsByTagName("entry");
        return $entryNodes;
    }
    
    public static function utilRequest($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array() ) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        
        //set api version - allowed to be overridden by passed in value
        if(!isset($headers['Zotero-API-Version'])){
            $headers['Zotero-API-Version'] = ZOTERO_API_VERSION;
        }
        
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
    
    public static function translateMimeType($mimeType)
    {
        switch ($mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return $mimeType;
        }
    }
}


?>