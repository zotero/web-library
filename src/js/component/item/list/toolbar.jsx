'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Icon = require('../../ui/icon');
const Button = require('../../ui/button');
const Spinner = require('../../ui/spinner');
const { Toolbar, ToolGroup } = require('../../ui/toolbars');
const ColumnSelector = require('./column-selector');

class ItemListToolbar extends React.PureComponent {
	state = { columns: [] }

	static getDerivedStateFromProps({ preferences: { columns } }) {
		return { columns };
	}

	render() {
		const { isDeleting, selectedItemKeys, onDelete } = this.props;

		return (
			<header className="hidden-sm-down">
				<h3 className="hidden-mouse-md-up">Collection title</h3>
				<Toolbar className="hidden-touch hidden-sm-down">
					<div className="toolbar-left">
						<ToolGroup>
							<Button>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
							<Button
								onClick={ onDelete }
								disabled={ isDeleting || selectedItemKeys.length === 0 }
							>
								{
									isDeleting ?
									<Spinner /> :
									<Icon type={ '16/trash' } width="16" height="16" />
								}
							</Button>
							<Button>
								<Icon type={ '16/cog' } width="16" height="16" />
							</Button>
						</ToolGroup>
					</div>
					<div className="toolbar-right">
						<ColumnSelector { ...this.props } { ...this.state } />
					</div>
				</Toolbar>
			</header>
		);
	}
}

module.exports = ItemListToolbar;
