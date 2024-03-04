export default async function globalTeardown() {
	return new Promise(resolve => global.bsLocal.stop(resolve));
}
