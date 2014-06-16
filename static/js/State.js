Zotero.State = function(){
    this.q = {};
    this.f = {};
    this.pathVars = {};
    this.startUrl = '';
    this.replacePush = false;
    
    //keep track of where we came from
    //update prevHref before history.pushState so we know what changed
    //update curHref when we get a popState event
    //difference between those two is what we need to look at to know what we should update
    this.curHref = '';
    this.prevHref = '';
    //state holder that will keep "current" state separate from History so we can check for updates on popstate
    //"current" here amounts to the state actually represented in the loaded page, so it will be updated after
    //events fire for a browser state change
    this.curState = {};
    this.prevState = {};
    
    //setting to determine if we modify the url or not
    this.useLocation = true;
    
    this.filter = null;
    this.selectedItemKeys = [];
};

Zotero.State.prototype.rewriteAltUrl = function(){
    Z.debug("rewriteAltUrl");
    var state = this;
    var replace = false;
    
    var basePath = Zotero.config.nonparsedBaseUrl;
    var pathname = window.location.pathname
    var baseRE = new RegExp(".*" + basePath + "\/?");
    var oldCollectionRE = /^.*\/collections?\/([A-Z0-9]{8})(?:\/[A-Z0-9]{8})?$/;
    var oldItemRE = /^.*\/[A-Z0-9]{8}$/;
    
    switch(true){
        case oldCollectionRE.test(pathname):
            var matches = oldCollectionRE.exec(pathname);
            var collectionKey = matches[1];
            var itemKey = matches[2];
            replace = true;
            break;
        case oldItemRE.test(pathname):
            var matches = oldItemRE.exec(pathname);
            var itemKey = matches[1];
            replace = true;
            break;
    }
    
    if(collectionKey){
        state.setUrlVar('collectionKey', collectionKey);
    }
    if(itemKey){
        state.setUrlVar('itemKey', itemKey);
    }
    
    if(replace){
        state.replaceState();
    }
};

Zotero.State.prototype.updateCurState = function(){
    var state = this;
    state.curState = J.extend({}, state.f, state.q, state.pathVars);
    return;
};

Zotero.State.prototype.savePrevState = function(){
    var state = this;
    state.prevState = state.curState;
    return;
};

Zotero.State.prototype.getSelectedItemKeys = function(){
    var state = this;
    //filter actual selected itemKeys so we only return unique list
    //necessary because of duplicate item checkboxes, some of which
    //may be hidden
    var uniqueKeys = {};
    var returnKeys = [];
    J.each(state.selectedItemKeys, function(ind, val){
        uniqueKeys[val] = true;
    });
    J.each(uniqueKeys, function(key, val){
        returnKeys.push(key);
    });
    if(returnKeys.length == 0 && state.getUrlVar('itemKey')){
        returnKeys.push(state.getUrlVar('itemKey'));
    }
    return returnKeys;
};

Zotero.State.prototype.pushTag = function(newtag){
    Z.debug('Zotero.State.pushTag', 3);
    var state = this;
    if(state.pathVars['tag']){
        if(state.pathVars['tag'] instanceof Array){
            state.pathVars['tag'].push(newtag);
        }
        else{
            var currentTag = state.pathVars['tag'];
            state.pathVars['tag'] = [currentTag, newtag];
        }
    }
    else{
        state.pathVars['tag'] = [newtag];
    }
    return;
};

Zotero.State.prototype.popTag = function(oldtag){
    Z.debug('Zotero.State.popTag', 3);
    var state = this;
    if(!state.pathVars['tag']){
        return;
    }
    else if(state.pathVars['tag'] instanceof Array){
        var newTagArray = state.pathVars['tag'].filter(function(element, index, array){
            return element != oldtag;
        });
        state.pathVars['tag'] = newTagArray;
        return;
    }
    else if(state.pathVars['tag'] == oldtag){
        state.pathVars['tag'] = [];
        return;
    }
};

