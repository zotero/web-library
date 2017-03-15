'use strict';

var assert = require('chai').assert;
var should = require('chai').should();
var expect = require('chai').expect;

var Zotero = require('../../src/js/zotero-web-library.js');

var item1json = require('libzotero/test/fixtures/item1.json');
var item1 = new Zotero.Item(item1json);

//test Zotero initializes correctly
describe('Zotero.format', function(){
	describe('trimString', function(){
		it('should do nothing if string is shorter than maxlen', function(){
			let t = Zotero.format.trimString('3D virtual worlds as collaborative communities', 60);
			assert.equal(t, '3D virtual worlds as collaborative communities');
		});

		it('should truncate to maxlen and add ellipsis if longer than maxlen', function(){
			let t = Zotero.format.trimString(item1.get('title'), 60);
			assert.equal(t, '3D virtual worlds as collaborative communities enriching hum…');
		});
	});

	describe('itemField', function(){
		it('should format title trimmed to config length', function(){
			let title = Zotero.format.itemField('title', item1, true);
			assert.equal(title, '3D virtual worlds as collaborative communities enriching hum…');
			assert.lengthOf(title, 61);
		});

		it('should not trim the field when trim=false', function(){
			let title = Zotero.format.itemField('title', item1, false);
			assert.equal(title, '3D virtual worlds as collaborative communities enriching human endeavours: Innovative applications in e-Learning');
		});

		it('should format non-title trimmed to 35 since they are not set in config', function(){
			let confName = Zotero.format.itemField('conferenceName', item1, true);
			assert.equal(confName, '2009 3rd IEEE International Confere…');
			assert.lengthOf(confName, 36);
		});

		it('should not trim non-title when trim=false', function(){
			let confName = Zotero.format.itemField('conferenceName', item1, false);
			assert.equal(confName, '2009 3rd IEEE International Conference on Digital Ecosystems and Technologies (DEST)');
		});

		it('should get the creator summary when passed either creator or creatorSummary', function(){
			let creator = Zotero.format.itemField('creator', item1);
			let creatorSummary = Zotero.format.itemField('creatorSummary', item1);
			assert.equal(creator, creatorSummary);
			assert.equal(creator, item1.get('creatorSummary'));
		});

		//this probably breaks if you're not in EST
		it.skip('should format dates according to the Intl options we\'ve chosen', function(){
			//2010-09-10T03:43:56Z
			//EST -> 9/9/2010, 23:43:56
			let dateAdded = Zotero.format.itemField('dateAdded', item1);
			assert.equal('9/9/2010, 23:43:56', dateAdded);
		});
		it('should format dates according to the Intl options we\'ve chosen', function(){
			//2010-09-10T03:43:56Z
			//EST -> 9/9/2010, 23:43:56
			let dateAdded = Zotero.format.itemField('dateAdded', item1);
			assert.match(dateAdded, /^[0-9]+\/[0-9]+\/[0-9]{4}, [0-9]{2}:[0-9]{2}:[0-9]{2}$/);
		});

		it('should get non special cased fields and pass to trim untouched', function(){
			let url = Zotero.format.itemField('url', item1);
			assert.equal('http://ieeexplore.ieee.org/lpdocs/epic03/wrapper.htm?arnumber=5276761', url);
		});
	});
});