'use strict';

import React from 'react';
import { itemProp } from '../../constants';
import { connect } from 'react-redux';
import { push } from 'redux-router';
import { triggerEditingItem } from '../../actions';
import { getCurrentViewFromState } from '../../state-utils';

import { getCollections, getPathFromState } from '../../state-utils';
import TouchHeader from '../touch-header';

class TouchHeaderContainer extends React.Component {
	onCollectionSelected(collectionKey) {
		if(collectionKey) {
			this.props.dispatch(push(`/collection/${collectionKey}`));
		} else {
			this.props.dispatch(push('/'));
		}
	}

	onEditingToggled(editing) {
		this.props.dispatch(
			triggerEditingItem(this.props.item.key, editing)
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
	dispatch: React.PropTypes.func.isRequired,
	push: React.PropTypes.func.isRequired,
	path: React.PropTypes.array,
	item: itemProp
};

const mapStateToProps = state => {
	//@TODO: deduplicate into getItem(state)
	var items, item;
	const selectedCollectionKey = 'collection' in state.router.params ? state.router.params.collection : null;
	const selectedItemKey = 'item' in state.router.params ? state.router.params.item : null;
	const collections = getCollections(state);
	const path = getPathFromState(state).map(
		key => {
			const col = collections.find(
				c => c.key === key
			);
			
			return {
				key: col.key,
				label: col.apiObj.data.name
			};
		}
	);

	if(selectedCollectionKey && state.items[selectedCollectionKey]) {
		items = state.items[selectedCollectionKey].items;
	}

	if(items && selectedItemKey) {
		item = items.find(i => i.key === selectedItemKey);
		// Push an empty item to the path to force "current" to become empty
		// when an item is selected
		path.push({key: '', label: ''});
	}

	return {
		editing: item && state.items.editing === item.key,
		view: getCurrentViewFromState(state),
		path,
		item
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch,
		push
	};
};

const TouchHeaderWrapped = connect(mapStateToProps, mapDispatchToProps)(TouchHeaderContainer);

export default TouchHeaderWrapped;