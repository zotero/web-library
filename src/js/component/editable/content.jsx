'use strict';

const escapeHtml = require('escape-html');

const React = require('react');
const PropTypes = require('prop-types');

class EditableContent extends React.Component {
	render() {
		if(this.props.isTextArea) {
			return <span dangerouslySetInnerHTML={ { __html: escapeHtml(this.props.value).replace(/\n/g, 
			'<br />') } }></span>;
		} else {
			if(!this.props.value && this.props.placeholder) {
				return <span className="editable-content placeholder">{ this.props.placeholder }</span>;
			} else {
				return <span className="editable-content">{ this.props.value }</span>;
			}
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