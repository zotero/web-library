'use strict';


const isTriggerEvent = ev => ev.type === 'click' ||
	(ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));



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
	isTriggerEvent,
	getFileData,
	getFilesData
};
