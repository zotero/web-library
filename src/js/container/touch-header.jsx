'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { itemProp } = require('../constants/item');
const { connect } = require('react-redux');
const { get } = require('../utils');
const { getCollectionsPath } = require('../common/state');
const TouchHeader = require('../component/touch-header');
const { makePath } = require('../common/navigation');
const { makeChildMap } = require('../common/collection');
const { itemsSourceLabel } = require('../common/format');
const withEditMode = require('../enhancers/with-edit-mode');

class TouchHeaderContainer extends React.Component {
	onNavigation(path) {
		const { history } = this.props;
		history.push(makePath(path));
	}

	get childMap() {
		const { collections } = this.props;
		return collections.length ? makeChildMap(collections) : {};
	}

	render() {
		const { path, view, itemsSource, skipSelected, includeItem, item,
			includeItemsSource, rootAtCurrentItemsSource, libraryKey,
			collection } = this.props;

		var touchHeaderPath = [ ...path];

		if(includeItemsSource && libraryKey && (view === 'item-list' || view === 'item-details')) {
			const label = itemsSourceLabel(itemsSource);
			touchHeaderPath.push({
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
			});
		}

		if(rootAtCurrentItemsSource) {
			const index = touchHeaderPath.findIndex(n => n.type === "itemsSource");
			touchHeaderPath = touchHeaderPath.splice(index);
		} else {
			// add a root node
			touchHeaderPath.unshift({
				key: 'root',
				type: 'root',
				path: { view: 'libraries' },
				label: 'Libraries'
			});
		}

		// empty last node to represent current item if one is selected
		if(includeItem && item) {
			touchHeaderPath.push({key: '', label: ''});
		}

		if(skipSelected) {
			const key = touchHeaderPath[touchHeaderPath.length - 1].key;
			const nodeType = touchHeaderPath[touchHeaderPath.length - 1].type;

			// nodes that can be selected: Trash, Publications, Collection with no children
			const isCollectionNode = nodeType === 'collection';
			const isItemsSourceNode = nodeType === 'itemsSource';
			const hasChildren = key in this.childMap;
			const isLeafNode = isItemsSourceNode || (isCollectionNode && !hasChildren);

			if(isLeafNode) {
				touchHeaderPath.pop();
			}
		}

		return (
			<TouchHeader
				{ ...this.props }
				onNavigation={ this.onNavigation.bind(this) }
				path={ touchHeaderPath }
			/>
		);
	}

	static defaultProps = {
		includeNav: true,
	}

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		path: PropTypes.array,
		item: itemProp,
		includeNav: PropTypes.bool,
		includeItem: PropTypes.bool,
		rootAtCurrentItemsSource: PropTypes.bool,
		includeItemsSource: PropTypes.bool,
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemKey = state.current.item;
	const collections = get(state, ['libraries', libraryKey, 'collections'], []);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const view = state.current.view;
	const itemsSource = state.current.itemsSource;
	const collection = state.current.collection;
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
			//@TODO: when first loading, group name is not known
			label: libraryKey === state.config.userLibraryKey ?
				"My Library" :
				(state.groups.find(
					g => g.id === parseInt(libraryKey.slice(1), 10)
				) || { name: libraryKey }).name
		})
	}

	return {
		collections: Object.values(collections),
		view,
		libraryKey,
		path,
		item,
		itemsSource,
		collection
	};
};

const TouchHeaderWrapped = withRouter(withEditMode(connect(mapStateToProps)(TouchHeaderContainer)));

module.exports = TouchHeaderWrapped;