Zotero.State.prototype.toggleTag = function(tagtitle){
    Z.debug('Zotero.State.toggleTag', 3);
    var state = this;
    if(!state.pathVars['tag']){
        state.pathVars['tag'] = [tagtitle];
        return;
    }
    else if(J.isArray(state.pathVars['tag'])) {
        if(J.inArray(tagtitle, state.pathVars['tag']) != (-1) ){
            var newTagArray = state.pathVars['tag'].filter(function(element, index, array){
                return element != tagtitle;
            });
            state.pathVars['tag'] = newTagArray;
            return;
        }
        else{
            state.pathVars['tag'].push(tagtitle);
            return;
        }
    }
    else if(state.pathVars['tag'] == tagtitle){
        state.pathVars['tag'] = [];
        return;
    }
    else if(typeof state.pathVars['tag'] == 'string') {
        var oldValue = state.pathVars['tag'];
        state.pathVars['tag'] = [oldValue, tagtitle];
        return;
    }
};

Zotero.State.prototype.unsetUrlVar = function(unset){
    Z.debug("Zotero.State.unsetUrlVar", 3);
    var state = this;
    if(state.pathVars[unset]){
        delete(state.pathVars[unset]);
    }
};

Zotero.State.prototype.clearUrlVars = function(except){
    Z.debug("Zotero.State.clearUrlVars", 3);
    var state = this;
    if(!except){
        except = [];
    }
    var pathVars = state.pathVars;
    J.each(pathVars, function(key, value){
        if(J.inArray(key, except) == (-1)){
            delete(pathVars[key]);
        }
    });
};

Zotero.State.prototype.parseUrlVars = function(){
    Z.debug('Zotero.State.parseUrlVars', 3);
    var state = this;
    if(!state.useLocation) return;
    state.q = J.deparam(J.param.querystring());
    state.f = state.parseFragmentVars(); // J.deparam(J.param.fragment()),
    state.pathVars = state.parsePathVars();
};

Zotero.State.prototype.parsePathVars = function(pathname){
    Z.debug('Zotero.State.parsePathVars', 3);
    var state = this;
    var history = window.history;
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    if(!pathname){
        //var hstate = history.state;// History.getState();
        pathname = window.location.pathname
    }
    var basePath = Zotero.config.nonparsedBaseUrl;
    var split_replaced = [];
    var re = new RegExp(".*" + basePath + "\/?");
    var replaced = pathname.replace(re, '');
    
    split_replaced = replaced.split('/');
    
    var pathVars = {};
    for(var i=0; i<(split_replaced.length-1); i = i+2){
        var pathVar = pathVars[split_replaced[i]];
        //if var already present change to array and/or push
        if(pathVar){
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
            pathVar = decodeURIComponent(split_replaced[i+1]);
        }
        pathVars[split_replaced[i]] = pathVar;
    }
    if(pathVars['itemkey']){
        var itemKey = pathVars['itemkey'];
        pathVars['itemKey'] = itemKey;
        delete pathVars['itemkey'];
    }
    return pathVars;
};

Zotero.State.prototype.parseFragmentVars = function(){
    var state = this;
    var fragmentVars = {};
    var fragment = J.param.fragment();
    var split_fragment = fragment.split('/');
    for(var i=0; i<(split_fragment.length-1); i = i+2){
        fragmentVars[split_fragment[i]] = split_fragment[i+1];
    }
    return fragmentVars;
};

Zotero.State.prototype.buildUrl = function(urlvars, queryVars, fragmentVars){
    var state = this;
    //Z.debug("Zotero.State.buildUrl", 3);
    if(typeof fragmentVars === 'undefined') { fragmentVars = false;}
    if(typeof queryVars === 'undefined') { queryVars = false;}
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
    
    var queryVarsArray = [];
    J.each(queryVars, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                queryVarsArray.push(index + '=' + encodeURIComponent(v) );
            });
        }
        else{
            queryVarsArray.push(index + '=' + encodeURIComponent(value) );
        }
    });
    queryVarsArray.sort();
    
    var pathVarsString = urlVarsArray.join('/');
    var queryString = '';
    if(queryVarsArray.length){
        queryString = '?' + queryVarsArray.join("&");
    }
    var url = basePath + pathVarsString + queryString;
    
    return url;
};

