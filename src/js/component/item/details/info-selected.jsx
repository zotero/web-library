'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { pluralize } from '../../../common/format';

class ItemDetailsInfoSelected extends React.PureComponent {
	render() {
		const { selectedItemKeys: { length: count } } = this.props;
		const label = [
			count === 0 ? 'No' : count,
			pluralize('Item', count),
			'Selected'
		].join(' ');
		return (
			<div className="info-view">
				{ label }
			</div>
		);
	}

	static propTypes = {
		selectedItemKeys: PropTypes.array.isRequired
	}
}

export default ItemDetailsInfoSelected;
