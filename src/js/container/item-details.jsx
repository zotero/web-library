/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../component/item/details');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { createItem, updateItem, deleteItem, fetchItemTemplate, fetchChildItems, uploadAttachment, fetchItems, fetchItemTypeCreatorTypes } = require('../actions');
const { itemProp, baseMappings } = require('../constants/item');
const { get, deduplicateByKey, mapRelationsToItemKeys, removeRelationByItemKey, reverseMap } = require('../utils');
const { makePath } = require('../common/navigation');
const withEditMode = require('../enhancers/with-edit-mode');
const withDevice = require('../enhancers/with-device');

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

	async handleItemUpdated(fieldKey, newValue) {
		const item = this.props.item;
		var patch = {
			[fieldKey]: newValue
		};

		// when changing itemType, map fields to base types and back to item-specific types
		if(fieldKey === 'itemType') {
			const baseValues = {};
			if(item.itemType in baseMappings) {
				const namedToBaseMap = reverseMap(baseMappings[item.itemType]);
				Object.keys(item).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						if(item[fieldName].toString().length > 0) {
							baseValues[namedToBaseMap[fieldName]] = item[fieldName];
						}
					}
				});
			}

			patch = { ...patch, ...baseValues };

			if(newValue in baseMappings) {
				const namedToBaseMap = baseMappings[newValue];
				const itemWithBaseValues = { ...item, ...baseValues };
				Object.keys(itemWithBaseValues).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						patch[namedToBaseMap[fieldName]] = itemWithBaseValues[fieldName];
						patch[fieldName] = '';
					}
				});
			}

			const targetTypeCreatorTypes = await this.props.dispatch(fetchItemTypeCreatorTypes(item.itemType));

			//convert item creators to match creators appropriate for this item type
			if(item.creators && Array.isArray(item.creators)) {
				for(var creator of item.creators) {
					if(typeof targetTypeCreatorTypes.find(c => c.creatorType === creator.creatorType) === 'undefined') {
						creator.creatorType = targetTypeCreatorTypes[0].creatorType;
					}
				}
			}
		}

		await this.props.dispatch(updateItem(item.key, patch));
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
		const { history, collection, libraryKey: library } = this.props;
		let isSameCollection = item.collections.includes(collection.key);
		if(isSameCollection) {
			history.push(makePath({ library, collection: collection.key, items: item.key }));
		} else {
			history.push(makePath({ library, items: item.key }));
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
		const { isEditing, device, item } = this.props;
		const isForm = !!(device.shouldUseEditMode && isEditing && item);
		const isReadOnlyMode = !!(device.shouldUseEditMode && !isEditing);
		const extraProps = { isForm, isReadOnlyMode };

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
				onSave = { this.handleItemUpdated.bind(this) }
				{ ...this.props }
				{ ...this.state }
				{ ...extraProps }
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
	const pendingChanges = get(state, ['libraries', libraryKey, 'updating', 'items', itemKey]) || [];

	return {
		pendingChanges,
		libraryKey,
		item,
		config: state.config,
		childItems,
		isProcessingTags,
		relations,
		collection: get(state, 'libraries', libraryKey, 'collections', collectionKey),
		itemsCount,
		selectedItemKeys: selectedItemKeys ? selectedItemKeys.split(',') : [],
	};
};

ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: itemProp,
	dispatch: PropTypes.func.isRequired
};

module.exports = withRouter(withDevice(withEditMode(connect(mapStateToProps)(ItemDetailsContainer))));