//addvars is an object mapping keys and values to add
//removevars is an array of var keys to remove
Zotero.State.prototype.mutateUrl = function(addvars, removevars){
    var state = this;
    //Z.debug("Zotero.State.mutateUrl", 3);
    if(!addvars){
        addvars = {};
    }
    if(!removevars){
        removevars = [];
    }
    
    var urlvars = J.extend({}, state.pathVars);
    J.each(addvars, function(key, val){
        urlvars[key] = val;
    });
    J.each(removevars, function(index, val){
        delete urlvars[val];
    });
    
    var url = state.buildUrl(urlvars, false);
    //Z.debug("mutated Url:" + url, 3);
    
    return url;
};

Zotero.State.prototype.pushState = function(){
    Z.debug('Zotero.State.pushState', 3);
    var state = this;
    var history = window.history;
    
    Zotero.ui.saveFormData();
    //make prevHref the current location before we change it
    state.prevHref = state.curHref;// window.location.href;
    
    //selectively add state to hint where to go
    var s = J.extend({}, state.f, state.q, state.pathVars);
    
    var urlvars = state.pathVars;
    var queryVars = state.q;
    var url = state.buildUrl(urlvars, queryVars, false);
    state.curHref = url;
    Z.debug("about to push url: " + url, 3);
    //actually push state and manually call urlChangeCallback if specified
    if(state.useLocation){
        if(state.replacePush === true){
            Z.debug("Zotero.State.pushState - replacePush", 3);
            state.replacePush = false;
            history.replaceState(s, document.title, url);
        }
        else{
            Z.debug("Zotero.State.pushState - pushState", 3);
            history.pushState(s, document.title, url);
            state.stateChanged();
        }
    }
    else {
        state.stateChanged();
    }
    Zotero.debug("leaving pushstate", 3);
};

Zotero.State.prototype.replaceState = function(){
    Z.debug("Zotero.State.replaceState", 3);
    var state = this;
    var history = window.history;
    //TODO: figure out what correct behaviour for prevHref/curHref is here
    //I guess probably to just update current and leave prev alone.
    Zotero.ui.saveFormData();
    state.updateCurState();
    
    //selectively add state to hint where to go
    var s = J.extend({}, state.curState);
    var urlvars = state.pathVars;
    var url = state.buildUrl(urlvars, false);
    
    if(state.useLocation){
        history.replaceState(s, null, url);
        state.curHref = url;
    }
    else {
        state.curHref = url;
    }
};

Zotero.State.prototype.updateStateTitle = function(title){
    Zotero.debug("Zotero.State.updateStateTitle", 3);
    var state = this;
    
    document.title = title;
};

Zotero.State.prototype.getUrlVar = function(key){
    var state = this;
    if(state.pathVars.hasOwnProperty(key) && (state.pathVars[key] !== '')){
        return state.pathVars[key];
    }
    else if(state.f.hasOwnProperty(key)){
        return state.f[key];
    }
    else if(state.q.hasOwnProperty(key)){
        return state.q[key];
    }
    return undefined;
};

Zotero.State.prototype.setUrlVar = function(key, val){
    var state = this;
    state.pathVars[key] = val;
};

Zotero.State.prototype.getUrlVars = function(){
    var state = this;
    var params = J.deparam(J.param.querystring());
    return J.extend(true,{}, state.pathVars, params, J.deparam(J.param.fragment()));
};

Zotero.State.prototype.setFragmentVar = function(key, val){
    var state = this;
    state.f[key] = val;
};

Zotero.State.prototype.setQueryVar = function(key, val){
    var state = this;
    if(val === ''){
        delete state.q[key];
    }
    else{
        state.q[key] = val;
    }
};

Zotero.State.prototype.addQueryVar = function(key, val){
    var state = this;
    if(state.q.hasOwnProperty(key)){
        //property exists
        if(J.isArray(state.q[key])){
            state.q[key].push(val);
        }
        else{
            var newArray = [state.q[key], val];
            state.q[key] = newArray;
        }
    }
    else{
        //no value for that key yet
        state.q[key] = val;
    }
    return state.q[key];
};

