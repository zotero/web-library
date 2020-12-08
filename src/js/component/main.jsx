import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import Loader from './loader';
import { routes, redirects } from '../routes';
import ViewPortDetector from './viewport-detector';
import UserTypeDetector from './user-type-detector';
import CrashHandler from './crash-handler';

class ErrorBoundary extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	componentDidCatch(error, info) {
		this.setState({ hasError: true, error, info });
	}

	render() {
		return this.state.hasError ?
			<CrashHandler error={ this.state.error } info={ this.state.info } /> :
			this.props.children;
	}
}

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
		<ErrorBoundary>
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
		</ErrorBoundary>
	);
}

Main.propTypes = {
	history: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired,
}

export default Main;
