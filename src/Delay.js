'use strict';

//return a promise that will resolve after mseconds milliseconds
var Delay = function(mseconds){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, mseconds);
    });
};

module.exports = Delay;