Zotero.State.prototype.updateFragment = function(updatedVars){
    var state = this;
    Z.debug("updateFragment", 3);
    J.bbq.pushState(updatedVars, 0);
};

Zotero.State.prototype.popstateCallback = function(evt){
    var state = this;
    Z.debug("===== popstateCallback =====", 3);
    var history = window.history;
    state.prevHref = state.curHref;
    
    Z.debug("new href, updating href and processing urlchange", 3);
    state.curHref = window.location.href;// History.getState().cleanUrl;
    
    //reparse url to set vars in Z.ajax
    state.parseUrlVars();
    state.stateChanged(evt);
};

Zotero.State.prototype.stateChanged = function(event){
    var state = this;
    Z.debug("stateChanged", 3);
    state.savePrevState();
    state.updateCurState();
    //check for changed variables in the url and fire events for them
    Z.debug("Checking changed variables", 3);
    var changedVars = state.diffState(state.prevHref, state.curHref);
    var widgetEvents = {};
    J.each(changedVars, function(ind, val){
        var eventString = val + "Changed";
        Z.debug(eventString, 3);
        //map var events to widget events
        if(Zotero.eventful.eventMap.hasOwnProperty(eventString)){
            J.each(Zotero.eventful.eventMap[eventString], function(ind, val){
                if(!widgetEvents.hasOwnProperty(val)){
                    widgetEvents[val] = 1;
                }
            });
        }
        Z.debug("State Filter: " + state.filter, 3);
        Zotero.trigger(eventString, {}, state.filter);
    });
    //TODO: is this eventMap triggering necessary?
    
    J.each(widgetEvents, function(ind, val){
        Z.debug("State Filter: " + state.filter, 3);
        
        Zotero.trigger(ind, {}, state.filter);
    });
    
    Z.debug("===== stateChanged Done =====", 3);
};

Zotero.State.prototype.diffState = function(prevHref, curHref){
    Z.debug("Zotero.State.diffState", 3);
    var state = this;
    //check what has changed when a new state is pushed
    var prevVars = J.extend({}, state.parsePathVars(prevHref) );
    var curVars = J.extend({}, state.parsePathVars(curHref) );
    
    var monitoredVars = ['start',
                         'limit',
                         'order',
                         'sort',
                         'content',
                         'format',
                         'q',
                         'fq',
                         'itemType',
                         'itemKey',
                         'collectionKey',
                         'searchKey',
                         'locale',
                         'tag',
                         'tagType',
                         'key',
                         'style',
                         'session',
                         'newer',
                         'itemPage',
                         'mode'
                         ];
    var changedVars = [];
    J.each(monitoredVars, function(ind, val){
        if(prevVars.hasOwnProperty(val) || curVars.hasOwnProperty(val)){
            if(prevVars[val] != curVars[val]){
                changedVars.push(val);
            }
        }
    });
    
    return changedVars;
};

/**
 * Bind tag links to alter current state rather than following the link
 * @return {undefined}
 */
Zotero.State.prototype.bindTagLinks = function(container){
    var state = this;
    Z.debug("Zotero.State.bindTagLinks", 3);
    J(container).on('click', 'a.tag-link', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        //J("#tag-filter-input").val('');
        var tagtitle = J(this).attr('data-tagtitle');
        state.toggleTag(tagtitle);
        state.clearUrlVars(['tag', 'collectionKey']);
        state.pushState();
    });

};

/**
 * Bind item links to take alter current state instead of following link
 * @return {undefined}
 */
Zotero.State.prototype.bindItemLinks = function(container){
    Z.debug("Zotero.State.bindItemLinks", 3);
    var state = this;
    
    J(container).on('click', "a.item-select-link", function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        Z.debug("item-select-link clicked", 3);
        var itemKey = J(this).data('itemkey');
        state.pathVars.itemKey = itemKey;
        state.pushState();
    });
    J(container).on('click', 'td[data-itemkey]:not(.edit-checkbox-td)', function(e){
        e.preventDefault();
        Z.debug("item-select-td clicked", 3);
        var itemKey = J(this).data('itemkey');
        state.pathVars.itemKey = itemKey;
        state.pushState();
    });
};
