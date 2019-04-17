'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import localeData from '../../../data/locale-data.json';

class LocaleSelector extends React.PureComponent {
	render() {
		const { className, citationLocale, onLocaleChange, id } = this.props;
		return (
			<Select
				id={ id }
				inputGroupClassName={ cx('locale-selector', className ) }
				clearable={ false }
				searchable={ true }
				value={ citationLocale }
				tabIndex={ 0 }
				options={ localeData }
				onChange={ () => true /* commit on change */ }
				onCommit={ onLocaleChange }
			/>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		id: PropTypes.string,
		citationLocale: PropTypes.string,
		onLocaleChange: PropTypes.func
	}
}


export default LocaleSelector;
