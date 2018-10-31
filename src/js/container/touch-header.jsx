'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { itemProp } = require('../constants/item');
const { connect } = require('react-redux');
const { get } = require('../utils');
const { getCollectionsPath } = require('../common/state');
const TouchHeader = require('../component/touch-header');
const memoize = require('memoize-one');
const { makePath } = require('../common/navigation');
const withEditMode = require('../enhancers/with-edit-mode');

class TouchHeaderContainer extends React.Component {
	makeTouchHeaderPath = memoize((path, startAt, item) => {
		if(startAt && path.includes(startAt)) {
			path.splice(0, path.indexOf(startAt));
		}

		if(item) {
			// Push an empty item to the path to force "current" to become empty
			// when an item is selected
			path.push({key: '', label: ''});
		}
		return path;
	});

	onNavigation(path) {
		const { history } = this.props;
		history.push(makePath(path));
	}

	render() {
		const { path, includeNav, rootAtCurrentItemsSource, root, includeItem, item } = this.props;
		const touchHeaderPath = includeNav ? this.makeTouchHeaderPath(
			path,
			rootAtCurrentItemsSource ? root.key : null,
			includeItem ? item : null
		) : [];

		return (
			<TouchHeader
				{ ...this.props }
				onNavigation={ this.onNavigation.bind(this) }
				path={ touchHeaderPath }
				root={ rootAtCurrentItemsSource ? root : undefined }

			/>
		);
	}

	static defaultProps = {
		includeNav: true,
		root: {
			key: null,
			label: '/'
		}
	}

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		path: PropTypes.array,
		item: itemProp,
		includeNav: PropTypes.bool,
		includeItem: PropTypes.bool,
		root: PropTypes.object,
		rootAtCurrentItemsSource: PropTypes.bool
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemKey = state.current.item;
	const collections = get(state, ['libraries', libraryKey, 'collections'], []);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const view = state.current.view;
	const itemsSource = state.current.itemsSource;
	const path = getCollectionsPath(state).map(
		key => {
			const { name } = collections[key]
			return {
				key,
				label: name,
				path: { library: libraryKey, collection: key },
			};
		}
	);

	if(libraryKey && view !== 'libraries') {
		path.unshift({
			key: libraryKey,
			path: { library: libraryKey, view: 'library' },
			//@TODO: when first loading, group name is not known
			label: libraryKey === state.config.userLibraryKey ?
				"My Library" : (state.groups.find(g => g.id === parseInt(libraryKey.slice(1), 10)) || { name: libraryKey}).name
		})
	}

	if(libraryKey && view === 'item-list') {
		let label;
			switch(itemsSource) {
				case 'trash': label = "Trash"; break;
				case 'publications': label = "My Publications"; break;
				case 'query': label = "Search results"; break; //@NOTE: currently not in use
				case 'top': label = "All Items"; break;
				default: label = "Items"; break;
			}

		path.push({
			key: null,
			path: { library: libraryKey, view: 'item-list' },
			label
		});
	}

	return {
		view,
		libraryKey,
		path,
		item
	};
};

const TouchHeaderWrapped = withRouter(withEditMode(connect(mapStateToProps)(TouchHeaderContainer)));

module.exports = TouchHeaderWrapped;
