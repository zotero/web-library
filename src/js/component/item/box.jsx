'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Creators = require('./box/creators');
const Editable = require('../editable');
const Field = require('./box/field');
const Input = require('../input');
const SelectInput = require('../select-input');
const Spinner = require('../ui/spinner');
const TextAreaInput = require('../text-area-input');

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
	}

	handleFieldEdit(key) {
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
				onSave={ this.handleEditableCommit.bind(this, field.key) } />
		);
	}

	renderLabel(field) {
		switch(field.key) {
			case 'url':
				return (
					<label>
						<a rel='nofollow' href={ field.value }>
							{ field.label }
						</a>
					</label>
				);
			case 'DOI':
				return (
					<label>
						<a rel='nofollow' href={ 'http://dx.doi.org/' + field.value }>
							{ field.label }
						</a>
					</label>
				);
			default:
			return <label>{ field.label }</label>;
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
				autoFocus: true,
				autoSelect: true,
				display: display ? display.label : null,
				inputComponent: pickInputComponent(field),
				isActive,
				isBusy: field.processing || false,
				onCancel: this.handleCancel.bind(this, field.key),
				onCommit: this.handleEditableCommit.bind(this, field.key),
				options: field.options || null,
				value: field.value || '',
			};

			if(props.inputComponent !== SelectInput) {
				props['onBlur'] = () => false; //commit on blur
			}

			return (
				<Field 
					classNames={ classNames }
					isActive={ isActive }
					key={ field.key }
					onClick={ this.handleFieldEdit.bind(this, field.key) }
					onFocus={ this.handleFieldEdit.bind(this, field.key) }
				>
					{ this.renderLabel(field) }
					<Editable { ...props } />
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
	isLoading: PropTypes.bool,
	creatorTypes: PropTypes.array,
	fields: PropTypes.array,
	isEditing: PropTypes.bool, // relevant on small screens only
	onSave: PropTypes.func
};

module.exports = ItemBox;