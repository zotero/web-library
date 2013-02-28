/**
 * JS code for Zotero's website
 *
 * LICENSE: This source file is subject to the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * @category  Zotero_WWW
 * @package   Zotero_WWW_Index
 * @copyright Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
 * @license   http://www.gnu.org/licenses/agpl.html    GNU AGPL License
 * @version   $Id$
 * @since     0.0
 */

/**
 * Zotero.Pages class containing page specific functions for the website. Loaded based on
 * the value of zoterojsClass
 *
 * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
 * @license    http://www.gnu.org/licenses/agpl.html    GNU AGPL License
 * @since      Class available since Release 0.6.1
 */
Zotero.pages = {

    baseURL:    baseURL,
    staticPath: staticPath,
    baseDomain: baseDomain,
    staticLoadUrl: window.location.pathname,
    
    //base zotero js functions that will be used on every page
    base: {

        init: function(){
            if((typeof Zotero != 'undefined' && !Zotero.config.librarySettings.mobile) || typeof Zotero == 'undefined'){
                this.tagline();
                this.setupSearch();
                this.setupNav();
                J("#sitenav .toggle").click(this.navMenu);
            }
            
            //set up support page expandos
            J(".support-menu-expand-section").hide();
            J(".support-menu-section").on('click', "h2", function(){
                J(this).siblings('.support-menu-expand-section').slideToggle();
            });
            
        },
        
        /**
         * Selects a random tagline for the header
         *
         * @return void
         **/
        tagline: function(){
            var taglines = [
                'See it. Save it. Sort it. Search it. Cite it.',
                'Leveraging the long tail of scholarship.',
                'A personal research assistant. Inside your browser.',
                'Goodbye 3x5 cards, hello Zotero.',
                'Citation management is only the beginning.',
                'The next-generation research tool.',
                'Research, not re-search',
                'The web now has a wrangler.'
            ];
            var pos = Math.floor(Math.random() * taglines.length);
            J("#tagline").text(taglines[pos]);
        },

        /**
         * Send search to the right place
         *
         * @return void
         **/
        setupSearch: function() {
            //Z.debug("setupSearch");
            var context = "support";
            var label   = "";
            
            // Look for a context specific search
            if(undefined !== window.zoterojsSearchContext){
                context = zoterojsSearchContext;
            }
            switch (context) {
                case "people"        : label = "Search for people";    break;
                case "group"         : label = "Search for groups";    break;
                case "documentation" : label = "Search documentation"; break;
                case "library"       : label = "Search Library";       break;
                case "grouplibrary"  : label = "Search Library";       break;
                case "support"       : label = "Search support";       break;
                case "forums"        : label = "Search forums";        break;
                default              : label = "Search support";       break;
            }
            
            J("#header-search-query").val("");
            J("#header-search-query").attr('placeholder', label);//.inputLabel(label, {color:"#aaa"});
            if(context != 'library' && context != 'grouplibrary' && context != 'forums'){
                J("#simple-search").on('submit', function(e){
                    e.preventDefault();
                    var searchUrl = Zotero.pages.baseDomain + "/search/#type/" + context;
                    var query     = J("#header-search-query").val();
                    if(query !== "" && query != label){
                        searchUrl = searchUrl + "/q/" + encodeURIComponent(query);
                    }
                    location.href = searchUrl;
                    return false;
                });
            }
            else if(context != 'forums') {
            }
        },
        
        /**
         * Select the right nav tab
         *
         * @return void
         **/
        setupNav: function () {
            var tab = "";
            // Look for a context specific search
            if(undefined !== window.zoterojsSearchContext){
                tab = zoterojsSearchContext;
                if(tab == "support") { tab = ""; }
                
            }
            // special case for being on the home page
            if(location.pathname == "/" && location.href.search("forums.") < 0){
                tab = "home";
            }
            J("#"+tab+"-tab").addClass("selected-nav");
        }
    },
    
    extension_style: {
        init: function(){
            var url = Zotero.pages.baseURL + "/extension/autocomplete/";
            J("#styleSearch").autocomplete({
                'url': url,
                'matchContains':true,
                'mustMatch': true,
                'cacheLength': 1,
                extraParams:{"type":"style"},
                formatItem: function(resultRow, i, total, value) {
                    return resultRow[0];
                }
            });
            J("#styleSearch").autocomplete("result", function(event, data, formatted){
                location.href = Zotero.pages.baseURL + "/extension/style/" + data[1];
            });
        }
    },
    
    settings_cv: {
        init: function(){
            J(".cv-section-actions").buttonset();
            J(".cv-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
            J(".cv-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
            J(".cv-delete").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
            
            // Delete the cv section when the delete link is clicked
            J("#cv-sections").on("click", ".cv-delete", function(e){
                if(confirm ("Are you sure you want to delete this section")){
                    J(this).closest("li").remove();
                    //Zotero.pages.settings_cv.hideMoveLinks();
                    return false;
                }
            });
            
            // Add a new cv section when the add button is clicked
            J("#cv-sections").on("click", ".cv-insert-section", function(e){
                // Make sure the template textarea isn't a tiny mce instance
                //tinyMCE.execCommand('mceRemoveControl', true, "template");
                
                // Get the number of sections that exist before adding a new one
                sectionCount  = J("#cv-sections li").length;
                
                // Clone the template html
                newSection    = J("#cv-section-template li").clone(true);
                
                // The new textarea needs a unique id for tinymce to work
                newTextareaID = "cv_" + (sectionCount + 1) + "_text";
                newSection.children("textarea").attr("id", newTextareaID).addClass('tinymce').addClass('nolinks');
                
                // Insert the new section into the dom and activate tinymce control
                J(this).closest("li").after(newSection);
                
                J(".cv-section-actions").buttonset();
                J(".cv-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
                J(".cv-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
                J(".cv-delete").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
                
                tinyMCE.execCommand('mceAddControl', true, newTextareaID);
                
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Add a new cv collection when the add button is clicked
            J("#cv-sections").on("click", ".cv-insert-collection", function(e){
                // Get the number of sections that exist before adding a new one
                sectionCount  = J("#cv-sections li").length;
                
                // Clone the template html
                newSection    = J("#cv-collection-template li").clone(true);
                
                // The new textarea needs a unique id for tinymce to work
                newcollectionKey = "cv_" + (sectionCount + 1) + "_collection";
                newHeadingID    = "cv_" + (sectionCount + 1) + "_heading";
                newSection.children("select").attr("id", newcollectionKey);
                newSection.children("select").attr("name", newcollectionKey);
                newSection.children(".cv-heading").attr("name", newHeadingID);
                
                // Insert the new section into the dom
                J(this).closest("li").after(newSection);
                
                J(".cv-section-actions").buttonset();
                J(".cv-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
                J(".cv-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
                J(".cv-delete").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
                
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Move the section down when the down link is clicked
            J("#cv-sections").on("click", ".cv-move-down", function(e){
                if(J(this).closest('li').find("textarea").length > 0){
                    // Get the id of this section's textarea so we can disable the tinymce control before the move
                    textareaId = J(this).closest('li').find("textarea")[0].id;
                    Z.debug('textareaId:' + textareaId);
                    var editor = tinymce.get(textareaId);
                    editor.save();
                    tinymce.execCommand('mceRemoveControl', true, textareaId);
                    // Move the section and reenable the tinymce control
                    J(this).closest("li").next().after(J(this).closest("li"));
                    tinymce.execCommand('mceAddControl', true, textareaId);
                }
                else {
                    J(this).closest("li").next().after(J(this).closest("li"));
                }

                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // Move the section up when the up link is clicked
            J("#cv-sections").on("click", ".cv-move-up", function(e){
                if(J(this).closest('li').find("textarea").length > 0){
                    // Get the id of this section's textarea so we can disable the tinymce control before the move
                    textareaId = J(this).closest('li').find("textarea")[0].id;
                    Z.debug('textareaId:' + textareaId);
                    var editor = tinymce.get(textareaId);
                    editor.save();
                    
                    tinymce.execCommand('mceRemoveControl', true, textareaId);
                    
                    // Move the section and reenable the tinymce control
                    J(this).closest("li").prev().before(J(this).closest("li"));
                    tinymce.execCommand('mceAddControl', true, textareaId);
                }
                else {
                    J(this).closest("li").prev().before(J(this).closest("li"));
                }
                //Zotero.pages.settings_cv.hideMoveLinks();
                return false;
            });
            
            // reindex the field names before submitting the form
            J("#cv-submit").click(function(e){
                J("#cv-sections li").each(function(i){
                    var heading;
                    if(J(this).hasClass("cv-freetext") ){
                        heading = J(this).children(".cv-heading").attr("name", "cv_"+(i+1)+"_heading");
                        if(heading.val() == "Enter a section name"){
                            heading.val("");
                        }
                        J(this).children(".cv-text").attr("name", "cv_"+(i+1)+"_text");
                    }
                    else if(J(this).hasClass("cv-collection") ){
                        heading = J(this).children(".cv-heading").attr("name", "cv_"+(i+1)+"_heading");
                        if(heading.val() == "Enter a section name"){
                            heading.val("");
                        }
                        J(this).children("select.cv-collection").attr("name", "cv_"+(i+1)+"_collection");
                    }
                });
            });
            
            // Hide unusable move links
            //this.hideMoveLinks();
            
            //init existing tinymce on first load
            Zotero.ui.init.tinyMce('nolinks');
            
            // Add some helper text over the section name
            J("li input").inputLabel("Enter a section name", {color:"#d5d5d5"});
        }
        
        // Hides move links that can't be used. e.g. you can't move the top section up.
        /*
        hideMoveLinks: function(){
            J("#cv-sections .cv-move-down").show();
            J("#cv-sections .cv-move-up").show();
            J("#cv-sections .cv-move-up:first").hide();
            J("#cv-sections .cv-move-down:last").hide();
        },
        */
    },
    
    settings_account: {
        init: function(){
            //insert slug preview label
            J('input#username').after("<label id='slugpreview'>Profile URL: " +
                                      Zotero.pages.baseDomain + "/" +
                                      Zotero.utils.slugify(J("input#username").val()) +
                                      "</label>");
    
            // When the value of the input box changes,
            J("input#username").bind("keyup change", Zotero.pages.user_register.nameChange);
            parent.checkUserSlugTimeout;
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            
            //create slug from username
            parent.slug = Zotero.utils.slugify( J("input#username").val() );
            J("#slugpreview").text( "Profile URL: " + Zotero.pages.baseDomain + "/" + parent.slug );
            
            //check slug with server after half-second
            clearTimeout(parent.checkUserSlugTimeout);
            parent.checkUserSlugTimeout = setTimeout('Zotero.pages.user_register.checkSlug()', 500);
        },
        
        checkSlug: function(){
            J.getJSON(baseURL + "/user/checkslug", {"slug":slug}, function(data){
                if(data.valid){
                    J("#slugpreview").css("color", "green");
                } else {
                    J("#slugpreview").css("color", "red");
                }
            });
        }
    },
    
    settings_profile: {
        init: function(){
            Zotero.ui.init.tinyMce('nolinks');
        }
    },
    
    settings_privacy: {
        init: function(){
            if(!J("input#privacy_publishLibrary").prop("checked")){
                J("input#privacy_publishNotes").prop("disabled",true);
            }
            J("input#privacy_publishLibrary").bind("change", function(){
                if(!J("input#privacy_publishLibrary").prop("checked")){
                    J("input#privacy_publishNotes").prop("checked", false).prop("disabled",true);
                }
                else{
                    J("input#privacy_publishNotes").prop("disabled", false);
                }
            });
        }
        
    },
    
    settings_apikeys: {
        init: function(){
            
        }
    },
    
    settings_newkey: {
        init: function(){
            if(!J("input#library_access").prop("checked")){
                J("input#notes_access").prop("disabled","disabled");
            }
            J("input#library_access").bind("change", function(){
                if(!J("input#library_access").prop("checked")){
                    J("input#notes_access").prop("checked", false).prop("disabled", true);
                    J("input#write_access").prop('checked', false).prop('disabled', true);
                }
                else{
                    J("input#notes_access").prop("disabled", false);
                    J("input#write_access").prop('disabled', false);
                }
            });
            J("input#name").focus();
            
            if(zoteroData.oauthRequest){
                J("button#edit").closest('li').nextAll().hide();
                J("button#edit").click(function(e){
                    e.preventDefault();
                    J(this).closest('li').nextAll().show();
                });
            }
            
            if(!J('#individual_groups').prop('checked')) {
                J("#individual_groups").closest('li').nextAll().hide();
            }
            J("#individual_groups").bind('change', function(){
                if(J('#individual_groups').prop('checked')){
                    J("#individual_groups").closest('li').nextAll().show();
                }
                else{
                    J("#individual_groups").closest('li').nextAll().hide();
                }
            });
        }
    },
    
    settings_editkey: {
        init: function(){
            if(!J('#individual_groups').prop('checked')) {
                J("#individual_groups").closest('li').nextAll().hide();
            }
            J("#individual_groups").bind('change', function(){
                if(J('#individual_groups').prop('checked')){
                    J("#individual_groups").closest('li').nextAll().show();
                }
                else{
                    J("#individual_groups").closest('li').nextAll().hide();
                }
            });
        }
    },
    
    settings_storage: {
        init: function(){
            selectedLevel = J("input[name=storageLevel]:checked").val();
            
            Zotero.pages.settings_storage.showSelectedResults(selectedLevel);
            
            J("input[name=storageLevel]").change(function(){
                Zotero.pages.settings_storage.showSelectedResults(J("input[name=storageLevel]:checked").val());
            });
            
            J("#purge-button").click(function(){
                if(confirm("You are about to remove all uploaded files associated with your personal library.")){
                    J("#confirm_delete").val('confirmed');
                    return true;
                }
                else{
                    return false;
                }
            });
        },
        
        showSelectedResults: function(selectedLevel){
            if(selectedLevel == 2){
                J("#order-result-div").html(zoteroData.orderResult2);
            }
            else if(selectedLevel == 3){
                J("#order-result-div").html(zoteroData.orderResult3);
            }
            else if(selectedLevel == 4){
                J("#order-result-div").html(zoteroData.orderResult4);
            }
            else if(selectedLevel == 5){
                J("#order-result-div").html(zoteroData.orderResult5);
            }
        }
    },
    
    settings_commons: {
        init: function(){
        }
    },
    
    settings_deleteaccount: {
        init: function(){
            J("button#deleteaccount").click(function(){
                if(!confirm("Are you sure you want to permanently delete you account? You will not be able to recover the account or the user name.")){
                    return false;
                }
            });
        }
    },
    
    group_new: {
        init: function(){
            var timeout;
            // When the value of the input box changes,
            J("input#name").keyup(function(e){
                clearTimeout(timeout);
                timeout = setTimeout('Zotero.pages.group_new.nameChange()', 300);
            });
            
            J("input[name=group_type]").change(Zotero.pages.group_new.nameChange);
            
            //insert slug preview label
            J('input#name').after("<label id='slugpreview'>Group URL: " +
                                      Zotero.pages.baseDomain + "/" + "groups/" +
                                      Zotero.utils.slugify(J("input#name").val()) +
                                      "</label>");
            
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            var groupType = J('input[name=group_type]:checked').val();
            // update slug preview text
            if(groupType == 'Private'){
                J("#slugpreview").text("Group URL: " +Zotero.pages.baseDomain + "/" + "groups/<number>");
            }
            else{
                J("#slugpreview").text("Group URL: " +Zotero.pages.baseDomain + "/" + "groups/" +
                Zotero.utils.slugify(J("input#name").val()) );
            }
            
            if(groupType != 'Private'){
                // Get the value of the name input
                var input = J("input#name").val();
                // Poll the server with the input value
                J.getJSON(baseURL+"/group/checkname/", {"input":input}, function(data){
                    J("#namePreview span").text(data.slug);
                    if(data.valid){
                        J("#slugpreview").css({"color":"green"});
                    } else {
                        J("#slugpreview").css({"color":"red"});
                    }
                    J("#namePreview img").remove();
                });
            }
        }
    },
    
    group_settings: {
        init: function(){
            Zotero.ui.init.tinyMce('nolinks');
            
            //tinyMCE.execCommand('mceAddControl', true, "description");
            //J("#settings_submit").bind("click", function(){ tinyMCE.execCommand('mceRemoveControl', true, 'description');});
            J("#deleteForm").submit(function(){
                if(confirm("This will permanently delete this group, including any items in the group library")){
                    J("#confirm_delete").val('confirmed');
                    return true;
                }
                else{
                    return false;
                }
            });
            J("#type-PublicOpen").click(function(){
                if(confirm("Changing a group to Public Open will remove all files from Zotero Storage")){
                    return true;
                }
                else{
                    return false;
                }
            });
        }
    },
    
    group_library_settings: {
        init: function(){
            //initially disable inputs with disallowed values for current group type
            if(J("#type-PublicOpen").prop('checked')){
                //disallow file storage options for public open groups
                J("#fileEditing-admins").prop('disabled', '1');
                J("#fileEditing-members").prop('disabled', '1');
            }
            if(J("#type-Private").prop('checked')){
                //disallow internet readable on private
                J("#libraryReading-all").prop('disabled', '1');
            }
            
            //confirmation on changing group type to public open
            J("#type-PublicOpen").click(function(){
                if(confirm("Changing a group to Public Open will remove all files from Zotero Storage")){
                    //disallow files
                    J("input[name='fileEditing']").val(['none']);
                    J("#fileEditing-admins").prop('disabled', '1');
                    J("#fileEditing-members").prop('disabled', '1');
                    //allow public library
                    J("#libraryReading-all").prop('disabled', '');
                    
                    return true;
                }
                else{
                    return false;
                }
            });
            
            J("#type-Private").click(function(){
                //select members only viewing of private group which is mandatory
                J("input[name='libraryReading']").val(['members']);
                //disable public library radio for private group
                J("#libraryReading-all").prop('disabled', '1');
                //allow files
                J("#fileEditing-admins").prop('disabled', '');
                J("#fileEditing-members").prop('disabled', '');
            });
            
            J("#type-PublicClosed").click(function(){
                //allow files
                J("#fileEditing-admins").prop('disabled', '');
                J("#fileEditing-members").prop('disabled', '');
                //allow public library
                J("#libraryReading-all").prop('disabled', '');
                
            });
        }
    },
    
    group_view: {
        init: function(){
            if(zoteroData.member == false){
                J("#membership-button").click(Zotero.pages.group_view.joinGroup);
            }
            else{
                J("#membership-button").click(Zotero.pages.group_view.leaveGroup);
            }
            
            J("#group-message-form").hide();
            J("#new-message-link").click(function(){
                J("#group-message-form").toggle();
                return false;
            });
            J(".delete-group-message-link").click(function(){
                if(confirm("Really delete message?")){
                    return true;
                }
                else{
                    return false;
                }
            });
            Zotero.ui.init.tinyMce('nolinks');
        },
        
        joinGroup: function(){
            J("#membership-button").after("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
            J('img#spinner').show();
            J.post("/groups/" + zoteroData.groupID + "/join", {ajax:true}, function(data){
                if(data.pending === true){
                    J("#membership-button").replaceWith("Membership Pending");
                    J('img#spinner').remove();
                }
                else if(data.success === true){
                    J("#membership-button").val("Leave Group")
                                           .unbind()
                                           .remove()
                                           .click(Zotero.pages.group_view.leaveGroup)
                                           .wrap(document.createElement("li"))
                                           .appendTo('ul.group-information');
                    
                    if(zoteroData.group.type == 'Private'){
                        window.location = '/groups';
                    }
                    J('img#spinner').remove();
                }
                else{
                    J('img#spinner').remove();
                }
            },
            "json");
        },
        
        leaveGroup: function(){
            if(confirm("Leave group?")){
                J("#membership-button").after("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
                J('img#spinner').show();
                J.post("/groups/" + zoteroData.groupID + "/leave", {ajax:true}, function(data){
                    if(data.success === true){
                        J("#membership-button").val("Join Group").unbind().click(Zotero.pages.group_view.joinGroup);
                        J('img#spinner').remove();
                        J('a[title="'+zoteroData.user.username+'"]').remove();
                        window.location = "/groups";
                    }
                    else{
                        J('img#spinner').remove();
                    }
                },
                "json");
            }
        },
        
    },
    
    group_index: {
        init: function(){
            //set up screen cast player + box
            J("#screencast-link").click(function(){
                J('#content').prepend("<div id='dimmer'><div id='intro-screencast-lightbox-div'><a href='/static/videos/group_intro.flv' id='intro-screencast-lightbox'></a><a id='close-lightbox-link'>close</a></div></div>");
                Zotero.pages.index_index.player = flowplayer("intro-screencast-lightbox", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf",
                    {clip:
                        {autoPlay:true}
                    }
                );
                J('#close-lightbox-link').click(function(){
                    Zotero.pages.index_index.player.close();
                    J('#dimmer').remove();
                    J('#intro-screencast-lightbox-div').remove();
                });
                return false;
            });
            try{
                if(J("#screencast-link").length > 0){
                    flowplayer("screencast-link", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf");
                }
            }
            catch (err)
            {
                
            }
        }
        
    },
    
    user_register: {
        init: function(){
            //insert slug preview label
            J('input#username').after("<label id='slugpreview'>Profile URL: " +
                                      Zotero.pages.baseDomain + "/" +
                                      Zotero.utils.slugify(J("input#username").val()) +
                                      "</label>");

            // When the value of the input box changes,
            J("input#username").bind("keyup change", Zotero.pages.user_register.nameChange);
            parent.checkUserSlugTimeout;
        },
        
        nameChange: function(){
            //make sure label is black after each change before checking with server
            J("#slugpreview").css("color", "black");
            
            //create slug from username
            parent.slug = Zotero.utils.slugify( J("input#username").val() );
            J("#slugpreview").text( "Profile URL: " + Zotero.pages.baseDomain + "/" + parent.slug );
            
            //check slug with server after half-second
            clearTimeout(parent.checkUserSlugTimeout);
            parent.checkUserSlugTimeout = setTimeout('Zotero.pages.user_register.checkSlug()', 500);
        },
        
        checkSlug: function(){
            J.getJSON(baseURL + "/user/checkslug", {"slug":slug}, function(data){
                if(data.valid){
                    J("#slugpreview").css("color", "green");
                } else {
                    J("#slugpreview").css("color", "red");
                }
            });
        }
    },
    
    user_home: {
        init: function(){
            //set up buttons on user home page
            J(".home-widget-edit-link").button({
                'text': false,
                'icons': {primary:'sprite-cog'}
            });
            
            J(".home-widget-edit").buttonset();
            J(".widget-move-up").button('option', 'icons', {primary:'ui-icon-circle-arrow-n'}).button('option', 'text', false);
            J(".widget-move-down").button('option', 'icons', {primary:'ui-icon-circle-arrow-s'}).button('option', 'text', false);
            J(".widget-remove").button('option', 'icons', {primary:'sprite-trash'}).button('option', 'text', false);
            
            
            Zotero.pages.user_home.zoteroTips = new Array(
            "<p>To see all the collections an item is in, hold down the “Option” key on Macs or the “Control” key on Windows. This will highlight all collections that contain the selected record.</p>",
            "<p>Press ”+” (plus) on the keyboard within the collections list or items list to expand all nodes and ”-” (minus) to collapse them.</p>",
            "<p>To see how many items you have, click an item in the middle column and Select All (Command-A on OS X or Control-A on Windows). A count of selected items will appear in the right column.</p>",
            "<p>Can't adjust the size of the Zotero pane downwards? The tag selector probably is in the way (it has a minimum height). Close it by dragging the top of the tag selector box to the bottom of your window.</p>",
            "<p>Right-clicking on any metadata text field which might logically use title case allows you to toggle between title and lower cases.</p>",
            "<p>Holding the Shift button while dragging and dropping an item into a text document will insert a citation, rather than the usual full reference.</p>",
            "<p>Zotero supports the standard Firefox shortcut keys for tab/window opening: Ctrl/Cmd-click for a new tab behind, Ctrl/Cmd-Shift-click for a new tab in front, and Shift-click for a new window.</p>",
            "<p>Zotero has a bunch of great keyboard shortcuts. For example, you can open and close the Zotero pane with Ctrl-Alt-Z in Windows, or Cmd-Shift-Z on a Mac.</p>",
            "<p>You can drag and drop PDFs from your desktop to your library and right click on them to have Zotero look up its metadata in Google Scholar.</p>",
            "<p>Let Zotero search inside your PDFs. Just configure your search preferences.</p>",
            "<p>Keep track of recent additions using a saved search. Click Advanced search, select 'Dated Added' > 'is in the last' > X 'days/months' fill in the desired period and save the search. This gives you a dynamic view of new items.</p>",
            "<p>Tag multiple items at once. Select them, make sure the tag selector is visible in the left pane, and drag them onto the tag you want to use. The tag will be applied to all items.</p>",
            "<p>Display a timeline to visualize your bibliography. Select a group of references, a tag, or a collection and click 'Create timeline' from the actions menu.</p>",
            "<p>Click the URL or DOI field name from any item's data column to visit the item online.</p>",
            "<p>Drag any file from your desktop into your Zotero library to attach it to an item.</p>",
            "<p>Adding a series of related references to your library? Start with one item for which you fill in the fields that are the same for all items (e.g. editors, book title, year, publisher, place) and duplicate it (Right-click > Duplicate item). Then fill in the particularities.</p>",
            "<p>Add edited volumes or book chapters as book sections.</p>",
            "<p>Zotero's Word and Open Office plugins make it easy to integrate your Zotero library into your writing process.</p>"
            );
            
            var tipnum = Math.floor(Math.random()*(Zotero.pages.user_home.zoteroTips.length));
            J("#zotero-tip-text").append(Zotero.pages.user_home.zoteroTips[tipnum]);
            J("#next-tip").click(function(){
                tipnum++;
                if(Zotero.pages.user_home.zoteroTips.length <= tipnum){
                    tipnum = 0;
                }
                J("#zotero-tip-text").html(Zotero.pages.user_home.zoteroTips[tipnum]);
                return false;
            });
            
            //Handle extra feed pages
            J(".feed-page").hide();
            J(".feed-div").each(function(){
                J(this).children(".feed-page:first").show();
            });
            J(".feed-page-prev").click(function(){
                J(this).closest(".feed-page").hide().prev(".feed-page").show();
                return false;
            });
            J(".feed-page-next").click(function(){
                J(this).closest(".feed-page").hide().next(".feed-page").show();
                return false;
            });
            
            //handle more/less toggling widget links
            J(".zoteroLibraryWidget").each(function(){J(this).find("tr").slice(4).hide();});
            J(".home-widget-library-toggle-more-link").on("click", function(e){
                e.preventDefault();
                J(this).closest(".zoteroLibraryWidget").find("tr").slice(4).show();
                J(this).replaceWith("<a href='#' class='home-widget-library-toggle-less-link clickable'>Less</a>");
            });
            J(".home-widget-library-toggle-less-link").on("click", function(e){
                e.preventDefault();
                J(this).closest(".zoteroLibraryWidget").find("tr").slice(4).hide();
                J(this).replaceWith("<a href='#' class='home-widget-library-toggle-more-link clickable'>More</a>");
            });
            
            //widget edit link toggling
            J(".home-widget-edit").hide();
            J(".home-widget-edit").hide();
            J(".home-widget-edit-link").click(function(){
                J(this).closest('.home-widget').find(".home-widget-edit").slideToggle();
                return false;
            });
            
            //special case for customize page widgets section
            //init edit links to be hidden
            //J(".home-widget-edit-link").hide();
            J("#customize-homepage-forms").hide();
            //J("#w").children(".home-widget-content").toggle().siblings(".home-widget-title").css('cursor', 'pointer');
            J("#customize-homepage-link").click(function(){
                J("#customize-homepage-forms").slideToggle();
                //J(".home-widget-edit-link").toggle();
                return false;
            });
            
            //functions to modify any widget
            J(".widget-toggle").click(function(){
                J(this).parent().siblings(".home-widget-content").slideToggle();
                return false;
            });
            J(".widget-remove").click(function(){
                var widgetID = J(this).closest(".home-widget").attr("id").substr(1);
                J.post('user/updatewidgets', {'widgetaction':'delete', 'widgetid':widgetID, 'ajax':'1'}, function(data){
                    
                    });
                J(this).closest(".home-widget").remove();
                return false;
            });
            J(".widget-move-up").click(function(){
                var widgetID = J(this).closest(".home-widget").attr("id").substr(1);
                var selected = J(this).closest(".home-widget");
                var prev = selected.prev(".home-widget");
                if(prev && prev.attr("id") != 'w'){
                    J.post('user/updatewidgets', {'widgetaction':'move', 'direction':'up', 'widgetid':widgetID, 'ajax':'1'});
                    selected.insertBefore(prev);
                }
            });
            J(".widget-move-down").click(function(){
                var widgetID = J(this).closest(".home-widget").attr("id").substr(1);
                var selected = J(this).closest(".home-widget");
                var next = selected.next(".home-widget");
                if(next){
                    J.post('user/updatewidgets', {'widgetaction':'move', 'direction':'down', 'widgetid':widgetID, 'ajax':'1'});
                    selected.insertAfter(next);
                }
            });
            
            J("#reset-widgets").click(function(){
                if(confirm("When you reset your homepage it goes back to its original settings and any changes you've made will be lost")){
                    J.post('user/updatewidgets', {'widgetaction':'reset', 'ajax':'1'}, function(){
                        window.location.href = window.location.href;
                    });
                }
            });
            
            //ajax load feeds so frame loads faster even with many/unresponsive feeds
            J(".zoteroFeedWidget").each(function(i, el){
                Zotero.pages.user_home.load_widget_content(this, function(){});
                J(this).children(".widget-title-text").html();
            });
            
            //ajax load involvement so frame loads faster even with many libraries
            J(".zoteroInvolvementWidget").each(function(i, el){
                Zotero.pages.user_home.load_widget_content(this, function(){});
                J(this).children(".widget-title-text").html();
            });
            
            
            //set timer to cycle screencasts until user clicks one
            var screencastLinks = J(".screencast-widget-link");
            Zotero.pages.user_home.screencastCounter = 0;
            Zotero.pages.user_home.stopcycle = false;
            screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
            setTimeout(Zotero.pages.user_home.cycleScreencasts, 5000);

            J("#screencast-next-link").click(function(){
                Zotero.pages.user_home.stopcycle = true;
                Zotero.pages.user_home.screencastCounter = (Zotero.pages.user_home.screencastCounter + 1) % screencastLinks.size();
                Z.debug(Zotero.pages.user_home.screencastCounter);
                screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
            });
            J("#screencast-prev-link").click(function(){
                Zotero.pages.user_home.stopcycle = true;
                Zotero.pages.user_home.screencastCounter--;
                if(Zotero.pages.user_home.screencastCounter < 0) Zotero.pages.user_home.screencastCounter = screencastLinks.size() - 1;
                Z.debug(Zotero.pages.user_home.screencastCounter);
                screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
            });

            //get user library stats for immutable area

        },
        
        load_widget_content: function(widget, callback){
            J(widget).children(".home-widget-content :not(:empty)").html("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
            //J(widget).children(".home-widget-content").html("<img id='spinner' src='/static/images/theme/ajax-spinner.gif'/>");
            var widgetID = J(widget).attr("id").substr(1);
            var requrl = "/user/widgetcontent";
            J.get(requrl, {widgetid:widgetID}, function(data){
                J(widget).children(".home-widget-content").html(data);
                J(".zoteroLibraryWidget").each(callback);
            });
        },
        
        cycleScreencasts: function(){
            if(Zotero.pages.user_home.stopcycle === false){
                setTimeout(Zotero.pages.user_home.cycleScreencasts, 5000);
            }
            else{
                return false;
            }
            var screencastLinks = J(".screencast-widget-link");
            Zotero.pages.user_home.screencastCounter++;
            Zotero.pages.user_home.screencastCounter = Zotero.pages.user_home.screencastCounter % screencastLinks.size();

            screencastLinks.hide().eq(Zotero.pages.user_home.screencastCounter).show();
        }
    },
    
    user_profile: {
        init: function(){
            J('#invite-button').click(function(){
                var groupID = J("#invite_group").val();
                J.post("/groups/inviteuser", {ajax:true, groupID:groupID, userID:zoteroData.profileUserID}, function(data){
                    if(data == 'true'){
                        J('#invited-user-list').append("<li>" + J("#invite_group > option:selected").html() + "</li>");
                        J('#invite_group > option:selected').remove();
                        if(J('#invite_group > option').length === 0){
                            J('#invite_group').remove();
                            J('#invite-button').remove();
                        }
                    }
                }, "text");
            });
            J('#follow-button').click(Zotero.pages.user_profile.follow);
            J("#tag-cloud").tagcloud({type:'list', height:200, sizemin:8, sizemax:18, colormin:'#99000', colormax:'#99000'});
        },
        
        follow: function(){
            var followText = J('#follow-status-text');
            var followHtml = followText.html();
            followText.html("<img src='/static/images/theme/ajax-spinner.1231947775.gif'/>");
            J.post("/user/follow/" + zoteroData.profileUserID, {ajax:true}, function(data){
                    if(data.status == "following"){
                        J('#follow-button').val("Unfollow");
                        followText.html( followHtml.replace("not following", "following"));
                    }
                    else if(data.status == 'not following'){
                        J('#follow-button').val("Follow");
                        followText.html( followHtml.replace("following", "not following"));
                    }
                }, "json");
        }
    },
    
    group_tag: {
        init: function(){
            J("#tag-type-select").change(function(){
                J(this).parent().submit();
            });
        }
    },
    
    user_item_detail: {
        init: function(){
            
        }
    },
    
    user_item_form_init: function(){
        
    },
    
    user_item_new: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    user_item_edit: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    user_library: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    my_library: {
        init: function(){
            //Zotero.pages.user_item_form_init();
        }
    },
    
    group_item_detail: {
        init: function(){
            
        }
    },
    
    group_library: {
        init: function(){
        }
    },
    
    message_inbox: {
        init: function(){
            var selector = J("#selector");
            
            J("#selector").change(function(){
                Z.debug("selector checkbox changed");
                if(J("#selector").prop('checked') ){
                    J("input[type=checkbox]").prop("checked", true);
                }
                else{
                    J("input[type=checkbox]").prop("checked", false);
                }
            });
            
            J("input[type=checkbox][id!=selector]").change(function(){
                Z.debug("non-selector checkbox changed");
                if(J("input[id!=selector]:checked").length > 0){
                    J("#selector").prop("checked", false);
                }
                else{
                    J("#selector").prop("checked", true);
                }
            });
            
            J.each(zoteroData.messages, function(i, msg){
                if(msg.read == 1){
                    J("#message-row-" + msg.messageID).addClass("read-message");
                }
            });
            
            J("#read-button").click(function(){Zotero.pages.message_inbox.readStatus(true);});
            J("#unread-button").click(function(){Zotero.pages.message_inbox.readStatus(false);});
            J("#delete-button").click(function(){Zotero.pages.message_inbox.deleteMessage();});
            
        },
        
        //set all checked messages to read/unread
        readStatus: function(read){
            var messageIDs = "";
            var rows = J([]);
            J("#message-spinner").show();
            
            if(J("input[type=checkbox][id^=check-]:checked").length === 0){
                return true;
            }
            J("input[type=checkbox][id^=check-]:checked").each(function(){
                messageIDs += this.id.substr(6) + ",";
                if(!rows) rows = J("#message-row-"+this.id.substr(6));
                else rows = rows.add("#message-row-"+this.id.substr(6));
            });
            
            if(read === true){
                J.post("/message/read", {ajax:true, messageIDs:messageIDs }, function(data){
                    if(data.success === true){
                        J("input[type=checkbox]").prop("checked", false);
                        checked = false;
                        rows.addClass("read-message");
                        J("#message-spinner").hide();
                    }
                    else {
                        J("#message-spinner").hide();
                        return false;
                    }
                }, "json");
            }
            else{
                J.post("/message/unread", {ajax:true, messageIDs:messageIDs }, function(data){
                    if(data.success === true){
                        J("input[type=checkbox]").prop("checked", false);
                        checked = false;
                        rows.removeClass("read-message");
                        J("#message-spinner").hide();
                    }
                    else {
                        J("#message-spinner").hide();
                        return false;
                    }
                }, "json");
            }
        },
        
        //delete all checked messages and hide them from the inbox view
        deleteMessage: function(){
            var messageIDs = "";
            var rows = J([]);
            J("#message-spinner").show();
            
            J("input[type=checkbox][id^=check-]:checked").each(function(){
                messageIDs += this.id.substr(6) + ",";
                if(!rows) rows = J("#message-row-"+this.id.substr(6));
                else rows = rows.add("#message-row-"+this.id.substr(6));
            });
            
            J.post("/message/delete", {ajax:true, messageIDs:messageIDs }, function(data){
                if(data.success === true){
                    J("input[type=checkbox]").prop("checked", false);
                    checked = false;
                    rows.hide();
                    J("#message-spinner").hide();
                }
                else {
                    J("#js-message").html("Error deleting messages");
                    J("#message-spinner").hide();
                    return false;
                }
            }, "json");
        }
    },
    
    message_view: {
        init: function(){
            if(zoteroData.read === 0){
                var inboxLink = J('#login-links > a[href="/message/inbox"]');
                inboxLink.html( inboxLink.html().replace(zoteroData.unreadCount, (zoteroData.unreadCount - 1)) );
            }
            
            //delete message
            J("#delete-button").click(function(){
                if(confirm("Delete Message?")){
                    J.post("/message/delete", {ajax:true, messageIDs: zoteroData.messageID }, function(data){
                        if(data.success === true){
                            window.location = "/message/inbox";
                        }
                    }, "json");
                }
            });
        }
    },
    
    message_compose: {
        init: function(){
            J("#contact-list").click(function(){
                J("#messageRecipient").val(J("#contact-list").val().join(", "));
            });
            Zotero.ui.init.tinyMce('nolinks');
        }
    },
    
    group_compose: {
        init: function(){
            //tinyMCE.execCommand('mceAddControl', true, "messageBody");
            //J("#submit").bind("click", function(){ tinyMCE.execCommand('mceRemoveControl', true, 'messageBody');});
            Zotero.ui.init.tinyMce('nolinks');
        }
    },
    
    index_index: {
        /*init: function(){
            flowplayer("intro-screencast", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf");
        },
        */
        
        init: function(){
            //set up feature tour tab containers
            var tabContainers = J('div#features-lists > div');
            tabContainers.hide().filter(':first').show();

            J('ul#features-tabs a').click(function () {
                Zotero.pages.index_index.tabClick = true;
                tabContainers.hide();
                tabContainers.filter(this.hash).show();
                J('ul#features-tabs a').removeClass('selected');
                J(this).addClass('selected');
                return false;
            }).filter(':first').click();

            //set timer to cycle tabs until user clicks one
            Zotero.pages.index_index.tabCounter = 0;
            Zotero.pages.index_index.tabClick = false;
            //setTimeout(Zotero.pages.index_index.cycleTab, 5000);

            //set up screen cast player + box
            J("#intro-screencast-small").click(function(){
                J('#content').prepend("<div id='dimmer'><div id='intro-screencast-lightbox-div'><a href='/static/videos/zotero_1_5_cast.flv' id='intro-screencast-lightbox'></a><a id='close-lightbox-link'>close</a></div></div>");
                Zotero.pages.index_index.player = flowplayer("intro-screencast-lightbox", Zotero.pages.staticPath+"/library/flowplayer/flowplayer-3.1.1.swf",
                    {clip:
                        {autoPlay:true}
                    }
                );
                J('#close-lightbox-link').click(function(){
                    Zotero.pages.index_index.player.close();
                    J('#dimmer').remove();
                    J('#intro-screencast-lightbox-div').remove();
                });
                return false;
            });
        },
        
        cycleTab: function(){
            if(Zotero.pages.index_index.tabClick === false){
                setTimeout(Zotero.pages.index_index.cycleTab, 5000);
            }
            else{
                return false;
            }
            Zotero.pages.index_index.tabCounter++;
            Zotero.pages.index_index.tabCounter = Zotero.pages.index_index.tabCounter % 5;
            var tabContainers = J('div#features-lists > div');
            //tabContainers.hide().filter(':first').show();
            tabContainers.hide();
            tabContainers.eq(Zotero.pages.index_index.tabCounter).show();
            J('ul#features-tabs a').removeClass('selected').eq(Zotero.pages.index_index.tabCounter).addClass('selected');

        }
    },
    
    search_index: {
        init: function(){
            Z.debug("search_index init");
            // re-run search when a new tab is clicked
            J("#search-nav li a").click(function(e){
                e.preventDefault();
                Z.debug("search nav link clicked");
                var params  = Zotero.pages.search_index.parseSearchUrl();
                
                var newQueryType = J(this).attr("id").split("-")[1];
                Z.debug(newQueryType);
                
                Zotero.nav.urlvars.pathVars['type'] = newQueryType;
                
                Zotero.nav.pushState();
            });
            
            // set onlick event for submit buttons
            J(".submit-button").click(function(e){
                e.preventDefault();
                Z.debug("search submit button clicked");
                var queryType   = this.id.split("-")[0];
                var queryString = J("#"+queryType+"Query").val();
                if(!queryString || queryString === "") {return false;}
                
                // If this is a support search, see if we need to refine to forums or documentation
                if(queryType == "support"){
                    queryType = J("input[name=supportRefinement]:checked").val();
                }
                
                Zotero.nav.urlvars.pathVars['q'] = queryString;
                Zotero.nav.urlvars.pathVars['type'] = queryType;
                
                Zotero.nav.pushState();
                
                //jQuery.historyLoad(hash);
                return false;
            });

            // Set up the history plugin
            //jQuery.historyInit(Zotero.pages.search_index.pageload);
        },
        
        parseSearchUrl: function(hash){
            Z.debug('parseSearchUrl', 3);
            var params = {"type":"", "query":"", "page":""};
            
            params.type = Zotero.nav.getUrlVar('type') || 'support';
            params.query = Zotero.nav.getUrlVar('q') || '';
            params.page = Zotero.nav.getUrlVar('page') || 1;
            return params;
        },
        
        pageload: function(hash){
            // Clear any results
            Zotero.pages.search_index.clearResults();
            
            // In safari, the hash passed to this function by the history plugin is always whatever the hash was
            // when the page was first loaded. To get around this bug, we just refresh the hash by grabbing it from
            // the location object.
            hash = location.hash;
            
            // Parse the hash or if there is nothing in the hash, just bail now
            if(hash) {
                params = Zotero.pages.search_index.parseHash(hash);
            } else { return; }
			
			// Show the right tab and select the right support refinement if needed
            switch (params.type) {
                case "support":
                case "forums":
                case "documentation":
                    J("#tabs").tabs('select','#support');
                    J("input[name=supportRefinement]").val([params.type]);
                    break;
                default: J("#tabs").tabs('select','#' + params.type);
            }

            //add pubLibOnly param if box is checked
            if((params.type == "people") && (J("#peopleLibraryOnly:checked").length)){
                params.pubLibOnly = 1;
            }

            //add recent param if box checked
            if((params.type == "forums") && (J("#forumsRecent:checked").length)){
                params.recent = true;
            }
            else{
                params.recent = false;
            }
            
            // give focus to the search box
            J("#" + params.type + "Query").focus();
            
			// Load the query into the right search field
			J("#search-form .textinput").val(params.query);
            
            Zotero.pages.search_index.runSearch(params);
        },
        
        runSearch: function(params){
            Z.debug("Zotero.pages.search_index.runSearch", 3);
            Z.debug(params);
            // If it's a request for support results, pass to google search function
            if(!params.type) params.type = 'support';
            if(params.type == "support" || params.type == "forums" || params.type == "documentation"){
                Z.debug("google search");
                Zotero.pages.search_index.fetchGoogleResults(params);
            // otherwise, Make ajax request for results page
            } else if (params.query !== "") {
                Z.debug("non-google search", 3);
                Zotero.ui.showSpinner(J("#search-spinner"));
                J("#search-spinner").show();
                J.post(baseURL + "/searchresults", params, function(response){
                    J("#search-spinner").hide();
                    if(response.error){
                        J("#search-results").html("There was an error searching for groups. Please try again in a few minutes");
                    }
                    else{
                        J("#search-results").html(response.results);
                        J("#search-result-count").html("Found " + response.resultCount + " results");
                        J("#search-pagination").html(response.paginationControl);
                    }
                }, "json");
            }
            Z.debug("done with runSearch");
        },
        
        fetchGoogleResults: function(params){
            Z.debug("Zotero.pages.search_index.fetchGoogleResults", 3);
            Zotero.pages.search_index.clearResults();
            Zotero.ui.showSpinner(J("#search-spinner"));
            J("#search-spinner").show();
            // Create a new WebSearch object
            searcher = new google.search.WebSearch();
            
            // Restrict to the zotero custom search engine and specific refinments if present
            var refinement = null;
            switch (params.type) {
                case "documentation" : refinement = "Documentation"; break;
                case "forums"        : refinement = (params.recent ? "ForumsRecent" : "Forums"); break;
            }
            searcher.setSiteRestriction("008900748681634663180:wtahjnnbugc", refinement);
            
            // Turn off safe search, set result set size, and disable HTML that we won't use
            searcher.setRestriction(google.search.Search.RESTRICT_SAFESEARCH, google.search.Search.SAFESEARCH_OFF);
            searcher.setResultSetSize(google.search.Search.LARGE_RESULTSET);
            searcher.setNoHtmlGeneration();
            
            // Setup a callback to handle the results
            // Callback arguments have to be an array, so make a quick array out of our params object
            paramsArray = [params.type, params.query, params.page];
            searcher.setSearchCompleteCallback(Zotero.pages, Zotero.pages.search_index.displayGoogleResults, paramsArray);
            
            // Execute our query
            searcher.clearResults();
            searcher.execute(params.query);
        },
        
        displayGoogleResults: function(type, query, page){
            Z.debug("Zotero.pages.search_index.displayGoogleResults", 3);
            J("#search-spinner").hide();
            
            // Check if we have any results and displays them if we do
            if (searcher.results && searcher.results.length > 0) {
                Z.debug("have results in searcher, displaying results");
                for (var i in searcher.results) {
                    var r = searcher.results[i];
                    J("#search-results").append("                                                                 \
                        <li class='support-result'>                                                                    \
                          <div class='support-result-title'>                                                           \
                            <a href='"+r.url+"'>"+r.title+"</a>                                                        \
                          </div>                                                                                       \
                          <div class='support-result-content'>"+r.content+"</div>                                      \
                          <div class='support-result-url'>"+r.url.replace("http://", "")+"</div>                       \
                        </li>").show();
                }
                
                // Display the number of results found
                J("#search-result-count").html("Found " + searcher.cursor.estimatedResultCount + " results");
                
                // Add pagination links
                for (var i in searcher.cursor.pages){
                    var p = searcher.cursor.pages[i];
                    // If we're on the current page, output a number
                    if (i == searcher.cursor.currentPageIndex) {
                        J("#search-pagination").append(p.label + " | ");
                    } else {
                        J("#search-pagination").append("<a href='javascript:Zotero.pages.search_index.gotopage("+i+")'>"+p.label+"</a> | ");
                    }
                }
            }
            else{
                Z.debug("no results in searcher");
            }
        },
        
        clearResults: function(){
            J("#search-results").empty();
            J("#search-result-count").empty();
            J("#search-pagination").empty();
            window.scrollBy(0, -500);
        },
        
        gotopage: function(i){
            Zotero.pages.search_index.clearResults();
            searcher.gotoPage(i);
        }
    },
    
    search_items: {
        init: function(){
            try{
                var library = new Zotero.Library();
            }
            catch(e){
                Z.debug("Error initializing library");
            }
            
            J("#item-submit").bind('click submit', J.proxy(function(e){
                Z.debug("item search submitted", 3);
                e.preventDefault();
                e.stopImmediatePropagation();
                var q = J("#itemQuery").val();
                var globalSearchD = library.fetchGlobalItems({q:q});
                globalSearchD.done(function(globalItems){
                    Z.debug("globalItemSearch callback", 3);
                    Z.debug(globalItems);
                    J("#search-result-count").empty().append(globalItems.totalResults);
                    var jel = J("#search-results");
                    jel.empty();
                    J.each(globalItems.objects, function(ind, globalItem){
                        J("#globalitemdetailsTemplate").tmpl({globalItem:globalItem}).appendTo(jel);
                    });
                });
                return false;
            }, this ) );
        }
    },
    
    index_start: {
        init: function() {
            // Fit the iFrame to the window
            Zotero.pages.index_start.sizeIframe();

            // Resize the iframe when the window is resized
            J(window).resize(Zotero.pages.index_start.sizeIframe);
            
            // Change the iframe src
            J(".start-select").click(function(){
                J("iframe").attr("src", J(this).attr("href"));
                return false;
            });
            
            J(".start-show-overlay").click(function(){
                J("#start-overlay").show();
                return false;
            });
            
            J(".start-hide-overlay").click(function(){
                J("#start-overlay").hide();
                return false;
            });
        },
        // Resize the height of the iframe to fill the page
        sizeIframe: function() {
            J("iframe").css("height", J(window).height() - 144);
        }
    },
    
    index_startstandalone: {
        init: function() {
            var browsername = BrowserDetect.browser;
            switch(browsername){
                case 'Chrome':
                    J('#chrome-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
                    break;
                case 'Safari':
                    J('#safari-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
                    break;
                case 'Firefox':
                    J('#firefox-connector-message').closest('li').detach().prependTo('#recommended-download > ul');
                    break;
                default:
                    J('#connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
                    J('#other-connectors-p').hide();
            }
            J('#recommended-download > ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
        }
    },
    
    index_download: {
        init: function() {
            var browsername = BrowserDetect.browser;
            var os = BrowserDetect.OS;
            var arch = (navigator.userAgent.indexOf('x86_64') != -1) ? 'x86_64' : 'x86';
            
            if(os == 'Windows'){
                J('#standalone-windows-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
            }
            else if(os == 'Mac'){
                J('#standalone-mac-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
            }
            else if(os == 'Linux'){
                if(arch == 'x86_64'){
                    J('#standalone-linux64-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
                }
                else {
                    J('#standalone-linux32-download-button').closest('li').clone().prependTo('#recommended-client-download > ul');
                }
            }
            else {
                
            }
            
            J("#recommended-connector-download").show();
            switch(browsername){
                case 'Chrome':
                    //J('#chrome-connector-download-button').closest('li').clone().prependTo('#recommended-connector-download > ul');
                    J('#chrome-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download > ul');
                    break;
                case 'Safari':
                    J('#safari-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download > ul');
                    break;
                case 'Firefox':
                    J('#firefox-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download > ul');
                    break;
                default:
                    J('#connector-download-button').closest('li').clone().prependTo('#recommended-connector-download > ul');
                    J('#other-connectors-p').hide();
            }
            J('#recommended-download > ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
        }
    },
    
    index_bookmarklet: {
        init: function(){
            J(".bookmarklet-instructions").hide();
            var section = J("#bookmarklet-tabs li.selected").data('section');
            J("#" + section + '-bookmarklet-div').show();
            
            J("#bookmarklet-tabs li").on('click', function(e){
                Z.debug("bookmarklet tab clicked");
                J("#bookmarklet-tabs li.selected").removeClass('selected');
                J(this).addClass('selected');
                var section = J(this).data('section');
                Z.debug(section);
                J(".bookmarklet-instructions").hide();
                J("#" + section + '-bookmarklet-div').show();
            });
        }
    },
    
    admin_dashboard: {
        init: function(){
            // Set up some helper text and make sure it doesn't get submitted
            var inputLabelText = "Filter log messages by keyword or log ID";
            J("#admin-query").inputLabel(inputLabelText, {color:"#999"});
            J("#admin-query-form").submit(function(){
                // This is covering for what I think is a bug in the inputLabel plugin
                if(J("#admin-query").val() == inputLabelText){
                    J("#admin-query").val("");
                }
            });
            
            // Slide down the message bodies when clicked
            J(".admin-message-title").click(function(){
                J(this).siblings(".admin-message-body").slideToggle(150);
            });
            
            // Put up a confirm when doing special admin stuff
            J("button").click(function(){
                if(!confirm("Are you sure?")){
                    return false;
                }
            });
            
            J("#admin-toggle-link").click(function(){
                J(".admin-message-body").slideToggle(true);
                return false;
            });
        }
    },
    
    admin_userstorage: {
        init: function(){
            J(".userstorage-section").hide();
            if(zoteroData.admin_userstorage_display == "user-storage-info-div"){
                J("#user-storage-info-div").show();
            }
            else if(zoteroData.admin_userstorage_display == "checkout-history-div"){
                J("#checkout-history-div").show();
            }
            J("#user-storage-button").click(function(){
                J(".userstorage-section").hide();
                J("#user-storage-info-div").show();
            });
            J("#checkout-history-button").click(function(){
                J(".userstorage-section").hide();
                J("#checkout-history-div").show();
            });
        }
    },
    
    utils: {
        
    }

}; // end zoterojs
