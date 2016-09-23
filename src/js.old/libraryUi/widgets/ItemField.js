'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemField');
var React = require('react');


var editMatches = function(props, edit) {
	if(props === null || edit === null){
		return false;
	}
	if(edit.field != props.field) {
		return false;
	}
	//field is the same, make sure index matches if set
	if(edit.creatorIndex != props.creatorIndex) {
		//log.debug("creatorIndex mismatch");
		return false;
	}
	if(props.tagIndex != edit.tagIndex) {
		//log.debug("tagIndex mismatch");
		return false;
	}
	return true;
};

//set onChange
var ItemField = React.createClass({
	getDefaultProps: function() {
		return {
			item:null,
			field:null,
			edit:null,
			creatorIndex: null,
			tagIndex: null
		};
	},
	handleChange: function(evt) {
		//set field to new value
		var item = this.props.item;
		switch(this.props.field) {
			case 'creatorType':
			case 'name':
			case 'firstName':
			case 'lastName':
				var creators = item.get('creators');
				var creator = creators[this.props.creatorIndex];
				creator[this.props.field] = evt.target.value;
				break;
			case 'tag':
				var tags = item.get('tags');
				var tag = tags[this.props.tagIndex];
				tag.tag = evt.target.value;
				break;
			default:
				item.set(this.props.field, evt.target.value);
		}
		this.props.parentItemDetailsInstance.setState({item:item});
	},
	handleBlur: function(evt) {
		//save item, move edit to next field
		this.handleChange(evt);
		this.props.parentItemDetailsInstance.setState({edit:null});
		Zotero.ui.saveItem(this.props.item);
	},
	handleFocus: function(evt) {
		var field = evt.currentTarget.getAttribute('data-field');
		var creatorIndex = evt.target.getAttribute('data-creatorindex');
		var tagIndex = evt.target.getAttribute('data-tagindex');
		var edit = {
			field: field,
			creatorIndex: creatorIndex,
			tagIndex: tagIndex
		};
		this.props.parentItemDetailsInstance.setState({
			edit: edit
		});
	},
	checkKey: function(evt) {
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER){
			//var nextEdit = Zotero.ui.widgets.reactitem.nextEditField(this.props.item, this.props.edit);
			evt.target.blur();
		}
	},
	render: function(){
		var item = this.props.item;
		var field = this.props.field;
		var creatorField = false;
		var tagField = false;
		var value;
		switch(field){
			case 'creatorType':
			case 'name':
			case 'firstName':
			case 'lastName':
				creatorField = true;
				var creatorIndex = this.props.creatorIndex;
				var creator = item.get('creators')[creatorIndex];
				value = creator[field];
				var creatorPlaceHolders = {
					'name': '(name)',
					'lastName': '(Last Name)',
					'firstName': '(First Name)'
				};
				
				break;
			case 'tag':
				tagField = true;
				var tagIndex = this.props.tagIndex;
				var tag = item.get('tags')[tagIndex];
				value = tag.tag;
				break;
			default:
				value = item.get(field);
		}

		var editThisField = editMatches(this.props, this.props.edit);
		if(!editThisField){
			var spanProps = {
				className: 'editable-item-field',
				tabIndex: 0,
				'data-field': field,
				onFocus: this.handleFocus
			};

			var p = null;
			if(creatorField){
				spanProps.className += ' creator-field';
				spanProps['data-creatorindex'] = this.props.creatorIndex;
				p = value == '' ? creatorPlaceHolders[field] : value;
			} else if(tagField){
				spanProps.className += ' tag-field';
				spanProps['data-tagindex'] = this.props.tagIndex;
				p = value;
			} else {
				p = value == '' ? (<div className="empty-field-placeholder"></div>) : Zotero.format.itemField(field, item);
			}
			return (
				<span {...spanProps}>
					{p}
				</span>
			);
		}
		
		var focusEl = function(el) {
			if (el != null) {
				el.focus();
			}
		};

		var inputProps = {
			className: ('form-control item-field-control ' + this.props.field),
			name: field,
			defaultValue: value,
			//onChange: this.handleChange,
			onKeyDown: this.checkKey,
			onBlur: this.handleBlur,
			creatorindex: this.props.creatorIndex,
			tagindex: this.props.tagIndex,
			ref: focusEl
		};
		if(creatorField){
			inputProps.placeholder = creatorPlaceHolders[field];
		}

		switch(this.props.field) {
			case null:
				return null;
				break;
			case 'itemType':
				var itemTypeOptions = item.itemTypes.map(function(itemType){
					return (
						<option key={itemType.itemType}
							label={itemType.localized}
							value={itemType.itemType}>
							{itemType.localized}
						</option>
					);
				});
				return (
					<select {...inputProps}>
						{itemTypeOptions}
					</select>
				);
				break;
			case 'creatorType':
				var creatorTypeOptions = item.creatorTypes[item.get('itemType')].map(function(creatorType){
					return (
						<option key={creatorType.creatorType}
							label={creatorType.localized}
							value={creatorType.creatorType}
						>
							{creatorType.localized}
						</option>
					);
				});
				return (
					<select id="creatorType" {...inputProps} data-creatorindex={this.props.creatorIndex}>
						{creatorTypeOptions}
					</select>
				);
				break;
			default:
				if(Zotero.config.largeFields[this.props.field]) {
					return (
						<textarea {...inputProps}></textarea>
					);
				} else if (Zotero.config.richTextFields[this.props.field]) {
					return (
						<textarea {...inputProps} className="rte default"></textarea>
					);
				} else {
					//default single line input field
					return (
						<input type='text' {...inputProps} />
					);
				}
		}
	}
});

module.exports = ItemField;
