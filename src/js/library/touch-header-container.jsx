'use strict';

import React from 'react';
import { push } from 'redux-router';

import TouchHeader from './touch-header';
import { connect } from 'react-redux';
import { getCollections, getPathFromState } from '../state-utils';

class TouchHeaderContainer extends React.Component {
	
	onCollectionSelected(collectionKey) {
		if(collectionKey) {
			this.props.dispatch(push(`/collection/${collectionKey}`));
		} else {
			this.props.dispatch(push('/'));
		}
	}

	render() {
		var current, next, previous, forelast;

		if(this.props.path) {
			if(this.props.path.length > 0) {
				current = this.props.collections.find(c => c.key == this.props.path[this.props.path.length - 1]);
			}

			if(this.props.path.length > 1) {
				previous = this.props.collections.find(c => c.key == this.props.path[this.props.path.length - 2]);
			}
		}
		
		return (
			<TouchHeader 
				onCollectionSelected={ this.onCollectionSelected.bind(this) }
				current={ current }
				next = { next }
				previous = { previous }
				forelast = { forelast }
			/>
		);
	}
}

TouchHeaderContainer.propTypes = {
	collections: React.PropTypes.array,
	dispatch: React.PropTypes.func.isRequired,
	push: React.PropTypes.func.isRequired,
	path: React.PropTypes.array
};

const mapStateToProps = state => {
	return {
		collections: getCollections(state),
		path: getPathFromState(state)
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