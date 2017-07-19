'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemBox = require('../box');
const { connect } = require('react-redux');
const { updateItem, fetchItemTypeCreatorTypes, fetchItemTypeFields } = require('../../../actions');
const { itemProp, hideFields, noEditFields } = require('../../../constants/item');
const { isNewValue } = require('../../../utils');
const { 
	getItem,
	getItemFieldValue,
	isItemFieldBeingUpdated
} = require('../../../state-utils');

class ItemBoxContainer extends React.Component {
	async itemUpdatedHandler(item, fieldKey, newValue) {
		try {
			const updatedItem = await this.props.dispatch(
				updateItem(this.props.libraryKey, item.key, {
					[fieldKey]: newValue
				})
			);
			return updatedItem[fieldKey];
		} catch(error) {
			throw error;
		}
	}

	componentWillReceiveProps(nextProps) {
		if(isNewValue(this.props.item, nextProps.item)) {
			this.props.dispatch(
				fetchItemTypeCreatorTypes(nextProps.item.itemType)
			);
			this.props.dispatch(
				fetchItemTypeFields(nextProps.item.itemType)
			);
		}
	}

	render() {
		return <ItemBox 
			onSave={ this.itemUpdatedHandler.bind(this, this.props.item) }
			{ ...this.props }
		/>;
	}
}

const mapStateToProps = state => {
	const item = getItem(state);

	if(!item) {
		return {};
	}

	if(!(item.itemType in state.creatorTypes) || !(item.itemType in state.itemTypeFields)) {
		return {
			item,
			isLoading: true
		};
	}

	const fields = [
		...state.itemTypeFields[item.itemType],
		{ field: 'itemType', localized: 'Item Type' }
	];
	const isSmallScreen = 'lg' in state.viewport && !state.viewport.lg;
	const isEditingEnabled = !isSmallScreen || state.items.editing === item.key;

	//@TODO: Refactor
	return {
		fields: fields.map(f => ({
				options: f.name === 'itemType' ? state.constants.itemTypes : null,
				key: f.field,
				label: f.localized,
				readonly: isEditingEnabled ? noEditFields.includes(f) : true,
				processing: isItemFieldBeingUpdated(f.field, state),
				value: getItemFieldValue(f.field, state)
		})).filter(f => !hideFields.includes(f.field)),
		item: item || undefined,
		creatorTypes: state.creatorTypes[item.itemType],
		
		//@TODO: temporary, fix this together with selectLibrary events in actions
		libraryKey: state.library.libraryKey, 
		isEditing: item && state.items.editing === item.key
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemBoxContainer.propTypes = {
	creatorTypes: PropTypes.array,
	creatorTypesLoading: PropTypes.bool,
	dispatch: PropTypes.func.isRequired,
	fields: PropTypes.array,
	isEditing: PropTypes.bool,
	item: itemProp,
	libraryKey: PropTypes.string
};

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemBoxContainer);