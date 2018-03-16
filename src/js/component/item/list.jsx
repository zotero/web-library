'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const KeyHandler = require('react-key-handler').default;
const { KEYDOWN } = require('react-key-handler');

const Item = require('../item');
const Spinner = require('../ui/spinner');

const { without } = require('../../utils');

class ItemList extends React.Component {
	state = {
		isFocused: false
	}

	handleFocus() {
		this.setState({isFocused: true});
	}

	handleBlur() {
		this.setState({isFocused: false});
	}

	handleKeyArrowDown(ev) {
		const lastItemKey = this.props.selectedItemKeys[this.props.selectedItemKeys.length - 1];
		const index = this.props.items.findIndex(i => i.key === lastItemKey);

		if(index + 1 >= this.props.items.length) {
			return;
		}

		if(ev.getModifierState('Shift')) {
			if(this.props.selectedItemKeys.includes(this.props.items[index + 1].key)) {
				if(this.props.items.slice(0, index).some(
					i => this.props.selectedItemKeys.includes(i.key)
				)) {
					var offset = 1;
					while(index + offset !== this.props.items.length - 1 && 
						this.props.selectedItemKeys.includes(this.props.items[index + offset].key)
					) {
						offset++;
					}
					var consecutiveCounter = 1;
					while(this.props.selectedItemKeys.includes(this.props.items[index + offset - consecutiveCounter].key)) {
						consecutiveCounter++;
					}
					const consecutiveKeys = this.props.items.slice(index + offset - consecutiveCounter + 1, index + offset).map(i => i.key);
					this.props.onMultipleItemsSelect([
						...this.props.selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						this.props.items[index + offset].key
					]);
				} else {
					this.props.onMultipleItemsSelect(
						without(this.props.selectedItemKeys, this.props.items[index].key)
					);
				}
			} else {
				this.props.onMultipleItemsSelect([
					...this.props.selectedItemKeys,
					this.props.items[index + 1].key
				]);
			}
		} else {
			this.props.onItemSelect(this.props.items[index + 1].key);
		}
	}

	handleKeyArrowUp(ev) {
		const lastItemKey = this.props.selectedItemKeys[this.props.selectedItemKeys.length - 1];
		const index = this.props.items.findIndex(i => i.key === lastItemKey);

		if(index - 1 < 0) {
			return;
		}

		if(ev.getModifierState('Shift')) {
			if(this.props.selectedItemKeys.includes(this.props.items[index - 1].key)) {
				if(this.props.items.slice(index + 1).some(
					i => this.props.selectedItemKeys.includes(i.key)
				)) {
					var offset = 1;
					while(index - offset !== 0 && 
						this.props.selectedItemKeys.includes(this.props.items[index - offset].key)
					) {
						offset++;
					}
					var consecutiveCounter = 1;
					while(this.props.selectedItemKeys.includes(this.props.items[index - offset + consecutiveCounter].key)) {
						consecutiveCounter++;
					}
					const consecutiveKeys = this.props.items.slice(index - offset, index - offset + consecutiveCounter).reverse().map(i => i.key);
					this.props.onMultipleItemsSelect([
						...this.props.selectedItemKeys.filter(k => !consecutiveKeys.includes(k)),
						...consecutiveKeys,
						this.props.items[index - offset].key
					]);
				} else {
					this.props.onMultipleItemsSelect(
						without(this.props.selectedItemKeys, this.props.items[index].key)
					);
				}
			} else {
				this.props.onMultipleItemsSelect([
					...this.props.selectedItemKeys,
					this.props.items[index - 1].key
				]);
			}
		} else {
			this.props.onItemSelect(this.props.items[index - 1].key);
		}
	}

	handleItemSelect(item, ev) {
		if(ev.getModifierState('Shift')) {
			let startIndex = this.props.selectedItemKeys.length ? this.props.items.findIndex(i => i.key === this.props.selectedItemKeys[0]) : 0;
			let endIndex = this.props.items.findIndex(i => i.key === item.key);
			let isFlipped = false;
			if(startIndex > endIndex) {
				[startIndex, endIndex] = [endIndex, startIndex];
				isFlipped = true;
			}

			endIndex++;
			const keys = this.props.items.slice(startIndex, endIndex).map(i => i.key);
			if(isFlipped) {
				keys.reverse();
			}
			this.props.onMultipleItemsSelect(keys);
		} else if(ev.getModifierState('Control') || ev.getModifierState('Meta')) {
			this.props.onMultipleItemsSelect([...this.props.selectedItemKeys, item.key]);
		} else {
			this.props.onItemSelect(item.key);
		}

		ev.preventDefault();
	}

	get keyHandlers() {
		if(this.state.isFocused) {
			return (
				<React.Fragment>
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
				</React.Fragment>
			);
		} else {
			return null;
		}
	}

	render() {
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<div className="item-list-wrap">
					{ this.keyHandlers }
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
						<ul 
							className="item list"
							tabIndex={ 0 }
							onFocus={ this.handleFocus.bind(this) }
							onBlur={ this.handleBlur.bind(this) }
						>
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
