import { memo, useCallback, useId } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { BIBLIOGRAPHY, STYLE_INSTALLER } from '../constants/modals';
import LocaleSelector from './locale-selector';
import StyleSelector from './style-selector';
import { toggleModal, fetchCSLStyle, preferenceChange } from '../actions';
import { coreCitationStyles } from '../../../data/citation-styles-data.json';


const CitationOptions = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const styleSelectorId = useId();
	const localeSelectorId = useId();
	const styleProperties = useSelector(state => state.cite.styleProperties);
	const citationStyle = useSelector(state => state.preferences.citationStyle);
	const citationLocale = useSelector(state => state.preferences.citationLocale);
	const installedCitationStyles = useSelector(state => state.preferences.installedCitationStyles, shallowEqual);
	const citationStyles = [...coreCitationStyles, ...installedCitationStyles];

	const handleStyleChange = useCallback(async citationStyle => {
		if (citationStyle === 'install') {
			dispatch(toggleModal(BIBLIOGRAPHY, false));
			dispatch(toggleModal(STYLE_INSTALLER, true));
		} else {
			dispatch(preferenceChange('citationStyle', citationStyle));
			dispatch(fetchCSLStyle(citationStyle));
		}
	}, [dispatch]);

	const handleLocaleChange = useCallback(locale => {
		dispatch(preferenceChange('citationLocale', locale));
	}, [dispatch]);

	return (
		<div className="citation-options">
			<div className="form-row">
				<div className="col-7">
					<div className="form-group form-row style-selector-container">
						<label
							id={`${styleSelectorId.current}-label`}
							htmlFor={isTouchOrSmall ? styleSelectorId.current : null}
							className="col-form-label"
						>
							Citation Style
						</label>
						<div className="col">
							<StyleSelector
								aria-labelledby={isTouchOrSmall ? null : `${styleSelectorId.current}-label`}
								id={styleSelectorId.current}
								onStyleChange={handleStyleChange}
								citationStyle={citationStyle}
								citationStyles={citationStyles}
							/>
						</div>
					</div>
				</div>
				<div className="col-5">
					<div className="form-group form-row locale-selector-container">
						<label
							id={`${localeSelectorId.current}-label`}
							htmlFor={isTouchOrSmall ? localeSelectorId.current : null}
							className="col-form-label"
						>
							Language
						</label>
						<div className="col">
							<LocaleSelector
								aria-labelledby={isTouchOrSmall ? null : `${localeSelectorId.current}-label`}
								id={localeSelectorId.current}
								onLocaleChange={handleLocaleChange}
								citationLocale={citationLocale}
								styleProperties={styleProperties}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(CitationOptions);
