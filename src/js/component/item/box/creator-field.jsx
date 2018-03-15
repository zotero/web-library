'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Field = require('./field');
const Editable = require('../../editable');
const Button = require('../../ui/button');
const Icon = require('../../ui/icon');
const Input = require('../../input');
const SelectInput = require('../../select-input');

class CreatorField extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			active: null
		};
		this.fieldComponents = {};
	}

	handleEdit(field) {
		if(this.props.isForm && this.fieldComponents[field]) {
			this.fieldComponents[field].focus();
		}
		this.setState({ active: field });
	}

	handleCancel() {
		this.setState({ active: null });
	}

	handleEditableCommit(field, newValue) {
		this.props.onChange(this.props.index, field, newValue);
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
		const FormField = this.props.isForm ? Input : Editable;
		const { creator } = this.props;
		return (
			<React.Fragment>
				<span
					tabIndex={ this.state.active === 'lastName' ? null : 0 }
					className="field-editable-wrap"
					onClick={ this.handleEdit.bind(this, 'lastName') }
					onFocus={ this.handleEdit.bind(this, 'lastName') }
				>
					<FormField
						autoFocus={ !this.props.isForm }
						displayValue={ creator.lastName ? `${creator.lastName},` : null }
						isActive={ this.state.active === 'lastName' }
						onBlur={ () => false }
						onCancel={ this.handleCancel.bind(this) }
						onCommit={ this.handleEditableCommit.bind(this, 'lastName') }
						placeholder='last'
						ref={ component => this.fieldComponents['lastName'] = component }
						selectOnFocus={ true }
						value={ creator.lastName }
					/>
				</span>
				<span
					tabIndex={ this.state.active === 'firstName' ? null : 0 }
					className="field-editable-wrap"
					onClick={ this.handleEdit.bind(this, 'firstName') }
					onFocus={ this.handleEdit.bind(this, 'firstName') }
				>
					<FormField
						autoFocus={ !this.props.isForm }
						isActive={ this.state.active === 'firstName' }
						onBlur={ () => false }
						onCancel={ this.handleCancel.bind(this) }
						onCommit={ this.handleEditableCommit.bind(this, 'firstName') }
						placeholder='first'
						ref={ component => this.fieldComponents['firstName'] = component }
						selectOnFocus={ true }
						value={ creator.firstName }
					/>
				</span>
			</React.Fragment>
		);
	}

	renderSingle() {
		const FormField = this.props.isForm ? Input : Editable;
		const { creator } = this.props;
		return (
			<span
				tabIndex={ this.state.active === 'name' ? null : 0 }
				className="field-editable-wrap"
				onClick={ this.handleEdit.bind(this, 'name') }
				onFocus={ this.handleEdit.bind(this, 'name') }
			>
				<FormField
					autoFocus={ !this.props.isForm }
					isActive={ this.state.active === 'name' }
					onBlur={ () => false }
					onCancel={ this.handleCancel.bind(this) }
					onCommit={ this.handleEditableCommit.bind(this, 'name') }
					placeholder='full name'
					ref={ component => this.fieldComponents['name'] = component }
					selectOnFocus={ true }
					value={ creator.name }
				/>
			</span>
		);
	}

	render() {
		const { index, creator, creatorTypes } = this.props;
		const className = {
			'metadata': true,
			'creators-entry': true,
			'creators-twoslot': 'lastName' in creator,
			'creators-oneslot': 'name' in creator,
			'creators-type-editing': this.state.isCreatorTypeActive
		};

		const creatorTypeDescription = creatorTypes.find(
			c => c.value == creator.creatorType
		) || { label: creator.creatorType };

		return (
			<Field key={ index } className={ cx(className) } tabIndex={ null }>
				<span
					tabIndex={ this.state.active === 'creatorType' ? null : 0 }
					className="field-editable-wrap"
					onClick={ this.handleEdit.bind(this, 'creatorType') }
					onFocus={ this.handleEdit.bind(this, 'creatorType') }
				>
					<Editable
						onCommit={ this.handleEditableCommit.bind(this, 'creatorType') }
						onCancel={ this.handleCancel.bind(this) }
						isActive={ this.state.active === 'creatorType' }
						options={ creatorTypes }
						inputComponent={ SelectInput }
						value={ creator.creatorType }
						autoFocus
					>
						{ creatorTypeDescription.label }
						<span className="Select-arrow"></span>
					</Editable>
				</span>
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
								<Icon color="rgba(0, 0, 0, 0.15)" type={ '16/minus' } width="16" height="16" />
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
								<Icon color="rgba(0, 0, 0, 0.15)" type={ '16/plus' } width="16" height="16" />
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