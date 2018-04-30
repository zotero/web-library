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
		default: return Input;
	}
};

class ItemBox extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activeEntry: null,
		};
		this.fieldComponents = {};
	}

	handleFieldClick(key, event) {
		this.setState({ activeEntry: key }, () => {
			if(this.fieldComponents[key] instanceof SelectInput) {
				//@NOTE: hacky! https://github.com/JedWatson/react-select/issues/2106
				this.fieldComponents[key].input.setState({ isOpen: true });
			}
		});
		event.preventDefault();
	}

	handleFieldFocus(key) {
		this.setState({ activeEntry: key });
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

	renderCreators(field) {
		return (
			<Creators
				key={ field.key }
				name={ field.key }
				creatorTypes = { this.props.creatorTypes }
				value={ field.value || [] }
				onSave={ this.handleEditableCommit.bind(this, field.key) }
				isForm={ this.props.isForm }
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
				'empty': !field.value || !field.value.length,
				'select': field.options && Array.isArray(field.options),
				'editing': isActive,
				'abstract': field.key === 'abstractNote',
				'extra': field.key === 'extra',
			};
			const display = field.key === 'itemType' ? 
				field.options.find(o => o.value === field.value) :
				null;
			const props = {
				autoFocus: !this.props.isForm,
				display: display ? display.label : null,
				inputComponent: pickInputComponent(field),
				isActive,
				isBusy: field.processing || false,
				onCancel: this.handleCancel.bind(this, field.key),
				onCommit: this.handleEditableCommit.bind(this, field.key),
				options: field.options || null,
				selectOnFocus: !this.props.isForm,
				value: field.value || '',
				className: 'form-control-sm',
				onEditableClick: this.handleFieldClick.bind(this, field.key),
				onEditableFocus: this.handleFieldFocus.bind(this, field.key),
				id: field.key,
				[this.props.isForm ? 'ref' : 'inputRef']: component => this.fieldComponents[field.key] = component,
			};

			if(this.props.isForm) {
				props['tabIndex'] = 0;
			}

			if(props.inputComponent === SelectInput) {
				props['onChange'] = () => true; //commit on change
			}

			if(props.inputComponent !== SelectInput) {
				props['onBlur'] = () => false; //commit on blur
			}
			if(props.inputComponent === TextAreaInput) {
				props['rows'] = 5;
			}

			const FormField = this.props.isForm ? props.inputComponent : Editable;

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
			<ol className={cx('metadata-list', 'horizontal', { editing: this.props.isEditing }) }>
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