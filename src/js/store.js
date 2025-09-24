import { configureStore } from '@reduxjs/toolkit'
import ReduxAsyncQueue from 'redux-async-queue';
import { thunk } from 'redux-thunk';

import createReducers from './reducers';

export const setupStore = preloadedState => {
	const store = configureStore({
		reducer: createReducers(),
		middleware: () => [thunk, ReduxAsyncQueue],
		devTools: true,
		preloadedState
	});

	return store;
}
