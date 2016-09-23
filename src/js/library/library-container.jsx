'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { selectLibrary } from '../actions.js';
import Library from './library.jsx';

class LibraryContainer extends React.Component {
	componentDidMount() {
		this.props.dispatch(
			selectLibrary('user', this.props.userId, this.props.apiKey)
		);
	}

	render() {
		return <Library />;
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

export default connect(mapStateToProps)(LibraryContainer);