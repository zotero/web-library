<!DOCTYPE html>
<?include "config.php";?>
<html lang="en" class="no-js"> 
    <head> 
        <meta charset="utf-8" />
        <meta name="keywords" content="Zotero, research, tool, firefox, extension"/>
        <meta name="description" content="Zotero is a powerful, easy-to-use research tool that 
                                          helps you gather, organize, and analyze sources and then 
                                          share the results of your research."/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <title>Zotero Library</title>
        <link rel="shortcut icon" type="image/png" sizes="48x48" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="shortcut icon" type="image/png" sizes="16x16" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_16.png" />
        <link rel="apple-touch-icon" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon-precomposed" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        
        <!-- css -->
        <link rel="stylesheet" href="<?=$staticPath?>/css/jquery-ui-1.8.12.custom.css" 
            type="text/css" media="screen" charset="utf-8"/>
        
        <link rel="stylesheet" href="<?=$staticPath?>/library/jquery/mobile/jquery.mobile.structure-1.2.0.min.css">
        <link rel="stylesheet" href="<?=$staticPath?>/css/mobile/themes/zotero11.min.css">
        
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/mobile.css" />
        <link rel="stylesheet" href="<?=$staticPath?>/css/zotero_icons_sprite.css" 
            type="text/css" media="screen" charset="utf-8"/>
        
        <script src="<?=$staticPath?>/library/modernizr/modernizr-1.7.min.js"></script>
    </head>
    <body style="overflow-x:hidden" class="library">
        <!--OUTPUT CONTENT MLIBRARY -->
        
        <?
/**
 * Zotero WWW
 *
 * LICENSE: This source file is subject to the GNU Affero General Public License 
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * @category  Zotero_WWW
 * @package   Zotero_WWW_Users
 * @copyright Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
 * @license   http://www.gnu.org/licenses/agpl.html    GNU AGPL License
 * @version   $Id$
 * @since     0.0
 */
?>
<?$defaultLibraryConfig = array('libraryID'=>$libraryID,
                                'libraryType'=>$libraryType,
                                'libraryUrlIdentifier'=>$librarySlug,
                                'libraryLabel'=>rawurlencode($displayName)
                                );?>
<div id="library">
    
    <!--Collections Page -->

<div data-role="page" id="library-collections-page">
    <!-- Header -->
    <header role="banner" class="container">
        <div class="center container">
            <div data-role="header">
                <a id="zm-top-back-button" href="#" data-rel="zback" data-theme="c" data-icon="arrow-l">Back</a>
                <h1 class="mobile-page-title" style="margin:0;">
                    <a class="title-link" data-role="button" data-icon="arrow-d" data-iconpos="right" data-inline="true" data-mini="true">Zotero</a>
                </h1>
                <?if($allowEdit):?>
                <a id="zmobile-edit-link" data-role="button" data-icon="grid" data-iconpos="right" class="ui-btn-right" data-theme="c">Edit</a>
                <?endif;?>
                
            </div>
        </div>
    </header>
    
    <div id="content">
        <div class="center container">
        
        <!-- hidden area for possible JS messages -->
        <div id="js-message">
            <ul id="js-message-list">
            </ul>
        </div>
        
        <!-- Output content -->
        <div id="collections-pane-edit-panel-div" class="ajaxload action-panel-div"
            data-function='actionPanel'
            data-loadconfig='<?=json_encode($defaultLibraryConfig);?>'>
        </div>
        
        <?$collectionListConfig = array('target'=>'collections',
                                        'libraryID'=>$libraryID, 
                                        'libraryType'=>$libraryType, 
                                        'libraryUrlIdentifier'=>$librarySlug
                                        );
        ?>
        <div id="collection-list-div" class="ajaxload" 
            data-function='loadCollections'
            data-loadconfig='<?=json_encode($collectionListConfig);?>'
            >
            
            <div id="collection-list-container">
            </div>
        </div><!-- collection list div -->
        
        </div>
    </div>
    <div data-role="footer" data-position="fixed" data-id="library-tab-footer" data-theme="d">
        <div id="library-tab-navbar1" data-id="library-tab-navbar" data-role="navbar" data-position="fixed">
            <ul>
              <li><a class="collections-page-link ui-btn-active">Collections</a></li>
              <li><a class="tags-page-link" >Tags</a></li>
              <li><a class="items-page-link" >Items</a></li>
            </ul>
        </div><!-- /navbar -->
    </div>
