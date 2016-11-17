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
		return <ItemsList 
			isFetching={ this.props.isFetching }
			items={ this.props.items }
			selectedItemKey={ this.props.selectedItemKey }
			onItemSelected={ this.props.onItemSelected }
			/>;
	}
}



const mapStateToProps = state => {
	var collections, collection, selected;

	selected = state.router.location.pathname.match(/^\/collection\//) ? state.router.params.key : null;

	if(state.library && state.library.libraryString && state.collections[state.library.libraryString]) {
		collections = state.collections[state.library.libraryString].collections;
	}

	if(collections && selected) {
		collection = collections.find(c => c.key === selected);
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
		selectedItemKey: collection && state.items.selected
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch,
		onItemSelected: index => {
			dispatch(selectItem(index));
		}
	};
};

ItemsListContainer.propTypes = {
  collection: React.PropTypes.object.isRequired,
  items: React.PropTypes.array.isRequired,
  selectedItemKey: React.PropTypes.string,
  isFetching: React.PropTypes.bool.isRequired,
  onItemSelected: React.PropTypes.func,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemsListContainer);