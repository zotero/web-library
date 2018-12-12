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
const { getCurrent } = require('../common/state');
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

		props.dispatch(preferencesLoad());

		props.dispatch(
			initialize()
		);

		props.dispatch(
			fetchGroups(this.props.userLibraryKey)
		);
		props.dispatch(
			fetchLibrarySettings()
		);

		this.windowResizeHandler();
	}

	async componentDidMount() {
		window.addEventListener('resize', this.windowResizeHandler);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	componentDidUpdate({ match: previousMatch, isFetchingCollections: wasFetchingCollections }) {
		const { dispatch, isFetchingCollections } = this.props;

		// if(!deepEqual(this.props.match, previousMatch)) {
		// 	dispatch(changeRoute(this.props.match));
		// }

		if(!isFetchingCollections && wasFetchingCollections) {
			// setTimeout required to ensure everything else in the UI had
			// a chance to update before transition are enabled
			setTimeout(() => dispatch(toggleTransitions(true)))
		}
	}

	render() {
		const { user, viewport, libraryKey } = this.props;

		return (
			<ViewportContext.Provider value={ viewport }>
			<UserContext.Provider value={ user }>
				<CustomDragLayer />
				<Library { ...this.props } />
			</UserContext.Provider>
			</ViewportContext.Provider>
		);
	}

	static init(element, config = {}) {
		const { apiKey, apiConfig, userId } = {...defaults, ...config };
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
				configureApi(userId, apiKey, apiConfig)
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
	apiKey: PropTypes.string,
	api: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	view: PropTypes.string
};

const mapStateToProps = state => {
	const {
		collectionKey,
		itemsSource,
		libraryKey,
		useTransitions,
		view,
	} = getCurrent(state);
	const {
		config: { userLibraryKey, api, apiKey },
		fetching: { collectionsInLibrary },
		viewport,
	} = state;
	const isFetchingCollections = collectionsInLibrary
		.some(key => key === userLibraryKey || key === libraryKey);

	return { view, userLibraryKey, api, apiKey, viewport, itemsSource,
		collectionKey, isFetchingCollections, useTransitions, libraryKey };
};

const LibraryContainerWrapped = withUserTypeDetection(connect(mapStateToProps)(LibraryContainer));

module.exports = LibraryContainerWrapped;
