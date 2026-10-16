import { PureComponent } from 'react';
import { forumsUrl } from '../constants/defaults';

const CrashHandler = ({ error = {}, info = {} }) => (
	<div className="crash-handler">
		<h1>An error has occurred</h1>

		<p>Please try reloading this page.</p>

		<p>If you encounter a persistent problem, please let us know in the <a href={ forumsUrl }>Zotero Forums</a>. Be sure to mention the <em>web library</em> in the thread title, and include the details below in your post.</p>

		<textarea
			onClick={ ev => ev.currentTarget.select() }
			rows={ 10 }
			cols={ 120 }
			value={ '<code>' + '\n' + error.stack + '\n\n' + info.componentStack + '\n\n' + (navigator || {}).userAgent + '\n' + '</code>' }
			readOnly={ true }
		/>
	</div>
);

class ErrorBoundary extends PureComponent {
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

export default ErrorBoundary;
