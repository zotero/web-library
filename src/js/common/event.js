
const isTriggerEvent = ev => ev.type === 'click' ||
	(ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));

const isHighlightKeyDown = ev => {
	const isWindows = navigator.appVersion.indexOf("Win") >= 0;
	return (isWindows && ev.getModifierState('Control')) ||
		(!isWindows && ev.getModifierState('Alt'));
}

const getFilesData = fileObjs => Promise.all(fileObjs.map(getFileData));

const getFileData = fileObj => {
	return new Promise((resolve, reject) => {
		const { name: fileName, lastModified: mtime, type: contentType } = fileObj;
		let reader = new FileReader();
		reader.onerror = ev => {
			reject(ev);
		}
		reader.onload = ev => {
			let file = ev.target.result;
			let fileData = { file, fileName, mtime, contentType };
			resolve(fileData);
		};
		reader.readAsArrayBuffer(fileObj);
	});
}

export {
	isHighlightKeyDown,
	isTriggerEvent,
	getFileData,
	getFilesData
};
