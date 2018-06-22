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

class TouchHeaderContainer extends React.Component {
	onCollectionSelected(collectionKey) {
		if(collectionKey) {
			this.props.history.push(`/collection/${collectionKey}`);
		} else {
			this.props.history.push('/');
		}
	}

	onEditingToggled(isEditing) {
		this.props.dispatch(
			triggerEditingItem(this.props.item.key, isEditing)
		);
	}

	render() {
		return (
			<TouchHeader
				onCollectionSelected={ this.onCollectionSelected.bind(this) }
				onEditingToggled={ this.onEditingToggled.bind(this) }
				{ ...this.props }
			/>
		);
	}
}

TouchHeaderContainer.propTypes = {
	dispatch: PropTypes.func.isRequired,
	path: PropTypes.array,
	item: itemProp
};

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemKey = state.current.item;
	const collections = get(state, ['libraries', libraryKey, 'collections'], []);
	const path = getCollectionsPath(state).map(
		key => {
			const { name } = collections[key]
			return { key, name };
		}
	);

	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	if(item) {
		// Push an empty item to the path to force "current" to become empty
		// when an item is selected
		path.push({key: '', label: ''});
	}

	return {
		isEditing: item ? state.current.editing === item.key : false,
		view: state.current.view,
		path,
		item
	};
};

const mapDispatchToProps = (dispatch) => {
	return { dispatch };
};

const TouchHeaderWrapped = withRouter(connect(mapStateToProps, mapDispatchToProps)(TouchHeaderContainer));

module.exports = TouchHeaderWrapped;
