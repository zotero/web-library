'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Field = require('./field');
const Editable = require('../../editable');
const Button = require('../../ui/button');
const Icon = require('../../ui/icon');
const SelectInput = require('../../select-input');

class CreatorField extends React.PureComponent {
	state = {
		active: null
	}

	handleEdit(field) {
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
		return 'name' in this.props.creator ? '16/input-dual' : '16/input-single';
	}

	renderDual() {
		const { creator } = this.props;
		return (
			<React.Fragment>
				<span 
					tabIndex={ this.state.active === 'lastName' ? null : 0 }
					className="field-editable-wrap" 
					onClick={ this.handleEdit.bind(this, 'lastName') }
					onFocus={ this.handleEdit.bind(this, 'lastName') }
				>
					<Editable
						onCommit={ this.handleEditableCommit.bind(this, 'lastName') }
						onCancel={ this.handleCancel.bind(this) }
						isActive={ this.state.active === 'lastName' }
						onBlur={ () => false }
						placeholder='last'
						value={ creator.lastName }
						displayValue={ creator.lastName ? `${creator.lastName},` : null }
						autoFocus
						autoSelect
					/>
				</span>
				<span
					tabIndex={ this.state.active === 'firstName' ? null : 0 }
					className="field-editable-wrap" 
					onClick={ this.handleEdit.bind(this, 'firstName') }
					onFocus={ this.handleEdit.bind(this, 'firstName') }
				>
					<Editable
						onCommit={ this.handleEditableCommit.bind(this, 'firstName') }
						onCancel={ this.handleCancel.bind(this) }
						isActive={ this.state.active === 'firstName' }
						onBlur={ () => false }
						placeholder='first'
						value={ creator.firstName }
						autoFocus
						autoSelect
					/>
				</span>
			</React.Fragment>
		);
	}

	renderSingle() {
		const { creator } = this.props;
		return (
			<span
				tabIndex={ this.state.active === 'name' ? null : 0 }
				className="field-editable-wrap" 
				onClick={ this.handleEdit.bind(this, 'name') }
				onFocus={ this.handleEdit.bind(this, 'name') }
			>
				<Editable
					onCommit={ this.handleEditableCommit.bind(this, 'name') }
					onCancel={ this.handleCancel.bind(this) }
					isActive={ this.state.active === 'name' }
					onBlur={ () => false }
					placeholder='full name'
					value={ creator.name }
					autoFocus
					autoSelect
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
						&nbsp;<span className="Select-arrow"></span>
					</Editable>
				</span>
				<React.Fragment>
					{ 'lastName' in creator ? this.renderDual() : this.renderSingle() }
					<Button onClick={ this.handleCreatorTypeSwitch.bind(this, index) }>
						<Icon type={ this.icon } width="16" height="16" />
					</Button>
					{
						this.props.isDeleteAllowed ? (
							<Button onClick={ this.handleCreatorRemove.bind(this, index) }>
								<Icon type={ '16/trash' } width="16" height="16" />
							</Button>
						) : (
							<Button disabled={ true }>
								<Icon color="rgba(0, 0, 0, 0.15)" type={ '16/trash' } width="16" height="16" />
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
		index: PropTypes.number.isRequired,
		onChange: PropTypes.func.isRequired,
		creator: PropTypes.object.isRequired,
		creatorTypes: PropTypes.array.isRequired,
		isCreateAllowed: PropTypes.bool,
		isDeleteAllowed: PropTypes.bool,
		onCreatorTypeSwitch: PropTypes.func.isRequired,
		onCreatorAdd: PropTypes.func.isRequired,
		onCreatorRemove: PropTypes.func.isRequired,
	};
}

module.exports = CreatorField;