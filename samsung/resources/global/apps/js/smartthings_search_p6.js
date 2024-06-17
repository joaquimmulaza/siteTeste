
;(function(win,doc,callback){'use strict';callback=callback||function(){};function detach(){if(doc.addEventListener){doc.removeEventListener('DOMContentLoaded',completed);}else{doc.detachEvent('onreadystatechange',completed);}}function completed(){if(doc.addEventListener||event.type==='load'||doc.readyState==='complete'){detach();callback(window,window.jQuery);}}function init(){if (doc.addEventListener){doc.addEventListener('DOMContentLoaded',completed);}else{doc.attachEvent('onreadystatechange',completed);}}init();})(window,document,function(win,$){
		// HIGHLIGHT PLUGIN
	jQuery.extend({
		highlight: function (node, re, nodeName, className) {
			if (node.nodeType === 3) {
				var match = node.data.match(re);
				if (match) {
					var highlight = document.createElement(nodeName || 'span');
					highlight.className = className || 'highlight';
					var wordNode = node.splitText(match.index);
					wordNode.splitText(match[0].length);
					var wordClone = wordNode.cloneNode(true);
					highlight.appendChild(wordClone);
					wordNode.parentNode.replaceChild(highlight, wordNode);
					return 1; //skip added node in parent
				}
			}  else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
					!/(script|style)/i.test(node.tagName) && // ignore script and style nodes
					!(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
				for (var i = 0; i < node.childNodes.length; i++) {
					i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
				}
			}
			return 0;
		}
	});

	jQuery.fn.highlight = function (words, options) {
		var settings = { className: '', element: 'em', caseSensitive: false, wordsOnly: false };
		jQuery.extend(settings, options);

		if (words.constructor === String) {
			words = [words];
		}
		words = jQuery.grep(words, function(word, i){
		  return word != '';
		});
		words = jQuery.map(words, function(word, i) {
		  return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		});
		if (words.length == 0) { return this; };

		var flag = settings.caseSensitive ? "" : "i";
		var pattern = "(" + words.join("|") + ")";
		if (settings.wordsOnly) {
			pattern = "\\b" + pattern + "\\b";
		}
		var re = new RegExp(pattern, flag);

		return this.each(function () {
			jQuery.highlight(this, re, settings.element, settings.className);
		});
	};

	// ie8 Object.keys 설정
	if(!Object.keys) {
		Object.keys = (function() {
			'use strict';
			var hasOwnProperty = Object.prototype.hasOwnProperty,
				hasDontEnumBug = !({
					toString: null
				}).propertyIsEnumerable('toString'),
				dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
				dontEnumsLength = dontEnums.length;
			return function(obj) {
				if(typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
					throw new TypeError('Object.keys called on non-object');
				}
				var result = [],
					prop, i;
				for(prop in obj) {
					if(hasOwnProperty.call(obj, prop)) {
						result.push(prop);
					}
				}
				if(hasDontEnumBug) {
					for(i = 0; i < dontEnumsLength; i++) {
						if(hasOwnProperty.call(obj, dontEnums[i])) {
							result.push(dontEnums[i]);
						}
					}
				}
				return result;
			};
		}());
	}

	var ST_search = {

        _var : {
			siteCode		: $("meta[name='sitecode']").attr("content"),
			sizeMode 		: 0,
			prevSizeMode	: 0,
			dataLoadCheck	: false,
            layerOpenRequest : false,
			rtl_check 		: $("html").is(".rtl") ? true : false,
			highlightTag	: null,
			data 			: {
				apps			: [],
				products		: [],
				categories		: [],
				all				: [],
				uniqCategories	: [],
				bridge 			: {}
			},
			defaultIconPath : "//images.samsung.com/is/image/samsung/assets/apps/global/smartthings/common/apps_smartthings_search_list_ic_default.png",
			categoryMoreIdx : null,
			ua				: navigator.userAgent.toLowerCase(),
			elem : {
				search				: $("#search"),
				supportBtn			: $("a[href='#search']"),
				countryList 		: $("#countryList"),
				searchCategory 		: $("#searchCategory"),
				selectCategory 		: $("#selectCategory"),
				selectCategoryM 	: $("#selectCategoryM"),
				categoryList 		: $("#categoryList"),
				productList 		: $("#productList"),
				searchCategoryList 	: $("#searchCategoryList"),
				searchProductList 	: $("#searchProductList"),
				searchBridge 		: $(".search_bridge"),
				searchDefault 		: $(".search_default"),
				searchResults 		: $(".search_results"),
				btnClose 			: $("#search .btn_close"),
				btnTop 				: $("#search .btn_top"),
				btnMore 			: $("#search .btn_more"),
				btnCategoryMore 	: $("#search .btn_category_more"),
				loader				: $(".sc-loaders"),
				scrollTarget		: null
			},
			// _swiper: null
        },

		winSizeCheck : function(){
			var windowSize = window.innerWidth != undefined ? window.innerWidth : $(window).innerWidth() + 17;
			ST_search._var.sizeMode = windowSize > 1440 ? 3 : windowSize > 768 ? 2 : 1;
		},

		isMobile : function(){
			var agents = ['android', 'webos', 'iphone', 'ipad', 'blackberry'];
			for(i in agents){
				if( ST_search._var.ua.indexOf(agents[i]) > -1 ){
					return agents[i];
				}
			}
			return false;
		},

		isMsie : function(){
			if( ST_search._var.ua.indexOf("msie") > -1 || ST_search._var.ua.indexOf("trident/") > -1 ){
				return true;
			}
			return false;
		},

		bridge : function(){
			var siteCode = ST_search._var.siteCode;
            var domain='';

			if( siteCode == "test" ){
				siteCode = "uk";
			}

            if(location.href.indexOf('p6-ap-author') > -1){
                domain = 'p6-ap-author.samsung.com';
            }else if(location.href.indexOf('p6-qa') > -1){
                domain = 'p6-qa.samsung.com';
            }else if(location.href.indexOf('www.samsung.com') > -1){
                domain = 'www.samsung.com';
            }

			$.ajax({
				url : '//'+domain+'/samsung/resources/global/apps/xml/smartthings_country.xml',
				dataType : 'xml',
				success: function (xml) {
					ST_search._var.data.bridge = $(xml).find("sites > site[name='"+ siteCode +"']");
				},
				complete: function () {
					if( ST_search._var.data.bridge.find("> display").text() == "Y" ){
						if( ST_search._var.data.bridge.find("> global").text() == "Y" ){
							var displayCheck 	= false;
							var innerHtml 		= "";

							ST_search._var.data.bridge.find("local").each( function(i,v){
								var _this = $(v);

								if( _this.find("display").text() == "Y" ){
									displayCheck = true;
									innerHtml += '<li role="listitem"><a href="#" data-country-code="'+ _this.find("countryCode").text() +'" data-language-code="'+ _this.find("languageCode").text() +'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smarttihngs:select your country:'+ _this.find("countryName").text() +'" ><figure><img src="'+ _this.find("flagImg").text() +'" alt=""></figure><strong>'+ _this.find("countryName").text() +'</strong></a></li>';
								}
							});

							if(! displayCheck ){
								ST_search._var.elem.supportBtn.parents(".section").hide();
								return false;
							}

							ST_search._var.elem.countryList.append("<ul>"+ innerHtml +"</ul>");
							//ST_search.step(1);
							ST_search._var.elem.searchBridge.addClass("active");
							ST_search._var.elem.btnClose.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:select your country_close" });

							// 레이어팝업 미노출 | 로딩바 노출 상태일 경우에 레이어 노출 | 로딩바 미노출 처리
							if( ST_search._var.layerOpenRequest ){
								ST_search._var.elem.loader.hide();
								ST_search._var.elem.search.show().focus();
								if( ST_search.isMobile() == "iphone" ){
									//ST_search._var.elem.search.focus();
								}
								ST_search._var.layerOpenRequest = false;
							}

							ST_search._var.elem.countryList.find("a").on({
								"click" : function(e){
									var countryCode = $(this).data("countryCode");
									var languageCode = $(this).data("languageCode");

									ST_search._var.elem.loader.show();
									ST_search.callAPI(countryCode, languageCode);
                                    ST_search._var.elem.search.find("#search_input").focus();
									//ST_search.step(2);
									e.preventDefault();
								}
							});

							ST_search._var.dataLoadCheck = true;

						} else {
							var countryCode = ST_search._var.data.bridge.find("countryCode").text();
							var languageCode = ST_search._var.data.bridge.find("languageCode").text();
							ST_search._var.elem.searchDefault.find(".btn_back").hide();
							ST_search._var.elem.btnClose.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:search for supported devices_close" });
							ST_search.callAPI(countryCode, languageCode);
						}

						ST_search.event();
						ST_search.bundle();
					} else {
						ST_search._var.elem.supportBtn.parents(".section").hide();
					}

				},
				error : function(){
					ST_search._var.elem.supportBtn.parents(".section").hide();
				}
			});
		},

		callAPI : function (countryCode, languageCode){

			var siteCode = ST_search._var.siteCode;
			if( siteCode == "test" ){
				siteCode = "uk";
			}

			var ajaxCompleteCheck 		= 0;
			var errorCheck_devicetypes	= 0;
			var errorCheck_categories	= 0;
			var errorCheck_apps			= 0;

			devicetypesAjax('//api.smartthings.com/catalogs/api/v3/devicetypes?country=' + countryCode + '&count=1000');
			categoriesAjax('//api.smartthings.com/catalogs/api/v3/categories');
			appsAjax('//api.smartthings.com/catalogs/api/v3/apps?country=' + countryCode + '&count=1000');

			function devicetypesAjax(url){
				$.ajax({
					url: url,
					headers: {
						'accept': 'application/json',
						'Accept-Language': languageCode
					},
					success: function (data) {
						console.log("success : devicetypes")
                        ST_search._var.data.products = ST_search._var.data.products.concat(data.products);

						if(data.nextPage) {
							var nextUrl = '//api.smartthings.com/catalogs/api/v3/devicetypes?country=' + countryCode + '&count=1000' + '&pagingState=' + data.nextPage;
                            devicetypesAjax(nextUrl);
						} else {
                            ajaxCompleteCheck = ajaxCompleteCheck + 1;
                            if( ajaxCompleteCheck == 3 ){
                                ST_search.process();
                            }
						}
					},
					complete: function () {

					},
					error : function() {
						console.log("error : devicetypes")
						if( errorCheck_devicetypes == 0 ){
							devicetypesAjax('//www.samsung.com/samsung/resources/global/apps/smartthings/devicetypes/'+ siteCode +'&'+ languageCode + '&devicetypes.json');
						} else {
							ST_search._var.elem.supportBtn.parents(".section").hide();
						}
						errorCheck_devicetypes ++;
					}
				});
			}

			function categoriesAjax(url){
				$.ajax({
					url: url,
					headers: {
						'accept': 'application/json',
						'Accept-Language': languageCode
					},
					success: function (data) {
						console.log("success : categories")
						ST_search._var.data.categories = data.categories;
						ajaxCompleteCheck = ajaxCompleteCheck + 1;
						if( ajaxCompleteCheck == 3 ){
							ST_search.process();
						}
					},
					complete: function () {

					},
					error : function(error){
						console.log("error : categories");
						if( errorCheck_categories == 0 ){
							categoriesAjax('//www.samsung.com/samsung/resources/global/apps/smartthings/categories/'+ siteCode +'&'+ languageCode + '&categories.json');
						} else {
							ST_search._var.elem.supportBtn.parents(".section").hide();
						}
						errorCheck_categories ++;
					}
				});
			}


			function appsAjax(url){
				$.ajax({
					url: url,
					headers: {
						'accept': 'application/json',
						'Accept-Language': languageCode
					},
					success: function (data) {
						console.log("success : apps")
						ST_search._var.data.apps = data.apps;
						ajaxCompleteCheck = ajaxCompleteCheck + 1;
						if( ajaxCompleteCheck == 3 ){
							ST_search.process();
						}
					},
					complete: function () {

					},
					error : function(){
						console.log("error : apps")
						if( errorCheck_apps == 0 ){
							appsAjax('//www.samsung.com/samsung/resources/global/apps/smartthings/apps/'+ siteCode +'&'+ languageCode + '&apps.json');
						} else {
							ST_search._var.elem.supportBtn.parents(".section").hide();
						}
						errorCheck_apps ++;
					}
				});
			}
		},

		process : function(){
			console.log("init : process")
			var temp = [];
			var includeRequiredServiecesObjIdx = [];

			//categoryIds로 정렬 이후, requiredServices가 없는 경유 - 유효한 category
			$.each(ST_search._var.data.products, function(i, v){
				$.each(v.categoryIds, function(j,w){
					if($.inArray(w, temp) == -1){
						if( w && ! v.requiredServices.length ){
							ST_search._var.data.uniqCategories.push({categoryId: w, appId: v.setupAppIds });
							temp.push(w);
						}
					}
				});
			});

			for( var i = ST_search._var.data.uniqCategories.length-1; i >= 0; i-- ){
				$.each(ST_search._var.data.categories, function(j,w){
					if( ST_search._var.data.uniqCategories[i].categoryId == w.categoryId ){
						var key = Object.keys(w.localizations);
						ST_search._var.data.uniqCategories[i].displayName 	= w.localizations[key] && w.localizations[key].displayName ? w.localizations[key].displayName : "";
						ST_search._var.data.uniqCategories[i].internalName 	= w.internalName ? w.internalName : "";
						ST_search._var.data.uniqCategories[i].iconUrl		= w.iconUrl ? w.iconUrl : ST_search._var.defaultIconPath ;
						ST_search._var.data.uniqCategories[i].priority		= w.additionalData && w.additionalData.priority ? w.additionalData.priority : "";

						// 유효한 categoryId 중에 requiredServices를 가지고 있는 obj를  uniqCategories 에서 삭제 처리
						if( w.requiredServices && w.requiredServices.length ){
							ST_search._var.data.uniqCategories.splice(i,1);
						}
					}
				});
			}

			// 유효한 category 오름차순 정렬
			ST_search._var.data.uniqCategories.sort(function(a,b){
				return a["priority"] - b["priority"];
			});

			// ST_search._var.elem.searchCategory.append('<ul role="list"><li role="listitem" class="active"><a title="'+ST_search._var.data.bridge.find("text_allCategory").text()+'" href="#" role="button" data-categories-id="all" data-display-name="'+ ST_search._var.data.bridge.find("text_allCategory").text() +'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:category filter_'+ ST_search._var.data.bridge.find("text_allCategory").text().toLowerCase() +'" >'+ ST_search._var.data.bridge.find("text_allCategory").text() +'</a></li></ul>');
			ST_search._var.elem.searchCategory.append('<ul role="list"><li role="listitem" class="active"><a title="selected" href="#" role="button" data-categories-id="all" data-display-name="'+ ST_search._var.data.bridge.find("text_allCategory").text() +'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:category filter_'+ ST_search._var.data.bridge.find("text_allCategory").text().toLowerCase() +'" >'+ ST_search._var.data.bridge.find("text_allCategory").text() +'</a></li></ul>');
			ST_search._var.elem.selectCategory.attr({ "data-display-name" : ST_search._var.data.bridge.find("text_allCategory").text() });
			ST_search._var.elem.selectCategoryM.find("option:eq(0)").attr({ "data-display-name" : ST_search._var.data.bridge.find("text_allCategory").text() });
			ST_search._var.elem.categoryList.append('<ul role="list"></ul>');
			$("[data-role='inputSearchData01'], [data-role='inputSearchData02']").attr({ "data-omni-type" : "microsite_pcontentinter" , "data-omni" : "smartthings search_" });


			// uniqCategories 배열 기준으로 전체 유효한 data 추출
			$.each( ST_search._var.data.uniqCategories,  function(i,v){
				ST_search._var.elem.searchCategory.find(">ul").append('<li role="listitem"><a href="#" role="button" class="m'+ (i+1) +'" data-display-name="'+v.displayName+'" data-internal-name="'+v.internalName+'" data-categories-id="'+v.categoryId+'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:category filter_'+ v.displayName.toLowerCase() +'" >' + v.displayName +'</a></li>');
				ST_search._var.elem.selectCategoryM.append('<option class="m'+ (i+1) +'" data-display-name="'+v.displayName+'" data-internal-name="'+v.internalName+'" data-categories-id="'+v.categoryId+'" >' + v.displayName +'</option>');

				// 독일(de) 지법인 예외 처리
				/*
				var exceptionText;
				if( ST_search._var.siteCode == "de" ){
					if( v.displayName == "Offen/Geschlossen-Sensor" ){
						exceptionText = "Offen/Geschlos-sen-Sensor";
					} else if ( v.displayName == "Schalter/Dimmer" ){
						exceptionText = "Schalter/Dim-mer";
					}
				}
				ST_search._var.elem.categoryList.find("> ul").append('<li><a href="#" class="m'+ (i+1) +'" data-display-name="'+v.displayName+'" data-internal-name="'+v.internalName+'" data-categories-id="'+v.categoryId+'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:category filter_'+ v.displayName.toLowerCase() +'" ><figure class="product_icon"><img src="'+v.iconUrl+'" alt="" /></figure><strong class="product_tit">'+ ( ST_search._var.siteCode == "de" ? (exceptionText != null ? exceptionText :  v.displayName ) : v.displayName ) +'</strong></a></li>');
				*/

				ST_search._var.elem.categoryList.find("> ul").append('<li role="listitem"><a href="#" role="button" class="m'+ (i+1) +'" data-display-name="'+v.displayName+'" data-internal-name="'+v.internalName+'" data-categories-id="'+v.categoryId+'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:category filter_'+ v.displayName.toLowerCase() +'" ><figure class="product_icon"><img src="'+v.iconUrl+'" alt="" /></figure><strong class="product_tit">'+ v.displayName +'</strong></a></li>');

					ST_search._var.data.all[i] 					= {};
					ST_search._var.data.all[i][v.categoryId] 	= [];
				var setupAppIdsCheckArray 						= [];
				var metadataDisplayNameObj 						= {};
				var appIconUrlObj								= {};

				$.each(ST_search._var.data.products, function(j,w){

					$.each(w.categoryIds, function(k,x){

						if(  x == v.categoryId && ! w.requiredServices.length && w.setupAppIds.length ){
							var key 			= Object.keys(w.localizations);
							var marketingName	= w.localizations[key] && w.localizations[key].marketingName ? w.localizations[key].marketingName : "";
								marketingName 	= marketingName.replace(/\n/gi, " ");
							var modelName		= w.modelName ? w.modelName : "";
							var setupAppIds		= w.setupAppIds[0] ? w.setupAppIds[0] : "";
							var	releaseDate		= w.releaseDate ? w.releaseDate : "";

							if($.inArray(setupAppIds, setupAppIdsCheckArray) == -1){
								setupAppIdsCheckArray.push(setupAppIds);

								$.each(ST_search._var.data.apps, function(l,y){
									if( setupAppIds == y.appId ){
										var key 				= Object.keys(y.localizations);
										var metadataDisplayName	= y.localizations[key] && y.localizations[key].metadataDisplayName ? y.localizations[key].metadataDisplayName : y.appInternalName;
										var appIconUrl			= y.appMetadata && y.appMetadata.appIconUrl ? y.appMetadata.appIconUrl : v.iconUrl;
										metadataDisplayNameObj[setupAppIds] = metadataDisplayName;
										appIconUrlObj[setupAppIds] 			= appIconUrl;
										return false;
									}
								});
							}

							//////////////// 여기서 underfined 되는 값이 있으면 data push하지 않음.
							if( metadataDisplayNameObj[setupAppIds] == undefined || appIconUrlObj[setupAppIds] == undefined ){
								//console.log("유효하지 않는 setupAppIds : " + setupAppIds);
							} else {
								ST_search._var.data.all[i][v.categoryId].push({"marketingName" : marketingName, "modelName" : modelName,  "setupAppIds" : setupAppIds, "metadataDisplayName" : metadataDisplayNameObj[setupAppIds], "displayName" : ST_search._var.data.uniqCategories[i].displayName, "iconUrl" : ST_search._var.data.uniqCategories[i].iconUrl, "appIconUrl" : appIconUrlObj[setupAppIds], "releaseDate" : releaseDate, "categoryId" : v.categoryId });
							}
						}
					});
				});

				// 전체 유효 data 오름차순 정렬
				ST_search._var.data.all[i][v.categoryId].sort(function(a,b){
					if(a.metadataDisplayName > b.metadataDisplayName){
						return 1;
					} else if(a.metadataDisplayName < b.metadataDisplayName){
						return -1;
					} else {
						if( a.marketingName != "" ||  b.marketingName != "" ){
							if( a.marketingName == "" && b.marketingName != "" ){
								return 1;
							} else if( a.marketingName != "" && b.marketingName == ""  ){
								return -1;
							} else if ( a.marketingName > b.marketingName ){
								return 1
							} else if ( a.marketingName < b.marketingName ){
								return -1
							}
						} else {
							if( a.modelName > b.modelName ){
								return  1;
							} else if( a.modelName < b.modelName ) {
								return -1;
							}
						}
					}
				});
			});

			ST_search._var.dataLoadCheck = true;

			if( ST_search._var.data.bridge.find("global").text() == "Y" ){
				ST_search.step(2);
			} else {
				ST_search._var.elem.searchDefault.addClass("active");
			}

			// 레이어팝업 미노출 | 로딩바 노출 상태일 경우에 레이어 노출 | 로딩바 미노출 처리
			if( ST_search._var.layerOpenRequest ){
				ST_search._var.elem.search.show();
				ST_search._var.layerOpenRequest = false;
			}

			ST_search._var.elem.loader.hide();
			ST_search.categoryListMore();

			///// highlight 적용을 위한 임시 p 태그 생성
			$("body").append('<p style="display:none;" class="tempo" />');
			ST_search._var.highlightTag = $(".tempo");
		},


		bundle : function(){
			var bundleSet = ST_search._var.data.bridge.find("text");

			$("[data-bundle]").each(function(i,v){
				var _this 		= $(this);
				var dataBundle 	= _this.attr("data-bundle").split(",");

				$.each(dataBundle, function(i,v){
					var type	= v.split("_")[0];
					if( type == "alt" || type == "title" || type == "placeholder" ){
						_this.attr(type, bundleSet.find(v).text());
					}
					else {
						_this.text(bundleSet.find(v).text());
					}
				});
			});
		},

		popup : function(){
			// 검색기능 레이어팝업 open
			ST_search._var.elem.supportBtn.on({
				"click" : function(e){
                    if(ST_search._var.elem.categoryList.find('ul').length === 0){
                        ST_search.bridge();
                    }
                    ST_search._var.elem.search.attr({ "aria-hidden" : "false"});
                    ST_search._var.elem.search.removeAttr('tabindex');
                    if( ST_search._var.dataLoadCheck ){
                        ST_search._var.elem.search.show();
                        // ST_search._var.elem.search.find("#selectCategory").focus();
                        setTimeout(function(){
                            if( ST_search.isMobile() == "iphone" ){
                                ST_search._var.elem.search.find("#selectCategoryM").focus();
                            }
                            ST_search._var.elem.search.find("#selectCategory").focus();
                        },3000)

                    } else{
                        ST_search._var.elem.loader.show();
                        ST_search._var.layerOpenRequest = true;
                    }

                    if( ST_search.isMobile() ){
                        $("#header , #footer").hide();
                        $(".cm-g-static-content").siblings(".section").hide();
                        $(".common-xml-section").hide();
                        setTimeout(function() {
                            ST_search._var.elem.search.find("#selectCategoryM").focus();
                        },3000);
                    }

					$("body").css({ "height" : "100%", "overflow" : "hidden" });

					ST_search._var.elem.search.find(".layer_list_inner , .product_cont_wrap").scrollTop(0);

                    // ST_search._var.elem.search.attr('aria-hidden','true')
					e.preventDefault();


                    //p6 accessibility
                    $('.indicator__controls').eq(1).trigger('click');
                    $(".aem-GridColumn").not('.aem-GridColumn.responsivegrid').attr({"aria-hidden": true, 'tabindex':-1});
                    $(".skip-bar").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".nv00-gnb__inner-wrap").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".footer").attr({"aria-hidden": true, 'tabindex':-1});
                    $("#teconsent").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".progress.cm-loader").attr({"aria-hidden": true, 'tabindex':-1});
                    $("#header").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".newpar.new.section").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".nv16-country-selector").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".nv00-gnb").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".gnb-search").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".QSIFeedbackButton").attr({"aria-hidden": true, 'tabindex':-1});
                    $("#spr-live-chat-frame").attr({"aria-hidden": true, 'tabindex':-1});
                    $("#spr-live-chat-app").attr({"aria-hidden": true, 'tabindex':-1});

                    $("a, button").attr({"aria-hidden": true, 'tabindex':-1});
                    $(".layer_popup_wrap a, .layer_popup_wrap button").removeAttr('tabindex');
                    $(".layer_popup_wrap a, .layer_popup_wrap button").removeAttr('aria-hidden');
                    $(".layer_popup_wrap").closest('.aem-GridColumn').attr({"aria-hidden": false});
                    setTimeout(function(){
                        ST_search._var.elem.search.find("#selectCategory").focus();
                    },3000)


                    if ($('#teconsent').length > 0) {
                        $('#teconsent a').attr('aria-hidden', 'true');
                        $('#teconsent a').attr('tabindex', -1);
                    }

                    if ($('.fab[an-tr*="top"]').length > 0) {
                        $('.fab[an-tr*="top"]').attr('aria-hidden', 'true');
                        $('.fab[an-tr*="top"]').attr('tabindex', -1);
                    }

                    if ($('[class*="QSIFeedback"]').length > 0) {
                        $('[class*="QSIFeedback"]').css('z-index', -1);
                        $('[class*="QSIFeedback"]').attr('aria-hidden', 'true');
                    }

                    if ($('[class*="spr-chat__"]').length > 0) {
                        $('[class*="spr-chat__"]').css('z-index', -1);
                        $('[class*="spr-chat__"]').attr('aria-hidden', 'true');
                    }

                    $('html').addClass('feed-none');
				}
			});
		},

		event : function(){
			// 검색기능 레이어팝업 close
			var focusLoopFirstTargetArray = [ $("#countryList li:eq(0) a"), $("#selectCategory , #selectCategoryM"), $("#popSearch"), $('#search h1.logo'), $('#search h1.logo > img') ];

			ST_search._var.elem.btnClose.on({
				"click" : function(e){
					if( ST_search.isMobile() ){
						$("#header , #footer").show();
						$(".cm-g-static-content").siblings(".section").show();
						$(".common-xml-section").show();
                    }

                    $('#searchCategory').find('li').removeClass('active');
                    $('#searchCategory').find('li a').removeAttr('title')
                    $('#searchCategory').find('li:first-child').addClass('active');
                    $('#searchCategory').find('li:first-child a').attr('title', 'selected');
					ST_search._var.elem.search.hide();
					$("body").removeAttr("style");
					ST_search.destroy();
					ST_search._var.elem.supportBtn.focus();
					ST_search._var.layerOpenRequest = false;
                    ST_search._var.elem.search.attr({ "aria-hidden" : "true", "tabindex": "-1"});

                    //p6 accessibility
                    $('.indicator__controls').eq(1).trigger('click');
                    $(".aem-GridColumn").not('.aem-GridColumn.responsivegrid').attr("aria-hidden", false);
                    $(".aem-GridColumn").not('.aem-GridColumn.responsivegrid').removeAttr('tabindex');
                    $(".skip-bar").attr("aria-hidden", false);
                    $(".skip-bar").removeAttr('tabindex');
                    $(".nv00-gnb__inner-wrap").attr("aria-hidden", false);
                    $(".nv00-gnb__inner-wrap").removeAttr('tabindex');
                    $(".footer").attr("aria-hidden", false);
                    $(".footer").removeAttr('tabindex');
                    $("#teconsent").attr("aria-hidden", false);
                    $("#teconsent").removeAttr('tabindex');
                    $(".progress.cm-loader").attr("aria-hidden", false);
                    $(".progress.cm-loader").removeAttr('tabindex');
                    $("#header").attr("aria-hidden", false);
                    $("#header").removeAttr('tabindex');
                    $(".newpar.new.section").attr("aria-hidden", false);
                    $(".newpar.new.section").removeAttr('tabindex');
                    $(".nv16-country-selector").attr("aria-hidden", false);
                    $(".nv16-country-selector").removeAttr('tabindex');
                    $(".nv00-gnb").attr("aria-hidden", false);
                    $(".nv00-gnb").removeAttr('tabindex');
                    $(".gnb-search").attr("aria-hidden", false);
                    $(".gnb-search").removeAttr('tabindex');
                    $(".QSIFeedbackButton").attr("aria-hidden", false);
                    $(".QSIFeedbackButton").removeAttr('tabindex');
                    $("#spr-live-chat-frame").attr("aria-hidden", false);
                    $("#spr-live-chat-frame").removeAttr('tabindex');
                    $("#spr-live-chat-app").attr("aria-hidden", false);
                    $("#spr-live-chat-app").removeAttr('tabindex');


                    $(".layer_popup_wrap").closest('.aem-GridColumn').attr("aria-hidden", false);
                    $("a, button").attr("aria-hidden", false);
                    $("a, button").removeAttr('tabindex');

                    if ($('#teconsent').length > 0) {
                        $('#teconsent a').removeAttr('aria-hidden');
                        $('#teconsent a').removeAttr('tabindex');
                    }

                    if ($('.fab[an-tr*="top"]').length > 0) {
                        $('.fab[an-tr*="top"]').removeAttr('aria-hidden');
                        $('.fab[an-tr*="top"]').removeAttr('tabindex');
                    }

                    if ($('[class*="QSIFeedback"]').length > 0) {
                        $('[class*="QSIFeedback"]').css('z-index', 2000000000);
                        $('[class*="QSIFeedback"]').removeAttr('aria-hidden');
                    }

                    if ($('[class*="spr-chat__"]').length > 0) {
                        $('[class*="spr-chat__"]').css('z-index', 2000000000);
                        $('[class*="spr-chat__"]').removeAttr('aria-hidden');
                    }

                    $('html').removeClass('feed-none');

					e.preventDefault();
				},
				"keydown" : function(e){
					if( e.shiftKey ){
						if( e.which == 9 || e.keyCode == 9 ){

						}
					} else if ( e.which == 9 || e.keyCode == 9 ){
						e.preventDefault();

						$.each(focusLoopFirstTargetArray, function(i,v){
							if( v.is(":visible") ){
								v.focus();
								return false;
							}
						});
						return true;
					}
                    // $('#wrap').removeAttr('aria-hidden');
				},
				"focusin" : function(){
					ST_search._var.elem.selectCategory.attr("title", ST_search._var.data.bridge.find("text > title_openCategory").text()).parent().removeClass("active");
				}
			});

			// "GO BACK" 버튼
			ST_search._var.elem.search.find(".btn_back").on({
				"click" : function(e){
					var _this = $(this);

					// 검색창에서의 back 버튼
					if( _this.parents(".layer_inner").hasClass("search_default") ){
						ST_search.step(1);
						focusLoopFirstTargetArray[0].focus();
					}

					// 검색결과창에서의 back 버튼
					if( _this.parents(".layer_inner").hasClass("search_results") ){
						ST_search.step(2);
						focusLoopFirstTargetArray[1].focus();
					}
					e.preventDefault();
				}
			});

			// 레이어 내 첫번째 clickable요소에 shift + tab 했을 경우 - 닫기 버튼으로 focus 이동
			$.each(focusLoopFirstTargetArray, function(i,v){
				v.on({
					"keydown" : function(e){
						var _this = $(this);

						if( e.shiftKey ){
							if( e.which == 9 || e.keyCode == 9 ){
								e.preventDefault();
								ST_search._var.elem.btnClose.focus();
								return true;
							}
						}
					}
				});
			});

			// 카테고리별 노출
			$(document).on("click", "#categoryList a", function(e){

                $('#categoryList a').removeAttr('title');
			    $(this).attr('title', 'selected');

				var _this	= $(this);
				var _target	= _this.parent();

				if(! _target.hasClass("active")){
					ST_search._var.elem.categoryList.find("li").removeClass("active");
					_target.addClass("active");

					ST_search._var.elem.productList.empty();

					var categoriesId 		= _this.data("categoriesId");
					var internalName		= _this.data("internalName");
					var displayName			= _this.data("displayName");
					//var tv_guideYear		= new Date().getFullYear() - 1;
					var tv_guideYear		= "2017";
					var dataLength			= null;
					var tv_prevGuideText	= ST_search._var.data.bridge.find("text > text_prevGuideYear").text().replace("xxxx", tv_guideYear-1);
					var tv_guideText		= ST_search._var.data.bridge.find("text > text_guideYear").text().replace("xxxx", tv_guideYear);
					var length_tv_curr		= 0;
					var length_tv_prev		= 0;
					var innerHtml = "", innerHtml_tv_curr = "", innerHtml_tv_prev = "", innerHtml_tv_else = "";

					$.each(ST_search._var.data.all, function(i,v){
						if(ST_search._var.data.all[i][categoriesId] != undefined){

							dataLength = ST_search._var.data.all[i][categoriesId].length;

							$.each(ST_search._var.data.all[i][categoriesId], function(j,w){
								var marketingName 	= w.marketingName ? w.marketingName + " / " : "";
								//var targetHtml		= '<li><figure class="img_box"><img src="'+ w.appIconUrl +'" alt=""></figure><div class="info_box"><span class="product_name">'+ marketingName +'</span><span class="product_code">'+ w.modelName +'</span><span class="product_type">'+ w.metadataDisplayName +'</span></div></li>';
								var targetHtml		= '<li role="listitem"><figure class="img_box"><img src="'+ w.appIconUrl +'" alt=""></figure><div class="info_box"><span class="product_name">'+ marketingName + ( ST_search._var.rtl_check ? ( marketingName.length > 0 ? "&rlm;" : "" ) : "") +'</span><span class="product_code">'+ w.modelName +'</span><span class="product_type">'+ w.metadataDisplayName +'</span></div></li>';

								if( internalName == "TV" ){
									var yearDate = w.releaseDate.substr(0,4);
									var targetHtml;

									if( yearDate >= tv_guideYear ){
										innerHtml_tv_curr += targetHtml;
										length_tv_curr ++;
									} else {
										innerHtml_tv_prev += targetHtml;
										length_tv_prev ++;
									}
								} else {
									innerHtml_tv_else += targetHtml;
								}
							});
						}
					});

					innerHtml += 	'<h3 class="product_title">';
					innerHtml +=		'<div class="product_name"><strong tabindex="0">'+ displayName +'</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ dataLength +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</div>';
					innerHtml +=	'</h3>';

					if( internalName == "TV" ){
						innerHtml +=	'<ul class="product_info accodian" role="list">';
						innerHtml +=		'<li role="listitem">';
						innerHtml +=			'<a href="#" role="button" class="model_list" title="open" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:'+ tv_prevGuideText +'_show more" >';
						innerHtml +=				'<div class="year_tit"><strong>'+ tv_prevGuideText + '</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ length_tv_prev +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</div>';
						innerHtml +=			'</a>';
						innerHtml +=			'<div class="model_info" style="display:none;" >';
						innerHtml +=				'<ul class="product_list" role="list">';
						innerHtml +=					innerHtml_tv_prev;
						innerHtml +=				'</ul>';
						innerHtml +=			'</div>';
						innerHtml +=		'</li>';
						innerHtml +=		'<li role="listitem">';
						innerHtml +=			'<a href="#" role="button" class="model_list active" title="close" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:'+ tv_guideText +'_show less" >';
						innerHtml +=				'<div class="year_tit"><strong>'+ tv_guideText + '</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ length_tv_curr +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</div>';
						innerHtml +=			'</a>';
						innerHtml +=			'<div class="model_info ">';
						innerHtml +=				'<ul class="product_list" role="list">';
						innerHtml +=					innerHtml_tv_curr;
						innerHtml +=				'</ul>';
						innerHtml +=			'</div>';
						innerHtml +=		'</li>';
						innerHtml +=	'</ul>';
					} else {
						innerHtml +=	'<ul class="product_info" role="list">';
						innerHtml +=		'<li role="listitem">';
						innerHtml +=			'<div class="model_info ">';
						innerHtml +=				'<ul class="product_list" role="list">';
						innerHtml +=					innerHtml_tv_else;
						innerHtml +=				'</ul>';
						innerHtml +=			'</div>';
						innerHtml +=		'</li>';
						innerHtml +=	'</ul>';
					}

					ST_search._var.elem.productList.addClass("active").append(innerHtml);
					var scrollTarget 	= ST_search._var.sizeMode > 1 ? ST_search._var.elem.searchDefault.find(".product_cont_wrap") : ST_search._var.elem.searchDefault.find(".layer_list_inner");
					var listAreaPos 	= ST_search._var.elem.searchDefault.find(".product_category").outerHeight();
					//listAreaPos 		= ST_search._var.sizeMode > 1 ? listAreaPos : listAreaPos + (117*($(window).width())/720);

					scrollTarget.animate({ scrollTop : listAreaPos }, 500, function(){
						ST_search._var.elem.productList.find(".product_title strong").focus();
					});
				}
				e.preventDefault();
			});

			ST_search._var.elem.productList.on({
				"focusout" : function(){
					ST_search._var.elem.productList.removeAttr("tabindex");
				}
			});

			// 메인 seach 박스의 category list(layer) 클릭 시 --- pc
			$(document).on("click", "#searchCategory a", function(e){

			    $('#searchCategory a').removeAttr('title');
			    $(this).attr('title', 'selected');

				var _this 			= $(this);
				var categoriesId 	= _this.data("categoriesId");
				var internalName	= _this.data("internalName");
				var displayName		= _this.data("displayName");

				ST_search._var.elem.selectCategory.attr({"data-categories-id" : categoriesId, "data-display-name" : displayName }).text(displayName);
				ST_search._var.elem.selectCategoryM.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_" +  displayName.toLowerCase() }).find("option[data-categories-id='"+ categoriesId +"']").prop("selected", true );ST_search._var.elem.selectCategoryM.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_" +  displayName.toLowerCase() }).find("option[data-categories-id='"+ categoriesId +"']").prop("selected", true );
				ST_search._var.elem.searchCategory.find("li").removeClass("active");
				$(this).parent().addClass("active");
				ST_search._var.elem.selectCategory.focus().attr("title", "open categories").parent().removeClass("active");
				e.preventDefault();
			});

			// 메인 seach 박스의 category list(selectbox) 클릭 시 --- mobile
			$(document).on("focusout", "#selectCategoryM", function(e){
				var _target = $(this).parent();
				_target.removeClass("active");
				$(this).attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_open" });
				e.preventDefault();
			});

			$(document).on("click", "#selectCategoryM", function(e){
				if(! ST_search.isMobile() ){
					var _target = $(this).parent();

					if( _target.hasClass("active") ){
						_target.removeClass("active");
						$(this).attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_open" });
					} else {
						_target.addClass("active");
						$(this).attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_close" });
					}
				}
				e.preventDefault();
			});

			$(document).on("change", "#selectCategoryM", function(e){
				var _target 		= $(this).find("option:selected");
				var categoriesId 	= _target.data("categoriesId");
				var internalName	= _target.data("internalName");
				var displayName		= _target.data("displayName");

				ST_search._var.elem.selectCategory.attr({"data-categories-id" : categoriesId, "data-display-name" : displayName }).text(displayName);
				$(this).attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_" +  displayName.toLowerCase() });

				if(! ST_search.isMobile() ){
					setTimeout(function(){
						$(this).parent().removeClass("active");
					}, 100);
				}
				e.preventDefault();
			});



            var isClick = false;
			// 메인, 서브 search keyword 입력 후 검색버튼 클릭 시
			$("[data-role='search01'], [data-role='search02']").on({
				"click" : function(e) {
				    if(!isClick) {
				        console.log("CLICK EVENT");

                        ST_search._var.elem.btnCategoryMore.removeClass("active").parent().hide();
                        ST_search._var.elem.searchCategoryList.hide().removeClass("active").find(".category_list").remove();
                        ST_search._var.elem.searchProductList.empty();

                        var targetInput		= $(this).attr("data-target");
                        var keyword 		= $("[data-role='"+ targetInput +"']").val() || "";
                        var lowerKeyword 	= keyword.toLowerCase();
                        var searchData		= [];
                        var totalLength		= 0;
                        var categoriesId, displayName, innerHtml_prod = "", innerHtml_cate = "";

                        // pc, tablet 버전
                        if(  ST_search._var.sizeMode > 1 ){
                            categoriesId 	= ST_search._var.elem.selectCategory.attr("data-categories-id");
                            displayName 	= ST_search._var.elem.selectCategory.attr("data-display-name");
                        }
                        // mobile 버전
                        else {
                            categoriesId 	= ST_search._var.elem.selectCategoryM.find("option:selected").attr("data-categories-id");
                            displayName 	= ST_search._var.elem.selectCategoryM.find("option:selected").attr("data-display-name");
                        }

                        if( $(this).data("role") == "search01" ){
                            $("[data-role='inputSearchData02']").val(keyword);
                        }

                        if($.trim(keyword) != ""){
                            if( categoriesId == "all" ){
                                $.each(ST_search._var.data.all, function(i,v){
                                    $.each(ST_search._var.data.all[i], function(j,w){
                                        $.each(w, function(k,x){

                                            if( x.marketingName.toLowerCase().indexOf(lowerKeyword) > -1 || x.modelName.toLowerCase().indexOf(lowerKeyword) > -1 || x.metadataDisplayName.toLowerCase().indexOf(lowerKeyword) > -1 || x.displayName.toLowerCase().indexOf(lowerKeyword) > -1 ){

                                                var check = true;

                                                $.each(searchData, function(l,y){
                                                    if( y[x.categoryId] ){
                                                        y[x.categoryId].push(x);
                                                        totalLength ++;
                                                        check = false;
                                                    }
                                                });

                                                if( check ){
                                                    var length = searchData.length;
                                                    searchData[length] = {}
                                                    searchData[length][x.categoryId] = [];
                                                    searchData[length][x.categoryId].push(x);
                                                    totalLength ++;
                                                }
                                            }
                                        });
                                    });
                                });

                                var innerHtmlList = "";

                                /*$.each(searchData, function(i,v){
                                    var key = Object.keys(v);
                                    innerHtmlList += '<li class="swiper-slide" role="listitem"><a href="#" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:search result_'+ v[key][0].displayName.toLowerCase() +'" ><strong>'+ v[key][0].displayName +'</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ v[key].length +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</a></li>'
                                });

                                innerHtml_cate += 	'<div id="category_list_id" class="category_list swiper-container">'
                                innerHtml_cate +=		'<ul class="swiper-wrapper" role="list">'
                                innerHtml_cate +=			'<li class="active swiper-slide" role="listitem"><a href="#" aria-live="polite" title="'+ ST_search._var.data.bridge.find("text > title_selected").text() +'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:search result_'+ ST_search._var.data.bridge.find("text_all").text().toLowerCase() +'" ><strong>'+ ST_search._var.data.bridge.find("text > text_all").text() +'</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ totalLength +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</a></li>'
                                innerHtml_cate +=			innerHtmlList;
                                innerHtml_cate +=		'</ul>'
                                innerHtml_cate +=	'</div>'*/

                                $.each(searchData, function(i,v){
                                    var key = Object.keys(v);
                                    innerHtmlList += '<li class="swiper-slide" role="listitem"><a href="#" role="button" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:search result_'+ v[key][0].displayName.toLowerCase() +'" ><strong>'+ v[key][0].displayName +'</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ v[key].length +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</a></li>'
                                });

                                innerHtml_cate += 	'<div id="category_list_id" class="category_list swiper-container">'
                                innerHtml_cate +=		'<ul class="swiper-wrapper" role="list">'
                                innerHtml_cate +=			'<li class="active swiper-slide" role="listitem"><a href="#" role="button" aria-live="polite" title="'+ ST_search._var.data.bridge.find("text > title_selected").text() +'" data-omni-type="microsite" data-omni="'+ APPS_SITE_CODE +':smartthings:search result_'+ ST_search._var.data.bridge.find("text_all").text().toLowerCase() +'" ></a></li>'
                                innerHtml_cate +=			innerHtmlList;
                                innerHtml_cate +=		'</ul>'
                                innerHtml_cate +=	'</div>'

                                setTimeout(function(){
                                    $('#category_list_id li.active.swiper-slide a').append('<strong>'+ ST_search._var.data.bridge.find("text > text_all").text() +'</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ totalLength +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) )
                                },350)

                            } else {
                                var firstInitCheck = true;

                                $.each(ST_search._var.data.all, function(i,v){
                                    if( v[categoriesId] ){
                                        $.each(v[categoriesId], function(j,w){
                                            if( w.marketingName.toLowerCase().indexOf(lowerKeyword) > -1 || w.modelName.toLowerCase().indexOf(lowerKeyword) > -1 || w.metadataDisplayName.toLowerCase().indexOf(lowerKeyword) > -1 || w.displayName.toLowerCase().indexOf(lowerKeyword) > -1 ){
                                                if( firstInitCheck ){
                                                    searchData[0] 				= {};
                                                    searchData[0][categoriesId] = [];
                                                    firstInitCheck 				= false;
                                                }
                                                searchData[0][categoriesId].push(w);
                                            }
                                        });
                                    }
                                });
                            }
                        }

                        // 검색 결과값이 있을 경우
                        if( searchData.length ) {

                            $.each(searchData, function(i,v){
                                var key = Object.keys(v);
                                var innerHtmlList = "";

                                $.each(v[key], function(j,w){
                                    var marketingName 		= w.marketingName ? w.marketingName + " / " : "";
                                    var modelName 			= w.modelName ? w.modelName : "";
                                    var metadataDisplayName = w.metadataDisplayName ? w.metadataDisplayName : "";
                                    var nameArray			= [marketingName, modelName, metadataDisplayName];

                                    // highlight 처리
                                    $.each(nameArray, function(k,x){
                                        var highlightText;

                                        if( x.toLowerCase().indexOf(lowerKeyword) > -1 ){
                                            ST_search._var.highlightTag.html(x);
                                            ST_search._var.highlightTag.highlight(keyword);
                                            highlightText = ST_search._var.highlightTag.html();
                                            if( k == 0  ){
                                                marketingName = highlightText;
                                            }
                                            else if( k == 1 ){
                                                modelName	= highlightText;
                                            }
                                            else if( k == 2 ){
                                                metadataDisplayName = highlightText;
                                            }
                                        }
                                    });

                                    innerHtmlList += 	'<li role="listitem">'
                                    innerHtmlList +=		'<figure class="img_box"><img src="'+ w.appIconUrl +'" alt=""></figure>'
                                    innerHtmlList +=		'<div class="info_box" alt="'+nameArray[0]+','+nameArray[1]+','+nameArray[2]+'">'
                                    innerHtmlList +=			'<span class="product_name">'+ marketingName +'</span>'
                                    innerHtmlList +=			'<span class="product_name">'+ marketingName + ( ST_search._var.rtl_check ? ( marketingName.length > 0 ? "&rlm;" : "" ) : "") +'</span>'
                                    innerHtmlList +=			'<span class="product_code">'+ modelName +'</span>'
                                    innerHtmlList +=			'<span class="product_type">'+ metadataDisplayName +'</span>'
                                    innerHtmlList +=		'</div>'
                                    innerHtmlList +=	'</li>'
                                });

                                var productName = v[key][0].displayName;
                                if( productName.toLowerCase().indexOf(lowerKeyword) > -1 ){
                                    ST_search._var.highlightTag.html(productName);
                                    ST_search._var.highlightTag.highlight(keyword);
                                    productName = ST_search._var.highlightTag.html();
                                }

                                innerHtml_prod +=  '<div class="product_info">'
                                innerHtml_prod +=		'<h3 class="product_title">'
                                if(i == 0) {
                                    innerHtml_prod +=			'<div class="product_name product_live_title"><strong tabindex="0">'+ productName + '&nbsp;' +( ST_search._var.rtl_check ? "&rlm;(" : "(" ) + v[key].length + ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</strong></div>'
                                } else {
                                    // innerHtml_prod +=			'<div class="product_name"><strong tabindex="0">'+ productName +'</strong>'+ ( ST_search._var.rtl_check ? "&rlm;(" : "(" ) +'<em class="list_num">'+ v[key].length +'</em>'+ ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</div>'
                                    innerHtml_prod +=			'<div class="product_name product_live_title"><strong tabindex="0">'+ productName + '&nbsp;' +( ST_search._var.rtl_check ? "&rlm;(" : "(" ) + v[key].length + ( ST_search._var.rtl_check ? ")&rlm;" : ")" ) +'</strong></div>'
                                }
                                innerHtml_prod +=		'</h3>'
                                innerHtml_prod +=		'<ul class="product_list" role="list">'
                                innerHtml_prod +=			innerHtmlList;
                                innerHtml_prod +=		'</ul>'
                                innerHtml_prod +=  '</div>'
                            });

                            if( categoriesId == "all" ){
                                ST_search._var.elem.searchCategoryList.prepend(innerHtml_cate).show();
                                ST_search.searchCategoryListMore();
                            }
                            //alvin
                            setTimeout(function(){
                                $('#popSearch').focus();
                            },300)
                            //alvin
                        } else { // 검색 결과값이 없을 경우
                            innerHtml_prod += 	'<div class="product_info product_no_data">'
                            innerHtml_prod +=		'<p aria-live="polite"></p>'
                            innerHtml_prod +=	'</div>'

                            setTimeout(function(){
                                if($.trim(keyword) == ""){
                                    $('#searchProductList .product_info.product_no_data p').append(ST_search._var.data.bridge.find("text > text_noKeyword").text());
                                } else {
                                    $('#searchProductList .product_info.product_no_data p').append(ST_search._var.data.bridge.find("text > text_noData").text());
                                }//alvin
                                $('#popSearch').focus();
                                //alvin
                            },300)
                        }

                        ST_search._var.elem.searchProductList.append(innerHtml_prod);
                        $("#searchCategoryName").text(displayName);
                        ST_search._var.highlightTag.empty();
                        ST_search.step(3);
                        setTimeout(function () {
                            ST_search.initSwiper();
                        }, 500);
                        e.preventDefault();

				        isClick = true

                        setTimeout(function() {
                            isClick = false;
                        }, 2000)
                    }
				}
			});

			// search category list 클릭 시
			$(document).on("click", "#selectCategory", function(e){
				var target 	= $(this).parent();
				var idx 	= target.index();

				if(! target.hasClass("active") ){
					target.addClass("active");
					$(this).attr({"title" : ST_search._var.data.bridge.find("text > title_closeCategory").text(), "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_close"});
				} else {
					target.removeClass("active");
					$(this).attr({"title" : ST_search._var.data.bridge.find("text > title_openCategory").text(), "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_open"});
				}
				e.preventDefault();
			});

			// search category list 영역에서 mouseleave 시
			$(document).on("mouseleave", "#searchCategory", function(e){
				ST_search._var.elem.selectCategory.parent().removeClass("active");
				ST_search._var.elem.selectCategory.attr({"title" : ST_search._var.data.bridge.find("text > title_openCategory").text(), "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_open"});
				e.preventDefault();
			});

			// 서브 category list 클릭 시
			$(document).on("click", "#searchCategoryList .category_list a", function(e){
				var target 	= $(this).parent();
				var idx 	= target.index();

				if(! target.hasClass("active") ){
					ST_search._var.elem.searchCategoryList.find("li").removeClass("active").find("a").removeAttr("title");
					$(this).attr("title", ST_search._var.data.bridge.find("text > title_selected").text());
					target.addClass("active");

					if( idx == 0 ){
						ST_search._var.elem.searchProductList.find(".product_info").show();
					} else {
						ST_search._var.elem.searchProductList.find(".product_info").hide().eq(idx-1).show();
					}
				}

				ST_search._var.elem.searchProductList.find(".product_info").eq(idx-1).find(".product_live_title").attr('aria-live', 'polite');
				e.preventDefault();
			});

			// 메인 product list(TV) toggle
			$(document).on("click", ".product_info.accodian li a", function(e){
				var _this 		= $(this);
				var dataOmni	= _this.attr("data-omni");

				if( _this.hasClass("active") ){
					_this.removeClass("active").attr({
						// "title" 	: ST_search._var.data.bridge.find("text > title_openModel").text(),
						"title" 	: 'open',
						"data-omni" : dataOmni.replace("_show less", "_show more")
					});
					_this.next().slideUp();
				} else {
					_this.addClass("active").attr({
						// "title" 	: ST_search._var.data.bridge.find("text > title_closeModel").text(),
						"title" 	: 'close',
						"data-omni" : dataOmni.replace("_show more", "_show less")
					});
					_this.next().slideDown();
				}
				e.preventDefault();
			});

			// 메인 search inputbox enter key
			$("[data-role='inputSearchData01']").on({
				 "keypress" : function(e){
					if (e.keyCode == 13 ) {
						$(this).trigger("click");
						$("[data-role='search01']").trigger("click");
					}
				 },
				 "keyup" : function(){
					$(this).attr({ "data-omni" : "smartthings search_" + $(this).val() });
					$("[data-role='search01'], [data-role='search02'], [data-role='inputSearchData02']").attr({ "data-omni" : "smartthings search_" + $(this).val() });
				 },
				 "focusin" : function(){
					ST_search._var.elem.selectCategory.attr("title", ST_search._var.data.bridge.find("text > title_openCategory").text()).parent().removeClass("active");
				 }
			 });

			// 서브 search inputbox enter key
			$("[data-role='inputSearchData02']").on({
				"keypress" : function(e){
					if (e.keyCode == 13 ) {
						$(this).trigger("click");
						$("[data-role='search02']").trigger("click");
					}
				 },
				 "keyup" : function(){
					$(this).attr({ "data-omni" : "smartthings search_" + $(this).val() });
					$("[data-role='search02']").attr({ "data-omni" : "smartthings search_" + $(this).val() });
				 }
			});

			// "TOP" 버튼
			ST_search._var.elem.btnTop.on({
				"click" : function(e){
					// ST_search._var.elem.search.find("h1.logo").attr("tabindex", 0).focus();
                    ST_search._var.elem.search.find("#popSearch , #selectCategory , #selectCategoryM").focus();
					ST_search._var.elem.scrollTarget.stop().animate({ scrollTop : 0 }, 500, function(){
                        ST_search._var.elem.search.find("#popSearch , #selectCategory , #selectCategoryM").focus();
						// ST_search._var.elem.search.find("h1.logo").attr("tabindex", 0).focus();
					});
					e.preventDefault();
				}
			});

			// backspace 처리
			$(document).on("keydown", function(e){
				if( e.keyCode == 8 ){
					if( ST_search._var.elem.search.is(":visible") && ! ST_search._var.elem.search.find("input[type='text']").is(":focus") ){
						if( ST_search._var.elem.searchDefault.hasClass("active") && ST_search._var.elem.searchDefault.find(".btn_back").is(":visible") ){
							ST_search._var.elem.searchDefault.find(".btn_back").trigger("click");
						} else if( ST_search._var.elem.searchResults.hasClass("active") ){
							ST_search._var.elem.searchResults.find(".btn_back").trigger("click");
						}
					}
				}
			});

			// default 페이지 more 버튼 click
			ST_search._var.elem.btnMore.on({
				"click" : function(e){
					var _this = $(this);
					if( _this.hasClass("active") ){
						_this.removeClass("active");
						ST_search._var.elem.categoryList.removeClass("active");
						_this.text(ST_search._var.data.bridge.find("text > text_more").text());
						_this.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category list_show more" }).focus();
						ST_search._var.elem.categoryList.find("li:gt(15)").hide();
					} else {
						_this.addClass("active");
						ST_search._var.elem.categoryList.addClass("active");
						_this.text(ST_search._var.data.bridge.find("text > text_close").text());
						_this.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category list_show less" });
						ST_search._var.elem.categoryList.find("li").show();
						ST_search._var.elem.categoryList.find("li").eq(16).find("a").focus();
					}
					e.preventDefault();
				}
			});


			// search 페이지 more 버튼 click
			ST_search._var.elem.btnCategoryMore.on({
                "click" : function(e){
					var _this = $(this);
					if( _this.hasClass("active") ){
						_this.removeClass("active");
						ST_search._var.elem.searchCategoryList.removeClass("active");
						_this.text(ST_search._var.data.bridge.find("text > text_more").text());
						_this.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:search result_show more" });
						ST_search._var.elem.searchCategoryList.find("li:gt("+ (ST_search._var.categoryMoreIdx-1) +") a").attr("tabindex", -1);
					} else {
						_this.addClass("active");
						ST_search._var.elem.searchCategoryList.addClass("active");
						_this.text(ST_search._var.data.bridge.find("text > text_close").text());
						_this.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:search result_show less" });
						ST_search._var.elem.searchCategoryList.find("li:gt("+ (ST_search._var.categoryMoreIdx-1) +") a").attr("tabindex", 0);
						ST_search._var.elem.searchCategoryList.find("li:eq("+ (ST_search._var.categoryMoreIdx) +") a").focus();
					}
					e.preventDefault();
				}
			});
		},

		searchCategoryListMore : function(){
			if( ST_search._var.sizeMode > 1 ){
				var checkOffsetTop;
				setTimeout(function(){
					ST_search._var.elem.searchCategoryList.find("li").each(function(i,v){
						var offsetTop = $(this).offset().top;
						if( i == 0 ){
							checkOffsetTop = offsetTop;
						} else {
							if( offsetTop != checkOffsetTop ){
								ST_search._var.elem.btnCategoryMore.parent().show();
								ST_search._var.elem.searchCategoryList.find("li:gt("+ (i-1) +") a").attr("tabindex", -1);
								ST_search._var.categoryMoreIdx = i;
								return false;
							}
						}
					});
				}, 1000);
			} else {
				ST_search._var.elem.searchCategoryList.find("li a").removeAttr("tabindex");
			}
		},

		categoryListMore : function(){
			if( ST_search._var.sizeMode > 1 ){
				ST_search._var.elem.categoryList.find("li a").removeAttr("tabindex");
			} else {
				if( ST_search._var.data.uniqCategories.length > 16 ){
					ST_search._var.elem.btnMore.parent().show();
					ST_search._var.elem.btnMore.removeClass("active").text(ST_search._var.data.bridge.find("text > text_more").text());
					ST_search._var.elem.categoryList.find("li:gt(15)").hide();
				}
			}
		},

		destroy : function(){
			if( ST_search._var.data.bridge.find("global").text() == "Y" ){
				ST_search.step(2);
				ST_search.step(1);
			} else {
				ST_search.step(2);
			}
			ST_search._var.elem.search.find(".layer_inner").removeAttr("tabindex");
			ST_search._var.elem.productList.removeClass("active").empty();
			ST_search._var.elem.selectCategory.text(ST_search._var.data.bridge.find("text > text_allCategory").text()).attr({ "data-categories-id" : "all" }, { "data-display-name" : ST_search._var.data.bridge.find("text > text_allCategory").text() });
			ST_search._var.elem.categoryList.find("li").removeClass("active");
		},

		step : function(i){
            var target 	= ST_search._var.elem.search.find(".layer_inner");

            if(!target.eq(i-1).hasClass('active')) {
                target.find(".layer_list_inner , .product_cont_wrap").scrollTop(0).removeClass("floating");
                target.eq(i-1).siblings().removeClass("active");
                target.eq(i-1).addClass("active");
                ST_search._var.elem.btnTop.removeClass("active");
                ST_search._var.elem.btnTop.attr({'aria-hidden':'true','tabindex':'-1'});
            }

            // if( ST_search.isMobile() != "iphone" ) {
            if( ST_search.isMobile()) {
                setTimeout(function(){
                    $("[data-role='search02']").focus();
                },250)
            }

			if ( i == 1 ){
				target.eq(i).find("input[type='text']").val("");
				ST_search._var.elem.categoryList.empty();
				ST_search._var.elem.searchCategory.empty();
				ST_search._var.elem.productList.removeClass("active").empty();
                ST_search._var.elem.selectCategoryM.find("option:gt(0)").remove();
				ST_search._var.elem.selectCategory.text("All Categories").attr(
                    { "data-categories-id" : "all" },
                    { "data-display-name" : "All Categories" },
                    { "title" : "selected" }
                );
				ST_search._var.elem.btnClose.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:select your country_close" });
				$("[data-role='search01'], [data-role='inputSearchData01'], [data-role='search02'], [data-role='inputSearchData02']").attr({ "data-omni" : "smartthings search_" });
				ST_search._var.data.apps 			= [];
				ST_search._var.data.products 		= [];
				ST_search._var.data.categories 		= [];
				ST_search._var.data.all 			= [];
				ST_search._var.data.uniqCategories 	= [];

			} else if( i == 2 ){
				target.eq(i).find("input[type='text']").val("");
				target.eq(i-1).find("input[type='text']").val("");
				ST_search._var.elem.selectCategoryM.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:category filter_open" }).find("option:eq(0)").prop("selected", true);
				ST_search._var.elem.btnCategoryMore.text(ST_search._var.data.bridge.find("text > text_more").text()).removeClass("active");
				ST_search._var.elem.searchCategoryList.hide().removeClass("active").find(".category_list").remove();
				ST_search._var.elem.btnClose.attr({ "data-omni" : APPS_SITE_CODE + ":smartthings:search for supported devices_close" });
				$("[data-role='search01'], [data-role='inputSearchData01'], [data-role='search02'], [data-role='inputSearchData02']").attr({ "data-omni" : "smartthings search_" });
				ST_search._var.elem.searchProductList.empty();
			} else if ( i == 3 ){

			}
		},

		iosInputDisabledZoom : function(){
			if( ST_search.isMobile() == "iphone" || ST_search.isMobile() == "ipad" ){
				var viewportmeta = document.querySelector('meta[name="viewport"]');
				if( viewportmeta ){
					viewportmeta.content = "width=device-width, initial-scale=1, user-scalable=no";
				}
			}
		},

		rtl_exception : function(){
			if(ST_search._var.sizeMode == 1 && ST_search._var.rtl_check ){
				var target 			= ST_search._var.elem.search.find(".layer_content");
				var headerHeight 	= ST_search._var.elem.search.find(".layer_header").outerHeight();
				var contentHeight 	= $(window).height() - headerHeight;

			   target.css("height",contentHeight);
            }
        },

        swiperChangeEvent: function() {

        },
		resize : function() {
			// window resize 될때 마다 실행
			ST_search.rtl_exception();

			// sizeMode가 변경될때 한번만 실행
			if(ST_search._var.sizeMode != ST_search._var.prevSizeMode) {
				ST_search._var.prevSizeMode = ST_search._var.sizeMode;
				ST_search.categoryListMore();
				ST_search.searchCategoryListMore();

				// scroll 시 검색창 sticky , "TOP" 버튼 toggle
				ST_search._var.elem.scrollTarget = ST_search._var.sizeMode > 1 ? ST_search._var.elem.search.find(".product_cont_wrap") : ST_search._var.elem.search.find(".layer_list_inner");

				ST_search._var.elem.scrollTarget.off("scroll").on("scroll", function(){
					var _this 	= $(this);
					var _target = ST_search._var.sizeMode > 1 ?  _this.parents(".layer_list_inner") : _this;

					if( _this.scrollTop() > 0 ){
						_target.addClass("floating");
						ST_search._var.elem.btnTop.addClass("active");
                        ST_search._var.elem.btnTop.addClass("active");
                        ST_search._var.elem.btnTop.attr({'aria-hidden':'false','tabindex':'0'});
					} else {
						_target.removeClass("floating");
						ST_search._var.elem.btnTop.removeClass("active");
                        ST_search._var.elem.btnTop.removeClass("active");
                        ST_search._var.elem.btnTop.attr({'aria-hidden':'true','tabindex':'-1'});
					}
				});

				if( ST_search._var.sizeMode > 1 && ST_search._var.rtl_check ){
					ST_search._var.elem.search.find(".layer_content").removeAttr("style");
                }
            }

            if ($('html').is('.mobile')) {
                if (window.matchMedia('(orientation: portrait)').matches || window.innerWidth < window.innerHeight) {
                    // Portrait 모드일 때 실행할 스크립트
                    // 폭과 높이가 같으면 Portrait 모드로 인식돼요
                } else {
                    // Landscape 모드일 때 실행할 스크립트
                    $('#categoryList li').removeAttr('style');

                }
            }

		},

		initSwiper: function() {
			$('#category_list_id').addClass("prev-none");
            if(ST_search._var.sizeMode > 1) { // PC
                if(ST_search._var._swiper) {
                    ST_search._var._swiper.destroy();
                    ST_search._var._swiper = undefined;
                    $('.swiper-wrapper').removeAttr('style');
                    $('.swiper-slide').removeAttr('style');
                }

                $(document).find(".swiper-arrow").off('click');
            } else { // 모바일
                if(ST_search._var._swiper) {
                    ST_search._var._swiper.destroy();
                    ST_search._var._swiper = undefined;
                }

                ST_search._var._swiper = new Swiper('#category_list_id', {
                    direction: 'horizontal',
                    slidesPerView: 'auto',
                    freeMode: true,
                    loop: false,
                    mousewheel: false,
                    preventClicks: true,
                    // watchSlidesProgress: true,
                    // slidesOffsetBefore: 10,
                    // slidesOffsetAfter: 70,
                    on: {
                        init: function () {
                            $('#category_list_id').addClass("prev-none");
                            $('#swiper_prev_btn').addClass("disabled");
                            $('#swiper_next_btn').removeClass("disabled");
                        },
                    },
                    keyboard: {
                        enabled: true,
                    }
                });

                var _moveBtn = $(document).find(".swiper-arrow"),
                    _index = 0;

                _moveBtn.on("click", function() {
                    var _movingCheck = $(this).is(".prev") ? true : false,
                        _moveBtnNext = $(document).find(".swiper-arrow.next"),
                        _moveBtnPrev = $(document).find(".swiper-arrow.prev"),
                        _snapGridLength = ST_search._var._swiper.snapGrid.length - 1,
                        _snapIndex = ST_search._var._swiper.snapIndex;

                    if (_movingCheck === true) {
                        _index = _index > 0 ? _index - 1 : 0;
                        ST_search._var._swiper.slideTo(_index);

                        _snapIndex = ST_search._var._swiper.snapIndex;

                        if (_snapIndex === 0) {
							_moveBtnPrev.addClass("disabled");
							$('#category_list_id').addClass("prev-none");
                        }

                        if (_snapIndex < _snapGridLength) {
							_moveBtnNext.removeClass("disabled");
							$('#category_list_id').removeClass("next-none");
                        }
                    } else {
                        _index = _snapGridLength === _index ? _snapGridLength : _index + 1;
                        ST_search._var._swiper.slideTo(_index);
                        _snapIndex = ST_search._var._swiper.snapIndex;

                        if (_snapIndex === _snapGridLength) {
							_moveBtnNext.addClass("disabled");
							$('#category_list_id').addClass("next-none");
                        }

                        if (_snapIndex > 0) {
							_moveBtnPrev.removeClass("disabled");
							$('#category_list_id').removeClass("prev-none");
                        }
                    }
				});

                function changeSwiperArrow() {
                    var _moveBtnNext = $(document).find(".swiper-arrow.next"),
                        _moveBtnPrev = $(document).find(".swiper-arrow.prev");

                    if (ST_search._var._swiper.progress <= 0) {
                        _moveBtnPrev.addClass("disabled");
                        _moveBtnNext.removeClass("disabled");
                        $('#category_list_id').addClass("prev-none");
                    } else if (ST_search._var._swiper.progress >= 0.98) {
                        _moveBtnPrev.removeClass("disabled");
                        _moveBtnNext.addClass("disabled");
                        $('#category_list_id').addClass("next-none");
                    } else {
                        _moveBtnPrev.removeClass("disabled");
                        _moveBtnNext.removeClass("disabled");
                        $('#category_list_id').removeClass("prev-none");
                        $('#category_list_id').removeClass("next-none");
                    }
                }

                ST_search._var._swiper.on('touchEnd', function(e) {
                    changeSwiperArrow();
                });

				ST_search._var._swiper.on('slideChange', function (e) {
                    changeSwiperArrow();
                });

                // $('#category_list_id').find(".swiper-slide > a").on("focusin", function () {
                $('#category_list_id').on("focusin", ".swiper-slide > a", function () {
                    var _idx = $(this).parent().index(),
                        _moveBtnNext = $(document).find(".swiper-arrow.next"),
                        _moveBtnPrev = $(document).find(".swiper-arrow.prev");

                    ST_search._var._swiper.slideTo(_idx);
                    _index = _idx;
                    console.log('focus')
                    // $(this).trigger('click');


                    if (_idx === 0) {
                        _moveBtnPrev.addClass("disabled");
                        _moveBtnNext.removeClass("disabled");
                    } else if (ST_search._var._swiper.snapGrid.length - 1 === _idx) {
                        _moveBtnPrev.removeClass("disabled");
                        _moveBtnNext.addClass("disabled");
                    }
                });
            }
		},

        init : function(){
			$("html").addClass( $("meta[name='sitecode']").attr("content") );
			if(ST_search.isMsie()){
				$("body").addClass("ie");
			}

			if( ST_search.isMobile() == "android" ){
				$("html").addClass("android");
			}

            // this.bridge();
		    this.popup();
		    this.iosInputDisabledZoom();
            $('#swiper_prev_btn').remove();
            $('#swiper_next_btn').remove();

		    $('#searchCategoryList').append('<button type="button" id="swiper_prev_btn" tabindex="-1" aria-hidden="true" class="swiper-arrow prev disabled" data-omni-type="microsite" data-omni="rolling:left arrow">Next</button>');
            $('#searchCategoryList').append('<button type="button" id="swiper_next_btn" tabindex="-1" aria-hidden="true" class="swiper-arrow next" data-omni-type="microsite" data-omni="rolling:right arrow">Previous</button>');
        }
    }

	ST_search.winSizeCheck();

	$(document).ready(function(){
        ST_search.init();
		ST_search.resize();
	});

	$(window).resize(function(){
		ST_search.winSizeCheck();
		ST_search.resize();
	});

})
