// @flow
'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:CanonicalSearchResult');
var React = require('react');
var ItemMaps = require('libzotero/lib/ItemMaps');


var CanonicalItem = React.createClass({
	getDefaultProps: function() {
		return {
			item:null
		};
	},
	getInitialState: function(){
		return {
			showDetails:false
		};
	},
	toggleDetails: function() {
		this.setState({showDetails:(!this.state.showDetails)});
	},
	render: function() {
		if(this.props.item == null){
			return null;
		}
		let item = this.props.item;
		let title = item.data.title;
		if(title == ''){
			title = '<untitled>';
		}
		let keys = Object.keys(item.data);
		let canonicalDataFields = [];
		canonicalDataFields = keys.map(function(key){
			let val = item.data[key];
			if(val === ''){
				return null;
			}
			if(key == 'creators') {
				if(!val){
					return null;
				}

				let creatorRows = val.map(function(k, i) {
					if(k.name){
						return (
							<tr key={'creator_' + i}>
								<th>{ItemMaps.creatorMap[k.creatorType]}</th>
								<td>{k.name}</td>
							</tr>
						);
					} else {
						return (
							<tr key={'creator_' + i}>
								<th>{ItemMaps.creatorMap[k.creatorType]}</th>
								<td>{k.lastName}, {k.firstName}</td>
							</tr>
						);
					}
				});
				return creatorRows;
			} else if(typeof val == 'string'){
				return (
					<tr key={key}>
						<th>{ItemMaps.fieldMap[key]}</th>
						<td>{val}</td>
					</tr>
				);
			}
			return null;
		});
		
		let datesAdded = item.meta.datesAdded.map(function(da){
			return (
				<li key={da.month}>
					{da.month} : {da.numAdded}
				</li>
			);
		});

		let instances = null;
		if(item.libraryItems) {
			//log.debug(`${item.libraryItems.length} public library item instances`);
			instances = item.libraryItems.map(function(instance){
				instance = instance.replace('api.zotero.org', 'apidev.zotero.org');
				return (
					<div key={instance}>
						<a href={instance}>{instance}</a>
					</div>
				);
			});
		}

		let detailsClass = 'search-result-body panel-body hidden';
		if(this.state.showDetails){
			detailsClass = 'search-result-body panel-body';
		}

		return (
			<div className="canonicalItem">
				<div className="panel panel-default">
					<div className="panel-heading" onClick={this.toggleDetails}>
						<h4 className="panel-title">
							<a role="button">
								{title}
							</a>
						</h4>
					</div>
					<div className={detailsClass}>
						<div className="canonicalMeta">
							<h3>Canonical Meta</h3>
							<table>
								<tbody>
									<tr>
										<th>Canonical ID</th>
										<td>{item.ID}</td>
									</tr>
									<tr>
										<th>Instances</th>
										<td>{item.meta.instanceCount}</td>
									</tr>
									<tr>
										<th>Libraries Count</th>
										<td>{item.meta.librariesCount}</td>
									</tr>
									<tr>
										<th>Dates Added</th>
										<td><ul>{datesAdded}</ul></td>
									</tr>
								</tbody>
							</table>
						</div>
						<div className="instances">
							{instances}
						</div>
						<div className="canonicalData">
							<h3>Canonical Data</h3>
							<table>
								<tbody>
									{canonicalDataFields}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = CanonicalItem;
