'use strict'

var Config = {
	//token:'188012702:AAFqG-kcggesMuNmh5ISPg9zaBTk6-wIo9I', //lib_bot
	token: '209322536:AAFU9LFlijkijXAbYCPcWDaTLLBUjHXfBLE', 
	menu:{
	1: 'Работодателям',
	2: 'Соискателям',
	3: 'Общие вопросы',	
	},
	articleQuantity:7,
		message:{
			'StartController':{
				'start': {
					message: 'Привет, я помогу найти статьи',
					button: 'Есть вопрос?'
				},
				'help':{
					message:'/start \n/restart \n/menu \n/help \n/search \n/support \n/employers \n/applicants \n/general',
				}
			},
			'MenuController':{
				'menu':{
					message: "Варианты команд: \n  /search {ваша фраза для поиска} - поиск по всем разделам.\n/employers \n/applicants \n/general",
				},
				'support':{
					message: 'Пожалуйста, воспользуйтесь ботом @hh_ru_bot',
				}
			},

			'SearchController':{
				'search':{
					message: "Пожалуйста, введите поисковую фразу",
				},
				'support':{
					message: 'Пожалуйста, воспользуйтесь ботом @hh_ru_bot',
				},
				'error':{
					message: 'К сожалению, база знаний формируется \n и в ней ещё нет всей информации, \n Вам могут помочь сотрдники техподдержки. \n Соединить со специалистом?',
					button:{
						1:'Да',
						2:'Нет'
					},
				
				},
				'result':{
					message: "Результаты поиска:",
						
				}

		},


	}

}

module.exports = Config;