'use strict'

const React = require('react');
const cx = require('classnames');
const { bool, element, number, oneOfType, string } = require('prop-types')

class AutoResizer extends React.PureComponent {
	render() {
		const { vertical, children, content } = this.props;
		return (
			<div className={ cx('auto-resizer', { vertical, horizontal: !vertical }) } >
			<div className="content">{ content }</div>
				{ children }
			</div>
		)
	}

	static propTypes = {
		children: element.isRequired,
		content: oneOfType([string, number]),
		vertical: bool,
	}
}

module.exports = AutoResizer;
