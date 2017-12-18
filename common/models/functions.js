'use strict';
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(functions) {
	//name: name of the category
	//dD: deep_digging flag
	//store_data flag to allow Writing back in db
	functions.crawl = function (name, max_number_pages, dD, store_data, cb) {
		let $ = '';
		//making a request to fetch the first page and crawl the number of pages
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
			//making a request to the second machine after calculating the numberPages
			//console.log("number of pages ",numberPages);
			if(max_number_pages == null){
				max_number_pages = numberPages;
			}
			return axios.post('https://yellow-scrape-m2.herokuapp.com/',{
				category: name,
				numberPages: (numberPages >= max_number_pages) ? max_number_pages : numberPages,
				allow_deep_digging: dD,
				store_data
			});
		}).then((response)=>{
			cb(null, response.data.results, response.data.time);
		}).catch((err)=>{
			cb(err);
		});
	};
};
