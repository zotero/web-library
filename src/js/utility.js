'use strict';

export function routeMatches(routes, routeName) {
	let route = routes[routes.length-1];
	if('name' in route && route.name === routeName) {
		return true;
	}

	return false;
}