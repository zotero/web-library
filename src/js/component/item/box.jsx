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
			activeEntry: null
		};
		this.fieldComponents = {};
	}

	handleFieldEdit(key) {
		if(this.props.isForm) {
			if(this.fieldComponents[key]) {
				this.fieldComponents[key].focus();
			}
		}
		this.setState({ activeEntry: key });
	}

	handleCancel(key) {
		if(key === this.state.activeEntry) {
			this.setState({ activeEntry: null });
		}
	}

	handleEditableCommit(key, newValue, isChanged) {
		if(isChanged) {
			this.props.onSave(key, newValue);
		}
		if(key === this.state.activeEntry) {
			this.setState({ activeEntry: null });
		}
	}

	get currentIndex() {
		return this.props.fields.findIndex(
			field => field.key === this.state.activeEntry
		);
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
			const classNames = {
				'empty': !field.value || !field.value.length,
				'select': field.options && Array.isArray(field.options),
				'editing': isActive
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
				selectOnFocus: true,
				value: field.value || ''
			};

			if(props.inputComponent !== SelectInput) {
				props['onBlur'] = () => false; //commit on blur
			} else {
				props['onBlur'] = this.handleCancel.bind(this, field.key);
			}
			if(props.inputComponent === TextAreaInput) {
				props['rows'] = 5;
			}

			const FormField = this.props.isForm ? props.inputComponent : Editable;

			return (
				<Field 
					classNames={ classNames }
					isActive={ isActive }
					key={ field.key }
					onClick={ this.handleFieldEdit.bind(this, field.key) }
					onFocus={ this.handleFieldEdit.bind(this, field.key) }
				>
					<label htmlFor={ field.key} >
						{ this.renderLabelContent(field) }
					</label>
					<FormField 
						id={ field.key }
						ref={ fieldComponent => this.fieldComponents[field.key] = fieldComponent }
						{ ...props }
					/>
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