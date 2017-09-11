'use strict';

class FakeStore {
	constructor() { this.clear(); }
	getItem(key) { return key in this.storage && this.storage[key] || null; }
	setItem(key, value) { this.storage[key] = value; }
	removeItem(key) { delete this.storage[key]; }
	clear() { this.storage = {}; }
	key(key) {
		const sortedKeys = Object.keys(this.storage).sort();
		return sortedKeys[key];
	}
	get length() {
		return Object.keys(this.storage).length;
	}
}

module.exports = FakeStore;