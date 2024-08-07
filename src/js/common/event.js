const isHighlightKeyDown = ev => {
	const isWindows = navigator.userAgent.indexOf("Windows") >= 0;
	return (isWindows && ev.getModifierState('Control')) ||
		(!isWindows && ev.getModifierState('Alt'));
}

const isDelKeyDown = ev => {
	const isMac = navigator.platform.startsWith('Mac');
	return ev.key === 'Delete' || (isMac && ev.key === 'Backspace');
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
	isDelKeyDown,
	isHighlightKeyDown,
	getFileData,
	getFilesData
};
