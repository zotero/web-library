'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { pluralize } from '../../common/format';

class ItemDetailsInfoSelected extends React.PureComponent {
	render() {
		const { itemKeys: { length: count } } = this.props;
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
		itemKeys: PropTypes.array.isRequired
	}
}

export default ItemDetailsInfoSelected;
