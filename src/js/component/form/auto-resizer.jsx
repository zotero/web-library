import React from 'react';
import cx from 'classnames';

import { bool, element, number, oneOfType, string } from 'prop-types';

const AutoResizer = props => {
	const { vertical, children, content } = props;
	return (
		<div className={ cx('auto-resizer', { vertical, horizontal: !vertical }) } >
			<div className="content">{ content }</div>
			{ children }
		</div>
	)
}

AutoResizer.propTypes = {
	children: element.isRequired,
	content: oneOfType([string, number]),
	vertical: bool,
}

export default AutoResizer;
