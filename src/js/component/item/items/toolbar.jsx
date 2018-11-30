'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { Toolbar } = require('../../ui/toolbars');
const ColumnSelector = require('./column-selector');
const ItemsActionsContainer = require('../../../container/items-actions');

class ItemsTableToolbar extends React.PureComponent {
	state = { columns: [] }

	static getDerivedStateFromProps({ preferences: { columns } }) {
		return { columns };
	}

	render() {
		return (
			<header className="hidden-sm-down">
				<Toolbar className="hidden-touch hidden-sm-down">
					<div className="toolbar-left">
						<ItemsActionsContainer />
					</div>
					<div className="toolbar-right">
						<ColumnSelector { ...this.props } { ...this.state } />
					</div>
				</Toolbar>
			</header>
		);
	}

	static propTypes = {

	}

	static defaultProps = {

	}
}

module.exports = ItemsTableToolbar;
