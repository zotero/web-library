import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import localeData from '../../../data/locale-data.json';

const LocaleSelector = props => {
	const { className, citationLocale, onLocaleChange, id } = props;

	return (
		<Select
			clearable={ false }
			id={ id }
			inputGroupClassName={ cx('locale-selector', className ) }
			onChange={ () => true /* commit on change */ }
			onCommit={ onLocaleChange }
			options={ localeData }
			searchable={ true }
			tabIndex={ 0 }
			value={ citationLocale }
		/>
	);
}

LocaleSelector.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string,
	citationLocale: PropTypes.string,
	onLocaleChange: PropTypes.func
}

export default memo(LocaleSelector);
