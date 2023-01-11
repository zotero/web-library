import { configureStore } from '@reduxjs/toolkit'
import { connectRouter, routerMiddleware } from 'connected-react-router';
import ReduxAsyncQueue from 'redux-async-queue';
import ReduxThunk from 'redux-thunk';
import { createBrowserHistory } from 'history';

import createReducers from './reducers';

export const setupStore = preloadedState => {
	const history = createBrowserHistory();
	const store = configureStore({
		reducer: createReducers({ router: connectRouter(history) }),
		middleware: [routerMiddleware(history), ReduxThunk, ReduxAsyncQueue],
		devTools: true,
		preloadedState
	});

	return { store, history };
}
