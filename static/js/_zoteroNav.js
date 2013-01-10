Zotero.nav = {};

Zotero.nav._ignoreStateChange = 0;

Zotero.nav.urlvars = {q:{},
                       f:{},
                       pathVars:{},
                       startUrl:''
                       };

Zotero.nav.replacePush = false;

Zotero.nav.startUrl = '';
Zotero.nav.currentHref = '';

Zotero.nav.pushTag = function(newtag){
    Z.debug('Zotero.nav.pushTag', 3);
    if(Zotero.nav.urlvars.pathVars['tag']){
        if(Zotero.nav.urlvars.pathVars['tag'] instanceof Array){
            Zotero.nav.urlvars.pathVars['tag'].push(newtag);
        }
        else{
            var currentTag = Zotero.nav.urlvars.pathVars['tag'];
            Zotero.nav.urlvars.pathVars['tag'] = [currentTag, newtag];
        }
    }
    else{
        Zotero.nav.urlvars.pathVars['tag'] = [newtag];
    }
    return;
};

Zotero.nav.popTag = function(oldtag){
    Z.debug('Zotero.nav.popTag', 3);
    if(!Zotero.nav.urlvars.pathVars['tag']){
        return;
    }
    else if(Zotero.nav.urlvars.pathVars['tag'] instanceof Array){
        var newTagArray = Zotero.nav.urlvars.pathVars['tag'].filter(function(element, index, array){
            return element != oldtag;
        });
        Zotero.nav.urlvars.pathVars['tag'] = newTagArray;
        return;
    }
    else if(Zotero.nav.urlvars.pathVars['tag'] == oldtag){
        Zotero.nav.urlvars.pathVars['tag'] = [];
        return;
    }
};

Zotero.nav.toggleTag = function(tagtitle){
    Z.debug('Zotero.nav.toggleTag', 3);
    if(!Zotero.nav.urlvars.pathVars['tag']){
        Z.debug("Zotero.nav.urlvars.pathVars['tag'] evaluates false");
        Z.debug(Zotero.nav.urlvars.pathVars);
        Zotero.nav.urlvars.pathVars['tag'] = [tagtitle];
        return;
    }
    else if(J.isArray(Zotero.nav.urlvars.pathVars['tag'])) {
        Z.debug("pathVars tag is array");
        if(J.inArray(tagtitle, Zotero.nav.urlvars.pathVars['tag']) != (-1) ){
            Z.debug("tag already present, removing", 3);
            var newTagArray = Zotero.nav.urlvars.pathVars['tag'].filter(function(element, index, array){
                return element != tagtitle;
            });
            Zotero.nav.urlvars.pathVars['tag'] = newTagArray;
            return;
        }
        else{
            Z.debug("pushing tag", 3);
            Zotero.nav.urlvars.pathVars['tag'].push(tagtitle);
            return;
        }
    }
    else if(Zotero.nav.urlvars.pathVars['tag'] == tagtitle){
        Zotero.nav.urlvars.pathVars['tag'] = [];
        return;
    }
    else if(typeof Zotero.nav.urlvars.pathVars['tag'] == 'string') {
        var oldValue = Zotero.nav.urlvars.pathVars['tag'];
        Zotero.nav.urlvars.pathVars['tag'] = [oldValue, tagtitle];
        return;
    }
    Z.debug("reached end of toggleTag with no satisfaction");
};

Zotero.nav.unsetUrlVar = function(unset){
    Z.debug("Zotero.nav.unsetUrlVar", 3);
    var pathVars = Zotero.nav.urlvars.pathVars;
    if(pathVars[unset]){
        delete(pathVars[unset]);
    }
};

Zotero.nav.clearUrlVars = function(except){
    Z.debug("Zotero.nav.clearUrlVars", 3);
    Z.debug(except);
    if(!except){
        except = [];
    }
    var pathVars = Zotero.nav.urlvars.pathVars;
    J.each(pathVars, function(key, value){
        if(J.inArray(key, except) == (-1)){
            Z.debug(key + " not in except array - deleting from pathVars");
            delete(pathVars[key]);
        }
    });
};

