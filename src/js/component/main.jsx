import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { StaticContext } from 'web-common/components';
import PropTypes from 'prop-types';

import { routes, redirects } from '../routes';
import ErrorBoundary from './error-boundry'
import Loader from './loader';
import UserTypeDetector from './user-type-detector';
import ViewPortDetector from './viewport-detector';


export const MainEmbedded = () => {
	return (
		<StaticContext.Provider value="/static/web-library">
			<UserTypeDetector />
			<ViewPortDetector />
			<Loader />
		</StaticContext.Provider>
    );
}

export const MainZotero = () => (
	<StaticContext.Provider value="/static/web-library">
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
	</StaticContext.Provider>
);

const Main = ({ store, history }) => {
	const isEmbedded = store.getState().config.isEmbedded;
	return (
		<ErrorBoundary>
			<Provider store={ store }>
				{isEmbedded ?
					<MainEmbedded /> :
					(
					<ConnectedRouter history={history}>
						<MainZotero />
					</ConnectedRouter>
				)}
			</Provider>
		</ErrorBoundary>
	);
}

Main.propTypes = {
	store: PropTypes.object.isRequired,
}

export default Main;

