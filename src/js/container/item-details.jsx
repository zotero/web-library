'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../component/item/details');
const { connect } = require('react-redux');
const { createItem, updateItem, deleteItem, fetchItemTemplate, fetchChildItems } = require('../actions');
const { itemProp } = require('../constants/item');
const { get, deduplicateByKey } = require('../utils');
const { getItem, getChildItems, isItemFieldBeingUpdated } = require('../state-utils');

class ItemDetailsContainer extends React.Component {
	componentWillReceiveProps(props) {
		const itemKey = get(props, 'item.key');
		if(itemKey && get(this.props, 'item.key') !== itemKey) {
			this.props.dispatch(fetchChildItems(itemKey));
		}
	}

	async handleNoteChange(key, note) {
		await this.props.dispatch(updateItem(key, { note }));
	}

	async handleAddNote(note = '') {
		const noteTemplate = await this.props.dispatch(fetchItemTemplate('note'));
		const item = {
			...noteTemplate,
			parentItem: this.props.item.key,
			note
		};
		await this.props.dispatch(createItem(item));
	}

	async handleDeleteNote(note) {
		await this.props.dispatch(deleteItem(note));
	}

	async handleAddTag(tag) {
		let patch = {
			tags: deduplicateByKey([...this.props.item.tags, { tag }], 'tag')
		};

		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleDeleteTag(tag) {
		let patch = {
			tags: [...this.props.item.tags.filter(t => t.tag != tag)]
		};

		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleUpdateTag(tag, newTag) {
		let patch = {
			tags: deduplicateByKey([
				...this.props.item.tags.filter(t => t.tag != tag), {
				tag: newTag
			}], 'tag')
		};
		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	render() {
		return <ItemDetails 
				onNoteChange={ this.handleNoteChange.bind(this) }
				onAddNote={ this.handleAddNote.bind(this) }
				onDeleteNote = { this.handleDeleteNote.bind(this) }
				onAddTag = { this.handleAddTag.bind(this) }
				onDeleteTag = { this.handleDeleteTag.bind(this) }
				onUpdateTag = { this.handleUpdateTag.bind(this) }
				{ ...this.props }
			/>;
	}
}

const mapStateToProps = state => {
	return {
		childItems: getChildItems(state) || [],
		isProcessingTags: isItemFieldBeingUpdated('tags', state),
		item: getItem(state) || {},
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: itemProp,
	dispatch: PropTypes.func.isRequired
};

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemDetailsContainer);