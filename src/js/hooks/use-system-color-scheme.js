import { useEffect, useState } from 'react';

const getDarkSchemeMQL = () => typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

const useSystemColorScheme = () => {
	const [isDark, setIsDark] = useState(() => getDarkSchemeMQL()?.matches ?? false);

	useEffect(() => {
		const mql = getDarkSchemeMQL();
		if (!mql) {
			return;
		}

		const handleChange = ev => setIsDark(ev.matches);
		// Safari < 14 only supports the deprecated addListener/removeListener
		if (mql.addEventListener) {
			mql.addEventListener('change', handleChange);
			return () => mql.removeEventListener('change', handleChange);
		}
		mql.addListener(handleChange);
		return () => mql.removeListener(handleChange);
	}, []);

	return isDark ? 'dark' : 'light';
}

export { useSystemColorScheme };
