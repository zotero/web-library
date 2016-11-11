'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { selectLibrary } from '../actions';
import Library from './library';

import createLogger from 'redux-logger';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import reducers from '../reducers';

class LibraryContainer extends React.Component {
	componentDidMount() {
		this.props.dispatch(
			selectLibrary('user', this.props.userId, this.props.apiKey)
		);
	}

	render() {
		return <Library
			view={ this.props.view }
		/>;
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
	dispatch: React.PropTypes.func.isRequired,
	view: React.PropTypes.string
};

const getCurrentViewFromState = state => {
	if(state.library &&
		state.collections[state.library.libraryString] &&
		state.collections.selected) {
			let selectedCollectionKey = state.collections.selected;
			let collections = state.collections[state.library.libraryString].collections;
			let selectedCollection = collections.find(c => c.key === selectedCollectionKey);
			if(selectedCollection && !selectedCollection.hasChildren) {
				return 'items';
			}	
	}

	return 'library';
};

const mapStateToProps = state => {
	return {
		userId: state.config.userId,
		apiKey: state.config.apiKey,
		view: getCurrentViewFromState(state) //@TODO: memoize
	};
};

const LibraryContainerWrapped = connect(mapStateToProps)(LibraryContainer);

export default LibraryContainerWrapped;