'use strict';

import React from 'react';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import { reduxReactRouter, routerStateReducer, ReduxRouter, push } from 'redux-router';
import { Route } from 'react-router';
import createLogger from 'redux-logger';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import { createHistory } from 'history';

import { selectLibrary } from '../actions';
import Library from './library';
import reducers from '../reducers';

import CollectionTreeContainer from '../collection/collection-tree-container';
import ItemListContainer from '../item/item-list-container';
import ItemDetailsContainer from '../item/item-details-container';
import TouchHeaderContainer from './touch-header-container';
import { getCurrentViewFromState } from '../state-utils';

 //@TODO: ensure this doesn't affect prod build
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const combinedReducers = combineReducers(Object.assign({}, reducers, {
	router: routerStateReducer
}));

class LibraryContainer extends React.Component {
	componentDidMount() {
		this.props.dispatch(
			selectLibrary('user', this.props.userId, this.props.apiKey)
		);
	}

	render() {
		return <Library
			view={ this.props.view }
			injectCollectionTree = { CollectionTreeContainer }
			injectItemList = { ItemListContainer }
			injectItemDetails = { ItemDetailsContainer }
			injectTouchHeader = { TouchHeaderContainer }
		/>;
	}

	static init(element, userid, apiKey) {
		if(element) {
			const config = {
				apiKey: apiKey || element.getAttribute('data-apikey'),
				userId: userid || parseInt(element.getAttribute('data-userid'), 10)
			};

			var store = createStore(
				combinedReducers,
				{ config },
				composeEnhancers(
					applyMiddleware(
						ReduxThunk,
						createLogger()
					),
					reduxReactRouter({
						createHistory
					})
				)
			);

			ReactDOM.render(
				<Provider store={store}>
					<ReduxRouter>
						<Route path="/" component={ LibraryContainerWrapped }>
							<Route path="/collection/:collection" />
							<Route path="/collection/:collection/item/:item" />
						</Route>
					</ReduxRouter>
				</Provider>
				, element
			);
		}
	}
}

LibraryContainer.propTypes = {
	userId: React.PropTypes.number,
	apiKey: React.PropTypes.string,
	dispatch: React.PropTypes.func.isRequired,
	view: React.PropTypes.string
};

const mapStateToProps = state => {
	return {
		userId: state.config.userId,
		apiKey: state.config.apiKey,
		view: getCurrentViewFromState(state)
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch,
		push
	};
};

const LibraryContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(LibraryContainer);

export default LibraryContainerWrapped;