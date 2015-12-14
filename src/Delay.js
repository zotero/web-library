//return a promise that will resolve after mseconds milliseconds
Zotero.Delay = function(mseconds){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, mseconds);
    });
};
