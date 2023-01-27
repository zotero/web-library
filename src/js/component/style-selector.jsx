import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import { citationStylesCount } from '../../../data/citation-styles-data.json';

const StyleSelector = props => {
	const { className, citationStyle, citationStyles, onStyleChange, id, ...rest } = props;

	const options = useMemo(() => ([
		...citationStyles.map(cs => ({
			value: cs.name,
			label: cs.title
		})),
		{
			value: 'install',
			label: `${(Math.floor(citationStylesCount / 100) * 100).toLocaleString()}+ other styles available…`
		}
	]), [citationStyles]);

	return (
		<Select
			{ ...rest }
			id={ id }
			inputGroupClassName={ cx('style-selector', className ) }
			clearable={ false }
			searchable={ true }
			value={ citationStyle }
			tabIndex={ 0 }
			options={ options }
			onChange={ () => true /* commit on change */ }
			onCommit={ onStyleChange }
		/>
	);
}

StyleSelector.propTypes = {
	citationStyle: PropTypes.string,
	citationStyles: PropTypes.array,
	className: PropTypes.string,
	id: PropTypes.string,
	onStyleChange: PropTypes.func
}

export default memo(StyleSelector);
