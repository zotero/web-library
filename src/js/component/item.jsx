'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { itemProp } = require('../constants/item');
const { get } = require('../utils');
const { noteAsTitle } = require('../common/format');
const moment = require('moment');

class Item extends React.Component {
	renderItemTitle() {
		switch(this.props.item.itemType) {
			case 'note':
				return noteAsTitle(this.props.item.note);
			default:
				return this.props.item.title;
		}
	}

	renderItemYear() {
		const parsedDate = Symbol.for('meta') in this.props.item && get(this.props.item[Symbol.for('meta')], 'parsedDate', '');
		return parsedDate && moment(parsedDate, 'YYYY-MM-DD').format('YYYY') || '';
	}

	render() {
		return (
			<li 
				className={ `item ${this.props.active ? 'active' : '' }` }
				onClick={ this.props.onClick }
			>
				<div className="metadata title">
					{ this.renderItemTitle() }
				</div>
				<div className="metadata author">
					{ Symbol.for('meta') in this.props.item && get(this.props.item[Symbol.for('meta')], 'creatorSummary', '') }
				</div>
				<div className="metadata year">
					{ this. renderItemYear() }
				</div>
				<div className="metadata date-modified hidden-touch hidden-sm-down">
					{ 'dateModified' in this.props.item ? moment(this.props.item.dateModified).format('YYYY-MM-DD HH:mm') : '' }
				</div>
				<div className="metadata hidden-touch hidden-sm-down"></div>
				<div className="metadata hidden-touch hidden-sm-down"></div>
			</li>
		);
	}
}

Item.propTypes = {
	item: itemProp,
	active: PropTypes.bool,
	onClick: PropTypes.func
};

Item.defaultProps = {
	active: false,
	onClick: () => {} 
};

module.exports = Item;