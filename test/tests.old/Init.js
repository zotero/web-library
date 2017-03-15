'use strict';

var assert = require('chai').assert;
var should = require('chai').should();
var expect = require('chai').expect;
var Zotero = require('../../src/js/zotero-web-library.js');

//test Zotero initializes correctly
describe('Zotero.Init', function(){
	it('should have our expected objects attached to Zotero', function(){
		assert.isDefined(Zotero.State);
		assert.isDefined(Zotero.Delay);
		assert.isDefined(Zotero.Pages);
		assert.isDefined(Zotero.ui);
		assert.isDefined(Zotero.format);
		assert.isDefined(Zotero.eventful);
		assert.isDefined(Zotero.init);
		assert.isDefined(Zotero.ui);
		assert.isDefined(Zotero.url);
		assert.isDefined(Zotero.defaultPrefs);
	});
});