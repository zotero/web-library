'use strict';


const isTriggerEvent = ev => ev.type === 'click' ||
	(ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));


const getFileData = ev => {
	return new Promise((resolve, reject) => {
		let fileName = ev.target.files[0].name;
		let mtime = ev.target.files[0].lastModified;
		let contentType = ev.target.files[0].type;
		let reader = new FileReader();
		reader.onerror = ev => {
			reject(ev);
		}
		reader.onload = ev => {
			let file = ev.target.result;
			let fileData = { file, fileName, mtime, contentType };
			resolve(fileData);
		};
		reader.readAsArrayBuffer(ev.target.files[0]);
	});
}

export {
	isTriggerEvent,
	getFileData
};
