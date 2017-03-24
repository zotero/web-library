'use strict';

import React from 'react';
import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';
import { itemProp } from '../constants';

class Item extends React.Component {
	render() {
		return (
			<li className={ `item ${this.props.active ? 'active' : '' }` } onClick={ this.props.onClick }>
				<div className="metadata">
					{ this.props.item.get('title') }
				</div>
				<div className="metadata author">
					{ this.props.item.get('author') }
				</div>
				<div className="metadata year">
					{ this.props.item.get('year') }
				</div>
				<div className="metadata hidden-touch hidden-sm-down">
					{ this.props.item.get('date') }
				</div>
				<div className="metadata hidden-touch hidden-sm-down"></div>
				<div className="metadata hidden-touch hidden-sm-down"></div>
			</li>
		);
	}
}

Item.propTypes = {
	item: itemProp,
	active: React.PropTypes.bool,
	onClick: React.PropTypes.func
};

Item.defaultProps = {
	active: false,
	onClick: () => {} 
};

export default InjectableComponentsEnhance(Item);