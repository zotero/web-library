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
const { noop } = require('../../utils');
const format = require('../../common/format');
const Modal = require('../ui/modal');
const { UserTypeContext, ViewportContext } = require('../../context');

class CreatorField extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			active: null
		};
		this.fieldComponents = {};
	}

	focus() {
		const key = 'lastName' in this.props.creator ? 'lastName' : 'name';
		if(!this.props.isForm) {
			this.setState({ active: key });
		} else {
			key in this.fieldComponents && this.fieldComponents[key].focus();
		}
	}

	componentDidMount() {
		const { isVirtual, isEditing } = this.props;
		if(isEditing && isVirtual) {
			this.handleModalOpen();
		}
	}

	handleFieldClick(key) {
		this.setState({ active: key });
	}

	handleFieldFocus(key) {
		this.setState({
			active: key,
		});
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

	handleCreatorRemove(ev) {
		this.props.onCreatorRemove(this.props.index);
		ev && ev.stopPropagation();
	}

	handleCreatorAdd() {
		this.props.onCreatorAdd(this.props.creator);
	}

	handleModalOpen() {
		this.setState({ isModalVisible: true })
	}

	handleModalClose() {
		this.setState({ isModalVisible: false })
	}

	get icon() {
		return 'name' in this.props.creator ? '20/input-dual' : '20/input-single';
	}

	get isDual() {
		return 'lastName' in this.props.creator;
	}

	get creatorLabel() {
		const { creator, creatorTypes } = this.props;
		const creatorTypeDescription = creatorTypes.find(
				c => c.value == creator.creatorType
			) || { label: creator.creatorType };
		return creatorTypeDescription.label;
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
			extraProps['onClick'] = this.handleFieldClick.bind(this, name);
			extraProps['onFocus'] = this.handleFieldFocus.bind(this, name);
		} else {
			extraProps['onEditableClick'] = this.handleFieldClick.bind(this, name);
			extraProps['onEditableFocus'] = this.handleFieldFocus.bind(this, name);
		}

		if(name === 'lastName') {
			extraProps['resize'] = 'horizontal';
		}

		return (
			<FormField
				autoFocus={ !this.props.isForm }
				isActive={ this.state.active === name }
				onCancel={ this.handleCancel.bind(this) }
				onCommit={ this.handleEditableCommit.bind(this, name) }
				placeholder={ label }
				selectOnFocus={ !this.props.isForm }
				value={ creator[name] }
				aria-label={ label }
				className={ this.props.isForm ? 'form-control form-control-sm' : '' }
				isDisabled = { this.props.readOnly }
				{ ...extraProps }
			/>
		);
	}

	renderCreatorTypeSelector() {
		const { creator, creatorTypes } = this.props;
		return <SelectInput
			className="form-control form-control-sm"
			inputComponent={ SelectInput }
			isActive={ this.state.active === 'creatorType' }
			onCancel={ this.handleCancel.bind(this) }
			onChange={ () => true }
			onCommit={ this.handleEditableCommit.bind(this, 'creatorType') }
			onClick={ this.handleFieldClick.bind(this, 'creatorType') }
			onFocus={ this.handleFieldFocus.bind(this, 'creatorType') }
			options={ creatorTypes }
			ref={ component => this.fieldComponents['creatorType'] = component }
			searchable={ false }
			tabIndex = { 0 }
			isDisabled = { this.props.readOnly }
			value={ creator.creatorType }
		/>
	}

	renderModal(shouldUseTransition) {
		const { isModalVisible } = this.state;
		const content = (
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					<div className="modal-header-left">
						<Button
							className="btn-link"
							onClick={ this.handleModalClose.bind(this) }
						>
							Cancel
						</Button>
					</div>
					<div className="modal-header-center">
						<h4 className="modal-title truncate">
							{ this.creatorLabel }
						</h4>
					</div>
					<div className="modal-header-right">
						<Button
							className="btn-link"
							onClick={ this.handleModalClose.bind(this) }
						>
							Done
						</Button>
					</div>
				</div>
				<div className="modal-body">
					<ol className="metadata-list editing">
						<Field className="touch-separated">
							<label>
								Creator
							</label>
							{ this.renderCreatorTypeSelector() }
						</Field>
						{
							this.isDual ? (
								<React.Fragment>
									<Field>
										<label>
											Last Name
										</label>
										{ this.renderField('lastName', 'last name') }
									</Field>
									<Field>
										<label>
											First Name
										</label>
										{ this.renderField('firstName', 'first name') }
									</Field>
								</React.Fragment>
							) : (
								<Field>
									<label>
										Name
									</label>
									{ this.renderField('name', 'name') }
								</Field>
							)
						}
						<li className="metadata touch-separated has-btn">
							<Button onClick={ this.handleCreatorTypeSwitch.bind(this) }>
								Switch to { this.isDual ? 'Single' : 'Dual' } Field
							</Button>
						</li>
						<li className="metadata has-btn">
							<Button
								className="btn-delete"
								onClick={ this.handleCreatorRemove.bind(this) }
							>
								Delete { this.creatorLabel }
							</Button>
						</li>
					</ol>
				</div>
			</div>
		);

		return (
			<Modal
				isOpen={ isModalVisible }
				contentLabel="Edit Creator"
				className="modal-touch"
				overlayClassName={ shouldUseTransition ? "modal-slide" : null }
				closeTimeoutMS={ shouldUseTransition ? 600 : null }
				onRequestClose={ this.handleModalClose.bind(this) }
			>
				{ content }
			</Modal>
		);
	}

	render() {
		return (
		<UserTypeContext.Consumer>
		{ userType => (
		<ViewportContext.Consumer>
		{ viewport => {
			const shouldUseModalEdit = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
			const {
				creator,
				index,
				isSingle,
				isVirtual,
				isEditing,
				onDragStatusChange,
				onReorder,
				onReorderCancel,
				onReorderCommit,
				readOnly,
			} = this.props;
			const className = {
				'creators-entry': true,
				'creators-oneslot': 'name' in creator,
				'creators-twoslot': 'lastName' in creator,
				'creators-type-editing': this.state.isCreatorTypeActive,
				'creators-modal-trigger': shouldUseModalEdit,
				'metadata': true,
				'single': isSingle,
				'virtual': isVirtual
			};

			// raw formatted data for use in drag-n-drop indicator
			const raw = { ...creator, creatorType: this.creatorLabel, }

			return (
				<React.Fragment>
				{ this.renderModal(viewport.xxs) }
				<Field
					className={ cx(this.props.className, className) }
					index={ index }
					isSortable={ !isSingle && !isVirtual && !readOnly }
					key={ creator.id }
					onClick={ shouldUseModalEdit && isEditing ? this.handleModalOpen.bind(this) : noop }
					onReorder={ onReorder }
					onReorderCancel={ onReorderCancel }
					onReorderCommit={ onReorderCommit }
					onDragStatusChange={ onDragStatusChange }
					raw={ raw }
					tabIndex = { shouldUseModalEdit ? 0 : null }
				>
					{ shouldUseModalEdit && isEditing ?
						<div className="truncate">{ this.creatorLabel }</div> :
						this.renderCreatorTypeSelector()
					}
					<React.Fragment>
						{
							shouldUseModalEdit ? (
								<div className="creator-string">
									{ isVirtual ? this.isDual ? 'last name, first name' : 'name' :
										format.creator(creator)
									}
								</div>
							) : (
								this.isDual ? this.renderDual() : this.renderSingle()
							)
						}
						<Button
							className="btn-single-dual"
							onClick={ this.handleCreatorTypeSwitch.bind(this) }
						>
							<Icon type={ this.icon } width="20" height="20" />
						</Button>
						{
							this.props.isDeleteAllowed ? (
								<Button
									className="btn-minus"
									onClick={ this.handleCreatorRemove.bind(this) }
								>
									<Icon type={ '16/minus' } width="16" height="16" />
								</Button>
							) : (
								<Button className="btn-minus" disabled={ true }>
									<Icon type={ '16/minus' } width="16" height="16" />
								</Button>
							)
						}
						{
							this.props.isCreateAllowed ? (
								<Button
									className="btn-plus"
									onClick={ this.handleCreatorAdd.bind(this) }
								>
									<Icon type={ '16/plus' } width="16" height="16" />
								</Button>
							) : (
								<Button className="btn-plus" disabled={ true }>
									<Icon type={ '16/plus' } width="16" height="16" />
								</Button>
							)
						}
					</React.Fragment>
				</Field>
				</React.Fragment>
			);
		}}
		</ViewportContext.Consumer>
		)}
		</UserTypeContext.Consumer>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		creator: PropTypes.object.isRequired,
		creatorTypes: PropTypes.array.isRequired,
		index: PropTypes.number.isRequired,
		isCreateAllowed: PropTypes.bool,
		isDeleteAllowed: PropTypes.bool,
		isForm: PropTypes.bool,
		isSingle: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
		onCreatorAdd: PropTypes.func.isRequired,
		onCreatorRemove: PropTypes.func.isRequired,
		onCreatorTypeSwitch: PropTypes.func.isRequired,
		onDragStatusChange: PropTypes.func,
		onReorder: PropTypes.func,
		onReorderCancel: PropTypes.func,
		onReorderCommit: PropTypes.func,
		readOnly: PropTypes.bool,
	};
}

module.exports = CreatorField;
