'use strict';
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(functions) {
	functions.crawl = function (name, dD, cb) {
		let $ = '';
		axios.get('https://www.yellowpages.com.eg/en/category/' + name).then((response)=>{
			$ = cheerio.load(response.data, {
		        withDomLvl1: true,
		        normalizeWhitespace: false,
		        xmlMode: false,
		        decodeEntities: true
		    });
		    return($('.pagination.pull-right').find('a').attr('href'));
		}).then((text)=>{
			if(text == undefined){
				if($('.searchDetails.content-widget').length > 0){
					return 1;
				}else{
					throw new Error('category not found');
				}
			}else{
				let index = text.search(/\/[^\/]+$/g);
				if(index <= -1)return 1;
				return parseInt(text.substring(index + 2));
			};
		}).then((numberPages)=>{
			console.log("number of pages ",numberPages);
			return axios.post('https://yellow-scrape-m2.herokuapp.com/',{
				category: name,
				numberPages,
				allow_deep_digging: dD
			});
		}).then((response)=>{
			cb(null, response.data.results, response.data.time);
		}).catch((err)=>{
			cb(err);
		});
	};
};
