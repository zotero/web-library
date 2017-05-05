'use strict';

import React from 'react';

export default class EditableContent extends React.Component {
	render() {
		if(this.props.name === 'DOI') {
			return <a rel='nofollow' href={ 'http://dx.doi.org/' + this.props.value }>{ this.props.value }</a>;
		} else if(this.props.name === 'url') {
			return <a rel='nofollow' href={ this.props.value }>{ this.props.value }</a>;
		} else {
			return <span>{ this.props.value }</span>;
		}
	}
}

EditableContent.propTypes = {
	name: React.PropTypes.string,
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	])
};

EditableContent.defaultProps = {
	name: '',
	value: ''
};