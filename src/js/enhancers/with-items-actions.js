'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const hoistNonReactStatic = require('hoist-non-react-statics');
const { saveAs } = require('file-saver');
const { moveToTrash, deleteItems, recoverFromTrash,
	removeFromCollection, createItem, exportItems } = require('../actions');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const { omit } = require('../common/immutable');
const exportFormats = require('../constants/export-formats');


const withItemsActions = Component => {
	class EnhancedComponent extends React.PureComponent {
		//@TODO: idenitical to ItemsContainer, reduce duplication
		handleItemsSelect(items = []) {
			const { push, collectionKey: collection, libraryKey: library,
				itemsSource, tags, search } = this.props;
			const trash = itemsSource === 'trash';
			const publications = itemsSource === 'publications';
			const view = 'item-list';
			push(makePath({ library, search, tags, trash, publications, collection, items, view }));
		}

		handleDelete = async () => {
			const { itemKeys, moveToTrash } = this.props;

			do {
				const itemKeysChunk = itemKeys.splice(0, 50);
				await moveToTrash(itemKeysChunk);
			} while (itemKeys.length > 50);
			this.handleItemsSelect();
		}

		handlePermanentlyDelete = async () =>  {
			const { deleteItems, itemKeys } = this.props;

			do {
				const itemKeysChunk = itemKeys.splice(0, 50);
				await deleteItems(itemKeysChunk);
			} while (itemKeys.length > 50);
			this.handleItemsSelect();
		}

		handleUndelete = async () => {
			const { itemKeys, recoverFromTrash } = this.props;

			do {
				const itemKeysChunk = itemKeys.splice(0, 50);
				await recoverFromTrash(itemKeysChunk);
			} while (itemKeys.length > 50);
			this.handleItemsSelect();
		}

		handleRemove = async () => {
			const { itemKeys, collectionKey, removeFromCollection } = this.props;

			do {
				const itemKeysChunk = itemKeys.splice(0, 50);
				await removeFromCollection(itemKeysChunk, collectionKey);
			} while (itemKeys.length > 50);
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
			const { exportItems, itemKeys } = this.props;
			const exportData = await exportItems(itemKeys, format);
			const extension = exportFormats.find(f => f.key === format).extension;

			const fileName = ['export-data', extension].filter(Boolean).join('.');
			saveAs(exportData, fileName);
		}

		handleDuplicate = async () => {
			const { item, libraryKey: library, createItem } = this.props;
			const copyItem = omit(item, ['key', 'version']);
			const newItem = await createItem(copyItem, library);
			this.handleItemsSelect([newItem.key]);
		}

		handleLibraryShow = () => {
			const { push, itemKeys, libraryKey: library } = this.props;
			push(makePath({ library, items: itemKeys[0] }));
		}

		render() {
			return <Component
				onDelete = { this.handleDelete }
				onItemsSelect = { this.handleItemsSelect }
				onPermanentlyDelete = { this.handlePermanentlyDelete }
				onUndelete = { this.handleUndelete }
				onRemove = { this.handleRemove }
				onDuplicate = { this.handleDuplicate }
				onLibraryShow = { this.handleLibraryShow }
				onNewItemCreate = { this.handleNewItemCreate }
				onExport = { this.handleExport }
			/>;
		}

		static displayName = `withItemsActions(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
		static propTypes = {
			collectionKey: PropTypes.string,
			createItem: PropTypes.func,
			deleteItems: PropTypes.func,
			exportItems: PropTypes.func,
			itemsSource: PropTypes.string,
			libraryKey: PropTypes.string,
			moveToTrash: PropTypes.func,
			push: PropTypes.func,
			recoverFromTrash: PropTypes.func,
			removeFromCollection: PropTypes.func,
			search: PropTypes.string,
			tags: PropTypes.array,
			itemKeys: PropTypes.array,
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

	return { collectionKey, item, itemKey, itemsSource, search, itemKeys,
		tags
	}
}

const mapDispatchToProps = { moveToTrash, deleteItems, recoverFromTrash,
	removeFromCollection, createItem, exportItems, push };

module.exports = withItemsActions;
