<!DOCTYPE html>
<?error_reporting(E_ALL | E_STRICT);
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
?>
<?include "config.php";?>
<?

$messages = array();
?>
<html lang="en" class="no-js">
    <head>
        <title>Zotero Citater</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="keywords" content="Zotero, research, tool, firefox, extension"/>
        <meta name="description" content="Zotero is a powerful, easy-to-use research tool that 
                                          helps you gather, organize, and analyze sources and then 
                                          share the results of your research."/>
        
        <link rel="shortcut icon" type="image/png" sizes="48x48" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon-precomposed" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        
        <!-- css -->
        <link rel="stylesheet" media="screen" href="<?=$staticPath?>/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" media="screen" href="<?=$staticPath?>/bootstrap/css/bootstrap-theme.min.css">
        <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/jquery/jquery-all.js"></script>
        <script src="<?=$staticPath?>/bootstrap/js/bootstrap.min.js"></script>
        <script src="<?=$staticPath?>/library/typeahead/typeahead.js"></script>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/theme_style3.css" 
            type="text/css" media="screen" charset="utf-8"/>
        <link rel="stylesheet" href="<?=$staticPath?>/css/bootstrap_library_style.css" 
            type="text/css" media="screen" charset="utf-8"/>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/zotero_icons_sprite.css"
            type="text/css" media="screen" charset="utf-8"/>
        <script src="<?=$staticPath?>/library/modernizr/modernizr-1.7.min.js"></script>
    </head>
    <!-- library class on body necessary for zotero www init -->
    <body class="citater library">
        <!-- Header -->
        <!-- Header -->
        <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
            <div class="navbar-header">
                <?/*
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                */?>
                <a class="navbar-brand" href="#">Zotero Citater</a>
            </div>
            <div class="eventfulwidget" id="control-panel"
                    data-widget='controlPanel'
                    data-library='<?=$libraryString?>'>
                <div class="btn-toolbar pull-left">
                    <div class="btn-group create-item-dropdown">
                        <button type="button" class="create-item-button btn btn-default navbar-btn dropdown-toggle eventfultrigger" data-toggle="dropdown" data-library='<?=$libraryString?>' data-triggers="createItem" title="New Item"><span class="icon-item-add glyphicon"></span></button>
                        <ul class="dropdown-menu" role="menu" style="max-height:300px; overflow:auto;">
                            <!-- dropdown menu links -->
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="artwork">Artwork</a></li>
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="attachment">Attachment</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="audioRecording">Audio Recording</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="bill">Bill</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="blogPost">Blog Post</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="book">Book</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="bookSection">Book Section</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="case">Case</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="computerProgram">Computer Program</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="conferencePaper">Conference Paper</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="dictionaryEntry">Dictionary Entry</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="document">Document</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="email">E-mail</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="encyclopediaArticle">Encyclopedia Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="film">Film</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="forumPost">Forum Post</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="hearing">Hearing</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="instantMessage">Instant Message</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="interview">Interview</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="journalArticle">Journal Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="letter">Letter</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="magazineArticle">Magazine Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="manuscript">Manuscript</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="map">Map</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="newspaperArticle">Newspaper Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="note">Note</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="patent">Patent</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="podcast">Podcast</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="presentation">Presentation</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="radioBroadcast">Radio Broadcast</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="report">Report</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="statute">Statute</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="thesis">Thesis</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="tvBroadcast">TV Broadcast</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="videoRecording">Video Recording</a></li>          
                            <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-library='<?=$libraryString?>' data-itemtype="webpage">Web Page</a></li>      
                        </ul>
                    </div>
                </div>
            </div><!--/.nav-collapse -->
        </div>
        
        <div id="main-content" class="col-xs-8 col-sm-offset-2">
            <div id="cite-item-dialog" class="cite-item-dialog eventfulwidget"
                data-widget="citeItemDialog"
                data-library='<?=$libraryString?>'
                title="Cite Items">
            </div>
            
            <div class="new-item-widget eventfulwidget"
                data-widget="newItem"
                data-library='<?=$libraryString?>'>
            </div>

            <?include '../jstemplates/itemdetails.jqt';?>
            <?include '../jstemplates/itemnotedetails.jqt';?>
            <?include '../jstemplates/citeitemform.jqt';?>
            <?include '../jstemplates/citeitemdialog.jqt';?>
            <?include '../jstemplates/datafield.jqt';?>
            <?include '../jstemplates/editnoteform.jqt';?>
            <?include '../jstemplates/itemtag.jqt';?>
            <?include '../jstemplates/itemtypeselect.jqt';?>
            <?include '../jstemplates/authorelementssingle.jqt';?>
            <?include '../jstemplates/authorelementsdouble.jqt';?>
            <?include '../jstemplates/newitemdropdown.jqt';?>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/compiled/_zoterowwwAll.bugly.js"></script>
            <script type="text/javascript" charset="utf-8">
                Zotero.config = <?include "zoteroconfig.js";?>
            </script>
            <script type="text/javascript" charset="utf-8">
                if(!Zotero) Zotero = {};
                if(!Zotero.config) Zotero.config = {};
                
                if(typeof zoteroData == 'undefined'){
                    var zoteroData = {};
                }
                var baseURL = "";
                var baseDomain = "";
                var staticPath = "<?=$staticPath?>";
                
                var zoterojsClass = "user_library";
                Zotero.config.pageClass = "user_library";
                Zotero.config.librarySettings.libraryPathString = "<?=$libraryPathString?>";
                Zotero.config.librarySettings.libraryType = "user";
                Zotero.config.librarySettings.libraryID = "0";
                Zotero.config.librarySettings.publish = 1;
                Zotero.config.librarySettings.allowEdit = true;
                
                Zotero.config.nonparsedBaseUrl = Zotero.config.librarySettings.libraryPathString;
                
                Zotero.config.loggedInUserID = 0;
                Zotero.config.loggedIn = false;
                Zotero.config.javascriptEnabled = 1;
                
                var zoterojsSearchContext = "library";
            </script>
            
            <span id="eventful"></span>
        </div><!--/content -->
    </body>
</html>
