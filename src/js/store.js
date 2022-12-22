import { configureStore } from '@reduxjs/toolkit'
import { connectRouter, routerMiddleware } from 'connected-react-router';
import ReduxAsyncQueue from 'redux-async-queue';
import ReduxThunk from 'redux-thunk';
import { createBrowserHistory } from 'history';

import createReducers from './reducers';

export const history = createBrowserHistory();

export const setupStore = preloadedState => configureStore({
	reducer: createReducers({ router: connectRouter(history) }),
	middleware: [routerMiddleware(history), ReduxThunk, ReduxAsyncQueue],
	devTools: true,
	preloadedState
});
