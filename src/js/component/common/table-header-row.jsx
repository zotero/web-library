import PropTypes from 'prop-types';
import { forwardRef, memo, useCallback, useEffect, useRef } from 'react';
import { isTriggerEvent } from 'web-common/utils';
import { Icon } from 'web-common/components';
import { useFocusManager } from 'web-common/hooks';

import Cell from './table-cell';
import columnProperties from '../../constants/column-properties';
import { ROW_HEIGHT } from '../../constants/constants';

const HeaderRow = memo(forwardRef((props, ref) => {
	const mouseState = useRef(null);
	const { columns, width, isReordering, isResizing, onReorder, onResize, reorderTarget, onChangeSortOrder, sortBy, sortDirection } = props;
	const { focusNext, focusPrev, receiveFocus, receiveBlur } = useFocusManager(ref, { targetTabIndex: -3 });

	const handleCellClickAndKeyDown = ev => {
		if (isTriggerEvent(ev)) {
			const { columnName } = ev.currentTarget.dataset;
			if (isResizing || isReordering || !(columnName in columnProperties) || !columnProperties[columnName].sortKey) {
				return;
			}
			ev.preventDefault();
			onChangeSortOrder(columnName, ev);
		}
	}

	const handleKeyDown = ev => {
		if ((ev.key === 'ArrowDown' || ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
			if (ev.key === 'ArrowDown') {
				ref.current.closest('.items-table').querySelector('.items-table-body').focus();
			} else if (ev.key === 'ArrowRight') {
				focusNext(ev, { useCurrentTarget: false });
			} else if (ev.key === 'ArrowLeft') {
				focusPrev(ev, { useCurrentTarget: false });
			}
			ev.preventDefault();
			return;
		}
	}

	const handleMouseDown = useCallback(ev => {
		if ('resizeHandle' in ev.target.dataset) {
			return;
		}
		const timeout = setTimeout(() => {
			if (!isReordering && mouseState.current !== null) {
				onReorder(ev);
			}
		}, 300);
		mouseState.current = { x: ev.clientX, y: ev.clientY, stamp: Date.now(), triggerEvent: ev, timeout };
	}, [isReordering, onReorder]);

	const handleMouseUp = useCallback(() => {
		mouseState.current = null;
	}, []);

	const handleMouseMove = useCallback(ev => {
		if (mouseState.current !== null) {
			const { triggerEvent, x, y } = mouseState.current;
			const pixelsTravelled = Math.abs(ev.clientX - x) + Math.abs(ev.clientY - y);
			if (pixelsTravelled > 10) {
				clearTimeout(mouseState.current.timeout);
				onReorder(triggerEvent);
				mouseState.current = null;
			}
		}
	}, [onReorder]);

	useEffect(() => {
		mouseState.current = null;
	}, [isReordering])

	return (
		<div
			tabIndex={-2}
			ref={ref}
			className="items-table-head"
			style={{ height: ROW_HEIGHT, width }}
			onKeyDown={handleKeyDown}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onFocus={receiveFocus}
			onBlur={receiveBlur}
			role="row"
		>
			{columns.map((c, colIndex) => (
				<Cell
					aria-sort={c.field === sortBy ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}
					className='column-header'
					columnName={c.field}
					index={colIndex}
					key={c.field}
					onClick={handleCellClickAndKeyDown}
					onKeyDown={handleCellClickAndKeyDown}
					role="columnheader"
					tabIndex={-3}
					width={`var(--col-${colIndex}-width)`}
				>
					<div className="header-content">
						{reorderTarget && colIndex === reorderTarget.index && reorderTarget.isMovingLeft &&
							<div className="reorder-target reorder-left" />
						}
						{colIndex !== 0 &&
							<div
								data-resize-handle
								className="resize-handle"
								key="resize-handle"
								onMouseDown={onResize}
							/>
						}
						<div className="header-label truncate">
							{
								c.field === 'attachment' ?
									<Icon type={'16/attachment'} width="16" height="16" /> :
									c.label ?? (c.field in columnProperties ? columnProperties[c.field].name : c.field)
							}
						</div>
						{sortBy === c.field &&
							<Icon type={'16/chevron-7'} width="16" height="16" className="sort-indicator" />
						}
						{reorderTarget && colIndex === reorderTarget.index && reorderTarget.isMovingRight &&
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
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChangeSortOrder: PropTypes.func,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
};

export default HeaderRow;
