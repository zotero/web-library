<?php

$libraryType = 'user'; //user or group
$libraryID = 10150;
$librarySlug = 'fcheslack';
$apiKey = 'NiA0ZjtZaAP8S4VGaJsmPW96';
$addKeyAtProxy = false;//add @apiKey to requests at the php proxy so JS doesn't need a copy of it
$displayName = "";
$libraryString = "u10150"; //used as simple string ID for library, u or g for library type followed by libraryID

$libraryPathString = '/web-library/examples/library'; //path from web root to root of install directory
$allowEdit = 1; //explicitly set if editing is allowed. Note that this is only for UI purposes. Actual security should be handled by modifying the api key's permissions on zotero.org
$library_listShowFields = 'title,creator,year,numChildren'; //default fields to display in items listing
$staticPath = '/web-library/static';

