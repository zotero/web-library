'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import { citationStylesCount } from '../../../data/citation-styles-data.json';

class StyleSelector extends React.PureComponent {
	render() {
		const { className, citationStyle, citationStyles,
			onStyleChange, id } = this.props;
		return (
			<Select
				id={ id }
				inputGroupClassName={ cx('style-selector', className ) }
				clearable={ false }
				searchable={ true }
				value={ citationStyle }
				tabIndex={ 0 }
				options={ [
					...citationStyles.map(cs => ({
						value: cs.name,
						label: cs.title
					})),
					{
						value: 'install',
						label: `${(Math.floor(citationStylesCount / 100) * 100).toLocaleString()}+ other styles available…`
					}
				] }
				onChange={ () => true /* commit on change */ }
				onCommit={ onStyleChange }
			/>
		);
	}

	static propTypes = {
		citationStyle: PropTypes.string,
		citationStyles: PropTypes.array,
		className: PropTypes.string,
		id: PropTypes.string,
		onStyleChange: PropTypes.func
	}
}


export default StyleSelector;
