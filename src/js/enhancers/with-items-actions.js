'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import hoistNonReactStatic from 'hoist-non-react-statics';
import fileSaver from 'file-saver';

import {
    fetchItemTemplate,
    moveToTrash,
    deleteItems,
    recoverFromTrash,
    removeFromCollection,
    createItem,
    exportItems,
    toggleModal,
    triggerSelectMode,
} from '../actions';

import { get } from '../utils';
import { makePath } from '../common/navigation';
import { omit } from '../common/immutable';
import { sequentialChunkedAcion } from '../common/actions';
import exportFormats from '../constants/export-formats';
import { BIBLIOGRAPHY, COLLECTION_SELECT, EXPORT, NEW_ITEM } from '../constants/modals';

const { saveAs } = fileSaver;

const withItemsActions = Component => {
	class EnhancedComponent extends React.PureComponent {
		//@TODO: idenitical to ItemsContainer, reduce duplication
		handleItemsSelect(items = [], view = 'item-list') {
			const { collectionKey: collection, libraryKey: library, itemsSource,
				makePath, push, tags, search, triggerSelectMode } = this.props;
			const trash = itemsSource === 'trash';
			const publications = itemsSource === 'publications';
			triggerSelectMode(false);
			push(makePath({ library, search, tags, trash, publications, collection, items, view }));
		}

		handleTrash = async () => {
			const { itemKeys, moveToTrash } = this.props;
			await sequentialChunkedAcion(moveToTrash, itemKeys);
			this.handleItemsSelect();
		}

		handlePermanentlyDelete = async () =>  {
			const { deleteItems, itemKeys } = this.props;
			await sequentialChunkedAcion(deleteItems, itemKeys);
			this.handleItemsSelect();
		}

		handleUndelete = async () => {
			const { itemKeys, recoverFromTrash } = this.props;
			await sequentialChunkedAcion(recoverFromTrash, itemKeys);
			this.handleItemsSelect();
		}

		handleRemoveFromCollection = async () => {
			const { itemKeys, collectionKey, removeFromCollection } = this.props;
			await sequentialChunkedAcion(removeFromCollection, itemKeys, [collectionKey]);
			this.handleItemsSelect();
		}

		handleNewItemCreate = async (itemType) =>  {
			const { itemsSource, fetchItemTemplate, collectionKey,
				libraryKey, createItem } = this.props;
			const template = await fetchItemTemplate(itemType);
			const newItem = {
				...template,
				collections: itemsSource === 'collection' ? [collectionKey] : []
			};
			const item = await createItem(newItem, libraryKey);
			this.handleItemsSelect([item.key]);
		}

		handleExport = async (format) => {
			const { exportItems, itemKeys, libraryKey } = this.props;
			const exportData = await exportItems(itemKeys, libraryKey, format);
			const extension = exportFormats.find(f => f.key === format).extension;

			const fileName = ['export-data', extension].filter(Boolean).join('.');
			saveAs(exportData, fileName);
		}

		handleDuplicate = async () => {
			const { item, libraryKey: library, createItem } = this.props;
			const copyItem = omit(item, ['key', 'version', 'dateAdded', 'dateModified']);
			const newItem = await createItem(copyItem, library);
			this.handleItemsSelect([newItem.key]);
		}

		handleAddToCollectionModalOpen = () => {
			const { itemKeys, toggleModal } = this.props;
			toggleModal(COLLECTION_SELECT, true, { items: itemKeys });
		}

		handleBibliographyModalOpen = () => {
			const { toggleModal, itemKeys, libraryKey } = this.props;
			toggleModal(BIBLIOGRAPHY, true, { itemKeys, libraryKey });
		}

		handleExportModalOpen = () => {
			const { toggleModal, itemKeys } = this.props;
			toggleModal(EXPORT, true, { itemKeys });
		}

		handleNewItemModalOpen = () => {
			const { toggleModal, collectionKey } = this.props;
			toggleModal(NEW_ITEM, true, { collectionKey });
		}

		render() {
			return <Component
				{ ...this.props }
				onTrash = { this.handleTrash }
				onItemsSelect = { this.handleItemsSelect }
				onPermanentlyDelete = { this.handlePermanentlyDelete }
				onUndelete = { this.handleUndelete }
				onRemoveFromCollection = { this.handleRemoveFromCollection }
				onDuplicate = { this.handleDuplicate }
				onNewItemCreate = { this.handleNewItemCreate }
				onExport = { this.handleExport }
				onAddToCollectionModalOpen = { this.handleAddToCollectionModalOpen }
				onBibliographyModalOpen = { this.handleBibliographyModalOpen }
				onExportModalOpen = { this.handleExportModalOpen }
				onNewItemModalOpen = { this.handleNewItemModalOpen }
			/>;
		}

		static displayName = `withItemsActions(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
		static propTypes = {
			collectionKey: PropTypes.string,
			createItem: PropTypes.func,
			deleteItems: PropTypes.func,
			exportItems: PropTypes.func,
			fetchItemTemplate: PropTypes.func,
			item: PropTypes.object,
			itemKeys: PropTypes.array,
			itemsSource: PropTypes.string,
			libraryKey: PropTypes.string,
			makePath: PropTypes.func.isRequired,
			moveToTrash: PropTypes.func,
			push: PropTypes.func,
			recoverFromTrash: PropTypes.func,
			removeFromCollection: PropTypes.func,
			search: PropTypes.string,
			tags: PropTypes.array,
			toggleModal: PropTypes.func,
			triggerSelectMode: PropTypes.func,
		}
	}

	return connect(mapStateToProps, mapDispatchToProps)(
		hoistNonReactStatic(EnhancedComponent, Component)
	);
}

const mapStateToProps = state => {
	const { libraryKey, collectionKey, itemsSource, itemKey, tags,
		search, itemKeys } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);

	return { collectionKey, item, itemKey, itemsSource, libraryKey, search,
		itemKeys, makePath: makePath.bind(null, state.config), tags
	}
}

const mapDispatchToProps = { fetchItemTemplate, moveToTrash, deleteItems,
	recoverFromTrash, removeFromCollection, createItem, exportItems,
	toggleModal, triggerSelectMode, push };

export default withItemsActions;
