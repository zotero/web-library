import { useDispatch, useSelector } from 'react-redux';

import { triggerEditingItem } from '../actions/'

const useEditMode = () => {
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const editingItemKey = useSelector(state => state.current.editingItemKey);
	const isEditing = itemKey ? editingItemKey === itemKey : false;
	const dispatchTriggerEditingItem = (toggleValue = null) => dispatch(triggerEditingItem(itemKey, toggleValue));
	return [isEditing, dispatchTriggerEditingItem];
};

export { useEditMode };
