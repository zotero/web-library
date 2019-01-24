'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');
const { saveAs } = require('file-saver');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const { push } = require('connected-react-router');
const { removeKeys } = require('../common/immutable');
const ItemsActions = require('../component/item/actions');
const withSelectMode = require('../enhancers/with-select-mode');
const withDevice = require('../enhancers/with-device');
const { BIBLIOGRAPHY, COLLECTION_SELECT } = require('../constants/modals');

const {
	createItem,
	deleteItems,
	exportItems,
	fetchItemTemplate,
	moveToTrash,
	recoverFromTrash,
	removeFromCollection,
	toggleModal,
} = require('../actions');
const exportFormats = require('../constants/export-formats');

class ItemsActionsContainer extends React.PureComponent {
	//@TODO: idenitical to ItemsContainer, reduce duplication
	handleItemsSelect(items = []) {
		const { push, collectionKey: collection, libraryKey: library,
			itemsSource, tags, search } = this.props;
		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';
		const view = 'item-list';
		push(makePath({ library, search, tags, trash, publications, collection, items, view }));
	}
	async handleDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(moveToTrash(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handlePermanentlyDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(deleteItems(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handleUndelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(recoverFromTrash(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handleRemove() {
		const { dispatch, selectedItemKeys, collectionKey } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(removeFromCollection(itemKeys, collectionKey));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handleNewItemCreate(itemType) {
		const { itemsSource, dispatch, collectionKey, libraryKey } = this.props;
		const template = await dispatch(fetchItemTemplate(itemType));
		const newItem = {
			...template,
			collections: itemsSource === 'collection' ? [collectionKey] : []
		};
		const item = await dispatch(createItem(newItem, libraryKey));
		this.handleItemsSelect([item.key]);
	}

	async handleExport(format) {
		const { dispatch, selectedItemKeys } = this.props;
		const exportData = await dispatch(exportItems(selectedItemKeys, format));

		const fileName = ['export-data', exportFormats.find(f => f.key === format).extension]
			.filter(Boolean).join('.');
		saveAs(exportData, fileName);
	}

	async handleDuplicate() {
		const { item, libraryKey: library, dispatch } = this.props;
		const copyItem = removeKeys(item, ['key', 'version']);
		const newItem = await dispatch(createItem(copyItem, library));
		this.handleItemsSelect([newItem.key]);
	}

	handleBibliographyOpen() {
		const { dispatch } = this.props;
		dispatch(toggleModal(BIBLIOGRAPHY, true));
	}

	handleAddToCollectionModalOpen() {
		const { dispatch } = this.props;
		dispatch(toggleModal(COLLECTION_SELECT, true));
	}

	handleLibraryShow() {
		const { push, selectedItemKeys, libraryKey: library } = this.props;
		push(makePath({ library, items: selectedItemKeys[0] }));
	}

	render() {
		return <ItemsActions
			device={ this.props.device }
			isSelectMode={ this.props.isSelectMode }
			itemsSource={ this.props.itemsSource }
			itemTypes={ this.props.itemTypes }
			onBibliographyOpen={ this.handleBibliographyOpen.bind(this) }
			onAddToCollectionModalOpen={ this.handleAddToCollectionModalOpen.bind(this) }
			onDelete={ this.handleDelete.bind(this) }
			onDuplicate={ this.handleDuplicate.bind(this) }
			onExport={ this.handleExport.bind(this )}
			onLibraryShow={ this.handleLibraryShow.bind(this) }
			onNewItemCreate={ this.handleNewItemCreate.bind(this) }
			onPermanentlyDelete={ this.handlePermanentlyDelete.bind(this) }
			onRemove={ this.handleRemove.bind(this) }
			onSelectModeToggle={ this.props.onSelectModeToggle }
			onUndelete={ this.handleUndelete.bind(this) }
			selectedItemKeys={ this.props.selectedItemKeys }
		/>
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		device: PropTypes.object,
		dispatch: PropTypes.func,
		isSelectMode: PropTypes.bool,
		itemsSource: PropTypes.string,
		itemTypes: PropTypes.array,
		libraryKey: PropTypes.string,
		onSelectModeToggle: PropTypes.func,
		push: PropTypes.func,
		search: PropTypes.string,
		selectedItemKeys: PropTypes.array,
		tags: PropTypes.array,
	}

	static defaultProps = {

	}
}

const mapStateToProps = state => {
	const {
		libraryKey,
		collectionKey,
		itemsSource,
		itemKey,
		tags,
		search,
	} = state.current;

	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);

	return {
		collectionKey,
		item,
		itemKey,
		itemsSource,
		itemTypes: state.meta.itemTypes,
		search,
		selectedItemKeys: item ? [item.key] : state.current.itemKeys,
		tags,
	}
}

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

module.exports = withSelectMode(withDevice(
	connect(mapStateToProps, mapDispatchToProps)(ItemsActionsContainer)
));
