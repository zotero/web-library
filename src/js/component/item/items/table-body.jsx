import { forwardRef, memo } from 'react';

const TableBody = memo(forwardRef((props, ref) => {
	return (
		<div { ... props } ref={ ref } role="rowgroup" />
	);

}));

TableBody.displayName = 'TableBody';

export default TableBody;
