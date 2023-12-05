import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware, compose } from 'redux';
import ReduxAsyncQueue from 'redux-async-queue';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';

import { LOCATION_CHANGE } from 'connected-react-router';

import './wdyr';
import * as defaults from './constants/defaults';
import createReducers from './reducers';
import ErrorBoundary from './component/error-boundry';
import Loader from './component/loader';
import UserTypeDetector from './component/user-type-detector';
import ViewPortDetector from './component/viewport-detector';
import { configure } from './actions';

const targetDom = document.getElementById('zotero-web-library');
const configDom = document.getElementById('zotero-web-library-config');
const menuConfigDom = document.getElementById('zotero-web-library-menu-config');
const config = configDom ? JSON.parse(configDom.textContent) : {};
config.menus = menuConfigDom ? JSON.parse(menuConfigDom.textContent) : null;
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const EmbeddedMain = ({ store }) => {
	return (
		<ErrorBoundary>
			<Provider store={ store }>
				<UserTypeDetector />
				<ViewPortDetector />
				<Loader />
			</Provider>
		</ErrorBoundary>
	)
}

const init = (element, config = {}) => {
	const libraries = { ...defaults.libraries, ...config.libraries };
	const apiConfig = { ...defaults.apiConfig, ...config.apiConfig };

	const store = createStore(
		createReducers(),
		composeEnhancers(
			applyMiddleware(
				thunk,
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

	const root = createRoot(targetDom);
	root.render(<EmbeddedMain store={ store } />);
}

if(targetDom) {
	targetDom.classList.add(({ ...defaults, ...config }).containterClassName);
	init(targetDom, config);
}
