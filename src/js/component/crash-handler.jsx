import React from 'react';

const forumsUrl = 'https://forums.zotero.org/';
const oldWebLibraryUrl = 'https://www.zotero.org/mylibrary?usenewlibrary=0';

const CrashHandler = ({ error = {}, info = {} }) => (
	<div className="crash-handler">
		<h1>Web Library has encountered an error</h1>
		<p>
		Please try reloading this page. If the error persist, you can try using a <a href={ oldWebLibraryUrl }>legacy version</a> of Web Library. Bugs can be reported on <a href={ forumsUrl }>Zotero Forums</a>, please mention <em>Web Library</em> in the title and include details printed below.
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
