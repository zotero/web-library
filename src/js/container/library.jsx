'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ReduxThunk from 'redux-thunk';
import ReduxAsyncQueue from 'redux-async-queue';
import { bindActionCreators } from 'redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import withUserTypeDetection from '../enhancers/with-user-type-detector';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import createReducers from '../reducers';
import { configure, fetchGroups, fetchLibrarySettings, initialize,
	preferencesLoad, toggleNavbar, toggleTransitions, triggerResizeViewport,
	triggerSearchMode, navigate
} from '../actions';
import { routes, redirects } from '../routes';
import Library from '../component/library';
import {
	libraries as defaultLibraries,
	apiConfig as defaultApiConfig,
	stylesSourceUrl as defaultStylesSourceUrl,
	translateUrl as defaultTranslateUrl
} from '../constants/defaults';
import { ViewportContext, UserContext } from '../context';
import { DragDropContext } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import CustomDragLayer from '../component/drag-layer';
import { get } from '../utils';

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

		const { config, dispatch, libraryKey, userLibraryKey } = props;

		dispatch(preferencesLoad());
		dispatch(initialize());
		dispatch(fetchLibrarySettings());
		if(config.includeUserGroups) {
			dispatch(fetchGroups(userLibraryKey));
		}
		this.windowResizeHandler();
	}

	async componentDidMount() {
		window.addEventListener('resize', this.windowResizeHandler);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	componentDidUpdate({ isFetchingCollections: wasFetchingCollections,
		isFetchingLibrarySettings, libraryKey: prevLibraryKey }) {
		const { dispatch, isFetchingCollections, libraryKey } = this.props;

		if(!isFetchingCollections && wasFetchingCollections) {
			// setTimeout required to ensure everything else in the UI had
			// a chance to update before transition are enabled
			setTimeout(() => dispatch(toggleTransitions(true)))
		}

		if(libraryKey !== prevLibraryKey && !isFetchingLibrarySettings) {
			dispatch(fetchLibrarySettings());
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
		const stylesSourceUrl = config.stylesSourceUrl || defaultStylesSourceUrl;
		const translateUrl = config.translateUrl || defaultTranslateUrl;

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
				configure({ ...config, apiConfig, stylesSourceUrl, libraries, translateUrl })
			);

			if(process.env.NODE_ENV === 'development') {
				// only in development, expose redux store
				window.WebLibStore = store;
			}

			ReactDOM.render(
				<Provider store={store}>
					<ConnectedRouter history={history}>
						<BrowserRouter>
							<Switch>
								{ redirects.map(redirect =>
									<Redirect exact key={ redirect.from } from={ redirect.from } to={ redirect.to } />
								)}
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
		isMyPublications,
		isNavBarOpen,
		isSearchMode,
		isSelectMode,
		isTrash,
		itemsSource,
		libraryKey,
		noteKey,
		qmode,
		search,
		searchState,
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
	const isFetchingLibrarySettings = get(
		state, ['libraries', libraryKey, 'fetching', 'librarySettings']
	);

	return { config, view, userLibraryKey, viewport, isSearchMode, isSelectMode,
		itemsSource, collectionKey, isFetchingCollections, isFetchingLibrarySettings,
		isNavBarOpen, isMyPublications, isTrash, useTransitions, libraryKey, noteKey,
		search, searchState, tags, qmode,
	};
};


//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({
	...bindActionCreators({ navigate, triggerSearchMode, toggleNavbar }, dispatch),
	dispatch,
});


const LibraryContainerWrapped = withUserTypeDetection(connect(mapStateToProps, mapDispatchToProps)(LibraryContainer));

export default LibraryContainerWrapped;
