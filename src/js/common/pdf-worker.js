import { annotationItemFromJSON } from './annotations.js';

export class PDFWorker {
	constructor(config) {
		this.config = config;
		this._worker = null;
		this._lastPromiseID = 0;
		this._waitingPromises = {};
		this._queue = [];
		this._processingQueue = false;
	}

	async _processQueue() {
		this._init();
		if (this._processingQueue) {
			return;
		}
		this._processingQueue = true;
		let item;
		while ((item = this._queue.shift())) {
			if (item) {
				let [fn, resolve, reject] = item;
				try {
					resolve(await fn());
				}
				catch (e) {
					reject(e);
				}
			}
		}
		this._processingQueue = false;
	}

	async _enqueue(fn, isPriority) {
		return new Promise((resolve, reject) => {
			if (isPriority) {
				this._queue.unshift([fn, resolve, reject]);
			}
			else {
				this._queue.push([fn, resolve, reject]);
			}
			this._processQueue();
		});
	}

	async _query(action, data, transfer) {
		return new Promise((resolve, reject) => {
			this._lastPromiseID++;
			this._waitingPromises[this._lastPromiseID] = { resolve, reject };
			this._worker.postMessage({ id: this._lastPromiseID, action, data }, transfer);
		});
	}

	_init() {
		if (this._worker) return;
		this._worker = new Worker(this.config.pdfWorkerURL);
		this._worker.addEventListener('message', async (event) => {
			let message = event.data;
			if (message.responseID) {
				let { resolve, reject } = this._waitingPromises[message.responseID];
				delete this._waitingPromises[message.responseID];
				if (message.data) {
					resolve(message.data);
				}
				else {
					reject(new Error(JSON.stringify(message.error)));
				}
				return;
			}
			if (message.id) {
				let respData = null;
				try {
					if (message.action === 'FetchBuiltInCMap') {
						const response = await fetch(this.config.pdfReaderCMapsURL + message.data + '.bcmap');
						const arrayBuffer = await response.arrayBuffer();
						respData = {
							isCompressed: true,
							cMapData: new Uint8Array(arrayBuffer)
						};
					}
				}
				catch (e) {
					console.log('Failed to fetch CMap data:');
					console.log(e);
				}

				try {
					if (message.action === 'FetchStandardFontData') {
						const response = await fetch(this.config.pdfReaderStandardFontsURL + message.data);
						const arrayBuffer = await response.arrayBuffer();
						respData = new Uint8Array(arrayBuffer);
					}
				}
				catch (e) {
					console.log('Failed to fetch standard font data:');
					console.log(e);
				}

				this._worker.postMessage({ responseID: event.data.id, data: respData });
			}
		});
		this._worker.addEventListener('error', (event) => {
			console.log(`PDF Web Worker error (${event.filename}:${event.lineno}): ${event.message}`);
		});
	}

	/**
	 * Export PDF file with annotations
	 *
	 * @param {ArrayBuffer} buf
	 * @param {Zotero.Item[]} items
	 * @param {Boolean} [isPriority]
	 * @returns {Promise<Uint8Array>} PDF buffer
	 */
	async export(buf, items, isPriority) {
		return this._enqueue(async () => {
			items = items.filter(x => !x.annotationIsExternal);
			let annotations = [];
			for (let item of items) {
				annotations.push({
					id: item.key,
					type: item.annotationType,
					// Author name is only set when the PDF file is 1) in a group library,
					// 2) was moved back to a private library or 3) was imported from a PDF file
					// that was previously exported in 1) or 2) case
					authorName: item.annotationAuthorName || '', // TODO: || Zotero.Users.getName(item.createdByUserID) || '',
					comment: (item.annotationComment || '').replace(/<\/?(i|b|sub|sup)>/g, ''),
					color: item.annotationColor,
					position: JSON.parse(item.annotationPosition),
					dateModified: item.dateModified,
					tags: item.tags.map(x => x.tag)
				});
			}
			try {
				var res = await this._query('export', { buf, annotations }, [buf]);
			}
			catch (e) {
				let error = new Error(`Worker 'export' failed: ${JSON.stringify({
					annotations,
					error: e.message
				})}`);
				try {
					error.name = JSON.parse(e.message).name;
				}
				catch (e) {
					console.log(e);
				}
				console.log(error);
				throw error;
			}
			return res.buf;
		}, isPriority);
	}

	/**
	 * Import annotations from PDF file
	 *
	 * @param {ArrayBuffer} buf PDF file
	 * @param {Boolean} [isPriority]
	 * @returns {Promise<Boolean>} Whether any annotations were imported/deleted
	 */
	async import(buf, isPriority) {
		return this._enqueue(async () => {
			try {
				var { imported } = await this._query('import', { buf, existingAnnotations: [] }, [buf]);
			}
			catch (e) {
				let error = new Error(`Worker 'import' failed: ${JSON.stringify({ error: e.message })}`);
				try {
					error.name = JSON.parse(e.message).name;
				}
				catch (e) {
					console.log(e);
				}
				console.log(error);
				throw error;
			}
			let annotations = [];
			for (let annotation of imported) {
				annotation.id = Math.round(Math.random() * 4294967295).toString().slice(0, 8);
				annotation.isExternal = true;
				annotations.push(annotationItemFromJSON(annotation));
			}
			return annotations;
		}, isPriority);
	}

	/**
	 * Rotate pages in PDF attachment
	 *
	 * @param {ArrayBuffer} buf
	 * @param {Array} pageIndexes
	 * @param {Integer} degrees 90, 180, 270
	 * @param {Boolean} [isPriority]
	 * @param {String} [password]
	 * @returns {Promise}
	 */
	async rotatePages(buf, pageIndexes, degrees, isPriority, password) {
		return this._enqueue(async () => {
			try {
				var { buf: modifiedBuf } = await this._query('rotatePages', {
					buf, pageIndexes, degrees, password
				}, [buf]);
			}
			catch (e) {
				let error = new Error(`Worker 'rotatePages' failed: ${JSON.stringify({ error: e.message })}`);
				try {
					error.name = JSON.parse(e.message).name;
				}
				catch {
					// ignore
				}
				throw error;
			}

			return modifiedBuf;
		}, isPriority);
	}

	/**
	 * Get data for recognizer-server
	 *
	 * @param {ArrayBuffer} buf PDF file
	 * @param {Boolean} [isPriority]
	 * @param {String} [password]
	 * @returns {Promise}
	 */
	async getRecognizerData(buf, isPriority, password) {
		return this._enqueue(async () => {
			try {
				var result = await this._query('getRecognizerData', { buf, password }, [buf]);
			}
			catch (e) {
				let error = new Error(`Worker 'getRecognizerData' failed: ${JSON.stringify({ error: e.message })}`);
				try {
					error.name = JSON.parse(e.message).name;
				}
				catch (e) {
					console.log(e);
				}
				console.log(error);
				throw error;
			}
			return result;
		}, isPriority);
	}
}
