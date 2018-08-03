'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Creators = require('../form/creators');
const Editable = require('../editable');
const Field = require('../form/field');
const Input = require('../form/input');
const SelectInput = require('../form/select');
const Spinner = require('../ui/spinner');
const TextAreaInput = require('../form/text-area');

const pickInputComponent = field => {
	switch(field.key) {
		case 'itemType': return SelectInput;
		case 'abstractNote': return TextAreaInput;
		case 'extra': return TextAreaInput;
		case 'title': return TextAreaInput;
		default: return Input;
	}
};

class ItemBox extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activeEntry: null,
			isDragging: false,
		};
		this.fieldComponents = {};
	}

	focusField(name = 'itemType') {
		if(name in this.fieldComponents) {
			this.fieldComponents[name].focus();
			return true;
		} else {
			return false;
		}
	}

	handleFieldClick(key) {
		const field = this.props.fields.find(f => f.key === key);
		if(!this.props.isForm && field.readOnly) {
			return;
		}
		this.setState({ activeEntry: key });
	}

	handleFieldFocus(key) {
		const field = this.props.fields.find(f => f.key === key);
		if(!this.props.isForm && field.readOnly) {
			return;
		}
		this.setState({ activeEntry: key });
	}

	handleFieldBlur() {
		this.setState({ activeEntry: null });
	}

	handleCancel(key) {
		if(key === this.state.activeEntry) {
			this.setState({ activeEntry: null });
		}
	}

	handleEditableCommit(key, newValue, isChanged, srcEvent) {
		if(isChanged) {
			this.props.onSave(key, newValue);
		}
		if(key === this.state.activeEntry) {
			this.setState({ activeEntry: null });
		}
		if(this.props.isForm && srcEvent) {
			if(srcEvent.type == 'keydown' && srcEvent.key == 'Enter') {
				srcEvent.target.blur();
			}
		}
	}

	handleDragStatusChange(isDragging) {
		this.setState({ isDragging });
	}

	renderCreators(field) {
		return (
			<Creators
				key={ field.key }
				name={ field.key }
				readOnly={ field.readOnly }
				creatorTypes = { this.props.creatorTypes }
				value={ field.value || [] }
				onSave={ this.handleEditableCommit.bind(this, field.key) }
				isForm={ this.props.isForm }
				onDragStatusChange={ this.handleDragStatusChange.bind(this) }
			/>
		);
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

	renderField(field) {
		if(field.key === 'creators') {
			return this.renderCreators(field);
		} else {
			const isActive = this.state.activeEntry === field.key;
			const className = {
				[field.key]: true,
				'empty': !field.value || !field.value.length,
				'select': field.options && Array.isArray(field.options),
				'editing': isActive,
				'has-focus': isActive,
				'abstract': field.key === 'abstractNote',
				'extra': field.key === 'extra',
			};
			const display = field.key === 'itemType' ?
				field.options.find(o => o.value === field.value) :
				null;
			const inputComponent = pickInputComponent(field);
			const isPseudoEditable = !this.props.isForm && inputComponent === SelectInput;
			const props = {
				autoFocus: !this.props.isForm && inputComponent !== SelectInput,
				display: display ? display.label : null,
				inputComponent,
				isActive,
				isBusy: field.processing || false,
				onCancel: this.handleCancel.bind(this, field.key),
				onCommit: this.handleEditableCommit.bind(this, field.key),
				options: field.options || null,
				selectOnFocus: !this.props.isForm,
				value: field.value || '',
				isDisabled: isPseudoEditable && field.readOnly,
				className: cx({
					'form-control': this.props.isForm,
					'form-control-sm': this.props.isForm,
					'pseudo-editable': isPseudoEditable
			}),
				id: field.key,
				[this.props.isForm ? 'ref' : 'inputRef']: component => this.fieldComponents[field.key] = component,
			};

			if(isPseudoEditable) {
				props['onClick'] = this.handleFieldClick.bind(this, field.key);
				props['onFocus'] = this.handleFieldFocus.bind(this, field.key);
				props['onBlur'] = this.handleFieldBlur.bind(this, field.key);
			} else {
				props['onEditableClick'] = this.handleFieldClick.bind(this, field.key);
				props['onEditableFocus'] = this.handleFieldFocus.bind(this, field.key);
				props['onEditableBlur'] = this.handleFieldBlur.bind(this, field.key);
			}

			if(this.props.isForm) {
				props['tabIndex'] = 0;
			}

			if(props.inputComponent === TextAreaInput) {
				props['resize'] = 'vertical';
			}

			if(props.inputComponent === SelectInput) {
				props['onChange'] = () => true; //commit on change
				// select inputs render without Editable and need to be tabbable
				props['tabIndex'] = 0;
			} else if(props.inputComponent !== SelectInput) {
				props['onBlur'] = () => false; //commit on blur
			}

			// Renders wrapped in Editable unless it's a Select or ItemBox is in form mode
			const FormField = this.props.isForm || props.inputComponent === SelectInput ?
				props.inputComponent : Editable;

			return (
				<Field
					className={ cx(className) }
					isActive={ isActive }
					key={ field.key }
				>
					<label htmlFor={ field.key} >
						{ this.renderLabelContent(field) }
					</label>
					<FormField { ...props } />
				</Field>
			);
		}
	}

	render() {
		if(this.props.isLoading) {
			return <Spinner />;
		}

		return (
			<ol className={ cx('metadata-list', {
				editing: this.props.isEditing ,
				'dnd-in-progress': this.state.isDragging
			}) }>
				{ this.props.fields.map(this.renderField.bind(this)) }
			</ol>
		);
	}
}

ItemBox.defaultProps = {
	fields: [],
	onSave: v => Promise.resolve(v)
};

ItemBox.propTypes = {
	creatorTypes: PropTypes.array,
	fields: PropTypes.array,
	isEditing: PropTypes.bool, // relevant on small screens only
	isForm: PropTypes.bool,
	isLoading: PropTypes.bool,
	onSave: PropTypes.func
};

module.exports = ItemBox;
