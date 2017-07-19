'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class EditableContent extends React.Component {
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
	name: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	])
};

EditableContent.defaultProps = {
	name: '',
	value: ''
};

module.exports = EditableContent;