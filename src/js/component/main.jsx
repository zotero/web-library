import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import ErrorBoundary from './error-boundry'
import Loader from './loader';
import UserTypeDetector from './user-type-detector';
import ViewPortDetector from './viewport-detector';
import { routes, redirects } from '../routes';
import { history } from '../store';


export const MainEmbedded = () => {
	return (
		<React.Fragment>
			<UserTypeDetector />
			<ViewPortDetector />
			<Loader />
		</React.Fragment>
	)
}

export const MainZotero = () => (
	<ConnectedRouter history={history}>
		<BrowserRouter>
			<Switch>
				{redirects.map(redirect =>
					<Redirect exact key={redirect.from} from={redirect.from} to={redirect.to} />
				)}
				{routes.map(route =>
					<Route key={route} path={route} component={MainEmbedded} exact />
				)}
				<Redirect from="/*" to="/" />
			</Switch>
		</BrowserRouter>
	</ConnectedRouter>
);

const Main = ({ store }) => {
	const isEmbedded = store.getState().config.isEmbedded;
	return (
		<ErrorBoundary>
			<Provider store={ store }>
				{ isEmbedded ? <MainEmbedded /> : <MainZotero /> }
			</Provider>
		</ErrorBoundary>
	);
}

Main.propTypes = {
	store: PropTypes.object.isRequired,
}

export default Main;

