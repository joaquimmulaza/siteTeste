(function () {

    ;(function(win,doc,callback){'use strict';callback=callback||function(){};function detach(){if(doc.addEventListener){doc.removeEventListener('DOMContentLoaded',completed);}else{doc.detachEvent('onreadystatechange',completed);}}function completed(){if(doc.addEventListener||event.type==='load'||doc.readyState==='complete'){detach();callback(window,window.jQuery);}}function init(){if (doc.addEventListener){doc.addEventListener('DOMContentLoaded',completed);}else{doc.attachEvent('onreadystatechange',completed);}}init();})(window,document,function(win,$){

        /* each server(live/QA) append css or js */
        var P5_type = document.getElementById("content").getAttribute("data-type") == "mix" ? "mix_p6" : APPS_SERVICE_NAME == "landing" ? "landing" : "service_p6";
        var P5_jsName = {
            "plugins": {
                "live": "apps_plugins"
            },
            "common": {
                "live": "apps_" + P5_type
            }
        };

        function appendScript(name){
            var jsName = P5_jsName[name].live;
            var scriptElem = document.createElement("script");
            scriptElem.src = "//www.samsung.com/samsung/resources/global/apps/js/" + jsName + ".js";
            document.body.appendChild(scriptElem);
        }


        appendScript("plugins");

        var jsLoadCheck = setInterval(function () {
            if (typeof APPS_PLUGIN != "undefined" && APPS_PLUGIN) {
                appendScript("common");
                clearInterval(jsLoadCheck);
            }
        }, 10);
        /* end : each server(live/QA) append css or js */


        /* json mapping */
        if (typeof APPS_JSON_DATA != "undefined") {
            $(".apps, .apps_cr").find("*").each(function () {
                var _this = $(this);

                $.each(this.attributes, function(i, v) {
                    if(this.specified) {
                        if(v.value.indexOf("{{") > -1 || v.name == "data-ng-bind-html") {

                            // {{ }} 형식일 경우
                            if(v.value.indexOf("{{") > -1) {
                                var nonSpaceBracketValue = v.value.replace(/\{|\}/g, '').replace(/^\s+|\s+$/g, ''); // { , } ,공백 제거
                                var jsonValueText;

                                try {
                                    jsonValueText = eval("APPS_JSON_DATA." + nonSpaceBracketValue.replace("apps.", "service."));
                                } catch(error){
                                    jsonValueText = "";
                                }

                                v.value = jsonValueText;
                            }

                            //data-ng-bind-html 형식일 경우
                            if(v.name == "data-ng-bind-html") {
                                var nonSpaceValue = v.value.replace(/^\s+|\s+$/g, ''); // 공백 제거
                                var jsonHtmlText;

                                try {
                                    jsonHtmlText = eval("APPS_JSON_DATA." + nonSpaceValue.replace("apps.", "service."));
                                } catch(error){
                                    jsonHtmlText = "";
                                }

                                _this.html(jsonHtmlText);
                            }
                        }
                    }
                });
            });
        }
        /* end : json mapping */

    });

})();

