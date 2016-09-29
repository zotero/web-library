'use strict';

import React from 'react';
import Item from './item';
import Spinner from '../app/spinner';

export default class ItemsList extends React.Component {
	render() {
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<div className="item-list-wrap">
					<table className="item-list-head hidden-touch hidden-sm-down">
						<thead>
							<tr>
								<th>Title</th>
								<th>Creator</th>
								<th>Year</th>
								<th className="hidden-touch hidden-sm-down">Date Modified</th>
								<th className="hidden-touch hidden-sm-down"></th>
								<th className="hidden-touch hidden-sm-down"></th>
							</tr>
						</thead>
					</table>
					<div className="item-list-body">
						<ul className="item-list">
							{
								this.props.items.map(item => <Item key={ item.key } item={ item } />)
							}
						</ul>
					</div>
				</div>
			);
		}
	}
}

ItemsList.propTypes = {
	items: React.PropTypes.array,
	isFetching: React.PropTypes.bool
};

ItemsList.defaultProps = {
	isFetching: false
};