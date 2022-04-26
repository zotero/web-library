import React from 'react';
import { createRoot } from 'react-dom/client';
import ReduxAsyncQueue from 'redux-async-queue';
import ReduxThunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, compose } from 'redux';
import { connectRouter, LOCATION_CHANGE, routerMiddleware } from 'connected-react-router';

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
		createReducers({ router: connectRouter(history) }),
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

	if(store.getState().config.isEmbedded) {
		store.dispatch({
			type: LOCATION_CHANGE,
			payload: {
				location: {
					pathname: '/',
					search: '',
					hash: '',
					key: '',
				},
				action: 'POP',
				isFirstRendering: true
			}
		});
	}

	if(process.env.NODE_ENV === 'development') {
		// only in development, expose redux store
		window.WebLibStore = store;
		window.WebLibCrash = () =>
			window.WebLibStore.dispatch({ type: 'CONFIGURE', ...defaults, ...config, apiConfig, libraries, menus: null });
	}

	const root = createRoot(element);
	root.render(<Main store={ store } history={ history } />);
}

export default init;
