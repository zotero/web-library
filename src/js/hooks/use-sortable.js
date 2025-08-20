import { useDrag, useDrop } from 'react-dnd';
import { noop } from 'web-common/utils';

export const VERTICAL = 1;
export const HORIZONTAL = 2;

/**
 * Hook enabling drag & drop reordering for items in either vertical or horizontal orientation.
 *
 * @param {Object} ref React ref to the sortable DOM element acting as a drop target.
 * @param {string|symbol} type react-dnd item type identifier.
 * @param {Object|Function} item Arbitrary item data object OR a function () => object; merged with { index } for drag monitors.
 * @param {number} index Current positional index of the item within the ordered collection.
 * @param {Function} [onReorderPreview=noop] Callback(dragIndex:number, hoverIndex:number) fired when a provisional reorder should be reflected in UI/state.
 * @param {Function} [onReorderCommit=noop] Callback invoked after a successful drop to finalize reorder.
 * @param {Function} [onReorderCancel=noop] Callback invoked if drag ends without a valid drop (revert preview state).
 * @param {number} [orientation=VERTICAL] Orientation constant (VERTICAL | HORIZONTAL) controlling midpoint axis used for hover threshold logic.
 * @returns {{
 *  dragRef: (node: any) => void,     // Ref callback to attach to the draggable handle/root.
 *  dropRef: (node: any) => void,     // Ref callback to attach to the droppable element.
 *  previewRef: (node: any) => void,  // Ref callback to attach to the drag preview element.
 *  isDragging: boolean,              // True while this item itself is being dragged.
 *  isOver: boolean,                  // True while another compatible item is hovered over this element.
 *  canDrop: boolean                  // True if current drag item can be dropped on this target.
 * }}
 */
export const useSortable = (ref, type, item, index, onReorderPreview = noop, onReorderCommit = noop, onReorderCancel = noop, orientation = VERTICAL) => {
	const resolveItem = () => (typeof item === 'function' ? item() : item) || {};
	const [{ isDragging }, dragRef, previewRef] = useDrag({
		type,
		item: () => {
			return { ...resolveItem(), index };
		},
		collect: (monitor) => ({ isDragging: monitor.isDragging() }),
		end: (draggedItem, monitor) => {
			monitor.didDrop() ? onReorderCommit() : onReorderCancel();
		}
	});

	const [{ isOver, canDrop }, dropRef] = useDrop({
		accept: [type],
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		hover: (draggedElement, monitor) => {
			const dragIndex = draggedElement.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) {
				return;
			}
			if (!ref.current) {
				return;
			}
			const hoverBoundingRect = ref.current.getBoundingClientRect();

			if (orientation === HORIZONTAL) {
				const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
				const clientOffset = monitor.getClientOffset();
				const hoverClientX = clientOffset.x - hoverBoundingRect.left;
				if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
					return;
				}
				if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
					return;
				}
			} else { // VERTICAL
				const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
				const clientOffset = monitor.getClientOffset();
				const hoverClientY = clientOffset.y - hoverBoundingRect.top;
				if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
					return;
				}
				if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
					return;
				}
			}

			onReorderPreview(dragIndex, hoverIndex);
			draggedElement.index = hoverIndex;
		}
	});

	return { dragRef, dropRef, previewRef, isDragging, isOver, canDrop };
}
