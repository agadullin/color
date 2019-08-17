define(['jquery'], function($){
    var CustomWidget = function () {
    	var self = this;

		const account_id = AMOCRM.constant("account").id;
		const login = AMOCRM.constant('user').login;
		const api_key = AMOCRM.constant("user").api_key;
		const subdomain = AMOCRM.constant('account').subdomain;

		var ajaxSend = (options) => {
			return new Promise((resolve, reject) => {
		      $.ajax(options).done(resolve).fail(reject);
			})
		};

		self.getTemplate = function (template, params, callback) {
			params = (typeof params == 'object') ? params : {};
			template = template || '';

			return self.render({
				href: '/templates/' + template + '.twig',
				base_path: self.params.path,
				load: callback
			}, params);
		};

    	var localCreate = () => {
    		let data = JSON.parse(localStorage.ruleTags);
			for (let i = 0; i < data.length; i++) {
				let id = data[i]["id"];
				let color = data[i]["color"];
				$('span[data-id="' + id + '"]').css('background-color', color);
			}
		};

    	var request = () => {
    		return new Promise((resolve, reject) =>{
    			$.ajax({
					type:"GET",
					url: "http://localhost:2000/get",
					success: (data) =>{
						resolve(data);
					}
				})
			})
		};

    	var createStyle = (data) => {
    		return new Promise((resolve, reject) =>{
				localStorage.ruleTags = data;
				data = JSON.parse(data);
    			for (let i = 0; i < data.length; i++) {
    				let id = data[i]["id"];
    				let color = data[i]["color"];
    				$('span[data-id="' + id + '"]').css('background-color', color);
				}
			})
		};

    	var pipline = document.querySelector(".pipeline__body");

		var observer = new MutationObserver ((mutations) => {
			mutations.forEach((mutation, event) =>{
				if($(mutation.addedNodes[0]).hasClass('pipeline_leads__info') && (event === 4 || event === 0 || event === 3)){
					localCreate();
				}
			})
		});

    	var config = {childList:true, subtree:true};


		this.callbacks = {
			render: function(){
				return true;
			},
			init: function(){
				let settings = self.get_settings();

				if (AMOCRM.getWidgetsArea() === 'leads-pipeline') {
					request().then((results) => {
						createStyle(results);
						observer.observe(pipline, config);
					});
					observer.observe(pipline, config);
				}

				if ($('link[href="' + settings.path + '/style.css?v=' + settings.version +'"').length < 1) {
					$("head").append('<link href="' + settings.path + '/style.css?v=' + settings.version + '" type="text/css" rel="stylesheet">');
				}
				return true;
			},
			bind_actions: function(){
				return true;
			},
			settings: function($modal_body){
				self.getTemplate(
					'oferta',
					{},
					function (template) {
						$modal_body.find('input[name="oferta"]').val('');
						$modal_body.find('.widget_settings_block').append(template.render());
						var $install_btn = $('button.js-widget-install'),
							$oferta_error = $('div.oferta_error');
						    $modal_body.find('input[name="oferta_check"]').on('change', function (e) {

							var $checkbox = $(e.currentTarget);
							if ($checkbox.prop('checked')) {
								$modal_body.find('input[name="oferta"]').val('1');
								$oferta_error.addClass('hidden');
							} else {
								$modal_body.find('input[name="oferta"]').val('');
							}
						});
						$install_btn.on('click', function () {
							if (!$modal_body.find('input[name="oferta"]').val()) {
								$oferta_error.removeClass('hidden');
							}
						});
					}
				);
				return true;
			},
			onSave: function(){
				let data = {
					"account_id": account_id,
					"login": login,
					"api_key": api_key,
					"subdomain": subdomain

				};
				$.ajax({
					type: "POST",
					url: "http://localhost:2000/connect",
					data : data,
					success: function () {
						console.log("done");
					}
				});
				return true;
			},
			destroy: function(){
				
			},
			advancedSettings: function () {
				ajaxSend("http://localhost:2000/getrule").then(resolve =>{
					self.getTemplate(
					'rule',
					{},
					(template) => {
						console.log(resolve);
						$('#work-area-colortegs').append(template.render({result:JSON.parse(resolve)}));
						$('.create_button').on("click",
							ajaxSend({
								url:"http://localhost:2000/add",
								type: "POST",
								data: {
									rule: $('#work-area-colortegs input[name="rule"]').val().trim(),
									color: $('#work-area-colortegs input[name="color"]').val().trim(),
								}
							})
						);
					}
				)
				})
			},
			contacts: {
					selected: function(){
					}
				},
			leads: {
					selected: function(){
					}
				},
			tasks: {
					selected: function(){
					}
				}
		};
		return this;
    };

return CustomWidget;
});