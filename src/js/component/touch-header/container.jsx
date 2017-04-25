'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';

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

	render() {
		let path = this.props.path.map(
			key => this.props.collections.find(
				c => c.key === key
			)
		);
		
		return (
			<TouchHeader 
				onCollectionSelected={ this.onCollectionSelected.bind(this) }
				path = { path }
				processing = { this.props.processing }
			/>
		);
	}
}

TouchHeaderContainer.propTypes = {
	collections: React.PropTypes.array,
	dispatch: React.PropTypes.func.isRequired,
	push: React.PropTypes.func.isRequired,
	path: React.PropTypes.array,
	processing: React.PropTypes.bool
};

const mapStateToProps = state => {
	//@TODO: deduplicate into getItem(state)
	var items, item;
	let selectedCollectionKey = 'collection' in state.router.params ? state.router.params.collection : null;
	let selectedItemKey = 'item' in state.router.params ? state.router.params.item : null;

	if(selectedCollectionKey && state.items[selectedCollectionKey]) {
		items = state.items[selectedCollectionKey].items;
	}

	if(items && selectedItemKey) {
		item = items.find(i => i.key === selectedItemKey);
	}

	return {
		collections: getCollections(state),
		path: getPathFromState(state),
		processing: item && state.items.updating && item.key in state.items.updating
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