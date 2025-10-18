import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { routeRegexp, redirectRegexes } from '../routes';
import { useForceUpdate } from 'web-common/hooks';
import { locationChange } from '../actions';

const Router = (props) => {
	const { children } = props;
	const defaultLibraryKey = useSelector(state => state.config.defaultLibraryKey);
	const libraries = useSelector(state => state.config.libraries);
	const dispatch = useDispatch();
	const forceUpdate = useForceUpdate();
	const isFirstRender = useRef(true);

	const handlePopState = useCallback(() => {
		dispatch(locationChange(window.location.pathname));
	}, [dispatch]);

	useEffect(() => {
		for (const redirectRegex of redirectRegexes) {
			const { pattern, replace } = redirectRegex;
			const match = pattern.exec(window.location.pathname);
			if(match) {
				const toPath = window.location.pathname.replace(pattern, replace);
				history.replaceState({}, '', toPath);
				console.log('Redirecting from', window.location.pathname, 'to', toPath);
				break;
			}
		}

		if (!routeRegexp.test(window.location.pathname)) {
			let newPath;
			if (defaultLibraryKey.startsWith('g')) {
				const groupLibrary = libraries.find(lib => lib.key === defaultLibraryKey);
				const groupSlug = groupLibrary?.slug ?? '';
				newPath = `/groups/${defaultLibraryKey.slice(1)}/${groupSlug}/library`;

			} else {
				const userSlug = libraries.find(lib => lib.key === defaultLibraryKey)?.slug;
				newPath = `/${userSlug}/library`;
			}
			console.log('No route matched, redirecting to default library:', newPath);
			history.replaceState({}, '', newPath);
			return;
		}

		if (isFirstRender.current) {
			dispatch(locationChange(window.location.pathname, { isFirstRendering: true }));
			isFirstRender.current = false;
			forceUpdate();
		}

		window.addEventListener("popstate", handlePopState);
		return () => {
			window.removeEventListener("popstate", handlePopState);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	if(isFirstRender.current) {
		// Don't render children until after first LOCATION_CHANGE has been dispatched
		return null;
	}
	return <>{children}</>;
}

Router.propTypes = {
	children: PropTypes.node,
};


export default Router;
