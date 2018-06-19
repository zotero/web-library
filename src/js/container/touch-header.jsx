'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { itemProp } = require('../constants/item');
const { connect } = require('react-redux');
const { triggerEditingItem } = require('../actions');
const {
	getItem,
	getCurrentViewFromState,
	getCollections,
	getCollectionsPath,
	isEditing,
} = require('../state-utils');
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
	const collections = getCollections(state);
	const path = getCollectionsPath(state).map(
		key => {
			const { name } = collections.find(
				c => c.key === key
			);
			return { key, name };
		}
	);

	const item = getItem(state);
	if(item) {
		// Push an empty item to the path to force "current" to become empty
		// when an item is selected
		path.push({key: '', label: ''});
	}

	return {
		isEditing: item ? isEditing(item.key, state) : false,
		view: getCurrentViewFromState(state),
		path,
		item
	};
};

const mapDispatchToProps = (dispatch) => {
	return { dispatch };
};

const TouchHeaderWrapped = withRouter(connect(mapStateToProps, mapDispatchToProps)(TouchHeaderContainer));

module.exports = TouchHeaderWrapped;
