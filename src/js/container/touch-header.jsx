'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { itemProp } = require('../constants/item');
const { connect } = require('react-redux');
const { triggerEditingItem } = require('../actions');
const { get } = require('../utils');
const { getCollectionsPath } = require('../common/state');
const TouchHeader = require('../component/touch-header');
const memoize = require('memoize-one');
const { makePath } = require('../common/navigation');

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

	onCollectionSelected(collectionKey) {
		const { history, libraryKey: library } = this.props;
		history.push(makePath({ library, collection: collectionKey }));
	}

	onEditingToggled(isEditing) {
		this.props.dispatch(
			triggerEditingItem(this.props.item.key, isEditing)
		);
	}

	render() {
		const { path, rootAtCurrentItemsSource, root, includeItem, item } = this.props;
		return (
			<TouchHeader
				{ ...this.props }
				onCollectionSelected={ this.onCollectionSelected.bind(this) }
				onEditingToggled={ this.onEditingToggled.bind(this) }
				path={ this.makeTouchHeaderPath(
					path,
					rootAtCurrentItemsSource ? root.key : null,
					includeItem ? item : null
				) }
				root={ rootAtCurrentItemsSource ? root : undefined }

			/>
		);
	}

	static defaultProps = {
		root: {
			key: null,
			label: '/'
		}
	}

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		path: PropTypes.array,
		item: itemProp,
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
	const path = getCollectionsPath(state).map(
		key => {
			const { name } = collections[key]
			return { key, label: name };
		}
	);

	let root;
	switch(state.current.itemsSource) {
		case 'collection': {
			root = {
				key: state.current.collection,
				label: get(collections, [state.current.collection, 'name'])
			}
		}
		break;
		case 'top': {
			root = {
				key: null,
				label: 'All Documents'
			}
		}
		break;
		case 'trash': {
			root = {
				key: 'trash',
				label: 'Trash'
			}
		}
	}

	return {
		isEditing: item ? state.current.editing === item.key : false,
		view: state.current.view,
		libraryKey,
		path,
		item,
		root
	};
};

const mapDispatchToProps = (dispatch) => {
	return { dispatch };
};

const TouchHeaderWrapped = withRouter(connect(mapStateToProps, mapDispatchToProps)(TouchHeaderContainer));

module.exports = TouchHeaderWrapped;
