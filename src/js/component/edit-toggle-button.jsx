'use strict';

import React from 'react';
import withDevice from '../enhancers/with-device';
import withEditMode from '../enhancers/with-edit-mode';
import Button from './ui/button';


class EditToggleButton extends React.PureComponent {
	render() {
		const { isEditing, device, onEditModeToggle, className,
			isReadOnly } = this.props;
		const isShowEmptyLabel = device.viewport.md && (isReadOnly || !device.userType === 'touch');
		const toggleOnLabel = isShowEmptyLabel ? 'Show Empty Fields' : 'Edit';
		const toggleOffLabel = isShowEmptyLabel ? 'Hide Empty Fields' : 'Done';
		const label = isEditing ? toggleOffLabel : toggleOnLabel;

		return (
			<Button className={ className} onClick={ () => onEditModeToggle(!isEditing) }>
				{ label }
			</Button>
		);
	}
}

export default withEditMode(withDevice(EditToggleButton));