</div>

<!-- /Collections Page -->

<!-- Tags Page -->

<div data-role="page" id="library-tags-page">
    <!-- Header -->
    <header role="banner" class="container">
        <div class="center container">
            <div data-role="header">
                <a id="zm-top-back-button" href="#" data-rel="zback" data-theme="c" data-icon="arrow-l">Back</a>
                <h1 class="mobile-page-title" style="margin:0;">
                    <a class="title-link" data-role="button" data-icon="arrow-d" data-iconpos="right" data-inline="true" data-mini="true">Zotero</a>
                </h1>
                <?if($allowEdit):?>
                <a id="zmobile-edit-link" data-role="button" data-icon="grid" data-iconpos="right" class="ui-btn-right" data-theme="c">Edit</a>
                <?endif;?>
                
            </div>
        </div>
    </header>
    
    <div id="content">
        <div class="center container">
        
        <!-- hidden area for possible JS messages -->
        <div id="js-message">
            <ul id="js-message-list">
            </ul>
        </div>
        
        <!-- Output content -->
        <!-- tags browser section -->
        <h3 id="tags-list-label" class="clickable">Tags</h3>
        <?$tagsListConfig = array(  'target'=>'tags',
                                    'libraryID'=>$libraryID, 
                                    'libraryType'=>$libraryType, 
                                    'libraryUrlIdentifier'=>$librarySlug
                                    );
        ?>
        <div id="tags-list-div" class="ajaxload" 
            data-prefunction="showSpinnerSection"
            data-function="loadTags"
            data-loadconfig='<?=json_encode($tagsListConfig);?>'
            >
              <input type="text" id="tag-filter-input" placeholder="Filter Tags" />
              <div id="tag-lists-container">
                <ul id="selected-tags-list" data-theme="a">
                </ul>
                <ul id="tags-list" data-theme="c">
                </ul>
              </div>
              <div id="more-tags-links">
                <a href='' id='show-more-tags-link'>More</a>
                <a href='' id='show-less-tags-link'>Fewer</a>
              </div>
        </div>
        
        </div>
    </div>
    <div data-role="footer" data-position="fixed" data-id="library-tab-footer" data-theme="d">
        <div id="library-tab-navbar2" data-id="library-tab-navbar" data-role="navbar" data-position="fixed">
            <ul>
                <li><a class="collections-page-link">Collections</a></li>
                <li><a class="tags-page-link ui-btn-active">Tags</a></li>
                <li><a class="items-page-link">Items</a></li>
            </ul>
        </div><!-- /navbar -->
        </div>
    </div>

<!-- /Tags Page -->

<!-- Items Page -->

