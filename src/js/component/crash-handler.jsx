import React from 'react';

const forumsUrl = 'https://forums.zotero.org/';
const oldWebLibraryUrl = 'https://www.zotero.org/mylibrary?usenewlibrary=0';

const CrashHandler = ({ error = {}, info = {} }) => (
	<div className="crash-handler">
		<h1>An error has occurred</h1>
		
		<p>Please try reloading this page. If the error persists, you can try temporarily using an <a href={ oldWebLibraryUrl }>older version</a> of the web library.</p>
		
		<p>If you encounter a persistent problem, please let us know in the <a href={ forumsUrl }>Zotero Forums</a>. Be sure to mention the <em>web library</em> in the thread title, and include the details below in your post.</p>
		
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
