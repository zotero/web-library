'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:ItemNotes');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

var ItemNotes = React.createClass({
	getDefaultProps: function() {
		return {
			notes: []
		};
	},
	addNote: function() {
		log.warn('not implemented');
	},
	render: function() {
		log.debug('ItemNotes render', 3);
		let numNotes = this.props.notes.length;
		let noteCountString = numNotes == 1 ? 'note' : 'notes';

		let noteEntries = this.props.notes.map(function(note){
			let title = note.get('title');
			let href = Zotero.url.itemHref(note);
			let iconClass = note.itemTypeIconClass();
			let key = note.get('key');
			return (
				<li key={key}>
					<span className={'fonticon barefonticon ' + iconClass}></span>
					<a className='item-select-link' data-itemkey={key} href={href} title={title}>{title}</a>
				</li>
			);
		});
		return (
			<div id="item-notes" role="tabpanel" className="item-notes-div tab-pane">
				<div>
					<span id="note-count">{numNotes} {noteCountString}</span><button type="button" className='btn btn-default' onClick={this.addNote}>Add</button>
				</div>
				<ul id="notes">
					{noteEntries}
				</ul>
			</div>
		);
	}
});

module.exports = ItemNotes;
