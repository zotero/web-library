'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Editable = require('../editable');
const Button = require('../ui/button');
const Icon = require('../ui/icon');

class EditableCreators extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
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
		newCreators[index][key] = value;
		this.props.onSave(newCreators);
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
				firstName: creator.length > 1 ? creator[1] : '',
				lastName: creator[0],
				creatorType: newCreators[index].creatorType
			};
		} else if('lastName' in newCreators[index]) {
			newCreators[index] = {
				name: `${newCreators[index].firstName} ${newCreators[index].lastName}`,
				creatorType: newCreators[index].creatorType
			};
		}
		this.props.onSave(newCreators);
	}

	renderButtons(index) {
		return (
			<span>
				<Button onClick={ this.switchCreatorTypeHandler.bind(this, index) }>
					[] / [][]
				</Button>
				<Button onClick={ this.removeCreatorHandler.bind(this, index) }>
					<Icon type={ '16/trash' } width="16" height="16" />
				</Button>
			</span>
		);
	}
	render() {
		return (
			<div className="creators">
				{
					this.state.creators.map((creator, index) => {
						return (
							<div key={ index } className={cx({
								'creators-twoslot': 'lastName' in creator,
								'creators-oneslot': 'name' in creator
							})}>
								<div className="creators-entry">
									<div className="key">
										Creator Type
									</div>
									<div className="value">
										<Editable
											onSave={ newValue => this.valueChangedHandler(index, 'creatorType', newValue)}
											isLoading={ this.props.creatorTypesLoading }
											options={ this.props.creatorTypes }
											value={ creator.creatorType }
										/>
									</div>
								</div>
							{
								(() => {
									if('name' in creator) {
										return (
											<div className="creators-entry">
												<div className="key">
													Name
												</div>
												<div className="value">
													<Editable
														onSave={ newValue => this.valueChangedHandler(index, 'name', newValue)}
														value={ creator.name }
													/>
												</div>
											</div>
										);
									} else if ('lastName' in creator) {
										return [
											<div className="creators-entry" key="lastName">
												<div className="key">
													Last Name
												</div>
												<div className="value">
													<Editable
														onSave={ newValue => this.valueChangedHandler(index, 'lastName', newValue)}
														key='lastName'
														placeholder='last'
														value={ creator.lastName }
													/>
												</div>
											</div>,
											<div className="creators-entry" key="firstName">
												<div className="key">
													First Name
												</div>
												<div className="value">
													<Editable
														onSave={ newValue => this.valueChangedHandler(index, 'firstName', newValue)}
														key='firstName'
														placeholder='first'
														value={ creator.firstName }
													/>
												</div>
											</div>
										];
									}
								})()
							}
							{ this.renderButtons(index) }
							</div>
						);
					})
				}
				<Button onClick={ this.addCreatorHandler.bind(this) }>
					<Icon type={ '16/plus' } width="16" height="16" />
					&nbsp;Add
				</Button>
			</div>
		);
	}
}

EditableCreators.propTypes = {
	value: PropTypes.array,
	creatorTypes: PropTypes.array.isRequired,
	creatorTypesLoading: PropTypes.bool,
	onSave: PropTypes.func
};

EditableCreators.defaultProps = {
	value: []
};

module.exports = EditableCreators;