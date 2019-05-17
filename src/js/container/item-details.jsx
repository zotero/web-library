'use strict';

import baseMappings from 'zotero-base-mappings';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import ItemDetails from '../component/item/details';
import Types from '../types';
import { makePath } from '../common/navigation';

import {
    createItem,
    updateItem,
    deleteItem,
    fetchItemTemplate,
    fetchChildItems,
    uploadAttachment,
    fetchItems,
    fetchItemTypeCreatorTypes,
    fetchItemTypeFields,
} from '../actions';

import { hideFields, noEditFields, extraFields } from '../constants/item';

import {
    get,
    deduplicateByKey,
    mapRelationsToItemKeys,
    removeRelationByItemKey,
    reverseMap,
} from '../utils';

import { getFieldDisplayValue } from '../common/item';
import withEditMode from '../enhancers/with-edit-mode';
import withDevice from '../enhancers/with-device';
const PAGE_SIZE = 100;

class ItemDetailsContainer extends React.PureComponent {
	async componentDidUpdate() {
		const { childItems, device, fetchChildItems, item, isLoadingChildItems,
			shouldFetchMeta, totalChildItems, dispatch } = this.props;

		if(item && item.key) {
			const hasMoreItems = totalChildItems > childItems.length ||
				typeof(totalChildItems) === 'undefined';
			const start = childItems.length;
			const limit = PAGE_SIZE;

			if(shouldFetchMeta) {
				dispatch(fetchItemTypeCreatorTypes(item.itemType));
				dispatch(fetchItemTypeFields(item.itemType));
			}

			if(!device.shouldUseTabs && hasMoreItems && !isLoadingChildItems) {
				fetchChildItems(item.key, { start, limit })
			}
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
		await this.props.dispatch(createItem(item, this.props.libraryKey));
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
		let item = await this.props.dispatch(createItem(attachment, this.props.libraryKey));
		await this.props.dispatch(uploadAttachment(item.key, fileData));
	}

	async handleDeleteAttachment(attachment) {
		await this.props.dispatch(deleteItem(attachment));
	}

	handleRelatedItemSelect(item) {
		const { collection, libraryKey: library, makePath, push } = this.props;
		let isSameCollection = item.collections.includes(collection.key);
		if(isSameCollection) {
			push(makePath({ library, collection: collection.key, items: item.key }))
		} else {
			push(makePath({ library, items: item.key }));
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
		const { isEditing, device, item, isLoadingMeta, isLibraryReadOnly, itemTypeFields,
			itemTypes, pendingChanges } = this.props;
		const isForm = !!(device.shouldUseEditMode && isEditing && item);
		const isReadOnly = isLibraryReadOnly || !!(device.shouldUseEditMode && !isEditing);
		const extraProps = { isForm, isReadOnly };

		if(!isLoadingMeta) {
			const titleField = item.itemType in baseMappings && baseMappings[item.itemType]['title'] || 'title';
			const aggregatedPatch = pendingChanges.reduce(
				(aggr, { patch }) => ({...aggr, ...patch}), {}
			);
			const itemWithPendingChnages = { ...item, ...aggregatedPatch};
			const fields = [
				{ field: 'itemType', localized: 'Item Type' },
				itemTypeFields[item.itemType].find(itf => itf.field === titleField),
				{ field: 'creators', localized: 'Creators' },
				...itemTypeFields[item.itemType].filter(itf => itf.field !== titleField),
				...extraFields
			]
			.filter(e => e)
			.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				isReadOnly: isReadOnly ? true : noEditFields.includes(f),
				processing: pendingChanges.some(({ patch }) => f.field in patch),
				display: getFieldDisplayValue(itemWithPendingChnages, f.field),
				value: itemWithPendingChnages[f.field] || null
			})).filter(f => !hideFields.includes(f.key)); //filter out undefined
			extraProps['fields'] = fields;
		}

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
	const {
		collectionKey,
		isSelectMode,
		itemKey,
		itemKeys,
		itemsSource,
		libraryKey,
	} = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
	const itemType = item ? item.itemType : null;
	const childItems = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey, 'keys'], [])
			.map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const totalChildItems = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey, 'totalResults']);
	const isProcessingTags = get(state,
		['libraries', libraryKey, 'updating', 'items', itemKey], []
	).some(({ patch }) => 'tagd' in patch);
	const isMetaAvailable = itemType in state.meta.itemTypeCreatorTypes &&
		itemType in state.meta.itemTypeFields;
	const shouldFetchMeta = !isMetaAvailable
		&& !state.fetching.itemTypeCreatorTypes.includes(itemType)
		&& !state.fetching.itemTypeFields.includes(itemType);
	const isLoadingMeta = !isMetaAvailable;
	const isLoadingChildItems = get(
		state, ['libraries', libraryKey, 'itemsByParent', itemKey, 'isFetching'], false
	);
	const { isLibraryReadOnly } = (state.config.libraries.find(l => l.key === libraryKey) || {});

	const relatedItemsKeys = item ? mapRelationsToItemKeys(item.relations || {}, state.config.userId)
		.filter(String) : [];
	const relatedItems = relatedItemsKeys
			.map(key => get(state, ['libraries', libraryKey, 'items', key]))
			.filter(Boolean);
	const isLoadingRelatedItems = get(
		state, ['libraries', libraryKey, 'fetching', 'items'], [])
	.some(loadedItemKey => relatedItemsKeys.includes(loadedItemKey));


	const extraProps = [];

	if(isMetaAvailable) {
		extraProps['itemTypeFields'] = state.meta.itemTypeFields;
		extraProps['itemTypes'] = state.meta.itemTypes
			.map(it => ({
				value: it.itemType,
				label: it.localized
			}))
			.filter(it => it.value !== 'note');
		extraProps['creatorTypes'] = state.meta.itemTypeCreatorTypes[itemType]
			.map(ct => ({
				value: ct.creatorType,
				label: ct.localized
			}));
	}

	var itemsCount;

	switch(itemsSource) {
		case 'query':
			itemsCount = state.query.totalResults;
		break;
		case 'top':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsTop', 'totalResults'], null);
		break;
		case 'trash':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsTrash', 'totalResults'], null);
		break;
		case 'collection':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey, 'totalResults'], null)
		break;
	}

	const pendingChanges = get(state, ['libraries', libraryKey, 'updating', 'items', itemKey]) || [];

	return {
		childItems,
		collection: get(state, 'libraries', libraryKey, 'collections', collectionKey),
		isLibraryReadOnly,
		isLoadingChildItems,
		isLoadingMeta,
		isLoadingRelatedItems,
		isProcessingTags,
		isSelectMode,
		item,
		itemsCount,
		libraryKey,
		makePath: makePath.bind(null, state.config),
		pendingChanges,
		relatedItems,
		relatedItemsKeys,
		selectedItemKeys: itemKeys, //@TODO: rename
		shouldFetchMeta,
		totalChildItems,
		...extraProps
	};
};


ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: Types.item,
	dispatch: PropTypes.func.isRequired,
	makePath: PropTypes.func.isRequired,
};

export default withDevice(withEditMode(connect(
	mapStateToProps, { push, fetchItems, fetchChildItems })(ItemDetailsContainer)));
