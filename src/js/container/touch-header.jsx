'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Types from '../types';
import withDevice from '../enhancers/with-device';
import { connect } from 'react-redux';
import { get } from '../utils';
import { getCollectionsPath } from '../common/state';
import TouchHeader from '../component/touch-header';
import { makePath } from '../common/navigation';
import { makeChildMap } from '../common/collection';
import { itemsSourceLabel } from '../common/format';
import withEditMode from '../enhancers/with-edit-mode';
import withSelectMode from '../enhancers/with-select-mode';
import { navigate, toggleModal, triggerSearchMode } from '../actions';

class TouchHeaderContainer extends React.PureComponent {
	get childMap() {
		const { collections } = this.props;
		return collections.length ? makeChildMap(collections) : {};
	}

	get itemsSourceNode() {
		const { libraryKey, collectionKey: collection, search, tags, qmode, isTrash,
		isMyPublications, itemsSource } = this.props;
		const label = itemsSourceLabel(itemsSource);
		return {
			key: itemsSource,
			type: 'itemsSource',
			path: {
				collection,
				library: libraryKey,
				publications: isMyPublications,
				qmode,
				search,
				tags,
				trash: isTrash,
				view: 'item-list',
			},
			label
		}
	}

	get rootNode() {
		return {
			key: 'root',
			type: 'root',
			path: { view: 'libraries' },
			label: 'Libraries'
		};
	}

	get itemNode() {
		const { attachmentKey, item, isSelectMode, noteKey } = this.props;
		if(!item || isSelectMode) {
			return null;
		}

		if(attachmentKey) {
			return {
				key: item.key,
				label: 'Back',
				path: {
					...this.itemsSourceNode.path,
					view: 'item-details',
					items: [item.key]
				} }
		}

		if(noteKey) {
			return {
				key: item.key,
				label: 'Back',
				path: {
					...this.itemsSourceNode.path,
					view: 'item-details',
					items: [item.key]
				} }
		}

		return { key: item.key, label: '' };
	}

	get drilldownNode() {
		const { attachmentKey, item, isSelectMode, noteKey } = this.props;
		const isDrillDown = attachmentKey || noteKey;
		if(!isDrillDown || !item || isSelectMode) {
			return null;
		}

		if(attachmentKey) {
			return { key: attachmentKey, label: 'Attachment' }
		}

		if(noteKey) {
			return { key: noteKey, label: 'Note' };
		}

		return null;
	}

	get isSelectedOpened() {
		const { collectionKey } = this.props;
		const hasChildren = collectionKey in this.childMap;
		return hasChildren;
	}

	get isItemsView() {
		const { view } = this.props;
		return view === 'item-list' || view === 'item-details';
	}

	get isLastNodeCurrentlySelectedCollection() {
		const { collectionKey } = this.props;
		return collectionKey !== null && !this.isSelectedOpened;
	}

	get selectedNode() {
		const { path } = this.props;
		return this.isLastNodeCurrentlySelectedCollection ? path[path.length - 1] : this.itemsSourceNode;
	}

