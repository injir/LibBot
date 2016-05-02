'use strict'
var request = require('request');
var json = require('json-serialize');
var config = require('../config');
class LibBot{

	constructor() {
        this.searchResult={};
		this.MessageId=0;
		this.KeyboardId=0;
		this.isSearchResultShow = false;
		this.UserInfo = {};
    }
	

	//Метод возвращает JSON со статьями
	getData(url,callback){
		
	  new Promise(function(resolve, rejected){
	 			request({				  
					    url: url,
					    method: 'GET'
					  }, function (err, res, body) {					  
					  	if(!err && body !== "[]" && body !== "['Bad data']" ){		

					  		resolve(JSON.parse(body));

					  		
					  	}else{
					  	
					  		rejected('К сожалению, ничего не найдено');
					  	}
					  });	

	 		}).then(function(resolve){	
				return callback(resolve);
	 		}, function(rejected){
	 			return callback(null,rejected);		
	 		});
	};
	//-------------------------------------

	//метод выводит статьи в разделе категорий
	categoryData(obj, url){

			this.getData(url,(result,err)=>{
		 		if(!err){
			 			this.isSearchResultShow = false;
						//this.searchResult = result;
						this.UserInfo[obj.user.id] ={result: result, msg: 0, keyboard: 0, date:0};
						this.searchDataPage(obj,1,result);
						

			 			}
		 		});
	};
	//------------------------------------------

	//Метод выводит результаты поиска
 	searchData(obj, url, category){
 		var lib = this;
 		var btn = config.message['SearchController']['error'].button;
		this.getData(url, function(result,err){
	     			if(!err)
	     			{

	     				if(!(obj.user.id in lib.UserInfo)){
	     					lib.UserInfo[obj.user.id] = {page:0};
	     				}
	     				lib.showSearchResult(obj,result);
	     				
	     				// lib.isSearchResultShow = false;
	     				
	     				 //lib.UserInfo[obj.user.id] ={result: result, msg: 0, keyboard: 0, date:0};
	     				// setTimeout(function(){
	     				// 		lib.searchDataPage(obj,1,result);

	     				// },1000);
					
						

	     			}
	     			else{
	     				delete lib.UserInfo[obj.user.id];
	 					obj.runMenu({

						     message: config.message['SearchController']['error'].message,
						     layout: 1,
						    [btn[1]]: () => {obj.routeTo("/support")}, //will be on first line
						    [btn[2]]: () => {obj.routeTo("/menu")},
						    anyMatch: ($) => { 
								if($.message.text[0] == '/'){
									$.routeTo($.message.text);
								}
								else{
									$.routeTo('/search '+encodeURI($.message.text));
								}
	   		 				}
					  
						})		
	     			}	
	     		});

	}
	//------------------------------------------

	//Метод осуществляет постраничный вывод статей
	 searchDataPage(obj,page,result){ 			
				if(result){	
					var lib = this;
     				var quantity = config.articleQuantity; // количество статей на странице
					var length; // индекс последней статьи на странице
					var startArticle = 0; //индекс первой статьи на странице
					var pageQuantity = (result.length % quantity==0) ? (result.length / quantity) : Math.ceil(result.length / quantity); //всего страниц
					if(page == 0){
						page = 1;
					}
					else if(page > pageQuantity){
						page =	pageQuantity;
					}
    				
					var currentPage  = parseInt(page); //текущая 
					startArticle = (currentPage-1) * quantity;
					if(currentPage !== pageQuantity){
						length = startArticle+quantity;
					}
					else{
						length = result.length;
					}
 			 	 	var msg ='';
 			 	 	var menu = this.generatePaginator(currentPage,pageQuantity,obj);	
 			 	 	for(var i = startArticle; i < length; i++){
			 			msg +='\n'+result[i].name+'\n'+ result[i].link;
			 		}	
			 		
 			 		if(this.isSearchResultShow){
 			 			var chatid;
 			 			var msgId;
 			 			if(!obj.chatId){
 			 				chatid = obj.message.chat.id;
 			 	
 			 			}
 			 			else{
 			 				chatid =obj.chatId;
 			 			}
 			 			msgId = lib.UserInfo[chatid].msg

 			 			this.editMessage(chatid,msgId,msg);
 			 			this.editMessageReplyMarkup(chatid,msgId+1,menu); 			 			

 			 		}
 			 		else{
 			 			
 			 			//this.SendMessageWithHideKeyboard(obj.chatId,config.message['SearchController']['result'].message,function(){
 			 			if(obj){
 			 				obj.sendMessage(msg,($)=>{
 			 					
			 					if( pageQuantity>1){
			 						obj.runInlineMenu('sendMessage', 'Select:', {}, menu,[5]);				 					 					 					 		
			 						lib.MessageId = $.result.message_id;
			 						lib.KeyboardId =$.result.message_id +1;
			 						lib.isSearchResultShow = true;
			 						lib.UserInfo[$.result.chat.id]['msg'] = $.result.message_id;
			 						lib.UserInfo[$.result.chat.id]['keyboard'] =$.result.message_id +1;
			 						lib.UserInfo[$.result.chat.id]['date'] = $.result.date;
			 						// lib.setMesageId($.result.message_id);
			 						// lib.setKeyboardId($.result.message_id +1);
			 						// lib.setSearchResultShow(true);

			 						}			 						
			 					});
 			 			}
 			 			//});	 					
			 							
		 		}
		 	}

		   		

	}
	setMesageId(id){
		this.MessageId = id;		 						
	}
	setKeyboardId(id){
		this.KeyboardId = id;
	}
	setSearchResultShow(arg){
		this.isSearchResultShow = arg;
	}
//------------------------------------------
	
//Метод Формирует клавиатуру с постраничной навигацией
	