<div data-role="page" id="library-items-page">
    <!-- Header -->
    <header role="banner" class="container">
        <div class="center container">
            <div data-role="header">
                <a id="zm-top-back-button" href="#" data-rel="zback" data-theme="c" data-icon="arrow-l">Back</a>
                <h1 class="mobile-page-title" style="margin:0;">
                    <a class="title-link" data-role="button" data-icon="arrow-d" data-iconpos="right" data-inline="true" data-mini="true">Zotero</a>
                </h1>
                <?if($allowEdit):?>
                <a id="zmobile-edit-link" data-role="button" data-icon="grid" data-iconpos="right" class="ui-btn-right" data-theme="c">Edit</a>
                <?endif;?>
                
            </div>
        </div>
    </header>
    
    <div id="content">
        <div class="center container">
        
        <!-- hidden area for possible JS messages -->
        <div id="js-message">
            <ul id="js-message-list">
            </ul>
        </div>
        
        <!-- Output content -->
        <div id="filter-guide-div" class="ajaxload"
            data-function='loadFilterGuide'
            data-loadconfig='<?=json_encode($defaultLibraryConfig);?>'
            >
        </div>
        <div id="items-pane-edit-panel-div" class="ajaxload action-panel-div"
            data-function='actionPanel'
            data-loadconfig='<?=json_encode($defaultLibraryConfig);?>'
            >
        </div>
        
        <div id="items-pane" class="ajaxload"
            data-function="chooseItemPane"
            data-loadconfig='<?=json_encode($defaultLibraryConfig);?>'
            >
        <?$itemsLoadConfig = array('libraryID'=>$libraryID,
                                   'libraryType'=>$libraryType,
                                   'libraryUrlIdentifier'=>$librarySlug,
                                   'target'=>'items',
                                   'targetModifier'=>'top',
                                   'content'=>'json'
                                   );
        ?>
        <div id="library-items-div" class="ajaxload" 
            data-function="loadItems"
            data-loadconfig='<?=json_encode($itemsLoadConfig);?>'
            >
        </div> <!--library items div -->
        <?$itemLoadConfig = array('libraryID'=>$libraryID,
                                  'libraryType'=>$libraryType,
                                  'libraryUrlIdentifier'=>$librarySlug
                                   );
        ?>
        <div id="item-details-div" class="ajaxload"
            data-function="loadItem"
            data-loadconfig='<?=json_encode($itemLoadConfig)?>'
            >
        </div>
        </div> <!-- items pane -->
        </div>
    </div>
    <div data-role="footer" data-position="fixed" data-id="library-tab-footer" data-theme="d">
      <div id="library-tab-navbar3" data-id="library-tab-navbar" data-role="navbar" data-position="fixed">
        <ul>
          <li><a class="collections-page-link" >Collections</a></li>
          <li><a class="tags-page-link" >Tags</a></li>
          <li><a class="items-page-link ui-btn-active">Items</a></li>
        </ul>
      </div><!-- /navbar -->
    </div>

</div>

<!-- /Items Page -->



    
</div>
<div id="create-collection-dialog" data-title="Create Collection" data-role="page" class="mobile-dialog"></div>
<div id="modify-collection-dialog" data-title="Edit Collection" data-role="page" class="mobile-dialog"></div>
<div id="delete-collection-dialog" data-title="Delete Collection" data-role="page" class="mobile-dialog"></div>
<div id="add-to-collection-dialog" data-title="Add to Collection" data-role="page" class="mobile-dialog"></div>
<div id="sort-dialog" data-title="Sort By" data-role="page" class="mobile-dialog"></div>
<div id="cite-item-dialog" data-title="Cite Item" data-role="page" class="mobile-dialog"></div>
<div id="upload-attachment-dialog" data-title="Upload Attachment" data-role="page" class="mobile-dialog"></div>

<?$locales = array('en');?>
<script type="text/javascript" charset="utf-8">
    var zoterojsClass = "user_library";
    var zoteroData = {itemsPathString: "<?=$itemsPathString?>",
                      libraryUserID: "<?=$libraryID?>",
                      libraryPublish: 1,
                  <?/*if(!empty($apiKey)):?>
                      apiKey: "<?=$apiKey?>",
                  <?endif;*/?>
                      locale: "<?=$locales[0]?>",
                      allowEdit: <?=$allowEdit?>,
                      javascriptEnabled: 1,
                      library_showAllTags: 1,
                      mobile: 1
                      };
    var zoterojsSearchContext = "library";
