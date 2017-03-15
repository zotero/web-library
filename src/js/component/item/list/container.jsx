'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';

import ItemList from '../list';
import { fetchItemsIfNeeded } from '../../../actions';

class ItemListContainer extends React.Component {
	componentWillReceiveProps(nextProps) {
		if(nextProps.collection && nextProps.collection.key && nextProps.collection.key != this.props.collection.key) {
			this.props.dispatch(
				fetchItemsIfNeeded(nextProps.collection)
			);
		}
	}

	onItemSelected(itemKey) {
		this.props.dispatch(push(`/collection/${this.props.collection.key}/item/${itemKey}`));
	}

	render() {
		return <ItemList 
			isFetching={ this.props.isFetching }
			items={ this.props.items }
			selectedItemKey={ this.props.selectedItemKey }
			onItemSelected={ this.onItemSelected.bind(this) }
			/>;
	}
}



const mapStateToProps = state => {
	var collections, collection;

	// selected = state.router.location.pathname.match(/^\/collection\//) ? state.router.params.key : null;
	let selectedCollectionKey = 'collection' in state.router.params ? state.router.params.collection : null;
	let selectedItemKey = 'item' in state.router.params ? state.router.params.item : null;

	if(state.library && state.library.libraryString && state.collections[state.library.libraryString]) {
		collections = state.collections[state.library.libraryString].collections;
	}

	if(collections && selectedCollectionKey) {
		collection = collections.find(c => c.key === selectedCollectionKey);
	}

	const getTopLevelItems = () => {
		if(collection && state.items[collection.key]) {
			let items = state.items[collection.key].items;
			return items.filter(i => !('parentItem' in i.data));
		}
		return [];
	};

	return {
		collection: collection || {},
		items: getTopLevelItems(),
		isFetching: collection && state.items[collection.key] ? state.items[collection.key].isFetching : false,
		selectedItemKey: selectedItemKey
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemListContainer.propTypes = {
  collection: React.PropTypes.object.isRequired,
  items: React.PropTypes.array.isRequired,
  selectedItemKey: React.PropTypes.string,
  isFetching: React.PropTypes.bool.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemListContainer);