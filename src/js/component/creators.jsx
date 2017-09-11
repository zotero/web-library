'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Editable = require('./editable');
const Button = require('./ui/button');
const Icon = require('./ui/icon');

class Creators extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isCreatorTypeEditing: false,
			creators: props.value
		};
	}

	componentWillReceiveProps(props) {
		this.setState({
			creators: props.value
		});	
	}

	valueChangedHandler(index, key, value) {
		const newCreators = this.state.creators.slice(0);
		if(typeof newCreators[index] === 'undefined') {
			newCreators[index] = {
				creatorType: this.props.creatorTypes[0].value,
				firstName: '',
				lastName: ''
			};
		}
		newCreators[index][key] = value;

		if(newCreators[index].lastName || newCreators[index].firstName || newCreators[index].name) {
			this.props.onSave(newCreators);
		}
	}

	addCreatorHandler() {
		const newCreators = this.state.creators.slice(0);
		newCreators.push({
			creatorType: 'author',
			firstName: '',
			lastName: ''
		});
		this.setState({creators: newCreators});
	}

	removeCreatorHandler(index) {
		const newCreators = this.state.creators.slice(0);
		newCreators.splice(index, 1);
		this.props.onSave(newCreators);
	}

	switchCreatorTypeHandler(index) {
		const newCreators = this.state.creators.slice(0);
		if('name' in newCreators[index]) {
			let creator = newCreators[index].name.split(' ');
			newCreators[index] = {
				lastName: creator.length > 1 ? creator[1] : '',
				firstName: creator[0],
				creatorType: newCreators[index].creatorType
			};
		} else if('lastName' in newCreators[index]) {
			newCreators[index] = {
				name: `${newCreators[index].firstName} ${newCreators[index].lastName}`.trim(),
				creatorType: newCreators[index].creatorType
			};
		}
		this.setState({
			creators: newCreators
		});

		if(newCreators[index].lastName || newCreators[index].firstName || newCreators[index].name) {
			this.props.onSave(newCreators);
		}
	}

	render() {
		let creators = this.state.creators;
		
		if(this.state.creators.length === 0 && this.props.creatorTypes.length) {
			creators = [{
				creatorType: this.props.creatorTypes[0].value,
				firstName: '',
				lastName: ''
			}];
		}

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
											if(index + 1 == this.state.creators.length) {
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