Zotero.ui.widgets.siteSearch = {};

Zotero.ui.widgets.siteSearch.init = function(el){
    Z.debug("widgets.siteSearch.init", 3);
    var widgetEl = J(el);
    Zotero.listen("searchSite", Zotero.ui.widgets.siteSearch.triggeredSearch, {widgetEl: el});
    
    var searchType = Zotero.state.getUrlVar('type');
    var query = Zotero.state.getUrlVar('q');
    Z.debug("searchType: " + searchType);
    switch(searchType){
        case 'support':
            J('a.supportTab').tab('show');
            J("#supportQuery").val(query);
            break;
        case 'groups':
            J('a.groupTab').tab('show');
            J("#groupQuery").val(query);
            break;
        case 'people':
            J('a.peopleTab').tab('show');
            J("#peopleQuery").val(query);
            break;
    }
    
    if(query){
        Zotero.ui.widgets.siteSearch.search(searchType, query);
    }
};

Zotero.ui.widgets.siteSearch.triggeredSearch = function(event){
    Z.debug("Zotero.ui.widgets.siteSearch.search", 3);
    var widgetEl = J(event.data.widgetEl);
    var triggeringEl = J(event.triggeringElement);
    
    var queryType   = triggeringEl.data('searchtype');
    var queryString = triggeringEl.closest('.search-section').find('input[name="q"]').val();
    // If this is a support search, see if we need to refine to forums or documentation
    if(queryType == "support"){
        queryType = widgetEl.find("input[name=supportRefinement]:checked").val();
    }
    
    Zotero.ui.widgets.siteSearch.search(queryType, queryString);
    return false;
};

Zotero.ui.widgets.siteSearch.search = function(queryType, queryString){
    //var queryString = J("#"+queryType+"Query").val();
    if(!queryString || queryString === "") {return false;}
    
    Zotero.state.setQueryVar('q', queryString);
    Zotero.state.setUrlVar('type', queryType);
    
    Zotero.state.pushState();
    
    var params = {type:queryType, query:queryString};
    Z.debug(params);
    Zotero.ui.widgets.siteSearch.runSearch(params);
};

Zotero.ui.widgets.siteSearch.runSearch = function(params){
    Z.debug("Zotero.ui.widgets.siteSearch.runSearch", 3);
    Z.debug(params, 3);
    // If it's a request for support results, pass to google search function
    if(!params.type) params.type = 'support';
    if(params.type == "support" || params.type == "forums" || params.type == "documentation"){
        Z.debug("google search");
        Zotero.ui.widgets.siteSearch.fetchGoogleResults(params);
    // otherwise, Make ajax request for results page
    } else if (params.query !== "") {
        Z.debug("non-google search", 3);
        var searchUrl = '';
        var queryString = '?';
        if(params.type == 'people'){
            searchPath = '/search/users';
        }
        else if(params.type == 'groups'){
            searchPath = '/search/groups';
        }
        queryString += 'query=' + params['query'];
        if(params['page']){
            queryString += '&page=' + params['page'];
        }
        Zotero.ui.showSpinner(J("#search-spinner"));
        J("#search-spinner").show();
        J.get(baseURL + searchPath + queryString, function(response){
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
};

Zotero.ui.widgets.siteSearch.fetchGoogleResults = function(params){
    Z.debug("Zotero.ui.widgets.siteSearch.fetchGoogleResults", 3);
    Zotero.ui.widgets.siteSearch.clearResults();
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
    searcher.setSearchCompleteCallback(Zotero.ui.widgets.siteSearch, Zotero.ui.widgets.siteSearch.displayGoogleResults, paramsArray);
    
    // Execute our query
    searcher.clearResults();
    searcher.execute(params.query);
};

Zotero.ui.widgets.siteSearch.displayGoogleResults = function(type, query, page){
    Z.debug("Zotero.ui.widgets.siteSearch.displayGoogleResults", 3);
    J("#search-spinner").hide();
    
    // Check if we have any results and displays them if we do
    if (searcher.results && searcher.results.length > 0) {
        Z.debug("have results in searcher, displaying results");
        var i;
        for (i in searcher.results) {
            var r = searcher.results[i];
            var url = r.url.replace("http://", "");

            J("#search-results").append(J("#googlesearchresultTemplate").render({
                'title': r.title,
                'url': url,
                'content': r.content
            })).show();
        }
        
        // Display the number of results found
        J("#search-result-count").html("Found " + searcher.cursor.estimatedResultCount + " results");
        
        // Add pagination links
        for (i in searcher.cursor.pages){
            var p = searcher.cursor.pages[i];
            // If we're on the current page, output a number
            if (i == searcher.cursor.currentPageIndex) {
                J("#search-pagination").append(p.label + " | ");
            } else {
                J("#search-pagination").append("<a href='javascript:Zotero.ui.widgets.siteSearch.gotopage("+i+")'>"+p.label+"</a> | ");
            }
        }
    }
    else{
        Z.debug("no results in searcher");
    }
};

Zotero.ui.widgets.siteSearch.clearResults = function(widgetEl){
    widgetEl = J(widgetEl);
    widgetEl.find("#search-results").empty();
    widgetEl.find("#search-result-count").empty();
    widgetEl.find("#search-pagination").empty();
    window.scrollBy(0, -500);
};

Zotero.ui.widgets.siteSearch.gotopage = function(i){
    Zotero.ui.widgets.siteSearch.clearResults();
    searcher.gotoPage(i);
};