</script>
<?include '../mjquerytemplates/tagrow.jqt';?>
<?include '../mjquerytemplates/tagslist.jqt';?>
<?include '../jquerytemplates/collectionlist.jqt';?>
<?include '../jquerytemplates/collectionrow.jqt';?>
<?include '../mjquerytemplates/itemrow.jqt';?>
<?include '../mjquerytemplates/itemstable.jqt';?>
<?include '../jquerytemplates/itempagination.jqt';?>
<?include '../mjquerytemplates/itemdetails.jqt';?>
<?include '../jquerytemplates/itemnotedetails.jqt';?>
<?include '../mjquerytemplates/itemform.jqt';?>
<?include '../mjquerytemplates/citeitemform.jqt';?>
<?include '../jquerytemplates/attachmentform.jqt';?>
<?include '../mjquerytemplates/attachmentupload.jqt';?>
<?include '../jquerytemplates/datafield.jqt';?>
<?include '../mjquerytemplates/editnoteform.jqt';?>
<?include '../mjquerytemplates/itemtag.jqt';?>
<?include '../jquerytemplates/itemtypeselect.jqt';?>
<?include '../mjquerytemplates/authorelementssingle.jqt';?>
<?include '../mjquerytemplates/authorelementsdouble.jqt';?>
<?include '../jquerytemplates/childitems.jqt';?>
<?include '../jquerytemplates/editcollectionbuttons.jqt';?>
<?include '../jquerytemplates/choosecollectionform.jqt';?>
<?include '../jquerytemplates/breadcrumbs.jqt';?>
<?include '../jquerytemplates/breadcrumbstitle.jqt';?>
<?include '../mjquerytemplates/newcollectionform.jqt';?>
<?include '../mjquerytemplates/updatecollectionform.jqt';?>
<?include '../mjquerytemplates/deletecollectionform.jqt';?>
<?include '../mjquerytemplates/tagunorderedlist.jqt';?>
<?include '../jquerytemplates/librarysettings.jqt';?>
<?include '../jquerytemplates/addtocollectionform.jqt';?>
<?include '../jquerytemplates/dialogbutton.jqt';?>
<?include '../jquerytemplates/pageheader.jqt';?>
<?include '../mjquerytemplates/filterguide.jqt';?>
<?include '../mjquerytemplates/searchactionpane.jqt';?>
<?include '../mjquerytemplates/collectionsactionpane.jqt';?>
<?include '../mjquerytemplates/itemsactionpane.jqt';?>
<?include '../mjquerytemplates/sortdialog.jqt';?>


        
        <!-- END OUTPUT CONTENT MLIBRARY -->
    <div id="mobile-page-selector-div" class="ajaxload always"
        data-function='selectMobilePage'
        data-loadconfig='<?=json_encode(array());?>'>
    </div>
    
    
    <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/jquery/jquery-all.js"></script>
    <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/globalize.js"></script>
    <?foreach($locales as $localeStr):?>
        <?if($localeStr != 'en'):?>
        <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/cultures/globalize.culture.<?=str_replace('_', '-', $localeStr)?>.js"></script>
        <?endif;?>
    <?endforeach;?>
    
    <script type="text/javascript" charset="utf-8">
        if(typeof zoteroData == 'undefined'){
            var zoteroData = {mobile:1};
        }
        else{
            zoteroData.mobile = 1;
        }
        var baseURL = "<?=$baseUrl?>";
        var baseDomain = "<?=$baseDomain?>";
        var staticPath = "<?=$staticPath?>";
        
        $(document).bind("mobileinit", function(){
            //apply overrides here
            $.extend($.mobile, {
                ajaxEnabled:false,
                linkBindingEnabled: false,
                hashListeningEnabled:false,
                pushStateEnabled: false,
            });
        });
    </script>
    
    <!-- Latest local build -->
    <script src="<?=$staticPath;?>/library/jquery/mobile/jquery.mobile-1.2.0.min.js"></script>
    
    <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/_zoterowwwAll.bugly.js"></script>
    <!-- override JS for mobile specific stuff -->
    <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/_zoteroLibraryUiMobile.js"></script>
    
    <script type="text/javascript" charset="utf-8">
        Zotero.prefs.server_javascript_enabled = true;
        
        Zotero.config = <?include "zoteroconfig.js";?>
    </script>
    
    </body>
</html>
