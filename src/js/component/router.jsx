import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { redirects, routes, makeRedirectedPath } from '../routes';
import { useForceUpdate } from 'web-common/hooks';
import { LOCATION_CHANGE } from '../constants/actions';

const Router = (props) => {
	const { children } = props;
	const dispatch = useDispatch();
	const forceUpdate = useForceUpdate();
	const isFirstRender = useRef(true);

	const handlePopState = useCallback((ev) => {
		// Handle pop state event
		console.log('popstate', ev, window.location.href);
	}, []);

	useEffect(() => {
		for (const redirect of redirects) {
			const match = redirect.fn(window.location.pathname);
			if(match) {
				const toPath = makeRedirectedPath(redirect, match);
				console.log(`Redirecting from ${window.location.pathname} to ${toPath}`);
				history.replaceState({}, '', toPath);
				break;
			}
		}

		const isRouteMatched = routes.some(route => !!route(window.location.pathname));
		if(!isRouteMatched) {
			console.log('Invalid URL, redirecting to /libraries');
			history.replaceState({}, '', '/libraries');
		}

		if(isFirstRender.current) {
			dispatch({
				type: LOCATION_CHANGE,
				payload: {
					location: {
						pathname: window.location.pathname,
						search: window.location.search,
						hash: window.location.hash,
					},
					action: 'POP',
					isFirstRendering: isFirstRender.current,
				}
			});
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
