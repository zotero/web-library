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
const withEditMode = require('../enhancers/with-edit-mode');

class TouchHeaderContainer extends React.Component {
	onNavigation(path) {
		const { history } = this.props;
		history.push(makePath(path));
	}

	render() {
		const { path, rootAtCurrentItemsSource } = this.props;
		var touchHeaderPath = path;

		if(rootAtCurrentItemsSource) {
			const index = path.findIndex(n => n.key === "itemsSource");
			touchHeaderPath = path.splice(index);
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
	const collection = state.current.collection;
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
				"My Library" :
				(state.groups.find(
					g => g.id === parseInt(libraryKey.slice(1), 10)
				) || { name: libraryKey }).name
		})
	}

	if(libraryKey && (view === 'item-list' || view === 'item-details')) {
		let label;
		switch(itemsSource) {
			case 'trash': label = "Trash"; break;
			case 'publications': label = "My Publications"; break;
			case 'query': label = "Search results"; break; //@NOTE: currently not in use
			case 'top': label = "All Items"; break;
			default: label = "Items"; break;
		}

		path.push({
			key: 'itemsSource',
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

	// add a root node
	path.unshift({
		key: 'root',
		path: { view: 'libraries' },
		label: 'Libraries'
	});

	// empty last node to represent current item if one is selected
	if(item) {
		path.push({key: '', label: ''});
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
