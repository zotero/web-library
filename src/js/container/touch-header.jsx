'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Types from '../types';
import { push } from 'connected-react-router';
import withDevice from '../enhancers/with-device';
import { connect } from 'react-redux';
import { get } from '../utils';
import { pick } from '../common/immutable';
import { getCollectionsPath } from '../common/state';
import TouchHeader from '../component/touch-header';
import { makePath } from '../common/navigation';
import { makeChildMap } from '../common/collection';
import { itemsSourceLabel } from '../common/format';
import withEditMode from '../enhancers/with-edit-mode';
import withSelectMode from '../enhancers/with-select-mode';
import { toggleModal } from '../actions';

class TouchHeaderContainer extends React.PureComponent {
	handleNavigation = path => {
		this.props.push(makePath(path));
	}

	get childMap() {
		const { collections } = this.props;
		return collections.length ? makeChildMap(collections) : {};
	}

	get itemsSourceNode() {
		const { itemsSource, libraryKey, collectionKey: collection } = this.props;
		const label = itemsSourceLabel(itemsSource);
		return {
			key: itemsSource,
			type: 'itemsSource',
			path: {
				library: libraryKey,
				view: 'item-list',
				trash: itemsSource === 'trash',
				publications: itemsSource === 'publications',
				collection
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
		const { item, isSelectMode } = this.props;
		return (item && !isSelectMode) ? { key: '', label: '' } : null;
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
					this.itemNode
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
				touchHeaderPath = [ this.selectedNode, this.itemNode ];
				shouldIncludeItemListOptions = !item && !isSelectMode;
				shouldHandleSelectMode = true;
				shouldIncludeEditButton = !isReadOnly && !isSelectMode && !!item;
			break;
			case variants.ITEM:
				touchHeaderPath = [ this.itemNode ];
				shouldIncludeEditButton = !isReadOnly && !isSelectMode && !!item;
			break;
		}
		touchHeaderPath = touchHeaderPath.filter(Boolean);

		const selectedItemsCount = itemKeys.length;
		const collectionHasChildren = collectionKey in this.childMap;

		const props = { isSelectMode, shouldIncludeEditButton,
			shouldIncludeItemListOptions, shouldIncludeCollectionOptions,
			selectedItemsCount, shouldHandleSelectMode, collectionHasChildren,
			...pick(this.props, ['isEditing', 'className', 'onSelectModeToggle',
				'collectionKey', 'toggleModal'])
		};

		return (
			<TouchHeader
				{ ...props }
				onNavigation={ this.handleNavigation }
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
		libraryKey,
		itemKey,
		view,
		itemsSource,
		collectionKey, //@TODO: rename to collectionKey
	} = state.current;
	const { libraries } = state.config;
	const collections = get(state, ['libraries', libraryKey, 'collections'], []);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const libraryConfig = libraries.find(l => l.key === libraryKey);
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

	return {
		collections: Object.values(collections),
		view,
		libraryKey,
		libraryConfig,
		path,
		item,
		itemsSource,
		collectionKey
	};
};

const TouchHeaderWrapped = withDevice(withSelectMode(withEditMode(
	connect(mapStateToProps, { push, toggleModal })(TouchHeaderContainer)
)));

export default TouchHeaderWrapped;
