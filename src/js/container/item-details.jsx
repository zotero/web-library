'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../component/item/details');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { createItem, updateItem, deleteItem, fetchItemTemplate, fetchChildItems, uploadAttachment, fetchItems } = require('../actions');
const { itemProp } = require('../constants/item');
const { get, deduplicateByKey, mapRelationsToItemKeys } = require('../utils');
const { getItem, getChildItems, isItemFieldBeingUpdated, getRelatedItems, getCollection } = require('../state-utils');

class ItemDetailsContainer extends React.Component {
	state = {
		apiAuthorityPart: {}
	}

	componentWillReceiveProps(props) {
		const itemKey = get(props, 'item.key');
		if(itemKey 
			&& get(this.props, 'item.key') !== itemKey 
			&& !['attachment', 'note'].includes(props.item.itemType)) {
			this.props.dispatch(fetchChildItems(itemKey));
		}

		if(itemKey && get(this.props, 'item.key') !== itemKey) {
			let relatedItemKeys = mapRelationsToItemKeys(props.item.relations, props.config.userId);

			if(relatedItemKeys.length) {
				this.props.dispatch(fetchItems(relatedItemKeys));
			}
		}

		if(props.childItems != this.props.childItems) {
			const attachentViewUrls = props.childItems
				.filter(i => i.itemType === 'attachment')
				.reduce((aggr, item) => {
					// @TODO: url should not include the key
					let config = props.config;
					let baseUrl = config.apiConfig.apiAuthorityPart;
					aggr[item.key] = `https://${baseUrl}/users/${config.userId}/items/${item.key}/file/view?key=${config.apiKey}`;
					return aggr;
			}, {});
			this.setState({ attachentViewUrls });
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

	async handleAddAttachment(fileData) {
		const attachmentTemplate = await this.props.dispatch(fetchItemTemplate('attachment', { linkMode: 'imported_file' }));
		const attachment = {
			...attachmentTemplate,
			parentItem: this.props.item.key,
			filename: fileData.fileName,
			contentType: fileData.contentType
		};
		let item = await this.props.dispatch(createItem(attachment));
		await this.props.dispatch(uploadAttachment(item.key, fileData));
	}

	async handleDeleteAttachment(attachment) {
		await this.props.dispatch(deleteItem(attachment));
	}

	handleRelatedItemSelected(item) {
		let isSameCollection = item.collections.includes(this.props.collection.key);
		if(isSameCollection) {
			this.props.history.push(`/collection/${this.props.collection.key}/item/${item.key}`);
		} else {
			this.props.history.push(`/item/${item.key}`);
		}
	}

	render() {
		return <ItemDetails 
				onNoteChange={ this.handleNoteChange.bind(this) }
				onAddNote={ this.handleAddNote.bind(this) }
				onDeleteNote = { this.handleDeleteNote.bind(this) }
				onAddTag = { this.handleAddTag.bind(this) }
				onDeleteTag = { this.handleDeleteTag.bind(this) }
				onUpdateTag = { this.handleUpdateTag.bind(this) }
				onAddAttachment = { this.handleAddAttachment.bind(this) }
				onDeleteAttachment = { this.handleDeleteAttachment.bind(this) }
				onRelatedItemSelected = { this.handleRelatedItemSelected.bind(this) }
				{ ...this.props }
				{ ...this.state }
			/>;
	}
}

const mapStateToProps = state => {
	return {
		config: state.config,
		childItems: getChildItems(state) || [],
		isProcessingTags: isItemFieldBeingUpdated('tags', state),
		item: getItem(state) || {},
		relations: getRelatedItems(state) || [],
		collection: getCollection(state)
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

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemDetailsContainer));