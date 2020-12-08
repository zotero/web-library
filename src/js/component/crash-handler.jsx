import React from 'react';

const CrashHandler = ({ error, info }) => (
	<div className="crash-handler">
		<h1>Web Library has encountered an error</h1>
		<p>
			Please try reloading this page.
			If the error persist, you can try <a href="https://www.zotero.org/mylibrary?usenewlibrary=0">legacy web library</a>.
			Bugs can be reported on <a href="https://forums.zotero.org/">Zotero Forums</a>.
			Please include details printed below.
		</p>
		<textarea
			onClick={ ev => ev.currentTarget.select() }
			rows={ 16 }
			cols={ 80 }
			value={ error.message + "\n\n" + error.stack + "\n\n" + info.componentStack }
			readOnly={ true }
		/>
	</div>
);

export default CrashHandler;
