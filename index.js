'use strict'
var request = require('request');
var json = require('json-serialize');
var config = require('./config');
var lib = require('./libApi')();

var token = config.token;
var tg = require('telegram-node-bot')(token);

tg.router.
    when(['/start'], 'StartController').
    when(['/menu'], 'MenuController').
    when(['/restart'], 'StartController').
    when(['/help'], 'StartController').
    when(['/search :text'], 'SearchController').
    when(['/search :text :page'], 'SearchController').
    when(['/category :category' ], 'SearchController').
    when(['/employers' ], 'SearchController').
    when(['/applicants' ], 'SearchController').
    when(['/general' ], 'SearchController').
    when(['/support' ], 'MenuController').
     when(['/test'], 'MenuController').
    when(['/page :page'], 'SearchController').
   	when(['/search'], 'SearchController').
    otherwise('OtherwiseController');

//--------------------------OtherwiseController-----------------------// 
tg.controller('OtherwiseController', ($) => {   
	if(lib.UserInfo[$.user.id]){
		delete lib.UserInfo[$.user.id];
	}

 	$.sendMessage("Бот вас не понял, воспользуйтесь командами или пунктами меню");
 	$.routeTo("/menu");
}) 
//--------------------------------------------------------------------//

tg.callbackQueries(($) => {
var data = JSON.parse($.data);
	if(data.page){
		if(lib.UserInfo[$.from.id]){	
   		var page = data.page;
   		//console.log($);
    	//console.log(lib.UserInfo[$.from.id]);
    	setTimeout(function(){
    		lib.searchDataPage($, data.page,lib.UserInfo[$.from.id].result);
    	},300);
    	
	}
	}
	else{
			if(lib.UserInfo[$.from.id]){
			delete lib.UserInfo[$.from.id];
		}
	}
})

//--------------------------SearchController-----------------------// 
tg.controller('SearchController', ($) => {

 tg.for('/employers', () => {
 	
 	var url = "http://hh.indo.tech:88/important-articles?category=1";
 	lib.categoryData($, url);
 	$.waitForRequest(($) => {
		if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+$.message.text);
            	} 	
		})

 });	

tg.for('/applicants', () => {
 	var url = "http://hh.indo.tech:88/important-articles?category=2";
 	lib.categoryData($, url);
 	$.waitForRequest(($) => {
		if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+$.message.text);
            	} 	
		})
 	 
 });	

tg.for('/general', () => {
 	var url = "http://hh.indo.tech:88/important-articles?category=3";
 	lib.categoryData($, url);
 	$.waitForRequest(($) => {
		if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+$.message.text);
            	} 	
	})

 });	

tg.for('/page :page', () => {
 	if( lib.searchResult){	
	   	var page = $.query.page;
	    //var url = 'http://hh.indo.tech:88/search?text='+text;
	    if(lib.UserInfo[$.message.chat.id])
	    {
	    	lib.searchDataPage($, page,lib.UserInfo[$.message.chat.id].result);
	    }
	    
	}
	$.waitForRequest(($) => {
				if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+$.message.text);
            	}
		   }) 	
 });	


//--------------------------/search :text-----------------------// 
    tg.for('/search :text', () => {

    		lib.isSearchResultShow = false;
   			var text = $.query.text;
     		var url = "http://hh.indo.tech:88/search?text="+encodeURI(text);
     		 lib.searchData($, url, null);
     		$.waitForRequest(($) => {
				if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+$.message.text);
            	}
		   }) 

    });
//--------------------------------------------


//--------------------------/search :text :category-----------------------// 
     tg.for('/search :text :category', () => {
     	
     		//------------------
     		var text = $.query.text;
     		var category = $.query.category;
     		var url = 'http://hh.indo.tech:88/search?text='+text+'&category='+category;
     		 lib.searchData($, url, category).bind(lib);
     	
     });

     tg.for('/search', () => {

		$.sendMessage(config.message['SearchController']['search'].message);
		 		
		$.waitForRequest(($) => {
				if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+$.message.text);
            	}
		   }) 	


     });

     tg.for('/category :category', () => {
     	var category = $.query.category;

     		 $.sendMessage(config.message['SearchController']['search'].message)
            

             $.waitForRequest(($) => {
				if($.message.text[0] == '/'){
					$.routeTo($.message.text);
				}
				else{
            		$.routeTo('/search '+encodeURI($.message.text)+' '+category);
            	}
		   }) 



     });
		  
}); 
 
//-----------------------------------------------------------//

tg.controller('StartController', ($) => {
	var btn = config.message['StartController']['start'].button;
    tg.for('/start', () => {
		    $.runMenu({
			    message: config.message['StartController']['start'].message,
			    layout: 2,
			    [btn]: () => {$.routeTo("/menu")}, 
		  
			}) 

    });
     tg.for('/restart', () => {
		 $.routeTo('/start');
    });

      tg.for('/help', () => {
	      	var msg = config.message['StartController']['help'].message;	 
			$.sendMessage(msg);

      });
}); 

tg.controller('MenuController', ($) => { 
    tg.for('/menu', () => {
    	var result = {
		message: config.message['MenuController']['menu'].message,
		options: {
        parse_mode: 'Markdown' // in options field you can pass some additional data, like parse_mode
    	},

    	'Работодателям': () => {$.routeTo("/employers")}, 
		'Соискателям': () => {$.routeTo("/applicants")}, 
		'Общие вопросы по работе с сайтом': () => {$.routeTo("/general")}, 
		 anyMatch: ($) => { 
			//console.log($.message.text);
			$.routeTo($.message.text);
   		 }	
		};
		
         $.runMenu(result) 

  	});

	 tg.for('/support', () => {
	 
	 	$.sendMessage(config.message['MenuController']['support'].message, function(res){
	 	
	 	});
	 	

	 });

});
