'use strict';

import React from 'react';
import cx from 'classnames';
import Editable from '../editable';
import Field from '../form/field';
import Input from '../form/input';
import SelectInput from '../form/select';
import TextAreaInput from '../form/text-area';
import withDevice from '../../enhancers/with-device';

const pickInputComponent = field => {
	switch(field.key) {
		case 'itemType': return SelectInput;
		case 'url': return Input;
		default: return TextAreaInput;
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
			this.isPseudoEditable || field.isReadOnly;
	}

	get shouldUseEditable() {
		const { isForm } = this.props;
		return !isForm && !this.isPseudoEditable;
	}

	renderEditable(field, input) {
		const { onClick, isActive, onFocus, onBlur, title } = this.props;
		const props = { display: field.display, input, isActive, isBusy: field.processing || false,
		isDisabled: this.isDisabled, onBlur, onClick, onFocus, title: field.title, };

		return <Editable { ...props } />
	}

	renderFormField(field) {
		const { isForm, onCancel, onCommit, onClick, onFocus, onBlur } = this.props;
		const display = field.key === 'itemType' ?
			field.options.find(o => o.value === field.value) :
			null;
		const InputComponent = pickInputComponent(field);
		const props = {
			autoFocus: !isForm && !field.processing && InputComponent !== SelectInput,
			display: display ? display.label : null,
			isDisabled: field.isReadOnly,
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
			props['isSingleLine'] = field.key !== 'extra';
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
		if(field.key === 'url' && field.value) {
			return (
				<a target="_blank" rel="nofollow noopener noreferrer" href={ field.value }>
					{ field.label }
				</a>
			);
		}

		if(field.key === 'DOI' && field.value) {
			return (
				<a target="_blank" rel="nofollow noopener noreferrer" href={ 'http://dx.doi.org/' + field.value }>
					{ field.label }
				</a>
			);
		}

		return field.label;
	}

	render() {
		const { field, isActive } = this.props;
		const className = {
			'abstract': field.key === 'abstractNote',
			'editing': isActive,
			'empty': !field.value || !field.value.length,
			'extra': field.key === 'extra',
			'interactable': ['url', 'DOI'].includes(field.key),
			'select': this.isSelect,
			[field.key]: true,
		};
		const formField = this.renderFormField(field);

		return (
			<Field data-key={ field.key } className={ cx(className) }>
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

export default withDevice(BoxField);