Zotero.nav.parseUrlVars = function(){
    Z.debug('Zotero.nav.parseUrlVars', 3);
    Zotero.nav.urlvars = {
        q: J.deparam(J.param.querystring()),
        f: Zotero.nav.parseFragmentVars(), // J.deparam(J.param.fragment()),
        pathVars: Zotero.nav.parsePathVars()
    };
};

Zotero.nav.parsePathVars = function(pathname){
    Z.debug('Zotero.nav.parsePathVars', 3);
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    if(!pathname){
        var state = History.getState();
        pathname = state.cleanUrl;//window.location.pathname
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "\/?");
    var replaced = pathname.replace(re, '');
    
    Z.debug(replaced, 4);
    split_replaced = replaced.split('/');
    
    Z.debug(split_replaced, 4);
    var pathVars = {};
    for(var i=0; i<(split_replaced.length-1); i = i+2){
        var pathVar = pathVars[split_replaced[i]];
        Z.debug('pathVar: ' + pathVar, 4);
        //if var already present change to array and/or push
        if(pathVar){
            Z.debug("pathVar already has value", 4);
            if(pathVar instanceof Array){
                pathVar.push(decodeURIComponent(split_replaced[i+1]));
            }
            else{
                var ar = [pathVar];
                ar.push(decodeURIComponent(split_replaced[i+1]));
                pathVar = ar;
            }
        }
        //otherwise just set the value in the object
        else{
            Z.debug("pathVar does not have value", 4);
            pathVar = decodeURIComponent(split_replaced[i+1]);
        }
        pathVars[split_replaced[i]] = pathVar;
    }
    Z.debug(pathVars, 4);
    return pathVars;
};

Zotero.nav.parseFragmentVars = function(){
    var fragmentVars = {};
    var fragment = J.param.fragment();
    var split_fragment = fragment.split('/');
    for(var i=0; i<(split_fragment.length-1); i = i+2){
        fragmentVars[split_fragment[i]] = split_fragment[i+1];
    }
    return fragmentVars;
};

Zotero.nav.buildUrl = function(urlvars, fragment){
    //Z.debug("Zotero.nav.buildUrl", 3);
    if(typeof fragment === 'undefined') { fragment = false;}
    var basePath = Zotero.config.nonparsedBaseUrl + '/';
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                urlVarsArray.push(index + '/' + encodeURIComponent(v) );
            });
        }
        else{
            urlVarsArray.push(index + '/' + encodeURIComponent(value) );
        }
    });
    urlVarsArray.sort();
    //Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    var url = basePath + pathVarsString;
    
    return url;
};

//addvars is an object mapping keys and values to add
//removevars is an array of var keys to remove
Zotero.nav.mutateUrl = function(addvars, removevars){
    //Z.debug("Zotero.nav.mutateUrl", 3);
    if(!addvars){
        addvars = {};
    }
    if(!removevars){
        removevars = [];
    }
    
    var urlvars = J.extend({}, Zotero.nav.urlvars.pathVars);
    J.each(addvars, function(key, val){
        urlvars[key] = val;
    });
    J.each(removevars, function(index, val){
        delete urlvars[val];
    });
    
    var url = Zotero.nav.buildUrl(urlvars, false);
    //Z.debug("mutated Url:" + url, 3);
    
    return url;
};

Zotero.nav.pushState = function(force, state){
    Z.debug('Zotero.nav.pushState', 3);
    var History = window.History;
    
    Zotero.ui.saveFormData();
    var curState = History.getState();
    curState = curState['data'];
    
    //selectively add state to hint where to go
    var s = {};
    if(state){
        s = state;
    }
    /*else{
        s = curState;
    }*/

    urlvars = Zotero.nav.urlvars.pathVars;
    
    //Z.debug(urlvars, 4);
    var url = Zotero.nav.buildUrl(urlvars, false);
    //push the state onto our page stack so we know something changed even if the url didn't
    /*
    if(Zotero.config.mobile){
        var activePageID = J.mobile.activePage.attr('id');
        if(typeof activePageID == 'undefined'){
            activePageID = null;
        }
        Zotero.nav.updateStatePageID(activePageID);
        s['_zprevPageID'] = activePageID;
    }
    Z.debug("2");
    Zotero.state.ignoreStatechange = false;
    */
    //actually push state and manually call urlChangeCallback if specified
    if(Zotero.nav.replacePush === true){
        Zotero.nav.replacePush = false;
        Zotero.nav.ignoreStateChange();
        History.replaceState(s, Zotero.config.startPageTitle, url);
    }
    else{
        History.pushState(s, Zotero.config.startPageTitle, url);
    }

    if(force){
        Zotero.nav.urlChangeCallback({type:'popstate', originalEvent:{state:urlvars}} );
    }

    document.title = Zotero.config.startPageTitle;
    Zotero.debug("leaving pushstate", 3);
};

