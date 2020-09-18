const FakeStore = require('../helper/fake-store.js');
if(typeof window === 'undefined') {
	global.window = { localStorage: new FakeStore() };
}
