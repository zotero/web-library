import React from 'react';
import ReactDOM from 'react-dom';
import ReduxAsyncQueue from 'redux-async-queue';
import ReduxThunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';

import * as defaults from './constants/defaults';
import createReducers from './reducers';
import Main from './component/main';
import { configure } from './actions';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const history = createBrowserHistory();

const init = (element, config = {}) => {
	const libraries = { ...defaults.libraries, ...config.libraries };
	const apiConfig = { ...defaults.apiConfig, ...config.apiConfig };

	const store = createStore(
		createReducers(history),
		composeEnhancers(
			applyMiddleware(
				routerMiddleware(history),
				ReduxThunk,
				ReduxAsyncQueue
			)
		)
	);

	store.dispatch(
		configure({ ...defaults, ...config, apiConfig, libraries })
	);

	if(process.env.NODE_ENV === 'development') {
		// only in development, expose redux store
		window.WebLibStore = store;
	}

	ReactDOM.render(<Main store={ store } history={ history } />, element);
}

export default init;
