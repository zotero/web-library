'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const ReduxThunk = require('redux-thunk').default;
const ReduxAsyncQueue = require('redux-async-queue').default;
const { createStore, applyMiddleware, compose } = require('redux');
const { Provider, connect } = require('react-redux');
const withUserTypeDetection = require('../enhancers/with-user-type-detector');
// const createHistory = require('history/createBrowserHistory');
// const { Route } = require('react-router');
const { createBrowserHistory } = require('history');
const { routerMiddleware, ConnectedRouter } = require('connected-react-router');
const { BrowserRouter, Route, Switch } = require('react-router-dom');
// const deepEqual = require('deep-equal');
const createReducers = require('../reducers');
const {
	configureApi,
	fetchGroups,
	fetchLibrarySettings,
	initialize,
	preferencesLoad,
	toggleTransitions,
	triggerResizeViewport,
} = require('../actions');
const routes = require('../routes');
const Library = require('../component/library');
const defaults = require('../constants/defaults');
const { ViewportContext, UserContext } = require('../context');
const { DragDropContext } = require('react-dnd');
const { default: MultiBackend } = require('react-dnd-multi-backend');
const HTML5toTouch = require('react-dnd-multi-backend/lib/HTML5toTouch').default;
const CustomDragLayer = require('../component/drag-layer');

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
		const libraries = { ...defaults.libraries, ...config.libraries };
		const apiConfig = { ...defaults.apiConfig, ...config.apiConfig };
		const { apiKey, stylesSourceUrl, userId } = {
			...defaults, ...config
		};
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

module.exports = LibraryContainerWrapped;
