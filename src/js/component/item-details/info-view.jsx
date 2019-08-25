import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { pluralize } from '../../common/format';

const ItemDetailsInfoView = ({ itemsCount }) => {
	const [label, setLabel] = useState('');

	useEffect(() => {
		const label = typeof(itemsCount) === 'number' ? [
			itemsCount === 0 ? 'No' : itemsCount,
			pluralize('Item', itemsCount),
			'in this view'
		].join(' ') : '';
		setLabel(label);
	}, [itemsCount]);

	return <div className="info-view">{ label }</div>;
}

ItemDetailsInfoView.propTypes = {
	itemsCount: PropTypes.number
}

ItemDetailsInfoView.defaultProps = {
	itemsCount: null
}

export default ItemDetailsInfoView;
