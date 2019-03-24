'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils';
import Icon from '../../ui/icon';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import exportFormats from '../../../constants/export-formats';

class ExportActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown() {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleSelect(format) {
		this.props.onExport(format);
	}

	renderItemType(exportFormat) {
		return (
			<DropdownItem
				key={ exportFormat.key }
				onClick={ this.handleSelect.bind(this, exportFormat.key) }
			>
				{ exportFormat.label }
			</DropdownItem>
		);
	}

	render() {
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown.bind(this) }
				className="dropdown-wrapper new-item-selector"
			>
				<DropdownToggle
					color={ null }
					disabled={ this.props.itemKeys.length == 0 }
					className="btn-icon dropdown-toggle"
					title="Export"
				>
					<Icon type={ '16/export' } width="16" height="16" />
				</DropdownToggle>
				<DropdownMenu>
					{
						exportFormats.map(exportFormat => this.renderItemType(exportFormat))
					}
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		onExport: noop,
	}

	static propTypes = {
		onExport: PropTypes.func,
		itemKeys: PropTypes.array,
	}
}

export default ExportActions;
