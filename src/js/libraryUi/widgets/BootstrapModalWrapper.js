'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:BootstrapModalWrapper');

var React = require('react');

var BootstrapModalWrapper = React.createClass({
	// The following two methods are the only places we need to
	// integrate Bootstrap or jQuery with the components lifecycle methods.
	componentDidMount: function() {
		// When the component is added, turn it into a modal
		log.debug('BootstrapModalWrapper componentDidMount', 3);
		J(this.refs.root).modal({backdrop: 'static', keyboard: false, show: false});
	},
	componentWillUnmount: function() {
		log.debug('BootstrapModalWrapper componentWillUnmount', 3);
		J(this.refs.root).off('hidden', this.handleHidden);
	},
	close: function() {
		log.debug('BootstrapModalWrapper close', 3);
		J(this.refs.root).modal('hide');
	},
	open: function() {
		log.debug('BootstrapModalWrapper open', 3);
		J(this.refs.root).modal('show');
	},
	render: function() {
		return (
			<div className="modal" ref="root">
				{this.props.children}
			</div>
		);
	}
});

module.exports = BootstrapModalWrapper;
