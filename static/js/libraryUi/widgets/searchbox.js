Zotero.ui.widgets.searchbox = {};

Zotero.ui.widgets.searchbox.init = function(el){
    Z.debug("Zotero.eventful.init.searchbox", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);
    var container = J(el);
    
    library.listen('clearLibraryQuery', Zotero.ui.widgets.searchbox.clearLibraryQuery, {widgetEl:el});
    
    //set initial state of search input to url value
    if(Zotero.state.getUrlVar('q')){
        container.find(".search-query").val(Zotero.state.getUrlVar('q'));
    }
    
    //clear libary query param when field cleared
    var context = 'support';
    if(undefined !== window.zoterojsSearchContext){
        context = zoterojsSearchContext;
    }
    
    //set up search type links
    container.on('click', ".library-search-type-link", function(e){
        e.preventDefault();
        var typeLinks = J(".library-search-type-link").removeClass('selected');
        var selected = J(e.target);
        var selectedType = selected.data('searchtype');
        var searchInput = container.find("input.search-query").data('searchtype', selectedType);
        selected.addClass('selected');
        if(selectedType == 'simple'){
            searchInput.attr('placeholder', 'Search Title, Creator, Year');
        }
        else if(selectedType == 'everything'){
            searchInput.attr('placeholder', 'Search Full Text');
        }
    });
    
    //set up search submit for library
    container.on('submit', "form.library-search", function(e){
        e.preventDefault();
        Z.debug("library-search form submitted", 3);
        Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
        var query = container.find('input.search-query').val();
        var searchType = container.find('input.search-query').data('searchtype');
        if(query !== "" || Zotero.state.getUrlVar('q') ){
            Zotero.state.pathVars['q'] = query;
            if(searchType != "simple"){
                Zotero.state.pathVars['qmode'] = searchType;
            }
            Zotero.state.pushState();
        }
        return false;
    });
    
    container.on('click', '.clear-field-button', function(e){
        J(".search-query").val("").focus();
    });
    
};

Zotero.ui.widgets.searchbox.clearLibraryQuery = function(){
    Zotero.state.unsetUrlVar('q');
    Zotero.state.unsetUrlVar('qmode');
    
    J(".search-query").val("");
    Zotero.state.pushState();
    return;
}

