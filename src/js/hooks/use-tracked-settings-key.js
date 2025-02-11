import api from 'zotero-api-client';

import { useSelector } from 'react-redux';

// Normally components don't need to track version number of the setting (to avoid re-renders when
// the version changes) and updates are dispatched asynchonously (and might be queued, e.g., to
// avoid out-of-order updates). However, to support updating the value on tab/window close, we need
// a synchroneus version with keepalive fetch call. This hook tracks version of the setting and
// provides a method to update the setting synchronously, but using this hook might cause re-renders.
export const useTrackedSettingsKey = (settingsKey, libraryKey) => {
	const config = useSelector(state => state.config);
	const value = useSelector(state => state.libraries[libraryKey]?.settings?.entries?.[settingsKey]?.value ?? null);
	const version = useSelector(state => state.libraries[libraryKey]?.settings?.entries?.[settingsKey]?.version ?? null);

	const update = (newValue) => {
		if(newValue !== value) {
			api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.version(version)
				.settings(settingsKey)
				.put({ value: newValue }, { keepalive: true });
		}
	}

	return { value, update };
};
