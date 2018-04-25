'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Field = require('./field');
const Editable = require('../editable');
const Button = require('../ui/button');
const Icon = require('../ui/icon');
const Input = require('./input');
const SelectInput = require('./select');

class CreatorField extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			active: null
		};
		this.fieldComponents = {};
	}

	handleFieldClick(key, event) {
		this.setState({ active: key }, () => {
			if(this.fieldComponents[key] instanceof SelectInput) {
				//@NOTE: hacky!
				this.fieldComponents[key].input.setState({ isOpen: true });
			}
		});
		event.preventDefault();
	}

	handleFieldFocus(key) {
		this.setState({ active: key });
	}

	handleCancel() {
		this.setState({ active: null });
	}

	handleEditableCommit(field, newValue, hasChanged, srcEvent) {
		if(hasChanged) {
			this.props.onChange(this.props.index, field, newValue);
		}
		if(this.props.isForm && srcEvent) {
			if(srcEvent.type == 'keydown' && srcEvent.key == 'Enter') {
				srcEvent.target.blur();
			}
		}
		this.setState({ active: null });
	}

	handleCreatorTypeSwitch() {
		this.props.onCreatorTypeSwitch(this.props.index);
	}

	handleCreatorRemove() {
		this.props.onCreatorRemove(this.props.index);
	}
	handleCreatorAdd() {
		this.props.onCreatorAdd();
	}

	get icon() {
		return 'name' in this.props.creator ? '20/input-dual' : '20/input-single';
	}

	get isDual() {
		return 'lastName' in this.props.creator;
	}

	renderDual() {
		return (
			<React.Fragment>
				{ this.renderField('lastName', 'last name') }
				{ this.renderField('firstName', 'first name') }
			</React.Fragment>
		);
	}

	renderSingle() {
		return this.renderField('name', 'name');
	}

	renderField(name, label) {
		const FormField = this.props.isForm ? Input : Editable;
		const { creator } = this.props;
		const extraProps = { 
			[this.props.isForm ? 'ref' : 'inputRef']: component => this.fieldComponents[name] = component
		};

		if(this.props.isForm) {
			extraProps['tabIndex'] = 0;
		}
		
		return (
			<FormField
				autoFocus={ !this.props.isForm }
				isActive={ this.state.active === name }
				onBlur={ () => false }
				onCancel={ this.handleCancel.bind(this) }
				onCommit={ this.handleEditableCommit.bind(this, name) }
				placeholder={ label }
				selectOnFocus={ true }
				value={ creator[name] }
				aria-label={ label }
				className="form-control-sm"
				onEditableClick={ this.handleFieldClick.bind(this, name) }
				onEditableFocus={ this.handleFieldFocus.bind(this, name) }
				{ ...extraProps }
			/>
		);
	}

	render() {
		const FormField = this.props.isForm ? SelectInput : Editable;
		const { index, creator, creatorTypes } = this.props;
		const className = {
			'metadata': true,
			'creators-entry': true,
			'creators-twoslot': 'lastName' in creator,
			'creators-oneslot': 'name' in creator,
			'creators-type-editing': this.state.isCreatorTypeActive
		};

		const extraProps = {
			[this.props.isForm ? 'ref' : 'inputRef']: component => this.fieldComponents['creatorType'] = component
		};

		if(this.props.isForm) {
			extraProps['tabIndex'] = 0;
		}

		const creatorTypeDescription = creatorTypes.find(
			c => c.value == creator.creatorType
		) || { label: creator.creatorType };

		return (
			<Field key={ index } className={ cx(className) }>
				<FormField
					autoFocus={ !this.props.isForm }
					className="form-control-sm"
					inputComponent={ SelectInput }
					isActive={ this.state.active === 'creatorType' }
					onCancel={ this.handleCancel.bind(this) }
					onChange={ () => true }
					onCommit={ this.handleEditableCommit.bind(this, 'creatorType') }
					onEditableClick={ this.handleFieldClick.bind(this, 'creatorType') }
					onEditableFocus={ this.handleFieldFocus.bind(this, 'creatorType') }
					options={ creatorTypes }
					searchable={ false }
					value={ creator.creatorType }
					{ ...extraProps }
				>
					<span className="text-container">{ creatorTypeDescription.label }</span>
					<span className="Select-arrow"></span>
				</FormField>
				<React.Fragment>
					{ this.isDual ? this.renderDual() : this.renderSingle() }
					<Button onClick={ this.handleCreatorTypeSwitch.bind(this, index) }>
						<Icon type={ this.icon } width="20" height="20" />
					</Button>
					{
						this.props.isDeleteAllowed ? (
							<Button onClick={ this.handleCreatorRemove.bind(this, index) }>
								<Icon type={ '16/minus' } width="16" height="16" />
							</Button>
						) : (
							<Button disabled={ true }>
								<Icon type={ '16/minus' } width="16" height="16" />
							</Button>
						)
					}
					{
						this.props.isCreateAllowed ? (
							<Button onClick={ this.handleCreatorAdd.bind(this) }>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						) : (
							<Button disabled={ true }>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						)
					}
				</React.Fragment>
			</Field>
		);

	}

	static propTypes = {
		creator: PropTypes.object.isRequired,
		creatorTypes: PropTypes.array.isRequired,
		index: PropTypes.number.isRequired,
		isCreateAllowed: PropTypes.bool,
		isDeleteAllowed: PropTypes.bool,
		isForm: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
		onCreatorAdd: PropTypes.func.isRequired,
		onCreatorRemove: PropTypes.func.isRequired,
		onCreatorTypeSwitch: PropTypes.func.isRequired,
	};
}

module.exports = CreatorField;