'use strict';

var assert = require('chai').assert;
var should = require('chai').should();
var expect = require('chai').expect;
var Zotero = require('../../src/js/zotero-web-library.js');

Zotero.config.baseWebsiteUrl = 'zotero.org';

var privateGroup = new Zotero.Group({
	'data': {
        'id': 2,
        'version': 1,
        'name': 'Panda',
        'owner': 14058,
        'type': 'Private'
    }
});

var publicGroup = new Zotero.Group({
	'data': {
        'id': 2,
        'version': 1,
        'name': 'Panda',
        'owner': 14058,
        'type': 'PublicClosed'
    }
});

//test Zotero initializes correctly
describe('Zotero.url', function(){
	it('should generate the urls for various group locations', function(){
		assert.equal('zotero.org/groups/2', Zotero.url.groupViewUrl(privateGroup));
		assert.equal('zotero.org/groups/panda', Zotero.url.groupViewUrl(publicGroup));
		
		assert.equal('zotero.org/groups/2/items', Zotero.url.groupLibraryUrl(privateGroup));
		assert.equal('zotero.org/groups/panda/items', Zotero.url.groupLibraryUrl(publicGroup));
		
		assert.equal('zotero.org/groups/2/settings', Zotero.url.groupSettingsUrl(privateGroup));
		assert.equal('zotero.org/groups/2/settings', Zotero.url.groupSettingsUrl(publicGroup));
		
		assert.equal('zotero.org/groups/2/settings/members', Zotero.url.groupMemberSettingsUrl(privateGroup));
		assert.equal('zotero.org/groups/2/settings/members', Zotero.url.groupMemberSettingsUrl(publicGroup));
		
		assert.equal('zotero.org/groups/2/settings/library', Zotero.url.groupLibrarySettingsUrl(privateGroup));
		assert.equal('zotero.org/groups/2/settings/library', Zotero.url.groupLibrarySettingsUrl(publicGroup));
	});

	it('should generate website urls to request an api key with various permissions', function(){
		assert.equal('zotero.org/settings/keys/new?name=Private%20Feed&library_access=1&notes_access=1&redirect=redirect.com',
			Zotero.url.requestReadApiKeyUrl('user', 10, 'redirect.com')
		);
	});
});