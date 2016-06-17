'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:ItemTags');
var React = require('react');
var ItemField = require('./ItemField.js');

var ItemTags = React.createClass({
	getInitialState: function() {
		return {
			newTagString: ''
		};
	},
	newTagChange: function(evt) {
		this.setState({newTagString: evt.target.value});
	},
	//add the new tag to the item and save if keydown is ENTER
	checkKey: function(evt) {
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER){
			var item = this.props.item;
			var tags = item.get('tags');
			tags.push({
				tag: evt.target.value
			});
			Zotero.ui.saveItem(item);
			this.setState({newTagString:''});
			this.props.parentItemDetailsInstance.setState({item:item});
		}
	},
	render: function() {
		log.debug('ItemTags render', 3);
		var reactInstance = this;
		var item = this.props.item;
		if(item == null) {
			return (
				<div id="item-tags" role="tabpanel" className="item-tags-div tab-pane">
				</div>
			);
		}
		
		var tagRows = item.apiObj.data.tags.map(function(tag, ind){
			return (
				<TagListRow key={tag.tag} {...reactInstance.props} tag={tag} tagIndex={ind} />
			);
		});
		
		return (
			<div id="item-tags" role="tabpanel" className="item-tags-div tab-pane">
				<p><span className="tag-count">{item.get('tags').length}</span> tags</p>
				<button className="add-tag-button btn btn-default">Add Tag</button>
				
				<div className="item-tags-list">
					{tagRows}
				</div>
				<div className="add-tag-form form-horizontal">
					<div className="form-group">
						<div className="col-xs-1">
							<label htmlFor="add-tag-input"><span className="glyphicons fonticon glyphicons-tag"></span></label>
						</div>
						<div className="col-xs-11">
							<input type="text" onKeyDown={this.checkKey} onChange={this.newTagChange} value={this.state.newTagString} id="add-tag-input" className="add-tag-input form-control" />
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var TagListRow = React.createClass({
	getDefaultProps: function(){
		return {
			tagIndex:0,
			tag:{tag:''},
			item:null,
			library:null,
			edit:null
		};
	},
	removeTag: function(evt) {
		var tag = this.props.tag.tag;
		var item = this.props.item;
		var tagIndex = this.props.tagIndex;

		var tags = item.get('tags');
		tags.splice(tagIndex, 1);
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({item:item});
	},
	render: function() {
		return (
			<div className="row item-tag-row">
				<div className="col-xs-1">
					<span className="glyphicons fonticon glyphicons-tag"></span>
				</div>
				<div className="col-xs-9">
					<ItemField {... this.props} field="tag" />
				</div>
				<div className="col-xs-2">
					<button type="button" className="remove-tag-link btn btn-default" onClick={this.removeTag} >
						<span className="glyphicons fonticon glyphicons-minus"></span>
					</button>
				</div>
			</div>
		);
	}
});

module.exports = ItemTags;
