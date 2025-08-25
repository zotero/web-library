import cx from 'classnames';
import PropTypes from 'prop-types';
import { Children, forwardRef, memo, useRef } from 'react';
import { noop, pick } from 'web-common/utils';
import { Icon } from 'web-common/components';

import { CREATOR } from '../../constants/dnd';
import { useSortable } from '../../hooks';

const SimpleField = memo(forwardRef((props, ref) => {
	const { children, className, dragHandle=null, onClick = noop, onKeyDown = noop, tabIndex } = props;
	const [label, value, ...otherChildren] = Children.toArray(children);

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

const SortableField = memo(forwardRef((props, outerRef) => {
	const { className, index, onReorder = noop, onReorderCancel = noop, onReorderCommit = noop,
	raw = {}, ...rest } = props;

	const fieldRef = useRef(null);
	const getItem = () => ({ raw, sourceRect: fieldRef.current.getBoundingClientRect(), onReorder });

	const { dragRef, dropRef, previewRef, isDragging, isOver, canDrop } = useSortable(
		fieldRef, CREATOR, getItem, index, onReorder, onReorderCommit, onReorderCancel
	);

	const isDragTarget = isOver && canDrop;
	const fieldClassName = cx(className, { 'dnd-target': isDragTarget, 'dnd-source': isDragging });

	const dragHandle = dragRef(
		<div className="handle">
			<Icon type={ '24/grip' } className="touch" width="24" height="24"/>
			<Icon type={ '12/grip' } className="mouse" width="12" height="12"/>
		</div>
	);

	dropRef(fieldRef);
	previewRef(fieldRef);

	return <SimpleField
		{ ...rest }
		className={ fieldClassName }
		dragHandle={ dragHandle }
		ref={ ref => { fieldRef.current = ref; outerRef.current = ref; } }
	/>;
}));

SortableField.displayName = 'SortableField';

SortableField.propTypes = {
	className: PropTypes.string,
	index: PropTypes.number,
	onReorder: PropTypes.func,
	onReorderCancel: PropTypes.func,
	onReorderCommit: PropTypes.func,
	raw: PropTypes.object,
};

const Field = memo(forwardRef(({ isSortable, ...rest }, ref) => isSortable ?
	<SortableField ref={ ref } { ...rest } /> :
	<SimpleField ref={ ref } { ...rest } />));

Field.displayName = 'Field';

Field.propTypes = {
	isSortable: PropTypes.bool,
};

export { SimpleField, SortableField };
export default Field;
