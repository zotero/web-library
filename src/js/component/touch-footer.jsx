'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class TouchFooter extends React.PureComponent {
	render() {
		return (
			<footer className="touch-footer">
				<Toolbar>
					<div className="toolbar-justified">
						<ToolGroup>
							<Button>
								<Icon type={ '32/add-to-collection' } width="32" height="32" />
							</Button>
							<Button>
								<Icon type={ '24/trash' } width="24" height="24" />
							</Button>
							<Button>
								<Icon type={ '24/duplicate' } width="24" height="24" />
							</Button>
							<Button>
								<Icon type={ '24/export' } width="24" height="24" />
							</Button>
							<Button>
								<Icon type={ '24/bibliography' } width="24" height="24" />
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
			</footer>
		)
	}
}

module.exports = TouchFooter;