 generatePaginator(current,last,obj){
		var result = [];
		var Pager = {
			first: {text:'1', callback: ($)=>{obj.routeTo('/page 1')},page:1},
			current: {text:'.' + current+'.', callback: ($)=>{obj.routeTo('/page '+encodeURI(current))} ,page:current },
			last: { text:''+last+'->', callback: ($)=>{obj.routeTo('/page '+encodeURI(last))},page:last },
			fPrevious: { text:'<'+(current -1), callback: ($)=>{obj.routeTo('/page '+encodeURI(current -1))},page:current-1 },
			sPrevious: { text:'*'+(current -2), callback: ($)=>{obj.routeTo('/page '+encodeURI(current -2))},page:current-2 },
			tPrevious: { text:'*'+(current -3), callback: ($)=>{obj.routeTo('/page '+encodeURI(current -3))},page:current-3 },
			fNext: { text:(current + 1)+'>', callback: ($)=>{obj.routeTo('/page '+encodeURI(current +1))},page:current+1 },
			sNext: { text:(current + 2)+'*', callback: ($)=>{obj.routeTo('/page '+encodeURI(current +2))},page:current+2 },
			tNext: { text:(current + 3)+'*', callback: ($)=>{obj.routeTo('/page '+encodeURI(current +3))},page:current+3 },
		};

		if(last !== 1){
		if(current == 1){
				result.push(Pager.current);

				if(current +1 < last){
					result.push(Pager.fNext);
				}
				if(current+2 < last){
					result.push(Pager.sNext);
				}
				if(current+3 < last){
					result.push(Pager.tNext);
				}
				result.push(Pager.last);

			
		}
		else{
				result.push(Pager.first);		
			if(current !== last){
					
					if(current-1 !== 1){
						result.push(Pager.fPrevious);
					}
					result.push(Pager.current);
					if(current+1 !== last){
						result.push(Pager.fNext);
					}
					result.push(Pager.last);
				}
				else{
					if(last -3 > 1){
						result.push(Pager.tPrevious);
					}
					if(last-2 > 1){
						result.push(Pager.sPrevious);
					}
					if(last-1 > 1){
						result.push(Pager.fPrevious);
					}
					result.push(Pager.current);
				}
							
			}
		}
		else{
			result.push(Pager.current);
		}

		return result;	
}
//------------------------------------------


//Метод редактирует сообщение 
 editMessage(chatid,id,msg){
	var url = 'https://api.telegram.org/bot'+config.token+'/editMessageText?message_id='+id+'&text='+encodeURI(msg)+'&chat_id='+chatid;
	request({	  
		    url: url,
		    method: 'GET'
		  }, function (err, res, body) {	
		  		  		
		  });
}
//------------------------------------------

//Метод изменяет объект reply_markup, испульзуется для редактирования inline клавиатуры
	editMessageReplyMarkup(chatid,id,keyboard){
		var array = [
		//[{text:"1", callback_data:'{"page":1}'}]
		];
		var line = [];
		for(var i = 0; i< keyboard.length; i++){
			
			var button = {text:keyboard[i].text, callback_data:'{"page":'+keyboard[i].page+'}'};
			line.push(button);

		}
		array.push(line);
		var markup = JSON.stringify({inline_keyboard:array});
		request.post('https://api.telegram.org/bot'+config.token+'/editMessageReplyMarkup', {form:{chat_id:chatid,message_id:id,reply_markup:markup}}, function(err, res, body){
			
		})

	}
//------------------------------------------
 //Метод отправляет сообщение и скрывает клавиатуру
	 SendMessageWithHideKeyboard(chatid,msg,callback){

		var option = JSON.stringify({hide_keyboard:true});
		var url = 'https://api.telegram.org/bot'+config.token+'/sendMessage?text='+encodeURI(msg)+'&chat_id='+chatid+'&reply_markup='+option;
		request({	  
			    url: url,
			    method: 'GET'
			  }, function (err, res, body) {
			  		return callback();  		  		
			  });
	}
//------------------------------------------
	clearSearchResult(){
		for(var item in UserInfo){
			console.log(Date.now()-item.date);
			if(Date.now()-item.date>1){

			}
		}
	}

	showSearchResult(obj,result){
		
		var currentPage = this.UserInfo[obj.user.id].page;
		console.log(currentPage);
		var itemQuantity = config.articleQuantity;
		var articles = result;
		var currentIndex = currentPage*itemQuantity;
		var lastIndex = currentIndex+itemQuantity;
		console.log(currentIndex,lastIndex );
		var menu = {
			'в меню':()=>{obj.routeTo("/menu")}
		};
		
		if(lastIndex>=articles.length){
			lastIndex = articles.length;
		}
		else{
			menu['еще'] = ()=>{obj.routeTo(obj.message.text)};
		}
			var msg ='';	
	 	 for(var i = currentIndex; i < lastIndex; i++){
 			msg +='\n'+articles[i].name+'\n'+ articles[i].link;
 		 }	
 		 menu['message'] = msg;
 		 menu['layout'] = 1;
 		 obj.runMenu(menu); 
 		 this.UserInfo[obj.user.id].page = currentPage+1;
	}

}


module.exports = function () {
    return new LibBot();
}