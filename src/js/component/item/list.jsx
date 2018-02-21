'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const KeyHandler = require('react-key-handler').default;
const { KEYDOWN } = require('react-key-handler');

const Item = require('../item');
const Spinner = require('../ui/spinner');

class ItemList extends React.Component {
	handleKeyArrowDown() {
		var selectedItemKey;
		if(this.props.selectedItemKeys.length) {
			selectedItemKey = this.props.selectedItemKeys[this.props.selectedItemKeys.length - 1];
		}
		let index = this.props.items.findIndex(item => item.key === selectedItemKey) + 1;
		if(this.props.items[index]) {
			this.props.onItemSelect(this.props.items[index].key);
		}
	}

	handleKeyArrowUp() {
		var selectedItemKey;
		if(this.props.selectedItemKeys.length) {
			selectedItemKey = this.props.selectedItemKeys[0];
		}
		let index = this.props.items.findIndex(item => item.key === selectedItemKey) - 1;
		if(this.props.items[index]) {
			this.props.onItemSelect(this.props.items[index].key);
		}
	}

	handleItemSelect(item, ev) {
		if(ev.getModifierState('Shift')) {
			let startIndex = this.props.selectedItemKeys.length ? this.props.items.findIndex(i => i.key === this.props.selectedItemKeys[0]) : 0;
			let endIndex = this.props.items.findIndex(i => i.key === item.key);
			if(startIndex > endIndex) {
				[startIndex, endIndex] = [endIndex, startIndex];
			}

			endIndex++;
			const keys = this.props.items.slice(startIndex, endIndex).map(i => i.key);
			this.props.onMultipleItemsSelect(keys);
		} else if(ev.getModifierState('Control') || ev.getModifierState('OS')) {
			//@TODO: should be os-dependent: ctrl on win/lin and OS on macOS
			
		} else {
			this.props.onItemSelect(item.key);
		}

		ev.preventDefault();
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
									onClick={ this.handleItemSelect.bind(this, item) }
									active= { this.props.selectedItemKeys.includes(item.key) }
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
	selectedItemKeys: PropTypes.array,
	isFetching: PropTypes.bool,
	onItemSelect: PropTypes.func
};

ItemList.defaultProps = {
	isFetching: false,
	selectedItemKeys: []
};

module.exports = ItemList;
