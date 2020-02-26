import cx from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import { pick } from '../../../common/immutable';

const Cell = props => {
	const { children, className, columnName, index, width, style = {} } = props;

	return (
		<div
			aria-colindex={ index }
			className={ cx('metadata', columnName, className) }
			data-colindex={ index }
			data-column-name={ columnName }
			role="gridcell"
			style={ { ...style, width } }
			{ ...pick(props, ['onClick', 'onKeyDown', 'tabIndex', 'role']) }
			{ ...pick(props, key => key.match(/^(aria-|data-).*/)) }
		>
			{ children }
		</div>
	)
}

Cell.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	columnName: PropTypes.string,
	index: PropTypes.number,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Cell;
