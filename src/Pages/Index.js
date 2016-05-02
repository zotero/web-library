'use strict';

var log = require('../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Pages:Index');
var BrowserDetect = require('../BrowserDetect.js');
			
var Index = {
	index_index: {
	},
	
	
	index_start: {
		init: function() {
			// Fit the iFrame to the window
			Zotero.pages.index_start.sizeIframe();

			// Resize the iframe when the window is resized
			J(window).resize(Zotero.pages.index_start.sizeIframe);
			
			// Change the iframe src
			J('.start-select').click(function(){
				J('iframe').attr('src', J(this).attr('href'));
				return false;
			});
			
			J('.start-show-overlay').click(function(){
				J('#start-overlay').show();
				return false;
			});
			
			J('.start-hide-overlay').click(function(){
				J('#start-overlay').hide();
				return false;
			});
			
			Zotero.pages.user_register.init();
		},
		// Resize the height of the iframe to fill the page
		sizeIframe: function() {
			J('iframe').css('height', J(window).height() - 144);
		}
	},
	
	index_startstandalone: {
		init: function() {
			var browsername = BrowserDetect.browser;
			switch(browsername){
				case 'Chrome':
					J('#chrome-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
					break;
				case 'Safari':
					J('#safari-connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
					break;
				case 'Firefox':
					J('#firefox-connector-message').closest('li').detach().prependTo('#recommended-download > ul');
					break;
				default:
					J('#connector-download-button').closest('li').detach().prependTo('#recommended-download > ul');
					J('#other-connectors-p').hide();
			}
			J('#recommended-download > ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
			
			Zotero.pages.user_register.init();
		}
	},
	
	index_download: {
		init: function() {
			var browsername = BrowserDetect.browser;
			var os = BrowserDetect.OS;
			var arch = (navigator.userAgent.indexOf('x86_64') != -1) ? 'x86_64' : 'x86';
			
			if(os == 'Windows'){
				J('#standalone-windows-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
			}
			else if(os == 'Mac'){
				J('#standalone-mac-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
			}
			else if(os == 'Linux'){
				if(arch == 'x86_64'){
					J('#standalone-linux64-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
				}
				else {
					J('#standalone-linux32-download-button').closest('li').clone().prependTo('#recommended-client-download ul');
				}
			}
			
			J('#recommended-connector-download').show();
			switch(browsername){
				case 'Chrome':
					J('#chrome-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
					break;
				case 'Safari':
					J('#safari-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
					break;
				case 'Firefox':
					J('#firefox-connector-download-button').addClass('recommended-download').closest('li').detach().prependTo('#recommended-connector-download ul');
					break;
				default:
					J('#connector-download-button').closest('li').clone().prependTo('#recommended-connector-download ul');
					J('#other-connectors-p').hide();
			}
			J('#recommended-download ul').prepend('<li><p>Zotero Connectors allow you to save to Zotero directly from your web browser.</p></li>');
		}
	},
	
	index_bookmarklet: {
		init: function(){
			J('.bookmarklet-instructions').hide();
			var section = J('#bookmarklet-tabs li.selected').data('section');
			J('#' + section + '-bookmarklet-div').show();
			
			J('#bookmarklet-tabs li').on('click', function(e){
				log.debug('bookmarklet tab clicked', 3);
				J('#bookmarklet-tabs li.selected').removeClass('selected');
				J(this).addClass('selected');
				var section = J(this).data('section');
				J('.bookmarklet-instructions').hide();
				J('#' + section + '-bookmarklet-div').show();
			});
		}
	}
};

module.exports = Index;
