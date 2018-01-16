'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../component/item/details');
const { connect } = require('react-redux');
const { createItem, updateItem, deleteItem, fetchItemTemplate, fetchChildItems } = require('../actions');
const { itemProp } = require('../constants/item');
const { get } = require('../utils');
const { getItem, getChildItems } = require('../state-utils');

class ItemDetailsContainer extends React.Component {
	componentWillReceiveProps(props) {
		const itemKey = get(props, 'item.key');
		if(itemKey && get(this.props, 'item.key') !== itemKey) {
			this.props.dispatch(fetchChildItems(itemKey));
		}
	}

	async handleNoteChange(key, note) {
		await this.props.dispatch(updateItem(key, { note }));
	}

	async handleAddNote(note = '') {
		const noteTemplate = await this.props.dispatch(fetchItemTemplate('note'));
		const item = {
			...noteTemplate,
			parentItem: this.props.item.key,
			note
		};
		await this.props.dispatch(createItem(item));
	}

	async handleDeleteNote(note) {
		await this.props.dispatch(deleteItem(note));
	}

	render() {
		return <ItemDetails 
				onNoteChange={ this.handleNoteChange.bind(this) }
				onAddNote={ this.handleAddNote.bind(this) }
				onDeleteNote = { this.handleDeleteNote.bind(this) }
				{ ...this.props }
			/>;
	}
}

const mapStateToProps = state => {
	return {
		item: getItem(state) || {},
		childItems: getChildItems(state) || []
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: itemProp,
	dispatch: PropTypes.func.isRequired
};

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemDetailsContainer);