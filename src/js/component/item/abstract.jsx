'use strict';

const React = require('react');
const cx = require('classnames');
const withDevice = require('../../enhancers/with-device');
const Editable = require('../editable');
const TextAreaInput = require('../form/text-area');

class Abstract extends React.PureComponent {
	state = {
		isActive: false
	}

	handleMakeActive() {
		this.setState({ isActive: true });
	}

	handleCommit(newValue, hasChanged) {
		if(hasChanged) {
			this.props.onSave('abstractNote', newValue);
		}
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
		const { device, isEditing } = this.props;
		return <Editable
			input={ input }
			isActive={ this.state.isActive }
			isBusy={ this.isBusy }
			isDisabled={ device.shouldUseEditMode && !isEditing }
			onClick={ this.handleMakeActive.bind(this) }
			onFocus={ this.handleMakeActive.bind(this) }
		/>;
	}

	renderFormField() {
		const { pendingChanges, item, isForm } = this.props;
		const aggregatedPatch = pendingChanges.reduce(
			(aggr, { patch }) => ({...aggr, ...patch}), {}
		);
		const itemWithPendingChnages = { ...item, ...aggregatedPatch};

		return (
			<TextAreaInput
				autoFocus={ !isForm }
				isBusy={ this.isBusy }
				onCancel={ () => this.setState({ isActive: false }) }
				onCommit={ this.handleCommit.bind(this) }
				placeholder={ this.placeholder }
				resize='vertical'
				selectOnFocus={ !isForm }
				tabIndex={ isForm ? 0 : null }
				value={ itemWithPendingChnages.abstractNote }
				className={ cx({
					'form-control': isForm,
					'form-control-sm': isForm,
					'editable-control': this.shouldUseEditable,
				}) }
			/>
		);
	}

	render() {
		const formField = this.renderFormField();

		return this.shouldUseEditable ?
			this.renderEditable(formField) : formField;
	}

	static defaultProps = {
		pendingChanges: []
	}
}

module.exports = withDevice(Abstract);
