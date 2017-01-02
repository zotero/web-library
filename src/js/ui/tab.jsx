'use strict';

import React from 'react';

export default class Tab extends React.Component {
	render() {
		return (
			<div>
				{ this.props.children }
			</div>
		);
	}
}

Tab.propTypes = {
	children: React.PropTypes.node
};

Tab.defaultProps = {
	children: null
};