Zotero.ui.widgets.libraryDropdown = {};

Zotero.ui.widgets.libraryDropdown.init = function(el){
    Z.debug("libraryDropdown widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var widgetEl = J(el);
    var currentLibraryName = Zotero.config.librarySettings.name;
    //set name of current library which we already have, before fetching the rest
    widgetEl.find("span.current-library-name").text(currentLibraryName);

    Zotero.listen("populateLibraryDropdown", Zotero.ui.widgets.libraryDropdown.populateDropdown, {widgetEl: el});
};

Zotero.ui.widgets.libraryDropdown.populateDropdown = function(evt){
    Zotero.debug("Zotero.ui.widgets.libraryDropdown.populateDropdown", 3);
    var widgetEl = J(evt.data.widgetEl);
    if(widgetEl.data('loaded')){
        return;
    }

    var library = Zotero.ui.getAssociatedLibrary(widgetEl);
    if(!Zotero.config.loggedIn){
        throw new Error("no logged in userID. Required for libraryDropdown widget");
    }
    var user = Zotero.config.loggedInUser;
    var personalLibraryString = 'u' + user.userID;
    var personalLibraryUrl = Zotero.url.userWebLibrary(user.slug);
    var currentLibraryName = Zotero.config.librarySettings.name;
    
    var memberGroups = library.groups.fetchUserGroups(user.userID)
    .then(function(response){
        Z.debug("got member groups", 3);
        var memberGroups = response.fetchedGroups;
        var accessibleLibraries = [];
        if(!(Zotero.config.librarySettings.libraryType == 'user' && Zotero.config.librarySettings.libraryID == user.userID)){
            accessibleLibraries.push({
                name:'My Library',
                libraryString:personalLibraryString,
                webUrl:personalLibraryUrl
            });
        }
            
        for(var i = 0; i < memberGroups.length; i++){
            if(Zotero.config.librarySettings.libraryType == 'group' && memberGroups[i].get('id') == Zotero.config.librarySettings.libraryID){
                continue;
            }
            var libraryString = 'g' + memberGroups[i].get('id');
            accessibleLibraries.push({
                name: memberGroups[i].get('name'),
                libraryString: libraryString,
                webUrl: Zotero.url.groupWebLibrary(memberGroups[i])
            });
        }
        
        widgetEl.html(J("#librarydropdownTemplate").render({
            currentLibraryName:currentLibraryName,
            accessibleLibraries: accessibleLibraries
        }));

        widgetEl.data('loaded', true);
    }).catch(function(err){
        Z.error(err);
        Z.error(err.message);
    });
    
};
