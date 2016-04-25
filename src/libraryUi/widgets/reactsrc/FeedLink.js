'use strict';

var log = require('../../../Log.js').Logger('zotero-web-library:feedLink');

var React = require('react');

var FeedLink = React.createClass({
	render: function() {
		var library = this.props.library;
		var urlconfig = Zotero.ui.getItemsConfig(library);
		var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
		var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
		var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
		var feedHref;
		if(!Zotero.config.librarySettings.publish){
			feedHref = newkeyurl;
		} else {
			feedHref = feedUrl;
		}

		return (
			<p>
				<a href={feedHref} type="application/atom+xml" rel="alternate" className="feed-link">
					<span className="sprite-icon sprite-feed"></span>Subscribe to this feed
				</a>
			</p>
		);
	}
});

module.exports = FeedLink;
