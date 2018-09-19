/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../component/item/details');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { createItem, updateItem, deleteItem, fetchItemTemplate, fetchChildItems, uploadAttachment, fetchItems } = require('../actions');
const { itemProp } = require('../constants/item');
const { get, deduplicateByKey, mapRelationsToItemKeys, removeRelationByItemKey } = require('../utils');

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
			let relatedItemKeys = mapRelationsToItemKeys(
				props.item.relations,
				props.config.userId
			).filter(String);

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
		let tags = [...this.props.item.tags, { tag }];
		deduplicateByKey(tags, 'tag');
		let patch = { tags };

		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleDeleteTag(tag) {
		let patch = {
			tags: [...this.props.item.tags.filter(t => t.tag != tag)]
		};

		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleUpdateTag(tag, newTag) {
		let tags = [
			...this.props.item.tags.filter(t => t.tag != tag), {
			tag: newTag
		}];
		deduplicateByKey(tags, 'tag');
		let patch = { tags };
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

	handleRelatedItemSelect(item) {
		let isSameCollection = item.collections.includes(this.props.collection.key);
		if(isSameCollection) {
			this.props.history.push(`/collection/${this.props.collection.key}/items/${item.key}`);
		} else {
			this.props.history.push(`/items/${item.key}`);
		}
	}

	async handleRelatedItemDelete(relatedItem) {
		let patch1 = {
			relations: removeRelationByItemKey(
				relatedItem.key,
				this.props.item.relations,
				this.props.config.userId
			)
		};

		let patch2 = {
			relations: removeRelationByItemKey(
				this.props.item.key,
				relatedItem.relations,
				this.props.config.userId
			)
		};

		await Promise.all([
			this.props.dispatch(updateItem(this.props.item.key, patch1)),
			this.props.dispatch(updateItem(relatedItem.key, patch2)),
		]);
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
				onRelatedItemSelect = { this.handleRelatedItemSelect.bind(this) }
				onRelatedItemDelete = { this.handleRelatedItemDelete.bind(this) }
				{ ...this.props }
				{ ...this.state }
			/>;
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemsSource = state.current.itemsSource;
	const collectionKey = state.current.collection;
	const itemKey = state.current.item;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], {});
	const childItems = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey], [])
			.map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const isProcessingTags = get(state,
		['libraries', libraryKey, 'updating', 'items', itemKey], []
	).some(({ patch }) => 'tagd' in patch);
	const relations = item.relations ?
		mapRelationsToItemKeys(item.relations, state.config.userId)
			.map(key => get(state, ['libraries', libraryKey, 'items', key]))
			.filter(item => item !== null) : [];
	const isEditing = state.current.editing === item.key;

	var itemsCount;

	switch(itemsSource) {
		case 'query':
			itemsCount = state.queryItemCount;
		break;
		case 'top':
			itemsCount = get(state, ['itemCountTopByLibrary', libraryKey], null);
		break;
		case 'trash':
			itemsCount = get(state, ['itemCountTrashByLibrary', libraryKey], null);
		break;
		case 'collection':
			itemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey], null)
		break;
	}

	const selectedItemKeys = get(state, 'router.params.items');

	return {
		item,
		config: state.config,
		childItems,
		isProcessingTags,
		relations,
		collection: get(state, 'libraries', libraryKey, 'collections', collectionKey),
		itemsCount,
		selectedItemKeys: selectedItemKeys ? selectedItemKeys.split(',') : [],
		isEditing
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
