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
		let path = this.props.path.map(
			key => this.props.collections.find(
				c => c.key === key
			)
		);
		
		return (
			<TouchHeader 
				onCollectionSelected={ this.onCollectionSelected.bind(this) }
				path = { path }
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