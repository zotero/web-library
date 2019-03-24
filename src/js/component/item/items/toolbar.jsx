'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar } from '../../ui/toolbars';
import ColumnSelector from './column-selector';
import ItemsActionsContainer from '../../../container/items-actions';

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

export default ItemsTableToolbar;
