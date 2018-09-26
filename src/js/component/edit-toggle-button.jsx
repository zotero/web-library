'use strict';

const React = require('react');
const withDevice = require('../enhancers/with-device');
const withEditMode = require('../enhancers/with-edit-mode');
const Button = require('./ui/button');


class EditToggleButton extends React.PureComponent {
	render() {
		const { isEditing, device, onEditModeToggle, className } = this.props;
		const toggleOnLabel = device.viewport.md && !device.touch ?
			'Show Empty Fields' : 'Edit';
		const toggleOffLabel = device.viewport.md && !device.touch ?
			'Hide Empty Fields' : 'Done';

		const label = isEditing ? toggleOffLabel : toggleOnLabel;

		return (
			<Button className={ className} onClick={ () => onEditModeToggle(!isEditing) }>
				{ label }
			</Button>
		);
	}
}

module.exports = withEditMode(withDevice(EditToggleButton));
