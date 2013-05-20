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
        <title>Zotero Cider</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="keywords" content="Zotero, research, tool, firefox, extension"/>
        <meta name="description" content="Zotero is a powerful, easy-to-use research tool that 
                                          helps you gather, organize, and analyze sources and then 
                                          share the results of your research."/>
        
        <link rel="shortcut icon" type="image/png" sizes="16x16" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_16.png" />
        <link rel="shortcut icon" type="image/png" sizes="48x48" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon-precomposed" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        
        <!-- css -->
        <link rel=stylesheet href="<?=$staticPath?>/bootstrap/css/bootstrap.min.css">
        <link rel=stylesheet href="<?=$staticPath?>/bootstrap/css/bootstrap-responsive.min.css">
        <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/jquery/jquery-all.js"></script>
        <script src="<?=$staticPath?>/bootstrap/js/bootstrap.min.js"></script>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/theme_style3.css" 
            type="text/css" media="screen" charset="utf-8"/>

        <link rel="stylesheet" href="<?=$staticPath?>/css/bootstrap_cider_style.css" 
            type="text/css" media="screen" charset="utf-8"/>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/zotero_icons_sprite.css"
            type="text/css" media="screen" charset="utf-8"/>
        <script src="<?=$staticPath?>/library/modernizr/modernizr-1.7.min.js"></script>
        
        <style type="text/css">
            .btn-toolbar {
                margin-top:3px;
                margin-bottom:3px;
            }
        </style>
    </head>
    <!-- library class on body necessary for zotero www init -->
    <body class="citer library" style="max-width: 800px; padding:10px; margin-left:auto; margin-right:auto;">
        <!-- Header -->
        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container">
                    <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="brand" href="#">Cider</a>
                    <div class="nav-collapse collapse">
                        <div class="btn-toolbar pull-left">
                            <div class="btn-group create-item-dropdown"
                                    data-function="createItemDropdown">
                                <button type="button" class="create-item-button btn dropdown-toggle eventfultrigger" data-toggle="dropdown" data-library='<?=$libraryString?>' data-triggers="createItem" title="New Item"><i class="icon-item-add"></i></button>
                                <ul class="dropdown-menu" role="menu" style="max-height:300px; overflow:auto;">
                                    <!-- dropdown menu links -->
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="artwork">Artwork</a></li>
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="attachment">Attachment</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="audioRecording">Audio Recording</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="bill">Bill</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="blogPost">Blog Post</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="book">Book</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="bookSection">Book Section</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="case">Case</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="computerProgram">Computer Program</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="conferencePaper">Conference Paper</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="dictionaryEntry">Dictionary Entry</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="document">Document</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="email">E-mail</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="encyclopediaArticle">Encyclopedia Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="film">Film</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="forumPost">Forum Post</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="hearing">Hearing</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="instantMessage">Instant Message</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="interview">Interview</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="journalArticle">Journal Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="letter">Letter</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="magazineArticle">Magazine Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="manuscript">Manuscript</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="map">Map</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="newspaperArticle">Newspaper Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="note">Note</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="patent">Patent</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="podcast">Podcast</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="presentation">Presentation</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="radioBroadcast">Radio Broadcast</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="report">Report</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="statute">Statute</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="thesis">Thesis</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="tvBroadcast">TV Broadcast</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="videoRecording">Video Recording</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="webpage">Web Page</a></li>      
                                </ul>
                            </div>
                        </div>
                    </div><!--/.nav-collapse -->
                </div>
            </div>
        </div>
        
        <div id="main-content">
            <div id="cite-item-dialog" class="cite-item-dialog eventfulwidget" data-widget="citeItemDialog" title="Cite Items">
            </div>
            
            <div class="new-item-widget eventfulwidget"
                data-widget="newItem"
                >
            </div>

            <?include '../jquerytemplatesbootstrap/itemdetails.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemnotedetails.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemform.jqt';?>
            <?include '../jquerytemplatesbootstrap/citeitemdialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/datafield.jqt';?>
            <?include '../jquerytemplatesbootstrap/editnoteform.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemtag.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemtypeselect.jqt';?>
            <?include '../jquerytemplatesbootstrap/authorelementssingle.jqt';?>
            <?include '../jquerytemplatesbootstrap/authorelementsdouble.jqt';?>
            <?include '../jquerytemplatesbootstrap/newitemdropdown.jqt';?>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/globalize.js"></script>
            <?$locales = array('en');// array_keys(Zend_Locale::getOrder());?>
            <?foreach($locales as $localeStr):?>
                <?if($localeStr != 'en'):?>
                <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/cultures/globalize.culture.<?=str_replace('_', '-', $localeStr)?>.js"></script>
                <?endif;?>
            <?endforeach;?>
            <script type="text/javascript" charset="utf-8">
                var zoterojsClass = "user_library";
                if(typeof zoteroData == 'undefined'){
                    var zoteroData = {};
                }
                var baseURL = "";
                var baseDomain = "";
                var staticPath = "<?=$staticPath?>";
            </script>
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/_zoterowwwAll.bugly.js"></script>
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/libraryUi/bootstrapdialogs.js"></script>
            <script type="text/javascript" charset="utf-8">
                Zotero.prefs.server_javascript_enabled = true;
                
                Zotero.config = <?include "zoteroconfig.js";?>
            </script>
            
            <span id="eventful"></span>
        </div><!--/content -->
    </body>
</html>
