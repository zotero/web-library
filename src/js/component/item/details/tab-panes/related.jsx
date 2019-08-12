'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import RelationsContainer from '../../../../container/related';

const RelatedTabPane = ({ isActive, item }) => (
	<div className={ cx({
		'tab-pane': true,
		'related': true,
		'active': isActive,
	}) }>
		{
			isActive && (
				<React.Fragment>
					<h5 className="h2 tab-pane-heading hidden-mouse">Related</h5>
					<RelationsContainer key={ item.key } />
				</React.Fragment>
			)
		}
	</div>
);

RelatedTabPane.propTypes = {
	isActive: PropTypes.bool,
	item: PropTypes.object,
}

export default RelatedTabPane;
