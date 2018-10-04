'use strict';

const React = require('react');

class Tree extends React.PureComponent {
	render() {
		const { className, items, renderNode } = this.props;
		return (
			<div className={ className } >
				<ul className="nav" role="group">
					{ items.map(item => renderNode(item)) }
				</ul>
			</div>
		);
	}
}

module.exports = Tree;
