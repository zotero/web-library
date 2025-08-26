const getItemFromIdentifier = async (identifier, translateUrl) => {
	const url = `${translateUrl}/search`;
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers: { 'Content-Type': 'text/plain', },
		body: identifier
	});
	if (response.ok) {
		const translatorResponse = await response.json();
		return translatorResponse?.[0]
	} else {
		throw new Error('Failed to get item from identifier');
	}
}

export { getItemFromIdentifier };
