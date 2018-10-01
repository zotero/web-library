'use strict';

const React = require('react');
const withDevice = require('../../enhancers/with-device');
const Editable = require('../editable');
const TextAreaInput = require('../form/text-area');

class Abstract extends React.PureComponent {
	state = {
		isActive: false
	}

	handleCommit(newValue) {
		this.props.onSave('abstractNote', newValue);
		this.setState({ isActive: false });
	}

	get shouldUseEditable() {
		return !this.props.isForm;
	}

	get isBusy() {
		const { pendingChanges } = this.props;
		return pendingChanges.some(({ patch }) => 'abstractNote' in patch);
	}

	get placeholder() {
		const { device, isEditing } = this.props;
		return !device.shouldUseEditMode || (device.shouldUseEditMode && isEditing) ?
			'Add abstract…' : '';
	}

	renderEditable(input) {
		return <Editable
			autoFocus
			isBusy={ this.isBusy }
			isActive={ this.state.isActive }
			onClick={ () => this.setState({ isActive: true }) }
			input={ input }
		/>
	}

	renderFormField() {
		const { pendingChanges, item } = this.props;
		const aggregatedPatch = pendingChanges.reduce(
			(aggr, { patch }) => ({...aggr, ...patch}), {}
		);
		const itemWithPendingChnages = { ...item, ...aggregatedPatch};

		return (
			<TextAreaInput
				resize='vertical'
				onCommit={ this.handleCommit.bind(this) }
				onCancel={ () => this.setState({ isActive: false }) }
				isBusy={ this.isBusy }
				value={ itemWithPendingChnages.abstractNote }
				placeholder={ this.placeholder }
			/>
		);
	}

	render() {
		const formField = this.renderFormField();

		return this.shouldUseEditable ?
			this.renderEditable(formField) : formField;
	}
}

module.exports = withDevice(Abstract);
