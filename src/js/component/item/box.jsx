'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Editable = require('../editable');
const Creators = require('../creators');
const Spinner = require('../ui/spinner');

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

						switch(field.key) {
							case 'notes':
								return null;
							case 'creators':
								return (
									<Creators
										key={ field.key }
										name={ field.key }
										creatorTypes = { this.props.creatorTypes }
										value={ field.value || [] }
										onSave={ newValue => this.props.onSave(field.key, newValue) } />
								);
							case 'itemType':
								return (
									<li key={ field.key } className={ cx('metadata', classNames) }>
										<div className='key'>
											<label>
												{ field.label }
											</label>
										</div>
										<div className='value'>
											<Editable
												name={ field.key }
												options = { field.options || null }
												processing={ field.processing || false }
												value={ field.value || '' }
												displayValue={ field.options.find(o => o.value === field.value).label }
												editOnClick = { !field.readonly }
												onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
												onSave={ newValue => this.props.onSave(field.key, newValue) } 
											/>
										</div>
									</li>
								);
							case 'abstractNote':
								return (
									<li key={ field.key } className={ cx('metadata', classNames) }>
										<div className='key'>
											<label>
												{ field.label }
											</label>
										</div>
										<div className='value'>
											<Editable
												name={ field.key }
												isTextArea={ true }
												options = { field.options || null }
												processing={ field.processing || false }
												value={ field.value || '' }
												editOnClick = { !field.readonly }
												onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
												onSave={ newValue => this.props.onSave(field.key, newValue) } 
											/>
										</div>
									</li>
								);
							case 'url':
								return (
									<li key={ field.key } className={ cx('metadata', classNames) }>
										<div className='key'>
											<label>
												<a rel='nofollow' href={ field.value }>
													{ field.label }
												</a>	
											</label>
										</div>
										<div className='value'>
											<Editable
												name={ field.key }
												processing={ field.processing || false }
												value={ field.value || '' }
												editOnClick={ !field.readonly }
												onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
												onSave={ newValue => this.props.onSave(field.key, newValue) }
											/>
										</div>
									</li>
								);
							case 'DOI':
								return (
									<li key={ field.key } className={ cx('metadata', classNames) }>
										<div className='key'>
											<label>
												<a rel='nofollow' href={ 'http://dx.doi.org/' + this.props.value }>
													{ field.label }
												</a>	
											</label>
										</div>
										<div className='value'>
											<Editable
												name={ field.key }
												processing={ field.processing || false }
												value={ field.value || '' }
												editOnClick={ !field.readonly }
												onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
												onSave={ newValue => this.props.onSave(field.key, newValue) }
											/>
										</div>
									</li>
								);
							default:
								return (
									<li key={ field.key } className={ cx('metadata', classNames) }>
										<div className='key'>
											<label>
												{ field.label }
											</label>
										</div>
										<div className='value'>
											<Editable
												name={ field.key }
												processing={ field.processing || false }
												value={ field.value || '' }
												editOnClick={ !field.readonly }
												onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
												onSave={ newValue => this.props.onSave(field.key, newValue) }
											/>
										</div>
									</li>
								);
							}
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

module.exports = ItemBox;