import { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import localeData from '../../../data/locale-data.json';

const LocaleSelector = props => {
	const { className, citationLocale, onLocaleChange, styleProperties, id, ...rest } = props;

	const defaultLocale = styleProperties?.defaultLocale;

	return (
		<Select
			{...rest}
			className="form-control"
			clearable={ false }
			isDisabled={ styleProperties === null || !!defaultLocale }
			id={ id }
			inputGroupClassName={ cx('locale-selector', className ) }
			onChange={ () => true /* commit on change */ }
			onCommit={ onLocaleChange }
			options={ localeData }
			searchable={ true }
			tabIndex={ 0 }
			value={defaultLocale ? defaultLocale : citationLocale }
		/>
	);
}

LocaleSelector.propTypes = {
	citationLocale: PropTypes.string,
	className: PropTypes.string,
	id: PropTypes.string,
	onLocaleChange: PropTypes.func,
	styleProperties: PropTypes.object,
}

export default memo(LocaleSelector);
