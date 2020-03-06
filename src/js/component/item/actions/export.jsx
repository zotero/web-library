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

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
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
			>
				<DropdownToggle
					className="btn-icon dropdown-toggle"
					color={ null }
					disabled={ this.props.itemKeys.length === 0 || this.props.itemKeys.length > 100 }
					onKeyDown={ this.handleKeyDown }
					tabIndex={ this.props.tabIndex }
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
		onFocusNext: noop,
		onFocusPrev: noop,
	}

	static propTypes = {
		itemKeys: PropTypes.array,
		onExport: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		tabIndex: PropTypes.number,
	}
}

export default ExportActions;
