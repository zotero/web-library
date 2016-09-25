'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { selectLibrary } from '../actions.js';
import Library from './library.jsx';

import createLogger from 'redux-logger';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import reducers from '../reducers.js';

class LibraryContainer extends React.Component {
	componentDidMount() {
		this.props.dispatch(
			selectLibrary('user', this.props.userId, this.props.apiKey)
		);
	}

	render() {
		return <Library />;
	}

	static init(element, userid, apiKey) {
		if(element) {			
			const config = {
				apiKey: apiKey || element.getAttribute('data-apikey'),
				userId: userid || parseInt(element.getAttribute('data-userid'), 10)
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
					<LibraryContainerWrapped />
				</Provider>,
				element
			);
		}
	}
}

LibraryContainer.propTypes = {
	userId: React.PropTypes.number,
	apiKey: React.PropTypes.string,
	dispatch: React.PropTypes.func.isRequired
};

const mapStateToProps = state => {
	return {
		userId: state.config.userId,
		apiKey: state.config.apiKey
	};
};

const LibraryContainerWrapped = connect(mapStateToProps)(LibraryContainer);

export default LibraryContainerWrapped;