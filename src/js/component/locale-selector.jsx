'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import localeData from '../../../data/locale-data.json';

class LocaleSelector extends React.PureComponent {
	render() {
		const { className, locale, onLocaleChange, id } = this.props;
		return (
			<div className={ cx('locale-selector', className ) }>
				<Select
					id={ id }
					clearable={ false }
					searchable={ false}
					value={ locale }
					tabIndex={ 0 }
					options={
						Object.entries(localeData)
							.map(([value, label]) => ({ value, label }))
					}
					onChange={ () => true /* commit on change */ }
					onCommit={ onLocaleChange }
				/>
			</div>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		id: PropTypes.string,
		locale: PropTypes.string,
		onLocaleChange: PropTypes.func
	}
}


export default LocaleSelector;
