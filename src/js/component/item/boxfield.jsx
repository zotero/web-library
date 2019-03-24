'use strict';

import React from 'react';
import cx from 'classnames';
import Editable from '../editable';
import Field from '../form/field';
import Input from '../form/input';
import SelectInput from '../form/select';
import TextAreaInput from '../form/text-area';

const pickInputComponent = field => {
	switch(field.key) {
		case 'itemType': return SelectInput;
		case 'abstractNote': return TextAreaInput;
		case 'extra': return TextAreaInput;
		case 'title': return TextAreaInput;
		default: return Input;
	}
};

class BoxField extends React.PureComponent {
	get isSelect() {
		const { field } = this.props;
		return pickInputComponent(field) === SelectInput;
	}
	get isPseudoEditable() {
		const { isForm } = this.props;
		return !isForm && this.isSelect;
	}

	get isDisabled() {
		const { field, device, isEditing } = this.props;
		return (device.shouldUseEditMode && !isEditing) ||
			this.isPseudoEditable || field.readOnly;
	}

	get shouldUseEditable() {
		const { isForm } = this.props;
		return !isForm && !this.isPseudoEditable;
	}

	renderEditable(field, input) {
		const { onClick, isActive, onFocus, onBlur } = this.props;
		const props = {
			isActive,
			input,
			onClick,
			onFocus,
			onBlur,
			display: field.display,
			isBusy: field.processing || false,
			isDisabled: this.isDisabled
		};

		return <Editable { ...props } />
	}

	renderFormField(field) {
		const { isForm, onCancel, onCommit, onClick, onFocus, onBlur } = this.props;
		const display = field.key === 'itemType' ?
			field.options.find(o => o.value === field.value) :
			null;
		const InputComponent = pickInputComponent(field);
		const props = {
			autoFocus: !isForm && InputComponent !== SelectInput,
			display: display ? display.label : null,
			isDisabled: this.isPseudoEditable && field.readOnly,
			isBusy: field.processing || false,
			onCancel,
			onCommit,
			options: field.options || null,
			selectOnFocus: !this.props.isForm,
			value: field.value || '',
			id: field.key,
			className: cx({
				'form-control': isForm,
				'form-control-sm': isForm,
				'pseudo-editable': this.isPseudoEditable,
				'editable-control': this.shouldUseEditable,
			}),
		};

		if(!this.shouldUseEditable) {
			props['onClick'] = onClick;
			props['onFocus'] = onFocus;
			props['onBlur'] = onBlur;
		}

		if(isForm) {
			props['tabIndex'] = 0;
		}

		if(InputComponent === TextAreaInput) {
			props['resize'] = 'vertical';
		}

		if(InputComponent === SelectInput) {
			props['onChange'] = () => true; //commit on change
			// select inputs render without Editable and need to be tabbable
			props['tabIndex'] = 0;
		}

		if(InputComponent !== SelectInput) {
			props['onBlur'] = () => false; //commit on blur
		}

		return <InputComponent { ...props } />;
	}

	renderLabelContent(field) {
		switch(field.key) {
			case 'url':
				return (
					<a rel='nofollow' href={ field.value }>
						{ field.label }
					</a>
				);
			case 'DOI':
				return (
					<a rel='nofollow' href={ 'http://dx.doi.org/' + field.value }>
						{ field.label }
					</a>
				);
			default:
				return field.label;
		}
	}

	render() {
		const { field, isActive } = this.props;
		const className = {
			[field.key]: true,
			'empty': !field.value || !field.value.length,
			'select': this.isSelect,
			'editing': isActive,
			'abstract': field.key === 'abstractNote',
			'extra': field.key === 'extra',
		};
		const formField = this.renderFormField(field);

		return (
			<Field key={ field.key } className={ cx(className) }>
				<label htmlFor={ field.key} >
					{ this.renderLabelContent(field) }
				</label>
				{ this.shouldUseEditable ?
					this.renderEditable(field, formField) : formField
				}
			</Field>
		);
	}
}

export default BoxField;
