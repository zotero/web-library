'use strict';

import Zotero from 'libzotero';
import LibraryContainer from './library/library-container.jsx';

import React from 'react';
import ReactDOM from 'react-dom';
import reducers from './reducers.js';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import ReduxThunk from 'redux-thunk';


Zotero.config.baseApiUrl = 'https://apidev.zotero.org';
const config = {
	apiKey: '',
	userId: 0
};

var store = createStore(
	reducers,
	{ config },
	applyMiddleware(
		ReduxThunk,
		createLogger()
	)
);

ReactDOM.render(
	<Provider store={store}>
		<LibraryContainer />
	</Provider>,
	document.querySelector('[data-widget=library]')
);
