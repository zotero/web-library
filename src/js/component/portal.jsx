import { createContext, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'web-common/utils';

export const PortalContext = createContext({});

const Portal = memo(({ onClose = noop, children }) => {
	const ref = useRef(null);

	const handleClick = useCallback(ev => {
		if (ev.target === ref.current) {
			onClose();
		}
	}, [onClose]);

	return (
		<PortalContext.Provider value={{ ref }}>
			<div
				ref={ref}
				className="portal"
				onClick={handleClick}
			>
				{children}
			</div>
		</PortalContext.Provider>
	);
});

Portal.displayName = 'Portal';

Portal.propTypes = {
	onClose: PropTypes.func,
	children: PropTypes.node.isRequired,
};

export default Portal;
