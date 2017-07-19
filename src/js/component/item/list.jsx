'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const InjectableComponentsEnhance = require('../../enhancers/injectable-components-enhancer');

class ItemList extends React.Component {
	render() {
		let Item = this.props.components['Item'];
		let Spinner = this.props.components['Spinner'];

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
						<ul className="item list">
							{
								this.props.items.map(item => <Item
									onClick={ () => this.props.onItemSelected(item.key) }
									active= { item.key === this.props.selectedItemKey }
									key={ item.key }
									item={ item } />)
							}
						</ul>
					</div>
				</div>
			);
		}
	}
}

ItemList.propTypes = {
	items: PropTypes.array,
	selectedItemKey: PropTypes.string,
	isFetching: PropTypes.bool,
	onItemSelected: PropTypes.func
};

ItemList.defaultProps = {
	isFetching: false
};

module.exports = InjectableComponentsEnhance(ItemList);
