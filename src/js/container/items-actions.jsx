'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { saveAs } = require('file-saver');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const { withRouter } = require('react-router-dom');
const ItemsActions = require('../component/item/actions');
const withSelectMode = require('../enhancers/with-select-mode');
const withDevice = require('../enhancers/with-device');

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
		const { history, collectionKey: collection, libraryKey: library,
			itemsSource, tags, search } = this.props;
		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';
		const view = 'item-list';
		history.push(makePath({ library, search, tags, trash, publications, collection, items, view }));
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

	handleBibliographyOpen() {
		const { dispatch } = this.props;
		dispatch(toggleModal('BIBLIOGRAPHY', true));
	}

	handleLibraryShow() {
		const { history, selectedItemKeys, libraryKey: library } = this.props;
		history.push(makePath({ library, items: selectedItemKeys[0] }));
	}

	render() {
		return <ItemsActions
			device={ this.props.device }
			isSelectMode={ this.props.isSelectMode }
			itemsSource={ this.props.itemsSource }
			onBibliographyOpen={ this.handleBibliographyOpen.bind(this) }
			onDelete={ this.handleDelete.bind(this) }
			onExport={ this.handleExport.bind(this )}
			onNewItemCreate={ this.handleNewItemCreate.bind(this) }
			onPermanentlyDelete={ this.handlePermanentlyDelete.bind(this) }
			onRemove={ this.handleRemove.bind(this) }
			onSelectModeToggle={ this.props.onSelectModeToggle }
			onUndelete={ this.handleUndelete.bind(this) }
			onLibraryShow={ this.handleLibraryShow.bind(this) }
			selectedItemKeys={ this.props.selectedItemKeys }
		/>
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		device: PropTypes.object,
		dispatch: PropTypes.func,
		history: PropTypes.object,
		isSelectMode: PropTypes.bool,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string,
		onSelectModeToggle: PropTypes.func,
		search: PropTypes.string,
		selectedItemKeys: PropTypes.array,
		tags: PropTypes.array,
	}

	static defaultProps = {

	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const collectionKey = state.current.collection;
	const itemsSource = state.current.itemsSource;
	const itemKey = state.current.item;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const tags = state.current.tags;
	const search = state.current.search;


	return {
		itemKey,
		collectionKey,
		itemsSource,
		tags,
		search,
		selectedItemKeys: item ? [item.key] : state.current.itemKeys,
	}
}

module.exports = withRouter(withSelectMode(withDevice(connect(mapStateToProps)(
	ItemsActionsContainer))));
