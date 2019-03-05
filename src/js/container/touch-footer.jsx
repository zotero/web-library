'use strict';

const React = require('react');
const { connect } = require('react-redux');
const { pick } = require('../common/immutable');
const withItemsActions = require('../enhancers/with-items-actions');
const TouchFooter = require('../component/touch-footer');


class TouchFooterContainer extends React.PureComponent {
	render() {
		return <TouchFooter { ...this.props } />
	}
}

const mapStateToProps = state => {
	return { ...pick(state.current, ['itemKeys', 'itemsSource']) }
}


module.exports = withItemsActions(
	connect(mapStateToProps)(TouchFooterContainer)
);
