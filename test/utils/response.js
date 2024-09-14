function makeSuccessResponse(keys, dataObjects, version, patch) {
	const objects = keys.map(key => dataObjects[key]);
  return {
	failed: {},
	unchanged: {},
	success: Object.fromEntries(objects.map((o, i) => [`${i}`, o.key])),
	successful: Object.fromEntries(objects.map((o, i) => [`${i}`, { key: o.key, version, data: { ...o, ...patch } }])),
  };
}

export { makeSuccessResponse };
