import React from 'react';

const forumsUrl = 'https://forums.zotero.org/';
const oldWebLibraryUrl = 'https://www.zotero.org/mylibrary?usenewlibrary=0';

const CrashHandler = ({ error = {}, info = {} }) => (
	<div className="crash-handler">
		<h1>The Zotero web interface has encountered an error</h1>
		<p>
		Please try reloading this page. If the error persists, you can try temporarily using an <a href={ oldWebLibraryUrl }>older version</a> of the web viewer. Bugs should be reported on <a href={ forumsUrl }>Zotero Forums</a>; please mention <em>web library</em> in the title and include the details printed below.
		</p>
		<textarea
			onClick={ ev => ev.currentTarget.select() }
			rows={ 10 }
			cols={ 120 }
			value={ error.stack + "\n\n" + info.componentStack + "\n\n" + (navigator || {}).userAgent }
			readOnly={ true }
		/>
	</div>
);

export default CrashHandler;