Zotero.nav.replaceState = function(force, state){
    Z.debug("Zotero.nav.replaceState", 3);
    Zotero.ui.saveFormData();
    
    if(typeof force == 'undefined'){
        force = false;
    }
    
    //selectively add state to hint where to go
    var s = null;
    if(state){
        s = state;
    }
    
    urlvars = Zotero.nav.urlvars.pathVars;
    
    //Z.debug(urlvars, 4);
    var url = Zotero.nav.buildUrl(urlvars, false);
    //Z.debug('new url: ' + url);
    
    //ignore the statechange event History.js will fire even though we're replacing, unless forced
    Zotero.state.ignoreStatechange = true;
    Zotero.nav.ignoreStateChange();
    History.replaceState(s, null, url);
};

Zotero.nav.updateStateTitle = function(title){
    Zotero.debug("Zotero.nav.updateStateTitle", 3);
    /*
    var curState = History.getState();
    if(curState.title != title){
        Zotero.nav.ignoreStateChange();
        History.replaceState(curState.data, title, curState.url);
    }
    */
    document.title = title;
};

Zotero.nav.updateStatePageID = function(pageID){
    Z.debug("Zotero.nav.updateStatePageID " + pageID, 3);
    var curState = History.getState();
    var state = curState.data;
    if(pageID === null || pageID === undefined){
        pageID = '';
    }
    state['_zpageID'] = pageID;
    //Zotero.state.ignoreStatechange = true;
    //Zotero.nav.ignoreStateChange();
    History.replaceState(state, curState.title, curState.url);
    Zotero.state.ignoreStatechange = false;
};

Zotero.nav.getUrlVar = function(key){
    if(Zotero.nav.urlvars.pathVars.hasOwnProperty(key) && (Zotero.nav.urlvars.pathVars[key] !== '')){
        return Zotero.nav.urlvars.pathVars[key];
    }
    else if(Zotero.nav.urlvars.f.hasOwnProperty(key)){
        return Zotero.nav.urlvars.f[key];
    }
    else if(Zotero.nav.urlvars.q.hasOwnProperty(key)){
        return Zotero.nav.urlvars.q[key];
    }
    return undefined;
};

Zotero.nav.setUrlVar = function(key, val){
    Zotero.nav.urlvars.pathVars[key] = val;
};

Zotero.nav.getUrlVars = function(){
    var params = J.deparam(J.param.querystring());
    return J.extend(true,{}, Zotero.nav.urlvars.pathVars, params, J.deparam(J.param.fragment()));
};

Zotero.nav.setFragmentVar = function(key, val){
    Zotero.nav.urlvars.f[key] = val;
};

Zotero.nav.setQueryVar = function(key, val){
    if(val === ''){
        delete Zotero.nav.urlvars.q[key];
    }
    else{
        Zotero.nav.urlvars.q[key] = val;
    }
};

Zotero.nav.addQueryVar = function(key, val){
    if(Zotero.nav.urlvars.q.hasOwnProperty(key)){
        //property exists
        if(J.isArray(Zotero.nav.urlvars.q[key])){
            Zotero.nav.urlvars.q[key].push(val);
        }
        else{
            var newArray = [Zotero.nav.urlvars.q[key], val];
            Zotero.nav.urlvars.q[key] = newArray;
        }
    }
    else{
        //no value for that key yet
        Zotero.nav.urlvars.q[key] = val;
    }
    return Zotero.nav.urlvars.q[key];
};

Zotero.nav.updateFragment = function(updatedVars){
    Z.debug("updateFragment", 3);
    J.bbq.pushState(updatedVars, 0);
};

