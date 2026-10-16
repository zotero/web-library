import { Provider } from 'react-redux';
import { StaticContext } from 'web-common/components';

import ErrorBoundary from './error-boundry'
import Loader from './loader';
import UserTypeDetector from './user-type-detector';
import ViewPortDetector from './viewport-detector';
import Router from './router';

export const MainZotero = () => {
	return (
		<Router>
			<StaticContext.Provider value="/static/web-library">
				<UserTypeDetector />
				<ViewPortDetector />
				<Loader />
			</StaticContext.Provider>
		</Router>
	);
}

const Main = ({ store }) => {
	return (
		<ErrorBoundary>
			<Provider store={ store }>
				<MainZotero />
			</Provider>
		</ErrorBoundary>
	);
}

export default Main;

