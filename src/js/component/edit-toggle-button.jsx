import PropTypes from 'prop-types';
import React, { useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'web-common/components';

import { useEditMode } from '../hooks';

const EditToggleButton = props => {
	const { className, isReadOnly } = props;
	const isTouchUser = useSelector(state => state.device.isTouchUser);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const md = useSelector(state => state.device.md);

	const [isEditing, dispatchTriggerEditingItem] = useEditMode();
	const shouldUseEditButton = md || isTouchOrSmall;
	const shouldShowEmptyLabel = md && (isReadOnly || !isTouchUser);
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

EditToggleButton.propTypes = {
	className: PropTypes.string,
	isReadOnly: PropTypes.bool,
}

export default memo(EditToggleButton);
