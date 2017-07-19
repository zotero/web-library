'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const InjectableComponentsEnhance = require('../enhancers/injectable-components-enhancer');
const { itemProp } = require('../constants/item');
const moment = require('moment');

class Item extends React.Component {
	render() {
		return (
			<li 
				className={ `item ${this.props.active ? 'active' : '' }` }
				onClick={ this.props.onClick }
			>
				<div className="metadata title">
					{ this.props.item.title }
				</div>
				<div className="metadata author">
					{ this.props.item.creatorSummary }
				</div>
				<div className="metadata year">
					{ moment(this.props.item.parsedDate, 'YYYY-MM-DD').format('YYYY') }
				</div>
				<div className="metadata date-modified hidden-touch hidden-sm-down">
					{ moment(this.props.item.dateModified).format('YYYY-MM-DD HH:mm') }
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

module.exports = InjectableComponentsEnhance(Item);