import cx from 'classnames';
import PropTypes from 'prop-types';
import { pick } from 'web-common/utils';

const Cell = ({ children, className, columnName, index, isFirstColumn, isLastColumn, width, style = {}, ...rest }) => {
	width = rest['aria-role'] === 'columnheader' ? width : (isFirstColumn || isLastColumn) ? `calc(${width} - 8px)` : width;

	return (
		<div
			aria-colindex={ index }
			className={ cx('metadata', columnName, className) }
			data-colindex={ index }
			data-column-name={ columnName }
			role="gridcell"
			style={ { ...style, width } }
			{ ...pick(rest, ['onClick', 'onKeyDown', 'tabIndex', 'role']) }
			{ ...pick(rest, key => key.match(/^(aria-|data-).*/)) }
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
	isFirstColumn: PropTypes.bool,
	isLastColumn: PropTypes.bool,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Cell;
