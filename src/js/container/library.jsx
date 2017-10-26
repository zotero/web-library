'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const ReduxThunk = require('redux-thunk').default;
const ReduxAsyncQueue = require('redux-async-queue').default;
const { createHistory } = require('history');
const { createStore, applyMiddleware, compose, combineReducers } = require('redux');
const { Provider, connect } = require('react-redux');
const { reduxReactRouter, routerStateReducer, ReduxRouter, push } = require('redux-router');
const { Route } = require('react-router');
const reducers = require('../reducers');
const { getCurrentViewFromState } = require('../state-utils');
const { selectLibrary, initialize, triggerResizeViewport } = require('../actions');
const Library = require('../component/library');

 //@TODO: ensure this doesn't affect prod build
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const combinedReducers = combineReducers(Object.assign({}, reducers, {
	router: routerStateReducer
}));

class LibraryContainer extends React.Component {
	constructor(props) {
		super(props);
		this.windowResizeHandler = () => {
			this.props.dispatch(
				triggerResizeViewport(window.innerWidth, window.innerHeight)
			);
		};
	}
	
	async componentDidMount() {
		let { apiKey, userId, api } = this.props;
		
		await this.props.dispatch(
			initialize(apiKey, api)
		);
		
		//@TODO: introduce multi-library support
		this.props.dispatch(
			selectLibrary('user', userId)
		);
	}

	componentWillMount() {
		this.windowResizeHandler();
		window.addEventListener('resize', this.windowResizeHandler);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	render() {
		return <Library view={ this.props.view } />;
	}

	static init(element, opts = {}) {
		if(element) {
			//@TODO: use an action CONFIGURE_API instead
			const config = {
				apiKey: opts.apiKey || element.getAttribute('data-apikey'),
				userId: opts.userId || parseInt(element.getAttribute('data-userid'), 10),
				apiConfig: {
					...opts.api
				}
			};

			var store = createStore(
				combinedReducers,
				{ config },
				composeEnhancers(
					applyMiddleware(
						ReduxThunk,
						ReduxAsyncQueue
					),
					reduxReactRouter({
						createHistory
					})
				)
			);

			ReactDOM.render(
				<Provider store={store}>
					<ReduxRouter>
						<Route path="/" component={LibraryContainerWrapped}>
							<Route path="/collection/:collection" />
							<Route path="/collection/:collection/item/:item" />
						</Route>
					</ReduxRouter>
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
		view: getCurrentViewFromState(state),
		userId: state.config.userId || null,
		api: state.config.api || null,
		apiKey: state.config.apiKey || null
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch,
		push
	};
};

const LibraryContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(LibraryContainer);

module.exports = LibraryContainerWrapped;