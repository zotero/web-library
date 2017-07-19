'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const InjectableComponentsEnhance = require('../../enhancers/injectable-components-enhancer');
const { itemProp } = require('../../constants/item');

class ItemBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditingMap: {}
		};
	}

	onEditableToggleHandler(key, isEditing) {
		this.setState({
			isEditingMap: {
				...this.state.isEditingMap,
				[key]: isEditing
			}
		});
	}

	render() {
		let Editable = this.props.components['Editable'];
		let EditableCreators = this.props.components['EditableCreators'];
		let Spinner = this.props.components['Spinner'];

		if(this.props.isLoading) {
			return <Spinner />;
		}
		
		return (
			<ol className={cx('metadata-list', 'horizontal', { editing: this.props.isEditing }) }>
				{
					this.props.fields.map(field => {
						const classNames = {
							'empty': !field.value || !field.value.length,
							'select': field.options && Array.isArray(field.options),
							'editing': field.key in this.state.isEditingMap && this.state.isEditingMap[field.key]
						};

						return [
							<li className={ cx('metadata', classNames) }>
								<div className='key'>
									<label>
										{ field.label }
									</label>
								</div>
								<div className='value'>
									{
										(() => {
											switch(field.key) {
												case 'notes':
													return null;
												case 'creators':
													return (
														<EditableCreators
															name={ field.key }
															creatorTypes = { this.props.creatorTypes }
															value = { field.value || [] }
															onSave={ newValue => this.props.onSave(field.key, newValue) } />
													);
												case 'itemType':
													return (
														<Editable
															name={ field.key }
															options = { field.options || null }
															processing={ field.processing || false }
															value={ field.value || '' }
															editOnClick = { !field.readonly }
															onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
															onSave={ newValue => this.props.onSave(field.key, newValue) } 
														/>
													);
												default:
													return (
														<Editable
															name={ field.key }
															processing={ field.processing || false }
															value={ field.value || '' }
															editOnClick={ !field.readonly }
															onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
															onSave={ newValue => this.props.onSave(field.key, newValue) }
														/>
													);
											}
										})()
									}
								</div>
							</li>
						];
					})
				}
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

module.exports = InjectableComponentsEnhance(ItemBox);