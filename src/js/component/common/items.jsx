import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector } from 'react-redux';

import Table from '../common/table';
import List from '../common/list';


const Items = memo(({ listContainerClassName, tableContainerClassName, containerClassName, ...rest}) => {
	listContainerClassName = listContainerClassName || containerClassName || 'items-list';
	tableContainerClassName = tableContainerClassName || containerClassName || 'items-table';
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	return (
		isTouchOrSmall ? (
			<List
				containerClassName={listContainerClassName}
				{...rest}
			/>
		) : (
			<Table
				containerClassName={tableContainerClassName}
				{...rest}
			/>
		));
});

Items.displayName = 'Items';

Items.propTypes = {
	listContainerClassName: PropTypes.string,
	tableContainerClassName: PropTypes.string,
	containerClassName: PropTypes.string,
}

export default Items;
