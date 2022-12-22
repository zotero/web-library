import PropTypes from 'prop-types';
import React, { memo } from 'react';
import cx from 'classnames';

import { pick } from '../../common/immutable';

const MobileMenuEntry = ({ className, label, ...rest }) => {
	return (
		<li className="nav-item">
			<a
				className={ cx(className, 'nav-link') }
				{ ...pick(rest, ['href', 'onKeyDown']) }
				tabIndex={ -2 }
			>
				{ label }
			</a>
		</li>
	);
}

MobileMenuEntry.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string,
}

export default memo(MobileMenuEntry);
