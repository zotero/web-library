import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useRef } from 'react';

import Icon from '../ui/icon';
import { CREATOR } from '../../constants/dnd';
import { noop } from '../../utils';
import { pick } from '../../common/immutable';
import { useDrag, useDrop } from 'react-dnd';

const SimpleField = memo(forwardRef((props, ref) => {
	const { children, className, dragHandle=null, onClick = noop, onKeyDown = noop, tabIndex } = props;
	const [label, value, ...otherChildren] = React.Children.toArray(children);

	return (
		<li
			tabIndex={ tabIndex }
			onClick={ onClick }
			onKeyDown={ onKeyDown }
			className={ cx('metadata', className) }
			ref={ ref }
			{ ...pick(props, p => p.startsWith('data-') || p.startsWith('aria-')) }
		>
			<div className="key">
				{ label }
			</div>
			<div className="value">
				{ value }
			</div>
			{ otherChildren }
			{ dragHandle }
		</li>
	);
}));

SimpleField.displayName = 'SimpleField';

SimpleField.propTypes = {
	children: PropTypes.array.isRequired,
	className: PropTypes.string,
	dragHandle: PropTypes.element,
	onClick: PropTypes.func,
	onKeyDown: PropTypes.func,
	tabIndex: PropTypes.number,
};

const SortableField = memo(props => {
	const { className, index, onReorder = noop, onReorderCancel = noop, onReorderCommit = noop,
	raw = {}, ...rest } = props;

	const fieldRef = useRef(null);
	const [{ isDragging }, drag, preview] = useDrag({
		type: CREATOR,
		item: () => {
			const sourceRect = fieldRef.current.getBoundingClientRect();
			return { index, raw, sourceRect, onReorder };
		},
		collect: (monitor) => ({ isDragging: monitor.isDragging() }),
		end: (item, monitor) => {
			monitor.didDrop() ? onReorderCommit() : onReorderCancel();
		}
	});

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: [CREATOR],
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		hover: (item, monitor) => {
			const dragIndex = item.index;
			const hoverIndex = index
			if(dragIndex === hoverIndex) {
				return;
			}
			const hoverBoundingRect = fieldRef.current.getBoundingClientRect();
			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			const clientOffset = monitor.getClientOffset();
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;
			if(dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}

			if(dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}

			onReorder(dragIndex, hoverIndex);
			item.index = hoverIndex;
		}
	});

	const isDragTarget = isOver && canDrop;
	const fieldClassName = cx(className, { 'dnd-target': isDragTarget, 'dnd-source': isDragging });

	const dragHandle = drag(
		<div className="handle">
			<Icon type={ '24/grip' } className="touch" width="24" height="24"/>
			<Icon type={ '12/grip' } className="mouse" width="12" height="12"/>
		</div>
	);

	return <SimpleField
		{ ...rest }
		className={ fieldClassName }
		dragHandle={ dragHandle }
		ref={ ref => { fieldRef.current = ref; drop(ref); preview(ref); } }
	/>;
});

SortableField.displayName = 'SortableField';

SortableField.propTypes = {
	className: PropTypes.string,
	index: PropTypes.number,
	onReorder: PropTypes.func,
	onReorderCancel: PropTypes.func,
	onReorderCommit: PropTypes.func,
	raw: PropTypes.object,
};

const Field = memo(({ isSortable, ...rest }) => isSortable ?
	<SortableField { ...rest } /> :
	<SimpleField { ...rest } />);

Field.displayName = 'Field';

Field.propTypes = {
	isSortable: PropTypes.bool,
};

export { SimpleField, SortableField };
export default Field;
