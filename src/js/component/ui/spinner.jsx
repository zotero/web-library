'use strict';

const React = require('react');
const Icon = require('./icon');

class Spinner extends React.Component {
	render() {
		return <Icon type="16/spin" width="16" height="16"/>;
	}
}

module.exports = Spinner;