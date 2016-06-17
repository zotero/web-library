'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:ItemAttachments');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

var ItemAttachments = React.createClass({
	getDefaultProps: function() {
		return {
			attachments: []
		};
	},
	triggerUpload: function() {
		this.props.library.trigger('uploadAttachment');
	},
	selectItem: function(evt){
		evt.preventDefault();
		let reactInstance = this;
		let library = reactInstance.props.library;
		let itemKey = evt.target.getAttribute('data-itemkey');
		let selected = [itemKey];
		
		Zotero.state.selectedItemKeys = selected;
		Zotero.state.pathVars.itemKey = itemKey;
		Zotero.state.pushState();
		
		library.trigger('selectedItemsChanged', {selectedItemKeys: selected});
	},
	render: function() {
		log.debug('ItemAttachments render', 3);
		let reactInstance = this;
		let attachmentEntries = this.props.attachments.map(function(attachment){
			let title = attachment.get('title');
			let href = Zotero.url.itemHref(attachment);
			let iconClass = attachment.itemTypeIconClass();
			let key = attachment.get('key');
			if(attachment.attachmentDownloadUrl == false) {
				return (
					<li key={key}>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						{title}
						(<a data-itemkey={key} href={href} onClick={reactInstance.selectItem} title={title}>Attachment Details</a>)
					</li>
				);
			} else {
				let attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(attachment);
				return (
					<li key={key}>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						<a className='itemdownloadlink' href={attachmentDownloadUrl}>{title} {Zotero.url.attachmentFileDetails(attachment)}</a>
						(<a data-itemkey={key} href={href} onClick={reactInstance.selectItem} title={title}>Attachment Details</a>)
					</li>
				);
			}
		});
		return (
			<div id="item-attachments" role="tabpanel" className="item-attachments-div tab-pane">
				<ul id="attachments">
					{attachmentEntries}
				</ul>
				<button type="button" onClick={reactInstance.triggerUpload} id="upload-attachment-link" className="btn btn-primary upload-attachment-button" hidden={!Zotero.config.librarySettings.allowUpload}>Upload File</button>
			</div>
		);
	}
});

module.exports = ItemAttachments;
