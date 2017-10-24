'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Editable = require('./editable');
const Button = require('./ui/button');
const Icon = require('./ui/icon');
const deepEqual = require('deep-equal');
const { splice } = require('../utils');

const isVirtual = Symbol.for('isVirtual');

class Creators extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isCreatorTypeEditing: false,
			creators: props.value.length ? props.value : [this.newCreator]
		};
	}

	componentWillReceiveProps(props) {
		if (!deepEqual(this.props.value, props.value)) {
			this.setState({
				creators: props.value.length ? props.value : [this.newCreator]
			});
		}
	}

	saveCreatorsHandler(creators) {
		this.setState({ creators });
		this.props.onSave(creators.filter(
			creator => !creator.isVirtual && (creator.lastName || creator.firstName || creator.name) 
		));		
	}

	valueChangedHandler(index, key, value) {
		const creators = [...this.state.creators];
		creators[index][key] = value;
		if(creators[index][isVirtual]) {
			delete creators[index][isVirtual];
		}
		this.saveCreatorsHandler(creators);
	}

	addCreatorHandler() {
		const creators = [...this.state.creators];
		creators.push({
			creatorType: 'author', 
			firstName: '',
			lastName: '',
			[isVirtual]: true
		});
		this.setState({ creators });
	}

	removeCreatorHandler(index) {
		this.saveCreatorsHandler(splice(this.state.creators, index, 1));
	}

	switchCreatorTypeHandler(index) {
		const creators = [...this.state.creators];

		if('name' in creators[index]) {
			let creator = creators[index].name.split(' ');
			creators[index] = {
				lastName: creator.length > 1 ? creator[1] : '',
				firstName: creator[0],
				creatorType: creators[index].creatorType
			};
		} else if('lastName' in creators[index]) {
			creators[index] = {
				name: `${creators[index].firstName} ${creators[index].lastName}`.trim(),
				creatorType: creators[index].creatorType
			};
		}

		this.saveCreatorsHandler(creators);
	}

	get newCreator() {
		return {
			creatorType: 'author',
			firstName: '',
			lastName: '',
			[isVirtual]: true
		};
	}

	get hasVirtual() {
		return !!this.state.creators.find(creator => creator[isVirtual]);
	}

	render() {
		let creators = this.state.creators;

		return (
			<div className="creators">
				{
					creators.map((creator, index) => {
						return (
							<li key={ index } className={ cx('metadata', 'creators-entry', {
								'creators-twoslot': 'lastName' in creator,
								'creators-oneslot': 'name' in creator,
								'creators-type-editing': this.state.isCreatorTypeEditing
							}) }>
								<div className="key">
									<Editable
										onSave={ newValue => this.valueChangedHandler(index, 'creatorType', newValue)}
										isLoading={ this.props.creatorTypesLoading }
										options={ this.props.creatorTypes }
										value={ creator.creatorType }
										onToggle ={ isCreatorTypeEditing => this.setState({ isCreatorTypeEditing }) }
										>
										{(() => {
											let creatorTypeDescription = this.props.creatorTypes.find(c => c.value == creator.creatorType);
											if(creatorTypeDescription) {
												return creatorTypeDescription.label;
											} else {
												return creator.creatorType;
											}
										})()}
										&nbsp;<span className="Select-arrow"></span>
										</Editable>
								</div>
								<div className="value">
									{(() => {
										if('name' in creator) {
											return (
												<Editable
													onSave={ newValue => this.valueChangedHandler(index, 'name', newValue)}
													key='name'
													placeholder='full name'
													value={ creator.name }
												/>
											);
										} else if ('lastName' in creator) {
											return [
												<Editable
													onSave={ newValue => this.valueChangedHandler(index, 'lastName', newValue)}
													key='lastName'
													placeholder='last'
													value={ creator.lastName }
													displayValue={ creator.lastName ? `${creator.lastName},` : null }
												/>,
												<Editable
													onSave={ newValue => this.valueChangedHandler(index, 'firstName', newValue)}
													key='firstName'
													placeholder='first'
													value={ creator.firstName }
												/>
											];
										}
									})()}
									<Button onClick={ this.switchCreatorTypeHandler.bind(this, index) }>
										<Icon type={ 'name' in creator ? '16/input-dual' : '16/input-single' } width="16" height="16" />
									</Button>
									<Button onClick={ this.removeCreatorHandler.bind(this, index) }>
										<Icon type={ '16/trash' } width="16" height="16" />
									</Button>
									{(() => {
											if(index + 1 == this.state.creators.length && !this.hasVirtual) {
												return (
													<Button onClick={ this.addCreatorHandler.bind(this) }>
														<Icon type={ '16/plus' } width="16" height="16" />
													</Button>
												);
											} else {
												return (
													<Button disabled={ true }>
														<Icon color="rgba(0, 0, 0, 0.15)" type={ '16/plus' } width="16" height="16" />
													</Button>
												);
											}
										})()
									}
								</div>
							</li>
						);
					})
				}
			</div>
		);
	}
}

Creators.propTypes = {
	name: PropTypes.string,
	value: PropTypes.array,
	creatorTypes: PropTypes.array.isRequired,
	creatorTypesLoading: PropTypes.bool,
	onSave: PropTypes.func
};

Creators.defaultProps = {
	value: []
};

module.exports = Creators;