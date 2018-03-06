'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

class BoxEntry extends React.PureComponent {
	render() {
		const [label, value] = React.Children.toArray(this.props.children);
		return (
			<li
				className={ cx('metadata', this.props.classNames) }
			>
				<div className='key'>
					<label>
						{ label }
					</label>
				</div>
				<div className='value'>
					{ value }
				</div>
			</li>
		);
	}

	static propTypes = {
		children: PropTypes.array.isRequired,
	};
}

module.exports = BoxEntry;