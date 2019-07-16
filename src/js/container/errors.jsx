'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { dismissError } from '../actions';
import Errors from '../component/errors';

class ErrorsContainer extends React.PureComponent {
	render() {
		return <Errors { ...this.props } />
	}
}

const mapStateToProps = state => {
	const { errors } = state;
	return { errors }
}


export default connect(mapStateToProps, { dismissError })(ErrorsContainer);
