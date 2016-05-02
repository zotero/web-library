// @flow
'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:CanonicalSearchResult');
var React = require('react');
var ItemMaps = require('../../../library/libZoteroJS/src/ItemMaps.js');


var CanonicalItem = React.createClass({
	getDefaultProps: function() {
		return {
			item:null,
		};
	},
	render: function() {
		//console.log("CanonicalItem render");
		if(this.props.item == null){
			return null;
		}
		var item = this.props.item;
		var title = item.data.title;
		if(title == ''){
			title = '<untitled>';
		}
		var keys = Object.keys(item.data);
		var canonicalDataFields = [];
		canonicalDataFields = keys.map(function(key){
			//console.log("data key:" + key)
			var val = item.data[key];
			if(val === ''){
				return null;
			}
			//console.log(val);
			if(key == 'creators') {
				//console.log("creators");
				if(!val){
					console.log('falsy val, returning null');
					return null;
				}

				var creatorRows = val.map(function(k, i) {
					if(k.name){
						return (
							<tr key={'creator_' + i}>
								<th>{ItemMaps.creatorMap[k.creatorType]}</th>
								<td>{k.name}</td>
							</tr>
							/*
							<div key={"creator_" + i} className="creator">
								<span className="name">{k.name}</span>
							</div>
							*/
						);
					} else {
						return (
							<tr key={'creator_' + i}>
								<th>{ItemMaps.creatorMap[k.creatorType]}</th>
								<td>{k.lastName}, {k.firstName}</td>
							</tr>
							/*
							<div key={"creator_" + i} className="creator">
								<span className="lastName">{k.lastName}</span>
								<span className="firstName">{k.firstName}</span>
							</div>
							*/
						);
					}
				});
				//console.log(creatorRows);
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
		//console.log(canonicalDataFields);
		
		var datesAdded = item.meta.datesAdded.map(function(da){
			return (
				<li key={da.month}>
					{da.month} : {da.numAdded}
				</li>
			);
		});

		var instances = null;
		if(item.libraryItems) {
			instances = item.libraryItems.map(function(instance){
				return (
					<div key={instance}>
						<a href={instance}>{instance}</a>
						{/*
						<ul>
							<li>{instance.libraryItem}</li>
							<li>{instance.dateAdded}</li>
							<li>{instance.public}</li>
							<li>{instance.entityID}</li>
							<li>{instance.libraryID}</li>
							<li>{instance.key}</li>
						</ul>
						*/}
					</div>
				);
			});
		}

		return (
			<div className="canonicalItem">
				<h2>{title}</h2>
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
					{/*
					<span className="canonicalID">{item.canonicalID}</span>
					<span className="instanceCount">{item.meta.instanceCount}</span>
					<span className="librariesCount">{item.meta.librariesCount}</span>
					<div className="datesAdded">
					
					</div>
					*/}
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
		);
	}
});

module.exports = CanonicalItem;
