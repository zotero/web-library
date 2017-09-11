'use strict';

module.exports = async (ms = 1) => new Promise(resolve => { setTimeout(resolve, ms); });