	render() {
		const { path, variant, view, item, isSelectMode, itemKeys,
			libraryConfig, collectionKey } = this.props;
		const variants = TouchHeaderContainer.variants;
		const { isReadOnly } = libraryConfig;
		var touchHeaderPath, shouldIncludeEditButton, shouldIncludeItemListOptions,
			shouldIncludeCollectionOptions, shouldHandleSelectMode;

		switch(variant) {
			case variants.MOBILE:
				touchHeaderPath = [
					this.rootNode,
					...path,
					this.isItemsView ? this.itemsSourceNode : null,
					this.itemNode,
					this.drilldownNode
				];
				shouldIncludeEditButton = !isReadOnly && view === 'item-details';
				shouldIncludeItemListOptions = view === 'item-list' && !isSelectMode;
				shouldHandleSelectMode = view === 'item-list';
				shouldIncludeCollectionOptions = view !== 'libraries' &&
					!isReadOnly && !shouldIncludeEditButton &&
					!shouldIncludeItemListOptions && !shouldHandleSelectMode;
			break;
			case variants.NAVIGATION:
				touchHeaderPath = [this.rootNode, ...path];
				if(this.isLastNodeCurrentlySelectedCollection) {
					touchHeaderPath.pop();
				}
				shouldIncludeCollectionOptions = !isReadOnly;
			break;
			case variants.SOURCE:
				touchHeaderPath = [ this.selectedNode ];
				shouldIncludeItemListOptions = !isSelectMode;
				shouldHandleSelectMode = true;
			break;
			case variants.SOURCE_AND_ITEM:
				touchHeaderPath = [ this.selectedNode, this.itemNode, this.drilldownNode ];
				shouldIncludeItemListOptions = !item && !isSelectMode;
				shouldHandleSelectMode = true;
				shouldIncludeEditButton = !isReadOnly && !isSelectMode && !!item;
			break;
			case variants.ITEM:
				touchHeaderPath = [ this.itemNode, this.drilldownNode ];
				shouldIncludeEditButton = !isReadOnly && !isSelectMode && !!item;
			break;
		}
		touchHeaderPath = touchHeaderPath.filter(Boolean);

		const selectedItemsCount = itemKeys.length;
		const collectionHasChildren = collectionKey in this.childMap;

		const props = { ...this.props, isSelectMode, shouldIncludeEditButton,
			shouldIncludeItemListOptions, shouldIncludeCollectionOptions,
			selectedItemsCount, shouldHandleSelectMode, collectionHasChildren,
		};

		return (
			<TouchHeader
				{ ...props }
				path={ touchHeaderPath }
			/>
		);
	}

	static defaultProps = {
	}

	static propTypes = {
		path: PropTypes.array,
		item: Types.item,
	}

	static variants = {
		MOBILE: 'MOBILE',
		NAVIGATION: 'NAVIGATION',
		SOURCE: 'SOURCE',
		SOURCE_AND_ITEM: 'SOURCE_AND_ITEM',
		ITEM: 'ITEM'
	};
}

const mapStateToProps = state => {
	const {
		attachmentKey,
		collectionKey,
		isMyPublications,
		isSearchMode,
		isTrash,
		itemKey,
		itemsSource,
		libraryKey,
		noteKey,
		qmode,
		search,
		searchState,
		view,
		tags,
	} = state.current;
	const { libraries } = state.config;
	const collections = get(state, ['libraries', libraryKey, 'collections', 'data'], []);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);

	//@TODO: if coming straight into user's group library, libraryConfig is {}
	//       which leads to group name rendering as empty string. This is fixed
	//       upon first update but should be fixed as soon as the name of the
	//       group is known (i.e. on RECEIVE_GROUPS action)
	const libraryConfig = libraries.find(l => l.key === libraryKey) || {};

	const path = getCollectionsPath(state).map(
		key => {
			const { name } = collections[key]
			return {
				key,
				type: 'collection',
				label: name,
				path: { library: libraryKey, collection: key },
			};
		}
	);

	if(libraryKey && view !== 'libraries') {
		path.unshift({
			key: libraryKey,
			type: 'library',
			path: { library: libraryKey, view: 'library' },
			label: libraryConfig.name
		})
	}

	return { attachmentKey, collectionKey, collections: Object.values(collections),
		isMyPublications, isSearchMode, isTrash, itemKey, item, itemsSource, libraryConfig,
		libraryKey, noteKey, path, qmode, search, searchState, tags, view
	};
};

const TouchHeaderWrapped = withDevice(withSelectMode(withEditMode(
	connect(mapStateToProps, { toggleModal, triggerSearchMode, onNavigate: navigate })(TouchHeaderContainer)
)));

export default TouchHeaderWrapped;
