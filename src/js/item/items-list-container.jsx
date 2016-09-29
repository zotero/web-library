'use strict';

import React from 'react';
import { connect } from 'react-redux';
import ItemsList from './items-list';
import { selectItem, fetchItemsIfNeeded } from '../actions';


class ItemsListContainer extends React.Component {
	componentWillReceiveProps(nextProps) {
		if(nextProps.collection && nextProps.collection.key && nextProps.collection.key != this.props.collection.key) {
			this.props.dispatch(
				fetchItemsIfNeeded(nextProps.collection)
			);
		}
	}

	render() {
		return <ItemsList isFetching={this.props.isFetching} items={this.props.items} />;
	}
}

const mapStateToProps = state => {
	var collections, collection;

	if(state.library && state.library.libraryString && state.collections[state.library.libraryString]) {
		collections = state.collections[state.library.libraryString].collections;
	}

	if(collections && state.collections.selected) {
		collection = collections.find(c => c.key === state.collections.selected);
	}


	return {
		collection: collection || {},
		items: collection && state.items[collection.key] ? state.items[collection.key].items : [],
		isFetching: collection && state.items[collection.key] ? state.items[collection.key].isFetching : false
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch,
		onItemClick: index => {
			dispatch(selectItem(index));
		}
	};
};

ItemsListContainer.propTypes = {
  collection: React.PropTypes.object.isRequired,
  items: React.PropTypes.array.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemsListContainer);