'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Editable = require('../editable');
const Creators = require('../creators');
const Spinner = require('../ui/spinner');
const BoxEntry = require('./box/entry');

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

	renderCreators(field) {
		return (
			<Creators
				key={ field.key }
				name={ field.key }
				creatorTypes = { this.props.creatorTypes }
				value={ field.value || [] }
				onSave={ newValue => this.props.onSave(field.key, newValue) } />
		);
	}

	renderItemTypeField(field, common, classNames) {
		return (
			<BoxEntry key={ field.key } classNames={ classNames }>
				{ field.label }
				<Editable
					displayValue={ field.options.find(o => o.value === field.value).label }
					{ ...common }
				/>
			</BoxEntry>
		);
	}

	renderAbstractNote(field, common, classNames) {
		return (
			<BoxEntry key={ field.key } classNames={ classNames }>
				{ field.label }
				<Editable isTextArea={ true } { ...common } />
			</BoxEntry>
		);
	}

	renderUrlField(field, common, classNames) {
		return (
			<BoxEntry key={ field.key } classNames={ classNames }>
				<a rel='nofollow' href={ field.value }>
					{ field.label }
				</a>	
				<Editable { ...common } />
			</BoxEntry>
		);
	}

	renderDOIField(field, common, classNames) {
		return (
			<BoxEntry key={ field.key } classNames={ classNames }>
				<a rel='nofollow' href={ 'http://dx.doi.org/' + this.props.value }>
					{ field.label }
				</a>	
				<Editable { ...common } />
			</BoxEntry>
		);
	}

	renderGenericField(field, common, classNames) {
		return (
			<BoxEntry key={ field.key } classNames={ classNames }>
				{ field.label }
				<Editable isTextArea={ field.key === 'extra' } { ...common } />
			</BoxEntry>
		);
	}

	renderField(field) {
		const classNames = {
			'empty': !field.value || !field.value.length,
			'select': field.options && Array.isArray(field.options),
			'editing': field.key in this.state.isEditingMap && this.state.isEditingMap[field.key]
		};
		const common = {
			name: field.key,
			value: field.value || '',
			editOnClick: !field.readonly,
			onToggle: this.onEditableToggleHandler.bind(this, field.key),
			onSave: newValue => this.props.onSave(field.key, newValue),
			processing: field.processing || false,
			options: field.options || null
		};

		switch(field.key) {
			case 'notes': return null;
			case 'creators': return this.renderCreators(field, common, classNames);
			case 'itemType': return this.renderItemTypeField(field, common, classNames);
			case 'abstractNote': return this.renderAbstractNote(field, common, classNames);
			case 'url': return this.renderUrlField(field, common, classNames);
			case 'DOI': return this.renderDOIField(field, common, classNames);
			default: return this.renderGenericField(field, common, classNames);
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