import { memo, useMemo } from 'react';
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
			className="form-control"
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

export default memo(StyleSelector);
