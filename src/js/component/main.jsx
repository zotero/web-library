import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import Loader from './loader';
import { routes, redirects } from '../routes';
import ViewPortDetector from './viewport-detector';
import UserTypeDetector from './user-type-detector';

const Wrapper = () => {
	return (
		<React.Fragment>
			<UserTypeDetector />
			<ViewPortDetector />
			<Loader />
		</React.Fragment>
	)
}

const Main = ({ store, history }) => {
	return (
		<Provider store={ store }>
			<ConnectedRouter history={ history }>
				<BrowserRouter>
					<Switch>
						{ redirects.map(redirect =>
							<Redirect exact key={ redirect.from } from={ redirect.from } to={ redirect.to } />
						)}
						{ routes.map(route =>
							<Route key={ route } path={ route } component={ Wrapper } exact />
						)}
						<Redirect from="/*" to="/" />
					</Switch>
				</BrowserRouter>
			</ConnectedRouter>
		</Provider>
	);
}

Main.propTypes = {
	history: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired,
}

export default Main;
