import PropTypes from 'prop-types';
import React, { forwardRef, memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import Cell from './table-cell';
import columnNames from '../../../constants/column-names';
import Icon from '../../ui/icon';
import { updateItemsSorting } from '../../../actions';
import { useFocusManager } from '../../../hooks';

const ROWHEIGHT = 26;

const HeaderRow = memo(forwardRef((props, ref) => {
	const dispatch = useDispatch();
	const mouseState = useRef(null);
	const { columns, width, isReordering, isResizing, onReorder, onResize, reorderTargetIndex, sortBy, sortDirection } = props;
	const { handleFocus, handleBlur, handleNext, handlePrevious } = useFocusManager(ref);

	const handleClick = ev => {
		const { columnName } = ev.currentTarget.dataset;
		if(isResizing || isReordering) { return; }

		dispatch(
			updateItemsSorting(
				columnName,
				columnName === sortBy ? sortDirection === 'asc' ? 'desc' : 'asc' : 'desc'
			)
		);
	}

	const handleKeyDown = ev => {
		if((ev.key === 'ArrowDown' || ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
			if(ev.key === 'ArrowDown') {
				ev.currentTarget.closest('[tabIndex="0"]').focus();
			}
			else if(ev.key === 'ArrowRight') {
				handleNext(ev, false);
			}
			else if(ev.key === 'ArrowLeft') {
				handlePrevious(ev, false);
			}
			ev.preventDefault();
			return;
		}
	}

	const handleMouseDown = useCallback(ev => {
		if('resizeHandle' in ev.target.dataset) {
			return;
		}
		ev.persist();
		const timeout = setTimeout(() => {
			if(!isReordering && mouseState.current !== null) {
				onReorder(ev);
			}
		}, 300);
		mouseState.current = { x: ev.clientX, y: ev.clientY, stamp: Date.now(), triggerEvent: ev, timeout };
	});

	const handleMouseUp = useCallback(() => {
		mouseState.current = null;
	});

	const handleMouseMove = useCallback(ev => {
		if(mouseState.current !== null) {
			const { triggerEvent, x, y } = mouseState.current;
			const pixelsTravelled = Math.abs(ev.clientX - x) + Math.abs(ev.clientY - y);
			if(pixelsTravelled > 10) {
				clearTimeout(mouseState.current.timeout);
				onReorder(triggerEvent);
				mouseState.current = null;
			}
		}
	});

	useEffect(() => {
		mouseState.current = null;
	}, [isReordering])

	return (
		<div
			tabIndex={ -1 }
			ref={ ref }
			className="items-table-head"
			style={ { height: ROWHEIGHT, width } }
			onKeyDown={ handleKeyDown }
			onFocus={ handleFocus }
			onBlur={ handleBlur }
			onMouseDown={ handleMouseDown }
			onMouseMove={ handleMouseMove }
			onMouseUp = { handleMouseUp }
		>
			{ columns.map((c, colIndex) => (
				<Cell
					aria-sort={ sortDirection === 'asc' ? 'ascending' : 'descending' }
					className='column-header'
					columnName={ c.field }
					index={ colIndex }
					key={ c.field }
					onClick={ handleClick }
					width={ `var(--col-${colIndex}-width)` }
					tabIndex={ -2 }
				>
					<div className="header-content">
						{ colIndex === reorderTargetIndex &&
							<div className="reorder-target" />
						}
						{ colIndex !== 0 &&
							<div
								data-resize-handle
								className="resize-handle"
								key="resize-handle"
								onMouseDown={ onResize }
							/>
						}
						<div className="header-label truncate">
							{
								c.field === 'attachment' ?
									<Icon type={ '16/attachment' } width="16" height="16" /> :
									c.field in columnNames ? columnNames[c.field] : c.field
							}
						</div>
						{ sortBy === c.field &&
							<Icon type={ '16/chevron-7' } width="16" height="16" className="sort-indicator" />
						}
					</div>
				</Cell>
			))}
		</div>
	);
}));

HeaderRow.displayName = 'HeaderRow';

HeaderRow.propTypes = {
	columns: PropTypes.array,
	isReordering: PropTypes.bool,
	isResizing: PropTypes.bool,
	onReorder: PropTypes.func,
	onResize: PropTypes.func,
	reorderTargetIndex: PropTypes.number,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.oneOf(['asc', 'desc']),
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default HeaderRow;
