import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';

import Editable from '../editable';
import Field from '../form/field';
import Icon from '../ui/icon';
import Input from '../form/input';
import SelectInput from '../form/select';
import TextAreaInput from '../form/text-area';
import { cleanDOI, cleanURL, getDOIURL } from '../../utils';

const pickInputComponent = field => {
	switch(field.key) {
		case 'itemType': return SelectInput;
		case 'url': return Input;
		default: return TextAreaInput;
	}
};

const BoxFieldLabel = memo(({ field }) => {
	var label = field.label;

	if(field.key === 'url' && field.value) {
		const url = cleanURL(field.value, true);
		if(url) {
			label = (
				<a target="_blank" rel="nofollow noopener noreferrer" href={ url }>
					{ field.label }
					<Icon type={ '16/open-link' } className="mouse" width="12" height="12"/>
					<Icon type={ '16/open-link' } className="touch" width="16" height="16"/>
				</a>
			);
		}
	}

	if(field.key === 'DOI' && field.value) {
		const doi = cleanDOI(field.value);
		if(doi) {
			label = (
				<a target="_blank" rel="nofollow noopener noreferrer" href={ getDOIURL(doi) }>
					{ field.label }
					<Icon type={ '16/open-link' } className="mouse" width="12" height="12"/>
					<Icon type={ '16/open-link' } className="touch" width="16" height="16"/>
				</a>
			);
		}
	}

	return (
		<label htmlFor={ field.key}>{ label }</label>
	);
});

BoxFieldLabel.displayName = 'BoxFieldLabel';

BoxFieldLabel.propTypes = {
	field: PropTypes.object,
};

const BoxFieldInputEditable = memo(props => {
	const { field, isEditing, isForm, onClick, isActive, onFocus, onBlur } = props;
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const isSelect = pickInputComponent(field) === SelectInput;
	const isPseudoEditable = !isForm && isSelect;
	const isDisabled = (shouldUseEditMode && !isEditing) || isPseudoEditable || field.isReadOnly;
	const input = <BoxFieldInput { ...props } field={ field } />;
	const editableProps = { display: field.display, isActive, input, isBusy: field.processing ||
	false, isDisabled, onBlur, onClick, onFocus, title: field.title, value: field.value };

	var url = null;

	if(field.isReadOnly && field.value && field.key === 'url') {
		url = cleanURL(field.value, true);
	}

	if(field.isReadOnly && field.value && field.key === 'DOI') {
		const doi = cleanDOI(field.value);
		if(doi) {
			url = getDOIURL(doi);
		}
	}

	if(url) {
		return (
			<Editable { ...editableProps }>
				<a
					href={ url }
					rel="nofollow noopener noreferrer"
					target="_blank"
				>
					<div className="editable-content">
						{ field.value }
					</div>
				</a>
			</Editable>
		)
	}

	return <Editable { ...editableProps } />
});

BoxFieldInputEditable.displayName = 'BoxFieldInputEditable';

BoxFieldInputEditable.propTypes = {
	field: PropTypes.object,
	isActive: PropTypes.bool,
	isEditing: PropTypes.bool,
	isForm: PropTypes.bool,
	onBlur: PropTypes.func,
	onClick: PropTypes.func,
	onFocus: PropTypes.func,
};

const BoxFieldInput = memo(props => {
	const { field, isForm, onCancel, onCommit, onClick, onFocus, onBlur } = props;
	const display = field.key === 'itemType' ?
		field.options.find(o => o.value === field.value) :
		null;
	const InputComponent = pickInputComponent(field);
	const isSelect = InputComponent === SelectInput;
	const isPseudoEditable = !isForm && isSelect;
	const shouldUseEditable = !isForm &&!isPseudoEditable;

	const inputProps = {
		autoFocus: !isForm && !field.processing && InputComponent !== SelectInput,
		display: display ? display.label : null,
		isDisabled: field.isReadOnly,
		isBusy: field.processing || false,
		onCancel,
		onCommit,
		options: field.options || null,
		selectOnFocus: !isForm,
		value: field.value || '',
		id: field.key,
		className: cx({
			'form-control': isForm,
			'form-control-sm': isForm,
			'pseudo-editable': isPseudoEditable,
			'editable-control': shouldUseEditable,
		}),
	};

	if(!shouldUseEditable) {
		inputProps['onClick'] = onClick;
		inputProps['onFocus'] = onFocus;
		inputProps['onBlur'] = onBlur;
	}

	if(isForm) {
		inputProps['tabIndex'] = 0;
	}

	if(InputComponent === TextAreaInput) {
		inputProps['resize'] = 'vertical';
		inputProps['isSingleLine'] = field.key !== 'extra';
	}

	if(InputComponent === SelectInput) {
		inputProps['onChange'] = () => true; //commit on change
		// select inputs render without Editable and need to be tabbable
		inputProps['tabIndex'] = 0;
		inputProps['searchable'] = true;
	}

	if(InputComponent !== SelectInput) {
		inputProps['onBlur'] = () => false; //commit on blur
	}

	return <InputComponent { ...inputProps } />;
});

BoxFieldInput.displayName = 'BoxFieldInput';

BoxFieldInput.propTypes = {
	field: PropTypes.object,
	isEditing: PropTypes.bool,
	isForm: PropTypes.bool,
	onBlur: PropTypes.func,
	onCancel: PropTypes.func,
	onClick: PropTypes.func,
	onCommit: PropTypes.func,
	onFocus: PropTypes.func,
};

const BoxField = props => {
	const { field, isActive, isForm } = props;
	const InputComponent = pickInputComponent(field);
	const isSelect = InputComponent === SelectInput;
	const isPseudoEditable = !isForm && isSelect;
	const shouldUseEditable = !isForm &&!isPseudoEditable;

	const className = {
		'abstract': field.key === 'abstractNote',
		'editing': isActive,
		'empty': !field.value || !field.value.length,
		'extra': field.key === 'extra',
		'interactable': ['url', 'DOI'].includes(field.key),
		'select': pickInputComponent(field) == SelectInput,
		[field.key]: true,
	};

	return (
		<Field data-key={ field.key } className={ cx(className) }>
			<BoxFieldLabel field={ props.field } />
			{ shouldUseEditable ?
				<BoxFieldInputEditable { ...props } /> :
				<BoxFieldInput { ...props } />
			}
		</Field>
	);
}

BoxField.propTypes = {
	field: PropTypes.object,
	isActive: PropTypes.bool,
	isForm: PropTypes.bool,
};

export default memo(BoxField);
