'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const ReduxThunk = require('redux-thunk').default;
const ReduxAsyncQueue = require('redux-async-queue').default;
const { createStore, applyMiddleware, compose, combineReducers } = require('redux');
const { Provider, connect } = require('react-redux');
// const createHistory = require('history/createBrowserHistory');
// const { Route } = require('react-router');
const { BrowserRouter, Route, Switch } = require('react-router-dom');
const deepEqual = require('deep-equal');
const reducers = require('../reducers');
const {
	changeRoute,
	configureApi,
	fetchGroups,
	fetchLibrarySettings,
	initialize,
	preferencesLoad,
	triggerResizeViewport,
} = require('../actions');
const Library = require('../component/library');
const defaults = require('../constants/defaults');
const { ViewportContext } = require('../context');
const { DragDropContext } = require('react-dnd');
const { default: MultiBackend } = require('react-dnd-multi-backend');
const HTML5toTouch = require('react-dnd-multi-backend/lib/HTML5toTouch').default;
const CustomDragLayer = require('../component/drag-layer');

 //@TODO: ensure this doesn't affect prod build
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const combinedReducers = combineReducers(reducers);


@DragDropContext(MultiBackend(HTML5toTouch))
class LibraryContainer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.windowResizeHandler = () => {
			this.props.dispatch(
				triggerResizeViewport(window.innerWidth, window.innerHeight)
			);
		};
	}

	async componentDidMount() {
		this.props.dispatch(preferencesLoad());

		this.props.dispatch(
			initialize()
		);
		this.props.dispatch(
			changeRoute(this.props.match)
		);
		this.props.dispatch(
			fetchGroups(this.props.userLibraryKey)
		);
		this.props.dispatch(
			fetchLibrarySettings()
		);

		this.windowResizeHandler();
		window.addEventListener('resize', this.windowResizeHandler);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	componentDidUpdate({ match: previousMatch }) {
		if(!deepEqual(this.props.match, previousMatch)) {
			this.props.dispatch(changeRoute(this.props.match));
		}
	}

	render() {
		return (
			<ViewportContext.Provider value={ this.props.viewport }>
				<CustomDragLayer />
				<Library { ...this.props } />
			</ViewportContext.Provider>
		);
	}

	static init(element, config = {}) {
		const { apiKey, apiConfig, userId } = {...defaults, ...config };
		if(element) {
			var store = createStore(
				combinedReducers,
				composeEnhancers(
					applyMiddleware(
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
					<BrowserRouter>
						<Switch>
							<Route path="/collection/:collection/tags/:tags/items/:items" component={LibraryContainerWrapped} />
							<Route path="/collection/:collection/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/collection/:collection/items/:items" component={LibraryContainerWrapped} />
							<Route path="/collection/:collection/tags/:tags/search/:search" component={LibraryContainerWrapped} />
							<Route path="/collection/:collection/tags/:tags/" component={LibraryContainerWrapped} />
							<Route path="/collection/:collection/search/:search" component={LibraryContainerWrapped} />
							<Route path="/collection/:collection/:view(collection|item-list|item-details)?" component={LibraryContainerWrapped} />
							<Route path="/items/:items" component={LibraryContainerWrapped} />
							<Route path="/tags/:tags/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/tags/:tags/search/:search" component={LibraryContainerWrapped} />
							<Route path="/tags/:tags/items/:items" component={LibraryContainerWrapped} />
							<Route path="/tags/:tags" component={LibraryContainerWrapped} />
							<Route path="/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/search/:search" component={LibraryContainerWrapped} />
							<Route path="/trash/items/:items" component={LibraryContainerWrapped} />
							<Route path="/trash" component={LibraryContainerWrapped} />
							<Route path="/publications/items/:items" component={LibraryContainerWrapped} />
							<Route path="/publications" component={LibraryContainerWrapped} />
							<Route path="/:view(libraries|library|collection|item-list|item-details)" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/tags/:tags/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/tags/:tags/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/tags/:tags/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/tags/:tags/search/:search" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/tags/:tags/" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/search/:search" component={LibraryContainerWrapped} />
							<Route path="/:library/collection/:collection/:view(libraries|library|collection|item-list|item-details)?" component={LibraryContainerWrapped} />
							<Route path="/:library/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/tags/:tags/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/tags/:tags/search/:search" component={LibraryContainerWrapped} />
							<Route path="/:library/tags/:tags/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/tags/:tags" component={LibraryContainerWrapped} />
							<Route path="/:library/search/:search/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/search/:search" component={LibraryContainerWrapped} />
							<Route path="/:library/trash/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/trash" component={LibraryContainerWrapped} />
							<Route path="/:library/publications/items/:items" component={LibraryContainerWrapped} />
							<Route path="/:library/publications" component={LibraryContainerWrapped} />
							<Route path="/:library/:view(library|collection|item-list|item-details)" component={LibraryContainerWrapped} />
							<Route path="/:library" component={LibraryContainerWrapped} />
							<Route path="/" component={LibraryContainerWrapped} />
						</Switch>
					</BrowserRouter>
				</Provider>
				, element
			);
		}
	}
}

LibraryContainer.propTypes = {
	userId: PropTypes.string,
	apiKey: PropTypes.string,
	api: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	view: PropTypes.string
};

const mapStateToProps = state => {
	return {
		view: state.current.view,
		userId: state.config.userId,
		userLibraryKey: state.config.userLibraryKey,
		api: state.config.api,
		apiKey: state.config.apiKey,
		viewport: state.viewport,
		itemsSource: state.current.itemsSource,
		collectionKey: state.current.collection,
	};
};

const mapDispatchToProps = (dispatch) => {
	return { dispatch };
};

const LibraryContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(LibraryContainer);

module.exports = LibraryContainerWrapped;
