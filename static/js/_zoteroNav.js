Zotero.nav = {};

Zotero.nav.urlvars = {q:{},
                       f:{},
                       pathVars:{},
                       startUrl:''
                       };

Zotero.nav.replacePush = false;

Zotero.nav.startUrl = '';
//keep track of where we came from
//update prevHref before history.pushState so we know what changed
//update curHref when we get a popState event
//difference between those two is what we need to look at to know what we should update
Zotero.nav.currentHref = '';
Zotero.nav.prevHref = '';

//state holder that will keep "current" state separate from History so we can check for updates on popstate
//"current" here amounts to the state actually represented in the loaded page, so it will be updated after
//events fire for a browser state change
Zotero.nav.curState = {};
Zotero.nav.prevState = {};

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
        Zotero.nav.urlvars.pathVars['tag'] = [tagtitle];
        return;
    }
    else if(J.isArray(Zotero.nav.urlvars.pathVars['tag'])) {
        if(J.inArray(tagtitle, Zotero.nav.urlvars.pathVars['tag']) != (-1) ){
            var newTagArray = Zotero.nav.urlvars.pathVars['tag'].filter(function(element, index, array){
                return element != tagtitle;
            });
            Zotero.nav.urlvars.pathVars['tag'] = newTagArray;
            return;
        }
        else{
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
    if(!except){
        except = [];
    }
    var pathVars = Zotero.nav.urlvars.pathVars;
    J.each(pathVars, function(key, value){
        if(J.inArray(key, except) == (-1)){
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
    var history = window.history;
    //parse variables out of library urls
    //:userslug/items/:itemKey/*
    //:userslug/items/collection/:collectionKey
    //groups/:groupidentifier/items/:itemKey/*
    //groups/:groupidentifier/items/collection/:collectionKey/*
    if(!pathname){
        var state = history.state;// History.getState();
        pathname = window.location.pathname
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
    if(pathVars['itemkey']){
        var itemKey = pathVars['itemkey'];
        pathVars['itemKey'] = itemKey;
        delete pathVars['itemkey'];
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
    var history = window.history;
    
    Zotero.ui.saveFormData();
    //make prevHref the current location before we change it
    Zotero.nav.prevHref = window.location.href;
    
    //selectively add state to hint where to go
    var s = {};
    if(state){
        s = state;
    }
    
    urlvars = Zotero.nav.urlvars.pathVars;
    
    var url = Zotero.nav.buildUrl(urlvars, false);
    Z.debug("about to push url: " + url, 3);
    //actually push state and manually call urlChangeCallback if specified
    if(Zotero.nav.replacePush === true){
        Z.debug("Zotero.nav.pushState - replacePush", 3);
        Zotero.nav.replacePush = false;
        history.replaceState(s, document.title, url);
    }
    else{
        Z.debug("Zotero.nav.pushState - pushState", 3);
        history.pushState(s, document.title, url);
        J(window).trigger('popstate');
    }
    
    if(force){
        Zotero.nav.urlChangeCallback({type:'popstate', originalEvent:{state:urlvars}} );
    }
    
    //trigger popstate so statechange gets called
    Zotero.debug("leaving pushstate", 3);
};

Zotero.nav.replaceState = function(force, state){
    Z.debug("Zotero.nav.replaceState", 3);
    var history = window.history;
    //TODO: figure out what correct behaviour for prevHref/curHref is here
    //I guess probably to just update current and leave prev alone.
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
    
    var url = Zotero.nav.buildUrl(urlvars, false);
    
    history.replaceState(s, null, url);
    Zotero.nav.currentHref = window.location.href;
};

Zotero.nav.updateStateTitle = function(title){
    Zotero.debug("Zotero.nav.updateStateTitle", 3);
    
    document.title = title;
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

Zotero.nav.urlChangeCallback = function(event){
    //Zotero.enableLogging();
    Z.debug("////////////////////urlChangeCallback//////////////////", 3);
    //var state = event.state;
    var history = window.history;
    Zotero.nav.prevHref = Zotero.nav.currentHref;
    
    Z.debug("new href, updating href and processing urlchange", 3);
    Zotero.nav.currentHref = window.location.href;// History.getState().cleanUrl;
    
    //reparse url to set vars in Z.ajax
    Zotero.nav.parseUrlVars();
    
    //check for changed variables in the url and fire events for them
    Z.debug("Checking changed variables", 3);
    var changedVars = Zotero.nav.diffState(Zotero.nav.prevHref, Zotero.nav.curHref);
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
        Zotero.ui.eventful.trigger(eventString);
    });
    J.each(widgetEvents, function(ind, val){
        Zotero.ui.eventful.trigger(ind);
    });
    
    //events taken care of, so update curState
    //TODO: this used to be down here for a reason - figure out if still relevant or setting at top
    //is fine?
    //Zotero.nav.curState = history.state;// History.getState();
    //Zotero.nav.currentHref = window.location.href;
    Z.debug("<<<<<<<<<<<<<<<<<<<<<<<<urlChangeCallback Done>>>>>>>>>>>>>>>>>>>>>", 3);
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

Zotero.nav.diffState = function(prevHref, curHref){
    Z.debug("Zotero.nav.diffState", 3);
    //check what has changed when a new state is pushed
    var prevVars = J.extend({}, Zotero.nav.parsePathVars(prevHref) );
    var curVars = J.extend({}, Zotero.nav.parsePathVars(curHref) );
    
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

//function bound to history state changes that we trigger on pushState and popstate
Zotero.nav.stateChangeCallback = function(event){
    Z.debug("stateChangeCallback", 3);
    Zotero.nav.urlChangeCallback(event);
};

//set error handler
J(document).ajaxError(Zotero.nav.error);
