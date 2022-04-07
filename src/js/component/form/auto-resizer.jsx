'use strict'

import React from 'react';
import cx from 'classnames';
import { bool, element, number, oneOfType, string } from 'prop-types';

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

export default AutoResizer;
