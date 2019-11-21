import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import Button from './ui/button';
import { useEditMode } from '../hooks';

const EditToggleButton = props => {
	const { className, isReadOnly } = props;
	const isTouchUser = useSelector(state => state.device.isTouchUser);
	const md = useSelector(state => state.device.md);
	const [isEditing, dispatchTriggerEditingItem] = useEditMode();
	const shouldShowEmptyLabel = md && (isReadOnly || !isTouchUser);
	const toggleOnLabel = shouldShowEmptyLabel ? 'Show Empty Fields' : 'Edit';
	const toggleOffLabel = shouldShowEmptyLabel ? 'Hide Empty Fields' : 'Done';
	const label = isEditing ? toggleOffLabel : toggleOnLabel;

	const handleClick = useCallback(() => {
		dispatchTriggerEditingItem(!isEditing);
	});

	return (
		<Button className={ className} onClick={ handleClick }>
			{ label }
		</Button>
	);

}

EditToggleButton.propTypes = {
	className: PropTypes.string,
	isReadOnly: PropTypes.bool,
}

export default EditToggleButton;
