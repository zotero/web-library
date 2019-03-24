'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ReduxThunk from 'redux-thunk';
import ReduxAsyncQueue from 'redux-async-queue';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import withUserTypeDetection from '../enhancers/with-user-type-detector';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import createReducers from '../reducers';
import {
	configureApi,
	fetchGroups,
	fetchLibrarySettings,
	initialize,
	preferencesLoad,
	toggleTransitions,
	triggerResizeViewport,
} from '../actions';
import routes from '../routes';
import Library from '../component/library';
import {
	libraries as defaultLibraries,
	apiConfig as defaultApiConfig,
	stylesSourceUrl as defaultStylesSourceUrl
} from '../constants/defaults';
import { ViewportContext, UserContext } from '../context';
import { DragDropContext } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import CustomDragLayer from '../component/drag-layer';

 //@TODO: ensure this doesn't affect prod build
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const history = createBrowserHistory();

@DragDropContext(MultiBackend(HTML5toTouch))
class LibraryContainer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.windowResizeHandler = () => {
			this.props.dispatch(
				triggerResizeViewport(window.innerWidth, window.innerHeight)
			);
		};

		const { config, dispatch, userLibraryKey } = props;

		dispatch(preferencesLoad());
		dispatch(initialize());
		if(config.libraries.includeUserGroups) {
			dispatch(fetchGroups(userLibraryKey));
		}
		dispatch(fetchLibrarySettings());
		this.windowResizeHandler();
	}

	async componentDidMount() {
		window.addEventListener('resize', this.windowResizeHandler);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	componentDidUpdate({ isFetchingCollections: wasFetchingCollections }) {
		const { dispatch, isFetchingCollections } = this.props;


		if(!isFetchingCollections && wasFetchingCollections) {
			// setTimeout required to ensure everything else in the UI had
			// a chance to update before transition are enabled
			setTimeout(() => dispatch(toggleTransitions(true)))
		}
	}

	render() {
		const { user, viewport, libraryKey } = this.props;

		if(libraryKey) {
			return (
				<ViewportContext.Provider value={ viewport }>
				<UserContext.Provider value={ user }>
					<CustomDragLayer />
					<Library { ...this.props } />
				</UserContext.Provider>
				</ViewportContext.Provider>
			);
		} else {
			return null;
		}
	}

	static init(element, config = {}) {
		const libraries = { ...defaultLibraries, ...config.libraries };
		const apiConfig = { ...defaultApiConfig, ...config.apiConfig };
		const stylesSourceUrl = defaultStylesSourceUrl || config.stylesSourceUrl;
		const { apiKey, userId } = config;

		if(element) {
			var store = createStore(
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
				configureApi({ userId, apiKey, apiConfig, stylesSourceUrl, libraries })
			);

			ReactDOM.render(
				<Provider store={store}>
					<ConnectedRouter history={history}>
						<BrowserRouter>
							<Switch>
								{ routes.map(route =>
									<Route key={ route } path={ route } component={ LibraryContainerWrapped } />
								)}
							</Switch>
						</BrowserRouter>
					</ConnectedRouter>
				</Provider>
				, element
			);
		}
	}
}

LibraryContainer.propTypes = {
	config: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	view: PropTypes.string
};

const mapStateToProps = state => {
	const {
		collectionKey,
		isSelectMode,
		itemsSource,
		libraryKey,
		search,
		tags,
		useTransitions,
		view,
	} = state.current;
	const {
		config,
		current: { userLibraryKey },
		fetching: { collectionsInLibrary },
		viewport,
	} = state;
	const isFetchingCollections = collectionsInLibrary
		.some(key => key === userLibraryKey || key === libraryKey);

	return { config, view, userLibraryKey, viewport, isSelectMode,
		itemsSource, collectionKey, isFetchingCollections, useTransitions,
		libraryKey, search, tags };
};

const LibraryContainerWrapped = withUserTypeDetection(connect(mapStateToProps)(LibraryContainer));

export default LibraryContainerWrapped;
