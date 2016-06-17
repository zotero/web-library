'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:ItemRelated');
var React = require('react');


var ItemRelated = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	addRelated: function(evt){
		let item = this.props.item;
		
	},
	render:function(){
		let item = this.props.item;
		if(item == null) {
			return (
				<div id="item-related" role="tabpanel" className="item-related-div tab-pane">
				</div>
			);
		}
		
		/*
		let related = item.get('related');
		let numRelated = related.length;
		*/
		let numRelated = 0;
		return (
			<div id="item-related" role="tabpanel" className="item-related-div tab-pane">
				<div>
					<span id="related-count">{numRelated} related:</span><button type="button" className='btn btn-default' onClick={this.addRelated}>Add</button>
				</div>
				
			</div>
		);
	}
});

module.exports = ItemRelated;
