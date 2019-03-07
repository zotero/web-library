'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Select = require('./form/select');
const localeData = require('../../../data/locale-data.json');

class LocaleSelector extends React.PureComponent {
	render() {
		const { className, locale, onLocaleChange } = this.props;
		return (
			<div className={ cx('locale-selector', className ) }>
				<Select
					clearable={ false }
					searchable={ false}
					value={ locale }
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
		locale: PropTypes.string,
		onLocaleChange: PropTypes.func
	}
}


module.exports = LocaleSelector;
