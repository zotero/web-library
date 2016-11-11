'use strict';

import React from 'react';

export default class Item extends React.Component {
	render() {
		return (
			<li className="item">
				<div className="metadata">
					{ this.props.item.data.title }
				</div>
				<div className="metadata author">
					{ this.props.item.data.author }
				</div>
				<div className="metadata year">
					{ this.props.item.data.year }
				</div>
				<div className="metadata hidden-touch hidden-sm-down">
					{ this.props.item.data.date }
				</div>
				<div className="metadata hidden-touch hidden-sm-down"></div>
				<div className="metadata hidden-touch hidden-sm-down"></div>
			</li>
		);
	}
}

Item.propTypes = {
	item: React.PropTypes.shape({
		data: React.PropTypes.shape({
			title: React.PropTypes.string,
			author: React.PropTypes.string,
			year: React.PropTypes.number,
			date: React.PropTypes.string
		})
	}).isRequired
};