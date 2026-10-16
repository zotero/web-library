import { useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'web-common/components';

import { useEditMode } from '../hooks';

const EditToggleButton = props => {
	const { className, isReadOnly } = props;
	const isTouchUser = useSelector(state => state.device.isTouchUser);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isStacked = useSelector(state => state.device.isStacked);
	const md = useSelector(state => state.device.md);

	const [isEditing, dispatchTriggerEditingItem] = useEditMode();
	const shouldUseEditButton = isStacked || isTouchOrSmall;
	const shouldShowEmptyLabel = (isStacked || md) && (isReadOnly || !isTouchUser);
	const toggleOnLabel = shouldShowEmptyLabel ? 'Show Empty Fields' : 'Edit';
	const toggleOffLabel = shouldShowEmptyLabel ? 'Hide Empty Fields' : 'Done';
	const label = isEditing ? toggleOffLabel : toggleOnLabel;


	const handleClick = useCallback(() => {
		dispatchTriggerEditingItem(!isEditing);
	}, [dispatchTriggerEditingItem, isEditing]);

	return shouldUseEditButton ? (
		<Button className={ className} onClick={ handleClick }>
			{ label }
		</Button>
	) : null;
}

export default memo(EditToggleButton);
