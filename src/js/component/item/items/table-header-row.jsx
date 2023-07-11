import PropTypes from 'prop-types';
import React, { forwardRef, memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { isTriggerEvent } from 'web-common/utils';
import { Icon } from 'web-common/components';

import Cell from './table-cell';
import columnProperties from '../../../constants/column-properties';
import { updateItemsSorting } from '../../../actions';

const ROWHEIGHT = 26;

const HeaderRow = memo(forwardRef((props, ref) => {
	const dispatch = useDispatch();
	const mouseState = useRef(null);
	const { columns, width, isReordering, isResizing, onReorder, onResize, reorderTarget, sortBy, sortDirection } = props;
	const { handleFocusNext, handleFocusPrev } = props; // drilldown focus management on table

	const handleCellClickAndKeyDown = ev => {
		if(isTriggerEvent(ev)) {
			const { columnName } = ev.currentTarget.dataset;
			if(isResizing || isReordering || !(columnName in columnProperties) || !columnProperties[columnName].sortKey) {
				return;
			}

			dispatch(updateItemsSorting(
				columnName,
				columnName === sortBy ? sortDirection === 'asc' ? 'desc' : 'asc' : 'asc'
			));
			ev.preventDefault();
		}
	}

	const handleKeyDown = ev => {
		if((ev.key === 'ArrowDown' || ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
			if(ev.key === 'ArrowDown') {
				ref.current.closest('.items-table').querySelector('.items-table-body').focus();
			}
			else if(ev.key === 'ArrowRight') {
				handleFocusNext(ev);
			}
			else if(ev.key === 'ArrowLeft') {
				handleFocusPrev(ev);
			}
			ev.preventDefault();
			return;
		}
	}

	const handleFocus = useCallback(ev => {
		if(ev.currentTarget === ev.target) {
			handleFocusNext(ev);
		}
	});

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
			tabIndex={ -2 }
			ref={ ref }
			className="items-table-head"
			style={ { height: ROWHEIGHT, width } }
			onKeyDown={ handleKeyDown }
			onMouseDown={ handleMouseDown }
			onMouseMove={ handleMouseMove }
			onMouseUp = { handleMouseUp }
			onFocus={ handleFocus }
			role="row"
		>
			{ columns.map((c, colIndex) => (
				<Cell
					aria-sort={ sortDirection === 'asc' ? 'ascending' : 'descending' }
					className='column-header'
					columnName={ c.field }
					index={ colIndex }
					key={ c.field }
					onClick={ handleCellClickAndKeyDown }
					onKeyDown={ handleCellClickAndKeyDown }
					role="columnheader"
					tabIndex={ -3 }
					width={ `var(--col-${colIndex}-width)` }
				>
					<div className="header-content">
						{ reorderTarget && colIndex === reorderTarget.index && reorderTarget.isMovingLeft &&
							<div className="reorder-target reorder-left" />
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
									c.field in columnProperties ? columnProperties[c.field].name : c.field
							}
						</div>
						{ sortBy === c.field &&
							<Icon type={ '16/chevron-7' } width="16" height="16" className="sort-indicator" />
						}
						{ reorderTarget && colIndex === reorderTarget.index && reorderTarget.isMovingRight &&
							<div className="reorder-target reorder-right" />
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
	handleFocusNext: PropTypes.func,
	handleFocusPrev: PropTypes.func,
	isReordering: PropTypes.bool,
	isResizing: PropTypes.bool,
	onReorder: PropTypes.func,
	onResize: PropTypes.func,
	reorderTarget: PropTypes.object,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.oneOf(['asc', 'desc']),
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default HeaderRow;
