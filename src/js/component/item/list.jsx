'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const KeyHandler = require('react-key-handler').default;
const { KEYDOWN } = require('react-key-handler');

const Item = require('../item');
const Spinner = require('../ui/spinner');

class ItemList extends React.Component {
	handleKeyArrowDown() {
		let index = this.props.items.findIndex(item => item.key === this.props.selectedItemKey) + 1;
		if(this.props.items[index]) {
			this.props.onItemSelected(this.props.items[index].key);
		}
	}

	handleKeyArrowUp() {
		let index = this.props.items.findIndex(item => item.key === this.props.selectedItemKey) - 1;
		if(this.props.items[index]) {
			this.props.onItemSelected(this.props.items[index].key);
		}
	}

	render() {
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<div className="item-list-wrap">
					<KeyHandler 
						keyEventName={ KEYDOWN }
						keyValue="ArrowDown"
						onKeyHandle={ this.handleKeyArrowDown.bind(this) }
					/>
					<KeyHandler 
						keyEventName={ KEYDOWN }
						keyValue="ArrowUp"
						onKeyHandle={ this.handleKeyArrowUp.bind(this) }
					/>
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

module.exports = ItemList;