Zotero.nav.urlChangeCallback = function(event, state){
    //Zotero.enableLogging();
    Z.debug("////////////////////urlChangeCallback//////////////////", 3);
    /*if(History.getState().cleanUrl == Zotero.nav.currentHref){
        if(Zotero.nav.forceReload){
            Z.debug("current href matches new href, but forcing reload anyway", 3);
            Zotero.nav.forceReload = false;
        }
        else{
            Z.debug("current href matches new href, returning without processing urlchange", 3);
            return false;
        }
    }
    else{
        */
        Z.debug("new href, updating href and processing urlchange", 3);
        Zotero.nav.currentHref = History.getState().cleanUrl;
        var curStateVars = History.getState().data;
        //Z.debug(Zotero.nav.currentHref);
        //Z.debug(curStateVars);
    /*
    }
    */
    //process special cases in history state
    if(Zotero.config.mobile){
        
    }
    
    //reparse url to set vars in Z.ajax
    Zotero.nav.parseUrlVars();
    
    //process each dynamic element on the page
    J(".ajaxload").each(function(index, el){
//        try{
            Z.debug("ajaxload element found", 3);
            Z.debug(J(el).attr('data-function'), 3);
            //Z.debug(el);
            //call preload function if set
            var prefunctionName = J(el).data('prefunction');
            if(prefunctionName){
                Zotero.callbacks[prefunctionName](el);
            }
            //if still loading then set queued and wait for it to finish before starting again
            if(J(el).data('loading')){
                J(el).data('queuedWaiting', true);
            }
            else{
                Zotero.nav.callbackAssignedFunction(el);
            }
/*        }
        catch(e){
            Z.debug("Couldn't call ajaxload specified function", 1);
            Z.debug(e, 1);
        }
*/
    });

    //set ignoreStateChange to 0 in case we missed a decrement somewhere
    //Zotero.nav.ignoreStateChange = 0;
    Z.debug("<<<<<<<<<<<<<<<<<<<<<<<<urlChangeCallback Done>>>>>>>>>>>>>>>>>>>>>", 3);
};

Zotero.nav.urlAlwaysCallback = function(el){
    Z.debug("_____________urlAlwaysCallback________________", 3);
    
    //reparse url to set vars in Z.ajax
    Zotero.nav.parseUrlVars();
    
    //process each dynamic element on the page
    J(".ajaxload.always").each(function(index, el){
        try{
            Z.debug("ajaxload element found", 3);
            Z.debug(J(el).attr('data-function'), 3);
            //Z.debug(el);
            //call preload function if set
            var prefunctionName = J(el).data('prefunction');
            if(prefunctionName){
                Zotero.callbacks[prefunctionName](el);
            }
            //if still loading then set queued and wait for it to finish before starting again
            if(J(el).data('loading')){
                J(el).data('queuedWaiting', true);
            }
            else{
                Zotero.nav.callbackAssignedFunction(el);
            }
        }
        catch(e){
            Z.debug("Couldn't call ajaxload specified function", 1);
            Z.debug(e, 1);
        }
    });
};

Zotero.nav.callbackAssignedFunction = function(el){
    var functionName = J(el).data('function');
    if(functionName){
        Zotero.callbacks[functionName](el);
    }
};

Zotero.nav.flagLoading = function(el){
    J(el).data('loading', true);
};

Zotero.nav.doneLoading = function(el){
    Z.debug("Zotero.nav.doneLoading", 3);
    J(el).data('loading', false);
    if(J(el).data('queuedWaiting')){
        J(el).data('queuedWaiting', false);
        Zotero.nav.callbackAssignedFunction(el);
    }
};

Zotero.nav._ignoreTimer = null;

Zotero.nav.ignoreStateChange = function(){
    Z.debug("Zotero.nav.ignoreStateChange", 3);
    if(Zotero.nav._ignoreTimer){
        window.clearTimeout(Zotero.nav._ignoreTimer);
    }
    
    Zotero.nav._ignoreStateChange++;
    Z.debug(Zotero.nav._ignoreStateChange, 4);
    //zero semaphore automatically after .5 seconds
    Zotero.nav._ignoreTimer = window.setTimeout(function(){
        Z.debug("clear ignoreState semaphore", 3);
        Zotero.nav._ignoreStateChange = 0;
    }, 500);

    return;
};

//set error handler
J("#js-message").ajaxError(Zotero.nav.error);
