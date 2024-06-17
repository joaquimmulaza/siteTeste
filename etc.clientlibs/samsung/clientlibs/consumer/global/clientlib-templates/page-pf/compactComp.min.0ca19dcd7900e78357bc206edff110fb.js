(() => {
  const $q = window.sg.common.$q;
  const selector = {
    section: '.notification-bar',
  };
  
  class NotificationBar {
    constructor(component) {
      this.selector = {
        section: selector.section,
        btn: '.notification-bar__toggle-btn',
        hidden: '.notification-bar__toggle-btn .hidden',
        content: '.notification-bar__inner',
        nomarl: '.notification-bar__column--collapsed',
        expend: '.notification-bar__column--expanded',
      };
      
      this.timer = null;
      this.ele = {
        window: $q(window),
        section: $q(component),
        btn: null,
        content: null,
        nomarl: null,
        expand: null,
      };

      this.handler = {
        resize: () => {
          this.ele.section.css({
            'height': '',
          });

          if (this.timer) {
            clearTimeout(this.timer);
          }
          setTimeout(() => {
            this.setHeight();
          }, 400);
        },
      };

      this.setProperty();

      NotificationBar.instances.set(component, this);

      this.init();
    }
    
    setProperty() {
      this.ele.btn = this.ele.section.find(this.selector.btn);
      this.ele.hidden = this.ele.section.find(this.selector.hidden);
      this.ele.content = this.ele.section.find(this.selector.content);
      this.ele.pdBanner = this.ele.section.find(this.selector.pdBanner);
      this.ele.nomarl = this.ele.section.find(this.selector.nomarl);
      this.ele.expand = this.ele.section.find(this.selector.expend);
    }

    init() {
      this.bindEvents();
    }

    reInit() {
      this.setProperty();
      this.bindEvents();
    }

    setHeight() {
      this.ele.section.css({
        'height': `${this.ele.content.outerHeight()}px`,
      });
    }

    bindEvents() {
      this.ele.btn.off('click').on('click', () => {
        if (this.ele.section.hasClass('is-expanded')) {
          this.closeBanner();
        } else {
          this.openBanner();
        }
      });

      this.ele.window.off('resize', this.handler.resize).on('resize', this.handler.resize);

      this.setHeight();
    }

    openBanner() {
      this.ele.section.addClass('is-expanded');
      this.ele.section.attr('aria-expanded', true);
      this.ele.nomarl.hide();
      this.ele.expand.show();
      this.ele.hidden.innerHTML('Click to Collapse');
      this.setHeight();
    }

    closeBanner() {
      this.ele.section.removeClass('is-expanded');
      this.ele.section.attr('aria-expanded', false);
      this.ele.nomarl.show();
      this.ele.expand.hide();
      this.ele.hidden.innerHTML('Click to Expand');
      this.setHeight();
    }
  }

  function init() {
    $q(selector.section).target.forEach((element) => {
      if (!NotificationBar.instances.has(element)) {
        new NotificationBar(element);
      }
    });
  }
  
  function reInit() {
    $q(selector.section).target.forEach((element) => {
      if (NotificationBar.instances.has(element)) {
        const instances =  NotificationBar.instances.get(element);
        instances.reInit();
      } else {
        new NotificationBar(element);
      }
    });
  }

  function closeBanner(motion = true) {
    $q(selector.section).target.forEach((element) => {
      if (NotificationBar.instances.has(element)) {
        const instances =  NotificationBar.instances.get(element);
        instances.closeBanner(motion);
      }
    });
  }

  NotificationBar.instances = new WeakMap();

  window.sg.components.notificationBar = { 
    init,
    reInit,
    closeBanner,
  };

  $q.ready(init);
})();


(() => {
  const $q = window.sg.common.$q;
  const BREAKPOINTS = window.sg.common.constants.BREAKPOINTS;
  const utils = window.sg.common.utils;
  const lazyLoad = window.sg.common.lazyLoad;
  const KEYCODE = window.sg.common.constants.KEY_CODE;

  const selector = {
    component: '.where-to-buy',
    container: '.where-to-buy__container.layer-popup',
    tabItem: '.where-to-buy__tab-item button',
    tabPanelOnline: '.where-to-buy__online',
    tabPanelOffline: '.where-to-buy__locator',
    tabPanels: '.where-to-buy__tabpanels div[role="tabpanel"]',
    showMore: '.where-to-buy__store-more-cta',
    onlineListWrap: '.where-to-buy__store-list',
    onlineListItem: '.where-to-buy__store-item',
    distanceBtn: '.where-to-buy__distance-button',
    resultList: '.where-to-buy__result-content:not(.where-to-buy__result-content--disabled)',
    storeDetail: '.where-to-buy__detail',
    backStoreList: '.where-to-buy__detail-close',
    storeListArea: '.where-to-buy__result',
    storeListInner: '.where-to-buy__result-list',
    storeHeader: '.where-to-buy__result-top',
    layerCloseBtn: '.where-to-buy__content > .layer-popup__close',
    layerDim: '.layer-popup-dim',
    activeClsTop: 'where-to-buy__result--top',
    activeClsMiddle: 'where-to-buy__result--middle',
    activeClsBottom: 'where-to-buy__result--bottom',
    activeClsActive: 'where-to-buy__result--active',
    nearbyPop: '.where-to-buy__layer--nearby',
    nearbyPopClose: '.where-to-buy__layer--nearby .layer-popup__close, .where-to-buy__layer--nearby .cta--cancel',
    displayItem: 'display-item',
    isSelected: 'is-selected',
    isActive: 'is-active',
  };

  const el = {
    window: null,
    component: null,
  };

  class WhereToBuy {
    constructor(component) {
      this.el = {
        window: $q(window),
        component: $q(component),
        container: null,
        tabItem: null,
        tabPanelOnline: null,
        tabPanelOffline: null,
        showMore: null,
        onlineListWrap: null,
        onlineListItem: null,
        distanceBtn: null,
        resultList: null,
        storeDetail: null,
        storeHeader: null,
        backStoreList: null,
        storeListArea: null,
        storeListInner: null,
        layerCloseBtn: null,
        layerDim: null,
        isMoving: null,
        activeList: null,
        moveStartY: null,
        curPosition: null,
        closeFocus: null,
        nearbyPop: null,
        nearbyPopClose: null,
      };

      this.handler = {
        resize: this.resize.bind(this),
        slideMoveStart: this.slideMoveStart.bind(this),
        slideMoving: this.slideMoving.bind(this),
        slideMoveEnd: this.slideMoveEnd.bind(this),
        showPopup: this.showPopup.bind(this),
        closePopup: this.closePopup.bind(this),
        focusInnerPopup: (event) => {
          if (event.keyCode === KEYCODE.TAB) {
            if (this.matches(document.activeElement, '.layer-popup__inner') && event.shiftKey) {
              $q(document.activeElement).find('.layer-popup__close').focus();
            } else if (this.matches(document.activeElement, '.layer-popup__close') && event.shiftKey === false) {
              $q(document.activeElement).closest('.layer-popup__inner').focus();
            }
          }
        },
        focusShopDetail: (event) => {
          if (event.keyCode === KEYCODE.TAB) {
            requestAnimationFrame(() => {
              const $wrap = $q(document.activeElement).closest('.where-to-buy__detail');
              if ($wrap.target.length === 0) {
                const $detail = this.el.container.find('.where-to-buy__detail');
                if (event.shiftKey) {
                  const $focusAble = $detail.find('a, button');
                  $focusAble.eq($focusAble.target.length - 1).focus();
                } else {
                  $detail.focus();
                }
              }
            });
          }
        },
      };

      WhereToBuy.instances.set(component, this);

      this.setElement();

      this.init();
    }

    init() {
      this.bindEvents();

      this.resize();
    }

    reInit() {
      this.setElement();

      this.bindEvents();

      this.resize();
    }

    setElement() {
      this.el.container =  this.el.component.find(selector.container);
      this.el.tabItem = this.el.component.find(selector.tabItem);
      this.el.tabPanelOnline = this.el.component.find(selector.tabPanelOnline);
      this.el.tabPanelOffline = this.el.component.find(selector.tabPanelOffline);
      this.el.tabPanels = this.el.component.find(selector.tabPanels);
      this.el.showMore = this.el.component.find(selector.showMore);
      this.el.onlineListWrap = this.el.component.find(selector.onlineListWrap);
      this.el.onlineListItem = this.el.component.find(selector.onlineListItem);
      this.el.distanceBtn = this.el.component.find(selector.distanceBtn);
      this.el.resultList = this.el.component.find(selector.resultList);
      this.el.storeDetail = this.el.component.find(selector.storeDetail);
      this.el.storeHeader = this.el.component.find(selector.storeHeader);
      this.el.backStoreList = this.el.component.find(selector.backStoreList);
      this.el.storeListArea = this.el.component.find(selector.storeListArea);
      this.el.storeListInner = this.el.component.find(selector.storeListInner);
      this.el.layerCloseBtn = this.el.component.find(selector.layerCloseBtn);
      this.el.layerDim = this.el.component.find(selector.layerDim);
      this.el.nearbyPop = this.el.component.find(selector.nearbyPop);
      this.el.nearbyPopClose = this.el.component.find(selector.nearbyPopClose);
      this.el.isMoving = false;
      this.desktopFlag = false;
      this.mobileFlag = false;
      this.closeFocus = this.closeFocus || null;
    }

    activeTab(idx) {
      this.el.tabItem.removeClass(selector.isSelected);
      this.el.tabItem.eq(idx).addClass(selector.isSelected);
      
      this.el.tabPanels.removeClass(selector.isActive);
      this.el.tabPanels.eq(idx).addClass(selector.isActive);
    }

    showMoreItem() {
      const activeItem = [];
      let endCnt = 6;

      this.el.onlineListItem.target.forEach((item) => {
        const $item = $q(item);

        if ($item.css('display') === 'none') {
          activeItem.push($item);
        }
      });

      if (activeItem.length < endCnt) {
        endCnt = activeItem.length;
      }

      for (let i = 0; i < endCnt; i++) {
        activeItem[i].addClass(selector.displayItem);
      }

      if (this.el.onlineListItem.eq(this.el.onlineListItem.target.length - 1).hasClass(selector.displayItem)) {
        this.el.showMore.hide();
      }

      const movePos = this.el.component.find('.where-to-buy__store').target[0].scrollHeight - this.el.component.find('.where-to-buy__online-contents').height();
      this.el.component.find('.where-to-buy__online-contents').moveScroll(movePos, 200);
    }

    activeDistance(item) {
      const addSpan = '<span class="hidden">selected</span>';

      this.el.distanceBtn.removeClass(selector.isSelected);
      // this.el.distanceBtn.attr('aria-selected', false);
      item.addClass(selector.isSelected);
      // item.attr('aria-selected', true);

      this.el.distanceBtn.find('.hidden').remove();
      item.append(addSpan);
    }

    activeStoreList(item) {
      this.el.storeDetail.show();
      this.el.storeDetail.attr('tabindex', 0);
      this.el.storeDetail.focus();

      setTimeout(() => {
        this.resetClass(this.el.storeListArea);
        this.el.storeListArea.addClass(selector.activeClsMiddle);
      }, 200);

      this.el.activeList = item;
    }

    backStoreList() {
      this.el.storeDetail.removeAttr('tabindex');
      this.el.storeDetail.hide();
      this.el.activeList.focus();
    }

    slideMoveStart(e) {
      this.el.moveStartY = e.clientY ? e.clientY : e.changedTouches[0].pageY;
      this.el.curPosition = parseInt(this.el.storeListArea.css('top').replace('px', '')) || this.el.storeListArea.target[0].getBoundingClientRect().top - this.el.tabPanelOffline.target[0].getBoundingClientRect().top;
      this.el.isMoving = true;

      window.addEventListener('mousemove',this.handler.slideMoving,{ passive: false });
      this.el.window.on('mouseup', this.handler.slideMoveEnd);
      window.addEventListener('touchmove',this.handler.slideMoving,{ passive: false });
      this.el.window.on('touchend', this.handler.slideMoveEnd);
    }

    slideMoving(e) {
      if (this.el.isMoving) {
        const distance = (e.clientY ? e.clientY : e.changedTouches[0].pageY) - this.el.moveStartY;
        this.el.curPosition = this.el.curPosition + distance;

        this.resetClass(this.el.storeListArea);

        this.el.storeListInner.show();

        this.el.storeListArea.css({
          'top': `${this.el.curPosition}px`,
        });

        this.el.storeListArea.addClass(selector.activeClsActive);

        this.el.moveStartY = this.el.moveStartY + distance;
      }
      e.preventDefault();
    }

    slideMoveEnd() {
      const areaHeight = this.el.component.find('.where-to-buy__locator').height();
      const areadivMin = areaHeight / 3;
      const areadivMax = areaHeight - areadivMin;
      let positionCls;

      this.el.isMoving = null;
      this.el.moveStartY = 0;
      this.el.curPosition = parseInt(this.el.storeListArea.css('top').replace('px', '')) || null;

      if (this.el.curPosition === null) {
        return;
      }

      this.el.storeListArea.css({
        'top': '',
      });

      this.el.storeListArea.removeClass(selector.activeClsActive);

      if (this.el.curPosition < areadivMin) {
        positionCls = selector.activeClsTop;
      } else if (this.el.curPosition > areadivMax) {
        positionCls = selector.activeClsBottom;
        
        setTimeout(() => {
          this.el.storeListInner.hide();
        },200);
      } else {
        positionCls = selector.activeClsMiddle;
      }

      this.el.storeListArea.addClass(positionCls);

      window.removeEventListener('mousemove',this.handler.slideMoving);
      this.el.window.off('mouseup', this.handler.slideMoveEnd);
      window.removeEventListener('touchmove',this.handler.slideMoving);
      this.el.window.off('touchend', this.handler.slideMoveEnd);
    }

    resetClass(item) {
      [selector.activeClsTop, selector.activeClsMiddle, selector.activeClsBottom].forEach((cls) => {
        item.removeClass(cls);
      });
    }

    closeLayer() {
      this.el.layerDim.hide();
      this.el.container.hide();
    }

    showPopup(btn) {
      this.el.container.show();
      this.el.layerDim.show();

      utils.hiddenScroll();
      this.el.component.setLayerFocus(selector.container, selector.layerCloseBtn);
      const $innerPopup = this.moveFocusInnerPopup();
      if ($innerPopup === null) {
        window.sg.common.utils.setMobileFocusLoop(this.el.component.target[0]);
      }
      this.closeFocus = btn;
    }

    moveFocusInnerPopup(){
      let $innerPopup = null;

      this.el.container.find('.where-to-buy__locator.is-active').find('.where-to-buy__layer--gbs, .where-to-buy__layer--nearby').target.forEach((pop) => {
        if(pop.style.display === 'block'){
          $innerPopup = $q(pop).find('.layer-popup__inner');
          $innerPopup.focus();
        }
      });

      if($innerPopup !== null && $innerPopup.target.length > 0){
        window.sg.common.utils.removeMobileFocusLoop();
        window.sg.common.utils.setMobileFocusLoop($innerPopup.target[0]);
        return $innerPopup.target[0];
      } else {
        return null;
      }
    }

    closePopup(btn = null) {
      const btnEl = btn === null ? this.closeFocus : btn;
      utils.visibleScroll();
      this.el.component.offLayerFocus();
      window.sg.common.utils.removeMobileFocusLoop();
      this.closeLayer();
      this.originFocus(btnEl);
    }

    originFocus(backBtn = null) {
      if (backBtn !== null) {
        backBtn.focus();
      }
    }

    resize() {
      if (BREAKPOINTS.MOBILE > utils.getViewPort().width) {
        if (utils.getViewPort().width > utils.getViewPort().height) {
          this.el.component.addClass('mode--landscape');
        } else {
          this.el.component.removeClass('mode--landscape');
        }
        if (this.mobileFlag === false) {
          this.mobileFlag = true;
          this.desktopFlag = false;

          // drag event(store list)
          this.el.storeHeader.target.forEach((item) => {
            const $item = $q(item);

            $item.on('mousedown', this.handler.slideMoveStart);
            $item.on('touchstart', this.handler.slideMoveStart);
          });

          this.resetClass(this.el.storeListArea);
        }
      } else {
        this.el.component.removeClass('mode--landscape');
        if (this.desktopFlag === false) {
          this.desktopFlag = true;
          this.mobileFlag = false;

          this.el.storeHeader.target.forEach((item) => {
            const $item = $q(item);
    
            $item.off('mousedown', this.handler.slideMoveStart);
            $item.off('touchstart', this.handler.slideMoveStart);
          });

          this.el.storeListInner.show();

          this.resetClass(this.el.storeListArea);
        }
      }
    }

    matches(el, selector) {
      return (el.matches ? el.matches(selector) : el.msMatchesSelector(selector));
    }

    bindEvents() {
      $q(window).off('resize', this.handler.resize).on('resize', this.handler.resize);

      // tab active
      this.el.tabItem.target.forEach((item, idx) => {
        const $item = $q(item);

        $item.off('click').on('click', () => {
          this.activeTab(idx);
          this.moveFocusInnerPopup();
        });
      });

      // show more
      this.el.showMore.target.forEach((item) => {
        const $item = $q(item);

        $item.off('click').on('click', () => {
          this.showMoreItem();
        });
      });

      // distance active
      this.el.distanceBtn.target.forEach((item) => {
        const $item = $q(item);

        // if ($item.hasClass(selector.isSelected)) {
        //   $item.attr('aria-selected', true);
        // } else {
        //   $item.attr('aria-selected', false);
        // }

        $item.off('click').on('click', () => {
          this.activeDistance($item);
        });
      });

      // offline store active
      this.el.resultList.target.forEach((item) => {
        const $item = $q(item);

        $item.off('click').on('click', () => {
          if (!$item.hasClass('new-window')) {
            this.activeStoreList($item);
          }
        });
      });

      // back store list
      this.el.backStoreList.target.forEach((item) => {
        const $item = $q(item);

        $item.off('click').on('click', () => {
          this.backStoreList();
        });
      });

      // popup close
      this.el.nearbyPopClose.off('click').on('click', () => {
        this.el.nearbyPop.hide();

        window.sg.common.utils.removeMobileFocusLoop();
        window.sg.common.utils.setMobileFocusLoop(this.el.component.target[0]);

        this.el.distanceBtn.target.forEach((item) => {
          const $item = $q(item);

          if ($item.hasClass('is-selected')) {
            $item.focus();
          }
        });
      });

      this.el.layerCloseBtn.on('click', () => {
        this.closePopup();
      });

      //inner Popup focus lock
      this.el.container.find('.where-to-buy__locator').find('.where-to-buy__layer--gbs, .where-to-buy__layer--nearby').find('.layer-popup__inner')
        .attr('tabindex', 0)
        .off('keydown', this.handler.focusInnerPopup)
        .on('keydown', this.handler.focusInnerPopup);

      this.el.container.find('.where-to-buy__detail')
        .off('keydown', this.handler.focusShopDetail)
        .on('keydown', this.handler.focusShopDetail);
    }
  }

  const init = () => {
    el.window = $q(window);
    el.component = $q(selector.component);

    if (!el.component.target.length) {
      return;
    }

    lazyLoad.setLazyLoad();

    $q(selector.component).target.forEach((element) => {
      if (!WhereToBuy.instances.has(element)) {
        new WhereToBuy(element);
      }
    });
  };

  const reInit = () => {
    lazyLoad.setLazyLoad();
    
    $q(selector.component).target.forEach((element) => {
      if (WhereToBuy.instances.has(element)) {
        const instances =  WhereToBuy.instances.get(element);
        instances.reInit();
      } else {
        new WhereToBuy(element);
      }
    });
  };

  WhereToBuy.instances = new WeakMap();

  function showPopup(closeEl) {
    $q(selector.component).target.forEach((element) => {
      if (!WhereToBuy.instances.has(element)) {
        new WhereToBuy(element).showPopup(closeEl);
      } else {
        WhereToBuy.instances.get(element).showPopup(closeEl);
      }
    });
  }


  function closePopup(closeEl) {
    $q(selector.component).target.forEach((element) => {
      if (!WhereToBuy.instances.has(element)) {
        new WhereToBuy(element).closePopup(closeEl);
      } else {
        WhereToBuy.instances.get(element).closePopup(closeEl);
      }
    });
  }

  $q.ready(init);

  window.sg.components.whereToBuy = {
    init,
    reInit,
    showPopup,
    closePopup,
  };
})();

(function (win, $) {
	'use strict';
	
	/**
	 * 1. Where To Buy 버튼 class에 'js-cta-buy'를 넣어 주세요. 
	 *   -. P5에서는 js-cta-buy, js-cta-buy-etc 국가 분기에 따라 혼용해서 사용하였는데, 'js-cta-buy' 만 넣으시면 됩니다.
	 *   -. Local WTB ps-widget, cci-trigger-overlay class는 별도 선언 하지 않아도 됩니다.
	 * 2. 적용 attribute (하위 4개 다 넣어주어도 무관함.)
	 *    -. data-modelcode
	 *    -. data-iacode
	 *    -. data-title  (at / ch / ch_fr / de ) 에 사용
	 *    -. data-img-src (at / ch / ch_fr / de ) 에 사용
	 *    위 4개의 attribute를  WTB CTA에 넣어 주시고, 기존에 사용한던 data-sku, data-productcode, ps-sku 등은 넣지 않아도 됩니다.
	 * 3. 페이지 로드 된 후에 JavaScript에서 WTB 버튼을 화면에 넣은 경우(비동기 호출)에는 
	 *    window.smg.wtb.common.reInit(); 함수를 호출 해 주세요.
	 *    종전에 ca/ca_fr 에서 사용하던 PriceSpider.rebind()는 별도로 호출 하실 필요 없습니다.
	 * 4. 각 국가별 외부 WTB를 사용하기 위한 Script 선언은 페이지에서 하셔야 합니다. (pd/pf/search page 참고)
	 */
	
	if('undefined' === typeof win.smg) {
		win.smg = {};
	}
	
	var wtb = win.smg.wtb = win.smg.wtb || {};
	
	wtb.initData = {
			nodePath 				: $("#current_node_path").val(),
			d_modelCode 			: $("#current_model_code").val(),
			d_categorySubTypeCode	: $("#wtb-categorySubTypeCode").val(),
			buyinstoreRedirectYN 	: $("#buyinstoreRedirectYN").val(),
			bvConversationFlag 		: $("#bvConversationFlag").val(),
			bvConversationRTLFlag 	: $("#bvConversationRTLFlag").val(),
			channelCampaignTag		: "N", // 실제 WTB 클릭시 campaign tag (tag=WTBwidget) 를 넣어서 호출 변경위함
			placedWtbResources 		: false,
			useNewWtbFlag 			: $("#useNewWtb").val(),
			distanceUnitValue 		: "",
			modelCodeValue 			: "",
			rtlValue 				: $("#rtlValue").val(),
			apiChangeStockStatus	: "",
			useWtbStockFunction		: ""
	}
	
	wtb.common = (function() {
		return {
			reInit : function() {
				rebindWtbBtn();
			}
		}
	})();
	
	function rebindWtbBtn() {
		var siteCode = $("#siteCode").val();
		
		$(".js-cta-buy, .js-cta-buy-etc").each(function(){
			if(siteCode === 'ca' || siteCode === 'ca_fr') {
				$(this).addClass("ps-widget");
				$(this).attr("ps-sku", $(this).data("modelcode"));
				PriceSpider.rebind();
			}
			
			if(siteCode === "de") {
				/*|| (siteCode === "de" && "010" !== $(this).attr("data-iacode").substring(0,3))*/
				$(this).addClass("cci-trigger-overlay");
				$(this).attr("data-sku", $(this).data("modelcode"));
				$(this).attr("data-productcode", $(this).data("modelcode"));
			}
		});
		
	}
	
	function _init() {
		rebindWtbBtn();
		wtb.bak.init();
	}
	
	$(function () {
		_init();
	});
	
})(window, window.jQuery);
(function (win, $) {
	'use strict';
	
	win.smg = win.smg || {};
	var wtb = win.smg.wtb = win.smg.wtb || {};
	
	wtb.bak = (function() {
		return {
			init : function() {
				callWtb();
			},	
			
			reInit : function() {
				window.sg.components.whereToBuy.reInit();
			}
		}
		
	})();
	
	function callWtb() {
		var initData = win.smg.wtb.initData;
		
	    //offline store set cookie
	    function setOffStoreCookie(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + ((exdays || 0) * 24 * 60 * 60 * 1000));
			document.cookie = cname + '=' + cvalue + '; expires=' + d.toUTCString();
		};
		
		//offline store get cookie
		function  getOffStoreCookie(cname) {
			var name = cname + '=',
				ca = document.cookie.split(';'),
				c;

			for(var i=0, leng=ca.length; i<leng; i++) {
				c = ca[i];
				while (c.charAt(0)===' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) !== -1) {
					return c.substring(name.length,c.length);
				}
			}
			return '';
		};
		

		//offline store list 
		var getOffStoreList = function(jsonData) {
			$('#store-list').html("");
			var totalStoreCount = jsonData.common.storesCount;
			var storesData = jsonData.stores;
			var geoInfoData = jsonData.geoInfo;
			$(".where-to-buy__container .where-to-buy__result-count").text(totalStoreCount);
			if(totalStoreCount !== 0) {
				for (var ii = 0; ii < totalStoreCount; ii++) {
					var storeList = "";
				
					storeList += 
						'<li class="where-to-buy__result-item" role="listitem">' + 
							'<a href="javascript:;" class="where-to-buy__result-content ';
							var storeClass = ""; 
							var brandType ="";
							var storeName = storesData[ii].name;
							if(storesData[ii].cityName != null) {
								storeName += " " + storesData[ii].cityName;
							}
								if(storesData[ii].brandTypeCode === 'E') {
									storeClass = "type--experience";
									brandType = "E";
								}else if(storesData[ii].brandTypeCode === 'B') {
									storeClass = "type--brand";
									brandType = "B";
								}else if(storesData[ii].brandTypeCode === 'O') {
									storeClass = "type--other";
									brandType = "O";
								}
					storeList += storeClass + '" role="button"' + 
					            'an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-detail view" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+'">' +
								'<div class="where-to-buy__result-info" data-store-id="'+ storesData[ii].id +'">' + 
									'<p class="where-to-buy__result-type">';
					/* SVG Icon 추가 */
					storeList += '<svg class="icon icon--store-experience" focusable="false" aria-hidden="true">' +
								'<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#pin-experience-i"></use>' +
								'</svg>' +
								'<svg class="icon icon--store-brand" focusable="false" aria-hidden="true">' +
								'<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#pin-brand-i"></use>' +
								'</svg>' +
								'<svg class="icon icon--store" focusable="false" aria-hidden="true">' +
								'<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#pin-other-i"></use>' +
								'</svg>';
									if(brandType === "E") {
										storeList += Granite.I18n.get("Samsung Experience Stores");
									}else if(brandType === "B") {
										storeList += Granite.I18n.get("Samsung Brand Store");
									}else if(brandType === "O") {
										storeList += Granite.I18n.get("Other Store");
									}
					/* SVG Icon 추가 */
					storeList += '<svg class="icon icon--next" focusable="false" aria-hidden="true">' +
		                        '<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#next-bold"></use>' +
		                        '</svg>';
					storeList += '</p>';
					
					storeList += '<p class="where-to-buy__result-name">'+ storesData[ii].name;
									if (storesData[ii].cityName != null) {
										storeList += 
										'<span class="where-to-buy__locator__store-city">'+ ' '+storesData[ii].cityName +'</span></p>';
									}																											
					storeList += '<p class="where-to-buy__result-distance">'+ storesData[ii].distance + initData.distanceUnitValue +'</p>' +
									'<input type="hidden" class="lat" value="'+ storesData[ii].latitude +'">' +
									'<input type="hidden" class="long" value="'+ storesData[ii].longitude +'">' + 
									'<input type="hidden" class="storeId" value="'+ storesData[ii].id +'">' + 
									'<input type="hidden" class="storeindex" value="'+ (ii+1) +'">' + 
									'<input type="hidden" id="markerlatitude_'+ (ii+1) +'" value="'+ storesData[ii].latitude +'">'+
									'<input type="hidden" id="markerlongitude_'+ (ii+1) +'" value="'+ storesData[ii].longitude +'">'+	
									'<input type="hidden" id="markerlongitude_'+ (ii+1) +'" value="'+ storesData[ii].longitude +'">'+
									'<input type="hidden" id="markerbrandtype_'+ (ii+1) +'" value="'+ brandType +'">'+
								'</div>'  +
									'</a>' + 
									'</li>';	
					$('#store-list').append(storeList);
				}
				if(geoInfoData) {
					$("#maxLat").val(geoInfoData.maxLatitude);
					$("#minLat").val(geoInfoData.minLatitude);
					$("#maxLong").val(geoInfoData.maxLongitude);
					$("#minLong").val(geoInfoData.minLongitude);
					$("#store-list li:eq(0)>a").addClass("is-active");
				}
			}
			if(totalStoreCount === 0) {
				$("#store_list_nullYn").val("Y");
				$("#stroelength").val("0");
			}else{
				$("#store_list_nullYn").val("N");
				$("#stroelength").val(totalStoreCount);
			}							
		}
		
		//hatch offlinestore data
		var getHatchOffStoreList = function(jsonData) {
			$('#store-list').html("");
			var totalStoreCount = jsonData.locations.length;
			var storesData = jsonData.locations;
			var geoInfoData = jsonData.geoInfo;
			
			$(".where-to-buy__container .where-to-buy__result-count").text(totalStoreCount);
			if(totalStoreCount !== 0) {
				for (var ii = 0; ii < totalStoreCount; ii++) {
					var initNum = 0;
					var hatchDistance = "";
					if(initData.distanceUnitValue == "Km"){
						hatchDistance = (parseFloat(storesData[ii].distance)/1000).toFixed(2);
					}else if(initData.distanceUnitValue == "Mile"){
						hatchDistance = (parseFloat(storesData[ii].distance)/1609.344).toFixed(2);
					}
					
					var storeList = "";
				
					storeList += 
						'<li class="where-to-buy__result-item" role="listitem">' + 
							'<a href="javascript:;" class="where-to-buy__result-content ';
							var storeClass = ""; 
							var brandType ="";
							var storeName = "";
							if(storesData[ii].name != null && storesData[ii].name != ""){
								storeName = storesData[ii].name;
							}					
								if(storesData[ii].storeTypes == '1_ses') {
									storeClass = "type--experience";
									brandType = "E";
								}else if(storesData[ii].storeTypes == '2_sbs') {
									storeClass = "type--brand";
									brandType = "B";
								}else if(storesData[ii].storeTypes == '3_retailer_store' || storesData[ii].storeTypes == null) {
									storeClass = "type--other";
									brandType = "O";
								}
					storeList += storeClass + '" role="button"' + 
					            'an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-detail view" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+'">' +
								'<div class="where-to-buy__result-info" data-store-id="'+ storesData[ii].searchableId +'">' + 
									'<p class="where-to-buy__result-type">';
					/* SVG Icon 추가 */
					storeList += '<svg class="icon icon--store-experience" focusable="false" aria-hidden="true">' +
								'<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#pin-experience-i"></use>' +
								'</svg>' +
								'<svg class="icon icon--store-brand" focusable="false" aria-hidden="true">' +
								'<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#pin-brand-i"></use>' +
								'</svg>' +
								'<svg class="icon icon--store" focusable="false" aria-hidden="true">' +
								'<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#pin-other-i"></use>' +
								'</svg>';
									if(brandType === "E") {
										storeList += Granite.I18n.get("Samsung Experience Stores");
									}else if(brandType === "B") {
										storeList += Granite.I18n.get("Samsung Brand Store");
									}else if(brandType === "O") {
										storeList += Granite.I18n.get("Other Store");
									}
					/* SVG Icon 추가 */
					storeList += '<svg class="icon icon--next" focusable="false" aria-hidden="true">' +
		                        '<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#next-bold"></use>' +
		                        '</svg>';
					storeList += '</p>';
					
					storeList += '<p class="where-to-buy__result-name">'+ storeName;
									if (storesData[ii].locality != null && storesData[ii].locality != "") {
										storeList += 
										'<span class="where-to-buy__locator__store-city">'+ ' '+storesData[ii].locality +'</span></p>';
									}																											
					storeList += '<p class="where-to-buy__result-distance">'+ hatchDistance + initData.distanceUnitValue +'</p>' +
									'<input type="hidden" class="lat" value="'+ storesData[ii].coordinates.latitude +'">' +
									'<input type="hidden" class="long" value="'+ storesData[ii].coordinates.longitude +'">' + 
									'<input type="hidden" class="storeId" value="'+ storesData[ii].searchableId +'">' + 
									'<input type="hidden" class="storeindex" value="'+ (ii+1) +'">' + 
									'<input type="hidden" id="markerlatitude_'+ (ii+1) +'" value="'+ storesData[ii].coordinates.latitude +'">'+
									'<input type="hidden" id="markerlongitude_'+ (ii+1) +'" value="'+ storesData[ii].coordinates.longitude +'">'+	
									'<input type="hidden" id="markerbrandtype_'+ (ii+1) +'" value="'+ brandType +'">'+
								'</div>'  +
									'</a>' + 
									'</li>';	
					$('#store-list').append(storeList);
				}
			}
			if(totalStoreCount === 0) {
				$("#store_list_nullYn").val("Y");
				$("#stroelength").val("0");
			}else{
				$("#store_list_nullYn").val("N");
				$("#stroelength").val(totalStoreCount);
			}							
		}
		
		//offline store map 

	    var setMapData = function(infowindow, target, offStoreMap, markerlist) {
	    	var hatchOffstoreUse = $("#hatchOffstoreUse").val();
            var currentIndex = target.attr("labelContent");
            var currentStoreId = $("#store-list li:eq("+(currentIndex-1)+") .storeId").val();		                  
            var offDeatilSearchDomain = $("#searchApiDomain").val() + '/' + $("#apiStageInfo").val() + '/b2c/storelocator/detail';
            
            var siteCd = $("#siteCode").val();
			var distanceUnit = $("#offstoreDistanceUnit").val();
			var latitude = $("#offstoreLatitude").val();
            var longitude = $("#offstoreLongitude").val();
			var param = {
				"siteCode":siteCd,
				"latitude":latitude,
        		"longitude":longitude,
        		"distanceUnit":distanceUnit,
        		"storeId":currentStoreId
        		}
			
			if(hatchOffstoreUse != 'Y'){
				$.ajax({
					type: "GET",						
					url: offDeatilSearchDomain,
					data : param,
					async:false,
					success: function (data) {
						var storeData = data.response.resultData.storeDetail; 
						var storeName = storeData.name;
						if(storeData.cityName != null) {
							storeName +=  ' ' + storeData.cityName;
						}
						var context = "";
	                    context += '<div class="where-to-buy__map-tooltip">'+
	                    				'<p class="where-to-buy__map-store-name">'+
	                    					'<button type="button" class="store-arr2" an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-detail view" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+'">'+storeName;
	                    		context += 	'</button>' + 
	                    				'</p>';
	                    		if((storeData.phone != null && storeData.phone !== "") || (storeData.email != null && storeData.email !== "")) {						                    				                    				
	                    context += 		'<ul class="where-to-buy__map-info-list">';
	                    			if (storeData.phone != null && storeData.phone !== "") {
	                    				context +=
	                    					'<li class="where-to-buy__map-info-item">'+
                								'<a href="tel:'+storeData.phone+'" class="where-to-buy__map-info-link icon-tel" title="Call '+storeData.phone+'"' +
                								'an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+':call">'+storeData.phone+
                								  /* SVG Icon 추가 */
                								  '<svg class="icon icon--tel" focusable="false" aria-hidden="true"><use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#call-bold"></use></svg>' +
                								'</a>'+
                							'</li>';
									}
	                    			if (storeData.email != null && storeData.email !== "") {
	                    				context +=
	                    					'<li class="where-to-buy__map-info-item">'+
                								'<a href="mailto:'+storeData.email+'" class="where-to-buy__map-info-link icon-mail" title="Mail to '+storeData.email+'"' +
                								'an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+':email">'+storeData.email+'</a>'+
                							'</li>';
									}
	                    context += 		'</ul>';
	                    		}
	                    context += 		'<input class="ly_brandType" value="'+storeData.brandType+'" type="hidden">'+
	                    				'<input class="lat" type="hidden" value="'+storeData.latitude+'"/>'+
	                    				'<input class="long" type="hidden" value="'+storeData.longitude+'"/>'+
	                    				'<input id="detail-index" type="hidden" value="'+currentIndex+'">'+
	                    				'<input id="currentStoreId" type="hidden" value="'+currentStoreId+'">'+
	                    			'</div>';						                    						                    					
	                    $("#tv-experience-layer").html(context); 
	                    infowindow.setContent( ""+ context ) ;
	                    infowindow.open(offStoreMap, markerlist);		
	                    $('.where-to-buy__result-content').removeClass('is-active');
	                    $('#store-list li:eq('+(currentIndex-1)+') .where-to-buy__result-content').addClass('is-active');
	                    $(".where-to-buy__result-content").eq(currentIndex-1).focus();
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
					}
				});	
			}else{							
				var hatchOffstoreUrl = $("#hatchOffstoreUrl").val();
				var hatchOffstoreBrandID =  $("#hatchOffstoreBrandID").val();
				var hatchOffstoreRegion = $("#hatchOffstoreRegion").val();
				var hatchOffstoreLang = $("#hatchOffstoreLang").val();
				var offHatchDomain = hatchOffstoreUrl + hatchOffstoreBrandID + "/geo/list";			
				var offHatchnRadius = $("button.where-to-buy__distance-button.is-selected").attr("data-value");
				if(initData.distanceUnitValue == "Mile"){
					offHatchnRadius = offHatchnRadius*1609.344;
				}else{
					offHatchnRadius = offHatchnRadius*1000;
				}			
				var modelCode = "";
				if ($("#selectModelCode").val() == null || $("#selectModelCode").val() === undefined || $("#selectModelCode").val() === "" ) {
					modelCode = $("#current_model_code").val();
				}else{
					modelCode = $("#selectModelCode").val();
				}
				var hatchParam = "";
				if(hatchOffstoreLang != "" && hatchOffstoreLang != null){
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"segment": hatchOffstoreLang,
						"filters":[
							{
							  "columnName": "searchableId",
							  "operation": "equal",
							  "value": [currentStoreId]
							  }
						]
					};
				}else{
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"filters":[
							{
							"columnName": "searchableId",
							  "operation": "equal",
							  "value": [currentStoreId]
							  }
						]
					};
				}
				
				$.ajax({
					headers: {
						"Content-Type": "application/json",
						//"Cookie" : "icl_opt_out=true"
					},
					type: "POST",						
					url: offHatchDomain,
					data: JSON.stringify(hatchParam),
					cache: true,
					timeout: 20000,
					success: function (data) {
						var storeData = data.locations[0];	
						var storeName = "";
						if(storeData.name != null && storeData.name != ""){
							storeName = storeData.name;
						}					
						if(storeData.locality != null && storeData.locality != "") {
							storeName	+= ' ' + storeData.locality;	
						}
						var brandType ="";
						if(storeData.storeTypes == '1_ses') {
							brandType = "E";
						}else if(storeData.storeTypes == '2_sbs') {
							brandType = "B";
						}else{
							brandType = "O";
						}
						
						var context = "";
	                    context += '<div class="where-to-buy__map-tooltip">'+
	                    				'<p class="where-to-buy__map-store-name">'+
	                    					'<button type="button" class="store-arr2" an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-detail view" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+'">'+storeName;
	                    		context += 	'</button>' + 
	                    				'</p>';
	                    		if((storeData.telephone != null && storeData.telephone !== "") || (storeData.email != null && storeData.email !== "")) {						                    				                    				
	                    context += 		'<ul class="where-to-buy__map-info-list">';
	                    			if (storeData.telephone != null && storeData.telephone !== "") {
	                    				context +=
	                    					'<li class="where-to-buy__map-info-item">'+
                								'<a href="tel:'+storeData.telephone+'" class="where-to-buy__map-info-link icon-tel" title="Call '+storeData.telephone+'"' +
                								'an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+':call">'+storeData.telephone+
                								  
                								  '<svg class="icon icon--tel" focusable="false" aria-hidden="true"><use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#call-bold"></use></svg>' +
                								'</a>'+
                							'</li>';
									}
	                    			if (storeData.email != null && storeData.email !== "") {
	                    				context +=
	                    					'<li class="where-to-buy__map-info-item">'+
                								'<a href="mailto:'+storeData.email+'" class="where-to-buy__map-info-link icon-mail" title="Mail to '+storeData.email+'"' +
                								'an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeName+':email">'+storeData.email+'</a>'+
                							'</li>';
									}
	                    context += 		'</ul>';
	                    		}
	                    context += 		'<input class="ly_brandType" value="'+brandType+'" type="hidden">'+
	                    				'<input class="lat" type="hidden" value="'+storeData.coordinates.latitude+'"/>'+
	                    				'<input class="long" type="hidden" value="'+storeData.coordinates.longitude+'"/>'+
	                    				'<input id="detail-index" type="hidden" value="'+currentIndex+'">'+
	                    				'<input id="currentStoreId" type="hidden" value="'+currentStoreId+'">'+
	                    			'</div>';						                    						                    					
	                    $("#tv-experience-layer").html(context); 
	                    infowindow.setContent( ""+ context ) ;
	                    infowindow.open(offStoreMap, markerlist);		
	                    $('.where-to-buy__result-content').removeClass('is-active');
	                    $('#store-list li:eq('+(currentIndex-1)+') .where-to-buy__result-content').addClass('is-active');
	                    $(".where-to-buy__result-content").eq(currentIndex-1).focus();
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
					}
				});
			}
	    }
	    
		var markers = [];
	    var initMap = function (latitude, longitude, gpsNRadius) {			    	
			var defaultLocation = new google.maps.LatLng(latitude, longitude);
			var offStoreMap;			    
	        var nRadius;
	        var nRadiusTemp = $("button.where-to-buy__distance-button.is-selected").attr("data-value");
	        if(nRadiusTemp) {
	        	nRadius = nRadiusTemp;
	        } else {
	        	if(gpsNRadius === 'Y') {
	        		nRadius = 5;		        	
			    } else {
			    	nRadius = 10;
			    }	
	        }
	        
	        var zoomSet = 15;

	        if(parseInt(nRadius) <= 1) {
	        	zoomSet = 15;
	        }else if(parseInt(nRadius) > 1 && parseInt(nRadius) <= 2) {
	        	zoomSet = 14;
	        }else if(parseInt(nRadius) > 2 && parseInt(nRadius) <= 5) {
	        	zoomSet = 13;
	        }else if(parseInt(nRadius) > 5 && parseInt(nRadius) <= 10) {
	        	zoomSet = 12;
	        }else if(parseInt(nRadius) > 10 && parseInt(nRadius) <= 25) {
	        	zoomSet = 11;
	        }else if (parseInt(nRadius) > 25 && parseInt(nRadius) <= 50) {
	        	zoomSet = 10;
	        }else if (parseInt(nRadius) > 50) {
	        	zoomSet = 9;
	        }
	        
	        var controlPosition = rtlValue === "Y" ? google.maps.ControlPosition.LEFT_TOP : google.maps.ControlPosition.RIGHT_TOP;
	        
	        var mapOptions = {
	        		scaleControl: true,
	                scaleControlOptions: {
	                    position: google.maps.ControlPosition.BOTTOM_CENTER
	                },
	                mapTypeControl: false,
	                panControl: true,
	                panControlOptions : {
	                    position: controlPosition
	                },
	                zoomControl: true,
	                zoomControlOptions: {
	                    style: google.maps.ZoomControlStyle.SMALL,
	                    position: controlPosition
	                },
	                streetViewControl: true,
	                streetViewControlOptions: {
	                    position: controlPosition
	                },
	              center: defaultLocation,		             
	              zoom: zoomSet,		             
	              mapTypeId: google.maps.MapTypeId.ROADMAP
	            };
	        			        
	        offStoreMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	        
	        var gpsMarker = "";
	        var circle = "";
	        if(getOffStoreCookie("newwtb_offstore") == 'true'){
	        	gpsMarker = new google.maps.Marker({
	        		position: defaultLocation,
	                map: offStoreMap,
	                icon : {
                        	scaledSize: new google.maps.Size(50, 50),
	                		origin: new google.maps.Point(0,0), 
	                        anchor: new google.maps.Point(0,0)
	                     }
	                });    
	                 
	        	circle = new google.maps.Circle({
	        		map: null
	        	});
	                 
	        	circle = new google.maps.Circle({
	        		map: offStoreMap,
	        		center : defaultLocation,
	        		radius: 5000, 
	        		fillColor: '#AA0000', 
	        		strokeColor :'#AA0000', 
	        		strokeOpacity:0 
	        	});

	        }
	        
	        var infowindow = new google.maps.InfoWindow();
	        
	        $('#store-list').children('li').each(function(index) {
	        	var indexData = index+1;
	    	    var markerlatitude = Number($("#markerlatitude_"+indexData).val());
	    	    var markerlongitude = Number($("#markerlongitude_"+indexData).val());
	            var marklistLocation = new google.maps.LatLng(markerlatitude, markerlongitude);
	            
	            var labelNum = 0;
	            labelNum += indexData;
	            
	    	    var markerlist;
	    	    
	    	    var imageIconUrl = "";
	    	    var markerType = $("#markerbrandtype_"+indexData).val();
	    	  
	    	    if(markerType === "E") {
	    	    	imageIconUrl = "/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/icon-pin-experience.svg";
	    	    }else if(markerType === "B") {
	    	    	imageIconUrl = "/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/icon-pin-brand.svg";
	    	    }else if(markerType === "O") {
	    	    	imageIconUrl = "/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/icon-pin-other.svg";
	    	    }		    	   
	    	    
	    	    markerlist = new google.maps.Marker({
	    			position: marklistLocation,
	    			labelContent: ''+labelNum,
	    			map: offStoreMap,
	    			icon : {
	    		    	    url: imageIconUrl, 
	    		    	    origin: new google.maps.Point(0,0), 
	    		    	    anchor: new google.maps.Point(0,0), 
	    		    	    scaledSize: new google.maps.Size(60, 60)
    	    	    }
	    		});
	    	    		  	    
	    	    markers[labelNum] = markerlist;
	    	    
	    	    var	openWindowFn = function() {
                    if (infowindow) {
                        infowindow.close();
                    }
                    setMapData(infowindow, $(this), offStoreMap, markerlist);                    		                    
            	}
	    	    markerlist.addListener('click', function() {		    	    	
	    	    	offStoreMap.setCenter(markerlist.getPosition());
	            });
	            google.maps.event.clearListeners(markerlist, 'click');
	            google.maps.event.addListener(markerlist, 'click', openWindowFn);				          			            
	        });	
	        
	        $('.where-to-buy__container .where-to-buy__result-content').on('click', function () {	
            	var indexValue = $(this).find(".storeindex").val();
	            google.maps.event.trigger(markers[indexValue], 'click');
	        });		       
	    }	
	    

		//call offlines store v2 api(default)
		var getStorelocatorDefault = function() {
			var hatchOffstoreUse = $("#hatchOffstoreUse").val();
			var offSearchDomain = $("#searchApiDomain").val() + '/' + $("#apiStageInfo").val() + '/b2c/storelocator/list';
			var latitude = $("#offstoreLatitude").val();
			var longitude = $("#offstoreLongitude").val();
			var siteCd = $("#siteCode").val();				
			var distanceUnit = $("#offstoreDistanceUnit").val();
			var nRadius ='';
			var nRadiusTemp = $(".where-to-buy__container button.where-to-buy__distance-button.is-selected").attr("data-value");
			var distanceText ='';
			var selectedHtml ='';
			if(nRadiusTemp != null) {
	        	nRadius = nRadiusTemp;
			}else if(siteCd == 'ae' || siteCd == 'ae_ar'){
				nRadius = 1;
				$(".where-to-buy__container button.where-to-buy__distance-button[data-value='1']").addClass("is-selected");
				distanceText = $(".where-to-buy__container button.where-to-buy__distance-button[data-value='1']").text();
				selectedHtml = distanceText+'<span class="hidden">selected</span>';
				$(".where-to-buy__container button.where-to-buy__distance-button[data-value='1']").html(selectedHtml);
			}else{
				nRadius = 10;
				$(".where-to-buy__container button.where-to-buy__distance-button[data-value='10']").addClass("is-selected");
                distanceText = $(".where-to-buy__container button.where-to-buy__distance-button[data-value='10']").text();
				selectedHtml = distanceText+'<span class="hidden">selected</span>';
				$(".where-to-buy__container button.where-to-buy__distance-button[data-value='10']").html(selectedHtml);
			}	
			
			var modelCode = "";
			if ($("#selectModelCode").val() == null || $("#selectModelCode").val() === undefined || $("#selectModelCode").val() === "" ) {
				modelCode = $("#current_model_code").val();
			}else{
				modelCode = $("#selectModelCode").val();
			}
			var iaCode = $("#categoryInfo").val();
			
			var param = {
        			"siteCode":siteCd,
        			"latitude":latitude,
        			"longitude":longitude,
        			"distanceUnit":distanceUnit,
        			"nRadius":nRadius,
        			"modelCode":modelCode,
        			"iaCode" : iaCode
        		};
			
			if(hatchOffstoreUse == 'Y'){
				var hatchOffstoreUrl = $("#hatchOffstoreUrl").val();
				var hatchOffstoreBrandID =  $("#hatchOffstoreBrandID").val();
				var hatchOffstoreRegion = $("#hatchOffstoreRegion").val();
				var hatchOffstoreLang = $("#hatchOffstoreLang").val();
				var offHatchDomain = hatchOffstoreUrl + hatchOffstoreBrandID + "/geo/list";
				var offHatchnRadius = "";
				var offHatchIacode = [];
				var offHatchTypecode = iaCode.substr(0,2) + "000000";
				var offHatchSubTypecode = iaCode.substr(0,4) + "0000";						
				offHatchIacode.push(offHatchTypecode);
				offHatchIacode.push(offHatchSubTypecode);	
				
				if(initData.distanceUnitValue == "Mile"){
					offHatchnRadius = nRadius*1609.344;
				}else{
					offHatchnRadius = nRadius*1000;
				}
				var hatchParam = "";
				if(hatchOffstoreLang != "" && hatchOffstoreLang != null){
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"segment": hatchOffstoreLang,
						"filters":[
							{
							 "columnName": "productTags",
							 "operation": "equal",
							 "value": offHatchIacode
							}
						]
					};
				}else{
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"filters":[
							{
							 "columnName": "productTags",
							 "operation": "equal",
							 "value": offHatchIacode
							}
						]
					};
				}
				$.ajax({
					headers: {
						"Content-Type": "application/json",
						//"Cookie" : "icl_opt_out=true"
					},
					type: "POST",						
					url: offHatchDomain,
					data: JSON.stringify(hatchParam),
					cache: true,
					timeout: 20000,
					success: function (data) {			
						getHatchOffStoreList(data);	
						initMap(latitude, longitude, "N");
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
					},
					complete: function() {
						wtb.bak.reInit();
					}
				});
			}else{
				$.ajax({						
					type: "GET",						
					url: offSearchDomain,
        			data : param,
        			async:false,
        			success: function (data) {														
						getOffStoreList(data.response.resultData);	
						initMap(latitude, longitude, "N");
        			},
        			error: function(XMLHttpRequest, textStatus, errorThrown) {
        			},
        			complete: function() {
        				wtb.bak.reInit();
				}
			});
			}
		}
		

		//call offline store v2 api		
		var getStorelocator = function(latitude, longitude, gpsNRadius) {
			var hatchOffstoreUse = $("#hatchOffstoreUse").val();
			var offSearchDomain = $("#searchApiDomain").val() + '/' + $("#apiStageInfo").val() + '/b2c/storelocator/list';
			var siteCd = $("#siteCode").val();				
			var distanceUnit = $("#offstoreDistanceUnit").val();
			var nRadius ='';
			var nRadiusTemp = $("button.where-to-buy__distance-button.is-selected").attr("data-value");
			var distanceText ='';
			var selectedHtml ='';
			if(nRadiusTemp) {
	        	nRadius = nRadiusTemp;
	        }else {
	        	if(gpsNRadius === 'Y' && siteCd != 'ae') {
	        		nRadius = 5;
					$(".where-to-buy__container button.where-to-buy__distance-button[data-value='5']").addClass("is-selected");
					distanceText = $(".where-to-buy__container button.where-to-buy__distance-button[data-value='5']").text();
					selectedHtml = distanceText+'<span class="hidden">selected</span>';
					$(".where-to-buy__container button.where-to-buy__distance-button[data-value='5']").html(selectedHtml);
	        	}else if(siteCd == 'ae' || siteCd == 'ae_ar'){
					nRadius = 1;
					$(".where-to-buy__container button.where-to-buy__distance-button[data-value='1']").addClass("is-selected");
					distanceText = $(".where-to-buy__container button.where-to-buy__distance-button[data-value='1']").text();
					selectedHtml = distanceText+'<span class="hidden">selected</span>';
					$(".where-to-buy__container button.where-to-buy__distance-button[data-value='1']").html(selectedHtml);
				}else{
	        		nRadius = 10;
					$(".where-to-buy__container button.where-to-buy__distance-button[data-value='10']").addClass("is-selected");
					distanceText = $(".where-to-buy__container button.where-to-buy__distance-button[data-value='10']").text();
					selectedHtml = distanceText+'<span class="hidden">selected</span>';
					$(".where-to-buy__container button.where-to-buy__distance-button[data-value='10']").html(selectedHtml);
	        	}	
	        }
			
			var modelCode = "";
			if ($("#selectModelCode").val() == null || $("#selectModelCode").val() === undefined || $("#selectModelCode").val() === "" ) {
				modelCode = $("#current_model_code").val();
			}else{
				modelCode = $("#selectModelCode").val();
			}				
			var iaCode = $("#categoryInfo").val();
			
			var param = {
        			"siteCode":siteCd,
        			"latitude":latitude,
        			"longitude":longitude,
        			"distanceUnit":distanceUnit,
        			"nRadius":nRadius,
        			"modelCode":modelCode,
        			"iaCode" : iaCode
        		};
							
			if(hatchOffstoreUse == 'Y'){
				var hatchOffstoreUrl = $("#hatchOffstoreUrl").val();
				var hatchOffstoreBrandID =  $("#hatchOffstoreBrandID").val();
				var hatchOffstoreRegion = $("#hatchOffstoreRegion").val();
				var hatchOffstoreLang = $("#hatchOffstoreLang").val();
				var offHatchDomain = hatchOffstoreUrl + hatchOffstoreBrandID + "/geo/list";
				var offHatchIacode = [];
				var offHatchTypecode = iaCode.substr(0,2) + "000000";		
				var offHatchSubTypecode = iaCode.substr(0,4) + "0000";	
				var offHatchnRadius = nRadius*1000; 
				var offHatchnRadius = "";
				if(initData.distanceUnitValue == "Mile"){
					offHatchnRadius = nRadius*1609.344;
				}else{
					offHatchnRadius = nRadius*1000;
				}
							
				offHatchIacode.push(offHatchTypecode);
				offHatchIacode.push(offHatchSubTypecode);	
				
				var hatchParam = "";
				if(hatchOffstoreLang != "" && hatchOffstoreLang != null){
					hatchParam = {
							"countryCode":hatchOffstoreRegion,
							"geoCenterArea": {
								"center": {
									"latitude":latitude,
									"longitude":longitude
								},
								"distance":offHatchnRadius
							},
							"product":modelCode,
							"segment": hatchOffstoreLang,
							"filters":[
								{
								 "columnName": "productTags",
								 "operation": "equal",
								 "value": offHatchIacode
								}
							]
						};
				}else{
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"filters":[
							{
							 "columnName": "productTags",					 
							 "operation": "equal",
							 "value": offHatchIacode
							}
						]
					};
				}
				
					
				$.ajax({
					headers: {
						"Content-Type": "application/json",
						//"Cookie" : "icl_opt_out=true"
					},
					type: "POST",						
					url: offHatchDomain,
					data: JSON.stringify(hatchParam),
					cache: true,
					timeout: 20000,
					success: function (data) {
						getHatchOffStoreList(data);	
						initMap(latitude, longitude, gpsNRadius);	
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
					},
					complete: function() {
						wtb.bak.reInit();
					}
				});
			}else{
				$.ajax({
					type: "GET",						
					url: offSearchDomain,
					data : param,
					async:false,
					success: function (data) {													
						getOffStoreList(data.response.resultData);
						initMap(latitude, longitude, gpsNRadius);	
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
					},
					complete: function() {
						wtb.bak.reInit();
					}
				});
			}
		}
		
		
		//offline store get gps info
		var setGeoLocation = function(jsonData) {
			
			function handleGeolocationError() {
			//Error
				console.warn('ERROR');
			}
			
			function geolocateByIP() {
				$.getJSON('http://freegeoip.net/json/?callback=?').then(handleGeolocationResult, handleGeolocationError);
				return;
			}
			
			function handleGeolocationDenyResult(err) {
				//console.warn('ERROR(' + err.code + '): ' + err.message);
				setOffStoreCookie("newwtb_offstore","false",5);
				getStorelocatorDefault();
			}				
	
			function handleGeolocationResult(location) {
				//Modernizr.geolocation might come true still when the user rejects the geolocation, so we are better off using hasOwnProperty.
				var lat = typeof location.coords !== 'undefined' ? location.coords.latitude : location.latitude,
					lng = typeof location.coords !== 'undefined' ? location.coords.longitude : location.longitude;
				
				if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
					var latitude = $("#offstoreLatitude").val();
					var longitude = $("#offstoreLongitude").val();
					getStorelocator(latitude,longitude, "N");
				} else {
					$("#offstoreLatitude").val(lat);
					$("#offstoreLongitude").val(lng);
					getStorelocator(lat, lng, "Y");
				}
			}
			
			function geolocateUser(coarseGrainedCallback) {
			
				if(navigator.geolocation) { // geolocation이 지원하는 브라우져
					navigator.geolocation.getCurrentPosition(handleGeolocationResult, handleGeolocationDenyResult);
					return;
				} else if (coarseGrainedCallback) { // geolocation이 지원하지않는 브라우져
					geolocateByIP();
				}
			}
			
			geolocateUser(true);
		}
		
		
		
		//offline store check gps cookie
		var offStoreCookieCheck = function() {
			var cookieCheck ="";
			if(getOffStoreCookie("newwtb_offstore") != null && getOffStoreCookie("newwtb_offstore") !== '') {
				cookieCheck = getOffStoreCookie("newwtb_offstore");
				if(cookieCheck === 'true') {
					setGeoLocation();
				}else{
					var latitude = $("#offstoreLatitude").val();
					var longitude = $("#offstoreLongitude").val();
					getStorelocator(latitude,longitude, "N");
				}
			}else{
				getStorelocatorDefault();
				layerOpen('.where-to-buy__container .where-to-buy__layer--gbs');
			}
		};
		
		var getWtbData = function(wtbPath) {
			
			var siteCode = $("#siteCode").val();

			var drawLocatorBtn = function() {
				//uk, it, fr, za, in만  Search Store 영역 노출
				if(siteCode === 'uk' || siteCode === 'it' || siteCode === 'fr' || siteCode === 'za' || siteCode === 'in' || siteCode === 'tr') {
					$(".where-to-buy__container .where-to-buy__search").show();
				}
			};
			var drawMoreBtn = function() {
				var onlinstore = $(".where-to-buy__store");
				var onlinstorelistlength = $(".where-to-buy__store-list a.where-to-buy__store-link").length;
				if(onlinstore.hasClass("where-to-buy__column--4")) {
					if(onlinstorelistlength > 12) {
						$(".where-to-buy__container .where-to-buy__store-more-cta").show();
					}
				}else{
					if(onlinstorelistlength > 6) {
						$(".where-to-buy__container .where-to-buy__store-more-cta").show();
					}
				}
			};
			var drawReviews = function() {
				if("Y" === $("#bvFlag").val() || "Y" === $("#bvRTLFlag").val() || "Y" === $("#aplautYn").val()) {
					var ratings = 0;
					var reviewCount = 0;
					if($("#ratingsValue").val()) {
						ratings = parseFloat($("#ratingsValue").val()).toFixed(1);
					}
					if($("#reviewCountValue").val()) {
						reviewCount = parseFloat($("#reviewCountValue").val() || "0");
					}
					
					var ratingsHtml = "";
					var ratingPointHtml = "";
					var reviewCountHtml = "";
					var fullStarRatings = Math.floor(ratings);
					var starWidth = parseInt((ratings-fullStarRatings)*100);
					
					for(var k=0; k<fullStarRatings; k++) {
						ratingsHtml += '<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 100%;"></span></span>';
					}			
					if(fullStarRatings<5) {
						ratingsHtml += '<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: '+starWidth+'%;"></span></span>';
					}
					for(var l = 4; l > fullStarRatings; l--) {
						ratingsHtml += '<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>';
					}
					ratingPointHtml += '<span class="hidden">Product Ratings : </span><span>'+ratings+'</span>';
					reviewCountHtml += '(<span class="hidden">Number of Ratings :</span><span>'+reviewCount+'</span>)';
					
					$(".where-to-buy__container .where-to-buy__product-rating .rating__star-list").html(ratingsHtml);
					$(".where-to-buy__container .where-to-buy__product-rating .rating__point").html(ratingPointHtml);
					$(".where-to-buy__container .where-to-buy__product-rating .rating__review-count").html(reviewCountHtml);	
					
					if(ratings === 0 && reviewCount === 0) {
						$(".where-to-buy__container .where-to-buy__product-info .where-to-buy__product-rating .rating").addClass("rating--empty");
					}
				}
			};
			
			$.ajax({
				type: "GET",						
				url: wtbPath,
				async:false,
				success: function (data) {
					$(".where-to-buy").html(data);
					$(".where-to-buy__container.layer-popup [an-tr]").each(function(){
					    $(this).attr("an-tr", $(this).attr("an-tr").replace("{{pageTrack}}", digitalData.page.pageInfo.pageTrack));
					});
					
					initData.modelCodeValue = $("#wtbModelCode").val();
					var distanceUnit = $("#offstoreDistanceUnit").val();
					if(distanceUnit === "3959") {
						initData.distanceUnitValue = "Mile";
					}else{
						initData.distanceUnitValue = "Km";
					}
					
					var etaleYn = $("#etailinUrlYn").val();
					var onlineStoreUse = $("#onlineUse").val();
					var offlineStoreUse = $("#inStoreUse").val();
					var instoreIAFlag = $("#instoreIAFlag").val(); //N일 때 offlinstore 미사용 카테고리임 default는 Y
					var onlineRetailorsSize = $("#wtbOnlineRetailorsSize").val();
					var buyonlineDisplayYn = $("#wtbOnlineStoreDisplayYn").val(); 	
					//재고에 따른 onlineStore 노출 기능 사용 시 재고가 있는 경우는 onlinestore 미노출
					var stockStatusText = initData.apiChangeStockStatus;
					var wtbStockStatus = "N";	
					var onlineDisplayByStock = "Y"
					
					if(stockStatusText != null && stockStatusText != 'null'){
						stockStatusText = stockStatusText.replace(/\s/gi, "").toUpperCase();
						if(stockStatusText == "INSTOCK" || stockStatusText == "LOWSTOCK" || stockStatusText == "PREORDER"){
							wtbStockStatus = "Y";
						}
					}
					
					if(initData.useWtbStockFunction == 'Y' && wtbStockStatus == 'Y'){
						onlineDisplayByStock = 'N';
					}
					
					if(siteCode === 'cz' || siteCode === 'sk' ) {
						$("#whereToBuyLocator").addClass("is-selected");			
						$("#whereToBuyLocator").attr("aria-selected", true);
						$(".where-to-buy__locator").addClass("is-active");
						
						if(((onlineStoreUse === 'N' || !onlineRetailorsSize || onlineRetailorsSize === "0") && etaleYn !== 'Y') || buyonlineDisplayYn === 'N' || onlineDisplayByStock === 'N') {
							$("#whereToBuyOnline").parent().remove();
							$("#whereToBuyOnline").attr("aria-selected", false);
							$(".where-to-buy__online").remove();
							$("#whereToBuyOnline").removeClass("is-selected");
						}
						offStoreCookieCheck();
						
					}else{
						if(offlineStoreUse === 'Y' && instoreIAFlag === 'Y') {
							if(((onlineStoreUse === 'N' || !onlineRetailorsSize || onlineRetailorsSize === "0") && etaleYn !== 'Y') || buyonlineDisplayYn === 'N' || onlineDisplayByStock === 'N') {
								$("#whereToBuyOnline").parent().remove();
								$("#whereToBuyLocator").addClass("is-selected");						
								$("#whereToBuyLocator").attr("aria-selected", true);
								$(".where-to-buy__online").remove();
								$(".where-to-buy__locator").addClass("is-active");
							}
							if(siteCode !== 'cn') {
								offStoreCookieCheck();
							}
						}else if(offlineStoreUse !== 'Y' || instoreIAFlag === 'N') { 					
							$("#whereToBuyLocator").parent().remove();
							if(onlineDisplayByStock === 'N'){
								var outofstockText = "<p>"+Granite.I18n.get('We are sorry, but this product is currently not available from any of our retail partners.') + "</p>";
								$(".where-to-buy__store").html(outofstockText);
							}
						}
					}			
					//html 코드 포함 케이스가 있어서 js에서 처리하는걸로 수정
					var displayName = $("#wtbDisplayName").val();
					$(".where-to-buy__container .where-to-buy__product-name").html(displayName);
					
					drawLocatorBtn();
					drawMoreBtn();
					drawReviews();
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
				},
				complete: function() {
					wtb.bak.reInit();
				}
			});
		}
		
		//offline store detail 
		var getOffStoreDetail = function(jsonData) {
			var storeDetailData = jsonData;		
			var storeDetailHeadline = "";
			var storeDetailType = "";
			var storeDetail = "";
			var storeLat = storeDetailData.latitude;
			var storeLog = storeDetailData.longitude;
			var brandTypeValue = "";
			var googleMapUrl = "https://www.google.com/maps/search/?api=1&query="+storeLat+","+storeLog;
								
			storeDetailHeadline += storeDetailData.name;
			if(storeDetailData.cityName != null) {
				storeDetailHeadline	+= ' ' + storeDetailData.cityName;	
			}
			$(".where-to-buy__container .where-to-buy__detail-headline").text(storeDetailHeadline);
			
			
			if(storeDetailData.brandTypeCode === 'E') {
				brandTypeValue = Granite.I18n.get("Samsung Experience Stores");
			}else if(storeDetailData.brandTypeCode === 'B') {
				brandTypeValue = Granite.I18n.get("Samsung Brand Store");
			}else if(storeDetailData.brandTypeCode === 'O') {
				brandTypeValue = Granite.I18n.get("Other Store");
			}
			
			storeDetailType +=
				brandTypeValue + 
				'<span class="where-to-buy__detail-distance">'+ (storeDetailData.distance+initData.distanceUnitValue) +'</span>'; 			
			$(".where-to-buy__container .where-to-buy__detail-type").html(storeDetailType);		
			
			storeDetail +=
				'<li class="where-to-buy__detail-info-item" role="listitem"><a href="'+googleMapUrl+'" class="where-to-buy__detail-info-link icon-location" an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeDetailHeadline+':address" aria-label="'+storeDetailData.address+' Google map : Open in a new window" target="_blank">'+storeDetailData.address+
				/* SVG Icon 추가 */
				'<svg class="icon icon--location" focusable="false" aria-hidden="true"><use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#location-bold"></use></svg>' +
				'</a></li>';
			if(storeDetailData.phone != null && storeDetailData.phone !== "") {
			storeDetail +=
				'<li class="where-to-buy__detail-info-item" role="listitem"><a href="tel:'+storeDetailData.phone+'" class="where-to-buy__detail-info-link icon-tel" title="Call '+storeDetailData.phone+'" an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeDetailHeadline+':call">'+storeDetailData.phone+
				/* SVG Icon 추가 */
				'<svg class="icon icon--tel" focusable="false" aria-hidden="true"><use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#call-bold"></use></svg>' +
				'</a></li>';
			}
			if(storeDetailData.email != null && storeDetailData.email !== "") {
			storeDetail +=
				'<li class="where-to-buy__detail-info-item" role="listitem"><a href="mailto:'+storeDetailData.email+'" class="where-to-buy__detail-info-link icon-mail" title="Mail to "'+storeDetailData.email+' an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeDetailHeadline+':email">'+storeDetailData.email+'</a></li>';	
			}
			$(".where-to-buy__container .where-to-buy__detail-info-list").html(storeDetail);
			
		}
		
		//hatch offline store detail 
		var getHatchOffStoreDetail = function(jsonData) {
			var storeDetailData = jsonData.locations[0];		
			var storeDetailHeadline = "";
			var storeDetailType = "";
			var storeDetail = "";
			var storeLat = storeDetailData.coordinates.latitude;
			var storeLog = storeDetailData.coordinates.longitude;
			var brandTypeValue = "";
			var googleMapUrl = "https://www.google.com/maps/search/?api=1&query="+storeLat+","+storeLog;
						
			if(storeDetailData.name != null && storeDetailData.name != ""){
				storeDetailHeadline += storeDetailData.name;
			}
			
			if(storeDetailData.locality != null && storeDetailData.locality != "") {
				storeDetailHeadline	+= ' ' + storeDetailData.locality;	
			}
			$(".where-to-buy__container .where-to-buy__detail-headline").text(storeDetailHeadline);			
			
			if(storeDetailData.storeTypes == '1_ses') {
				brandTypeValue = Granite.I18n.get("Samsung Experience Stores");
			}else if(storeDetailData.storeTypes == '2_sbs') {
				brandTypeValue = Granite.I18n.get("Samsung Brand Store");
			}else{
				brandTypeValue = Granite.I18n.get("Other Store");
			}
			
			var hatchDistance = "";
			if(initData.distanceUnitValue == "Km"){
				hatchDistance = (parseFloat(storeDetailData.distance)/1000).toFixed(2);
			}else if(initData.distanceUnitValue == "Mile"){
				hatchDistance = (parseFloat(storeDetailData.distance)/1609.344).toFixed(2);
			}
			
			storeDetailType +=
				brandTypeValue + 
				'<span class="where-to-buy__detail-distance">'+ (hatchDistance+initData.distanceUnitValue) +'</span>'; 			
			$(".where-to-buy__container .where-to-buy__detail-type").html(storeDetailType);		
			
			if(storeDetailData.address.street != null && storeDetailData.address.street !== "") {
			storeDetail +=
				'<li class="where-to-buy__detail-info-item" role="listitem"><a href="'+googleMapUrl+'" class="where-to-buy__detail-info-link icon-location" an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeDetailHeadline+':address" aria-label="'+storeDetailData.address.street+' Google map : Open in a new window" target="_blank">'+storeDetailData.address.street+
				/* SVG Icon 추가 */
				'<svg class="icon icon--location" focusable="false" aria-hidden="true"><use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#location-bold"></use></svg>' +
				'</a></li>';
			}
			if(storeDetailData.telephone != null && storeDetailData.telephone !== "") {
			storeDetail +=
				'<li class="where-to-buy__detail-info-item" role="listitem"><a href="tel:'+storeDetailData.phone+'" class="where-to-buy__detail-info-link icon-tel" title="Call '+storeDetailData.phone+'" an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeDetailHeadline+':call">'+storeDetailData.telephone+
				/* SVG Icon 추가 */
				'<svg class="icon icon--tel" focusable="false" aria-hidden="true"><use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#call-bold"></use></svg>' +
				'</a></li>';
			}
			if(storeDetailData.email != null && storeDetailData.email !== "") {
			storeDetail +=
				'<li class="where-to-buy__detail-info-item" role="listitem"><a href="mailto:'+storeDetailData.email+'" class="where-to-buy__detail-info-link icon-mail" title="Mail to "'+storeDetailData.email+' an-tr="where to buy popup-'+digitalData.page.pageInfo.pageTrack+'-text-contact" an-ca="store locator" an-ac="store detail view" an-la="store detail view:'+storeDetailHeadline+':email">'+storeDetailData.email+'</a></li>';	
			}
			$(".where-to-buy__container .where-to-buy__detail-info-list").html(storeDetail);
			
		}
		
		//call offline store detail api
		var getStorelocatorDetail = function(storeId, latitude, longitude) {
			var hatchOffstoreUse = $("#hatchOffstoreUse").val();
			var offDeatilSearchDomain = $("#searchApiDomain").val() + '/' + $("#apiStageInfo").val() + '/b2c/storelocator/detail';
			var siteCd = $("#siteCode").val();
			var distanceUnit = $("#offstoreDistanceUnit").val();
			var param = {
				"siteCode":siteCd,
				"latitude":latitude,
        		"longitude":longitude,
        		"distanceUnit":distanceUnit,
        		"storeId":storeId
        		}
			
			if(hatchOffstoreUse != 'Y'){
				$.ajax({
					type: "GET",						
					url: offDeatilSearchDomain,
        			data : param,
        			async:false,
        			success: function (data) {								
        				getOffStoreDetail(data.response.resultData.storeDetail);
        			},
        			error: function(XMLHttpRequest, textStatus, errorThrown) {
        			}
				});
			}else{
				var hatchOffstoreUrl = $("#hatchOffstoreUrl").val();
				var hatchOffstoreBrandID =  $("#hatchOffstoreBrandID").val();
				var hatchOffstoreRegion = $("#hatchOffstoreRegion").val();
				var hatchOffstoreLang = $("#hatchOffstoreLang").val();
				var offHatchDomain = hatchOffstoreUrl + hatchOffstoreBrandID + "/geo/list";			
				var offHatchnRadius = $("button.where-to-buy__distance-button.is-selected").attr("data-value");
				if(initData.distanceUnitValue == "Mile"){
					offHatchnRadius = offHatchnRadius*1609.344;
				}else{
					offHatchnRadius = offHatchnRadius*1000;
				}
				var modelCode = "";
				if ($("#selectModelCode").val() == null || $("#selectModelCode").val() === undefined || $("#selectModelCode").val() === "" ) {
					modelCode = $("#current_model_code").val();
				}else{
					modelCode = $("#selectModelCode").val();
				}
				var hatchParam = "";
				if(hatchOffstoreLang != "" && hatchOffstoreLang != null){
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"segment": hatchOffstoreLang,
						"filters":[
							{
							  "columnName": "searchableId",
							  "operation": "equal",
							  "value": [storeId]
							  }
						]
					};
				}else{
					hatchParam = {
						"countryCode":hatchOffstoreRegion,
						"geoCenterArea": {
							"center": {
								"latitude":latitude,
								"longitude":longitude
							},
							"distance":offHatchnRadius
						},
						"product":modelCode,
						"filters":[
							{
							  "columnName": "searchableId",
							  "operation": "equal",
							  "value": [storeId]
							  }
						]
					};
				}
				$.ajax({
					headers: {
						"Content-Type": "application/json",
						//"Cookie" : "icl_opt_out=true"
					},
					type: "POST",						
					url: offHatchDomain,
					data: JSON.stringify(hatchParam),
					cache: true,
					timeout: 20000,
					success: function (data) {
						getHatchOffStoreDetail(data);
					}
				});
				
			}
		}
		

		//online store search store click
		$(document).on('click', '.where-to-buy__container .where-to-buy__search', function(e) {
			var siteCode = $("#siteCode").val();
			var storelocatorUrl = "/"+siteCode+"/storelocator";
			var openStorelocator = window.open("about:blank");
			openStorelocator.location.href = storelocatorUrl;
		});
		
		//offline store distance filter click
		$(document).on('click', '.where-to-buy__container .where-to-buy__distance-button', function(e) {
			$(".where-to-buy__distance-list li button").removeClass("is-selected");
			$(this).addClass("is-selected");
			offStoreCookieCheck();
		});
		
		//offline store list click
		$(document).on('click', '.where-to-buy__container .where-to-buy__result-content', function(e) {
			var storeId = $(this).find(".where-to-buy__result-info").attr("data-store-id");
			var lat = $("#offstoreLatitude").val();
			var long = $("#offstoreLongitude").val();					
			$('.where-to-buy__result-content').removeClass('is-active');
			$(this).addClass('is-active');
			getStorelocatorDetail(storeId, lat, long);
		});
		
		//offline store gps approval click
		$(document).on('click', '.where-to-buy__container .where-to-buy__layer--gbs .cta--contained.cta--emphasis', function(e) {
			setOffStoreCookie("newwtb_offstore","true",5);
			offStoreCookieCheck();
			layerClose(".where-to-buy__layer--gbs", false);
		});
		
		//offline store gps cancel click
		$(document).on('click', '.where-to-buy__container .where-to-buy__layer--gbs .cta--outlined.cta--black', function(e) {
			setOffStoreCookie("newwtb_offstore","false",5);
			getStorelocatorDefault();
			layerClose(".where-to-buy__layer--gbs", false);
		});
		
		//offline store gps close click
		$(document).on('click', '.where-to-buy__container .where-to-buy__layer--gbs .layer-popup__close', function(e) {					
			setOffStoreCookie("newwtb_offstore","false",5);
			getStorelocatorDefault();
			layerClose(".where-to-buy__layer--gbs", false);
		});
		
		//offlines store tooltip title click
		$(document).on('click', '.where-to-buy__container .store-arr2', function(e) {
			var storeId = $("#currentStoreId").val();
			var lat = $("#offstoreLatitude").val();
			var long = $("#offstoreLongitude").val();
			getStorelocatorDetail(storeId,lat,long);
			$(".where-to-buy__detail").show();
			$("#store-Detail-Layer").attr("data-store-detail-id",storeId);
		});
		
		//offline store tooltip close click
		$(document).on('click', '.where-to-buy__container .gm-ui-hover-effect', function(e) {
			$(".where-to-buy__detail").hide();
			$('.where-to-buy__result-content').removeClass('is-active');
		});
		
		//Where to buy lay close click
		$(document).on('click', '.where-to-buy__container .where-to-buy__content > .layer-popup__close', function(e) {
			layerClose(".where-to-buy__container", true);
		});
		
		//Where to buy lay close click
		$(document).on('click', '.where-to-buy__container .where-to-buy__store-link', function(e) {
			window.open($(this).data("deeplink"), "_blank");
		});
		
		$(document).on('click', '.js-cta-buy, .js-cta-buy-etc', function(e) {
			var iaCode = $(this).attr("data-iaCode"); 
			var siteCode = $("#siteCode").val();
			var tempModelCode = $(this).attr("data-modelcode");
			var modelCode = tempModelCode.replace("/","+");
			var modelName = $(this).attr("data-modelname");
			var channelCampaignTag = "Y";
			var countryCookie = getOffStoreCookie("country_codes") !== ''?  getOffStoreCookie("country_codes") : "kr";
			var language = $("#language").val().replace("-", "_");
			var wtbPath = "/samsung/common/wheretobuy.cm-g-where-to-buy-bak."+iaCode+"."+siteCode+"."+modelCode+"."+channelCampaignTag+"."+countryCookie+"."+language+"."+"html";
			
			if(location.href.indexOf(".html") <= -1) {
				wtbPath = wtbPath.replace(".html","/");
			}
			
			$("#current_model_code").val(tempModelCode);
			$("#wtb-categorySubTypeCode").val(iaCode);								
				
			switch (siteCode) {
				case "ru":
				case "ge":
				case "test":
					// wtb-init 미 포함인 경우 초기화후 click
					if(!$(this).hasClass('wtb-init')){ // wtb-init https://widget.24wtb.com/samsung/wtbWidget.js에 포함 되어있음
						var wtbWidget = new WtbWidget();
						wtbWidget.init({});
						document.addEventListener("click", function(e) {
							if(e.target && e.target.className && e.target.className.indexOf("js-cta-buy") !== -1) {
								wtbWidget.callPopup(e.target);
							}
						});
						$(this).get(0).click();
					}
					break;
				case "be":
				case "be_fr":
				case "nl":
					if (document.querySelector("#wtb-id-span") === null) {
	        	    	var idSpan = document.createElement('span');
	        	    	idSpan.dataset.mpn = tempModelCode;
	        	    	idSpan.id = "wtb-id-span";
	        	    	$('body').append(idSpan);
	        	    } else {
	        	    	document.querySelector("#wtb-id-span").dataset.mpn = tempModelCode;
	        	    }

	        	    //modal
	        	    switchModal(initData);
					break;
				case "pl":
					var source = "/pl/where-to-buy.html?model="+ tempModelCode +"&locale=pl-PL&iaUrlNamePath=" + digitalData.page.pageInfo.pageName + "&pageTrack=" + digitalData.page.pageInfo.pageTrack + "&urlPath="+window.location.href;
					if(location.href.indexOf(".html") <= -1) {
						source = source.replace(".html","/");
					}
					if("admin" === $("#apiStageInfo").val()){
						source = "/content/samsung" + source;
					}
					$.magnificPopup.open({
						  items: {src: source},
						  type: 'iframe',
						  callbacks: {
							    open: function() {
							    	window.sg.common.utils.hiddenScroll();
								},
							    close: function() {
							    	window.sg.common.utils.visibleScroll();
							    }
						  }    
					});
					break;
				case "de":
					break;							
				default:	
				
					//재고에 따른 onlineStore 노출 기능 
					var templateType = digitalData.page.pageInfo.pageTrack;
					if(templateType == 'product finder'){
						initData.apiChangeStockStatus = $(this).parent().find(".wtbStockStatusText").val();				
						initData.useWtbStockFunction = $(this).parent().find(".useWtbStockFunction").val();				
					}else{
						initData.apiChangeStockStatus = $("#apiChangeStockStatus").val();
						initData.useWtbStockFunction = $("#useWtbStockFunction").val();
					}
				
					getWtbData(wtbPath);
					$("#selectModelName").val(modelName);
					$("#selectModelCode").val(tempModelCode);
					
					if(siteCode === 'ca' || siteCode === 'ca_fr') {
						if(typeof $("#cnWtbUrlPath").val() !== 'undefined' && $("#cnWtbUrlPath").val()!== '') {
							pswtb.sandbox.openWTB(this, $("#cnWtbUrlPath").val());
						}
					} else {
						if(siteCode === 'cn') {
							if ($(".where-to-buy__tab li").length === 1 && $(".where-to-buy__tab li a").attr("id") === "whereToBuyLocator") {
								location.href = $("#cnWtbUrlPath").val();
								return;
							}
						}
						// offline store modelcode/modelname attribute 추가
						$(".where-to-buy__container .where-to-buy__store-link").attr("data-modelcode", tempModelCode);
						$(".where-to-buy__container .where-to-buy__store-link").attr("data-modelname", modelName);
						
						// br 모바일(01) 인 경우 review 감춤 처리
//						if('br' === siteCode && '01' === iaCode.substr(0,2)) {
//							$(".where-to-buy__container .where-to-buy__product-rating").hide();
//						}
						
						layerOpen(".where-to-buy__container");
						window.sg.common.icon.update();
						window.sg.common.lazyLoad.setLazyLoad();
					}
					break;
			}
			
			if(initData.bvConversationFlag === "Y" || initData.bvConversationRTLFlag === "Y") {
				window.bvCallback = function (BV) {
					BV.pixel.trackConversion({
						"type" : "WhereToBuy",
						"label" : "ProductPage",
						"value" : modelCode
					});
				};
			}
		});
		
	};
	
	function layerOpen(layerSelector) {
		$(".where-to-buy .layer-popup-dim").show();
		$(".where-to-buy " + layerSelector).show();
	};
	
	function layerClose(layerSelector, isWtbLayer) {
		if(isWtbLayer) {
			$(".where-to-buy .layer-popup-dim").hide();
		}
		$(".where-to-buy " + layerSelector).hide();
	};
	
	function placeResources() {
		 var script = document.createElement("script")
		 if (location.host.indexOf("www") > -1) {
			 script.src = "https://sebn.ams3.cdn.digitaloceanspaces.com/src/wtb/latest/js/app.js";
		 } else {
			 script.src = "https://sebn.ams3.digitaloceanspaces.com/src/wtb/latest/staging/js/app.js";
		 }
		 script.type = "text/javascript";
		 document.getElementsByTagName("head")[0].appendChild(script);
	};

  	function createModal(initData) {
  		  var html = document.createElement('div');
  		  html.innerHTML =
	  	      "<div id='wtb-modal-container' class='modal-container'>"
	  	    	+ "<div class='modal-overlay'></div>"
	  	    	+ "<div class='modal-window default settings'>"
	  	    		+ "<div class='internal-container'>"
	  	    			+ "<div class='modal-top-bar'>"
	  	    				+ "<div class='close-button'><img src='https://image.samsung.com/uk/smartphones/galaxy-note9/buy/shop_popup_close_btn_mo.png'/></div>"
	  	    			+ "</div>"
	  	    			+ "<div id='where-to-buy-local'>"
	  	    			+ "</div>"
	  	    		+ "</div>"
		    	+ "</div>"
		     + "</div>";
  		  $('body').append(html);
  		  $('.close-button').on('click', function (e) {
  			  switchModal(initData);
  		  });
  		  $('.modal-overlay').on('click', function (e) {
  			  switchModal(initData);
  	      });
  	};
	
  	function switchModal(initData) {
  		  if (document.querySelector("#wtb-modal-container") === null) {
  			  createModal(initData);
  		  }
  		  if (!initData.placedWtbResources) {
  			  placeResources();
  			  initData.placedWtbResources = true;
  		  }
  		  $("body").toggleClass("modal-open");
  	};
	
})(window, window.jQuery);	
/*! iFrame Resizer (jquery.iframeSizer.min.js )
 *  Desc: Force cross domain iframes to size to content.
 *  Requires: iframeSizer.contentWindow.min.js to be loaded into the target frame.
 *  Copyright: (c) 2013 David J. Bradshaw - dave@bradshaw.net
 *  License: MIT and GPL
 */

(function(e){function o(e){i.log&&window.console&&console.log(t+" "+e)}var t="[iFrameSizer]",n=t.length,r=0,i,s={log:!1,contentWindowBodyMargin:8,doHeight:!0,doWidth:!1,interval:0,callback:function(){}};e(window).on("message",function(e){function r(e){function r(){function e(e){u.iframe.style[e]=u[e]+"px",o(u.iframe.id+" "+e+" set to "+u[e]+"px")}i.doHeight&&e("height"),i.doWidth&&e("width")}function s(){var t=e.substr(n).split(":");u={iframe:document.getElementById(t[0]),height:t[1],width:t[2]}}var u={};t===e&&e.substr(0,n)&&(s(),r(),i.callback(u))}r(e.originalEvent.data)}),e.fn.iFrameSizer=function(n){return i=e.extend({},s,n),this.each(function(){function n(){return a.contentWindow?!0:!1}function s(){a.style.overflow="hidden",a.scrolling="no",e(a).on("load",function(){u(a)}),u(a)}function u(){function e(){""===a.id&&(a.id="iFrameSizer"+r++,o("Added missing iframe ID: "+a.id))}function n(){var e=a.id+":"+i.contentWindowBodyMargin+":"+i.doWidth+":"+i.log+":"+i.interval;o("Sending init msg to iframe ("+e+")"),a.contentWindow.postMessage(t+e,"*")}e(),n()}var a=this;n()&&s()})}})(window.jQuery);
(() => {
  const $q = window.sg.common.$q;
  const utils = window.sg.common.utils;
  const setMobileFocusLoop = window.sg.common.utils.setMobileFocusLoop;
  const removeMobileFocusLoop = window.sg.common.utils.removeMobileFocusLoop;

  const selector = {
    section: '.confirm-popup',
    close: '.confirm-popup__close',
    focusEl: 'a:not([style*="display: none"]):not([style*="display:none"]), button:not([style*="display: none"]):not([style*="display:none"]), input',
  };

  class PopupConfirm {
    constructor(el) {
      this.els = {
        el,
        popupConfirmCloseBtn: el.querySelector('.confirm-popup__close'),
        popupConfirmNoBtn: el.querySelector('.confirm-popup .confirm-popup__cta-wrap Button:first-of-type'),
        popupConfirmYesBtn: el.querySelector('.confirm-popup .confirm-popup__cta-wrap Button:last-of-type'),
      };
      this.init();
    }

    init() {
      if(PopupConfirm.instances.get(this.els.el)) {
        return;
      }

      PopupConfirm.instances.set(this.els.el, this);

      this.bindEvents();
    }

    bindEvents() {
      this.els.popupConfirmCloseBtn.addEventListener('click', () => {
        this.close();
      });
      this.els.popupConfirmNoBtn.addEventListener('click', () => {
        this.close();
      });
      this.els.popupConfirmYesBtn.addEventListener('click', () => {
        this.close();
      });

      const closeBtn = document.querySelector(`${selector.section} ${selector.close}`);
      closeBtn.removeEventListener('keydown', keydownCloseBtn);
      closeBtn.addEventListener('keydown', keydownCloseBtn);

      const layer = $q(selector.section).find(selector.focusEl).target[0];
      layer.removeEventListener('keydown', keydownLayer);
      layer.addEventListener('keydown', keydownLayer);
    }

    close() {
      const productCardList = $q('.pd13-offers-product-card-list');
      const productFinder = $q('.pd12-product-finder');

      if (productCardList.target.length > 0 || productFinder.target.length > 0) {
        const confirmPop = $q('.confirm-popup');
        if (confirmPop.attr('data-aria-hidden')) { //call in popup
          confirmPop.attr('aria-hidden', 'true');

          const callLayer = ['.pd-get-stock-alert-popup', '.compare-popup'];

          callLayer.forEach((layerEl) => {
            if ($q(layerEl).css('display') === 'block') {
              $q(layerEl).removeAttr('data-aria-hidden');
              $q(layerEl).removeAttr('aria-hidden');
            }
          });
        } else {
          removeMobileFocusLoop();
        }
      } else {
        if (document.querySelectorAll('[data-aria-hidden]').length > 0) {
          removeMobileFocusLoop();
        }
      }

      this.els.el.style.display = 'none';
      utilsHide();
      
      const agent = window.navigator.userAgent;
      const isIphone = agent.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
      const iosVersion = isIphone ? parseFloat(isIphone[2].replace('_', '.')) : 0;
      if(iosVersion >= 16.1){
        setTimeout(() => {
          if (window.sg.components.confirmPopup.popupCallCta !== null) {
            window.sg.components.confirmPopup.popupCallCta.focus();
            window.sg.components.confirmPopup.popupCallCta = null;
          }
        },200);
      } else {
        if (window.sg.components.confirmPopup.popupCallCta !== null) {
          window.sg.components.confirmPopup.popupCallCta.focus();
          window.sg.components.confirmPopup.popupCallCta = null;
        }
      }
    }
  }

  PopupConfirm.instances = new WeakMap();

  function keydownLayer(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode && evt.target === $q(selector.section).find(selector.focusEl).target[0]) {
      evt.preventDefault();
      document.querySelector(`${selector.section} ${selector.close}`).focus();
    }
  }

  function keydownCloseBtn(evt) {
    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();
      $q(selector.section).find(selector.focusEl).target[0].focus();
    }
  }

  function showPopup(callCta = null) {
    document.querySelector('.confirm-popup').style.display = 'block';

    const agent = window.navigator.userAgent;
    const isIphone = agent.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
    const iosVersion = isIphone ? parseFloat(isIphone[2].replace('_', '.')) : 0;
    const focusEl = $q('.confirm-popup').find(selector.focusEl).target[0];
    if(iosVersion >= 16.1){
      focusEl.blur();
      setTimeout(() => {
        focusEl.focus();
      },200);
    } else {
      focusEl.focus();
    }

    const firstFocusEl = $q(selector.section).find(selector.focusEl).target[0];
    firstFocusEl.removeEventListener('keydown', keydownLayer);
    firstFocusEl.addEventListener('keydown', keydownLayer);

    utilsShow();

    const productCardList = $q('.pd13-offers-product-card-list');
    const productFinder = $q('.pd12-product-finder');
    const confirmPop = $q('.confirm-popup');

    if (window.sg.components.confirmPopup.popupCallCta !== null) {
      window.sg.components.confirmPopup.popupCallCta = null;
    }

    if (callCta !== null) {
      if (callCta instanceof Element) {
        window.sg.components.confirmPopup.popupCallCta = callCta;
      } else if (callCta instanceof Object) {
        if (callCta[0] instanceof Element) {
          window.sg.components.confirmPopup.popupCallCta = callCta[0];
        } else {
          window.sg.components.confirmPopup.popupCallCta = callCta.target[0];
        }
      }
    }

    if (productCardList.target.length > 0 || productFinder.target.length > 0) {
      if (confirmPop.attr('data-aria-hidden')) { //call in popup
        confirmPop.attr('aria-hidden', 'false');
        const callLayer = ['.pd-get-stock-alert-popup', '.compare-popup'];

        callLayer.forEach((layerEl) => {
          if ($q(layerEl).css('display') === 'block') {
            $q(layerEl).attr('data-aria-hidden', null);
            $q(layerEl).attr('aria-hidden', 'true');
          }
        });
      } else {
        setMobileFocusLoop(confirmPop.target[0]);
      }
    } else {
      if (document.querySelectorAll('[data-aria-hidden]').length === 0) {
        setMobileFocusLoop(confirmPop.target[0]);
      }
    }
  }

  function closePopup() {
    PopupConfirm.instances.get(document.querySelector('.confirm-popup')).close();
  }

  function utilsShow() {
    utils.popupControl.open(closePopup);
    utils.hiddenScroll();
  }

  function utilsHide() {
    utils.popupControl.close();
    utils.visibleScroll();
  }

  const popupConfirm = {
    initAll() {
      [...document.querySelectorAll('.confirm-popup')].forEach((el) => {
        if (!PopupConfirm.instances.has(el)) {
          new PopupConfirm(el);
        }
      });
    },
    showPopup,
  };

  window.sg.components.confirmPopup = popupConfirm;

  $q.ready(popupConfirm.initAll);
})();

//alert layer popup
function confirmPopup(msg, type, id, $focusEl) {
    /* confirm 활성화 된 경우는 스킵 */
    if ($(".confirm-popup").is(":visible")) {
        return false;
    }

    var alertlayer = $(".confirm-popup");
    var alertTitle = alertlayer.find(".confirm-popup__title");
    //COMP6FE-1492(ca국가 추가 할인)
    var alertDisclaimer = alertlayer.find(".confirm-popup__disclaimer");
    var alertText = alertlayer.find(".confirm-popup__desc");
    var alertClose = alertlayer.find(".confirm-popup__close");
    var alertYes = alertlayer.find(".cta--contained");
    var alertNo = alertlayer.find(".cta--outlined");
    var pageTrack = digitalData.page.pageInfo.pageTrack;

    //COMP6FE-1492(ca국가 추가 할인)
    alertlayer.removeClass("error-popup-style");
    
    alertTitle.html("");
    initCta(alertClose);
    initCta(alertYes);
    initCta(alertNo);
    alertYes.attr("id", (id || null));

    if (msg != null && msg !== "") {
        alertText.html(msg);
    } else {
        alertText.html(Granite.I18n.get("We're sorry, an error occurred."));
    }

    //DTM
    if (null == type || "error" === type) {
        alertYes.html(Granite.I18n.get("Close"));
        alertNo.hide();
        alertYes.attr("an-tr", "error popup-" + pageTrack + "-cta-button")
            .attr("an-ca", "other interaction")
            .attr("an-ac", "error popup:close")
            .attr("an-la", "error popup:close");
        alertClose.attr("an-tr", "error popup-" + pageTrack + "-cta-button")
            .attr("an-ca", "other interaction")
            .attr("an-ac", "error popup:close")
            .attr("an-la", "error popup:close");
    } else if ("tnc" === type) {
        alertYes.html(Granite.I18n.get("Confirm"));
        alertNo.hide();
    } else if ("delete" === type) {
        alertYes.html(Granite.I18n.get("YES"));
        alertNo.html(Granite.I18n.get("NO"));
        alertNo.show();
    } else if ("voucherDelete" === type) {
    	alertTitle.html(Granite.I18n.get("Delete options"))
        alertYes.html(Granite.I18n.get("YES"));
        alertNo.html(Granite.I18n.get("NO"));
        alertNo.show();
        alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-delete")
            .attr("an-ca", "option click")
            .attr("an-ac", "bridge")
            .attr("an-la", "evoucher:delete option:yes");
        alertNo.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-delete")
            .attr("an-ca", "option click")
            .attr("an-ac", "bridge")
            .attr("an-la", "evoucher:delete option:no");
    } else if ("addToCart" === type) {
        alertYes.html(Granite.I18n.get("Continue shopping"));
        alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-add")
            .attr("an-ca", "option click")
            .attr("an-ac", "bridge")
            .attr("an-la", "add on:add item popup:continue shopping");
        alertNo.hide();
    } else if ("redeem" === type) {
        alertTitle.html(Granite.I18n.get("Are you sure?"));
        alertNo.html(Granite.I18n.get("Redeem"));
        alertNo.show();
        alertYes.html(Granite.I18n.get("Skip"));
        if (id === "voucherGoCart") {
            alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-text")
                .attr("an-ca", "ecommerce")
                .attr("an-ac", "addToCart")
                .attr("an-la", "evoucher:no addition:skip");
            setVoucherYes(alertYes);
        }else if(id === "voucherGoCartAddOn"){
        	alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-text")
            .attr("an-ca", "ecommerce")
            .attr("an-ac", "addToCart")
            .attr("an-la", "evoucher:no addition:skip");
        setVoucherYes(alertYes);
        } else if (id === "skipGoCart") {
            alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-notadded")
                .attr("an-ca", "content click")
                .attr("an-ac", "feature")
                .attr("an-la", "evoucher:no addition:skip");
        }else if(id === "skipGoCartAddOn"){
        	alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-notadded")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:no addition:skip");
        }
        alertNo.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-text")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:no addition:redeem");
        alertClose.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-text")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:no addition:close");
    } else if ("voucher" === type) {
    	alertTitle.html(Granite.I18n.get("Are you sure?"));
        alertNo.html(Granite.I18n.get("Back"));
        alertNo.show();
        alertYes.html(Granite.I18n.get("Continue"));
        if (id === "voucherGoCart") {
            alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-text")
                .attr("an-ca", "ecommerce")
                .attr("an-ac", "addToCart")
                .attr("an-la", "evoucher:below evoucher:continue");
            setVoucherYes(alertYes);
        }else if(id === "voucherGoCartAddOn"){
        	alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-text")
            .attr("an-ca", "ecommerce")
            .attr("an-ac", "addToCart")
            .attr("an-la", "evoucher:below evoucher:continue");
        	setVoucherYes(alertYes);
        }else if (id === "skipGoCart") {
            alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-notadded")
                .attr("an-ca", "content click")
                .attr("an-ac", "feature")
                .attr("an-la", "evoucher:below evoucher:continue");
        }else if(id === "skipGoCartAddOn"){
        	alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-notadded")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:below evoucher:continue");
        }
        alertNo.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-text")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:below evoucher:back");
        alertClose.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-text")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:below evoucher:close");
    } else if ("allVoucher" === type) {
    	alertTitle.html(Granite.I18n.get("Great!"));
        alertNo.html(Granite.I18n.get("Select again"));
        alertNo.show();
        alertYes.html(Granite.I18n.get("Continue"));
        if (id === "voucherGoCart") {
            alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-text")
                .attr("an-ca", "ecommerce")
                .attr("an-ac", "addToCart")
                .attr("an-la", "evoucher:over evoucher:continue");
            setVoucherYes(alertYes);
        }else if(id === "voucherGoCartAddOn"){
        	alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-text")
            .attr("an-ca", "ecommerce")
            .attr("an-ac", "addToCart")
            .attr("an-la", "evoucher:over evoucher:continue");
        setVoucherYes(alertYes);
        }else if (id === "skipGoCart") {
            alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-notadded")
                .attr("an-ca", "content click")
                .attr("an-ac", "feature")
                .attr("an-la", "evoucher:over evoucher:continue");
        }else if(id === "skipGoCartAddOn"){
        	alertYes.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-popup-notadded")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:over evoucher:continue");
        }
        alertNo.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-text")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:over evoucher:back");
        alertClose.attr("an-tr", "pdd10_product bought together-" + pageTrack + "-button-text")
            .attr("an-ca", "content click")
            .attr("an-ac", "feature")
            .attr("an-la", "evoucher:over evoucher:close");
    } else if ("freeGift" === type) {
        alertYes.html(Granite.I18n.get("YES"));
        alertNo.html(Granite.I18n.get("NO"));
        alertNo.show();
        alertYes.attr("an-tr", "header(pim)_offer option:bundle offer:free gift-" + pageTrack + "-alert-link")
            .attr("an-ca", "option click")
            .attr("an-ac", "pd buying tool")
            .attr("an-la", "bundle offer:free gift:reset option:yes");
        alertNo.attr("an-tr", "header(pim)_offer option:bundle offer:free gift-" + pageTrack + "-alert-link")
            .attr("an-ca", "option click")
            .attr("an-ac", "pd buying tool")
            .attr("an-la", "bundle offer:free gift:reset option:no");
    } else if ("combo" === type) {
        alertTitle.html(Granite.I18n.get("Delete"));
        alertYes.html(Granite.I18n.get("YES"));
        alertNo.html(Granite.I18n.get("NO"));
        alertNo.show();
        alertYes.attr("an-tr", "header(pim)_offer option:bundle offer:add-on -" + pageTrack + "-delete-confirm")
            .attr("an-ca", "option click")
            .attr("an-ac", "pd buying tool")
            .attr("an-la", "bundle offer:add-on:delete option:yes");
        alertNo.attr("an-tr", "header(pim)_offer option:bundle offer:add-on -" + pageTrack + "-delete-confirm")
            .attr("an-ca", "option click")
            .attr("an-ac", "pd buying tool")
            .attr("an-la", "bundle offer:add-on:delete option:no");
    }else if ("ebt" === type) {
        alertTitle.html($("#successTitle").val());
        alertText.html($("#successMessageDesc").val());
        alertYes.html(Granite.I18n.get("Close Layer"));
    } else if("continue" === type) {
        alertYes.html(Granite.I18n.get("Continue"));
        alertNo.html(Granite.I18n.get("CANCEL"));
        alertNo.show();
    }else if(type === 'OverPrice'){
        //COMP6FE-1492(ca국가 추가 할인)
    	alertYes.html(Granite.I18n.get("OK"));
    	alertText.html('');
    	alertText.hide();
    	alertNo.hide();
    	alertDisclaimer.html(msg);
    	alertlayer.addClass("error-popup-style");
    } else if ("tradeInClose" === type) { // CRHQ-8132 [B2C][MX][KZ] New Trade-In Telekom
        alertYes.html(Granite.I18n.get("Yes"));
        alertNo.html(Granite.I18n.get("No"));
        alertNo.show();
        alertYes.attr("data-event-type", type);
        alertNo.attr("data-event-type", type);
        alertClose.attr("data-event-type", type);
    }

    window.sg.components.confirmPopup.showPopup($focusEl);
};

//api 에러 발생시 layer pop
function errLayerPop(e) {
    var errorText = "";
    if (e.responseJSON != null) {
        var errmsg = e.responseJSON;
        if (errmsg.message != null && errmsg.message !== "") {
            errorText = errmsg.message;
        }
    }
    if (errorText === "") {
        errorText = Granite.I18n.get("We're sorry, an error occurred.");
    }
    //t&c && error alert popup
    confirmPopup(errorText, "error");
};

function setVoucherYes(ctaEl) {
    var bridgeCartEl = $("#primaryInfoGoCart");
    ctaEl.attr("data-modelname", bridgeCartEl.attr("data-modelname"))
        .attr("data-modeldisplay", bridgeCartEl.attr("data-modeldisplay"))
        .attr("data-modelprice", bridgeCartEl.attr("data-modelprice"))
        .attr("data-discountprice", bridgeCartEl.attr("data-discountprice"))
        .attr("data-pvitype", bridgeCartEl.attr("data-pvitype"))
        .attr("data-pvisubtype", bridgeCartEl.attr("data-pvisubtype"))
        .attr("data-pimsubtype", bridgeCartEl.attr("data-pimsubtype"))
        .attr("data-modelrevenue", bridgeCartEl.attr("data-modelrevenue"))
        .attr("data-modelqty", bridgeCartEl.attr("data-modelqty"))
        .attr("data-modelcurrency", bridgeCartEl.attr("data-modelcurrency"));
}

// cta tagging 초기화
function initCta(ctaEl) {
    ctaEl.removeAttr("an-tr")
        .removeAttr("an-ca")
        .removeAttr("an-ac")
        .removeAttr("an-la")
        .removeAttr("data-modelname")
        .removeAttr("data-modeldisplay")
        .removeAttr("data-modelprice")
        .removeAttr("data-discountprice")
        .removeAttr("data-pvitype")
        .removeAttr("data-pvisubtype")
        .removeAttr("data-pimsubtype")
        .removeAttr("data-modelrevenue")
        .removeAttr("data-modelqty")
        .removeAttr("data-modelcurrency");
}
(() => {
  const $q = window.sg.common.$q;
  const layerPopupMaxHeight = window.sg.common.layerPopupMaxHeight;
  const scrollbar = window.sg.common.scrollbar;
  const utils = window.sg.common.utils;

  let eipPopupEls = {};

  const selector = {
    section: '.eip-popup',
    layerPopup: '.layer-popup',
    close: '.layer-popup__close',
  };

  let tabIndex = -1;
  let selectItemIndex = -1;

  function init() {
    const eipPopup = document.querySelector('.eip-popup');

    if (!eipPopup) {
      return;
    }

    setElements(eipPopup);

    layerPopupMaxHeight.init(eipPopupEls.layerEl);

    bindEvents();
  }

  function setElements(el) {
    eipPopupEls = {
      el,
      layerEl: el.querySelector('.layer-popup'),
      closeEl: el.querySelector('.layer-popup__close'),
      tabEl: el.querySelectorAll('.eip-popup__tab'),
      parentEl: null,
    };
  }

  function bindEvents() {
    eipPopupEls.closeEl.addEventListener('click', closePopup);

    const closeBtn = document.querySelector(`${selector.section} ${selector.close}`);
    closeBtn.removeEventListener('keydown', keydownCloseBtn);
    closeBtn.addEventListener('keydown', keydownCloseBtn);
    
    const layer = document.querySelector(`${selector.section} ${selector.layerPopup}`);
    layer.removeEventListener('keydown', keydownLayer);
    layer.addEventListener('keydown', keydownLayer);

    if (eipPopupEls.tabEl[tabIndex]) {
      window.addEventListener('resize', () => {
        scrollbar.resize(eipPopupEls.tabEl[tabIndex].querySelector('.eip-popup__tab--select-wrap'));
        scrollbar.resize(eipPopupEls.tabEl[tabIndex].querySelector('.eip-popup__tab--table-wrap'));
      });
    }
  }

  function keydownLayer(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      const firstFocusEl = eipPopupEls.layerEl.querySelectorAll('a, button, input:not([type="hidden"]), textarea')[0];

      if (firstFocusEl && evt.target === firstFocusEl) {
        evt.preventDefault();
        document.querySelector(`${selector.section} ${selector.close}`).focus();
      }
    }
  }

  function keydownCloseBtn(evt) {
    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();
      const firstFocusEl = eipPopupEls.layerEl.querySelectorAll('a, button, input:not([type="hidden"]), textarea')[0];

      if (firstFocusEl) {
        firstFocusEl.focus();
      }
    }
  }


  function originFocus() {
    if (eipPopupEls.parentEl !== null) {
      eipPopupEls.parentEl.focus();
      eipPopupEls.parentEl = null;
    } else {
      utils.buyingFocus('eipPopup');
      // if (document.querySelector('.pd-buying-tool [data-target-popup="eipPopup"]') !== null) {
      //   document.querySelector('.pd-buying-tool [data-target-popup="eipPopup"]').focus();
      // }
    }
  }

  function utilsShow() {
    utils.popupControl.open(closePopup);
    utils.hiddenScroll();
    utils.setMobileFocusLoop(eipPopupEls.el);
  }

  function utilsHide() {
    utils.popupControl.close();
    utils.visibleScroll();
    utils.removeMobileFocusLoop();
  }

  function closePopup() {
    if (document.querySelector('.eip-popup__frame iframe')) {
      document.querySelector('.eip-popup__frame iframe').src = '';
    }

    tabIndex = -1;
    selectItemIndex = -1;

    eipPopupEls.layerEl.classList.remove('eip-popup--show');
    eipPopupEls.el.removeAttribute('style');
    utilsHide();
    originFocus();
  }

  function showPopup(btn) {
    eipPopupEls.el.style.display = 'block';
    eipPopupEls.layerEl.classList.add('eip-popup--show');
    // eipPopupEls.el.focus();

    const firstFocusEl = eipPopupEls.layerEl.querySelectorAll('a, button, input:not([type="hidden"]), textarea')[0];
    firstFocusEl.focus();

    layerPopupMaxHeight.reInit(eipPopupEls.layerEl);
    utilsShow();

    if (btn !== undefined) {
      eipPopupEls.parentEl = btn;
    }
  }

  function bindAdditionalEvent() {
    tabIndex = 0;
    selectItemIndex = 0;

    const selectTabEl = eipPopupEls.tabEl[tabIndex];
    const moDropdownEl = selectTabEl.querySelector('.eip-popup__tab--dropdown');
    const selectWrapEl = selectTabEl.querySelector('.eip-popup__tab--select-wrap');
    const tableWrapEl = selectTabEl.querySelector('.eip-popup__tab--table-wrap');
    const selectItemEls = selectTabEl.querySelectorAll('.eip-popup__tab--select-item');

    selectTabEl.classList.add('active');
    selectItemEls[selectItemIndex].classList.add('active');

    scrollbar.resize(selectWrapEl);
    scrollbar.resize(tableWrapEl);

    moDropdownEl.removeEventListener('click', dropdownEvent);
    moDropdownEl.addEventListener('click', dropdownEvent);

    selectWrapEl.querySelectorAll('.eip-popup__tab--select-item button').forEach((el) => {
      el.removeEventListener('click', selectItemEvent);
      el.addEventListener('click', selectItemEvent);
    });
  }

  function dropdownEvent(e) {
    const eTarget = $q(e.target);
    if (eTarget.hasClass('open')) {
      eTarget.removeClass('open');
      eTarget.closest('.eip-popup__tab').find('.eip-popup__tab--select-wrap').removeClass('open');
    } else {
      eTarget.addClass('open');
      eTarget.closest('.eip-popup__tab').find('.eip-popup__tab--select-wrap').addClass('open');
    }
  }

  function selectItemEvent(e){
    const eTarget = $q(e.target);
    eTarget.closest('.eip-popup__tab').find('.eip-popup__tab--select-item').removeClass('active');
    eTarget.closest('.eip-popup__tab--select-item').addClass('active');
    eTarget.closest('.eip-popup__tab').find('.eip-popup__tab--dropdown').target[0].innerHTML = eTarget.target[0].innerHTML;
    eTarget.closest('.eip-popup__tab').find('.eip-popup__tab--dropdown').removeClass('open');
    eTarget.closest('.eip-popup__tab').find('.eip-popup__tab--select-wrap').removeClass('open');
    selectItemIndex = eTarget.closest('.eip-popup__tab--select-item').index();
  }

  function resizeTableWrap() {
    scrollbar.resize(eipPopupEls.tabEl[tabIndex].querySelector('.eip-popup__tab--table-wrap'));
  }

  window.sg.components.eipPopup = { init, showPopup, bindAdditionalEvent, resizeTableWrap };

  $q.ready(init);
})();

(() => {
  const $q = window.sg.common.$q;
  const utils = window.sg.common.utils;
  const layerPopupMaxHeight = window.sg.common.layerPopupMaxHeight;
  const commonTab = window.sg.common.tab;

  const selector = {
    section: '.finance-popup',
    close: '.finance-popup .layer-popup__close',
    activeCls: 'is-active',
    tooltipOpenBtn: '.finance-popup__tooltip-btn',
    tooltipCloseBtn: '.finance-popup__tooltip-close-btn',
    placeholder: '.installment-select__placeholder',
    paymentSelect: '.installment-select',
    paymentSelectOptions: '.installment-select__options',
  };

  class FinancePopup {
    constructor(el) {
      this.els = {
        el,
        section: $q(el),
        financePopupContents: el.querySelector('.finance-popup .layer-popup__contents'),
        financePopupCloseBtn: el.querySelector('.layer-popup__close'),
        financePopup: el.querySelector('.finance-popup .layer-popup'),
      };

      this.handler = {
        tooltipOpen: this.tooltipOpen.bind(this),
        tooltipClose: this.tooltipClose.bind(this),
        activeSelect: this.activeSelect.bind(this),
        activeOption: this.activeOption.bind(this),
      };
      this.init();
    }


    init() {
      if(FinancePopup.instances.get(this.els.el)) {
        return;
      }
      FinancePopup.instances.set(this.els.el, this);
      this.setProperty();
      this.bindEvents();
      this.deviceOpen();
      layerPopupMaxHeight.init(this.els.financePopup);
    }

    reInit() {
      this.setProperty();
      this.bindEvents();
      this.deviceOpen();
      layerPopupMaxHeight.init(this.els.financePopup);
    }

    setProperty() {
      this.els.tooltipOpenBtn = this.els.section.find(selector.tooltipOpenBtn);
      this.els.tooltipCloseBtn = this.els.section.find(selector.tooltipCloseBtn);
      this.els.placeholder = this.els.section.find(selector.placeholder);
      this.els.paymentSelectOptions =  this.els.section.find(`${selector.paymentSelectOptions} li`);
    }

    tabInit(open = false) {
      if (open === true) {
        Array.from(this.els.el.querySelectorAll('.finance-popup__panel')).forEach((item) => {
          const $item = $q(item);
          $item.removeClass(selector.activeCls);
        });
        this.els.el.querySelectorAll('.finance-popup__panel')[0].classList.add(selector.activeCls);

        commonTab.init(this.els.el.querySelector('.tab'), 0);
        layerPopupMaxHeight.setMax(this.els.financePopup);
      }

      Array.from(this.els.el.querySelectorAll('.tab__item')).forEach((item, idx) => {
        const $item = $q(item).find('button');
        const activeIdx = idx;

        $item.off('click').on('click', () => {
          this.activeTab(activeIdx);
        });
      });
    }

    bindEvents() {
      this.els.financePopupCloseBtn.addEventListener('click', this.close.bind(this));

      $q(window).on('resize', () => {
        layerPopupMaxHeight.setMax(this.els.financePopup);
      });

      const closeBtn = document.querySelector(selector.close);
      closeBtn.removeEventListener('keydown', keydownCloseBtn);
      closeBtn.addEventListener('keydown', keydownCloseBtn);

      this.els.el.removeEventListener('keydown', keydownLayer);
      this.els.el.addEventListener('keydown', keydownLayer);

      this.els.tooltipOpenBtn.off('click', this.handler.tooltipOpen).on('click', this.handler.tooltipOpen);
      this.els.tooltipCloseBtn.off('click', this.handler.tooltipClose).on('click', this.handler.tooltipClose);

      if(this.els.el.querySelectorAll('.finance-popup__panel').length){
        this.tabInit();
      }

      if(this.els.placeholder) {
        this.els.placeholder.off('click', this.handler.activeSelect).on('click', this.handler.activeSelect);
      }
    }

    deviceOpen() {
      this.els.el.paymentSelectOptions = this.els.el.querySelectorAll(`${selector.paymentSelectOptions} li`);
      [...this.els.el.paymentSelectOptions].forEach((option) => {
        option.querySelector('a').removeEventListener('click', this.handler.activeOption);
        option.querySelector('a').addEventListener('click', this.handler.activeOption);
      });
    }

    activeSelect(event) {
      event.preventDefault();
      const eTarget = event.target.closest(selector.paymentSelect).querySelector(selector.placeholder);
      const itemSelect = eTarget.closest(selector.paymentSelect);
      if (!itemSelect.classList.contains('is-opened')) {
        this.openSelect(eTarget);
      } else {
        this.closeSelect(eTarget);
      }
    }

    openSelect(item) {
      const itemSelect = item.closest(selector.paymentSelect);
      const itemSelectOption = itemSelect.querySelector(selector.paymentSelectOptions);
      const globalText = JSON.parse(itemSelect.dataset.globalText);

      item.setAttribute('aria-expanded', true);
      item.querySelector('.hidden').innerText = globalText.Collapse;
      itemSelect.classList.add('is-opened');
      itemSelectOption.setAttribute('aria-hidden', false);

      /* P6 Modify => 그리는 시점과 이벤트 먹이는 시점이 안맞아서 0.3초 딜레이 */
      setTimeout(() => {
        this.els.el.paymentSelectOptions = this.els.el.querySelectorAll(`${selector.paymentSelectOptions} li`);
        [...this.els.el.paymentSelectOptions].forEach((option) => {
          option.querySelector('a').removeEventListener('click', this.handler.activeOption);
          option.querySelector('a').addEventListener('click', this.handler.activeOption);
        });
      }, 300);
    }

    closeSelect(item) {
      const itemSelect = item.closest(selector.paymentSelect);
      const itemSelectOption = itemSelect.querySelector(selector.paymentSelectOptions);
      const globalText = JSON.parse(itemSelect.dataset.globalText);

      item.setAttribute('aria-expanded', false);
      item.querySelector('.hidden').innerText = globalText.Expand;
      itemSelect.classList.remove('is-opened');
      itemSelectOption.setAttribute('aria-hidden', true);
    }

    activeOption(event) {
      event.preventDefault();
      const item = event.target.closest('li');
      const itemWrap = event.target.closest(selector.paymentSelect);

      itemWrap.querySelectorAll(`${selector.paymentSelectOptions} li`).forEach((li) => {
        li.classList.remove('is-selected');
      });
      item.classList.add('is-selected');
      if (!itemWrap.classList.contains('is-selected')) {
        itemWrap.classList.add('is-selected');
      }
      itemWrap.querySelector('.installment-select__placeholder-name span').innerText = item.querySelector('.finance-popup__installment-select__choose-name').textContent;

      this.activeSelect(event);
    }
    close() {
      this.els.el.style.display = 'none';

      utilsHide();

      if (utils.getMobileOS() === 'ios') {
        setTimeout(() => originFocus(this.focusTargetEl), 200);
      } else {
        originFocus(this.focusTargetEl);
      }
    }
    open(targetEl) {
      this.focusTargetEl = targetEl;
      this.els.el.style.display = 'block';
      if(this.els.el.querySelectorAll('.finance-popup__panel').length) {
        this.tabInit(true);
      }

      if (utils.getMobileOS() === 'ios') {
        setTimeout(() => utils.setFocusFirstFocusableEl(this.els.el), 200);
      } else {
        setTimeout(() => utils.setFocusFirstFocusableEl(this.els.el), 0);
      }

      utilsShow(this.els.el);
    }

    activeTab(idx) {
      Array.from(this.els.el.querySelectorAll('.finance-popup__panel')).forEach((tabEl, tabIdx) => {
        const $tabEl = $q(tabEl);

        if (tabIdx === idx) {
          $tabEl.addClass(selector.activeCls);
        } else {
          $tabEl.removeClass(selector.activeCls);
        }
      });

      layerPopupMaxHeight.setMax(this.els.financePopup);
    }

    tooltipOpen(e) {
      this.els.section.find('.finance-popup__tooltip').removeClass('finance-popup__tooltip--show');
      this.els.section.find('.finance-popup__tooltip').removeClass('finance-popup__tooltip--left');
      $q(e.target).closest('.finance-popup__tooltip').addClass('finance-popup__tooltip--show');

      const tooltipX = utils.isRtl() ? this.els.section.find('.finance-popup__content').target[0].getBoundingClientRect().right - $q(e.target).closest('.finance-popup__tooltip').find('.finance-popup__tooltip-box').target[0].getBoundingClientRect().right : $q(e.target).closest('.finance-popup__tooltip').find('.finance-popup__tooltip-box').target[0].getBoundingClientRect().left - this.els.section.find('.finance-popup__content').target[0].getBoundingClientRect().left;
      
      if(tooltipX <= 0) {
        $q(e.target).closest('.finance-popup__tooltip').addClass('finance-popup__tooltip--left');
      }
    }

    tooltipClose(e) {
      $q(e.target).closest('.finance-popup__tooltip').removeClass('finance-popup__tooltip--show');
      $q(e.target).closest('.finance-popup__tooltip').removeClass('finance-popup__tooltip--left');
    }
  }

  FinancePopup.instances = new WeakMap();

  function keydownLayer(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      const firstEl = document.querySelector(`${selector.section}`)
        .querySelectorAll('a, button, input:not([type="hidden"]), textarea')[0];

      if (firstEl && evt.target === firstEl) {
        evt.preventDefault();
        document.querySelector(`${selector.close}`).focus();
      }
    }
  }

  function keydownCloseBtn(evt) {
    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();

      document.querySelector(`${selector.section}`)
        .querySelectorAll('a, button, input:not([type="hidden"]), textarea')[0].focus();
    }
  }

  function originFocus(focusTargetEl) {
    if (focusTargetEl && focusTargetEl  instanceof Element) {
      focusTargetEl.focus();
    } else {
      utils.buyingFocus('financePopup');
    }
  }

  function utilsShow(popupEl) {
    utils.popupControl.open(closePopup);
    utils.hiddenScroll();
    utils.setMobileFocusLoop(popupEl);
  }

  function utilsHide() {
    utils.popupControl.close();
    utils.visibleScroll();
    utils.removeMobileFocusLoop();
  }

  function showPopup(targetEl = null) {
    FinancePopup.instances.get(document.querySelector(selector.section)).open(targetEl);
  }

  function closePopup() {
    FinancePopup.instances.get(document.querySelector(selector.section)).close();
  }

  const financePopup = {
    initAll() {
      [...document.querySelectorAll(selector.section)].forEach((el) => {
        if (!FinancePopup.instances.has(el)) {
          new FinancePopup(el);
        }
      });
    },
    showPopup,
    reInit() {
      document.querySelectorAll(selector.section).forEach((el) => {
        if (FinancePopup.instances.has(el)) {
          FinancePopup.instances.get(el).reInit();
        } else {
          new FinancePopup(el);
        }
      });
    },
  };

  window.sg.components.financePopup = financePopup;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', financePopup.initAll);
  } else {
    financePopup.initAll();
  }
})();

(function ($) {

	const Monthly_I18N = Granite.I18n.get("Monthly payment");
	const Cost_I18N = Granite.I18n.get("Cost of purchase");
	const Instalment_I18N = Granite.I18n.get("Instalment rate");
	const Total_I18N = Granite.I18n.get("Total cost inc. interest");
	const Instant_I18N = Granite.I18n.get("Instant decision at checkout");

	let storeDomain = $("#storeDomain").val();
	const siteCode = $("#siteCode").val();
	const priceCurrency = $("#tempTitle").val() == "page-pf" ? $("#pfPriceCurrency").val() : $("#priceCurrency").val();
	
	//calculateInstallment API를 호출하는 대상 국가가 추가되는 경우에 siteCode추가 
	const calculateInstallmentList = ["uk", "ee", "lv", "lt", "pl", "hu", "es", "ro", "ua","nz","sg","my","ph","vn","th","sk","cz","cn"]; 
	const calculateInstallmentSet = new Set(calculateInstallmentList);
	const isCalculateInstallment = calculateInstallmentSet.has(siteCode);

	
	// b2b 분기 추가
	const isB2B = $("#b2bFlag").val() === "Y" ? true : false;
	/**
	 * 각 국가의 code 별 Description html
	 */
	var emiDescEachSiteCode = function(siteCode, code, descriptionText){
		var descriptionHtml = "";

		if(!code){
			return "";
		}

		var lowerCode = code.toLowerCase();
		if(siteCode == "id"){ //new-hybris
			/* TODO id 요건에 맞게 추가 예정 */
		}else if(siteCode == "uk" && isB2B){
			//COMP6FE-1590 [SMB] Financing Calculator& Leasing
			descriptionHtml +=  '<div class="finance-popup__description">'+
									'<p>The Representative Example below shows the typical costs of using Samsung Finance to purchase your Samsung products: <strong>0.0% APR Representative (fixed)</strong>. Based on an initial 10% deposit of <strong>£76.90</strong>, and an assumed credit totaling <strong>£692.10</strong> over <strong>12 months</strong> at an interest rate of <strong>0.0% p.a. (fixed).</strong> Monthly repayment <strong>£57.67</strong>. Total amount payable <strong>£769.00</strong>.</p>'+
								'</div>'+
								'<div class="finance-popup__disclaimer">'+
									'<p>*All credit is subject to status and available to UK Sole Traders over 18, with a UK bank account and valid driver’s license, passport or identity card. The displayed quote is VAT inclusive, final estimates are made upon checkout.</p>'+
									'<br><p>Credit duration is variable, and you could be offered a rate of 9.9% APR, based on your financial circumstances and what you tell us. Minimum upfront payment of 10% is required and fixed monthly repayments. By accepting our credit offer, you consent to a credit check being completed, which will appear on your credit file.</p>'+
								'</div>'+
								'<div class="finance-popup__credit">'+
									'<div class="finance-popup__credit-img">'+
										'<img src="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/logo-samsung-finance.png" alt="Samsung Finance">'+
									'</div>'+
									'<div class="finance-popup__credit-text">'+
										'Samsung Electronics (UK) Limited (Registered no: 03086621), registered at Samsung House, 2000 Hillswood Drive, Chertsey, Surrey KT16 0RS, United Kingdom, acts as a credit broker and not as a lender. Samsung is authorised and regulated by the Financial Conduct Authority (FRN 727333). Credit is provided by Glow Financial Services Limited, 71 Queen Victoria Street, London EC4V 4BE. Registered in England No. 09127663. Glow Financial Services Limited is authorised and regulated by the Financial Conduct Authority (Reference No. 751308). Glow Financial Services acting as lender, under brand license as Samsung Finance (powered by Glow) through Samsung Electronics (UK) Limited. The Financial Services Register can be accessed through <a href="http://www.fca.org.uk" target="_blank" aria-label="www.fca.org.uk Open in a New Window">www.fca.org.uk</a>.'+
									'</div>'+
								'</div>';
		}else if(siteCode == "uk"){
			if(lowerCode == "uk-paypalcreditpaymentmode"){
				descriptionHtml +=  '<div class="finance-popup__description">'+
										'<strong>What is the cost of PayPal Credit outside of promotional offers?</strong>'+
										'<p>The Representative Example below shows the typical costs of using a PayPal Credit Limit, without using <br>promotional offers:</p>'+
										'<p><b>Representative example:</b></p>'+
										'<p><b>Purchase Rate: 23.9 % p.a. (variable)</b></p>'+
										'<p><b>Representative: 23.9 % APR (variable)</b></p>'+
										'<p><b>Assumed credit limit: £1,200.00</b></p>'+
										'<p><i>Subject to credit status and T&C’s</i></p>'+
									'</div>'+
									'<div class="finance-popup__credit">'+
										'<div class="finance-popup__credit-img">'+
											'<img src="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/logo-paypal-credit.png" alt="paypal credit">'+
										'</div>'+
										'<div class="finance-popup__credit-text">'+
											'Subject to status and credit approval. Finance provided by PayPal Credit. S amsung Electronics (UK) Limited acts as a broker and offers finance from a limited number of providers. PayPal Credit and PayPal Pay in 3 are trading names of PayPal UK Ltd, Whittaker House, Whittaker Avenue, Richmond-Upon-Thames, Surrey, United Kingdom, TW9 1EH. Please be aware that late or missing repayments may also affect your credit rating, which could make it more difficult or expensive for you to obtain credit in the future. T&Cs apply.'+
										'</div>'+
									'</div>';
				
			}else if(lowerCode == "uk-klarnathreeinstallmentspaymentmode" || lowerCode == "uk-klarnasliceitpaymentmode"){
				descriptionHtml +=  '<div class="finance-popup__description">'+
					                	'<p>'+
						                'Representative Example without 0% or 9.90% offers: Representative 14.9% APR (variable)<br>'+
						                'Purchase interest rate 14.9%p.a (variable) Assumed credit limit £1,200*<br>'+
						                'Displayed quote is not generated by Klarna, final estimates are made upon checkout.'+
						                '</p>'+
					                '</div>'+
					                '<div class="finance-popup__credit">'+
						                '<div class="finance-popup__credit-img">'+
						                	'<img src="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/logo-klarna.png" alt="Klarna slice it">'+
						                '</div>'+
						                '<div class="finance-popup__credit-text">'+
					                	'*Subject to financial circumstances. You must be at least 18. Credit is provided by Klarna Bank AB, which is authorised and regulated by the Swedish Financial Services Authority, with limited supervision by the Financial Conduct Authority and Prudential Regulation Authority in the UK. Registered office: Sveavägen 46, 111 34 Stockholm, Sweden. Corporation ID number: 556737-0431. If you already have a Klarna Credit account, this purchase will be added to your balance. In case of partial approval, a down payment may be required. <a href="https://cdn.klarna.com/1.0/shared/content/legal/terms/0/en_gb/account_agreement" target="_blank" aria-label="T&Cs apply Open in a New Window">T&Cs apply.</a>'+
						                '</div>'+
					                '</div>';
			}else if(lowerCode == "uk-glowpaymentmode"){
				descriptionHtml +=  '<div class="finance-popup__description">'+
										'<p>The Representative Example below shows the typical costs of using Samsung Finance to purchase your Samsung products: <strong>0.0% APR Representative (fixed)</strong>. Based on an initial 10% deposit of <strong>£76.90</strong>, and an assumed credit totaling <strong>£692.10</strong> over <strong>12 months</strong> at an interest rate of <strong>0.0% p.a. (fixed).</strong> Monthly repayment <strong>£57.67</strong>. Total amount payable <strong>£769.00</strong>.</p>'+
									'</div>'+
									'<div class="finance-popup__disclaimer">'+
										'<p>*All credit is subject to status and available to UK residents over 18, with a UK bank account and valid driver’s license, passport or identity card. Credit duration is variable, and you could be offered a rate of 9.9% APR, based on your financial circumstances and what you tell us. Minimum upfront payment of 10% is required and fixed monthly repayments. By accepting our credit offer, you consent to a credit check being completed, which will appear on your credit file.</p>'+
									'</div>'+
									'<div class="finance-popup__credit">'+
										'<div class="finance-popup__credit-img">'+
											'<img src="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/logo-samsung-finance.png" alt="Samsung Finance">'+
										'</div>'+
										'<div class="finance-popup__credit-text">'+
											'Samsung Electronics (UK) Limited (Registered no: 03086621), registered at Samsung House, 2000 Hillswood Drive, Chertsey, Surrey KT16 0RS, United Kingdom, acts as a credit broker and not as a lender. Samsung is authorised and regulated by the Financial Conduct Authority (FRN 727333). Credit is provided by Glow Financial Services Limited, 71 Queen Victoria Street, London EC4V 4BE. Registered in England No. 09127663. Glow Financial Services Limited is authorised and regulated by the Financial Conduct Authority (Reference No. 751308). Glow Financial Services acting as lender, under brand license as Samsung Finance (powered by Glow) through Samsung Electronics (UK) Limited. The Financial Services Register can be accessed through <a href="http://www.fca.org.uk" target="_blank" aria-label="www.fca.org.uk Open in a New Window">www.fca.org.uk</a>.'+
										'</div>'+
									'</div>';
			}
		} else if(siteCode == "ee" || siteCode ==  "lv" || siteCode ==  "lt" || siteCode == "pl" || siteCode == "hu" || siteCode == "ro" || siteCode == "ua" || siteCode == "nz" || siteCode == "sg" || siteCode == "my" || siteCode == "ph" || siteCode == "vn" || siteCode == "sk" || siteCode == "cz" || siteCode == "cn"){
			descriptionHtml +=  '<div class="finance-popup__description">'+
									'<p>'+
										descriptionText+
									'</p>'+
								'</div>';
			
		}
		
		
		return descriptionHtml;
	}

	function emiDataGrid(values, siteCode) {
		//COMP6FE-1590 [SMB] Financing Calculator& Leasing
		if(isB2B && siteCode ==='uk'){
			values = values.filter(list => list.code === 'uk-glowFinancePaymentMode');
		}
		var tabHtml = "";
		var contentHtml = "";
		var $eipArea = $(".finance-popup");
		var $contentArea = $eipArea.find(".finance-popup__content");
		var reg = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/ ]/gim; //특수문자 공백 제거 정규식
		
		/* content영역 remove */
		if($contentArea.length > 0){
			$contentArea.children().remove();
		}
		/* Tab 전체 틀 */
		tabHtml += 	'<div class="tab">';
		tabHtml += 		'<ul class="tab__list" role="tablist">';

		for(var idx=0; idx<values.length; idx++){
			/* 하나의 탭 data */
			var tabData = values[idx];
			const tabNameOnlyText = tabData.name?tabData.name.replace(reg, ""):'';
			tabHtml += '<li class="tab__item" role="presentation">';
			tabHtml += '	<button class="tab__item-title" role="tab" aria-controls="tabPanel'+tabNameOnlyText+'">';
			tabHtml += 			tabData.name;
			tabHtml += '		<span class="tab__item-line"></span>';
			tabHtml += '	</button>';
			tabHtml += '</li>';
			
			if(idx==0){
				contentHtml += 	'<div class="finance-popup__panel is-active" role="tabpanel" id="tabPanel'+tabNameOnlyText+'">'; 
			}else{
				contentHtml += 	'<div class="finance-popup__panel" role="tabpanel" id="tabPanel'+tabNameOnlyText+'">';
			}
			contentHtml +=  	'<h3 class="hidden">'+tabData.name+'</h3>'+
								'<div class="finance-popup__site-content">'+
								'<div class="finance-popup__box-wrap">';
			
			if(siteCode === "uk" && isB2B){
				//COMP6FE-1590 [SMB] Financing Calculator& Leasing
				contentHtml += 	'<div class="finance-popup__additional">'+
									'<strong class="finance-popup__additional-title">Business essentials on demand</strong>'+
									'<div class="finance-popup__additional-content">'+
										'<p>Discover flexible ways to pay for the Samsung products you need to make your business run effectively.</p>'+
									'</div>'+
								'</div>';

			}else if(siteCode == "uk" && tabData.code.toLowerCase() == "uk-glowpaymentmode"){
				contentHtml += 	'<div class="finance-popup__additional">'+
									'<strong class="finance-popup__additional-title">See it. Love it. Spread the cost.</strong>'+
									'<div class="finance-popup__additional-content">'+
										'<p>Discover flexible ways to pay for your favourite Samsung products</p>'+
										'<p>Pay as little as <strong>10%</strong> upfront and the balance with interest-free credit*</p>'+
									'</div>'+
								'</div>';
			}
			
			var descriptionText = "";
			/* content data Grid */
			if(tabData.values && tabData.values.length > 0){
				contentHtml += 	'<div class="finance-popup__box-list" role="list">';
							
				for(var jdx=0; jdx<tabData.values.length; jdx++){
					var contentData = tabData.values[jdx];
					
					if(siteCode == "uk" || siteCode == "ro" || siteCode == "ua" || siteCode == "nz" || siteCode == "sg" || siteCode == "my" || siteCode == "ph" || siteCode == "vn" || siteCode == "cn"){
						contentHtml += 	'<div class="finance-popup__box" role="listitem">'+
											'<strong class="finance-popup__box-title">'+(siteCode == "ro" ? contentData.periodLabel+' rate' :
																						 siteCode == "nz" ? contentData.code+' '+contentData.period :
																						 siteCode == "ua" ? contentData.code + " місяців" :
																						 contentData.code)+'</strong>'+
											'<div class="finance-popup__box-payment" role="list">'+
												'<p class="finance-popup__box-payment-price" role="listitem">'+(siteCode == "ro" ? currencyComma(contentData.monthlyContractFee,priceCurrency) : contentData.periodicValue)+'</p>'+
												'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Monthly payment")+'</p>'+
											'</div>'+
											'<div class="finance-popup__box-payment" role="list">'+
												'<p class="finance-popup__box-payment-price" role="listitem">'+(siteCode == "ro" ? currencyComma(contentData.purchaseCost,priceCurrency) : contentData.purchaseCost)+'</p>'+
												'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Cost of purchase")+'</p>'+
											'</div>'+
											'<div class="finance-popup__box-payment" role="list">'+
												'<p class="finance-popup__box-payment-price" role="listitem">'+((siteCode == "uk" || siteCode == "nz") ? contentData.interestRate+' %p.a. (fixed)' : (siteCode=="ro" || siteCode=="ua") ? parseInt(contentData.totalInterest)+'%' : contentData.interestRate+'%')+'</p>'+
												'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Instalment rate")+'</p>'+
											'</div>'+
											'<div class="finance-popup__box-payment" role="list">'+
												'<p class="finance-popup__box-payment-price" role="listitem">'+(siteCode == "ro" ? currencyComma(contentData.totalCost,priceCurrency) : contentData.totalCost)+'</p>'+
												'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Total cost inc. interest")+'</p>'+
											'</div>'+
											(siteCode == "uk" ? '<p class="finance-popup__box-description">'+Granite.I18n.get("Instant decision at checkout")+'</p>' : '')+
										'</div>';	//.finance-popup__box End
					}else if(siteCode == "ee" || siteCode == "lv" || siteCode == "lt" || siteCode == "pl" || siteCode == "hu" || siteCode == "sk"  || siteCode == "cz"){
						contentHtml += 	'<div class="finance-popup__box" role="listitem">';
						if((siteCode == "sk" || siteCode == "cz") && (contentData.periodLabel !== null && contentData.periodLabel !== undefined && contentData.periodLabel !== "")){
							contentHtml += 	'    <div class="finance-popup__box-title-wrap">';
						}
						
						if(contentData.period !== null && contentData.period !== undefined && contentData.period !== "" && contentData.code !== null && contentData.code !== undefined && contentData.code !== "" && contentData.apr !== null && contentData.apr !== undefined && contentData.apr !== "") {
							if(contentData.period == "MONTHLY") {
								if(contentData.periodLabel !== null && contentData.periodLabel !== undefined && contentData.periodLabel !== "") {
									//periodLabel이 영문인 Months로 오는 경우는 i18n처리 Months가 아닌 경우 즉, 로컬어인 경우는 그대로 노출
									if(contentData.periodLabel == "Months") {
										contentHtml += '<strong class="finance-popup__box-title">'+contentData.code+' '+Granite.I18n.get("Months")+'</strong>';
									} else {
										contentHtml += '<strong class="finance-popup__box-title">'+contentData.code+' '+contentData.periodLabel+'</strong>';
									}
								} else {
									contentHtml += '	<strong class="finance-popup__box-title">'+contentData.code+' '+Granite.I18n.get("Months")+'</strong>';
								}
							} else {
								if(siteCode == "sk" || siteCode == "cz") {
									contentHtml += '		<strong class="finance-popup__box-title">'+contentData.period+'</strong>';
								} else if(siteCode != "sk" && siteCode != "cz") {
									contentHtml += '		<strong class="finance-popup__box-title">'+contentData.code+' '+contentData.periodLabel+'</strong>';
								}
							}
						} else if(contentData.period !== null && contentData.period !== undefined && contentData.period !== "" && contentData.code !== null && contentData.code !== undefined && contentData.code !== "") {
							//CRHQ-9494 [B2C] hu EMI(finance) 팝업내 정보 변경
							if(siteCode == "hu") {
								contentHtml += '<strong class="finance-popup__box-title">'+contentData.code+' '+'hónap futamidő</strong>';
							}
						}
						
						
						//sk, cz tooltip (NOTICE : 다른 국가도 동일 요소를 툴팁으로 사용하는 경우에는 siteCode만 OR조건으로 추가하면 되나 다른 요소일때는 별도 분기구조를 고려 해야 함. ) 
						if(siteCode == "sk"  || siteCode == "cz"){
							if(contentData.periodLabel !== null && contentData.periodLabel !== undefined && contentData.periodLabel !== "") {
								contentHtml += 	'<div class="finance-popup__tooltip">';
								contentHtml += 	'    <button class="finance-popup__tooltip-btn">';
								contentHtml += 	'        <span class="hidden"></span>';
								contentHtml += 	'            <svg class="icon finance-popup__tooltip-icon" focusable="false" aria-hidden="true">';
								contentHtml += 	'            <use xlink:href="#icon-info-bold" href="#icon-info-bold"></use>';
								contentHtml += 	'            </svg>';
								contentHtml += 	'    </button>';
								contentHtml += 	'    <div class="finance-popup__tooltip-box">';
								contentHtml += 	'        <div class="finance-popup__tooltip-box-text">'+contentData.periodLabel+'</div>';
								contentHtml += 	'        <button class="finance-popup__tooltip-close-btn">';
								contentHtml += 	'            <span class="hidden"></span>';
								contentHtml += 	'            <svg class="icon finance-popup__tooltip-close-icon" focusable="false" aria-hidden="true">';
								contentHtml += 	'                <use xlink:href="#delete-bold" href="#delete-bold"></use>';
								contentHtml += 	'            </svg>';
								contentHtml += 	'        </button>';
								contentHtml += 	'    </div>';
								contentHtml += 	'</div>';
							}
						}

						if((siteCode == "sk" || siteCode == "cz") && (contentData.periodLabel !== null && contentData.periodLabel !== undefined && contentData.periodLabel !== "")){
							contentHtml += 	'</div>'; //finance-popup__box-title-wrap 닫는태그
						}
						
						if(contentData.purchaseCost !== null && contentData.purchaseCost !== undefined && contentData.purchaseCost !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.purchaseCost+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Amount to be financed")+'</p>'+
														'</div>';
						}
						if(contentData.periodicValue !== null && contentData.periodicValue !== undefined && contentData.periodicValue !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.periodicValue+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Monthly payment")+'</p>'+
														'</div>';
						}
						if(contentData.interestRate !== null && contentData.interestRate !== undefined && contentData.interestRate !== "") {
							if(siteCode == "hu") {
								//only hu 
								contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
								'<p class="finance-popup__box-payment-price" role="listitem">'+(contentData.interestRate*100).toFixed(2)+'%</p>'+
								'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Fixed annual interest rate")+'</p>'+
							'</div>';

							} else {
								//기존 로직 
								contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
								'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.interestRate+'</p>'+
								'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Fixed annual interest rate")+'</p>'+
							'</div>';

							}
						}
						if(contentData.annualContractFee !== null && contentData.annualContractFee !== undefined && contentData.annualContractFee !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.annualContractFee+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Contract award fee")+'</p>'+
														'</div>';
						}
						if(contentData.monthlyContractFee !== null && contentData.monthlyContractFee !== undefined && contentData.monthlyContractFee !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.monthlyContractFee+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Monthly contract fee")+'</p>'+
														'</div>';
						}
						if(contentData.apr !== null && contentData.apr !== undefined && contentData.apr !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.apr+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Annual percentage rate of charge for consumer credit")+'</p>'+
														'</div>';
						}
						if(contentData.totalCost !== null && contentData.totalCost !== undefined && contentData.totalCost !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.totalCost+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Total amount payable")+'</p>'+
														'</div>';
						}
						if(contentData.code !== null && contentData.code !== undefined && contentData.code !== "") {
							if(siteCode == "sk" || siteCode == "cz") {
								contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
								'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.period+'</p>'+
								'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Term of the contract")+'</p>'+
								'</div>';
							} else if(siteCode != "sk" && siteCode != "cz") {
								contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
								'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.code+'</p>'+
								'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Term of the contract")+'</p>'+
								'</div>';
							}
						}
						if(contentData.downPayment !== null && contentData.downPayment !== undefined && contentData.downPayment !== "") {
							contentHtml += 				'<div class="finance-popup__box-payment" role="list">'+
															'<p class="finance-popup__box-payment-price" role="listitem">'+contentData.downPayment+'</p>'+
															'<p class="finance-popup__box-payment-text" role="listitem">'+Granite.I18n.get("Downpayment")+'</p>'+
														'</div>';
						}
						
						contentHtml += 			'</div>';	//.finance-popup__box End
						
					}
					if(jdx == tabData.values.length-1){
						if(siteCode == "ee"){
							descriptionText = 	'Tähelepanu, tegemist on finantsteenusega! Inbank järelmaksu krediidikulukuse määr on '+contentData.interestRate+'% aastas järgmistel näidistingimustel: '+
												'lepingueseme hind kohe tasudes (netohind) '+contentData.purchaseCost+', krediidisumma '+contentData.totalCost+', sissemakse '+contentData.downPayment+' , lepinguperiood '+contentData.code+' kuud, fikseeritud intressimäär aastas '+contentData.interestRate+'% arvestatuna ostusummalt, lepingutasu '+contentData.annualContractFee+', igakuine haldustasu '+contentData.monthlyContractFee+'. '+
												'Igakuine osamakse '+contentData.periodicValue+', krediidi kogusumma ja tagasimaksete summa '+contentData.totalCost+'. '+ 
												'Finantsteenuse osutajaks on AS Inbank Finance (Niine 11, Tallinn, www.inbank.ee, tel 640 8080). Enne lepingu sõlmimist tutvu tingimustega ja vajadusel pea nõu.';
						} else if(siteCode == "lv") {
							descriptionText = 	'Reprezentatīvs piemērs:<br>'+
												'Aizdevuma summa - '+contentData.purchaseCost+', līguma termiņš – '+contentData.code+' mēn., procentu likme - '+contentData.interestRate+'%, noformēšanas maksa - '+contentData.annualContractFee+' , ikmēneša apkalpošanas maksa – '+contentData.monthlyContractFee+' , ikmēneša maksājums – '+contentData.periodicValue+' , kopējā atmaksājamā summa – '+contentData.totalCost+' , gada procentu likme (GPL) - '+contentData.apr+'%.<br>'+
												'Kalkulatora aprēķinātie dati ir informatīvi un sniedz aptuvenu priekšstatu. Informācija var mainīties balstoties uz Jūsu maksātspēju vai izvēloties citu līguma termiņu un maksājuma datumu.';
						} else if(siteCode == "lt") {
							descriptionText = 	'Pavyzdžiui, skolinantis '+contentData.purchaseCost+' , kai sutartis sudaroma '+contentData.code+' mėn. terminui, metinė palūkanų norma – '+contentData.interestRate+'%, sutarties sudarymo mokestis - '+contentData.annualContractFee+' , mėnesio sutarties mokestis – '+contentData.monthlyContractFee+' , BVKKMN – '+contentData.apr+'%, bendra mokėtina suma – '+contentData.totalCost+' , mėnesio įmoka – '+contentData.periodicValue+'.';
						} else if(siteCode == "pl") {
							if(!checkEppSite() && !isB2B) {
								//only B2C (CRHQ-1026 [B2C] PL - EMI 팝업 내 disclaimer 변경)
								descriptionText = 	`**Przykłady reprezentatywne
									<br><br><br>
									"Raty 20x0%"
									<br><br>
									Dla kredytu na zakup towarów i usług oferowanego przez Santander Consumer Bank S.A. z siedzibą we Wrocławiu, dla propozycji „20 rat 0%” wyliczenia na podstawie przykładu reprezentatywnego na dzień 04.01.2024 r.
									są następujące: cena towaru 4700 zł, stała stopa oprocentowania kredytu: 0%, całkowity koszt kredytu: 0 zł, Rzeczywista Roczna Stopa Oprocentowania (RRSO) 0%, całkowita kwota kredytu: 4700 zł; czas obowiązywania umowy: 20 miesięcy; całkowita kwota do zapłaty 4700 zł; wysokość 20 miesięcznych równych rat 235 zł.
									Propozycja obowiązuje dla umów zawartych od 08.04.2024 do 30.06.2024 r.
									<br><br>
									Niniejsza propozycja nie jest ofertą w rozumieniu art. 66 Kodeksu Cywilnego. Decyzja o przyznaniu i warunkach kredytu z uwzględnieniem oceny aktualnej sytuacji Klienta zostanie podjęta przez Bank. Szczegóły na www.samsung.com oraz www.santanderconsumer.pl. Samsung Electronics Polska Sp. z o.o. występujący w roli pośrednika kredytowego informuje swoich Klientów o możliwości skorzystania z propozycji kredytu na zakup towarów i usług oferowanego przez Santander Consumer Bank S.A., udostępnia swoim Klientom wniosek o kredyt na zakup towarów i usług oraz przyjmuje oświadczenia o odstąpieniu od umów o kredyt na zakup towarów i usług zawartych przez Santander Consumer Bank S.A. za pośrednictwem Samsung Electronics Polska Sp. z o.o.
									<br><br><br>
									"Do 60 rat"
									<br><br>
									Dla kredytu na zakup towarów i usług oferowanego przez Santander Consumer Bank S.A. z siedzibą we Wrocławiu, dla propozycji „Do 60 rat” wyliczenia na podstawie przykładu reprezentatywnego na dzień 07.02.2024 r. są następujące: cena towaru 3700 zł, stała stopa oprocentowania kredytu: 18,50%, całkowity koszt kredytu: 585,22 zł obejmuje: prowizję: 185 zł, odsetki: 400,22 zł, Rzeczywista Roczna Stopa Oprocentowania (RRSO) 31,91%, całkowita kwota kredytu (bez kredytowanych kosztów): 3700 zł; czas obowiązywania umowy: 12 miesięcy; całkowita kwota do zapłaty 4285,22 zł; wysokość 11 miesięcznych równych rat 357,10 zł; ostatnia 12 rata w wysokości 357,12 zł.      
									<br><br>
									Niniejsza propozycja nie jest ofertą w rozumieniu art. 66 Kodeksu Cywilnego. Decyzja o warunkach i przyznaniu kredytu z uwzględnieniem oceny aktualnej sytuacji Klienta, zostanie podjęta przez Santander Consumer Bank S.A. Szczegóły na www.santanderconsumer.pl.
									<br><br>
									Samsung Electronics Polska Sp. z o.o. występujący w roli pośrednika kredytowego informuje swoich Klientów o możliwości skorzystania z propozycji kredytu na zakup towarów i usług oferowanego przez Santander Consumer Bank S.A., udostępnia swoim Klientom wniosek o kredyt na zakup towarów i usług oraz przyjmuje oświadczenia o odstąpieniu od umów o kredyt na zakup towarów i usług  zawartych przez Santander Consumer Bank S.A. za pośrednictwem Samsung Electronics Polska Sp. z o.o.`;
							} else {
								//B2C외 (B2B 또는 EPP)
								descriptionText = 	`Przykłady reprezentatywne
									<br><br><br>
									"Raty 20x0%"
									<br><br>
									Dla kredytu na zakup towarów i usług oferowanego przez Santander Consumer Bank S.A. z siedzibą we Wrocławiu, dla propozycji „20 rat 0%” wyliczenia na podstawie przykładu reprezentatywnego na dzień 01.07.2023 r. są następujące: cena towaru 4800 zł, stała stopa oprocentowania kredytu: 0%, całkowity koszt kredytu: 0 zł, Rzeczywista Roczna Stopa Oprocentowania (RRSO) 0%, całkowita kwota kredytu: 4800 zł; czas obowiązywania umowy: 20 miesięcy; całkowita kwota do zapłaty 4800 zł; wysokość 20 miesięcznych równych rat 240 zł. Propozycja obowiązuje dla umów zawartych od 03.07.2023 do 31.12.2023 r.<br>
									Niniejsza propozycja nie jest ofertą w rozumieniu art. 66 Kodeksu Cywilnego. Decyzja o przyznaniu i warunkach kredytu z uwzględnieniem oceny aktualnej sytuacji Klienta zostanie podjęta przez Bank. Szczegóły na www.santanderconsumer.pl<br>
									Samsung Electronics Polska Sp. z o.o. występujący w roli pośrednika kredytowego Santander Consumer Bank S.A., udostępnia swoim Klientom wniosek o kredyt na zakup towarów i usług oraz przyjmuje oświadczenia o odstąpieniu od umów o kredyt.<br>
									<br><br><br>
									"Do 60 rat"
									<br><br>
									Dla kredytu na zakup towarów i usług oferowanego przez Santander Consumer Bank S.A. z siedzibą we Wrocławiu, dla propozycji „Do 60 rat” wyliczenia na podstawie przykładu reprezentatywnego na dzień 15.02.2023 r. są następujące: cena towaru 2800 zł, stała stopa oprocentowania kredytu: 19%, całkowity koszt kredytu: 402,05 zł obejmuje: prowizję: 140 zł, odsetki: 262,05 zł, Rzeczywista Roczna Stopa Oprocentowania (RRSO) 34,76%, całkowita kwota kredytu (bez kredytowanych kosztów): 2800 zł; czas obowiązywania umowy: 10 miesięcy; całkowita kwota do zapłaty 3202,05 zł; wysokość 9 miesięcznych równych rat 320,21 zł; ostatnia 10 rata w wysokości 320,16 zł.<br>
									Niniejsza propozycja nie jest ofertą w rozumieniu art. 66 Kodeksu Cywilnego. Decyzja o przyznaniu i warunkach kredytu z uwzględnieniem oceny aktualnej sytuacji Klienta zostanie podjęta przez Bank. Szczegóły na www.santanderconsumer.pl<br>
									Samsung Electronics Polska Sp. z o.o. występujący w roli pośrednika kredytowego Santander Consumer Bank S.A., udostępnia swoim Klientom wniosek o kredyt na zakup towarów i usług oraz przyjmuje oświadczenia o odstąpieniu od umów o kredyt.`;
							}
						} else if(siteCode == "hu") {
							descriptionText = `A részletfizetésről bővebb tájékoztatást a <a href="https://www.samsung.com/hu/campaign/cofidis-instalment-payment/" target="_blank" title="Open in a new window">Cofidis Áruhitel</a> oldalon találsz.`;
						} else if(siteCode == "ro") {
							descriptionText = `Exemplu reprezentantiv de calcul:<br><br>
												Pentru un Contract de Credit prin acordarea si utilizarea Liniei de Credit in vederea unei achizitii de Bunuri/Servicii cu Asigurare de Viata in valoare de 5,000 lei, rambursata in 24 luni, rata anuala a dobanzii este 0%, comisionul de analiza a dosarului este de 95 lei, prima de asigurare de viata este de 244.56 lei, rata lunara este de 222.48 lei, valoarea totala platibila este de 5,339.56 lei si dobanda anuala efectiva (DAE) este de 1.74%. Comision adminstrare lunara a creditui: 5 lei/luna. Prezenta oferta se aplica in cazul in care nu se efectueaza nicio alta tranzactie pana la rambursarea integrala a creditului, iar fiecare rata lunara este achitata integral de catre client. Credit oferit de tbi bank
												<br><br>
												Exemplu reprezentativ de calcul:<br><br>
												Pentru un Contract de Credit prin acordarea si utilizarea Liniei de Credit in vederea unei achizitii de Bunuri/Servicii cu Asigurare de Viata in valoare de 2,500 lei, rambursata in 24 luni, rata anuala a dobanzii este 29%, comisionul de analiza a dosarului este de 95 lei, prima de asigurare de viata este de 124.56 lei, rata lunara este de 150.66 lei, valoarea totala platibila este de 3,615.89 lei si dobanda anuala efectiva (DAE) este de 38.31%. Comision adminstrare lunara a creditui: 5 lei/luna. Prezenta oferta se aplica in cazul in care nu se efectueaza nicio alta tranzactie pana la rambursarea integrala a creditului, iar fiecare rata lunara este achitata integral de catre client. Credit oferit de tbi bank`;
						} else if(siteCode == "sg"){
							descriptionText = `We have interest-free monthly instalment options of varying tenures. Monthly amount above is only a representative example over 36-month period & is based on the Recommended Retail Price. This is available using OCBC or UOB credit cards when the checkout value is above $500 at https://shop.samsung.com/sg. Instalment is not available for purchases with trade-in.`;
						} else if(siteCode == "my"){
							descriptionText = `*The displayed quote above is an estimation only. The final installment details will be made available at checkout page.
												<br><br>
												0% interest instalment is a repayment scheme that allows you to use your credit card to make a transaction and then repay the amount to your financier in installments over the course of 6, 12, 24 or 36 months with 0% interest. We currently have 4 banks that offer installment payment plans: 1. Public Bank 2. Maybank 3. HSBC 4. Hong Leong Bank<br>
												Minimum spend applies in order to be eligible for 0% interest installment plan and it is based on the checkout value (after deduction of discount vouchers, if any) instead of a single order/item value. Click
												<a href="https://www.samsung.com/my/shop-faq/payment-and-financing/what-is-the-minimum-spend-for-instalment-plan/" target="_blank" title="Open in a new window">
													here
												</a>
												for more info.`;
						} else if(siteCode == "ph"){
							descriptionText = `0% interest installment is a repayment scheme that allows you to use your credit card to make a transaction and then repay the amount in installments over the course of 3, 6, 9, 12, 18 and 24 months with 0% interest free.<br>
												We currently have 2 banks that offers installment payment plans<br>
												1. BDO<br>
												2. Metrobank<br>
												Minimum spend applies in order to be eligible for 0% interest installment plan and it is based on the checkout value (after deduction of discount vouchers) instead of a single order/item value.<br>
												Click 
												<a href="https://www.samsung.com/ph/shop-faq/payment-and-financing/what-payment-methods-do-you-accept/" target="_blank" title="Open in a new window">
													here
												</a>
												for more info.`;
						
						} else if(siteCode == "nz"){
							if(tabData.code == "nz-flexiCardPaymentMode"){
								descriptionText = `<strong>For Flexi Card:</strong><br/>*36, 24, or 12 months interest free is available on Long Term Finance (LTF) for online purchases only. Min spend $200. Lending criteria, $50 annual Account Fee, fees, Ts&Cs apply. $55 Establishment Fee applies to your first LTF transaction, $35 Advance Fee applies to subsequent LTF transactions. After applicable Payment Holiday ends, minimum payments of 3% of the monthly closing balance or $10 (whichever is greater) are required throughout interest free period. Paying only the minimum monthly payments will not fully repay the loan before the end of the interest free period. At end of interest free period, Q Mastercard Expired Promotional Rate or Q Card Standard Interest Rate of 27.99% p.a. applies. Standard Interest Rate applies to Standard Purchases after 3 months interest free period ends (Q Mastercard 26.69% p.a. and Q Card 27.99% p.a.). Rates and fees subject to change. Columbus Financial Services Limited and Consumer Finance Limited reserve the right to amend, suspend or terminate the offer and these Ts&Cs at any time without notice. Mastercard and the circles design are registered trademarks of Mastercard International Incorporated.`;
							}else if(tabData.code == "nz-laybuyPaymentMode"){
								descriptionText = `<strong>For LayBuy:</strong><br/>*Laybuy weekly payments are available for Laybuy customers only. For Terms and Conditions refer to 
								<a href="https://www.laybuy.com/nz/consumer-terms" target="_blank" title="Open in a new window">
									https://www.laybuy.com/nz/consumer-terms
								</a>`;
							}
						} else if(siteCode == "vn"){
							//CRHQ-9091(vn추가)
							let strOpenTitle = Granite.I18n.get("Open in a new window");
							descriptionText = `Ưu đãi trả góp 0% lãi suất đối với đơn hàng trên 5 Triệu. Tham khảo tại: <a href="https://www.samsung.com/vn/galaxy/tan-huong-tra-gop/" target="_blank" title="${strOpenTitle}">https://www.samsung.com/vn/galaxy/tan-huong-tra-gop/</a>`;
                        } else if(siteCode == "th"){
							descriptionText = ` `;
						} else if(siteCode == "sk"){
							descriptionText = ` `;
                        } else if(siteCode == "cz"){
							descriptionText = ` `;
						} else if(siteCode == "cn"){//[cn new-hybris 전환] - ph와 동일 분기처리
							descriptionText = ` `;
						} 
					}//:~ if(jdx == tabData.values.length-1){
				}
				contentHtml += 			'</div>';	//.finance-popup__box-list End
			}
			contentHtml += 			'</div>';		//.finance-popup__box-wrap End
			
			/* 탭에 해당되는 desc 및 footer html get */
			contentHtml += 		emiDescEachSiteCode(siteCode, tabData.code, descriptionText);
			
			contentHtml += 		'</div>';		//.finance-popup__site-content End
			contentHtml += 	'</div>';			// .finance-popup__panel End
		}
		tabHtml += 			'</ul>';			
		tabHtml += 		'</div>';				//.tab End
						
		$contentArea.html(tabHtml+contentHtml);
		
		//탭 클릭시 해당하는 .finance-popup__panel 노출
		$(".finance-popup__content li.tab__item .tab__item-title").click(function(){
		    $(".finance-popup__panel").attr("class", "finance-popup__panel");
		    $($(".finance-popup__panel")[$(this).index()]).addClass(" is-active");
		});
	};
	
	function emiDataGridID(data) {
		var innerPriceHtml = "";
		var name = data.modes[0].name;
		var price = data.productPrice;
		var banks = data.modes[0].banks;
		var tableContent = "";
		var tableHtml = "";
		$(".eip-popup__top-text--price").text(price);
		$(".eip-popup__wrap .tab .tab__item-title").html(name+'<span class="tab__item-line"></span>');
		$(".eip-popup__tab--dropdown").text(banks[0].name);
		
		for(let idx = 0; idx < banks.length; idx++){
			/*
			innerPriceHtml += '<li>';
			innerPriceHtml += '	<div class="hubble-eip--select-radio">';
			if(idx == 0){
				innerPriceHtml += '		<input type="radio" name="radio-01" class="hidden" id="radio-'+idx+ '"'+ ' checked>'
			}else{
				innerPriceHtml += '		<input type="radio" name="radio-01" class="hidden" id="radio-'+idx+ '"'+ '>'
			}
			innerPriceHtml += '		<label class="hubble-eip--select-radio__label" for="radio-' + idx + '"' +' tabindex="0">';
			innerPriceHtml += '			<span class="hubble-eip--select-radio__label-text">' + banks[idx].name + '</span>';
			innerPriceHtml += '		</label>';
			innerPriceHtml += '	</div>';
			innerPriceHtml += '</li>';
			*/
			innerPriceHtml += '<li class="eip-popup__tab--select-item">';
			 
			if(idx == 0){
				innerPriceHtml += '		<input type="radio" name="radio-01" class="hidden" id="radio-'+idx+ '"'+ ' checked>'
			}else{
				innerPriceHtml += '		<input type="radio" name="radio-01" class="hidden" id="radio-'+idx+ '"'+ '>'
			} 
			
			innerPriceHtml += '			<button>' + banks[idx].name + '</button>';
			innerPriceHtml += '</li>';
		}
		$(".eip-popup__tab--select-wrap .scrollbar__contents > ul").html(innerPriceHtml);
		window.sg.components.eipPopup.bindAdditionalEvent();
		//NOTICE 
		/*
		좌측 select 영역의 마크업과 우측 table 영역의 마크업이 그려지면,
		window.sg.components.eipPopup.bindAdditionalEvent() 함수를 호출해 주시고
		좌측 select 영역이 선택될 때, 우측 table 영역의 마크업을 변경하신 후,
		window.sg.components.eipPopup.resizeTableWrap() 함수를 호출해 주시기 바랍니다.
		*/
		
		
		for(let i = 0 ; i < banks.length; i++){
			var innerValue = banks[i].plans;
			for(let j = 0; j < innerValue.length; j++){
				tableContent += '<tr>';
				tableContent += '	<td>'+ innerValue[j].periodicValue + '</td>';
				tableContent += '	<td>'+ innerValue[j].code + '</td>';
				tableContent += '	<td>'+ innerValue[j].purchaseCost + '</td>';
				tableContent += '</tr>';
			}
			
			tableHtml += '<div class="scrollbar__contents" style="display:none">';
			tableHtml += '	<p class="eip-popup__tab--table-title">' + banks[i].name + '</p>';
			tableHtml += '	<table class="eip-popup__tab--table">';
			tableHtml += '		<caption><span class="blind"> Table Caption</span></caption>';
			tableHtml += '		<colgroup>';
			tableHtml += '			<col>';
			tableHtml += '			<col style="width:25%">';
			tableHtml += '			<col>';
			tableHtml += '		</colgroup>';
			tableHtml += '	<thead>';
			tableHtml += '		<tr>';
			tableHtml += '			<th scope="col">Cician<br>Per Bulan</th>';
			tableHtml += '			<th scope="col">Tenor<br>(bulan)</th>';
			tableHtml += '			<th scope="col">Total<br>Pembayaran</th>';
			tableHtml += '		</tr>';
			tableHtml += '	</thead>';
			tableHtml += '	<tbody>';
			tableHtml += 		tableContent
			tableHtml += '	</tbody>';
			tableHtml += '	</table>';
			tableHtml += '</div>';
			tableContent = "";
		}
		if($(".eip-popup__tab--table-wrap").next().length){
			$(".eip-popup__tab--table-wrap").nextAll().remove();
        }
		$(".eip-popup__tab--table-wrap").after(tableHtml);
		
	}

	// CRHQ-24 [B2C][MX][UA] Interactive Credit Calculator on PDP and PLP
	var emiDataGridUa = function(values){

		///////////////////////////  여기까지 로직 //////////////////////////////////
		var $eipArea = $(".finance-popup");
		var $contentArea = $eipArea.find(".finance-popup__content");

		$contentArea.html( (values||[]).length > 0 ? contentGrid(values[0].values||[]) : '' );

		if($contentArea.find('.installment-select__options ul li a').length > 0){
			$contentArea.find('.installment-select__placeholder-name .select-txt').text($contentArea.find('.installment-select__options ul li a:eq(0)').data('code'))
		}

		// month 이벤트 처리
		$contentArea.find('.installment-select__options ul li a').click(function(){
			const selectedOption = $(this).data("code");
			$(this).closest('.finance-popup__content').find('li.finance-popup__installment-list-item[data-code]').each(function(){
				if($(this).data("code") == selectedOption){
					$(this).show();
				}else {
					$(this).hide();
				}
			});
		});		
		///////////////////////////  여기까지 로직 //////////////////////////////////

		function contentGrid(tabDataValues){

			// api 에서 소팅이 되어 있지 않은 경우를 대비해 월 숫자 오름차순 정리
			tabDataValues.sort(function(a, b){
				const acode = parseFloat(a.code);
				const bcode = parseFloat(b.code);
				return acode - bcode;
			});

			return `
				<div class="finance-popup__installment-wrap">
				<ul class="finance-popup__installment-list">
					<li class="finance-popup__installment-list-item">
					<span>${Granite.I18n.get("Loan term (months)")}</span>
					<div class="finance-popup__installment-select">
						<div class="finance-popup__installment-select__choose">
						<div class="finance-popup__installment-select__choose-wrap">
							<div class="installment-select" data-global-text='{
								"Expand" : "Click to Expand",
								"Collapse" : "Click to Collapse"
							}'>
							<a href="#" class="installment-select__placeholder" role="button" aria-disabled="false" aria-expanded="true">
								<button class="installment-select__placeholder-btn installment-select__placeholder-btn-open">
								<span class="hidden">Open Down</span>
								<svg class="icon" focusable="false" aria-hidden="true">
									<use xlink:href="#open-down-regular" href="#open-down-regular"></use>
								</svg>
								</button>
								<button class="installment-select__placeholder-btn installment-select__placeholder-btn-close">
								<span class="hidden">Close Up</span>
								<svg class="icon" focusable="false" aria-hidden="true">
									<use xlink:href="#close-up-regular" href="#close-up-regular"></use>
								</svg>
								</button>
								<div class="installment-select__placeholder-name">
								<span class="select-txt">${Granite.I18n.get("Month")}</span>
								</div>
								<!--/*
								expand(확장) 상태일 경우 data-global-text='{expand에 설정된 문구}'와
								<span class="hidden">{expand에 설정된 문구}</span>
								Collapse(축소) 상태일 경우 data-global-text='{collapse에 설정된 문구}'와
								<span class="hidden">{collapse에 설정된 문구}</span> 지정된 문구로 동일하게 출력

								data-global-text='{}' :
								"Expand" : "Click to Expand",
								"Collapse" : "Click to Collapse"
								*/-->
								<span class="hidden">Click to Expand</span>
							</a>
							<div class="installment-select__options" aria-hidden="false">
								<ul role="list">
									${listItem(tabDataValues)}
								</ul>
							</div>
							</div>
						</div>
						</div>
					</div>
					</li>
					${list(tabDataValues)}
				</ul>
				</div>
				${paymentCeditDescGrid()}
				${paymentCreditFooterGrid()}
			`;
		}

		function listItem(tabDataValues) {

			return $.map(tabDataValues, function(monthItem){
				return `
				<li role="listitem" class="">
					<a href="#" role="option" data-code="${monthItem.code}">
					<div class="finance-popup__installment-select__choose-item">
						<span class="finance-popup__installment-select__choose-name">${monthItem.code}</span>
					</div>
					</a>
				</li>
				`
			}).join("");
		}

		function list(tabDataValues){
			
			return $.map(tabDataValues, function(item, index){

				return `
				<li class="finance-popup__installment-list-item" data-code="${item.code}" ${index == 0 ? '' : 'style="display:none;"'} >
					<span>${Granite.I18n.get("Monthly Payments")}</span>
					<span>${item.periodicValue}</span>
				</li>
				<li class="finance-popup__installment-list-item" data-code="${item.code}" ${index == 0 ? '' : 'style="display:none;"'} >
					<span>${Granite.I18n.get("Order cost")}</span>
					<span>${item.purchaseCost}</span>
				</li>				
				`;
			}).join("");
			
		}

		function paymentCeditDescGrid(){
			return `
			<div class="finance-popup__description">
				<p>
					${Granite.I18n.get("Representative Example without 0% or 9.90% offers: Representative 18.9% APR (variable)")+ " " +
					//Granite.I18n.get("Purchase interest rate 18.9%p.a (variable) Assumed credit limit £1,200*") + " " + 
					Granite.I18n.get("Displayed quote is not generated by Klarna, final estimates are made upon checkout.")}
				</p>
		  	</div>
			`;	
		}

		function paymentCreditFooterGrid(){
			return `
			<div class="finance-popup__credit">
				<div class="finance-popup__credit-text">
					${Granite.I18n.get("*Subject to financial circumstances. You must be at least 18. Credit is provided by Klarna Bank AB, which is authorised and regulated by the Swedish Financial Services " + 
					"Authority, with limited supervision by the Financial Conduct Authority and Prudential Regulation Authority in the UK. Registered office: Sveavägen 46, 111 34 " + 
					"Stockholm, Sweden. Corporation ID number: 556737-0431. If you already have a Klarna Credit account, this purchase will be added to your balance. " + 
					"<a href=\"https://www.samsung.com/ua/online-credit/\" title=\"Terms and conditions\" target=\"_blank\">T&amp;Cs apply</a>.")}
				</div>
			</div>
			`;
		}		
	}

	function showEmiPopup(modelCode, closeFocus) {
		// EMI API 호출
		var siteCode = $("#siteCode").val();
		
		// epp shop분기 추가
		const siteCodeWithEpp = checkEppSite() ? (window.sg.epp != null && window.sg.epp.common != null ? window.sg.epp.common.companyCode : "") : siteCode;

		let shopParm = '';
		if( $('#shopParmLang').val() ){
			shopParm=`&lang=${$('#shopParmLang').val()}`;
		}
		
		var _xhrFields = $('#isEppPage').val() === 'true' ? { withCredentials: true } : {};
		
		if(siteCode == 'id'){
				$.ajax({
					url : storeDomain + "/tokocommercewebservices/v2/"+ siteCodeWithEpp+ "/products/getInstallmentPlans?fields=DEFAULT&sku=" + modelCode+shopParm,
					type: "GET",
					dataType: "json",
					xhrFields: _xhrFields,
					crossDomain: true,
					timeout: 10000,
					success: function (data) {
						if (data && data.modes.length > 0) {
							emiDataGridID(data);
							//window.sg.components.hubbleEipPopup.reInit();
							window.sg.components.eipPopup.init();
							//window.sg.components.hubblePdPopup.openPopup(document.querySelector("#hubble-eip-layer"), closeFocus);
							window.sg.components.eipPopup.showPopup();
							$(".hubble-eip-select-area").off("click",".hubble-eip--select-radio input[name=radio-01]")
							$(".hubble-eip-select-area").on("click",".hubble-eip--select-radio input[name=radio-01]", function(){
								var id = $(this).attr('id');
								var tabIdx = id.split('-')[1];
								var tables = $('.hubble-eip-table-area');
								for(let i = 0; i < tables.length; i++){
									if(i == tabIdx){
										tables[i].style.display = 'block';
									}else{
										tables[i].style.display = 'none';
									}
								}
							});
							
							$(document).on("click",".eip-popup__tab--select-item", function(){
								var selectWrap = $(".eip-popup__tab--select-item");
								var tableWrap = $(".eip-popup__tab--table-wrap").siblings(".scrollbar__contents");
								var selectedTable = "";
								
								for(var i=0; i<selectWrap.length; i++){
									if(selectWrap[i].classList.value.indexOf("active") > -1){
										selectedTable = tableWrap.clone()[i];
										selectedTable.removeAttribute("style");
									}
								}
								$(".eip-popup__tab--table-wrap .scrollbar__wrap").html(selectedTable);
								window.sg.components.eipPopup.resizeTableWrap();
							});
							
							$(".eip-popup__tab--select-item.active").click();
						}
					},
					error: function (e) {
						errLayerPop(e);
					}
				});
		}else if(isCalculateInstallment){
			//uk와 uk외 국가들에 대한 적용  (ee, lv, lt) + pl
			let apiUrl = '';
			//COMP6FE-1590 [SMB] Financing Calculator& Leasing es추가
			if(isB2B){
				let storeSiteCode = $("#store_sitecode").val();
				shopParm = `lang=${$('#language').val()}&`;
				
				if($('#priceCurrency').val()){
					shopParm +=`curr=${$('#priceCurrency').val().toUpperCase()}`;
				}else{
					shopParm +=`curr=${$('#pfPriceCurrency').val().toUpperCase()}`;
				}
				apiUrl = storeDomain + "/tokocommercewebservices/v2/" + storeSiteCode + "/products/" + modelCode + "/calculateInstallment?"+shopParm;
			}else{
				//[EPP] &EPPONLY 도메인 변경
				if(checkEppSite() && ($('#shopIntegrationFlag').val() === 'Hybris'|| $('#shopIntegrationFlag').val() === 'Hybris-intg')){
					storeDomain = window.sg.epp.common.orgNewHyvStoreDomain;
				}
				//B2C
				apiUrl = storeDomain + "/tokocommercewebservices/v2/" + siteCodeWithEpp + "/products/" + modelCode + "/calculateInstallment?fields=DEFAULT"+shopParm;
			}
 
			$.ajax({
				url : apiUrl,
				type: "GET",
				dataType: "json",
				xhrFields: _xhrFields,
				crossDomain: true,
				timeout: 10000,
				success: function (data) {
					if (data && data.values.length > 0) {
						if(siteCode == 'ua'){ // CRHQ-24
							emiDataGridUa(data.values);
						}else{
							emiDataGrid(data.values, siteCode);
						}
						window.sg.components.financePopup.reInit(); //reInit 호출
						//api호출 data가 있는 경우 팝업 오픈, data 없으면 동작 X
						window.sg.components.financePopup.showPopup(closeFocus[0]);
					}
				},
				error: function (e) {
					errLayerPop(e);
				}
			});
		}  
	}

	// hubbleEipPopup 마크업 js 이후 세팅
	// window.sg.components.hubbleEipPopup.showEmiPopup(modelCode, clickBtn);
	//window.sg.components.hubbleEipPopup.showEmiPopup = showEmiPopup;
	window.sg.components.financePopup.showEmiPopup = showEmiPopup;
	
})($);
(() => {
  const $q = window.sg.common.$q;
  const utils = window.sg.common.utils;
  const setMobileFocusLoop = window.sg.common.utils.setMobileFocusLoop;
  const removeMobileFocusLoop = window.sg.common.utils.removeMobileFocusLoop;

  let getStockAlertPopupElements = {};
  let requiredCheckboxesCount = 0;
  let focusTargetEl = {};

  const selector = {
    section: '.pd-get-stock-alert-popup',
    // layerPopup: '.layer-popup',
    close: '.pd-get-stock-alert-popup__close',
  };

  function getElements() {
    getStockAlertPopupElements = {
      getStockAlertPopup: document.querySelector('.pd-get-stock-alert-popup'),
      getStockAlertPopupDimmed: document.querySelector('.pd-get-stock-alert-popup__dimmed'),
      getStockAlertPopupContents: document.querySelector('.pd-get-stock-alert-popup__contents'),
      getStockAlertPopupInnerWrap: document.querySelector('.pd-get-stock-alert-popup__inner-wrap'),
      getStockAlertPopupInputWrap: document.querySelector('.pd-get-stock-alert-popup__text-field-wrap .text-field-v2'),
      getStockAlertPopupInput: document.querySelector('.pd-get-stock-alert-popup__text-field-wrap input'),
      getStockAlertPopupCheckboxes: document.querySelectorAll('.pd-get-stock-alert-popup__checkbox-wrap .checkbox-v2__input'),
      getStockAlertPopupRequiredCheckboxes: document.querySelectorAll('.pd-get-stock-alert-popup__checkbox-wrap.is-required .checkbox-v2__input'),
      getStockAlertPopupBtnWrap: document.querySelector('.pd-get-stock-alert-popup__btn-wrap'),
      getStockAlertPopupBtnClose: document.querySelector('.pd-get-stock-alert-popup__btn-close'),
      getStockAlertPopupBtnSubmit: document.querySelector('.pd-get-stock-alert-popup__btn-submit'),
      getStockAlertPopupClose: document.querySelectorAll('.pd-get-stock-alert-popup__close'),
      getStockAlertPopupFinalWrap: document.querySelector('.pd-get-stock-alert-popup__final-wrap'),
      getStockAlertPopupFinalDesc: document.querySelector('.pd-get-stock-alert-popup__final-desc'),
      getStockAlertPopupFinalBtnWrap: document.querySelector('.pd-get-stock-alert-popup__final-btn-wrap'),
      getStockAlertPopupFinalBtnClose: document.querySelector('.pd-get-stock-alert-popup__final-btn-close'),
      scrollbarEl: document.querySelector('.pd-get-stock-alert-popup .scrollbar'),
      vertScrollbarWrapEl: document.querySelector('.pd-get-stock-alert-popup .scrollbar__wrap'),
    };
  }

  function init() {
    const scrollbarEl = document.querySelector('.pd-get-stock-alert-popup .scrollbar');
    if(scrollbarEl){
      window.sg.common.scrollbar.init(document.querySelector('.pd-get-stock-alert-popup .scrollbar'));
    }

    getElements();

    if (!getStockAlertPopupElements.getStockAlertPopup) {
      return;
    }

    bindEvents();
    changeInnerWrapMaxHeight();
  }

  function bindEvents() {
    getStockAlertPopupElements.getStockAlertPopupInput.addEventListener('input', () => {
      bindInputEvent();
    });

    for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length; i++) {
      getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes[i].addEventListener('click', () => {
        bindCheckboxEvent();
      });
    }

    if (getStockAlertPopupElements.getStockAlertPopupBtnClose) {
      getStockAlertPopupElements.getStockAlertPopupBtnClose.addEventListener('click', () => {
        closePopup();
      });
    }

    getStockAlertPopupElements.getStockAlertPopupFinalBtnClose.addEventListener('click', () => {
      closePopup();
    });

    for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupClose.length; i++) {
      getStockAlertPopupElements.getStockAlertPopupClose[i].addEventListener('click', () => {
        closePopup();
      });
    }

    window.addEventListener('resize', () => {
      changeInnerWrapMaxHeight();
    });

    const closeBtn = document.querySelector(`${selector.section} ${selector.close}`);
    closeBtn.removeEventListener('keydown', keydownCloseBtn);
    closeBtn.addEventListener('keydown', keydownCloseBtn);

    const layer = document.querySelector(`${selector.section}`);
    layer.removeEventListener('keydown', keydownLayer);
    layer.addEventListener('keydown', keydownLayer);

    const firstEl = $q(getStockAlertPopupElements.getStockAlertPopup).find('a, button, input').target[0];
    firstEl.removeEventListener('keydown', keydownLayerFirst);
    firstEl.addEventListener('keydown', keydownLayerFirst);

    const closeFinalBtn = document.querySelector('.pd-get-stock-alert-popup__final-wrap .pd-get-stock-alert-popup__close');
    closeFinalBtn.removeEventListener('keydown', keydownFinalCloseBtn);
    closeFinalBtn.addEventListener('keydown', keydownFinalCloseBtn);

    const finalFirstEl = $q(getStockAlertPopupElements.getStockAlertPopupFinalWrap).find('a, button, input').target[0];
    finalFirstEl.removeEventListener('keydown', keydownFinalLayerFirst);
    finalFirstEl.addEventListener('keydown', keydownFinalLayerFirst);
  }

  function showFinalPopup() {
    getStockAlertPopupElements.getStockAlertPopupContents.style.display = 'none';
    getStockAlertPopupElements.getStockAlertPopupDimmed.style.display = 'block';
    getStockAlertPopupElements.getStockAlertPopupFinalWrap.style.display = 'block';
    changeFinalPopupMaxHeight();

    window.addEventListener('resize', () => {
      changeFinalPopupMaxHeight();
    });

    $q(getStockAlertPopupElements.getStockAlertPopupFinalWrap).find('a, button, input').target[0].focus();
  }

  function bindInputEvent() {
    if (getStockAlertPopupElements.getStockAlertPopupInput.value.length !== 0) {
      requiredCheckboxesCount = 0;

      for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length; i++) {
        if (getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes[i].checked) {
          requiredCheckboxesCount++;
        }
      }

      if (getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length === requiredCheckboxesCount) {
        getStockAlertPopupElements.getStockAlertPopupBtnSubmit.classList.remove('cta--disabled');
        getStockAlertPopupElements.getStockAlertPopupBtnSubmit.removeAttribute('disabled');
      } else {
        getStockAlertPopupElements.getStockAlertPopupBtnSubmit.classList.add('cta--disabled');
        getStockAlertPopupElements.getStockAlertPopupBtnSubmit.setAttribute('disabled', '');
      }
    } else {
      getStockAlertPopupElements.getStockAlertPopupBtnSubmit.classList.add('cta--disabled');
      getStockAlertPopupElements.getStockAlertPopupBtnSubmit.setAttribute('disabled', '');
    }
  }

  function bindCheckboxEvent() {
    requiredCheckboxesCount = 0;

    for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length; i++) {
      if (getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes[i].checked) {
        requiredCheckboxesCount++;
      }
    }

    if (getStockAlertPopupElements.getStockAlertPopupInput.value.length !== 0 && (getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length === requiredCheckboxesCount)) {
      getStockAlertPopupElements.getStockAlertPopupBtnSubmit.classList.remove('cta--disabled');
      getStockAlertPopupElements.getStockAlertPopupBtnSubmit.removeAttribute('disabled');
    } else {
      getStockAlertPopupElements.getStockAlertPopupBtnSubmit.classList.add('cta--disabled');
      getStockAlertPopupElements.getStockAlertPopupBtnSubmit.setAttribute('disabled', '');
    }
  }

  function closePopup() {
    const productCardList = $q('.pd13-offers-product-card-list');
    const productFinder = $q('.pd12-product-finder');

    if (productCardList.target.length > 0 || productFinder.target.length > 0) {
      const getStockPopup = $q('.pd-get-stock-alert-popup');
      if (getStockPopup.attr('data-aria-hidden')) { //call in popup
        getStockPopup.attr('aria-hidden', 'true');

        const callLayer = ['.compare-popup'];

        callLayer.forEach((layerEl) => {
          if ($q(layerEl).css('display') === 'block') {
            $q(layerEl).removeAttr('data-aria-hidden');
            $q(layerEl).removeAttr('aria-hidden');
          }
        });
      } else {
        removeMobileFocusLoop();
      }
    } else {
      if (document.querySelectorAll('[data-aria-hidden]').length > 0) {
        removeMobileFocusLoop();
      }
    }

    getStockAlertPopupElements.getStockAlertPopupInput.value = '';
    getStockAlertPopupElements.getStockAlertPopupInputWrap.className = 'text-field-v2';

    for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupCheckboxes.length; i++) {
      getStockAlertPopupElements.getStockAlertPopupCheckboxes[i].checked = false;
    }

    getStockAlertPopupElements.getStockAlertPopupBtnSubmit.classList.add('cta--disabled');
    getStockAlertPopupElements.getStockAlertPopupContents.style.display = 'block';
    getStockAlertPopupElements.getStockAlertPopupDimmed.removeAttribute('style'); //not display:none
    getStockAlertPopupElements.getStockAlertPopupFinalWrap.style.display = 'none';
    getStockAlertPopupElements.getStockAlertPopup.style.display = 'none';

    // document.body.removeAttribute('style');

    utilsHide();
    originFocus();
  }

  function changeInnerWrapMaxHeight() {
    getStockAlertPopupElements.vertScrollbarWrapEl.style.maxHeight = `${window.innerHeight - ((getStockAlertPopupElements.getStockAlertPopupInnerWrap.getBoundingClientRect().top - getStockAlertPopupElements.getStockAlertPopupContents.getBoundingClientRect().top) * 2) - getStockAlertPopupElements.getStockAlertPopupBtnWrap.getBoundingClientRect().height}px`;
    window.sg.common.scrollbar.resize(getStockAlertPopupElements.scrollbarEl);
  }

  function changeFinalPopupMaxHeight() {
    getStockAlertPopupElements.vertScrollbarWrapEl.style.maxHeight = `${window.innerHeight - ((getStockAlertPopupElements.getStockAlertPopupFinalDesc.getBoundingClientRect().top - getStockAlertPopupElements.getStockAlertPopupFinalWrap.getBoundingClientRect().top) * 2) - getStockAlertPopupElements.getStockAlertPopupFinalBtnWrap.getBoundingClientRect().height}px`;
    window.sg.common.scrollbar.resize(getStockAlertPopupElements.scrollbarEl);
  }

  function reInit() {
    getStockAlertPopupElements.getStockAlertPopupInput.removeEventListener('input', () => {
      bindInputEvent();
    });

    for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length; i++) {
      getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes[i].removeEventListener('click', () => {
        bindCheckboxEvent();
      });
    }

    getElements();

    getStockAlertPopupElements.getStockAlertPopupInput.addEventListener('input', () => {
      bindInputEvent();
    });

    for (let i = 0; i < getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes.length; i++) {
      getStockAlertPopupElements.getStockAlertPopupRequiredCheckboxes[i].addEventListener('click', () => {
        bindCheckboxEvent();
      });
    }
  }

  function showPopup(el) {
    if (el instanceof Element) {
      focusTargetEl = el;
    } else if (el instanceof Object) {
      if (el.target[0] instanceof Element) {
        focusTargetEl = el.target[0];
      }
    }

    // document.body.style.overflow = 'hidden';
    getStockAlertPopupElements.getStockAlertPopup.style.display = 'block';
    $q(getStockAlertPopupElements.getStockAlertPopup).find('a, button, input').target[0].focus();

    utilsShow();
    changeInnerWrapMaxHeight();

    const productCardList = $q('.pd13-offers-product-card-list');
    const productFinder = $q('.pd12-product-finder');

    if (productCardList.target.length > 0 || productFinder.target.length > 0) {
      const getStockPopup = $q('.pd-get-stock-alert-popup');
      if (getStockPopup.attr('data-aria-hidden')) { //call in popup
        getStockPopup.attr('aria-hidden', 'false');
        const callLayer = ['.compare-popup'];

        callLayer.forEach((layerEl) => {
          if ($q(layerEl).css('display') === 'block') {
            $q(layerEl).attr('data-aria-hidden', null);
            $q(layerEl).attr('aria-hidden', 'true');
          }
        });
      } else {
        setMobileFocusLoop(getStockPopup.target[0]);
      }
    } else {
      if (document.querySelectorAll('[data-aria-hidden]').length <= 0) {
        setMobileFocusLoop(getStockAlertPopupElements.getStockAlertPopup);
      }
    }

    if(checkIOS() && utils.getCurrentDevice() === 'mobile') {
      setTimeout(() => {
        window.scrollTo(0,0);
      }, 100);
    }
  }

  function keydownLayer(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode && evt.target === document.querySelector(`${selector.section}`)) {
      evt.preventDefault();
      document.querySelector(`${selector.section} ${selector.close}`).focus();
    }
  }

  function keydownCloseBtn(evt) {
    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();
      $q(getStockAlertPopupElements.getStockAlertPopup).find('a, button, input').target[0].focus();
    }
  }

  function keydownLayerFirst(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode && evt.target === $q(getStockAlertPopupElements.getStockAlertPopup).find('a, button, input').target[0]) {
      evt.preventDefault();
      document.querySelector(`${selector.section} ${selector.close}`).focus();
    }
  }

  function keydownFinalCloseBtn(evt) {
    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();
      $q(getStockAlertPopupElements.getStockAlertPopupFinalWrap).find('a, button, input').target[0].focus();
    }
  }

  function keydownFinalLayerFirst(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode && evt.target === $q(getStockAlertPopupElements.getStockAlertPopupFinalWrap).find('a, button, input').target[0]) {
      evt.preventDefault();
      document.querySelector('.pd-get-stock-alert-popup__final-wrap .pd-get-stock-alert-popup__close').focus();
    }
  }

  function checkIOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  }

  function originFocus() {
    if (focusTargetEl instanceof Element) {
      focusTargetEl.focus();
    }
  }

  function utilsShow() {
    utils.popupControl.open(closePopup);
    utils.hiddenScroll();
  }

  function utilsHide() {
    utils.popupControl.close();
    utils.visibleScroll();
  }

  function setFirstFocus() {
    $q(getStockAlertPopupElements.getStockAlertPopup).find('.text-field-v2__input').focus();
  }

  window.sg.components.pdGetStockAlertPopup = { init, reInit, showPopup, closePopup, showFinalPopup, setFirstFocus };

  $q.ready(() => init());
})();

(function ($) {

    var storeDomain = $("#storeDomain").val();
    var hreflang = $("#localLang").val();
    var multiLanguageYN = $("#multiLanguageYn").val();
    var isGpv2 = $("#isGpv2Flag").val();
    var isNewHybris = $("#shopIntegrationFlag").val() === "Hybris-new"? true:false;			//new-hybris
	var isB2B = $('#b2bFlag').val() === "Y" ? true : false;
	// Store API 호출 시 사용하는 SiteCode
	var storeSiteCode = $('#store_sitecode').val();
    var siteCode = $("#siteCode").val();
    var countryIsoCode = $("#countryIsoCode").val();
    var TnC_SITE = ["uk", "fr", "be", "be_fr", "nl", "de", "pl","id","ph"];					//new-hybris
    var getStockAlertPopup = $(".pd-get-stock-alert-popup");
    var getStockTextField = getStockAlertPopup.find(".text-field-v2");
    var tempProductCode = "";
    var emailStr = "";
	var numberStr = "";
	var strResult = "";
    var b2bApiCal = true;
    Granite.I18n.setLocale($("#language").val());
    var getStockFlag = "GetStock";
    
    let isInAppWebViewSessionStorage = sessionStorage.getItem('isInAppWebViewSessionStorage');
    console.log("[pd-g-getstock-popup.op.js] isInAppWebViewSessionStorageValue =["+isInAppWebViewSessionStorage +"]");

    //[EPP] epp 관련 변수 추가
    const isEppSite = checkEppSite();
    if(isEppSite && window.sg.epp == null){
        window.sg.epp = {};
        window.sg.epp.common = {};
    }
    const eppStoreId = isEppSite ? window.sg.epp.common.companyCode: "";
    
    // epp shop분기 추가
    storeSiteCode = isEppSite ? window.sg.epp.common.companyCode : storeSiteCode;

    var hideError = function () {
        $("#getStockAlertEmailInput").removeAttr("aria-describedby");
        getStockTextField.removeClass("error");
    }
    var showError = function () {
        $("#getStockAlertEmailInput").attr("aria-describedby", "getstock-popup-error-txt");
        getStockTextField.addClass("error");
        window.sg.components.pdGetStockAlertPopup.setFirstFocus();
    }
    var popupClose = function () {
        getStockAlertPopup.find(".pd-get-stock-alert-popup__close").trigger("click");
    }

    var showFinalWrap = function (text) {
        var finalDesc = getStockAlertPopup.find(".pd-get-stock-alert-popup__final-desc")

        finalDesc.html(text);
        window.sg.components.pdGetStockAlertPopup.showFinalPopup();
    }

    var openSuccess = function () {
        var successText = "";
        
        if(siteCode === "cn"){ // SCIC hybris전환
        	if(getStockFlag === "ComingSoon"){
        		successText = Granite.I18n.get("comingSoonPopup.requestText");
        	}else{
        		successText = Granite.I18n.get("oosPopup.requestText");
        	}
        }else{
        	successText = Granite.I18n.get("We will email you when inventory is added.");
            successText += "<br>" + Granite.I18n.get("Thank you.");
        }
        
        showFinalWrap(successText);
    }

    var emailValidCheck = function (addr) {
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(addr)) {
            return false;
        }
        return true;
    }
    
    var emailNumberValidCheck = function (addrnum){
    	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(addrnum)) {
    		emailStr = addrnum;
            return true;
        }else if(/^[0-9]+$/.test(addrnum) && addrnum.length == 10){
        	numberStr = addrnum;
        	return true;
        }
        return false;
    }
    
    var mobileNumberValidCheck = function (addrnum){
    	if(/^[0-9]+$/.test(addrnum) && addrnum.length == 11){
        	numberStr = addrnum;
        	return true;
        }
        return false;
    }

    var InStockApiCallback = function (data) {
        var resultCode, resultMessage;
        if (data != null && data.hasOwnProperty("resultCode") && data.hasOwnProperty("resultMessage")) {
            resultCode = data.resultCode;
            resultMessage = data.resultMessage;
        }

        if (data != null) {
            if ((resultCode === "0000" && resultMessage === "SUCCESS") || isNewHybris || isB2B) {				//new-hybris
                hideError();
                openSuccess();
            } else {
                showError();
            }
        } else {
            showError();
        }
    }

    var callInStockApi = function (emailAddr) {
        // epp shop분기 추가
        const siteCodeWithEpp =isEppSite ? window.sg.epp.common.companyCode : siteCode;
        
        var stockAlertUrl = storeDomain + "/" + siteCodeWithEpp + "/ng/p4v1/stockNotification/register";
        var callInStockParam;
        var callInStockParamObj = {};
        
        if(siteCode === "cn"){ // SCIC hybris전환
        	var submitGetStockFlag = "";
        	
        	if(getStockFlag === "ComingSoon"){
        		submitGetStockFlag = "COMING_SOON";
        	}else{
        		submitGetStockFlag = "OUT_OF_STOCK";
        	}
        	
        	callInStockParamObj = {
                "phoneNo": emailAddr,
                "productCode": tempProductCode,
                "stockAlertSubscriptionType" : submitGetStockFlag
            };
        }else{
        	callInStockParamObj = {
                "emailAddress": emailAddr,
                "productCode": tempProductCode
            };
        }
        
        if( $('#shopParmLang').val() ){
            callInStockParamObj['lang']=$('#shopParmLang').val();
        }

        if(isNewHybris || isB2B){		//new-hybris
            stockAlertUrl = storeDomain + "/tokocommercewebservices/v2/" + storeSiteCode + "/notifications/stockAlert";
            $.ajax({
                headers: {
                    "Content-Type": "application/json"
                },
                url: stockAlertUrl,
                type: 'POST',
                dataType : 'json',
                data: JSON.stringify(callInStockParamObj),
                crossDomain : true,
                xhrFields: {
                    withCredentials: true
                },
                timeout: 20000,
                cache: true,
                success: function (data) {
                    InStockApiCallback(data);
                },
                error: function () {
                    hideError();
                    popupClose();
                }
            });

        } else {
            callInStockParam = callInStockParamObj;
            $.ajax({
                url: stockAlertUrl,
                type: "POST",
                contentType: "application/x-www-form-urlencoded",
                data: callInStockParam,
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                dataType: "json",
                timeout: 10000,
                success: function (data) {
                    InStockApiCallback(data)
                },
                error: function () {
                    /* nonshop 예외처리
                    if(siteCode=="ae" || siteCode=="ae_ar"){
                        // TODO 예외처리 (체크박스)
                        $("#remIdChkYN").attr('value','N');
                        $("#remIdChkYN").attr('checked',false);
                    }
                    */
                    hideError();
                    popupClose();
                }
            });
        }
    };

    var callInStockApiGpv2 = function (validJwtTkn, loginJwt, paramObj) {
        // 샵통합
        $.ajax({
            headers: {
                "Cache-Control": "no-cache",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "x-ecom-app-id": "identity-store-global"
            },
            url: storeDomain + "/v4/identity/notification/preferences/in-stock",
            type: "PUT",
            data: paramObj,
            dataType: "json",
            timeout: 20000,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                /* Login 여부 체크 후 Login 되어있을 시 헤더값 추가 */
                if (validJwtTkn) {
                    xhr.setRequestHeader("x-ecom-jwt", loginJwt);
                }
                /* GPv2 api 호출 시 multiLanguageYN 이 Y인 경우  헤더 추가 */
                if (multiLanguageYN === "Y") {
                    xhr.setRequestHeader("x-ecom-locale", hreflang);
                }
            },
            success: function (data) {
                if (data != null) {
                    if (data["notification"] != null) {
                        if (data["notification"]["in-stock"]["is_active"]) {
                        	if(validJwtTkn && siteCode == "in"){
                                $(".pd-get-stock-alert-popup__contents").hide();
                                getStockAlertPopup.show();
                                $(".pd-get-stock-alert-popup__final-wrap").show();
                        	}else{
	                            hideError();
	                            openSuccess();
	                        }
                        	emailStr="";
                        	numberStr="";
                        } else {
                            showError();
                        }
                    }
                } else {
                    showError();
                }
            },
            error: function (e) {
                hideError();

                /* 네트워크 에러 시 error message 노출 */
                var errorText = Granite.I18n.get("ERROR");
                if (e.responseJSON != null) {
                    var errmsg = e.responseJSON;
                    if (errmsg.message != null && errmsg.message !== "") {
                    	window.sg.components.pdGetStockAlertPopup.showPopup();
                        showFinalWrap(errmsg.message);
                    } else {
                        showFinalWrap(errorText);
                    }
                } else {
                    showFinalWrap(errorText);
                }
            }
        });
    };
    
    var ssoJwtDetail = function(loginJwt) {
    	validJwtTkn = true;
        let jwtDetailParam = {
            "jwt": loginJwt
        };
    	$.ajax({
    		headers: {
		         "Cache-Control": "no-cache",
		         "Content-Type": "application/json",
		         "Access-Control-Allow-Origin" : "*"
    		},
		    url: storeDomain + "/v1/sso/jwt/details",
			type: "POST",
    		dataType : "json",
	    	data: JSON.stringify (jwtDetailParam),
			xhrFields : {
				withCredentials: true
			},
			beforeSend : function(xhr){
				if(multiLanguageYN === "Y"){
					xhr.setRequestHeader("x-ecom-locale", hreflang);
				}
			},
		    success: function (data) {
		    	if(data != null && data !== ""){
		    		if(data.login_type == "otp"){ // 로그인 타입 otp인 경우
		    			if (data.user_info.email_address != null && data.user_info.email_address != "" && data.user_info.phone_number != null && data.user_info.phone_number != "") { //이메일 + 번호 있는 경우
			    			emailStr = data.user_info.email_address;
			    			numberStr = data.user_info.phone_number;
			    			strResult = "You will be notified on registered email <b>"+data.user_info.email_address+"</b> & registered mobile number <b>+91 "+data.user_info.phone_number+"</b>";
					    }else if(data.user_info.email_address != null && data.user_info.email_address !== "" && (data.user_info.phone_number == null || data.user_info.phone_number == "")){ //이메일만 있는 경우
					    	emailStr = data.user_info.email_address;
					    	strResult = "You will be notified on registered email <b>"+data.user_info.email_address+"</b>";
					    }else if(data.user_info.phone_number != null && data.user_info.phone_number !== "" && (data.user_info.email_address == null || data.user_info.email_address == "")){ //번호만 있는 경우
					    	numberStr = data.user_info.phone_number;
					    	strResult = "You will be notified on registered mobile number <b>+91 "+data.user_info.phone_number+"</b>";
					    }else if((data.user_info.email_address == null || data.user_info.email_address == "") && (data.user_info.phone_number == null || data.user_info.phone_number == "")){ //이메일 번호 모두 비어있는 경우
					    	emailNumberValidCheck(data.user_identity.user_id);
					    	if(emailStr){
					    		strResult = "You will be notified on registered email <b>"+data.user_identity.user_id+"</b>";
					    	}
					    	if(numberStr){
					    		strResult = "You will be notified on registered mobile number <b>+91 "+data.user_identity.user_id+"</b>";
					    	}
					    }
		    		}else{ // 로그인 타입 otp가 아닌 경우
		    			if (data.user_info.email_address != null && data.user_info.email_address != "" && data.user_info.otp_verified_phone_number != null && data.user_info.otp_verified_phone_number != "") { //이메일 + 번호 있는 경우
			    			emailStr = data.user_info.email_address;
			    			numberStr = data.user_info.otp_verified_phone_number;
			    			strResult = "You will be notified on registered email <b>"+data.user_info.email_address+"</b> & registered mobile number <b>+91 "+data.user_info.otp_verified_phone_number+"</b>";
					    }else if(data.user_info.email_address != null && data.user_info.email_address !== "" && (data.user_info.otp_verified_phone_number == null || data.user_info.otp_verified_phone_number == "")){ //이메일만 있는 경우
					    	emailStr = data.user_info.email_address;
					    	strResult = "You will be notified on registered email <b>"+data.user_info.email_address+"</b>";
					    }else if(data.user_info.otp_verified_phone_number != null && data.user_info.otp_verified_phone_number !== "" && (data.user_info.email_address == null || data.user_info.email_address == "")){ //번호만 있는 경우
					    	numberStr = data.user_info.otp_verified_phone_number;
					    	strResult = "You will be notified on registered mobile number <b>+91 "+data.user_info.otp_verified_phone_number+"</b>";
					    }
		    		}
		    		strResult += " once the stock is available.<br><br>"+
			    				 "By providing your email/mobile number you agree to marketing communications & inventory alerts from Samsung on Email, SMS & WhatsApp.<br>"+
			    				 "By clicking submit you are agreeing to the above Terms and Conditions.";
		    	 }
            	
            	var consents = "";
            	var paramStr = "{}";
            	if(emailStr != "" && numberStr != ""){ // 이메일 + 번호 있을 때
             		paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"email\" : \"" + emailStr + "\",\"mobile\" : \"" + numberStr + "\"" + consents + "}";
             	}else if(emailStr != "" && numberStr == ""){ // 이메일만 있을 때
             		paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"email\" : \"" + emailStr + "\"" + consents + "}";
             	}else if(emailStr == "" && numberStr != ""){ // 번호만 있을 때
             		paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"mobile\" : \"" + numberStr + "\"" + consents + "}";
             	}
            	var paramJson = JSON.parse(paramStr);
            	var paramObj = JSON.stringify(paramJson);
            	var loginJwt = $.cookies.get("jwt_" + countryIsoCode, {
            		domain: ".samsung.com"
            	});
            	
                callInStockApiGpv2(validJwtTkn, loginJwt, paramObj);
                $(".pd-get-stock-alert-popup__final-desc").html(strResult);
		     }
    	 });
    };

    $(document).on("click", ".js-cta-stock", function () {
    	tempProductCode = $(this).attr("data-modelcode");
    	if (isGpv2 === 'Y'){
    		tempProductCode = $(this).attr("data-sku-code");
    	}
        if($(this).attr("data-virtual-modelcode") != null ){
            //[EPP] Refurbish, Flash sale 관련 로직 추가
            tempProductCode = $(this).attr("data-virtual-modelcode");
        }
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-submit").attr( 'data-modelcode',$(this).attr("data-modelcode"));
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-submit").attr( 'data-modelname', $(this).attr("data-modelname") );
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-close").attr( 'data-modelcode', $(this).attr("data-modelcode") );
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-close").attr( 'data-modelname', $(this).attr("data-modelname") );
    	
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-submit").attr( 'an-tr', $(this).attr("data-antr") ? $(this).attr("data-antr") : "pd03_product finder:stock alert-"+ digitalData.page.pageInfo.pageTrack +"-cta-popup");
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-close").attr( 'an-tr', $(this).attr("data-antr") ? $(this).attr("data-antr") : "pd03_product finder:stock alert-"+ digitalData.page.pageInfo.pageTrack +"-cta-popup");
    	getStockAlertPopup.find(".pd-get-stock-alert-popup__close").attr( 'an-tr', $(this).attr("data-antr") ? $(this).attr("data-antr") : "pd03_product finder:stock alert-"+ digitalData.page.pageInfo.pageTrack +"-cta-popup");
    	
    	if(siteCode == 'in'){
    		var loginJwt = $.cookies.get("jwt_" + countryIsoCode, {
                domain: ".samsung.com"
            });
    		var validJwtTkn = false;
    		
    		//로그인 여부 확인
            if (loginJwt != null) { //로그인
                let validateParam = {
                    "jwt": loginJwt
                };
                if(isEppSite){
                    validateParam["store_id"] = eppStoreId;
                }
            	// jwt validate 체크
                $.ajax({
                    headers: {
                        "Cache-Control": "no-cache",
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    url: storeDomain + "/v1/sso/user/validate",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(validateParam),
                    timeout: 10000,
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        if (multiLanguageYN === "Y") {
                            xhr.setRequestHeader("x-ecom-locale", hreflang);
                        }
                    },
                    success: function (data) {
                        if (data.statusCode === 200 || data.statusCode === "200") {
                            validJwtTkn = true;
                        }
                        ssoJwtDetail(loginJwt);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                    	console.log(jqXHR.responseText);
                    }
                });
            }else{	//비로그인
            	window.sg.components.pdGetStockAlertPopup.showPopup($(this)[0]);
            }
    	}else{
    		if(siteCode === "cn"){ // SCIC hybris전환
            	getStockFlag = $(this).attr("data-gs-flag");
            	
            	var checkboxHtml = '';
            	checkboxHtml +=
    	        	'<div class="pd-get-stock-alert-popup__checkbox-wrap is-required">'+
    	        		'<div class="checkbox-v2">'+
    	        			'<input class="checkbox-v2__input js-pd-get-stock-alert-popup__checkbox" type="checkbox" name="checkbox" id="cn_StockAlert_TC_1" aria-required="true">'+
    	    				'<label class="checkbox-v2__label" for="cn_StockAlert_TC_1">'+
    	        				'<span class="checkbox-v2__label-box-wrap">'+
    	        					'<span class="checkbox-v2__label-box">'+
    			        				'<svg class="checkbox-v2__label-box-icon" focusable="false" aria-hidden="true">'+
    			        					'<use xlink:href="#done-bold" href="#done-bold"></use>'+
    			        				'</svg>'+
    			        			'</span>'+
    			        		'</span>'+
    			        		'<span class="checkbox-v2__label-text">'+Granite.I18n.get("stockAlert T&C Policy")+'</span>'+
    		        		'</label>'+
    			        '</div>'+
    			    '</div>'+
    			    '<div class="pd-get-stock-alert-popup__checkbox-desc is-required" style="display:block">'+Granite.I18n.get("stockAlert required Text")+'</div>';
            	
            	getStockAlertPopup.find(".pd-get-stock-alert-popup__checkbox-container").html(checkboxHtml);
            	getStockAlertPopup.find("div.pd-get-stock-alert-popup__disclaimer").html( Granite.I18n.get("stockAlert Disclaimer") );
            	getStockAlertPopup.find(".pd-get-stock-alert-popup__btn-submit").attr("data-gs-flag", getStockFlag);
            	
            	if(getStockFlag === "ComingSoon"){
            		getStockAlertPopup.find(".pd-get-stock-alert-popup__header h2.text-title").html(Granite.I18n.get("comingSoonPopup.mainTitle"));
            		getStockAlertPopup.find(".pd-get-stock-alert-popup__header p.pd-get-stock-alert-popup__desc").html(Granite.I18n.get("comingSoonPopup.subtitle"));
            	}
            	
            	window.sg.components.pdGetStockAlertPopup.reInit();
            }
    		
            if(IS_B2B){
            	if(siteCode !== "cn"){ // SCIC hybris전환 cn국가가 아닌경우에만 tnc 호출하도록 처리
            		if(b2bApiCal){
                		b2bApiCal = false;
                		
                		getTncInfoForNewHybris();
                	}
            	}
            	
                window.sg.components.pdGetStockAlertPopup.showPopup($(this)[0]);
            } else {
            	window.sg.components.pdGetStockAlertPopup.showPopup($(this)[0]);
            }
    	}
    });
    
     /* Get Stock Alerts 팝업 SUBMIT 클릭 Event */
    $(document).on("click", ".pd-get-stock-alert-popup .pd-get-stock-alert-popup__btn-submit", function () {
    	if(siteCode === "in"){
    		var emailNumber = $("#getStockAlertEmailInput").val();
	        if (emailNumberValidCheck(emailNumber)) {
	            hideError();
	        } else {
	            showError();
	            return false;
	        }
    	}else if(siteCode === "cn"){ // SCIC hybris전환
    		var mobileNumber = $("#getStockAlertEmailInput").val();
	        if (mobileNumberValidCheck(mobileNumber)) {
	            hideError();
	        } else {
	            showError();
	            return false;
	        }
    	}else{
    		var emailAddr = $("#getStockAlertEmailInput").val();
	        if (emailValidCheck(emailAddr)) {
	            hideError();
	        } else {
	            showError();
	            return false;
	        }
    	}
    	
        if (isGpv2 === 'Y') {
            //샵통합
            var consents = "";
            /* eu 국가 T&C data */
            //if (siteCode == "uk" || siteCode == "fr" || siteCode == "be" || siteCode == "be_fr" || siteCode == "nl" || siteCode == "de") {
            if (TnC_SITE.includes(siteCode)) {
                var checkBox = getStockAlertPopup.find(".js-pd-get-stock-alert-popup__checkbox");
                var idStr = "";
                consents = ",\"consents\": {";
                checkBox.each(function () {
                    var _this = $(this);
                    if (idStr.length > 0) {
                        idStr += ",";
                    }
                    idStr += "\"" + _this.attr("id") + "\": {\"is_accepted\": " + _this.is(":checked") + "}";
                });
                consents += idStr;
                consents += "}";
                if (idStr === "") {
                    consents = "";
                }
            }

            var paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"email\" : \"" + emailAddr + "\"" + consents + "}";
            if(siteCode == "in"){
            	if(emailStr != "" && numberStr != ""){ // 이메일 + 번호 있을 때
            		paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"email\" : \"" + emailStr + "\",\"mobile\" : \"" + numberStr + "\"" + consents + "}";
            	}else if(emailStr != "" && numberStr == ""){ // 이메일만 있을 때
            		paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"email\" : \"" + emailStr + "\"" + consents + "}";
            	}else if(emailStr == "" && numberStr != ""){ // 번호만 있을 때
            		paramStr = "{\"notification\":{\"in-stock\":{\"is_active\": true,\"skus\":{\"" + tempProductCode + "\":{}}}},\"mobile\" : \"" + numberStr + "\"" + consents + "}";
            	}
            }
            var paramJson = JSON.parse(paramStr);
            var paramObj = JSON.stringify(paramJson);
            var loginJwt = $.cookies.get("jwt_" + countryIsoCode, {
                domain: ".samsung.com"
            });
            var validJwtTkn = false;

            if (loginJwt != null) {
                // jwt validate 체크
                let validateParam = {
                    "jwt": loginJwt
                };
                if(isEppSite){
                    validateParam["store_id"] = eppStoreId;
                }
                $.ajax({
                    headers: {
                        "Cache-Control": "no-cache",
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    url: storeDomain + "/v1/sso/user/validate",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(validateParam),
                    timeout: 10000,
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        if (multiLanguageYN === "Y") {
                            xhr.setRequestHeader("x-ecom-locale", hreflang);
                        }
                    },
                    success: function (data) {
                        if (data.statusCode === 200 || data.statusCode === "200") {
                            validJwtTkn = true;
                        }
                        callInStockApiGpv2(validJwtTkn, loginJwt, paramObj);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        callInStockApiGpv2(validJwtTkn, loginJwt, paramObj);
                    }
                });
            } else {
                callInStockApiGpv2(validJwtTkn, loginJwt, paramObj);
            }

        } else {
            // shop, nonshop
            if(siteCode === "cn"){ // SCIC hybris전환
            	callInStockApi(mobileNumber);
            }else{
            	callInStockApi(emailAddr);
            }
        }
        return true;
    });
  //new-hybris
    var tncError = function(data){
        var errorText = "";
        if (data && data.responseJSON) {
            if (data.responseJSON.message !== null && data.responseJSON.message !== "") {
                errorText = data.responseJSON.message;
            }
        }
        if ((Granite && Granite.author) || document.URL.indexOf("/container") > -1) {
            console.error("[pd-g-getstock-popup] " + errorText);
        } else {
            confirmPopup(errorText);
        }
    };

	var getTncInfoForGPv2 = function () {
		$(".pd-get-stock-alert-popup .pd-get-stock-alert-popup__checkbox-container").html("");

		var url = storeDomain + "/v1/tnc";
		var param = {
			"display": "in_stock"
		};
        if(isEppSite){
            param["store_id"] = eppStoreId;
        }
		$.ajax({
			headers: {
				"Cache-Control": "no-cache",
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*"
			},
			type: "GET",
			url: url,
			data: param,
			dataType: "json",
			cache: true,
			timeout: 20000,
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function (xhr) {
				if (multiLanguageYN === "Y") {
					xhr.setRequestHeader("x-ecom-locale", hreflang);
				}
			},
			success: function (data) {
				if (data != null && data.length > 0) {
					var checkHtml = "";
					var tncCheckCount = 0;
					var isreqFlag =false;
					for (var i = 0; i < data.length; i++) {
						var resultData = data[i].data;

						if (resultData != null && resultData.is_active === true) {
							var id = data[i].id;

							if (resultData.read_only) {
								checkHtml +=
									'<div class="pd-get-stock-alert-popup__checkbox-desc">' +
										'<p>' + resultData.content + '</p>' +
									'</div>';
							} else {
								
								if (resultData.is_required === true) {
									isreqFlag = true;
								}
								
								checkHtml += 
									'<div class="pd-get-stock-alert-popup__checkbox-wrap' + (resultData.is_required ? ' is-required' : '') + '">' +
                                        '<div class="checkbox-v2">'+
                                            '<input class="checkbox-v2__input js-pd-get-stock-alert-popup__checkbox" type="checkbox" name="checkbox" id="' + id + '" name="receive notification checkbox' + tncCheckCount + '"'+ (resultData.is_required ?' aria-required="true"':'')+'>'+
                                            '<label class="checkbox-v2__label" for="' + id + '">'+
                                                '<span class="checkbox-v2__label-box-wrap">'+
                                                    '<span class="checkbox-v2__label-box">'+
                                                        '<svg class="checkbox-v2__label-box-icon" focusable="false" aria-hidden="true">'+
                                                        '<use xlink:href="#done-bold" href="#done-bold"></use>'+
                                                        '</svg>'+
                                                    '</span>'+
                                                '</span>'+
                                                '<span class="checkbox-v2__label-text">'+ resultData.content +'</span>'+
                                            '</label>'+
                                        '</div>'+
									'</div>' +
									'<div class="pd-get-stock-alert-popup__checkbox-desc"></div>';

								tncCheckCount++;
							}
						}
					}
					checkHtml += '<div class="pd-get-stock-alert-popup__checkbox-desc is-required" style="display:' + (isreqFlag ? 'block' : 'none') + '">'+ Granite.I18n.get("* Required field") +'</div>';
					$(".pd-get-stock-alert-popup .pd-get-stock-alert-popup__checkbox-container").html(checkHtml);
					window.sg.components.pdGetStockAlertPopup.reInit();
				}
			},
			error: function (data) {
            	tncError(data);
            }
		});
	}
	//new-hybris
    var getTncInfoForNewHybris = function () {
		$(".pd-get-stock-alert-popup .pd-get-stock-alert-popup__checkbox-container").html("");
		var disClaimer = '<p class="pd-get-stock-alert-popup__disclaimer-text">' + Granite.I18n.get("By providing your email you agree to marketing communications & inventory alerts from Samsung.") + '</p>';
		var url = storeDomain + "/tokocommercewebservices/v2/"+storeSiteCode+"/tnc";
		var param = {
			"context": "PRODUCT",
            "value" : "stock_alert_tc"
		};
        
        if( $('#shopParmLang').val() ){
            param['lang']=$('#shopParmLang').val();
        }
		$.ajax({
			type: "GET",
			url: url,
			data: param,
			dataType: "json",
			cache: true,
			timeout: 20000,
			xhrFields: {
				withCredentials: true
			},
            crossDomain: true,
			success: function (data) {
				if (data != null && data.length > 0) {
					var checkHtml = "";
					var tncCheckCount = 0;
					var isreqFlag =false;
					for (var i = 0; i < data.length; i++) {
						var resultData = data[i];

						if (resultData != null) {
							var id = resultData.code;

							if (resultData.type === "DISCLAIMER") {
								var content = resultData.content;
								if(isB2B && $("#shopIntegrationFlag").val() ==='true' && content == null){
									content = '';
								}
								disClaimer = '<p class="pd-get-stock-alert-popup__disclaimer-text">' + content + '</p>';
							} else {
								
								if (!isreqFlag && resultData.required === true) {
									isreqFlag = true;
								}
								
								checkHtml += 
									'<div class="pd-get-stock-alert-popup__checkbox-wrap' + (resultData.required ? ' is-required' : '') + '">' +
                                        '<div class="checkbox-v2">'+
                                            '<input class="checkbox-v2__input js-pd-get-stock-alert-popup__checkbox" type="checkbox" name="checkbox" id="' + id + '" name="receive notification checkbox' + tncCheckCount + '"'+ (resultData.required ?' aria-required="true"':'')+'>'+
                                            '<label class="checkbox-v2__label" for="' + id + '">'+
                                                '<span class="checkbox-v2__label-box-wrap">'+
                                                    '<span class="checkbox-v2__label-box">'+
                                                        '<svg class="checkbox-v2__label-box-icon" focusable="false" aria-hidden="true">'+
                                                        '<use xlink:href="#done-bold" href="#done-bold"></use>'+
                                                        '</svg>'+
                                                    '</span>'+
                                                '</span>'+
                                                '<span class="checkbox-v2__label-text">'+ resultData.content +'</span>'+
                                            '</label>'+
                                        '</div>'+
									'</div>' +
									'<div class="pd-get-stock-alert-popup__checkbox-desc"></div>';

								tncCheckCount++;
							}
						}
					}
					checkHtml += '<div class="pd-get-stock-alert-popup__checkbox-desc is-required" style="display:' + (isreqFlag ? 'block' : 'none') + '">'+ Granite.I18n.get("* Required field") +'</div>';
					$(".pd-get-stock-alert-popup .pd-get-stock-alert-popup__checkbox-container").html(checkHtml);
				}
			},
			error: function (data) {
                //epp service error 팝업 제거 요청
            	//tncError(data);
            }, complete : function(){
            	$(".pd-get-stock-alert-popup .pd-get-stock-alert-popup__disclaimer").html(disClaimer);
            	window.sg.components.pdGetStockAlertPopup.reInit();
            }
		});
	}

	$(function () {
        // [EPP] error 페이지 제외 
        let isEppErrorPage = false;
        if(isEppSite){
            if($('#wtbCurrentPagePath').val() != null){
                const currentPagePath = $('#wtbCurrentPagePath').val();
                if(currentPagePath.indexOf("/common/error") > -1){
                    isEppErrorPage = true;
                }
            }
        }
		if (getStockAlertPopup.length > 0 && !isEppErrorPage) {
			// b2c인 경우
			if(!isB2B && TnC_SITE.includes(siteCode) && (isGpv2 === 'Y' || isNewHybris)) {			//new-hybris
                if(isNewHybris){
                    getTncInfoForNewHybris();
                } else {
                    getTncInfoForGPv2();
                }
			}
		}
	});

})(window.jQuery);

(function (win, $) {
	
	var siteCode = $("#siteCode").val();			// GNB에서 사용되는 SiteCode
	var storeDomain = $("#storeDomain").val();		// GNB Store Domain
	var storeWebDomain = $("#storeWebDomain").val();								//new-hybris
	var countryIsoCode = $("#countryIsoCode").val();
	var multiLanguageYN = $("#multiLanguageYn").val();		// multilanguage Y/N
	var hreflang = $("#localLang").val();					// hreflang 값
	var shopIntegrationFlag = $("#shopIntegrationFlag").val();	// shop 통합 국가 여부
	var isNewHybris = (shopIntegrationFlag === "Hybris-new")?true:false;			//new-hybris	
	var isB2B = $('#b2bFlag').val() === "Y" ? true : false;
	var isOldHybrisSiteCode = ["ch","ch_fr","hk","hk_en","hu","levant","levant_ar","es","pt","ca","ca_fr","sg"]; //wishlist 사용하는 old hybris 국가
	// Store API 호출 시 사용하는 SiteCode
	var storeSiteCode = $('#store_sitecode').val();
	var csrfToken = "";
	
	// epp shop분기 추가
	storeSiteCode = checkEppSite() ? (window.sg.epp != null && window.sg.epp.common != null ? window.sg.epp.common.companyCode : "") : storeSiteCode;
	
	/* layer popup에서 사용될 code 및 name */
	var tempProductCode = "";
	var tempProductName = "";
	//var dtmProductCode = "";
	var stockLevelStatus= "";
	var tempPrice= "";
	var loginFlag = false;
	var wishArea = "";
	var priceCurrency = $("#priceCurrency").val();	// 가격 통화단위
	var useComponent = ""; // wishlist 사용 컴포넌트
	
	/* wishlist 팝업 html */
	var wishlistCategory = '';
	var wishlistPopup = $('.wishlist-popup');
	var wishlistPopupTitle = $('.wishlist-popup').find('.layer-popup__title');
	var wishlistPopupDesc = $('.wishlist-popup').find('.wishlist-popup__desc');
	var wishlistPopupCtaWrap = $('.wishlist-popup').find('.wishlist-popup__cta-wrap'); 
	var wishlistSelectBox = $('.wishlist-popup').find('.wishlist-popup__selectbox__wrap');
	var wishlistSelect = $('.wishlist-popup').find('.wishlist-popup__selectbox-inner select');	// PC, Mobile
	
	var pageTrack = digitalData.page.pageInfo.pageTrack;
	
	// epp shop분기 추가
	const isEppSite = checkEppSite();
	if(isEppSite && window.sg.epp == null ){
		window.sg.epp = {};
		window.sg.epp.common = {};
	}
	let siteCodeWithEpp = isEppSite ? window.sg.epp.common.companyCode : siteCode;
	/*
	if (siteCode === "ae" || siteCode === "ae_ar") {
		var dotcomMultistore = window.cookies.getCookie("estoreSitecode");
		if(dotcomMultistore) {
			if(dotcomMultistore === "ae" || dotcomMultistore === "ae_ar" || dotcomMultistore === "kw" || dotcomMultistore === "kw_ar" || dotcomMultistore === "om" 
				|| dotcomMultistore === "om_ar" || dotcomMultistore === "bh" || dotcomMultistore === "bh_ar" || dotcomMultistore === "qa" || dotcomMultistore === "qa_ar") {
				siteCodeWithEpp = dotcomMultistore;
				storeSiteCode = dotcomMultistore;
			} else {
				siteCodeWithEpp = siteCode;
				storeSiteCode = siteCode;
			}
		} else {
			siteCodeWithEpp = siteCode;
			storeSiteCode = siteCode;
		}
	} else if (siteCode === "n_africa") {
		siteCodeWithEpp = "ma";
		storeSiteCode = "ma";
	} else */
	if ( !isEppSite ){
		if (siteCode === "levant") { // /wishlist, /addProductToExistingWishlist, /addProductToNewWishlist api 호출시 사용
			siteCodeWithEpp = "jo";
			storeSiteCode = "jo";
		} else if (siteCode === "levant_ar") {
			siteCodeWithEpp = "jo_ar";
			storeSiteCode = "jo_ar";
		}
	}
	
	let wislhistAriaLabelForPD07 = "";
	let selectedWislhistAriaLabelForPD07 = "";
	
	Granite.I18n.setLocale($("#language").val());
	
	//[EPP] WishlistPopupUrl url변경
	if(checkEppSite() && (shopIntegrationFlag === 'Hybris-intg' || isOldHybrisSiteCode.includes(siteCode))) {
		$("#WishlistPopupUrl").val(window.sg.epp.common.WishlistPopupUrl);
	}
	
	function showErrorText(e){
		var errorText = "";
		if (e.responseJSON != null) {
			if (e.responseJSON.message != null && e.responseJSON.message !== "") {
				errorText = e.responseJSON.message;
			}else{
				errorText = Granite.I18n.get("ERROR");
			}
		}else{
			errorText = Granite.I18n.get("ERROR");
		}
		
		return errorText;
	}
	/**
	 * Popup Text Setting
	 */
	function changePopup(wishlistCategory) {
		$('.wishlist-popup').find('.wishlist-popup__cta').remove();
		
		var ctaBlackDiv = document.createElement('div');
		var ctaEmphasisDiv = document.createElement('div');
		var aTagBlack = document.createElement("a");
		var aTagEmphasis = document.createElement("a");
		ctaBlackDiv.setAttribute("class","wishlist-popup__cta");
		ctaEmphasisDiv.setAttribute("class","wishlist-popup__cta");
		
		aTagBlack.setAttribute("class","cta cta--outlined cta--black js-black");
		aTagBlack.setAttribute("href","javascript:;");
		aTagBlack.setAttribute("role","button");
		
		useComponent = useComponent.toUpperCase();
		if(useComponent === "PD03"){
			aTagBlack.setAttribute("an-tr","pd03_product finder:wishlist-"+pageTrack+"-cta-button");
		}else if(useComponent === "PD07"){
			aTagBlack.setAttribute("an-tr","pd07_offers product card list-"+pageTrack+"-text-button");
		}else if(useComponent === "HDD01"){
			aTagBlack.setAttribute("an-tr","header(pim)_product Info-"+pageTrack+"-cta-button");
		}else if(useComponent === "PD10"){
			aTagBlack.setAttribute("an-tr","curation card-"+pageTrack+"-text-button");
		}else if(useComponent === "PD12"){
			aTagBlack.setAttribute("an-tr","pd12_product card|wishlistPopup");
		}else if(useComponent === "PD13"){
			aTagBlack.setAttribute("an-tr","pd13_offers product card list|wishlistPopup");
		}else if(useComponent === "PDD17"){
			aTagBlack.setAttribute("an-tr","pdd17_pd header|wishlistPopup");
		}else if(useComponent === "MYD15"){
			aTagBlack.setAttribute("an-tr","myd15_recommended products-"+pageTrack+"-wishlist popup-account");
		}

		aTagBlack.setAttribute("an-ca","account");
		aTagBlack.setAttribute("an-ac","wishlist");
		aTagBlack.setAttribute("data-modelcode",tempProductCode);
		aTagBlack.setAttribute("data-modelname",tempProductName);
		
		aTagEmphasis.setAttribute("class","cta cta--contained cta--black js-emphasis");
		aTagEmphasis.setAttribute("href","javascript:;");
		aTagEmphasis.setAttribute("role","button");
		if(useComponent === "PD03"){
			aTagEmphasis.setAttribute("an-tr","pd03_product finder:wishlist-"+pageTrack+"-cta-button");
		}else if(useComponent === "PD07"){
			aTagEmphasis.setAttribute("an-tr","pd07_offers product card list-"+pageTrack+"-text-button");
		}else if(useComponent === "HDD01"){
			aTagEmphasis.setAttribute("an-tr","header(pim)_product Info-"+pageTrack+"-cta-button");
		}else if(useComponent === "PD10"){
			aTagEmphasis.setAttribute("an-tr","curation card-"+pageTrack+"-text-button");
		}else if(useComponent === "PD12"){
			aTagEmphasis.setAttribute("an-tr","pd12_product card|wishlistPopup");
		}else if(useComponent === "PD13"){
			aTagEmphasis.setAttribute("an-tr","pd13_offers product card list|wishlistPopup");
		}else if(useComponent === "PDD17"){
			aTagEmphasis.setAttribute("an-tr","pdd17_pd header|wishlistPopup");
		}else if(useComponent === "MYD15"){
			aTagEmphasis.setAttribute("an-tr","myd15_recommended products-"+pageTrack+"-wishlist popup-account");
		}
		aTagEmphasis.setAttribute("an-ca","account");
		aTagEmphasis.setAttribute("an-ac","wishlist");
		aTagEmphasis.setAttribute("data-modelcode",tempProductCode);
		aTagEmphasis.setAttribute("data-modelname",tempProductName);
		
		var wishlistTitle = '';
		var wishlistDesc = '';
		var ctaText = '';
		var ctaTextEmphasis = '';
		var ctaTextTagging = '';
		var ctaTextEmphasisTagging = '';
		
		if(wishlistCategory === 'notForSale'){
			wishlistTitle = Granite.I18n.get('Not for sale', siteCode);
			ctaTextEmphasis = Granite.I18n.get('Keep browsing', siteCode);
			ctaTextEmphasisTagging = 'Keep browsing';
			$(ctaEmphasisDiv).addClass('cta--single');
			// CRHQ-1014 [B2C] wishlist 팝업 마크업 변경 건
			$(wishlistPopupDesc).addClass('popup__desc--align-center');
			$(wishlistPopupDesc).addClass('wishlist-popup__desc--only');
		}else if(wishlistCategory === 'createWishlist'){
			wishlistTitle = Granite.I18n.get('Create your wishlist', siteCode);
			wishlistDesc = Granite.I18n.get('Don’t miss out on the products you love.', siteCode) +' '+ Granite.I18n.get('Sign in/Sign up now to access your wishlist on all your devices and get updates on great promotions.', siteCode);
			ctaText = Granite.I18n.get('Keep browsing', siteCode);
			ctaTextEmphasis = Granite.I18n.get('Continue', siteCode);
			if(siteCode == 'cz' || siteCode == 'sk' ){
			    ctaTextEmphasis = Granite.I18n.get('Continue_wishlist', siteCode);
			}else if(siteCode == 'cn'){
				ctaTextEmphasis = Granite.I18n.get('Log In', siteCode);
			}
			if(siteCode == 'pe'){
				ctaTextEmphasis = Granite.I18n.get('Add', siteCode);
			}
			ctaTextTagging = 'Keep browsing';
			ctaTextEmphasisTagging = 'Continue';
		}else if(wishlistCategory === 'selectWishlist'){
			wishlistTitle = Granite.I18n.get('Add to wishlist', siteCode);
			wishlistDesc = Granite.I18n.get('Do you want to add this product to your wishlist?', siteCode);
			ctaText = Granite.I18n.get('Keep browsing', siteCode);
			ctaTextEmphasis = Granite.I18n.get('Add to wishlist', siteCode);
			if(siteCode == 'cz'){
			    ctaText = Granite.I18n.get('Keep browsing_cta', siteCode);
			}
			if(siteCode == 'cz' || siteCode == 'sk' ){
			    ctaTextEmphasis = Granite.I18n.get('Add to wishlist_cta', siteCode);
			}
			ctaTextTagging = 'Keep browsing';
			ctaTextEmphasisTagging = 'Add to wishlist';
		}else if(wishlistCategory === 'completeWishlist'){
			wishlistTitle = Granite.I18n.get('Wishlist', siteCode);
			wishlistDesc = Granite.I18n.get('This product has been added to your wishlist.', siteCode);
			if(shopIntegrationFlag === 'GPv2' || isNewHybris || isB2B){				//new-hybris	
				ctaTextEmphasis = Granite.I18n.get('Continue shopping', siteCode);
				ctaTextEmphasisTagging = 'Continue shopping';
				$(ctaEmphasisDiv).addClass('cta--single');
			}else if(shopIntegrationFlag === 'Hybris-intg' || isOldHybrisSiteCode.includes(siteCode)){
				ctaText = Granite.I18n.get('Change', siteCode);
				ctaTextEmphasis = Granite.I18n.get('Continue shopping', siteCode);
				ctaTextTagging = 'Change';
				ctaTextEmphasisTagging = 'Continue shopping';
			}
		};
		
		// CRHQ-1014 [B2C] wishlist 팝업 마크업 변경 건
		if(wishlistCategory === 'notForSale'){
			$(wishlistPopupTitle).hide();
			$(wishlistPopupDesc).html(wishlistTitle);
		}else{
			$(wishlistPopupTitle).html(wishlistTitle);
			$(wishlistPopupDesc).html(wishlistDesc);
		}
		
		aTagBlack.setAttribute("an-la",ctaTextTagging.toLowerCase());
		aTagEmphasis.setAttribute("an-la",ctaTextEmphasisTagging.toLowerCase());
		
		if(ctaText){
			aTagBlack.innerHTML = ctaText;
			aTagBlack.setAttribute("aria-label", ctaText);
			ctaBlackDiv.appendChild(aTagBlack);
			wishlistPopupCtaWrap.append(ctaBlackDiv);
		}
		aTagEmphasis.innerHTML = ctaTextEmphasis;
		aTagEmphasis.setAttribute("aria-label", ctaTextEmphasis);
		ctaEmphasisDiv.appendChild(aTagEmphasis);
		wishlistPopupCtaWrap.append(ctaEmphasisDiv);
	}
	
	function changePopupEvent(wishlistCategory, wishareaTarget) {
		wishlistSelectBox.hide(); // shop 통합 hybris - select 경우에만 show
		if(shopIntegrationFlag === 'GPv2' || isNewHybris || isB2B){				//new-hybris	
			$(document).off("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis");
			$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-black", function () {
				wishlistPopup.hide();
				window.sg.components.wishPopup.closePopup();
				window.sg.components.wishlistIcon.closeWishlistPop(wishareaTarget);
			});
			if(wishlistCategory === 'notForSale' || wishlistCategory === 'completeWishlist'){
				$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					wishlistPopup.hide();
					window.sg.components.wishPopup.closePopup();
					window.sg.components.wishlistIcon.closeWishlistPop(wishareaTarget);
				});
			}else if(wishlistCategory === 'createWishlist'){
				$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					if(isEppSite){
						window.sg.epp.common.signIn(location.href);
					} else {
						goAccountLogin();
					}
				});
			}else if(wishlistCategory === 'selectWishlist'){
				$(document).on("click" , ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					if(isNewHybris || isB2B || isOldHybrisSiteCode.includes(siteCode)){				//new-hybris	
						newHybrisAddWishlist();
					} else {
						gpv2AddWishlist();
					}
				});
			}
		}else if(shopIntegrationFlag === 'Hybris-intg' || isOldHybrisSiteCode.includes(siteCode)){
			$(document).off("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis");
			$(document).off("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-black");
			$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-black", function () {
				wishlistPopup.hide();
				window.sg.components.wishlistIcon.closeWishlistPop(wishareaTarget);
			});
			if(wishlistCategory === 'notForSale'){
				$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					wishlistPopup.hide();
					window.sg.components.wishlistIcon.closeWishlistPop(wishareaTarget);
				});
			}else if(wishlistCategory === 'createWishlist'){
				$(document).on("click" , ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					if(isEppSite){
						window.sg.epp.common.signIn(location.href);
					} else {
						goAccountLogin();
					}
				});
			}else if(wishlistCategory === 'selectWishlist'){
				//wishlistSelectBox.show();
				$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					shopIntgAddWishlist();
				});
			}else if(wishlistCategory === 'completeWishlist'){
				$(document).off("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-black");
				$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-emphasis", function () {
					wishlistPopup.hide();
					window.sg.components.wishlistIcon.closeWishlistPop(wishareaTarget);
				});
				$(document).on("click", ".wishlist-popup .wishlist-popup__cta-wrap .js-black", function () {
					window.location.href = $("#WishlistPopupUrl").val();
				});
			}
		};
	}
	
	/**
	 * pd, pf 템플릿에 따른 icon 동작
	 * 
	 * addClassText : wishlist 추가 할때 사용
	 * deleteClassText : 추가 되어 있는 wishlist 삭제 할때 사용 
	 */
	function useFunctionPdPf(addClassText, removeClassText, AddTooltipText, ariaLebelText, el, shopIntegrationFlag, actionFlag, modelCode){
		if('undefined' !== typeof window.sg.components){
			
			if('undefined' !== typeof window.sg.components.dynamic && 'undefined' !== typeof window.sg.components.dynamic.DetailAfterEvent){
				if(shopIntegrationFlag === 'hybrisIntg'){
					window.sg.components.dynamic.DetailAfterEvent.wishlistPopup( addClassText+' cta--disabled', removeClassText,  '' );
				}else{					
					window.sg.components.dynamic.DetailAfterEvent.wishlistPopup( addClassText, removeClassText, AddTooltipText ); 
				}
			}else if('undefined' !== typeof window.sg.components.pfdevfn ){
				if(!addClassText){
					addClassText = removeClassText;
				}
				window.sg.components.pfdevfn.afterAddWishlist(el, addClassText, AddTooltipText, shopIntegrationFlag, tempProductCode, ariaLebelText);
				if(actionFlag === 'delete'){
					window.sg.components.pfdevfn.spliceAddedWishList(modelCode);
				}
			}
		}
	}
	
	/**
	 * Account Login Page로 Redirect
	 */
	function goAccountLogin(){
		var returnURL = window.location.href;
		var $signInForm = $("#signInForm");

		$("#signInGoBackURL", $signInForm).val(encodeURIComponent(returnURL));

		var registCheckUrl = $("#redirect_uri", $signInForm).val();

		var domainTemp = "";
		var winPort = window.location.port;
		/* port가 없거나 80, 8080 일 경우에는 https://로 호출 */
		if(winPort == null || winPort === "" || winPort === "80" || winPort === "8080"){
			domainTemp = "https://" + window.location.host;
		}else{
			domainTemp = "http://" + window.location.host;
		}

		if(registCheckUrl.indexOf(window.location.hostname) < 0){
			var registFullUrl = domainTemp + registCheckUrl;
			$("#redirect_uri", $signInForm).val(registFullUrl);
		}

		var glbState = "GLB" + Math.random().toString(36).substr(2,11);
		$.cookies.set("glbState", glbState, {domain : ".samsung.com"});
		if(siteCode === "cn") $.cookies.set("glbState", glbState, {domain : ".samsung.com.cn"}); //CRHQ 798 [AEM][CN] Hybris 전환 

		$("#response_type", $signInForm).val("code");
		$("#countryCode", $signInForm).val($("#countryCode", $signInForm).val());
		$("#signInState", $signInForm).val(glbState);
		$("#signInGoBackURL", $signInForm).val(returnURL);
		$("#scope", $signInForm).val("");

		var client_idCheck = $("#loginAccountServiceId").val();
		if(client_idCheck){
			$("#client_id", $signInForm).val(client_idCheck);
		}

		var languageCodeCheck = $("#languageCode").val();
		var countryCodeCheck = $("#countryCode").val()
		if(languageCodeCheck && countryCodeCheck){
			var locale = languageCodeCheck + "_" + countryCodeCheck;
			$("#locale", $signInForm).val(locale);
		}

		$.cookies.set("returnURL", returnURL, {domain : ".samsung.com"});
		if(siteCode === "cn") $.cookies.set("returnURL", returnURL, {domain : ".samsung.com.cn"}); // CRHQ 798 [AEM][CN] Hybris 전환 
		if(isB2B){ // 2021.04.12 B2B 로그인 추가
			$.cookies.set("dotcomReturnURL", returnURL, {domain : ".samsung.com"});
			if(siteCode === "cn") $.cookies.set("dotcomReturnURL", returnURL, {domain : ".samsung.com.cn"}); // CRHQ 798 [AEM][CN] Hybris 전환 
		}

		$signInForm.submit();
	}
	
	function loginJwtCheck(loginJwt) {
		var loginJwtFlag = true;
		if(loginJwt == null || loginJwt === ""){
			if(isEppSite){
				window.sg.epp.common.signIn(location.href);
			} else {
				goAccountLogin();
			}
			loginJwtFlag = false;
		}
		return loginJwtFlag;
	}
	
	//new-hybris
	function newHybrisAddWishlist(){
		var guid = $.cookies.get("guid",{domain:".samsung.com"});
		if(siteCode === "cn") guid = $.cookies.get("guid",{domain:".samsung.com.cn"});	//CRHQ 798 [AEM][CN] Hybris 전환 
		if(guid != null){
			commonLoginCheck( function(isLogin){
				if(isLogin) {
					let shopParm = '';
					if( $('#shopParmLang').val() ){
						shopParm=`&lang=${$('#shopParmLang').val()}`;
					}

					$.ajax({
						url : storeDomain + "/tokocommercewebservices/v2/" + storeSiteCode + "/users/current/wishlist/default/product/add?productCode="+tempProductCode + shopParm,		// 20210413 query parameter 로 변경, header 제거
						type : "POST",
						dataType : "json",
						timeout : 20000,
						xhrFields: { withCredentials: true },
						crossDomain: true,
						async : true,
						success : function(data){
							if(data != null){
								useFunctionPdPf('pd-wishlist-cta--on','', Granite.I18n.get("Remove wishlist"), selectedWislhistAriaLabelForPD07,  wishArea, 'GPv2', tempProductCode);
								
								//[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가
								if(siteCode !== "cn"){
									changePopup('completeWishlist');
									changePopupEvent('completeWishlist', wishArea[0]);
									window.sg.components.wishPopup.showPopup();
								}
								
							}else{
								confirmPopup(Granite.I18n.get("ERROR"));
							}
						},
						error : function(e){
							confirmPopup(showErrorText(e),"error");
							wishlistPopup.hide();
							window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
						}
					});
				} else {
					confirmPopup(Granite.I18n.get("ERROR"));
					wishlistPopup.hide();
					window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
				}
			})
			
		}else{
			confirmPopup(Granite.I18n.get("ERROR"));
			wishlistPopup.hide();
			window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
		}
	};

	function gpv2AddWishlist(){
		var loginJwt = $.cookies.get("jwt_"+countryIsoCode, {domain : ".samsung.com"});

		var checkJwt = loginJwtCheck(loginJwt);
		
		if(checkJwt){
			var paramObj = {
				"sku": tempProductCode,
				"price": {
					"amount": tempPrice,
					"currency": priceCurrency
				}
			};

			$.ajax({
				headers: {
					"Cache-Control": "no-cache",
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin" : "*",
					"x-ecom-app-id" : "identity-store-global",
					"x-ecom-jwt" : loginJwt
				},
				url : storeDomain + "/v4/identity/wishlist/",
				type : "POST",
				data : JSON.stringify([paramObj]),
				dataType : "json",
				timeout : 20000,
				xhrFields: { withCredentials: true },
				async : true,
				beforeSend : function(xhr){
					if(multiLanguageYN === "Y"){
						xhr.setRequestHeader("x-ecom-locale", hreflang);
					}
				},
				success : function(data){
					if(data != null){
						useFunctionPdPf('pd-wishlist-cta--on','', Granite.I18n.get("Remove wishlist"),selectedWislhistAriaLabelForPD07, wishArea, 'GPv2', tempProductCode);
						changePopup('completeWishlist');
						changePopupEvent('completeWishlist', wishArea[0]);
						window.sg.components.wishPopup.showPopup();
					}else{
						confirmPopup(Granite.I18n.get("ERROR"));
					}
				},
				error : function(e){
					confirmPopup(showErrorText(e),"error");
					wishlistPopup.hide();
					window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
				}
			});
		}else{
			confirmPopup(Granite.I18n.get("ERROR"));
			wishlistPopup.hide();
			window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
		}
	};
	
	function shopIntgAddWishlist(){
		var wishListName = '';
		var wishlistFlag = '';
		wishListName = $('.wishlist-popup').find('.wishlist-popup__selectbox-inner select').val();
		wishlistFlag = $('.wishlist-popup').find('.wishlist-popup__selectbox-inner select').find('option:selected').attr('data-check');

		if(wishlistFlag === "true"){
			var urlExistWishlist = storeDomain + "/" + siteCodeWithEpp + "/wishlist/addProductToExistingWishlist";
			$.ajax({
				url : urlExistWishlist,
				type : "POST",
				contentType : "application/x-www-form-urlencoded",
				async: false,
				data : {
					"CSRFToken" : csrfToken,
					"wishlistName" : wishListName,
					"productCode" : tempProductCode
				},
				xhrFields: {
					withCredentials: true
				},
				headers : {
					Accept : "application/json"
				},
				crossDomain : true,
				dataType : "json",
				timeout : 20000,
				success : function(data){
					if(data.success === true){
						useFunctionPdPf('pd-wishlist-cta--on','', Granite.I18n.get("Remove wishlist"),selectedWislhistAriaLabelForPD07, wishArea, 'hybrisIntg');
						changePopup('completeWishlist');
						changePopupEvent('completeWishlist', wishArea[0]);
						window.sg.components.wishPopup.showPopup();
					}else{
						wishlistPopup.hide();
						window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
					}
				},
				error : function(e){
					confirmPopup(showErrorText(e),"error");
					wishlistPopup.hide();
					window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
				}
			});
		}else{
			var urlNewWishlist = storeDomain + "/" + siteCodeWithEpp + "/wishlist/addProductToNewWishlist";
			$.ajax({
				url : urlNewWishlist,
				type : "POST",
				contentType : "application/x-www-form-urlencoded",
				async: false,
				data : {
					"CSRFToken" : csrfToken,
					"wishlistName" : wishListName,
					"productCode" : tempProductCode
				},
				xhrFields: {
					withCredentials: true
				},
				headers : {
					Accept : "application/json"
				},
				crossDomain : true,
				dataType : "json",
				timeout : 20000,
				success : function(data){
					if(data.success === true){
						useFunctionPdPf('pd-wishlist-cta--on','', Granite.I18n.get("Remove wishlist"),selectedWislhistAriaLabelForPD07, wishArea, 'hybrisIntg');
						changePopup('completeWishlist');
						changePopupEvent('completeWishlist', wishArea[0]);
						window.sg.components.wishPopup.showPopup();
					}
				},
				error : function(e){
					confirmPopup(showErrorText(e),"error");
					wishlistPopup.hide();
					window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
				}
			});
		}
	};

	/**
	 * [GPv2, New-Hybris] Wishlist Remove api 이후 호출
	 */
	function afterRemoveWishlist(data){
		if(data != null){
			useFunctionPdPf('','pd-wishlist-cta--on', Granite.I18n.get("Add to wishlist"),wislhistAriaLabelForPD07, wishArea, 'GPv2', 'delete', tempProductCode);
			window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
		}else{
			confirmPopup(Granite.I18n.get("ERROR"));
			wishlistPopup.hide();
			window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
		}

	}

	/**
	 * [GPv2, New-Hybris] Wishlist 버튼 클릭시 팝업 표시
	 */
	function wishlistBtnPopup(){
		
		let wishStatus = ""; //[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가 - wish 상태 
		if(stockLevelStatus === "NOORDER" || stockLevelStatus === "LEARNMORE"){ // 재고가 없는 경우
			wishStatus = "notForSale"; //[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가 - wish 상태 
			changePopup('notForSale');
			changePopupEvent('notForSale', wishArea[0]);
		}else{ // 재고가 있는 경우
			if(tempPrice){
				if ( siteCode === "pl" && stockLevelStatus === "OUTOFSTOCK" ) {
					wishStatus = "notForSale"; //[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가 - wish 상태 
					changePopup('notForSale');
					changePopupEvent('notForSale', wishArea[0]);
				} else {
					if(loginFlag){ // 로그인 시
						wishStatus = "selectWishlist"; //[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가 - wish 상태 
						//[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가
						if(siteCode === "cn"){
							newHybrisAddWishlist();
							window.sg.components.wishPopup.closePopup(); //scroll 및 팝업시 발생하는 event 때문에 추가
						}else{
							changePopup('selectWishlist');
							changePopupEvent('selectWishlist', wishArea[0]);
						}
					}else{ // 비로그인
						wishStatus = "createWishlist"; //[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가 - wish 상태 
						changePopup('createWishlist');
						changePopupEvent('createWishlist', wishArea[0]);
					}
				}
			}else{ // 'NOORDER'가 아니고 가격이 없는 경우
				wishStatus = "notForSale"; //[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가 - wish 상태 
				changePopup('notForSale');
				changePopupEvent('notForSale', wishArea[0]);
			}
		}
		
		//[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가
		if(siteCode === "cn"){
			if(wishStatus !== "selectWishlist"){
				window.sg.components.wishPopup.showPopup();
			}
		}else{
			window.sg.components.wishPopup.showPopup();
		}
	}
	
	//new-hybris	
	function newHybrisClickEventListener(){
		$(document).off("click", ".pd-wishlist-cta");
		$(document).on("click", ".pd-wishlist-cta", function(e){
			wishArea = $(this);
			tempProductCode = $(this).attr("data-modelcode");
			tempProductName = $(this).attr("data-modelname");
			stockLevelStatus = $(this).attr("data-stock").toUpperCase();
			tempPrice = $(this).attr("data-modelprice");
			if($(this).attr("data-component")){
				useComponent = $(this).attr("data-component");
			}
			if(useComponent == "PD07"){
				wislhistAriaLabelForPD07 = Granite.I18n.get("Add to wishlist") +' '+ $(this).attr("data-arialabeltext");
				selectedWislhistAriaLabelForPD07 =  Granite.I18n.get("Remove wishlist")+' '+$(this).attr("data-arialabeltext") +' '+Granite.I18n.get("Selected");
			}
			if(useComponent == "MYD15"){
				wislhistAriaLabelForPD07 = Granite.I18n.get("Add to wishlist") +' '+ $(this).attr("data-arialabeltext");
				selectedWislhistAriaLabelForPD07 =  Granite.I18n.get("Remove wishlist")+' '+$(this).attr("data-arialabeltext");
			}
			
			if(wishArea.hasClass("pd-wishlist-cta--on")){	// wishlist로 추가 되어 있는 경우 삭제 로직 
				var guid = $.cookies.get("guid",{domain:".samsung.com"});

				var queryParam = "?productCode="+tempProductCode+"&fields=DEFAULT&loadEntries=true&wishlistName=My Wishlist";

				if( $('#shopParmLang').val() ){
					queryParam+=`&lang=${$('#shopParmLang').val()}`;
				}
				
				//[cn new-hybris] [SRD-13860] 로그인시 wishlist 추가시 팝업없이 추가
				if(siteCode === "cn")
					window.sg.components.wishPopup.closePopup(); //scroll 및 팝업시 발생하는 event 때문에 추가
					
				$.ajax({
					url : storeDomain + "/tokocommercewebservices/v2/" + storeSiteCode + "/users/current/wishlist/removeProductFromWishlist"+queryParam,
					type : "POST",
					dataType : "json",
					timeout : 20000,
					xhrFields: { withCredentials: true },
					async : true,
					success : function(data){
						afterRemoveWishlist(data);
					},
					error : function(e){
						afterRemoveWishlist();
					}
				});
			}else{// wishlist로 추가 X
				wishlistBtnPopup();
			}
		});
	};

	function gpv2ClickEventListener(){ // complete 후, gpv2와 다르게 a버튼 disabled 시킴
		$(document).off("click", ".pd-wishlist-cta");
		$(document).on("click", ".pd-wishlist-cta", function(e){
			wishArea = $(this);
			tempProductCode = $(this).attr("data-modelcode");
			tempProductName = $(this).attr("data-modelname");
			stockLevelStatus = $(this).attr("data-stock").toUpperCase();
			tempPrice = $(this).attr("data-modelprice");
			if($(this).attr("data-component")){
				useComponent = $(this).attr("data-component");
			}
			
			if(wishArea.hasClass("pd-wishlist-cta--on")){	// wishlist로 추가 되어 있는 경우 삭제 로직 
				var loginJwt = $.cookies.get("jwt_"+countryIsoCode, {domain : ".samsung.com"});
				var paramObj = {
					"sku": tempProductCode
				};
				
				$.ajax({
					headers: {
						"Cache-Control": "no-cache",
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin" : "*",
						"x-ecom-app-id" : "identity-store-global",
						"x-ecom-jwt" : loginJwt
					},
					url : storeDomain + "/v4/identity/wishlist",
					type : "DELETE",
					data : JSON.stringify([paramObj]),
					dataType : "json",
					timeout : 20000,
					xhrFields: { withCredentials: true },
					async : true,
					beforeSend : function(xhr){
						if(multiLanguageYN === "Y"){
							xhr.setRequestHeader("x-ecom-locale", hreflang);
						}
					},
					success : function(data){
						afterRemoveWishlist(data);
					},
					error : function(e){
						afterRemoveWishlist();
					}
				});
			}else{// wishlist로 추가 X
				wishlistBtnPopup();
			}
		});
	};
	
	function shopIntgClickEventListener(){
		$(document).off("click", ".pd-wishlist-cta");
		$(document).on("click", ".pd-wishlist-cta", function(e){
			wishArea = $(this);
			tempProductCode = $(this).attr("data-modelcode");
			tempProductName = $(this).attr("data-modelname");
			if($(this).attr("data-component")){
				useComponent = $(this).attr("data-component");
			}

			if(!$(this).hasClass("js-learnmore")){
				
				/* Not For Sale 제품이 아닐경우 */
				if(loginFlag){
					if(wishArea.hasClass("pd-wishlist-cta--on")){ // shop 통합 hybris에서는 wishlist api 데이터 삭제 X - 화면에서만 삭제 
						useFunctionPdPf('','pd-wishlist-cta--on', Granite.I18n.get("Add to wishlist"), wislhistAriaLabelForPD07, wishArea, 'hybrisIntg', 'delete', tempProductCode);
						wishlistPopup.hide();
						window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
					}else{
						var url = storeDomain + "/" + siteCodeWithEpp + "/wishlist?loadEntries=false";
						$.ajax({
							url : url,
							type : "GET",
							dataType : "json",
							xhrFields: {
								withCredentials: true
							},
							crossDomain : true,
							timeout : 20000,
							success : function(data){
								wishlistSelect.empty();
								$('.wishlist-popup').find('.dropdown__list-wrap .scrollbar__wrap ul').empty();
								
								var myWishListHtml = "";
								var myWishListHtmlDropBox = "";
								if(data.wishlists != null && data.wishlists.length > 0){
									for(var idx=0; idx<data.wishlists.length; idx++){
										myWishListHtml += '<option value="'+data.wishlists[idx].name+'" data-check="true">'+data.wishlists[idx].name+'</option>';
									}
								}else{
									myWishListHtml += '<option value="'+Granite.I18n.get("My WishList")+'1" data-check="false">'+Granite.I18n.get("My WishList")+'1</option>';
								}
								wishlistSelect.append(myWishListHtml);
								
								window.sg.components.wishPopup.reInit(0); // reinit후 첫번째 인덱스 선택
								window.sg.components.wishPopup.showPopup();
								
								changePopup('selectWishlist');
								changePopupEvent('selectWishlist', wishArea[0]);
								
							},
							error : function(e){
								confirmPopup(showErrorText(e),"error");
								wishlistPopup.hide();
								window.sg.components.wishlistIcon.closeWishlistPop(wishArea[0]);
							}
						});
					}
				}else{
					changePopup('createWishlist');
					changePopupEvent('createWishlist', wishArea[0]);
					window.sg.components.wishPopup.showPopup();
				}
			}else{
				changePopup('notForSale');
				changePopupEvent('notForSale', wishArea[0]);
				window.sg.components.wishPopup.showPopup();
			}
		});
	};
		
	function init(){ // 로그인 flag 설정, 이벤트 리스너 등록
		if(shopIntegrationFlag === 'GPv2'){
			loginFlag = commonLoginCheck();
			gpv2ClickEventListener();
		}else if(shopIntegrationFlag === 'Hybris-intg' || isNewHybris || isB2B || isOldHybrisSiteCode.includes(siteCode)){				//new-hybris	
			var logCheck = document.cookie.match("xsdcxyn");
			var xsdcxyn = "";
			if(logCheck !== undefined && logCheck != null){
				xsdcxyn = $.cookies.get("xsdcxyn", {domain : ".samsung.com"});
				if(siteCode === "cn") xsdcxyn = $.cookies.get("xsdcxyn", {domain : ".samsung.com.cn"});  // CRHQ 798 [AEM][CN] Hybris 전환  
			}
			const xsdcbxyn = $.cookies.get("xsdcbxyn", {domain : ".samsung.com"});
			if(xsdcxyn === "YG" && !isB2B){
				"au,cn,nz,es,fr,it,nl,de,se,uk,sec,ru,be,be_fr,pl,dk,fi,no,ch,ch_fr,pt,cz,at,sk,my,id,ph,ro,lt,lv,ee,kz_kz,kz_ru,ua,hr,si,pe,cl,co,mx,iq_ar,iq_ku,gr,hk,hk_en,levant,levant_ar,hu,ca,ca_fr,sg".indexOf(siteCode)>-1 ? loginFlag = true : loginFlag = false;
			} else if(isB2B && $('#useLogin').val()=='Y' && $("#loginLinkURL").val() != null && $("#loginLinkURL").val() != '' && xsdcbxyn ==="YGB"){
				loginFlag = true
			}else{
				loginFlag = false;
			}
			
			if(isEppSite){
				loginFlag = window.sg.epp.common.isLogged;
			}

			var csrfUrl = storeDomain + "/" + storeSiteCode + "/security/csrf";
			if(isNewHybris) csrfUrl = storeWebDomain + "/" + siteCodeWithEpp + "/security/csrf";				//new-hybris
			if(isB2B){
				csrfUrl = storeWebDomain + "/security/csrf";
			}
			if(loginFlag){
				$.ajax({
					url : csrfUrl,
					type : "GET",
					dataType : "json",
					xhrFields: {
						withCredentials: true
					},
					crossDomain : true,
					timeout : 20000,
					success : function(data){
						if(data.token != null && data.token !== ""){
							csrfToken = data.token;
						}
					},
					error : function(){}
				});
			}
			if(isNewHybris || isB2B){
				newHybrisClickEventListener();
			} else if(shopIntegrationFlag === 'Hybris-intg' || isOldHybrisSiteCode.includes(siteCode)){
				shopIntgClickEventListener();
			} else {
				shopIntgClickEventListener();
			}
		}
	}
	
	$(function () {
		init();
	});
}(window, $));

(() => {
  const $q = window.sg.common.$q;
  const menu = window.sg.common.menu;
  const utils = window.sg.common.utils;
  const setMobileFocusLoop = window.sg.common.utils.setMobileFocusLoop;
  const removeMobileFocusLoop = window.sg.common.utils.removeMobileFocusLoop;

  const selector = {
    section: '.wishlist-popup',
    layerPopup: '.layer-popup',
    close: '.layer-popup__close',
  };

  const el = {
    section: null,
    close: null,
  };

  function init() {
    const wishPopup = document.querySelector('.wishlist-popup');

    if (!wishPopup) {
      return;
    }

    bindEvents();
  }

  function reInit(index = -1) {
    $q('.wishlist-popup .menu').target.forEach((drop) => {
      menu.reInit(drop, index);
    });

    bindEvents();
  }

  function bindEvents() {
    el.section = $q(selector.section);
    el.close = el.section.find(selector.close);
    el.ctaWrap = el.section.find('.wishlist-popup__cta-wrap');

    el.close.off('click').on('click', closePopup);
  }

  function keydownLayer(evt) {
    let firstEl = null;

    if (el.section.find('.wishlist-popup__selectbox__wrap').css('display') === 'block') {
      firstEl = $q(el.section.find('a, button, input').target[0]);
    } else {
      firstEl = el.ctaWrap.find('.wishlist-popup__cta').eq(0).find('.cta');
    }


    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode && evt.target === firstEl.target[0]) {
      evt.preventDefault();
      document.querySelector(`${selector.section} ${selector.close}`).focus();
    }
  }

  function keydownCloseBtn(evt) {
    let firstEl = null;

    if (el.section.find('.wishlist-popup__selectbox__wrap').css('display') === 'block') {
      firstEl = $q(el.section.find('a, button, input').target[0]);
    } else {
      firstEl = el.ctaWrap.find('.wishlist-popup__cta').eq(0).find('.cta');
    }

    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();
      firstEl.focus();
    }
  }

  function originFocus() {
    const pddCheck = document.querySelector('.pdd-buying-tool');
    const pdCheck = document.querySelector('.pd-buying-tool');

    if (pddCheck) {
      document.querySelector('.pdd-buying-tool [data-target-popup="wishPopup"]').focus();
    } else {
      if (pdCheck) {
        document.querySelector('.pd-buying-tool [data-target-popup="wishPopup"]').focus();
      } else {
        return false;
      }
    }
  }

  function utilsShow() {
    utils.popupControl.open(closePopup);
    utils.hiddenScroll();
  }

  function utilsHide() {
    utils.popupControl.close();
    utils.visibleScroll();
  }


  function showPopup() {
    el.section.show();
    window.sg.common.utils.hideOverDimEls();
    if (el.section.find('.wishlist-popup__selectbox__wrap').css('display') === 'block') {
      el.section.find('a, button, input').target[0].focus();
      el.section.find('a, button, input').target[0].removeEventListener('keydown', keydownLayer);
      el.section.find('a, button, input').target[0].addEventListener('keydown', keydownLayer);
    } else {
      el.ctaWrap.find('.wishlist-popup__cta').eq(0).find('.cta').focus();
      el.ctaWrap.find('.wishlist-popup__cta').eq(0).find('.cta').target[0].removeEventListener('keydown', keydownLayer);
      el.ctaWrap.find('.wishlist-popup__cta').eq(0).find('.cta').target[0].addEventListener('keydown', keydownLayer);
    }

    const closeBtn = document.querySelector(`${selector.section} ${selector.close}`);
    closeBtn.removeEventListener('keydown', keydownCloseBtn);
    closeBtn.addEventListener('keydown', keydownCloseBtn);
    
    utilsShow();

    if (document.querySelectorAll('[data-aria-hidden]').length <= 0) {
      setMobileFocusLoop(el.section.target[0]);
    }
  }

  function closePopup() {
    el.section.hide();
    window.sg.common.utils.showOverDimEls();
    removeMobileFocusLoop();

    utilsHide();

    originFocus();
  }

  window.sg.components.wishPopup = {
    reInit,
    showPopup,
    closePopup,
  };

  $q.ready(init);
})();


(() => {
  const BREAKPOINTS = window.sg.common.constants.BREAKPOINTS;
  const utils = window.sg.common.utils;
  const $q = window.sg.common.$q;
  const selector = { section: '.compare-popup' };
  const layerPopupMaxHeight = window.sg.common.layerPopupMaxHeight;
  const optionSelector = window.sg.common.OptionSelector;
  const menu = window.sg.common.menu;
  const setMobileFocusLoop = window.sg.common.utils.setMobileFocusLoop;
  const removeMobileFocusLoop = window.sg.common.utils.removeMobileFocusLoop;


  class ComparePopup {
    constructor(component) {
      this.selector = {
        section: selector.section,
        samePart: ['.compare-popup__rating', '.compare-popup__fiche-cta-wrap', '.compare-popup__fiche', '.compare-popup__price', '.compare-popup__product-card', '.compare-popup__spec', '.compare-popup__spec-wrap'],
        sameItemsWrap: '.compare-popup__spec',
        sameItems: '.compare-popup__spec-item',
        fixed: '.compare-popup__product-wrap',
        fixedPaddingPC: '.compare-popup__product-card',
        fixedOffsetMobile: '.layer-popup__close',
        scrollMobile: '.layer-popup',
        scrollPc: '.scrollbar__wrap',
        first: 'layer-popup__looping--first',
        end: 'layer-popup__looping--end',
        productList: '.compare-popup__product-item',
        filterSwitchBtn: '.compare-popup__filter-switch .switch-v2__button',
        filterSwitchTargets: '.compare-popup__detail-spec-table-body .compare-popup__detail-spec-row',
      };

      this.ele = {
        window: $q(window),
        section: $q(component),
        fixed: null,
        fixedPaddingPC: null,
        samePart: null,
        scrollMobile: null,
        scrollPc: null,
        fixedOffsetMobile: null,
      };

      this.statePC = BREAKPOINTS.MOBILE < utils.getViewPort().width;
      this.fixedTop = null;
      this.stateFixed = false;
      this.resizeTimer = null;
      this.optionFlag = null;
      this.saleCta = null;

      this.setProperty();

      this.handler = {
        resize: this.resize.bind(this),
        scroll: (event) => {
          this.scroll($q(event.target));
        },
        change: this.optChange.bind(this),
        onClickSwitchBtn: (e) => {
          const target = $q(e.currentTarget);
          const watchedTargets = target.closest(selector.section).find(this.selector.filterSwitchTargets).target;
          if (target.hasClass('on')) {
            this.setFilterCompare(watchedTargets);
          } else {
            this.setClearBody(watchedTargets);      
          }
          this.handler.resize();
        },
        popupClose: this.popupClose.bind(this),
      };

      ComparePopup.instances.set(component, this);

      this.init();
    }

    setProperty() {
      this.ele.fixed = this.ele.section.find(this.selector.fixed);
      this.ele.scrollMobile = this.ele.section.find(this.selector.scrollMobile);
      this.ele.scrollPc = this.ele.section.find(this.selector.scrollPc);
      this.ele.fixedPaddingPC = this.ele.section.find(this.selector.fixedPaddingPC);
      this.ele.fixedOffsetMobile = this.ele.section.find(this.selector.fixedOffsetMobile);

      this.ele.sameItems = [];
      this.ele.section.find(this.selector.sameItemsWrap).target.forEach((el) => {
        this.ele.sameItems.push([...el.querySelectorAll(this.selector.sameItems)]);
      });

      this.ele.samePart = [
        this.ele.section.find(this.selector.samePart[0]),
        this.ele.section.find(this.selector.samePart[1]),
        this.ele.section.find(this.selector.samePart[2]),
        this.ele.section.find(this.selector.samePart[3]),
        this.ele.section.find(this.selector.samePart[4]),
        this.ele.section.find(this.selector.samePart[5]),
      ];

      if (this.ele.section.find('.compare-popup__product-item').target.length <= 2) {
        this.ele.section.addClass('compare-popup--item2');
      } else {
        this.ele.section.removeClass('compare-popup--item2');
      }
      this.ele.filterSwitchBtn = this.ele.section.find(this.selector.filterSwitchBtn);
    }

    init() {
      this.bindEvents();
      this.resize();
    }

    reInit() {
      this.setProperty();
      this.bindEvents();
      this.resize();
    }

    cardInit() {
      this.setProperty();
      this.resize();
    }

    scroll($scroll) {
      if ($scroll.target[0].scrollTop > this.fixedTop) {
        if (!this.stateFixed) {
          this.setFixed();
        }
      } else {
        if (this.stateFixed) {
          this.clearFixed();
        }
      }
    }

    popupClose() {
      this.ele.filterSwitchBtn.removeClass('on');
    }

    getFilterHighlight(watchedTargets) {
      return watchedTargets.filter((target) => $q(target).find('.highlight').target.length > 0);
    }

    setFilterCompare(watchedTargets) {
      const resultTargets = this.getFilterHighlight(watchedTargets);
      this.setHideBody(watchedTargets);
      this.setShowBody(resultTargets);
    }

    setShowBody(targets) {
      targets.forEach((target) => {
        $q(target).css({ display: 'flex' });
      });
    }

    setHideBody(targets) {
      targets.forEach((target) => {
        $q(target).css({ display: 'none' });
      });
    }

    setClearBody(targets) {
      targets.forEach((target) => {
        $q(target).css({ display: '' });
      });
    }

    clearFixed() {
      this.ele.fixed.removeClass('compare-popup__product-wrap--fixed');

      this.ele.fixed.css({
        marginTop: '',
      });

      this.ele.fixedPaddingPC.css({
        marginTop: '',
      });

      this.stateFixed = false;
    }

    setFixed() {
      const $title = this.ele.section.find('.compare-popup__headline-wrap');
      const titleHeight = $title.target.length === 0 ? 0 : $title.offset().height;

      this.ele.fixed.addClass('compare-popup__product-wrap--fixed');

      if (this.statePC) {
        this.ele.fixed.css({
          marginTop: `${titleHeight * -1}px`,
        });
      } else {
        this.ele.fixed.css({
          marginTop: '',
        });
      }

      if (this.statePC) {
        const $menu = this.ele.section.find('.compare-popup__product-menu');
        const menuHeight = $menu.target.length === 0 ? 0 : $menu.offset().height;

        this.ele.fixedPaddingPC.css({
          marginTop: `${(titleHeight + menuHeight)}px`,
        });
      } else {
        this.ele.fixedPaddingPC.css({
          marginTop: '',
        });
      }

      this.stateFixed = true;
    }

    resize() {
      this.statePC = BREAKPOINTS.MOBILE < utils.getViewPort().width;

      this.sameHeight();

      this.clearFixed();

      if (this.statePC) {
        this.fixedTop = this.ele.scrollPc.target[0].scrollTop - this.ele.scrollPc.offset().top + this.ele.fixed.offset().top;

        this.scroll(this.ele.scrollPc);
      } else {
        this.fixedTop = this.ele.scrollMobile.target[0].scrollTop + this.ele.fixed.offset().top - this.ele.fixedOffsetMobile.target[0].getBoundingClientRect().height - parseFloat(this.ele.fixedOffsetMobile.css('margin-top'));

        this.scroll(this.ele.scrollMobile);
      }

      layerPopupMaxHeight.setMax(this.ele.section.find('.layer-popup').target[0]);

      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
      this.resizeTimer = setTimeout(() => {
        this.sameHeight();
      }, 400);
    }

    sameHeight() {
      const sameItemHeight = [];
      this.ele.sameItems.forEach((els) => {
        els.forEach((el, idx) => {
          el.style.height = '';
          if (sameItemHeight[idx] === undefined) {
            sameItemHeight[idx] = el.getBoundingClientRect().height;
          } else {
            const elHeight = el.getBoundingClientRect().height;
            if (sameItemHeight[idx] < elHeight) {
              sameItemHeight[idx] = elHeight;
            }
          }
        });
      });

      this.ele.sameItems.forEach((els) => {
        els.forEach((el, idx) => {
          el.style.height = `${sameItemHeight[idx]}px`;
        });
      });

      this.ele.samePart.forEach(($els) => {
        let max = 0;

        $els.target.forEach((el) => {
          el.style.height = '';
          const height = el.getBoundingClientRect().height;
          if (height > max) {
            max = height;
          }

          if (el.classList.contains('compare-popup__fiche-cta-wrap')) {
            if (el.childElementCount === 0) {
              el.classList.add('no-energy-label');
            }
          }

          if (el.classList.contains('compare-popup__fiche')) {
            if (el.querySelector('.badge-repairability')) {
              el.classList.add('with-repairability');
            }
          }
        });

        $els.css({
          height: `${max}px`,
        });
      });
    }

    openPopup(btnEl) {
      utils.hiddenScroll();

      this.ele.section.show();

      this.ele.section.find('.scrollbar__wrap').target.forEach((element) => {
        element.scrollTop = 0;
        // window.sg.common.scrollbar.scrollTo(element,0,1,true);
      });

      this.resize();

      this.ele.section.find('.menu').target.forEach((mn) => {
        menu.reInit(mn);
      });

      ComparePopup.setOptipSwier(this.ele.section);

      if (btnEl !== undefined) {
        this.openBtn = $q(btnEl);
      }
    }

    compareFirstFocus() {
      this.setLayerFocus(this.ele.section.find('a, button, input').target[0]);
    }

    setLayerFocus(firstStr) {
      const firstEl = $q(firstStr);
      firstEl.addClass('layer-popup__looping');

      if (!this.ele.section.find(`.${this.selector.first}`).target.length) {
        firstEl.prepend(`<button class="${this.selector.first} hidden" aria-hidden="true"></button>`);
      }

      const endEl = this.ele.fixedOffsetMobile;
      if (!this.ele.section.find(`.${this.selector.end}`).target.length) {
        endEl.after(`<button class="${this.selector.end} hidden" aria-hidden="true"></button>`);
      }

      const loopingFirst = this.ele.section.find(`.${this.selector.first}`);
      const loopingEnd = this.ele.section.find(`.${this.selector.end}`);

      loopingFirst.off('focus').on('focus', () => {
        endEl.focus();
      });

      loopingEnd.off('focus').on('focus', () => {
        firstEl.focus();
      });

      firstEl.focus();

      if (document.querySelectorAll('[data-aria-hidden]').length <= 0) {
        setMobileFocusLoop(this.ele.section.target[0]);
      }
    }

    closePopup() {
      utils.visibleScroll();

      if (document.querySelectorAll('[data-aria-hidden]').length > 0) {
        removeMobileFocusLoop();
      }

      if (this.openBtn === null || this.openBtn === undefined) {
        return;
      } else {
        this.openBtn.focus();

        this.openBtn = null;
      }

      this.ele.section.hide();

      this.ele.section.find('.layer-popup__looping--first').off('focus').remove();
      this.ele.section.find('.layer-popup__looping--end').off('focus').remove();
    }

    reInitCardSet(item) {
      if (this.optionFlag !== null) {
        if (this.optionFlag === 'color') {
          $q(item).find('.option-selector__wrap--color-chip').find('input:checked').focus();
        } else if (this.optionFlag === 'capacity') {
          $q(item).find('.option-selector__wrap--capacity').find('input:checked').focus();
        }
      }
      $q(item).find('.option-selector__wrap input').off('change', this.handler.change).on('change', this.handler.change);
    }

    optChange(e) {
      this.optionFlag = null;
      const currentTarget = $q(e.currentTarget).closest('.option-selector__wrap');
      if (currentTarget.hasClass('option-selector__wrap--color-chip')) {
        this.optionFlag = 'color';
      } else {
        this.optionFlag = 'capacity';
      }
    }

    bindEvents() {
      this.ele.window.off('resize', this.handler.resize).on('resize', this.handler.resize);

      this.ele.scrollPc.off('scroll', this.handler.scroll).on('scroll', this.handler.scroll);
      this.ele.scrollMobile.off('scroll', this.handler.scroll).on('scroll', this.handler.scroll);

      this.ele.section.find('.option-selector__wrap input').off('change', this.handler.change).on('change', this.handler.change);

      this.ele.fixedPaddingPC.target.forEach((card) => {
        const ctaLength = $q(card).find('.compare-popup__cta-area .cta').target.length;
        if (ctaLength > 1) {
          this.saleCta = true;
          this.ele.section.removeClass('compare-popup--not-sale');
        } else {
          if (this.saleCta !== true) {
            this.saleCta = false;
            this.ele.section.addClass('compare-popup--not-sale');
          }
        }
      });

      this.ele.filterSwitchBtn.off('click', this.handler.onClickSwitchBtn).on('click', this.handler.onClickSwitchBtn);
      this.ele.fixedOffsetMobile.off('click', this.handler.popupClose).on('click', this.handler.popupClose);
    }

    static setOptipSwier($section) {
      // .option-selector__wrap--color-chip show mobile
      // item.length 1~4 no Arrow, item.length 5 has Arrow
      // item.length 3 : O O O
      // item.length 4 : O O O O
      // item.length 5 : < O O >

      $section.find('.option-selector .option-selector__wrap').target.forEach((opt) => {
        const isMobileLess = opt.classList.contains('option-selector__wrap--color-chip') && opt.querySelectorAll('.option-selector__swiper-slide').length <= 4;
        if (!isMobileLess) {
          const $option = $q(opt);
          $option.removeClass('unbind-option');
          optionSelector.reInit($option);
        }
      });
    }
  }

  function init() {
    const $section = $q(selector.section);
    ComparePopup.setOptipSwier($section);

    $q(selector.section).target.forEach((element) => {
      layerPopupMaxHeight.init(element.querySelector('.layer-popup'));

      if (!ComparePopup.instances.has(element)) {
        new ComparePopup(element);
      } else {
        const instances =  ComparePopup.instances.get(element);
        instances.reInit();
      }
    });
  }

  function reInit() {
    window.sg.common.lazyLoad.setLazyLoad();
    window.sg.common.switchv2.reInit('.compare-popup .switch-v2');

    const $section = $q(selector.section);

    $section.find('.scrollbar').target.forEach((element) => {
      window.sg.common.scrollbar.init(element);
    });

    $section.find('.menu').target.forEach((element) => {
      menu.reInit(element);
    });

    ComparePopup.setOptipSwier($section);

    $section.target.forEach((element) => {
      layerPopupMaxHeight.reInit(element.querySelector('.layer-popup'));

      if (ComparePopup.instances.has(element)) {
        const instances =  ComparePopup.instances.get(element);
        instances.reInit();
      }
    });
  }

  function cardInit(wrap) {
    window.sg.common.lazyLoad.setLazyLoad();

    const $wrap = $q(wrap);
    const $section = $q(selector.section);

    ComparePopup.setOptipSwier($section);

    $section.target.forEach((element) => {
      if (ComparePopup.instances.has(element)) {
        const instances =  ComparePopup.instances.get(element);
        instances.cardInit();
        instances.reInitCardSet(wrap);
      }
    });

    $wrap.find('.scrollbar').target.forEach((element) => {
      window.sg.common.scrollbar.resize(element);
    });
  }

  function openPopup(element, btn = null) {
    if (ComparePopup.instances.has(element)) {
      const instances =  ComparePopup.instances.get(element);
      instances.openPopup(btn);
    } else {
      new ComparePopup(element);

      const instances =  ComparePopup.instances.get(element);
      instances.openPopup(btn);
    }
  }

  function closePopup(element) {
    if (ComparePopup.instances.has(element)) {
      const instances =  ComparePopup.instances.get(element);
      instances.closePopup();
    }
  }

  function compareFirstFocus() {
    $q(selector.section).target.forEach((element) => {
      if (ComparePopup.instances.has(element)) {
        const instances =  ComparePopup.instances.get(element);
        instances.compareFirstFocus();
      }
    });
  }

  ComparePopup.instances = new WeakMap();

  window.sg.components.comparePopup = {
    init,
    reInit,
    cardInit,
    openPopup,
    closePopup,
    compareFirstFocus,
  };

  $q.ready(init);
})();

; (function($, document) {
	'use strict';
	/*
		cl{name} defined : Compare Layout
	*/
	window.sg.components.pf = window.sg.components.pf || {};
	const pf = window.sg.components.pf;
	
	// (nv-g-gnb.html)
	const addToCartPostYn = $("#addToCartPostYn").val() ? $("#addToCartPostYn").val() : "N";
	
	const clStoreDomain = $('#storeDomain').val();
	const clSearchDomain = $('#searchDomain').val();
	const clScene7domain = $('#scene7domain').val();
	const clReviewUseYN = $('#reviewUseYN').val();
	const clReevooUseYN = $('#reevooUseYN').val();
	const clApiStageInfo = $('#apiStageInfo').val();
	const clPriceDisplayYn = $("#pfPriceDisplayYn").val();
	const clPriceCurrency = $("#pfPriceCurrency").val();
	const clShopIntegrationFlag = $("#shopIntegrationFlag").val();
	const clPdurlAnchorCheckYn = $("#pfPdurlAnchorCheckYn").val();
	const clWtbCtaBtnYn = $("#pfWtbCtaBtnYn").val();		// SEPOL, SEB ( ee, lt, lv, pl )국가 >  WTB와 Learn More 의 위치가 바뀜
	const clOfferCheckYn = $("#pfOfferCheckYn").val();
	const clPageTrack = $("#pfPageTrack").val();
	const clHybrisApiJson = $("#pfHybrisApiJson").val(); 		//hybris api 호출 시 json 으로 호출하는 국가 ( N : jsonp )
	const clIsGPv2 = (clShopIntegrationFlag === 'GPv2') ? true : false;
	const clIsHybrisIntg = (clShopIntegrationFlag === 'Hybris-intg') ? true : false;
	const isNewHybris = (clShopIntegrationFlag === 'Hybris-new') ? true : false;		//new-hybris		
	const isNonShop = fnIsNull(clShopIntegrationFlag)?true : false;
	const isB2bhybris = (clShopIntegrationFlag === "true")?true : false;
	const isB2b = ($("#b2bFlag").val() === "Y")?true : false;
	const productGroupCode = $("#pfCategoryGroupCode").val();
	const storeSiteCode = $("#store_sitecode").val();
	const storeWebDomain = $("#storeWebDomain").val();

	const isEppSite = checkEppSite();
	if(isEppSite && window.sg.epp == null){
		window.sg.epp = {};
		window.sg.epp.common = {};
	}
	const eppCompanyCode = isEppSite ? window.sg.epp.common.companyCode : "";
	const eppIsUserGroupPricing = isEppSite ? window.sg.epp.common.isUserGroupPricing : false;
	const eppUserGroupName = eppIsUserGroupPricing ? window.sg.epp.common.groupName : "";
	const pfType = isEppSite ? $("#pfType").val() : "";
	const offerId = isEppSite ? $("#pfOfferId").val() : "";
	const eppIsRefurbish = pfType =="R" ? true : false;
	const eppIsFlash = pfType == "F" ? true : false;
	const eppOmniPricingUseYn = isEppSite ? $('#pfEppOmniPricingUseYn').val():"";
	
	const clImagePresetDesktop = "240_240";
	const clImagePresetMobile = "GNB_CARD_FULL_M_PNG";
	const clImageLazyloadPreset = "LazyLoad_Home";
	
	const GROUPCODE_VD = "04000000";
	const GROUPCODE_HA = "08000000";
	const GROUPCODE_IM = "01000000";
	
	let clSiteCode = $("#siteCode").val();
	
	let clCartUrl = $("#pfCartUrl").val();
	if(clSiteCode === "levant"){
		clCartUrl = clCartUrl.replace("/levant/","/jo/");
	} else if(clSiteCode === "levant_ar"){
		clCartUrl = clCartUrl.replace("/levant_ar/","/jo_ar/");
	}
	// lowestWasPrice 없을 시 strikethrough 제거
	const LOWEST_WAS_PRICE_STRIKETHROUGH_SITE_CODE = ["pl", "gr", "si", "fi", "it", "dk", "no", "se", "fr"]; // lowestWasPrice strikethrough siteCode 
	const isStrikethroughRmSite = $.inArray(siteCode, LOWEST_WAS_PRICE_STRIKETHROUGH_SITE_CODE) >= 0 ? true : false;
	
	if(clSiteCode=="in" && isEppSite){
		// epp in 사이트 cart url 적용
		clCartUrl = storeWebDomain + "/in/web/store/"+eppCompanyCode+"/cart/";
	}
	
	let isButtonShow = true;
	let productListData = {};
	let groupData = {};
	
	let originPrice = ""; // 기본 가격 (Tagging Data)
	let discountPrice = ""; // 할인후 가격  (Tagging Data)
	
	let clSearchApiParam = {
		"siteCode": clSiteCode,
		"onlyRequestSkuYN": "N"
	};
	
	// {b2c/b2b}/product/card/detail api 관련 변수
	const apiSiteInfo = isEppSite ? 'epp/v2' : 'b2c';
	let clSearchApiUrl = clSearchDomain + '/' + clApiStageInfo + '/'+apiSiteInfo+'/product/card/detail/global';
	if(isB2b){
		if(isB2bhybris){
			clSearchApiParam.shopType = "b2bhybris";
		}
		clSearchApiParam.commonCodeYN = "N";
		clSearchApiParam.saleSkuYN = "N";
		clSearchApiUrl = clSearchDomain + '/' + clApiStageInfo + '/b2b/product/card/detail';
	}else{
		if (clIsGPv2) {
			clSearchApiParam.commonCodeYN = "N";
			clSearchApiParam.saleSkuYN = "N";
			clSearchApiUrl = clSearchDomain + '/' + clApiStageInfo + '/'+apiSiteInfo+'/product/card/detail/gpv2';
		} else if (clIsHybrisIntg) {
			clSearchApiParam.saleSkuYN = "N";
			clSearchApiUrl = clSearchDomain + '/' + clApiStageInfo + '/'+apiSiteInfo+'/product/card/detail/hybris';
		} else if (isNewHybris) {		//new-hybris
			clSearchApiParam.commonCodeYN = "N";
			clSearchApiParam.saleSkuYN = "N";
			clSearchApiUrl = clSearchDomain + '/' + clApiStageInfo + '/'+apiSiteInfo+'/product/card/detail/newhybris';
		}
		if(isEppSite){
			clSearchApiParam.companyCode = eppCompanyCode;
			if(eppIsUserGroupPricing){
				clSearchApiParam['groupName'] = eppUserGroupName;
			}
			if(eppIsFlash || eppIsRefurbish){
				clSearchApiParam['offerId'] =  offerId;
			}
			//[24.02.27][EPP][CN][O2O] : o2oId 파라미터 추가
			if(window.sg.epp.common.userStoreId != ""){
				clSearchApiParam['o2oId'] = window.sg.epp.common.userStoreId;
			}
		}
	}
	
	function isNotNull(_str){
		return !fnIsNull(_str) && _str !== "null";
	};
	
	// 멀티스토어 파라미터 &shopSiteCode 추가
	let dotcom_multistore = $.cookies.get("estoreSitecode") ? $.cookies.get("estoreSitecode").toString() : '';
	let shopSiteCd = '';
	if(clSiteCode === "ae" || clSiteCode === "ae_ar"){
		//NOTICE : dotcom_multistore 값이 존재 하는 경우 ae, ae_ar, kw, kw_ar, om, om_ar, bh, bh_ar 인 경우만 세팅 
		if(dotcom_multistore === "ae" || dotcom_multistore === "ae_ar" || dotcom_multistore === "kw" || dotcom_multistore === "kw_ar" || dotcom_multistore === "om" || dotcom_multistore === "om_ar" || dotcom_multistore === "bh" || dotcom_multistore === "bh_ar"
			|| dotcom_multistore === "qa" || dotcom_multistore === "qa_ar"
			) {
			shopSiteCd = isNotNull(dotcom_multistore) ? dotcom_multistore : clSiteCode;
		}else{
			shopSiteCd = clSiteCode;
		}
	} else if(clSiteCode === "levant"){
		shopSiteCd = "jo";
	} else if(clSiteCode === "levant_ar"){
		shopSiteCd = "jo_ar";
	} else if(clSiteCode === "n_africa"){
		shopSiteCd = "ma";
	}
	
	if(clSiteCode === "ae"){
    	clCartUrl = clCartUrl.replace("/ae/","/"+shopSiteCd+"/");
    } else if(clSiteCode === "ae_ar"){
    	clCartUrl = clCartUrl.replace("/ae_ar/","/"+shopSiteCd+"/");
    }
    
	if(isNotNull(shopSiteCd)){
		clSearchApiParam['shopSiteCode'] = shopSiteCd;
	}
	
	//only SECA 
	let dotcom_countryRegion = $.cookies.get("country_region") ? $.cookies.get("country_region").toString() : '';
	let regionCode = ''; // default CA-ON
	if(clSiteCode === "ca" || clSiteCode ==="ca_fr"){
		if(isNotNull(dotcom_countryRegion)) {
			regionCode = dotcom_countryRegion;
		} else {
			regionCode = 'CA-ON'; // default CA-ON
		}
		clSearchApiParam['regionCode'] = regionCode;
	}
	
	/* b2b smb user 로직 필요한 변수 셋팅 :: S */
	const isTieredPriceSite = $('#tieredPriceUseYn').val()=="Y"? true:false;
	
	let isSMBUser = "";
	let isLogedin = "";
	let useTaxExPrice = "";
	/* b2b smb user 로직 필요한 변수 셋팅 :: E */
	
	function _trimToNull(str) {
		let s = $.trim(str);
		return s.length > 0 ? s : null;
	}

	function arrayContains(array, element) {
		for (let i = 0; i < array.length; i++) {
			if (array[i] === element) {
				return true;
			}
		}
		return false;
	};
	
	function escapeHtml(text) {
		let newText = text;
		if(isNotNull(newText)){
			newText = newText
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		}
		return newText;
	};
	
	function unescapeHtml(text){
		var newText = text;
		if(isNotNull(newText)){
			newText = newText
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, "\"")
				.replace(/&#039;/g, "\'");
		}
		return newText;
	};
	
	function clPrdPreset(presetStr) {
		let preset = "?$" + presetStr;
		preset += "_PNG$";

		return preset;
	};
	
	/**
	 * imageUrl 앞에 scene7domain을 붙여준다
	 * 
	 * @param imgUrl 이미지 url
	 * @param presetType : lazy, desktop, mobile, none 
	 * @return newUrl scene7domain 을 붙인 imgUrl
	 */
	function clImgDomain(imgUrl, presetType) {
		let newUrl = "";
		let useScene7domain = clScene7domain;
		if(fnIsNull(imgUrl) || imgUrl.indexOf("http:") > -1 || imgUrl === "" || imgUrl.indexOf("//image-us.samsung.com/") > -1 || 
				imgUrl.indexOf("//stg-images.samsung.com.cn/") > -1 || imgUrl.indexOf("//images.samsung.com.cn/") > -1 || imgUrl.indexOf("image.samsung.com.cn/") > -1 ||
				imgUrl.indexOf("//stg-images.samsung.com/") > -1 || imgUrl.indexOf("//images.samsung.com/") > -1 || imgUrl.indexOf("image.samsung.com/") > -1){
			newUrl = imgUrl;
		}else{
			newUrl = useScene7domain + imgUrl;
		}
		
		if(newUrl.indexOf("?$") < 0){
			if(presetType === "lazy"){
				newUrl += clPrdPreset(clImageLazyloadPreset);
			}else if (presetType === "desktop"){
				newUrl += clPrdPreset(clImagePresetDesktop);
			}else if (presetType === "mobile"){
				newUrl += clPrdPreset(clImagePresetMobile);
			}
		}
		return newUrl;
	};
	// saveText EURO -> KUNA  변환
	/**
	var euroToKunaPrice = function(saveText){
		let tempDecimalPoint = Math.pow(10, 2);
		let euroPriceTemp = Number(saveText)*7.53450;
		euroPriceTemp = Math.round(euroPriceTemp * tempDecimalPoint) / tempDecimalPoint;
		return currencyComma(euroPriceTemp, "HRK");
	}*/
	// 할인율
	var getDiscountRate = function(savePrice, originPrice){
		let tempDecimalPoint = Math.pow(10, 2);
		let discountRateTemp = Number(savePrice) / Number(originPrice) * tempDecimalPoint;
		discountRateTemp = Number(discountRateTemp).toFixed(2);
		return discountRateTemp.replace('.', ',');
	}
	/**
	 * Price 영역
	 * 
	 * Global - monthlyPriceInfo, priceDisplay, formattedPriceSave
	 * Hybris-Intg - monthlyPriceInfo, priceDisplay, promotionPriceDisplay, price, promotionPrice
	 * GPv2 - leasingInfo, priceDisplay, promotionPriceDisplay, listPriceDisplay, price. promotionPrice, listPrice
	 * b2bHybris - priceDisplay, promotionPriceDisplay, listPriceDisplay, price. promotionPrice, listPrice
		<promotionPrice 에 표시하는 우선순위>
		SMB User (VAT OFF): taxExTieredPrice > smbPromotionPrice > taxExPrice
		SMB USer (VAT ON) : tieredPrice > smbPromotionPrice > promotionPrice
		Guest User : promotionPrice
	 */
	function buildPriceArea(product, upperStock){
		originPrice = ""; // 기본 가격 (Tagging Data)
		discountPrice = ""; // 할인후 가격  (Tagging Data)
	
		let productCardTemplate = "";
		let frontModel = product.modelList[product.frontModelIdx];
		let priceDisplay = frontModel.priceDisplay;
		let priceTextForCompare = "";
		
		let useTieredPrice = false;
		let useSMBPromotionPrice = false;
		if(isSMBUser){
			if(isNotNull(frontModel.tieredPriceDisplay) && isTieredPriceSite && frontModel.tieredPriceDisplayYN === "Y"){
				useTieredPrice = true;
			} else if(isNotNull(frontModel.smbPromotionPriceDisplay)){
				useSMBPromotionPrice = true;
			}
		}
		
		if((clSiteCode === "nl" || clSiteCode === "be" || clSiteCode === "be_fr") && isNotNull(priceDisplay)){
			priceDisplay = deleteCurrency(priceDisplay, clPriceCurrency);
		}
		
		let usePriceArea = false;
		if(clPriceDisplayYn === "Y" && isNotNull(priceDisplay) && clSiteCode !== "mx" && (clSiteCode !== "pl" || upperStock !== "OUTOFSTOCK")){
			/* pl 국가이면서 Out Of Stock일경우 가격 미노출 */
			usePriceArea = true;
		}
		
		//Hybris Intg > tradeIn price text 표시
		let tradeInPriceText = "";
		if(clIsHybrisIntg && isNotNull(frontModel.tradeInPriceText)) {
			tradeInPriceText = frontModel.tradeInPriceText;
		}
		
		// Samcol Only 추가
		let covatClass = "";
		if(clSiteCode === "co" && frontModel.vatEligible === "true"){
			covatClass = " compare-popup__price--samcol";
		}
		let seiClass = "";
		if(clSiteCode === "it"){
			seiClass = " compare-popup__price--sei";
		}
		productCardTemplate +=
			'<div class="compare-popup__price'+covatClass + seiClass+'">';
		if(usePriceArea){
			let promotionDisplay = "";
			let currentDisplay = priceDisplay;
			
			// tagging data - originPrice Set ( data-modelprice )
			if(isNotNull(frontModel.price)){
				originPrice = frontModel.price;
			} else if( isNotNull(frontModel.priceDisplay)){
				originPrice = deleteCurrencyComma(frontModel.priceDisplay, clPriceCurrency);
			}
			
			// monthlyPrice data
			let useMonthlyPrice = false;
			let monthlyPrice = "";
			let tenureVal = "";
			
			// leasingInfo data
			let useLeasingInfo = false;
			let leasingInterest = "";
			let downPaymentFormatted = "";
			let tenureUnit = "";
			let monthlyRate = "";
			
			// [US-EppDiscount] US Epp Discount Price 
			let usEppCurrentPrice = 0; // epp discount 적용된 가격
			let usEppSavePrice = 0;
			let usDefaultCurrentPrice = 0; // epp discount 전 기본 할인가격 
			let usCurrentPriceAttr = "";
			let usSuggestPriceAttr = "";
			let usUseTradeInDiscount = false;
			
			if(clSiteCode === "us"){
				// 기본 가격정보 셋팅 ( exit epp 할 경우 api 호출 없이 가격정보만 변경처리 )
				usDefaultCurrentPrice = frontModel.price;
				let usPromotionPriceForTradeIn = frontModel.listPrice;
				if(isNotNull(frontModel.promotionPrice)){
					usDefaultCurrentPrice = frontModel.promotionPrice;
					usPromotionPriceForTradeIn = frontModel.promotionPrice;
				}
				
				//[US] tradeInDiscount 가 있는 경우 > listPrice : 원가 , tradeInDiscount : save
				if(isNotNull(frontModel.tradeInDiscount) && isNotNull(frontModel.listPrice) 
						&& frontModel.tradeInDiscount != 0 && frontModel.listPrice != 0 && Number(frontModel.listPrice) > Number(frontModel.tradeInDiscount)){
					usUseTradeInDiscount = true;
					priceDisplay = currencyComma(frontModel.listPrice, clPriceCurrency);
					usDefaultCurrentPrice = Number(usPromotionPriceForTradeIn) - Number(frontModel.tradeInDiscount);
					currentDisplay = 'From '+currencyComma(usDefaultCurrentPrice, clPriceCurrency)+' with trade-in<sup>θ</sup>';
					
					// tagging data - originPrice Set ( data-modelprice )
					originPrice = frontModel.listPrice;
					// tagging data - discountPrice Set ( data-discountprice )
					discountPrice = usDefaultCurrentPrice;
				}
				
				usCurrentPriceAttr = ' data-de-currentprice="'+usDefaultCurrentPrice+'"';
				if(usUseTradeInDiscount){
					usCurrentPriceAttr += ' data-de-use-tradein="true"';
				}
				usSuggestPriceAttr = ' data-de-originpricetxt="'+priceDisplay+'"';
				
				// US Epp 가격표시 관련 정보 셋팅
				if((isNotNull(frontModel.prdSavePriceInf) || isNotNull(frontModel.tradeDiscountPrice)) && isNotNull(frontModel.prdPriceInf)){
					usEppSavePrice = 0;
					if(isNotNull(frontModel.prdSavePriceInf)){
						usEppSavePrice += frontModel.prdSavePriceInf;
					}
					if(isNotNull(frontModel.tradeDiscountPrice)){
						usEppSavePrice += frontModel.tradeDiscountPrice;
					}
					
					// US Epp 할인 가격 : prdSavePriceInf + tradeDiscountPrice
					usEppCurrentPrice = frontModel.prdPriceInf - usEppSavePrice;
					
					// tagging data - originPrice Set ( data-modelprice )
					originPrice = frontModel.prdPriceInf;
					// tagging data - discountPrice Set ( data-discountprice )
					discountPrice = usEppCurrentPrice;
				}
			}
			//new-hybris
			if(clIsGPv2 || isNewHybris || isB2bhybris){
				if(isNotNull(frontModel.leasingInfo) && clSiteCode === "nl" && frontModel.upgrade === "Y"){
					// nl 사이트만 leasingInfo 사용
					let leasingInfo = frontModel.leasingInfo;
					monthlyRate = deleteCurrency(leasingInfo.monthlyRate, clPriceCurrency);
					tenureVal = leasingInfo.tenureVal;
					downPaymentFormatted = deleteCurrency(leasingInfo.downPaymentFormatted, clPriceCurrency);
					tenureUnit = leasingInfo.tenureUnit;
					
					useLeasingInfo = true;
					
				}else if( isNotNull(frontModel.monthlyPriceInfo) 
						&& isNotNull(frontModel.monthlyPriceInfo.leasingMonthly) && isNotNull(frontModel.monthlyPriceInfo.leasingMonths) && isNotNull(frontModel.monthlyPriceInfo.interest)){
					let monthlyPriceInfo = frontModel.monthlyPriceInfo;
					monthlyPrice = currencyComma(monthlyPriceInfo.leasingMonthly, clPriceCurrency);
					tenureVal = monthlyPriceInfo.leasingMonths;
					leasingInterest = monthlyPriceInfo.interest;
					
					useMonthlyPrice = true;
				}
				
				promotionDisplay = frontModel.promotionPriceDisplay;
				if(isB2b && isLogedin && isSMBUser){
					if(useTieredPrice){
						promotionDisplay = frontModel.tieredPriceDisplay;
					} else if(useSMBPromotionPrice){
						promotionDisplay = frontModel.smbPromotionPriceDisplay;
					}
					
					if(useTaxExPrice){
						if(isTieredPriceSite && _trimToNull(frontModel.taxExTieredPrice)){
							promotionDisplay = frontModel.taxExTieredPriceDisplay 
						} else {
							promotionDisplay = frontModel.taxExPriceDisplay;
						}
					}
				}
				
				if((clSiteCode === "be" || clSiteCode === "be_fr" || clSiteCode === "nl") && isNotNull(promotionDisplay)){
					promotionDisplay = deleteCurrency(promotionDisplay, clPriceCurrency);
				}
				//[EPP] nl/be/be_fr leasing 정보사용 예외처리 (2022.08.24)
				if((clSiteCode==="nl" || clSiteCode==="be" || clSiteCode ==="be_fr" || siteCode ==="pl") && isEppSite){
					useLeasingInfo = false;
					useMonthlyPrice = false;
				}
			} else {
				if(isNotNull(frontModel.monthlyPriceInfo) && 
						isNotNull(frontModel.monthlyPriceInfo.leasingMonthly) && isNotNull(frontModel.monthlyPriceInfo.leasingMonths) && 
						(clSiteCode === "au" || clSiteCode === "nz" || clSiteCode === "ae" || clSiteCode === "my" || clSiteCode === "sg" || clSiteCode === "ca" || clSiteCode === "ca_fr" || 
						clSiteCode === "it" || clSiteCode === "se" || clSiteCode === "dk" || clSiteCode === "fi" || clSiteCode === "no" || clSiteCode === "es" || clSiteCode === "pt" || 
						clSiteCode === "th" || clSiteCode === "tw" || clSiteCode === "ru" || clSiteCode === "ch" || clSiteCode === "ch_fr")){
					let monthlyPriceInfo = frontModel.monthlyPriceInfo;
					monthlyPrice = currencyComma(monthlyPriceInfo.leasingMonthly, clPriceCurrency);
					tenureVal = monthlyPriceInfo.leasingMonths;
					
					useMonthlyPrice = true;
				}
				if(clIsHybrisIntg){
					promotionDisplay = frontModel.promotionPriceDisplay;
				}
			}
			
			if(isNotNull(promotionDisplay) && !usUseTradeInDiscount){
				currentDisplay = promotionDisplay;
			}
			
			//price area build
			let monthlyPriceInfoDesc = "";
			// SAMCOL VAT free
			if(isNotNull(covatClass)){
				
				productCardTemplate +=
					'<p class="compare-popup__samcol-price"><strong>'+Granite.I18n.get("Price without VAT")+': '+frontModel.vatFreePriceDisplay+'</strong></p>';
				if(isNotNull(promotionDisplay)){
					productCardTemplate +=
						'<p class="compare-popup__samcol-special"><strong>'+Granite.I18n.get("Price with discount")+': '+promotionDisplay+'</strong></p>';
				}
				productCardTemplate +=
					'<p class="compare-popup__samcol-rrp">'+Granite.I18n.get("Price before")+': <del>'+priceDisplay+'</del></p>';

			}else{	
				if((upperStock === "NOORDER" || upperStock === "LEARNMORE") && 
						(clSiteCode === "nl" || clSiteCode === "be" || clSiteCode === "be_fr")){
					productCardTemplate +=
						'<div class="compare-popup__price-current" data-pricetext="'+priceDisplay+'">'+
							'<span class="hidden">'+Granite.I18n.get("Current Price")+': </span>'+
							'<span class="compare-popup__price-current-payment">'+priceDisplay+'</span>'+
						'</div>';
				}else if(((clIsGPv2 || isNewHybris || isB2bhybris) && upperStock !== "LEARNMORE" && upperStock !== "NOORDER") || 
						(!clIsGPv2 && !isNewHybris && !isB2bhybris && upperStock !== "LEARNMORE")){				//new-hybris
					if(isNotNull(tradeInPriceText)){
						productCardTemplate +=
							'<div class="compare-popup__price-current" data-pricetext="'+tradeInPriceText+'">'+
								'<span class="compare-popup__price-current-text">'+
									tradeInPriceText+
								'</span>'+
							'</div>';
					}else if(useMonthlyPrice && !usUseTradeInDiscount){
						priceTextForCompare = 
							Granite.I18n.get("From {0}/mo",[monthlyPrice])+' ';
						if(leasingInterest !== "" && siteCode !== "pe"){
							priceTextForCompare += 
								Granite.I18n.get("for {0} mos at {1}% APR",[tenureVal, leasingInterest])+' ';
						} else {
							priceTextForCompare += 
								Granite.I18n.get("for {0} mos",[tenureVal])+' ';
						}
						monthlyPriceInfoDesc = priceTextForCompare;
						priceTextForCompare += 
							Granite.I18n.get("or")+' ';
						
						let priceTextForCompareAttr = 
							' data-pricetext="'+priceTextForCompare+currentDisplay+'"';
							
						if(clSiteCode === "us"){
							if(isNotNull(usEppCurrentPrice) && usEppCurrentPrice !== 0){
								let eppPriceTextForCompare = 
									Granite.I18n.get("From {0}/mo",[monthlyPrice])+
									' '+ Granite.I18n.get("for {0} mos at {1}% APR",[tenureVal, leasingInterest])+
									' '+ Granite.I18n.get("or")+' '+currencyComma(usEppCurrentPrice, clPriceCurrency);
								priceTextForCompareAttr = ' data-pricetext="'+eppPriceTextForCompare+'" data-use-epp-discount="true"';
								currentDisplay = currencyComma(usEppCurrentPrice, clPriceCurrency);
							}
							
							priceTextForCompareAttr += ' data-de-pricetext="'+priceTextForCompare+'" data-de-currentprice="'+usDefaultCurrentPrice+'"'+
							' data-use-monthly="true"';
						}
						if(clSiteCode === "it"){
							productCardTemplate +=
								'<div class="compare-popup__price-current"'+priceTextForCompareAttr+usCurrentPriceAttr+'>'+
									'<span class="hidden">'+Granite.I18n.get("Current Price")+': </span>'+
									'<span class="compare-popup__price-current-payment">'+currentDisplay+'</span>'+
								'</div>';
						}else{
							productCardTemplate +=
								'<div class="compare-popup__price-current"'+priceTextForCompareAttr+'>'+
									'<span class="hidden">'+Granite.I18n.get("Monthly Price")+': </span>'+
									'<span class="compare-popup__price-current-text">'+
										Granite.I18n.get("From {0}/mo",[monthlyPrice])+
										' ';
										if(leasingInterest !== "" && siteCode !== "pe" && siteCode !== "de"){
											productCardTemplate += 
												Granite.I18n.get("for {0} mos at {1}% APR",[tenureVal, leasingInterest]);
										} else {
											productCardTemplate += 
												Granite.I18n.get("for {0} mos",[tenureVal]);
										}
									productCardTemplate +=
									'</span>'+
									'<span class="compare-popup__price-current-payment"'+usCurrentPriceAttr+'>'+ 
										'<span class="compare-popup__price-current-text">'+ Granite.I18n.get("or") +'</span>'+
										currentDisplay+
									'</span>'+
								'</div>';
						}
					}else if(useLeasingInfo){
						if(downPaymentFormatted !== "" && tenureUnit !== "" && tenureVal !== "" && monthlyRate !== ""){
							let leasingText = " " + downPaymentFormatted + " + " + 
							tenureVal + " x " +
							monthlyRate + "/" + 
							Granite.I18n.get(tenureUnit);
							
							priceTextForCompare = currentDisplay + ' '+Granite.I18n.get("or")+' ' + leasingText;
								
							let priceTextForCompareAttr = 
								' data-pricetext="'+priceTextForCompare+'"';
							
							productCardTemplate +=
								'<div class="compare-popup__price-current"'+priceTextForCompareAttr+'>'+
									'<span class="hidden">'+Granite.I18n.get("Monthly Price")+': </span>'+
									'<span class="compare-popup__price-current-text">'+ 
										currentDisplay+
									'</span>'+
									'<span class="compare-popup__price-current-payment">'+
										'<span class="compare-popup__price-current-text">'+ Granite.I18n.get("or") +'</span>'+
										leasingText+
									'</span>'+
								'</div>';
						}
					} else {
						let priceTextForCompareAttr = ' data-pricetext="'+currentDisplay+'"';
						let defaultCurrentDisplay = currentDisplay;
								
						if(clSiteCode === "us"){
							if(isNotNull(usEppCurrentPrice) && usEppCurrentPrice !== 0){
								currentDisplay = currencyComma(usEppCurrentPrice, clPriceCurrency);
								let tmp_pricetext = currentDisplay;
								if(frontModel.tradeDiscountPrice > 0){
									// tradeDiscount 가 있는경우 아래 문구로 표시
									tmp_pricetext = 'From '+currentDisplay+' with trade-inθ';
									currentDisplay = 'From '+currentDisplay+' with trade-in<sup>θ</sup>';
								}
								priceTextForCompareAttr = ' data-pricetext="'+tmp_pricetext+'" data-use-epp-discount="true"';
							}
							priceTextForCompareAttr += ' data-de-pricetext="'+defaultCurrentDisplay+'" data-use-monthly="false"';
						}
						productCardTemplate +=
							'<div class="compare-popup__price-current"'+priceTextForCompareAttr+usCurrentPriceAttr+'>'+
								'<span class="hidden">'+Granite.I18n.get("Current Price")+': </span>'+
								'<span class="compare-popup__price-current-payment">'+currentDisplay+'</span>'+
							'</div>';
					}
					
					//Save Text 영역 STR
					productCardTemplate +=
							'<div class="compare-popup__price-next">';
					if(clIsGPv2 || isNewHybris || isB2bhybris){				//new-hybris
						if(isNotNull(promotionDisplay) || usUseTradeInDiscount){
							let listPrice = 0;
							if(frontModel.listPrice !== null){
								listPrice = parseFloat(frontModel.listPrice) - parseFloat(frontModel.price);
							}
							
							let savePrice = parseFloat(frontModel.price) - parseFloat(frontModel.promotionPrice);
							if(useTieredPrice){
								savePrice = parseFloat(frontModel.price) - parseFloat(frontModel.tieredPrice);
							} else if(useSMBPromotionPrice){
								savePrice = parseFloat(frontModel.price) - parseFloat(frontModel.smbPromotionPrice);
							}
							
							// US Epp Exit 시 원래 save 가격 표시를 위한 attr
							let usOriginSaveAttr = "";
							if(clSiteCode === "us"){
								let usOriginSaveText = isNotNull(frontModel.saveText) && savePrice > 0 ? frontModel.saveText : 0;
	
								if(usUseTradeInDiscount){
									savePrice = Number(frontModel.listPrice) - Number(discountPrice);
									usOriginSaveText = currencyComma(savePrice, clPriceCurrency);
									frontModel.saveText = usOriginSaveText;
								}
								usOriginSaveAttr = ' data-de-saveprice="'+usOriginSaveText+'"';
							}
							
							if(clSiteCode === "us" && usEppSavePrice > 0){
								// us epp save price 가 있는 경우
								productCardTemplate +=
									'<span class="compare-popup__price-suggested"'+usSuggestPriceAttr+'>'+
										'<span class="hidden">'+Granite.I18n.get("Original Price")+': </span>'+
										'<del>'+currencyComma(frontModel.prdPriceInf, clPriceCurrency)+'</del>'+
									'</span>'+
									'<span class="compare-popup__price-save"'+usOriginSaveAttr+'>'+
										'<span class="compare-popup__price-save-text">'+Granite.I18n.get("Save {0}", [currencyComma(usEppSavePrice, clPriceCurrency)])+'</span>'+
									'</span>';
							//COMP6FE-1599 [EPP] SEPOL MSRP Price 추가건 : && !(isEppSite && clSiteCode === "pl") 추가								
							}else if(savePrice !== 0 && isNotNull(frontModel.saveText) && !(isEppSite && clSiteCode === "pl")){
								let saveText = frontModel.saveText;
								if(useTieredPrice || useSMBPromotionPrice || eppIsUserGroupPricing){
									saveText = savePrice;
								}
								productCardTemplate += 
									'<span class="compare-popup__price-suggested"'+usSuggestPriceAttr+'>'+
										'<span class="hidden">'+Granite.I18n.get("Original Price")+': </span>';
								if(clSiteCode === "nl" || clSiteCode === "be" || clSiteCode === "be_fr" || clSiteCode === "de"){
									/* SEBN, DE 국가 정상가 앞에 From 문구 추가*/
									productCardTemplate += Granite.I18n.get("From {0}",['<del>'+priceDisplay+'</del>']);
								}else{
									productCardTemplate += '<del>'+priceDisplay+'</del>';
								}
								productCardTemplate +=
									'</span>';
								if(clSiteCode !== "nl" && clSiteCode !== "be" && clSiteCode !== "be_fr" && !(isStrikethroughRmSite && frontModel.lowestWasPriceUseYn !== "Y")){
									/* GPv2 국가 save 문구 노출
									 * SEBN 국가 save 문구 미노출 처리
									 * lowestWasPrice 국가중 lowestWasPrice 해당 없는 국가 미노출 처리
									 */
									productCardTemplate +=
									'<span class="compare-popup__price-save">'+
										'<span class="compare-popup__price-save-text">'+Granite.I18n.get("Save {0}", [currencyComma(saveText, clPriceCurrency)])+'</span>'+
									'</span>';
								}
								
								if(!usUseTradeInDiscount){
									// tagging data - discountPrice Set ( data-discountprice )
									discountPrice = frontModel.promotionPrice;
								}
							}else if(clSiteCode === "us"){
								//savePrice 가 없는 경우 Epp 선택 후 사용할 save 영역 생성
								productCardTemplate += 
									'<span class="compare-popup__price-suggested" style="display:none;"'+usSuggestPriceAttr+'>'+
										'<span class="hidden">'+Granite.I18n.get("Original Price")+': </span>'+
										'<del>'+priceDisplay+'</del>'+
									'</span>'+
									'<span class="compare-popup__price-save"'+usOriginSaveAttr+' style="display:none;"></span>';
							}else if(listPrice > 0 && (clSiteCode === "nl" || clSiteCode === "be" || clSiteCode === "be_fr")){
								productCardTemplate += 
									'<span class="compare-popup__price-suggested">'+
										'<span class="hidden">'+Granite.I18n.get("Original Price")+': </span>'+
										'<span>'+Granite.I18n.get("Listprice")+'</span>  '+
											currencyComma(frontModel.listPrice,clPriceCurrency)+
									'</span>';
							}
						}else{
							// US Epp Exit 시 원래 save 가격 표시를 위한 attr
							let usOriginSaveAttr = ' data-de-saveprice="0"';
							if(clSiteCode === "us"){
								let savePriceStyle = ' style="display:none;"';
								if(isNotNull(usEppSavePrice) && usEppSavePrice != 0){
									//Epp Save 정보가 있는 경우 Show 처리
									savePriceStyle = '';
								}
								productCardTemplate += 
									'<span class="compare-popup__price-suggested"'+savePriceStyle+usSuggestPriceAttr+'>'+
										'<span class="hidden">'+Granite.I18n.get("Original Price")+': </span>'+
										'<del>'+priceDisplay+'</del>'+
									'</span>'+
									'<span class="compare-popup__price-save"'+savePriceStyle+usOriginSaveAttr+'>'+
										'<span class="compare-popup__price-save-text">'+Granite.I18n.get("Save {0}", [currencyComma(usEppSavePrice, clPriceCurrency)])+'</span>'+
									'</span>';
							}
						}
					} else if (clIsHybrisIntg){
						if(isNotNull(frontModel.promotionPrice) && isNotNull(frontModel.promotionPriceDisplay) && (Number(frontModel.price) > Number(frontModel.promotionPrice))){
							// tagging data - discountPrice Set ( data-discountprice )
							discountPrice = frontModel.promotionPrice;
								
							//promotionPrice 를 사용하는 경우
							productCardTemplate += 
								'<span class="compare-popup__price-suggested">'+
									'<span class="hidden">'+Granite.I18n.get("Original Price")+': </span>'+
									'<del>'+priceDisplay+'</del>'+
								'</span>';
						}
					}else{
						if(siteCode === "it"){
							if(isNotNull(frontModel.lowestWasPrice) && isNotNull(frontModel.promotionPrice) 
									&& frontModel.promotionPrice < frontModel.lowestWasPrice
									){
								let savePrice = parseFloat(frontModel.lowestWasPrice) - parseFloat(frontModel.promotionPrice);
								let savePriceText = "";
								if(siteCode === "it"){
									savePriceText = Granite.I18n.get("Save the {0}%", [getDiscountRate(savePrice, frontModel.lowestWasPrice)]);
								}else{
									savePriceText = Granite.I18n.get("Save {0}", [currencyComma(savePrice, clPriceCurrency)]);
								}
								
								productCardTemplate += `
								<span class="compare-popup__price-suggested">
									<span class="hidden">${Granite.I18n.get("Original Price")}: </span>
									<del>${frontModel.lowestWasPriceDisplay}</del>
									<span class="compare-popup__price-save"><span class="compare-popup__price-save-text">${savePriceText}</span>
								</span>
								`;
							}
						}else{
							//global
							if(isNotNull(frontModel.formattedPriceSave)){
								productCardTemplate += '<span class="compare-popup__price-suggested">' + frontModel.formattedPriceSave + '</span>';
							}
						}
					}
					
					productCardTemplate += 
							'</div>';
					//Save Text 영역 END
					//
					//monthlyPriceInfoDesc
					if(clSiteCode === "it"){
						productCardTemplate +=`
						<div class="compare-popup__price-description">
							<button type="button"><span>${monthlyPriceInfoDesc}</span></button>
						</div>
						`;
					}
				}
			}
		}
		productCardTemplate +=
				'</div>';
				
		if(usePriceArea && clSiteCode === "us"){
			let includeText = '';
			let includeStyle = ' style="display:none;"';
			let tsgmt = isNotNull($.cookies.get("tsgmt")) ? $.cookies.get("tsgmt").toString() : '';
			
			if(isNotNull(frontModel.prdSavePriceTI) && isNotNull(tsgmt)){
				includeText +=
					'Includes '+frontModel.prdSavePriceTI+' '+tsgmt+' Discount';
				includeStyle = '';
			}
			productCardTemplate +=
				'<div class="compare-popup__epp">'+
					'<p class="compare-popup__epp-text"'+includeStyle+'>'+
						includeText+
					'</p>'+
				'</div>';
		}
		
		if(usePriceArea && clSiteCode === "ee" || clSiteCode === "lt" || clSiteCode === "lv"){
			if(isNotNull(frontModel.pricePeriodInfo)){
				productCardTemplate +=
					'<div class="compare-popup__epp">'+
						'<p class="compare-popup__epp-text">'+
							frontModel.pricePeriodInfo+
						'</p>'+
					'</div>';
			} else {
				productCardTemplate +=
					'<div class="compare-popup__epp"></div>';
			}
		}
		
		return productCardTemplate;
	};
	
	/**
	 * viewOptionObj : 현재 그리고 있는 Product 의 전체 옵션정보
	 * optionChip 선택 시 화면에 표시해 줄 sku의 index 를 반환함
	 * selectOptionMoIdx : 현재 선택한 옵션의 moidx 값 
	 * otherSelectedOptionMoIdxList : 현재 선택한 타입을 제외한 타입중 선택된 나머지 옵션 리스트
	 * isColorType : 현재 타입이 color 인지에 대한 여부
	 * optionTypeList : 현재 그리고있는 Product 의  optionTypeList 
	 */
	function getSelectedModelIdx(viewOptionObj, selectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, optionTypeList){
		let modelIdx = 0;
		let modelIdxList = selectOptionMoIdx.split(',');
		let firstIdx = modelIdxList[0];
		let memoryIdx = optionTypeList.indexOf("MEMORY");
		//new-hybris
		if(!clIsGPv2 && !isNewHybris && !isB2bhybris && isColorType && memoryIdx > 0){
			// [global, hybrisIntg] 상위 옵션이 color 이고, 하위에 같이 바뀌는 옵션이 memory 일 때 가장 큰값으로 선택처리
			
			let memoryOptionList = viewOptionObj["MEMORY"].optionList;
			let selectedModelIdx = 0;
			let highestOption = 0;
			for(let moi in memoryOptionList){
				let temp_mi = memoryOptionList[moi].modelIdx.split(',');
				for(let tmi in temp_mi){
					// 선택한 옵션칩의 modelIdx 리스트에 해당하는 model idx 가 있으면  비교 
					if(arrayContains(modelIdxList, temp_mi[tmi])){
						let this_memory_num = memoryOptionList[moi].optionCode.replace("TB","000").replace(/[^0-9]/g,"");
						if(highestOption < this_memory_num){
							highestOption = this_memory_num;
							selectedModelIdx = temp_mi[tmi];
						}
						break;
					}
				}
			}
			modelIdx = selectedModelIdx;
			
		} else {
			let selectModelIdxList = [];
			let tempMappingModelIdx = [];
			
			for(let omi in otherSelectedOptionMoIdxList){
				let otherMoIdx = otherSelectedOptionMoIdxList[omi];
				if(isNotNull(otherMoIdx)){
					let otherMoIdxArr = otherMoIdx.split(',');

					tempMappingModelIdx = [];
					for(let mli in modelIdxList){
						if(otherMoIdxArr.indexOf(String(modelIdxList[mli]))>-1) {
							tempMappingModelIdx.push(modelIdxList[mli]);
						}
					}
					if(tempMappingModelIdx.length > 0){
						modelIdxList = tempMappingModelIdx;
					}
				}
			}
			if(modelIdxList.length > 0){
				modelIdx = modelIdxList[0];
			} else {
				modelIdx = firstIdx;
			}
		}
		
		return modelIdx;
	};
	/*
	* multiColor 유무, optionColorType에 따른 colorOptionHtml 작성(C1타입은 없음)
	*/
	var getColorOptionHtml = function(currentOption, isSelected){
		var resultColorOptionHtml = "";
		let colorOpt = ``;
		// multiColor 인경우
		if(isNotNull(currentOption.multiColorYN) && currentOption.multiColorYN === "Y"){
			const multiColorList = currentOption.multiColorList;
			const optionColorType = multiColorList.optionColorType;
			const optionCodeList = multiColorList.optionCodeList ?? [];
	
			const color1 = optionCodeList.length > 0? optionCodeList[0]: "";
			const color2 = optionCodeList.length > 1? optionCodeList[1]: "";
			const color3 = optionCodeList.length > 2? optionCodeList[2]: "";
			const color4 = optionCodeList.length > 3? optionCodeList[3]: "";
			const color5 = optionCodeList.length > 4? optionCodeList[4]: "";
			const color6 = optionCodeList.length > 5? optionCodeList[5]: "";
			
			if(optionColorType === "C1") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
						<g transform="translate(-18.001 9)">
							<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
							<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${color1}" />
							<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</svg>
				`;
			} else if(optionColorType === "C2_A") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M-3395,7250a18,18,0,0,1,18-18h0v36h0A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${color1}" />
								<path d="M-3377,7232a18,18,0,0,1,18,18,18,18,0,0,1-18,18Z" transform="translate(3413 -7241)" fill="${color2}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C2_B") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M-3395,7250a18,18,0,0,1,18-18,18,18,0,0,1,18,18Z" transform="translate(3413 -7241)" fill="${color1}" />
								<path d="M-3395,7250h36a18,18,0,0,1-18,18A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${color2}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C3_A") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(27.001 -17.999) rotate(90)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g transform="translate(18 -3.005) rotate(-90)">
								<path d="M-1047.672,8501.792a18.1,18.1,0,0,1-1.321-6.168c0-.027,0-.056,0-.083s0-.06,0-.09a18.092,18.092,0,0,1,1.906-8.522c.009-.017.017-.036.028-.053.017-.036.034-.068.051-.1.028-.054.058-.109.085-.162,0,0,0,0,0-.007.109-.205.22-.405.337-.608l0,0a18.019,18.019,0,0,1,1.92-2.717,18.076,18.076,0,0,1,2.2-2.157,18.042,18.042,0,0,1,2.467-1.712,18.109,18.109,0,0,1,2.674-1.264,18.212,18.212,0,0,1,3.76-.967.18.18,0,0,0,.032,0,.045.045,0,0,0,.017,0A18.394,18.394,0,0,1-1031,8477v18h0l-15.583,9A18.227,18.227,0,0,1-1047.672,8501.792Z" transform="translate(1019 -8477.001)" fill="${color1}" />
								<path d="M-1049,8494.994h0v-18a18.692,18.692,0,0,1,2.051.115,18.089,18.089,0,0,1,4.971,1.313.644.644,0,0,0,.068.025.02.02,0,0,0,.015.009,17.41,17.41,0,0,1,1.889.95,18.359,18.359,0,0,1,2.047,1.374c.015.013.032.023.047.036s.034.028.051.041a18.122,18.122,0,0,1,4.446,5.135h0a18.843,18.843,0,0,1,.9,1.783l.045.1s0,0,0,0a18.093,18.093,0,0,1,1.462,6.915c0,.023,0,.047,0,.073v.1a18.107,18.107,0,0,1-1.622,7.482l-.032.073c-.009.019-.019.038-.028.058-.22.474-.463.94-.73,1.4Z" transform="translate(1037.001 -8477)" fill="${color2}" />
								<path d="M-1034.289,8494.979a18.08,18.08,0,0,1-9.093-2.986c-.017-.013-.036-.023-.053-.036a.663.663,0,0,1-.062-.043,18.052,18.052,0,0,1-4.213-3.972l-.1-.128a18.141,18.141,0,0,1-1.2-1.816l15.589-9,15.585,9a18.048,18.048,0,0,1-2.04,2.858.119.119,0,0,1-.015.016l-.077.089a18.1,18.1,0,0,1-2.673,2.456l-.026.02-.1.077a18.052,18.052,0,0,1-9.792,3.466c-.051,0-.1.007-.158.007a.029.029,0,0,1-.013,0c-.228.009-.458.013-.689.013C-1033.709,8495-1034,8495-1034.289,8494.979Z" transform="translate(1021.412 -8459.007)" fill="${color3}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.021,17,17,0,1,0,30.021,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(-30.004 0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C3_B") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 -4)">
							<rect width="36" height="36" transform="translate(18 4)" fill="none" />
							<g transform="translate(17.999 4.001)">
								<path d="M0,18A18.006,18.006,0,0,1,12,1.024v33.95A18.006,18.006,0,0,1,0,18Z" transform="translate(0 0)" fill="${color1}" />
								<path d="M0,34.974V1.024a18.086,18.086,0,0,1,12,0v33.95a18.085,18.085,0,0,1-12,0Z" transform="translate(12 0)" fill="${color2}" />
								<path d="M0,16.975A18.007,18.007,0,0,0,12,33.95V0A18.007,18.007,0,0,0,0,16.975Z" transform="translate(36 34.975) rotate(180)" fill="${color3}" />
								<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C3_C") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
						<g transform="translate(-18 -4)">
							<rect width="36" height="36" transform="translate(18 4)" fill="none" />
							<g transform="translate(53.999 4) rotate(90)">
								<path d="M0,18A18.006,18.006,0,0,1,12,1.024v33.95A18.006,18.006,0,0,1,0,18Z" transform="translate(0 0)" fill="${color1}" />
								<path d="M0,34.974V1.024a18.086,18.086,0,0,1,12,0v33.95a18.085,18.085,0,0,1-12,0Z" transform="translate(12 0)" fill="${color2}" />
								<path d="M0,16.975A18.007,18.007,0,0,0,12,33.95V0A18.007,18.007,0,0,0,0,16.975Z" transform="translate(36 34.975) rotate(180)" fill="${color3}" />
								<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C4_A") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M-3395,7250a18,18,0,0,1,18-18v18Z" transform="translate(3413 -7241)" fill="${color1}" />
								<path d="M-3377,7250v-18a18,18,0,0,1,18,18Z" transform="translate(3413 -7241)" fill="${color2}" />
								<path d="M-3377,7250h18a18,18,0,0,1-18,18Z" transform="translate(3413 -7241)" fill="${color3}" />
								<path d="M-3395,7250h18v18h0A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${color4}" />
								<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "CP") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M1.333,15.8A18.1,18.1,0,0,1,.01,9.628c0-.027,0-.055,0-.082s0-.06,0-.089A18.086,18.086,0,0,1,1.91.935L1.938.88l.053-.1L2.074.614l0-.007Q2.239.3,2.413,0L18,9,2.413,18A18.157,18.157,0,0,1,1.333,15.8Z" transform="translate(-30.005 8.994)" fill="${color1}" />
								<path d="M0,9A17.9,17.9,0,0,1,6.584,2.41,18.351,18.351,0,0,1,9.257,1.145a18.061,18.061,0,0,1,3.667-.95l.132-.019.019,0A18.137,18.137,0,0,1,15.582,0V18Z" transform="translate(-27.587 0)" fill="${color2}" />
								<path d="M0,18V0A18.223,18.223,0,0,1,2.05.115,18.011,18.011,0,0,1,7.021,1.427l.068.026a.028.028,0,0,0,.015.008,17.506,17.506,0,0,1,1.89.949,18.328,18.328,0,0,1,2.047,1.376l.046.035.052.041A18.106,18.106,0,0,1,15.585,9Z" transform="translate(-12.003 0)" fill="${color3}" />
								<path d="M0,9,15.583,0a18.31,18.31,0,0,1,.9,1.785l.045.1v0A18.087,18.087,0,0,1,18,8.808c0,.023,0,.048,0,.072s0,.064,0,.1a18.082,18.082,0,0,1-1.621,7.483l-.033.073-.027.058q-.332.71-.731,1.4Z" transform="translate(-12.004 8.997)" fill="${color4}" />
								<path d="M0,0,15.585,9a18.082,18.082,0,0,1-2.041,2.858l-.014.016-.078.089a18.166,18.166,0,0,1-2.672,2.457l-.027.02-.1.075A18.057,18.057,0,0,1,.86,17.979L.7,17.986H.688C.46,18,.23,18,0,18Z" transform="translate(-12.005 17.994)" fill="${color5}" />
								<path d="M14.717,17.98a18.082,18.082,0,0,1-9.094-2.987l-.054-.036-.062-.042A18.087,18.087,0,0,1,1.3,10.942h0l-.1-.127A18.134,18.134,0,0,1,0,9L15.589,0V18C15.3,18,15.006,17.994,14.717,17.98Z" transform="translate(-27.593 17.993)" fill="${color6}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.021,17,17,0,1,0,30.021,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(-30.004 0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
						<g transform="translate(-18.001 9)">
							<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
							<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${currentOption.optionCode}" />
							<!--/* [D] 제일 마지막 태그인 path의 fill 속성 값 변경 제외 */-->
							<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</svg>
				`;
			}
		} else {
			colorOpt = `
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
					<g transform="translate(-18.001 9)">
						<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
						<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${currentOption.optionCode}" />
						<!--/* [D] 제일 마지막 태그인 path의 fill 속성 값 변경 제외 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
					</g>
				</svg>
			`;
		}
		let currentOptionLocalNameTag = `<span class="hidden">${currentOption.optionLocalName}</span>`;
		
		resultColorOptionHtml = `
			<span class="option-selector__color-code">
				${colorOpt}
			</span>
			${currentOptionLocalNameTag}
		`;
		return resultColorOptionHtml;
	}
	
	function clProductCardFmyOptionBuild(product){
		let productCardTemplate = "";
		let frontModel = product.modelList[product.frontModelIdx];
		/* option 없을 경우 영역 전체 삭제 */ 
		if(isNotNull(product.viewOptionObj)){
			productCardTemplate += 
				'<div class="option-selector option-selector__color-text">';
			if(isNotNull(product.viewOptionObj) && Object.keys(product.viewOptionObj).length > 0){
				// 옵션침 데이터 없을 경우 빈영역 추가
				if(Object.keys(product.viewOptionObj).length === 1){
					if(Object.keys(product.viewOptionObj)[0] !== "COLOR"){
						productCardTemplate +=
							'<div class="option-selector__wrap option-selector__wrap--color-chip unbind-option is-option-empty">'+
								'<div class="option-selector__swiper">'+
									'<div class="option-selector__swiper-container">'+
										'<div class="option-selector__swiper-wrapper" role="list"></div>'+
									'</div>'+
								'</div>'+
							'</div>';
					}
				}
				
				// 상위 선택된 옵션칩의 model idx : disable 처리 할때 사용 ( idx에 해당되지않으면 disabled )
				let parentOptionModelIdx = "";
				let viewOptionIdx = 0;
				
				let curViewOptionObj = product.viewOptionObj;
				let curOptionTypeList = product.optionTypeList;
				
				for(let kind in product.viewOptionObj){
					let optionDataType = "";
					optionDataType = kind.toLowerCase().replace(/ /g, "-");
					
					let optionObj = product.viewOptionObj[kind].optionList;
					
					let isSelected = false;
					let currentOption = {};
					let disabledClass = '';
					let chipId = '';
					
					let selectorWrapperStyle = "";
					if(isNotNull(product.viewOptionObj[kind].styleAttr)){
						selectorWrapperStyle = product.viewOptionObj[kind].styleAttr;
					}
					
					let colorNameText = '';
					for(let option in optionObj){
						currentOption = optionObj[option];
						let modelIdxList = currentOption.modelIdx.split(',');
						if(currentOption.modelIdx !== null && arrayContains(modelIdxList, String(product.frontModelIdx))){
							colorNameText = currentOption.optionLocalName;
						}
					}
					
					if(kind === "COLOR"){
						productCardTemplate +=
							'<div class="option-selector__color-name">'+Granite.I18n.get("Color")+' : <span class="color-name-text">'+colorNameText+'</span></div>'+
							'<div class="option-selector__wrap option-selector__wrap--color-chip unbind-option" data-desktop-view="5" data-mobile-view="2">'+
								'<div class="option-selector__swiper">'+
									'<div class="option-selector__swiper-container">'+
										'<div class="option-selector__swiper-wrapper" role="list" style="'+selectorWrapperStyle+'">';
						let curSelecteModelIdx = '';
						for(let option in optionObj){
							/* 선택되어있는(대표모델) 옵션 flag값 셋팅 */
							currentOption = optionObj[option];
							
							isSelected = false;
							let modelIdxList = currentOption.modelIdx.split(',');
							
							if(currentOption.modelIdx !== null && arrayContains(modelIdxList, String(product.frontModelIdx))){
								isSelected = true;
								curSelecteModelIdx = currentOption.modelIdx;
								disabledClass = '';
							} else {
								disabledClass = ' is-disabled';
								if(viewOptionIdx === 0){
									disabledClass = '';
								} else {
									let parentModelIdxList = parentOptionModelIdx.split(',');
									for(let mli in modelIdxList){
										//상위 선택된 옵션칩 의 model idx 에 일치하는 model idx 가 있는 경우 활성화
										if(arrayContains(parentModelIdxList, modelIdxList[mli])){
											disabledClass = '';
											break;
										}
									}
								}
							}
							
							// 각 옵션칩의 model 정보 셋팅 ( 태깅 )
							let modelCodeAttrForTagging = '';
							let modelNameAttrForTagging = '';
							let modelIdx;
							if(disabledClass === ''){
								let curSelectOptionMoIdx = currentOption.modelIdx;
								let otherSelectedOptionMoIdxList = [];
								let isColorType = true;
								for(let ooi in curViewOptionObj){
									if(ooi !== kind){
										let tmp_optionList = curViewOptionObj[ooi].optionList;
										for(let toi in tmp_optionList){
											let tmp_option = tmp_optionList[toi];
											let tmp_optionMoIdx = tmp_option.modelIdx;
											let tmp_optionMoIdxArr = tmp_optionMoIdx.split(',');
											
											// 현재 선택되어있는 option 색출
											if(tmp_optionMoIdxArr.indexOf(String(product.frontModelIdx))>-1){
												otherSelectedOptionMoIdxList.push(tmp_optionMoIdx);
											}
										}
									}
								}
								
								modelIdx = getSelectedModelIdx(curViewOptionObj, curSelectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, curOptionTypeList);
								if(product.modelList.length > modelIdx && isNotNull(product.modelList[modelIdx])){
									modelCodeAttrForTagging = ' data-modelcode="'+product.modelList[modelIdx].modelCode+'"';
									modelNameAttrForTagging = ' data-modelname="'+product.modelList[modelIdx].modelName+'"';
								}
							}
							
							chipId = 'compare-'+optionDataType+'-'+option+'-'+frontModel.modelCode;
							let chipName = 'compare-'+optionDataType+'-'+frontModel.modelCode;
							productCardTemplate +=
											'<span class="option-selector__swiper-slide'+disabledClass+'" role="listitem">'+
												'<span class="option-selector__color js-compare-option-fmychip">'+
													'<input type="radio" id="'+chipId+'" data-optionName="'+currentOption.optionLocalName+'" name="'+chipName+'" data-modeli="'+modelIdx+'"'+
														' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-option" an-ca="option click" an-ac="compare pop-up" an-la="'+kind.toLowerCase()+':'+currentOption.optionName.toLowerCase()+'"'+
														modelCodeAttrForTagging+modelNameAttrForTagging+
														' data-typeidx="'+viewOptionIdx+'" data-code="'+currentOption.optionCode+'"'+(isSelected?' checked':'')+(disabledClass!==''?' disabled':'')+'>'+
													'<label for="'+chipId+'">'+
														getColorOptionHtml(currentOption, isSelected)+
													'</label>'+
												'</span>'+
											'</span>';
						}
						parentOptionModelIdx = curSelecteModelIdx;
						productCardTemplate +=
										'</div>'+//option-selector__swiper-wrapper
									'</div>'+//option-selector__swiper-container
									'<button type="button" class="option-selector__button-prev" aria-label="'+Granite.I18n.get("Previous")+'" role="button" aria-disabled="true"'+
									' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-arrow" an-ca="indication" an-ac="carousel" an-la="carousel:arrow:left">'+
										'<span class="hidden">'+Granite.I18n.get("Previous")+'</span>'+
										'<svg class="icon" focusable="false" aria-hidden="true">'+
											'<use xlink:href="#previous-regular" href="#previous-regular"></use>'+
										'</svg>'+
									'</button>'+
									'<button type="button" class="option-selector__button-next" aria-label="'+Granite.I18n.get("Next")+'" role="button" aria-disabled="true"'+
									' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-arrow" an-ca="indication" an-ac="carousel" an-la="carousel:arrow:right">'+
										'<span class="hidden">'+Granite.I18n.get("Next")+'</span>'+
										'<svg class="icon" focusable="false" aria-hidden="true">'+
											'<use xlink:href="#next-regular" href="#next-regular"></use>'+
										'</svg>'+
									'</button>'+
								'</div>'+//option-selector__swiper
							'</div>';//option-selector__wrap
					} else {
						if(kind === "TV SIZE"){
							productCardTemplate +=
							'<div class="option-selector__wrap option-selector__wrap--capacity unbind-option" data-desktop-view="4" data-mobile-view="1">';
						}else{
							productCardTemplate +=
							'<div class="option-selector__wrap option-selector__wrap--capacity unbind-option" data-desktop-view="3" data-mobile-view="1">';
						}
						
							productCardTemplate +=
								'<div class="option-selector__swiper">'+
									'<div class="option-selector__swiper-container">'+
										'<div class="option-selector__swiper-wrapper" role="list" style="'+selectorWrapperStyle+'">';
						let curSelecteModelIdx = '';
						for(let oi=0; oi < optionObj.length; oi++){
							/* 선택되어있는(대표모델) 옵션 flag값 셋팅 */
							
							currentOption = optionObj[oi];
							
							isSelected = false;
							let modelIdxList = currentOption.modelIdx.split(',');
							
							if(currentOption.modelIdx !== null && arrayContains(modelIdxList, String(product.frontModelIdx))){
								isSelected = true;
								curSelecteModelIdx = currentOption.modelIdx;
								disabledClass = '';
							} else {
								disabledClass = ' is-disabled';
								if(viewOptionIdx === 0){
									disabledClass = '';
								} else {
									let parentModelIdxList = parentOptionModelIdx.split(',');
									
									for(let mli in modelIdxList){
										//상위 선택된 옵션칩 의 model idx 에 일치하는 model idx 가 있는 경우 활성화
										if(arrayContains(parentModelIdxList, modelIdxList[mli])){
											disabledClass = '';
											break;
										}
									}
								}
							}
							
							// 각 옵션칩의 model 정보 셋팅 ( 태깅 )
							let modelCodeAttrForTagging = '';
							let modelNameAttrForTagging = '';
							
							let modelIdx;
							
							if(disabledClass === ''){
								let curSelectOptionMoIdx = currentOption.modelIdx;
								let otherSelectedOptionMoIdxList = [];
								let isColorType = false;
								
								for(let ooi in curViewOptionObj){
									if(ooi !== kind){
										let tmp_optionList = curViewOptionObj[ooi].optionList;
										for(let toi in tmp_optionList){
											let tmp_option = tmp_optionList[toi];
											let tmp_optionMoIdx = tmp_option.modelIdx;
											let tmp_optionMoIdxArr = tmp_optionMoIdx.split(',');
											
											// 현재 선택되어있는 option 색출
											if(tmp_optionMoIdxArr.indexOf(String(product.frontModelIdx))>-1){
												otherSelectedOptionMoIdxList.push(tmp_optionMoIdx);
											}
										}
										
									}
								}
								
								modelIdx = getSelectedModelIdx(curViewOptionObj, curSelectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, curOptionTypeList);
								
								if(product.modelList.length > modelIdx && isNotNull(product.modelList[modelIdx])){
									modelCodeAttrForTagging = ' data-modelcode="'+product.modelList[modelIdx].modelCode+'"';
									modelNameAttrForTagging = ' data-modelname="'+product.modelList[modelIdx].modelName+'"';
								}
							}
							
							chipId = 'compare-'+optionDataType+'-'+oi+'-'+frontModel.modelCode;
							let chipName = 'compare-'+optionDataType+'-'+frontModel.modelCode;
							productCardTemplate +=
											'<span class="option-selector__swiper-slide'+disabledClass+'" role="listitem">'+
												'<span class="option-selector__size js-compare-option-fmychip">'+
													'<input type="radio" id="'+chipId+'" data-optionName="'+currentOption.optionLocalName+'" name="'+chipName+'" data-modeli="'+modelIdx+'"'+
														' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-option" an-ca="option click" an-ac="compare pop-up" an-la="'+kind.toLowerCase()+':'+currentOption.optionName.toLowerCase()+'"'+
														modelCodeAttrForTagging+modelNameAttrForTagging+
														' data-typeidx="'+viewOptionIdx+'" data-code="'+currentOption.optionCode+'"'+(isSelected?' checked':'')+(disabledClass!==''?' disabled':'')+'>'+
													'<label class="option-selector__size-label" for="'+chipId+'">'+
														'<span class="option-selector__size-label-text">'+currentOption.optionLocalName+'<span>'+
													'</label>'+
												'</span>'+
											'</span>';
						}
						parentOptionModelIdx = curSelecteModelIdx;
						productCardTemplate +=
											'<div class="option-selector__floating-bar" style="display: none;"></div>'+
										'</div>'+//option-selector__swiper-wrapper
									'</div>'+//option-selector__swiprer-container
									'<button type="button" class="option-selector__button-prev" aria-label="'+Granite.I18n.get("Previous")+'" role="button" aria-disabled="true"'+
									' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-arrow" an-ca="indication" an-ac="carousel" an-la="carousel:arrow:left">'+
										'<span class="hidden">'+Granite.I18n.get("Previous")+'</span>'+
										'<svg class="icon" focusable="false" aria-hidden="true">'+
											'<use xlink:href="#previous-regular" href="#previous-regular"></use>'+
										'</svg>'+
									'</button>'+
									'<button type="button" class="option-selector__button-next" aria-label="'+Granite.I18n.get("Next")+'" role="button" aria-disabled="true"'+
									' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-arrow" an-ca="indication" an-ac="carousel" an-la="carousel:arrow:right">'+
										'<span class="hidden">'+Granite.I18n.get("Next")+'</span>'+
										'<svg class="icon" focusable="false" aria-hidden="true">'+
											'<use xlink:href="#next-regular" href="#next-regular"></use>'+
										'</svg>'+
									'</button>'+
								'</div>'+//option-selector__swipe
							'</div>';//option-selector__wrap
					}
					
					viewOptionIdx++;
				}
				
				// 옵션침 데이터 없을 경우 빈영역 추가
				if(Object.keys(product.viewOptionObj).length === 1){
					if(Object.keys(product.viewOptionObj)[0] === "COLOR"){
						productCardTemplate +=
							'<div class="option-selector__wrap option-selector__wrap--capacity unbind-option is-option-empty">'+
								'<div class="option-selector__swiper">'+
									'<div class="option-selector__swiper-container">'+
										'<div class="option-selector__swiper-wrapper" role="list"></div>'+
									'</div>'+
								'</div>'+
							'</div>';
					}
				}
			}else{
				productCardTemplate +=
							'<div class="option-selector__wrap option-selector__wrap--color-chip unbind-option is-option-empty">'+
								'<div class="option-selector__swiper">'+
									'<div class="option-selector__swiper-container">'+
										'<div class="option-selector__swiper-wrapper" role="list"></div>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'<div class="option-selector__wrap option-selector__wrap--capacity unbind-option is-option-empty">'+
								'<div class="option-selector__swiper">'+
									'<div class="option-selector__swiper-container">'+
										'<div class="option-selector__swiper-wrapper" role="list"></div>'+
									'</div>'+
								'</div>'+
							'</div>';
			}
			productCardTemplate +=
					'</div>';//option-selector
		}
		
		return productCardTemplate;
	};
	
	function clProductCardFicheBuild(frontModel){
		let displayName = "";
		if(isNotNull(frontModel.displayName)){
			displayName = escapeHtml(frontModel.displayName.replace(/<br>/ig," ").replace(/<sup>/ig," "));
		}
		
		/* product fiche가 없는 경우 div 영역은 유지하고 내용은 삭제 필요(모든 상품에 product fiche가 없는 경우 div 영역도 삭제) */
		let productCardTemplate = "";
		productCardTemplate +=
			'<div class="compare-popup__fiche">'+
				'<div class="compare-popup__fiche-cta-wrap">';
		if(isNotNull(frontModel.energyLabelGrade) && frontModel.newEnergyLabel != "Y"){ // 기존 에너지라벨
			if(isNotNull(frontModel.ficheFileUrl)){
				productCardTemplate +=
					'<a href="'+frontModel.ficheFileUrl+'" target="_blank" aria-label="'+ Granite.I18n.get("Product Fiche")+": "+displayName+" "+Granite.I18n.get("Open in a new window")+'" class="cta-text"'+
					' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-product fiche" an-ca="option click" an-ac="compare pop-up" an-la="product fiche">'+
						Granite.I18n.get("Product Fiche")+
					'</a>';
			}
			productCardTemplate +=
					'<a class="badge '+frontModel.energyLabelClass2+'" href="'+frontModel.energyFileUrl+'" target="_blank" aria-label="'+ frontModel.energyLabelGrade+", energy level: "+displayName+" "+Granite.I18n.get("Open in a new window")+'"'+
					' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-product fiche" an-ca="option click" an-ac="compare pop-up" an-la="product fiche">'+	
						'<span class="badge__grade--with-text '+frontModel.energyLabelClass1+'">'+
							'<span class="hidden">'+frontModel.energyLabelGrade+'</span>'+
						'</span>'+
					'</a>';
		}else if(isNotNull(frontModel.energyLabelGrade) && frontModel.newEnergyLabel == "Y"){ // 신 에너지라벨
			productCardTemplate +=
					'<div class="badge-energy-label">';
			if(isNotNull(frontModel.ficheFileUrl)){
				productCardTemplate +=
						'<a href="'+frontModel.ficheFileUrl+'" target="_blank" aria-label="'+ Granite.I18n.get("PRODUCT INFORMATION SHEET")+": "+displayName+" "+Granite.I18n.get("Open in a new window")+'" class="badge-energy-label__text"'+
						' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-product fiche" an-ca="option click" an-ac="compare pop-up" an-la="product fiche">'+
							Granite.I18n.get("PRODUCT INFORMATION SHEET")+
						'</a>';
			}
			productCardTemplate +=
						'<a class="badge-energy-label__badge '+frontModel.energyLabelClass1+'" href="'+frontModel.energyFileUrl+'" target="_blank" aria-label="'+ frontModel.energyLabelGrade+", energy level: "+displayName+" "+Granite.I18n.get("Open in a new window")+'"'+
						' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-product fiche" an-ca="option click" an-ac="compare pop-up" an-la="product fiche">'+	
							frontModel.energyLabelGrade+
						'</a>'+
					'</div>';
		}
		productCardTemplate +=
				'</div>';	// cta-wrap end
		if(clSiteCode == "fr" || siteCode == "test"){
			if(isNotNull(frontModel.repairabilityIndex)){
				let repairabilityIndex = frontModel.repairabilityIndex;
				let repairabilityAlt = Granite.I18n.get("Repairability Index : {0} / 10", [repairabilityIndex] );
				let repairabilitySrc = "";
				if(repairabilityIndex.length == 1){
					repairabilitySrc = repairabilityIndex + '0';
				}else{
					repairabilitySrc = repairabilityIndex.replace(".","");
				}
				let reparabiliteUrl = 'https://www.samsung.com/fr/indice-reparabilite/';
                if(isNotNull(frontModel.repairabilityIndexPdfUrl)){
                    reparabiliteUrl = frontModel.repairabilityIndexPdfUrl; 
                }
                
                let tempArr = reparabiliteUrl.split("/");
                let reparabiliteFileName = tempArr[tempArr.length-1];
                
				productCardTemplate +=
					'<span class="badge-repairability">'+
						'<a href="'+ reparabiliteUrl +'" an-tr="pdd13_compare pop up-'+clPageTrack+'-repairability index-option_click4" an-ca="option click" an-ac="compare pop-up" an-la="repairabililty index:'+ reparabiliteFileName +'">' +
							'<img class="badge-repairability__image" src="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/badge-repairability-'+repairabilitySrc+'.jpg" alt="'+repairabilityAlt+'">'+
						'</a>'+
					'</span>';
			}
		}
		productCardTemplate +=
			'</div>';
		return productCardTemplate;
	}
	
	/**
	 * Product Data를 이용하여 Product Card 영역 구성
	 * 
	 * @param product
	 */
	function buildProductCard(product) {
		let model = product.modelList[product.frontModelIdx];
		
		if(product.iaCtaDisplay === 'Y'){
			isButtonShow = true;
		}else if(product.iaCtaDisplay === 'N'){
			isButtonShow = false;
		}

		let upperStock = "";
		if(isNotNull(model.ctaType)){
			upperStock = model.ctaType.toUpperCase();
			model.ctaTypeUpperCase = upperStock;
		}
		
		let productCardTemplate = "";
			/* product card :: S */
			productCardTemplate +=
			'<div class="compare-popup__product-menu">'+
				'<h4 class="compare-popup__product-title">' + model.displayName + '</h4>'+
			'</div>'+
			'<div class="compare-popup__product-card">'+
				/* product code 영역 :: S */
				'<div class="compare-popup__sku" data-modelcode="' + model.modelCode + '">'+
					'<p class="compare-popup__sku-text">' + model.modelCode + '</p>'+
				'</div>'+
				/* product code 영역 :: E */
				
				/* product image 영역 :: S */
				'<div class="compare-popup__product-image">'+
					'<div class="image">'+
						'<img class="image__preview lazy-load responsive-img"'+
							'data-desktop-src="' + clImgDomain(model.thumbUrl, "lazy") + '"'+
							'data-mobile-src="' + clImgDomain(model.thumbUrl, "lazy") + '"'+
							'alt="">'+ //' + model.thumbUrlAlt + '
						'<img class="image__main lazy-load responsive-img"'+
							'data-desktop-src="' + clImgDomain(model.thumbUrl, "desktop") + '"'+
							'data-mobile-src="' + clImgDomain(model.thumbUrl, "mobile") + '"'+
							'alt="">'+ //' + model.thumbUrlAlt + '
					'</div>'+
				'</div>';
				/* product image 영역 :: E */
				
				/* Option Selector Component 영역 :: S */
				productCardTemplate += clProductCardFmyOptionBuild(product);
				/* Option Selector Component 영역 :: E */
				
				/* review 영역 :: S */
				let reviewRedirect = '/'+clSiteCode+"/common/review/"+model.modelCode+'/';
				if(model.reviewUrl !== ""){
					reviewRedirect = model.reviewUrl;
				}
				
				var siteCode = $("#siteCode").val();
				if((clReviewUseYN === "Y" || clReevooUseYN === "Y") &&isNotNull(model.ratingHtml) && siteCode !== "cn" /* && !(clSiteCode === "br" && productGroupCode === GROUPCODE_IM) */){
					let ratingEmptyCls = "";
					let taggingLa = "read review";
					if(model.ratings === 0){
						ratingEmptyCls = " rating--empty";
						taggingLa = "write review";
					}
					productCardTemplate +=
					'<div class="compare-popup__rating">'+
						'<a href="'+reviewRedirect+'" data-modelcode="'+model.modelCode+'" data-modelname="'+model.modelName+'"'+
							' an-tr="pdd13_compare pop up-' + clPageTrack + '-image-link" an-ca="review" an-ac="compare pop-up" an-la="' + taggingLa + '">'+
							'<span class="rating'+ratingEmptyCls+'">'+
								'<span class="hidden">' + Granite.I18n.get("Rating") + '</span>'+
								'<span class="rating__inner">'+
									'<span class="rating__star-list">' + model.ratingHtml + '</span>'+
									'<strong class="rating__point"><span class="hidden">' + Granite.I18n.get("Product Ratings") + ' : </span><span>' + model.ratings + '</span></strong>'+
									'<em class="rating__review-count">(<span class="hidden">' + Granite.I18n.get("Number of Ratings") + ' :</span><span>' + model.reviewCount + '</span>)</em>'+
								'</span>'+
							'</span>'+
						'</a>'+
					'</div>';
				}
				/* review 영역 :: E */
				
				/* fiche 영역 :: S */
				productCardTemplate += clProductCardFicheBuild(model);
				/* fiche 영역 :: E */
			
				/* product 가격 영역 :: S */
				productCardTemplate +=
					buildPriceArea(product, upperStock);
				/* product 가격 영역 :: E */
				//new-hybris
				if(clIsGPv2 || isNewHybris || isB2bhybris){
					let shopSkuCode = "";
					if(isNotNull(model.shopSKU)){
						shopSkuCode = model.shopSKU;
					}else{
						shopSkuCode = model.modelCode;
					}
					product.modelList[product.frontModelIdx].shopSkuCode = shopSkuCode;
				}
				
				/* CTA 버튼 영역 :: S */
				if(isButtonShow){
					productCardTemplate += productCardCTABuild(product);
				}
				/* CTA 버튼 영역 :: E */
		productCardTemplate +=
			'</div>';
			/* product card :: E */
			
		return productCardTemplate;
	}
	
	/**
	 * [2020.12.10] 
	 * Product Card CTA ( global, Hybris, Gpv2 통합 ) 
	 * 
	 * @param product
	 */
	function productCardCTABuild(product){
		let frontModel = product.modelList[product.frontModelIdx];
		
		let displayName = "";
		if(isNotNull(frontModel.displayName)){
			displayName = escapeHtml(frontModel.displayName.replace(/<br>/ig," ").replace(/<sup>/ig," "));
		}

		// pre order, buy now, add to cart 에 사용
		let dataModelCodeAttr = 
			' data-modelcode="'+frontModel.modelCode+'"';
		let dataModelNameAttr = 
			' data-modelname="'+frontModel.modelName+'"';
		let dataShopSkuAttr = 
			' data-sku-code="'+frontModel.shopSkuCode+'"';
		let dataGetStockAttr = '';	//cn getStockAlert/ComingSoon 구분
		if(siteCode == "cn") dataGetStockAttr = ' data-gs-flag="GetStock"';	
		
		let dataEppVirtualModelCodeAttr = "";
		if((eppIsFlash || eppIsRefurbish) && isNotNull(frontModel.virtualModelCode)){
			dataEppVirtualModelCodeAttr=
			' data-virtual-modelcode="'+frontModel.virtualModelCode+'"';
		}
			
		let taggingAttrForBuy = 
			' data-pimsubtype="'+(isNotNull(product.categorySubTypeEngName) ? product.categorySubTypeEngName.toLowerCase():'')+'"'+
			' data-pvitype="'+(isNotNull(frontModel.pviTypeName) ? frontModel.pviTypeName.toLowerCase():'')+'"'+
			' data-pvisubtype="'+(isNotNull(frontModel.pviSubtypeName) ? frontModel.pviSubtypeName.toLowerCase():'')+'"'+
			' data-modelrevenue="'+originPrice+'"'+
			' data-modelprice="'+originPrice+'"'+
			' data-modelqty="1"'+
			' data-modelcurrency="'+clPriceCurrency+'"'+
			dataModelCodeAttr + 
			dataModelNameAttr +
			' data-modeldisplay="'+displayName+'"';
		if(isNotNull(discountPrice)){
			taggingAttrForBuy+=
			' data-discountprice="'+discountPrice+'"';
		}
		
		let useConfiguratorUrl = false;
		let configUrl = "";
		if(isNotNull(frontModel.configuratorUrl)){
			useConfiguratorUrl = true;
			configUrl = frontModel.configuratorUrl;
		}
		
		if(eppIsFlash || eppIsRefurbish){
			useConfiguratorUrl = false;
		}
		
		/*
			US > buyingConfigLinkType 이 pf 일 때만 buyingConfigLink 사용
			B2B 미사용
		*/
		if(clSiteCode === "us" && !isB2b){
			if(frontModel.buyingConfigLinkType === 'pf'){
				useConfiguratorUrl = true;
				configUrl = frontModel.buyingConfigLink;
			}
		}
		
		let ctaTypeUpperCase = frontModel.ctaTypeUpperCase;
		
		let isSimplePD = product.simplePdYN === "Y" ? true : false;
		let buyingPDUrl = frontModel.originPdpUrl;
		if(isSimplePD){
			if(isEppSite){
				if(frontModel.originPdpUrl != null){
					buyingPDUrl = frontModel.originPdpUrl.replace("feature.", "buy.");
				}
			} else {
				buyingPDUrl = frontModel.originPdpUrl + "buy/";
			}
		}
		
		let isSTDPD = false;
		if(!isSimplePD && frontModel.marketingpdpYN === "N"){
			isSTDPD = true;
		}
		//new-hybris
		if(clIsGPv2 || isNewHybris || isB2bhybris){
			/* GPv2 standard pd 이동시 benefits 포커스 이동 :: 확인 필요함 */
			let learnmoreUrl = frontModel.pdpUrl;
			if(isSTDPD && clPdurlAnchorCheckYn === "Y"){
				learnmoreUrl += "#benefits";
			}
			frontModel.pdpUrl = learnmoreUrl;
		}
		
		let priceDisplayNull = false; 
		if(fnIsNull(originPrice)){
			priceDisplayNull = true;
		}

		let cartUrlLink = clStoreDomain + clCartUrl;
		
		if(clCartUrl.indexOf("http://") > -1 || clCartUrl.indexOf("https://") > -1){
			cartUrlLink = clCartUrl;
		}
		
		// COMP6FE-1619 [EPP] SIEL Offline 뱃지 추가건
		let buyNowCta = Granite.I18n.get("Buy now");
		if(isEppSite){
			cartUrlLink = (isNewHybris?storeWebDomain:clStoreDomain) + "/" +eppCompanyCode + "/cart";
			if(clIsGPv2){
				cartUrlLink = clCartUrl;
			}
			if ( window.sg.epp && window.sg.epp.common && ( window.sg.epp.common.ecomStoreType === "offline" || window.sg.epp.common.ecomStoreType === "offline_reverse_o2o" ) ){
				buyNowCta = Granite.I18n.get("Buy Online");
			}
		}

		let tempProductCardTemplate =
		'<div class="compare-popup__cta-area">';
			
			if(!priceDisplayNull){
				if(clSiteCode === "us" && ctaTypeUpperCase !== "PREORDER" && 
					(ctaTypeUpperCase === "WHERETOBUY" || ctaTypeUpperCase === "BACKORDER" || ctaTypeUpperCase === "BACKORDERED" || ctaTypeUpperCase === "INSTOCK" || ctaTypeUpperCase === "OUTOFSTOCK" || ctaTypeUpperCase === "LOWSTOCK")){
					// US 사이트  Buy Now CTA 표시 (PreOrder CTA 제외) 
					if(useConfiguratorUrl){
						tempProductCardTemplate +=
							'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+buyNowCta+' : '+displayName+'" href="javascript:;" data-link_info="" data-config_info="'+configUrl+'"'+taggingAttrForBuy+
							' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-button" an-ca="buy cta" an-ac="buy now" an-la="compare pop-up:buy now">' + buyNowCta + '</a>';
					} else {
						tempProductCardTemplate +=
							'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+buyNowCta+' : '+displayName+'" href="'+buyingPDUrl+'" data-link_info="'+buyingPDUrl+'" data-config_info=""'+taggingAttrForBuy+
							' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-button" an-ca="buy cta" an-ac="buy now" an-la="compare pop-up:buy now">' + buyNowCta + '</a>';
					}
				} else if(!isNonShop){
					if(siteCode == "cn" && frontModel.isComingSoon  && frontModel.isComingSoon == "true"){	//SCIC hybris
						dataGetStockAttr = ' data-gs-flag="ComingSoon"';	//cn getStockAlert/ComingSoon 구분
						
						tempProductCardTemplate +=
							'<button class="cta cta--contained cta--black cta--2line-mo cta--dense js-cta-stock" type="button" aria-label="'+Granite.I18n.get("Get stock alert")+' : '+displayName+'"'+dataGetStockAttr +dataModelCodeAttr + dataModelNameAttr+dataEppVirtualModelCodeAttr+
							' an-tr="pdd13_compare pop up-' + clPageTrack + '-button-stock" an-ca="buy cta" an-ac="stock alert" an-la="compare pop-up:stock alert"'+
							' data-antr="pdd13_compare pop up-' + clPageTrack + '-popup-stock">' + Granite.I18n.get("Get stock alert") + '</button>';
						
					}else{
					
						if(ctaTypeUpperCase === "WHERETOBUY" || ctaTypeUpperCase === "BACKORDER" || ctaTypeUpperCase === "BACKORDERED" || ctaTypeUpperCase === "INSTOCK" || ctaTypeUpperCase === "LOWSTOCK"){
							if(useConfiguratorUrl){
								let ctaLocalTemp = isNotNull(frontModel.ctaLocalText) ? frontModel.ctaLocalText : buyNowCta;
								tempProductCardTemplate +=
									'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+ctaLocalTemp+' : '+displayName+'" href="javascript:;" data-link_info="" data-config_info="'+configUrl+'"'+taggingAttrForBuy+
									' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-button" an-ca="buy cta" an-ac="buy now" an-la="compare pop-up:buy now">' + ctaLocalTemp + '</a>';
							}else{
								if(isSTDPD){
									tempProductCardTemplate +=
										'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+Granite.I18n.get("Add to cart")+' : '+displayName+'" href="javascript:;" data-cart="true" ' + dataShopSkuAttr + ' data-link_info="' + cartUrlLink + '" data-config_info=""'+taggingAttrForBuy+
										' an-tr="pdd13_compare pop up-' + clPageTrack + '-cta-cart page" an-ca="ecommerce" an-ac="addToCart" an-la="compare pop-up:add to cart">' + Granite.I18n.get("Add to cart") + '</a>';
								}else{
									tempProductCardTemplate +=
										'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+buyNowCta+' : '+displayName+'" href="'+buyingPDUrl+'" data-link_info="'+buyingPDUrl+'" data-config_info=""'+taggingAttrForBuy+
										' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-button" an-ca="buy cta" an-ac="buy now" an-la="compare pop-up:buy now">' + buyNowCta + '</a>';
								}
							}
						} else if (ctaTypeUpperCase === "PREORDER"){
							if(useConfiguratorUrl){
								let ctaLocalTemp = isNotNull(frontModel.ctaLocalText) ? frontModel.ctaLocalText : Granite.I18n.get("pre order");
								tempProductCardTemplate +=
									'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+ctaLocalTemp+' : '+displayName+'" href="javascript:;" data-link_info="" data-config_info="'+configUrl+'"'+taggingAttrForBuy+
									' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-button" an-ca="buy cta" an-ac="pre-order" an-la="compare pop-up:pre order">' + ctaLocalTemp + '</a>';
							} else {
								if(isSTDPD){
									tempProductCardTemplate +=
										'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+Granite.I18n.get("pre order")+' : '+displayName+'" href="javascript:;" data-cart="true" ' + dataShopSkuAttr + ' data-link_info="' + cartUrlLink + '" data-config_info=""'+taggingAttrForBuy+
										' an-tr="pdd13_compare pop up-' + clPageTrack + '-cta-cart page" an-ca="ecommerce" an-ac="addToCart" an-la="compare pop-up:pre order">' + Granite.I18n.get("pre order") + '</a>';
								} else {
									tempProductCardTemplate +=
										'<a class="cta cta--contained cta--black cta--2line-mo cta--dense cl-buy-now" aria-label="'+Granite.I18n.get("pre order")+' : '+displayName+'" href="'+buyingPDUrl+'" data-link_info="' + buyingPDUrl + '" data-config_info=""'+taggingAttrForBuy+
										' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-button" an-ca="buy cta" an-ac="pre-order" an-la="compare pop-up:pre order">' + Granite.I18n.get("pre order") + '</a>';
								}
							}
						} else if (ctaTypeUpperCase === "OUTOFSTOCK"){
							tempProductCardTemplate +=
								'<button class="cta cta--contained cta--black cta--2line-mo cta--dense js-cta-stock" type="button" aria-label="'+Granite.I18n.get("Get stock alert")+' : '+displayName+'"'+dataGetStockAttr +dataModelCodeAttr + dataModelNameAttr+dataEppVirtualModelCodeAttr+
								' an-tr="pdd13_compare pop up-' + clPageTrack + '-button-stock" an-ca="buy cta" an-ac="stock alert" an-la="compare pop-up:stock alert"'+
								' data-antr="pdd13_compare pop up-' + clPageTrack + '-popup-stock">' + Granite.I18n.get("Get stock alert") + '</button>';
						}
					}
				}
			}
			// learn more
			tempProductCardTemplate +=
				'<div class="compare-popup__cta-learn-more">'+
					'<a class="cta cta--underline cta--black" aria-label="'+Granite.I18n.get("Learn more")+' : '+displayName+'" href="'+frontModel.pdpUrl+'"'+taggingAttrForBuy+
					' an-tr="pdd13_compare pop up-' + clPageTrack + '-text-view more" an-ca="product click" an-ac="compare pop-up" an-la="learn more click">'+ Granite.I18n.get("Learn more") + '</a>'+
				'</div>';
			
		tempProductCardTemplate +=
		'</div>';
		
		return tempProductCardTemplate;
	};
	
	function getProductInfo(product, eppProduct){
		let tempProduct = product;
		let isEppProduct = false;
		
		if(isNotNull(eppProduct.modelList) && eppProduct.modelList.length > 0){
			isEppProduct = true;
		}
		
		/*
		 * viewOptionObj : 전체 옵션칩 리스트 
		 * optionTypeList : 옵션 타입만 담고 있는 리스트 ( 옵션타입의 index 값을 구하기 위해 생성함 )
		 */
		
		let tmpOptionListInModel = {};
		for(let mi in tempProduct.modelList){
			let tmpModel = tempProduct.modelList[mi];
			let tmpFmyChipList = tmpModel.fmyChipList;
			
			if(isEppProduct){
				// epp discount 셋팅
				if(tmpModel.modelCode  === eppProduct.modelList[mi].modelCode){
					tmpModel.prdPriceInf = eppProduct.modelList[mi].prdPriceInf;
					tmpModel.prdSavePriceInf = eppProduct.modelList[mi].prdSavePriceInf;
					tmpModel.prdSavePriceTI = eppProduct.modelList[mi].prdSavePriceTI;
					tmpModel.tradeDiscountPrice = eppProduct.modelList[mi].tradeDiscountPrice;
				}
			}
			
			for(let fci in tmpFmyChipList){
				//fmyChipCode에 " 제거 
				let thisOptionKey = tmpFmyChipList[fci].fmyChipType + '+'+
									tmpFmyChipList[fci].fmyChipCode.replace("\"", "").replace("&quot;", "")+'+'+
									tmpFmyChipList[fci].fmyChipLocalName.replace("\"", "").replace("&quot;", "");
				
				if(tmpOptionListInModel[thisOptionKey] === undefined){
					tmpOptionListInModel[thisOptionKey] = mi;
				} else {
					tmpOptionListInModel[thisOptionKey] += ","+mi;
				}
			}
			// SEF, SEBN, SEDA(rs, al, mk, ba은 스토어국가아니므로 패스), SENA, SEPOL, SEH (우선 pl만 반영)
			// 기존 price(원가, msrp price 포함)가 이미 노출되는 경우에 이를 lowestWasPrice 가 노출되도록 변경하는 작업
			// [EPP] epp meta 체크 추가
			// lowestwasprice 가 price 보다 낮거나 같고, promotion price보다 높을 때만 적용
			tmpModel['lowestWasPriceUseYn'] = "N";
			if(((
				 (isStrikethroughRmSite || siteCode === "ro" )
				 && !isEppSite) || (isEppSite && eppOmniPricingUseYn == "Y"))
			&& isNotNull(tmpModel.lowestWasPrice)
			&& isNotNull(tmpModel.promotionPrice)
			&& (parseFloat(tmpModel.lowestWasPrice) <= parseFloat(tmpModel.price) && parseFloat(tmpModel.promotionPrice) < parseFloat(tmpModel.lowestWasPrice))
			){
				console.log("modelCode [{}] origin price::{}", tmpModel.modelCode, tmpModel.price);
				console.log("origin priceDisplay::"+tmpModel.priceDisplay);
				console.log("origin saveText::"+tmpModel.saveText);
				tmpModel.price = tmpModel.lowestWasPrice;
				tmpModel.priceDisplay = currencyComma(tmpModel.lowestWasPrice, clPriceCurrency);
				/*
				if(siteCode === "hr"){
					tmpModel.priceDisplay = currencyComma(tmpModel.lowestWasPrice, clPriceCurrency)+" ("+euroToKunaPrice(tmpModel.lowestWasPrice)+")";
				}
				*/
				if(isNotNull(tmpModel.msrpPrice)){
					tmpModel.msrpPrice = tmpModel.lowestWasPrice;
					console.log("after msrpPrice::"+tmpModel.msrpPrice);
				}
				tmpModel.saveText = parseFloat(tmpModel.lowestWasPrice) - parseFloat(tmpModel.promotionPrice);
				tmpModel.lowestWasPriceUseYn = "Y";
				console.log("after price::"+tmpModel.price);
				console.log("after priceDisplay::"+tmpModel.priceDisplay);
				console.log("after saveText::"+tmpModel.saveText);
			}
			
		}
		
		let optionTypeList = [];
		let viewOptionObj = {};
		if(isNotNull(tempProduct.chipOptions)){
			for(let a=0; a<tempProduct.chipOptions.length; a++){
				let optionData = tempProduct.chipOptions[a];
				let optionTypeTmp = optionData.fmyChipType;

				let optionListInType = optionData.optionList;
				for(let opl in optionListInType){
					let thisOptionKey = optionData.fmyChipType + '+'+
										optionListInType[opl].optionCode.replace("\"", "").replace("&quot;", "")+'+'+
										optionListInType[opl].optionLocalName.replace("\"", "").replace("&quot;", "");
					if(tmpOptionListInModel[thisOptionKey] !== undefined){
						optionListInType[opl].modelIdx = tmpOptionListInModel[thisOptionKey];
					}
					
				}
				viewOptionObj[optionTypeTmp] = {};
				viewOptionObj[optionTypeTmp]['optionList'] = optionListInType;
				
				optionTypeList.push(optionTypeTmp);
			}
		}
		
		tempProduct["viewOptionObj"] = viewOptionObj;
		tempProduct["optionTypeList"] = optionTypeList;
		
		return tempProduct;
	}

	function getProductModelInfo(product, frontModelIdx) {
		let tempProduct = product;
		
		if(isNotNull(frontModelIdx) && isNotNull(tempProduct.modelList) && isNotNull(tempProduct.modelList[frontModelIdx])){
			let tempModel = tempProduct.modelList[frontModelIdx];
			
			/* B2B Search Api Data :: S */
			if(isB2b){
				if(fnIsNull(tempProduct.iaCtaDisplay)){
					// B2B핌에 없는 기능 관련 엘리먼트 정리로 인해 디폴트 값 셋팅
					tempProduct.iaCtaDisplay = "Y";
				}
				let shopInfoObj = {};
				if(isB2bhybris){
					shopInfoObj = tempModel.b2bHybrisShopInfo;
				} else {
					shopInfoObj = tempModel.globalShopInfo;
				}
				for(let si in shopInfoObj){
					tempProduct.modelList[frontModelIdx][si] = shopInfoObj[si];
				}
			}
			/* B2B Search Api Data :: E */
			
			/* Product Name SKU 단위로 조정  :: S */
			if(fnIsNull(tempModel.displayName)){
				tempProduct.modelList[frontModelIdx].displayName = "";
			}
			/* Product Name SKU 단위로 조정  :: E */
			
			/* 별점 정보 & review Count :: S */
			if((clReviewUseYN === "Y" || clReevooUseYN === "Y")){
				let item = "";
				let ratings = tempModel.ratings;
				if(fnIsNull(ratings)){ ratings = 0; tempProduct.modelList[frontModelIdx].ratings = 0; }
				
				// rating 반올림 처리
				let tmpCount = Math.pow(10,1);
				ratings = Math.round(ratings*tmpCount)/tmpCount;
				
				let ratingValue = parseFloat(ratings).toFixed(1),
					fullStarCnt = parseInt(ratings),
					cutStarWidthStyleNum = 0;
					cutStarWidthStyleNum = parseInt((ratingValue - fullStarCnt) * 100);
				
				if(ratingValue !== "0.0"){
					tempProduct.modelList[frontModelIdx].ratings = ratingValue;
				}
				
				for(let j=0; j<fullStarCnt; j++){
					item += '<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 100%;"></span></span>';
				}
				if(fullStarCnt<5 && fullStarCnt>0){
					item += '<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: ' + cutStarWidthStyleNum + '%;"></span></span>';
					for(let k=4; k>fullStarCnt; k--){
						item += '<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>';
					}
				}else if(fullStarCnt === 0 && isNotNull(tempProduct.modelList[frontModelIdx].reviewUrl)){
					for(let empty_idx=0; empty_idx<5; empty_idx++){
						item+='<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>';
					}
				}
				tempProduct.modelList[frontModelIdx].ratingHtml = item;

				if(fnIsNull(tempModel.reviewCount)){
					tempProduct.modelList[frontModelIdx].reviewCount = "0";
				}
				if(fnIsNull(tempModel.reviewUrl)){
					tempProduct.modelList[frontModelIdx].reviewUrl = "";
				}
			}
			/* 별점 정보 & review Count :: E */
			
			/* Energy Label Data :: S */
			if(fnIsNull(tempModel.energyLabelGrade) || tempModel.energyLabelGrade === "N/A"){
				tempProduct.modelList[frontModelIdx].energyLabelGrade = "";
			}
			if(fnIsNull(tempModel.ficheFileUrl)){
				tempProduct.modelList[frontModelIdx].ficheFileUrl = "";
			}
			/* Energy Label Data :: E */
		}
		return tempProduct;
	}
	function toHtml(str){
		str = str.replace(/</g,"");
		str = str.replace(/>/g,"");
		str = str.replace(/\"/g,"");
		str = str.replace(/\'/g,"");
		str = str.replace(/\n/g,"");
		return str;
	}
	function compareSpecsGrid(data){
		$(".compare-popup__detail-spec-disclaimer").empty();	// disclaimer 초기화
		$(".compare-popup__detail-spec-table-body").remove();	// 스팩 영역 초기화
		
		/* ia2lvDesc */
		if(isNotNull(data.ia2lvDesc)){
			$(".compare-popup__detail-spec-disclaimer").html(data.ia2lvDesc);
		}
		let specGridTemplate = "";
		
		groupData = {};
		if(isNotNull(data.compareSpecs) && data.compareSpecs.length > 0){
			for(let si=0; si<data.compareSpecs.length; si++){
				let itemList = data.compareSpecs[si];
				
				if (typeof groupData[itemList.attrKey] === 'undefined') {
					groupData[itemList.attrKey] = new Array();
				}
				groupData[itemList.attrKey].push(itemList);
			}
		}
		
		if(groupData !== null && groupData !== undefined){
			specGridTemplate +=
				'<div class="compare-popup__detail-spec-table-body" role="rowgroup">';
				for (let i in groupData) {
					let items = groupData[i];
					specGridTemplate +=
						`<div class="compare-popup__detail-spec-row" role="row" data-schmattnm="${toHtml(items[0].attrKey)}">`+
							'<strong class="compare-popup__detail-spec-col-title" role="rowheader">' + items[0].attrName + '</strong>'+
							'<div class="compare-popup__detail-spec-col-contents" role="cell"></div>'+
							'<div class="compare-popup__detail-spec-col-contents" role="cell"></div>';
							if(data.modelList.length === 3){
								specGridTemplate +=
									'<div class="compare-popup__detail-spec-col-contents" role="cell"></div>';
							}
					specGridTemplate +=
						'</div>';
				}
			specGridTemplate +=
				'</div>';
		}
		
		if(specGridTemplate !== ""){
			$(".compare-popup__detail-spec-table").append(specGridTemplate);
		}
		
		/* Spec Data Setting : S */
		if(isNotNull(data.modelList) && data.modelList.length > 0){
			for(let sp=0; sp<data.modelList.length; sp++){
				let specModelList = data.modelList[sp];
				if(specModelList.specs.length > 0){
					for(let tn=0; tn<specModelList.specs.length; tn++){
						let specItemTemplate = "";
						let specsItems = specModelList.specs[tn];
						if(specsItems.attrValue === null){
							continue;
						}else{
							specItemTemplate += specsItems.attrValue;
						}
						
						$($(`.compare-popup__detail-spec-row[data-schmattnm='${toHtml(specsItems.attrKey)}']`).find(".compare-popup__detail-spec-col-contents").get(sp)).append(specItemTemplate);
					}
				}
			}
		}
		/* Spec Data Setting : E */
		checkSameSpec();
	}
    /**
     * 3개 제품 비교시 3개중 하나라도 값이 다르면 3개 모두 highligh 
     */
    function checkSameSpec(){
        $(".compare-popup__detail-spec-table-body .compare-popup__detail-spec-row").each(function(){
            let perSpecText;
            let currentSpecText;
            let checkSame = true;
            $(this).find(".compare-popup__detail-spec-col-contents").each(function(){
                currentSpecText = $(this).text();
                currentSpecText = currentSpecText.replace(/&lrm;|\u200E/gi, '');
		
                if(perSpecText == undefined){
                    perSpecText = currentSpecText;
                }else{
                    if(perSpecText !== currentSpecText){
                        checkSame = false;
                        return false;
                    }else{
                        perSpecText = currentSpecText;
                    }
                }
            });
            if(!checkSame){
                $(this).find(".compare-popup__detail-spec-col-contents").each(function(){
                    $(this).html('<mark class="highlight">'+$(this).text()+'</mark>');
                });
            }
        });
	}

	function dataSet(data) {
		let emptyHtml = "";			// Compare Bar 2개 일때 그려주는 영역
		let hiddenHtml = "";		// 웹접근성 화면에 노출안되는 영역
		let cardGridHtml = "";
		let productListIndex = 0;

		let compareModelNameList = ''; // ex) Galaxy S20 5G, Galaxy S20 5G, Galaxy A50
		
		productListData = data.productList;
		
		if(isNotNull(data) && isNotNull(data.productList)){
			hiddenHtml += '<div class="hidden" role="rowheader">' + Granite.I18n.get("Model") + '</div>';
			for(let pr=0; pr<data.productList.length; pr++){
				let tempProduct = data.productList[pr];
				let selectedIdx = 0;	// selected Y값이 여러개 올경우 마지막 모델의 index
				let eppProduct = pfCompareModelList[pr];
				
				if(isNotNull(tempProduct.modelList) && tempProduct.modelList.length > 0){
					/* selected가 Y인 모델의 마지막 index가 변수에 저장됨.*/
					for(let fn=0; fn<tempProduct.modelList.length; fn++){
						let tempModels = tempProduct.modelList[fn];
						
						if(pfCompareModelList[pr].modelCode === tempModels.modelCode){
							selectedIdx = fn;
						}
					}
				}

				tempProduct.frontModelIdx = selectedIdx;
				
				tempProduct = getProductInfo(tempProduct, eppProduct);
				//product까지 가공된 데이터를 productListData 에 저장해줌
				productListData[productListIndex] = tempProduct;
				
				let getCardInfo = getProductModelInfo(tempProduct, selectedIdx);
				cardGridHtml +=
					'<li class="compare-popup__product-item" role="listitem" data-productidx="'+productListIndex+'">'+
						'<h3 class="compare-popup__product-line-title"><span class="compare-popup__product-line-title-text">'+ Granite.I18n.get("Model") +'</span></h3>'+
						buildProductCard(getCardInfo)+
					'</li>';
					
				productListIndex++;
				
				// 웹접근성 화면에 노출안되는 영역
				hiddenHtml += '<div class="hidden" role="columnheader">' + tempProduct.modelList[tempProduct.frontModelIdx].displayName + '</div>';

				if(compareModelNameList  != ''){
					compareModelNameList += ', ';	
				}
				
				let displayName = "";
				if(isNotNull(tempProduct.modelList[tempProduct.frontModelIdx].displayName)){
					displayName = escapeHtml(tempProduct.modelList[tempProduct.frontModelIdx].displayName.replace(/<br>/ig," ").replace(/<sup>/ig," "));
				}
				compareModelNameList += unescapeHtml(displayName);
			}
			
			$(".spec-hidden-area").html(hiddenHtml);
			if(cardGridHtml !== ""){
				$(".compare-popup__product-list").html(cardGridHtml);
			}
			let specTableLabel = compareModelNameList + ' : specification';

			$(".compare-popup__detail-spec-table").attr("aria-label", specTableLabel);
		}
	}
	
	function compareListener(){
		/* 옵션칩(Color, Memory영역) 클릭 Event :: S */
		$(".js-compare-option-fmychip").find("input").off("click");
		$(".js-compare-option-fmychip").find("input").on("click", function(){
			let $optionInputEl = $(this);
			let $targetContentEl = $optionInputEl.closest(".compare-popup__product-item");
			let productIdx = $targetContentEl.data("productidx");
			let modelIdx = $optionInputEl.data("modeli");
			
			let selcardGrid = "";
			setTimeout(function(){
				if(isNotNull(modelIdx)){
					productListData[productIdx].frontModelIdx = modelIdx;
					
					let proObj = getProductModelInfo(productListData[productIdx], modelIdx);
					$targetContentEl.find('.option-selector__wrap:not(".is-option-empty")').each(function(idx){
						let tmpType = productListData[productIdx].optionTypeList[idx];
						let styleAttr = $(this).find('.option-selector__swiper-wrapper').attr("style");
						productListData[productIdx].viewOptionObj[tmpType].styleAttr = styleAttr;
					});
					
					$(this).closest(".compare-popup__product-item").find(".compare-popup__spec-wrap").remove();
					// 웹접근성 화면에 노출안되는 영역
					$($(".spec-hidden-area .hidden:not(:first)").get(productIdx)).empty();
					$($(".spec-hidden-area .hidden:not(:first)").get(productIdx)).html(proObj.modelList[proObj.frontModelIdx].displayName);
					
					selcardGrid +=
						'<h3 class="compare-popup__product-line-title"><span class="compare-popup__product-line-title-text">'+ Granite.I18n.get("Model") +'</span></h3>'+
						buildProductCard(proObj);
					$targetContentEl.html(selcardGrid);
					
					/*
					 * 옵션칩 클릭할때 compare api 호출 하기위한 모델 코드
					*/
					let selectedModel = new Array();
					$(".compare-popup__sku").each(function(){
						let _this = $(this);
						selectedModel.push(_this.data("modelcode"));
					});
			
					if(selectedModel.length > 0){
						specCall(selectedModel.toString());
					}
	
					// product card 를 새로 그려줬으므로 이벤트 새로 지정
					window.sg.components.comparePopup.cardInit($(".compare-popup__product-item").get(productIdx));
					compareListener();
				}
			}, 300);
		});
		/* 옵션칩(Color, Memory영역) 클릭 Event :: E */
		
		/* CTA click event :: S */
		let isBuyNowClicked = false;
		let $ctaBtn = $('.cl-buy-now');
		$ctaBtn.off("click.finder");
		$ctaBtn.on("click.finder", function(e){
			let $targetBtn = $(this);
			let modelCode = "";
			let configInfo = "";
			let configuratorURL = "";

			if(clIsGPv2){
				configInfo = $targetBtn.attr("data-config_info");
				modelCode = $targetBtn.attr("data-modelcode");
				let addToCartFlag = $targetBtn.attr("data-cart");
				let shopSkuCode = $targetBtn.attr("data-sku-code");

				if(addToCartFlag === "true"){
					let addToCartUrl = clCartUrl + "?addItem[]=" + shopSkuCode + ",1";
					if(eppIsFlash || eppIsRefurbish){
						addToCartUrl = clCartUrl + "?flash_skus=" + shopSkuCode;
					}
					window.location.href = addToCartUrl;
				}else{
					if(configInfo !== ""){
						if(configInfo.indexOf("?modelCode") < 0){
							configuratorURL = configInfo + "?modelCode=" + modelCode;
						} else {
							configuratorURL = configInfo;
						}
						window.location.href = configuratorURL;
					}
				}
			} else {
				if(isBuyNowClicked === true){
					return;
				}

				configInfo = $(this).attr("data-config_info");
				modelCode = $(this).attr("data-modelcode");
				let addToCartFlag = $targetBtn.attr("data-cart");
				
				let addCartTimeout = 10000;
				if(clSiteCode === "vn"){
					addCartTimeout = 20000;
				}
				
				if(configInfo !== ""){
					if(configInfo.indexOf("?modelCode") < 0){
						configuratorURL = configInfo + "?modelCode=" + modelCode;
					} else {
						configuratorURL = configInfo;
					}
					window.location.href = configuratorURL;
				}else if(addToCartFlag === "true"){
					let linkInfo = $(this).attr("data-link_info");
					if((clCartUrl.indexOf("http://") > -1 || clCartUrl.indexOf("https://") > -1) && !isEppSite){
						linkInfo = clCartUrl;
					}
					
					
					if(isB2b){
						if(isB2bhybris){ //b2b-hybris
							addToCartNewHybris(modelCode, linkInfo, {}, {}, {}, true, $targetBtn);
						}
					}else{
						if(isNewHybris && (clSiteCode ==='uk'  || clSiteCode === 'cn')){ //202010402 SEBN old hybris 적용, 20210408 id/ph //uk 적용
							addToCartNewHybris(modelCode, linkInfo);
						
						}else if(clSiteCode==="py" || clSiteCode==="ar" || clSiteCode==="br"){
							let storeurl = "";
							if(clSiteCode==="py"){
								storeurl = clStoreDomain + "/getServicesProduct?productCode="+modelCode;
							}else{
								storeurl = clStoreDomain + "/" + clSiteCode + "/getServicesProduct?productCode="+modelCode;
							}
							window.location.href = storeurl;
							
						} else if(addToCartPostYn == "Y"){// addToCart POST 호출 addToCartPostYn meta 정보로 구분 차후 이전 소스제거
							let realSiteCode = clSiteCode;
							if(isNotNull(shopSiteCd)){
								realSiteCode = shopSiteCd;
							}
							if(isEppSite){
								realSiteCode = eppCompanyCode;
							}
							let apiUrl = "";
							if(isNewHybris){
								apiUrl =  storeWebDomain + "/" + realSiteCode + "/servicesv2/addToCart";
							}else{
								apiUrl =  clStoreDomain + "/" + realSiteCode + "/servicesv2/addToCart";
							}
							let postParam = {
	                				'products' : [{
													'productCode' : modelCode,
													'quantity' : 1,
												}]
	                		};
									
							$.ajax({ 
								url: apiUrl,
								type: "POST",
								data: JSON.stringify (postParam),
								contentType : "application/json",
								dataType : "json",
								xhrFields: { withCredentials: true },
								crossDomain : true,
								timeout : addCartTimeout,
								success: function (data) {
									if(data){
										if(data.resultCode === "0000"){
											isBuyNowClicked = true;
											window.location.href = linkInfo;
										}else{
											confirmPopup(data.resultMessage,"error");
										}
									}else{
										confirmPopup("","error");
									}
								},error : function(e){
									var errorText = "";
								    if (e.responseJSON != null) {
								        if (isNotNull(e.responseJSON.message)) {
								            errorText = e.responseJSON.message;
								        }
								    }
									confirmPopup(errorText,"error");
								}
							});
							// addToCart POST 호출 addToCartPostYn meta 정보로 구분 차후 이전 소스제거 STR
						}else if(clHybrisApiJson === "Y"){
							let siteCodeWithEpp = isEppSite ?  eppCompanyCode : clSiteCode;
							let apiUrl = clStoreDomain + "/" + siteCodeWithEpp + "/ng/p4v1/addCart";
							if(isNewHybris  && clSiteCode !== 'uk'){
								apiUrl = storeWebDomain + "/" + siteCodeWithEpp + "/ng/p4v1/addCart";
							}
							$.ajax({
								url : apiUrl,
								type: "GET",
								data: {"productCode" : modelCode, "quantity" : 1},
								contentType : "application/x-www-form-urlencoded",
								dataType : "json",
								xhrFields: { withCredentials: true },
								crossDomain : true,
								timeout : addCartTimeout,
								success: function (data) {
									if(data){
										if(data.resultCode === "0000"){
											isBuyNowClicked = true;
											window.location.href = linkInfo;
										}else{
											confirmPopup(data.resultMessage,"error");
										}
									}else{
										confirmPopup("","error");
									}
								},error : function(e){
									let errorText = "";
									if (e.responseJSON !== null) {
										if (isNotNull(e.responseJSON.message)) {
											errorText = e.responseJSON.message;
										}
									}
									confirmPopup(errorText,"error");
								}
							});
						}else{
							let realSiteCode = clSiteCode;
							if(isNotNull(shopSiteCd)){
								realSiteCode = shopSiteCd;
							}
							if(isEppSite){
								realSiteCode= eppCompanyCode;
							}
							
							let apiUrl =  clStoreDomain + "/" + realSiteCode + "/ng/p4v1/addCart";
							if(isNewHybris && clSiteCode !== 'uk'){				//new-hybris
								apiUrl =  storeWebDomain + "/" + realSiteCode + "/ng/p4v1/addCart";
							}
							
							$.ajax({
								url : apiUrl,
								type : "GET",
								data : {"productCode" : modelCode, "quantity" : 1},
								dataType : "jsonp",
								jsonp : "callback",
								timeout : 10000,
								success : function (data) {
									if(data){
										if(data.resultCode === "0000"){
											isBuyNowClicked = true;
											window.location.href = linkInfo;
										}else{
											confirmPopup(data.resultMessage,"error");
										}
									}else{
										confirmPopup("","error");
									}
								},error : function(e){
									let errorText = "";
									if (e.responseJSON !== null) {
										if (isNotNull(e.responseJSON.message)) {
											errorText = e.responseJSON.message;
										}
									}
									confirmPopup(errorText,"error");
								}
							});
						}
						// addToCart POST 호출 addToCartPostYn meta 정보로 구분 차후 이전 소스제거 STR
					}
				}
			}
		});
	}

	/* Compare popup close event */
	$(document).on("click", ".compare-popup .layer-popup__close", function() {
		$(".compare-popup__product-list").html("");	// 초기화
		window.sg.components.comparePopup.closePopup(document.querySelector(".compare-popup"));
	});
	
	function specCall(modelArr){
		
		if(modelArr !== ""){
			let isB2 = "/b2c";
			if(isB2b){
				isB2 = "/b2b";
			}
			$.ajax({
				url: clSearchDomain + '/' + clApiStageInfo + isB2 +'/product/spec/compare',
				data: {
					"siteCode": clSiteCode,
					"modelList": modelArr
				},
				success: function(data) {
					if(data.response.statusCode === 200 && isNotNull(data.response.resultData)){
						compareSpecsGrid(data.response.resultData);
					}
				}
			});
		}
	}

	function layerGrid() {
		// init
		isSMBUser = false;
		isLogedin = false;
		useTaxExPrice = false;
		
		const useTaxExPriceYN =  $.cookies.get('useTaxExPriceYN', {domain : ".samsung.com"});
		if(useTaxExPriceYN === "Y"){
			useTaxExPrice = true;
		}
	
		if(isB2bhybris){
			isLogedin = commonLoginCheck();
			if(isLogedin && isB2bhybris){
				const isSMBRegisteredUserYN = $.cookies.get("isSMBRegisteredUserYN", {domain : ".samsung.com"});
				if(isSMBRegisteredUserYN === "Y"){
					isSMBUser = true;
				}
			}
		}
		
		let clModelList = "";
		let compareArr = "";
		if(pfCompareModelList.length > 0){
			for(let ed in pfCompareModelList){
				if(ed === "0"){
					clModelList += pfCompareModelList[ed].modelCode;
				}else{
					clModelList += ","+ pfCompareModelList[ed].modelCode;
				}
			}
			clSearchApiParam.modelList = clModelList;
			
			$.ajax({
				url: clSearchApiUrl,
				data: clSearchApiParam,
				success: function(data) {
					if(data.response.statusCode === 200 && isNotNull(data.response.resultData)){
						dataSet(data.response.resultData);
						window.sg.components.comparePopup.reInit();
						window.sg.components.comparePopup.compareFirstFocus();
						compareListener();
					}
				}
			});
			
			let isB2 = "/b2c";
			if(isB2b){
				isB2 = "/b2b";
			}
			if(eppIsFlash || eppIsRefurbish){
				clModelList = isNotNull(pfCompareModelList)? pfCompareModelList.map(item => item.originModelCode).join(",") : "";
			}
			$.ajax({
				url: clSearchDomain + '/' + clApiStageInfo + isB2 + '/product/spec/compare',
				data: {
					"siteCode": clSiteCode,
					"modelList": clModelList
				},
				success: function(data) {
					if(data.response.statusCode === 200 && isNotNull(data.response.resultData)){
						compareSpecsGrid(data.response.resultData);
					}
				}
			});
		}
	}

	pf.compareLayer = (function() {
		return {
			layerGrid: layerGrid
		}
	})();

})(window.jQuery, window.document);

(() => {
  const $q = window.sg.common.$q;
  const utils = window.sg.common.utils;
  const layerPopupMaxHeight = window.sg.common.layerPopupMaxHeight;
  const selector = { section: '.icon-description-column' };

  class IconDescriptionColumn {
    constructor(component) {
      this.selector = {
        section: selector.section,
        layerPopupBtn: 'a.cta[data-layer-target]',
      };

      this.ele = {
        section: $q(component),
        layerPopupBtn: null,
      };

      this.popupData = {
        btn: null,
        popup: null,
      };

      this.setProperty();

      IconDescriptionColumn.instances.set(component, this);

      this.init();
    }

    openLayerPopup(btn) {
      this.popupData.btn = btn;
      this.popupData.popup = $q(`#${this.popupData.btn.dataset.layerTarget}`);
    
      this.popupData.popup.show();

      utils.hiddenScroll();
      this.popupData.popup.setLayerFocus('.layer-popup__inner', '.layer-popup__close');

      this.popupData.popup.find('.layer-popup__close').off('click').on('click', () => {
        this.closeLayerPopup();
      });

      if (layerPopupMaxHeight.reInit(this.popupData.popup.find('.layer-popup').target[0]) === null) {
        layerPopupMaxHeight.init(this.popupData.popup.find('.layer-popup').target[0]);
      }
      layerPopupMaxHeight.setMax(this.popupData.popup.find('.layer-popup').target[0]);
    }

    closeLayerPopup() {
      this.popupData.popup.hide();

      this.popupData.btn.focus();

      utils.visibleScroll();
      this.popupData.popup.offLayerFocus();

      this.popupData.btn = null;
      this.popupData.popup = null;
    }
    
    init() {
      this.bindEvents();
    }

    reInit() {
      this.setProperty();
      this.bindEvents();
    }

    setProperty() {
      this.ele.layerPopupBtn = this.ele.section.find(this.selector.layerPopupBtn);
    }

    bindEvents() {
      this.ele.layerPopupBtn.off('click').on('click', (event) => {
        this.openLayerPopup(event.currentTarget);
      });
    }
  }

  function init() {
    $q(selector.section).target.forEach((element) => {
      if (!IconDescriptionColumn.instances.has(element)) {
        new IconDescriptionColumn(element);
      }
    });
  }
  
  function reInit() {
    $q(selector.section).target.forEach((element) => {
      if (IconDescriptionColumn.instances.has(element)) {
        const instances =  IconDescriptionColumn.instances.get(element);
        instances.reInit();
      } else {
        new IconDescriptionColumn(element);
      }
    });
  }

  IconDescriptionColumn.instances = new WeakMap();

  window.sg.components.iconDescriptionColumn = {
    init,
    reInit,
  };

  $q.ready(init);
})();


(() => {
  const $q = window.sg.common.$q;
  const layerPopupMaxHeight = window.sg.common.layerPopupMaxHeight;
  const menu = window.sg.common.menu;
  const scrollbar = window.sg.common.scrollbar;
  const selector = { section: '.finance-ee-popup' };

  class FinanceEePopup {
    constructor(component) {
      this.selector = {
        section: selector.section,
        layerScroll: '.layer-popup',
        focusStart: '.layer-popup__inner',
        focusLast: '.layer-popup__close',
        popupClose: '.layer-popup__close',
        menuSelect: '.menu select',
        menuBar: '.menu__select-field',
        menuTitle: '.menu__select-field-text',
      };

      this.ele = {
        window: $q(window),
        section: $q(component),
        layerScroll: null,
        closeFocus: null,
      };

      this.setProperty();

      this.handler = {
        resize: this.resize.bind(this),
        menuChange: (event) => {
          setTimeout(() => {
            this.resizeMenu($q(event.target).closest('.menu').target[0]);
          },100);
        },
      };

      FinanceEePopup.instances.set(component, this);

      this.init();
    }

    setProperty() {
      this.ele.layerScroll = this.ele.section.find(this.selector.layerScroll);

      if (this.ele.section.css('display') !== 'none') {
        window.sg.common.utils.hiddenScroll();
        this.ele.section.setLayerFocus(this.selector.focusStart, this.selector.focusLast);
      }
    }

    showPopup(btn = null) {
      if (btn !== null) {
        this.ele.closeFocus = btn;
      }
      
      this.ele.section.show();
      window.sg.common.utils.hiddenScroll();
      this.ele.section.setLayerFocus(this.selector.focusStart, this.selector.focusLast);
    }

    hidePopup() {
      window.sg.common.utils.visibleScroll();
      this.ele.section.offLayerFocus();
      this.ele.section.hide();
      if (this.ele.closeFocus !== null) {
        this.ele.closeFocus.focus();
      }
    }

    init() {
      this.bindEvents();
      this.resize();
    }

    reInit() {
      this.setProperty();
      this.bindEvents();
      this.resize();
    }

    bindEvents() {
      this.ele.window.off('resize',this.handler.resize).on('resize',this.handler.resize);
      this.ele.section.find(this.selector.menuSelect).off('change',this.handler.menuChange).on('change',this.handler.menuChange);
    }

    resize() {
      this.ele.section.find('.menu').target.forEach((element) => {
        this.resizeMenu(element);
      });
    }

    resizeMenu(element) {
      const itemHeight = element.querySelector(this.selector.menuTitle).getBoundingClientRect().height;
      element.style.height = '';
      element.querySelector(this.selector.menuBar).style.height = '';

      if (element.getBoundingClientRect().height < itemHeight) {
        element.querySelector(this.selector.menuBar).style.height = `${itemHeight}px`;
        element.style.height = `${itemHeight}px`;
      }

      this.ele.section.find('.scrollbar').target.forEach((element) => {
        scrollbar.resize(element);
      });
    }
  }

  function init() {
    $q(`${selector.section} .menu`).target.forEach((element) => {
      menu.init(element);
    });

    $q(`${selector.section} .layer-popup`).target.forEach((element) => {
      if (layerPopupMaxHeight.reInit(element) === null) {
        layerPopupMaxHeight.init(element);
      }
    });

    $q(selector.section).target.forEach((element) => {
      if (!FinanceEePopup.instances.has(element)) {
        new FinanceEePopup(element);
      }
    });
  }
  
  function reInit() {
    $q(`${selector.section} .menu`).target.forEach((element) => {
      menu.reInit(element);
    });

    $q(`${selector.section} .layer-popup`).target.forEach((element) => {
      if (layerPopupMaxHeight.reInit(element) === null) {
        layerPopupMaxHeight.init(element);
      }
    });

    $q(selector.section).target.forEach((element) => {
      if (FinanceEePopup.instances.has(element)) {
        const instances =  FinanceEePopup.instances.get(element);
        instances.reInit();
      } else {
        new FinanceEePopup(element);
      }
    });
  }

  FinanceEePopup.instances = new WeakMap();

  window.sg.components.financeEePopup = {
    init,
    reInit,
    show: (btn = null) => {
      $q(selector.section).target.forEach((element) => {
        if (FinanceEePopup.instances.has(element)) {
          const instances =  FinanceEePopup.instances.get(element);
          instances.showPopup(btn);
        }
      });
    },
    hide: () => {
      $q(selector.section).target.forEach((element) => {
        if (FinanceEePopup.instances.has(element)) {
          const instances =  FinanceEePopup.instances.get(element);
          instances.hidePopup();
        }
      });
    },
  };

  $q.ready(init);
})();


var installmentPlansData = {};
(function ($, document) {
	"use strict";
	
	var siteCode = $("#siteCode").val();
	var storeDomain = $("#storeDomain").val();
	var countryIsoCode = $("#countryIsoCode").val();
	var priceCurrency = $("#priceCurrency").val();
	var multiLanguageYN = $("#multiLanguageYn").val();
	var hreflang = $("#localLang").val();
	var headers = {
					"Cache-Control": "no-cache",
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				  };

	if (multiLanguageYN === "Y") {
		headers["x-ecom-locale"] = hreflang;
	}
	
	var modelCode = "";    	//본품의 모델코드
	var dataPrice = "";
	var emiFinanceInfoData = [];
	var monthdataset ={};
	var focusTarget;
	//[EPP] epp 관련 변수 추가
	const isEppSite = checkEppSite();
	if(isEppSite && window.sg.epp == null){
		window.sg.epp={};
		window.sg.epp.common ={};
	}
	let eppCompanyCode = isEppSite ? window.sg.epp.common.companyCode : "";

	var installmentPlansGrid = function() {
		if(emiFinanceInfoData !== null && emiFinanceInfoData !== "") {
			var selectPlanHtml = "";
			for(var key in emiFinanceInfoData){
			  if(emiFinanceInfoData[key].length !== 0){
				  selectPlanHtml += '<option value="'+key+'">'+key+'</option>';
			  }
			}
			$('.finance-ee-popup #selectplan').html(selectPlanHtml);
			
			if($('.finance-ee-popup #selectplan option').length > 0){
				planGrid($('.finance-ee-popup #selectplan option').first().val());
			}
		}
		window.sg.components.financeEePopup.show(focusTarget);
	}

	var planGrid = function(selectPlan) {
		var firstdatalist = emiFinanceInfoData[selectPlan];
		var selectMonthsHtml = "";
		if(firstdatalist !== null && firstdatalist.length !== 0){
			for(var i =0 ; i< firstdatalist.length; i++){
				selectMonthsHtml += '<option value="'+firstdatalist[i].tenure.value+'">'+firstdatalist[i].tenure.value+'</option>';
			}
		}
		$(".finance-ee-popup #selectmonths").html(selectMonthsHtml);
		window.sg.components.financeEePopup.reInit();
		
		getPlansCalculator(selectPlan, $('.finance-ee-popup #selectmonths option').first().val());
	}
	
	var getPaymentData = function (dataPriceParm, focusTargetParm, modelCodeParm) {
		focusTarget = focusTargetParm
		dataPrice = dataPriceParm
		modelCode = modelCodeParm;
		var pdJwtToken = $.cookies.get("jwt_"+countryIsoCode, {domain:".samsung.com"});
		var paramObj = {"cart":{ "skus": [modelCode],"total_price": dataPrice}};
		if(isEppSite){
			paramObj["store_id"] =eppCompanyCode;
		}
		$.ajax({
			headers: headers,
			url: storeDomain + "/v4/configurator/payment-options",
			//url: "https://www.samsung.com/ee/api/v4/configurator/payment-options",
			type: "POST",
			dataType: "json",
			xhrFields: { withCredentials: true },
			crossDomain: true,
			async: true,
			data: JSON.stringify(paramObj),
			beforeSend : function(xhr){
				/* jwtToken 있으면  헤더값 추가 */
				if(pdJwtToken != null && pdJwtToken != ""){
					xhr.setRequestHeader("x-ecom-jwt", pdJwtToken);
				}
			},
			success : function ( data) {
				if(data != null && data != ""){
					$(".finance-ee-popup #productprice").html(currencyComma(dataPrice, priceCurrency));
					if(data.payment_methods.LS){
						if(data.payment_methods.LS.finance_plans){
							if(data.payment_methods.LS.finance_plans){
								emiFinanceInfoData = data.payment_methods.LS.finance_plans;
								installmentPlansGrid();
							}
						}
					}
				}
			}
		});
	}
	
	var getPlansCalculator = function (plan, months) {
		var pdJwtToken = $.cookies.get("jwt_"+countryIsoCode, {domain:".samsung.com"});
		var paramObj = { 
					"total_price": Number(dataPrice),
					"payment_option": plan,
					"tenure": {
						"unit": "M",
						"value": months
						}
					};
		
		if(isEppSite){
			paramObj["store_id"] = eppCompanyCode;
		}

		$(".finance-ee-popup #interestrate").text("");
		$(".finance-ee-popup #monthlypayment").text("");
		if(monthdataset[String(dataPrice) + plan + months]){
			var data = monthdataset[String(dataPrice) + plan + months];
			if(data != null && data != ""){
				monthdataset[String(dataPrice) + plan + months] = data;
				if(data.interest_rate){
					$(".finance-ee-popup #interestrate").html(data.interest_rate + "%");
				}
				if(data.installment_amount){
					var installment_amount = Granite.I18n.get("{0}/month", (currencyComma(Number(data.installment_amount), priceCurrency)));
					$(".finance-ee-popup #monthlypayment").html(installment_amount);
				}
			}
		}else{
			$.ajax({
				headers: {
					"Cache-Control" : "no-cache",
					"Content-Type" : "application/json",
					"Access-Control-Allow-Origin" : "*"
				},
				url: storeDomain + "/v1/payment/LS/emi_calculator",
				//url:"https://www.samsung.com/ee/api/v1/payment/LS/emi_calculator",
				data: JSON.stringify(paramObj),
				type: "POST",
				dataType: "json",
				timeout: 20000,
				xhrFields: { withCredentials: true },
				async : true,
				beforeSend : function(xhr){
					/* jwtToken 있으면  헤더값 추가 */
					if(pdJwtToken != null && pdJwtToken != ""){
						xhr.setRequestHeader("x-ecom-jwt", pdJwtToken);
					}
				},
				success : function (data){
					if(data != null && data != ""){
						monthdataset[String(dataPrice) + plan + months] = data;
						if(data.interest_rate){
							$(".finance-ee-popup #interestrate").html(data.interest_rate + "%");
						}
						if(data.installment_amount){
							var installment_amount = Granite.I18n.get("{0}/month", (currencyComma(Number(data.installment_amount), priceCurrency)));
							$(".finance-ee-popup #monthlypayment").html(installment_amount);
						}
					}
				}
			});
		}
	}
	
	$(".finance-ee-popup .layer-popup__close").on("click", function() {
		window.sg.components.financeEePopup.hide(focusTarget);
	});
	
	$(".finance-ee-popup #selectplan").on("change", function() {
		planGrid($("#selectplan option:selected").val());
	});
	
	$(".finance-ee-popup #selectmonths").on("change", function() {
		getPlansCalculator($("#selectplan option:selected").val(), $("#selectmonths option:selected").val());
	});

	installmentPlansData = (function(){
		return {
			getPaymentData : getPaymentData
		}
	})();
	
})(window.jQuery, window.document);
(() => {
  const $q = window.sg.common.$q;

  class Nv14VisualLnb {
    constructor(el) {
      this.els = {
        el,
        containerEl: el.querySelector('.nv14-visual-lnb__container'),
        headlineMenuWrapEl: el.querySelector('.nv14-visual-lnb__headline-menu-wrap'),
        menuWrapEl: el.querySelector('.nv14-visual-lnb__menu-wrap'),
        menuListEl: el.querySelector('.nv14-visual-lnb__menu-list'),
        menuEls: el.querySelectorAll('.nv14-visual-lnb__menu'),
        menuPrevBtnEl: el.querySelector('.nv14-visual-lnb__menu-wrap--previous'),
        menuNextBtnEl: el.querySelector('.nv14-visual-lnb__menu-wrap--next'),
        featuredItemWrapEl: el.querySelector('.nv14-visual-lnb__featured-item-wrap'),
        featuredItemListEl: el.querySelector('.nv14-visual-lnb__featured-item-list'),
        featuredItemEls: el.querySelectorAll('.nv14-visual-lnb__featured-item'),
        featuredItemPrevBtnEl: el.querySelector('.nv14-visual-lnb__featured-item-wrap--previous'),
        featuredItemNextBtnEl: el.querySelector('.nv14-visual-lnb__featured-item-wrap--next'),
      };

      this.getCurrentDevice = window.sg.common.utils.getCurrentDevice;
      this.currentDevice = this.getCurrentDevice();

      this.addEventListener = window.sg.common.utils.addEventListener;
      this.removeAllEventListeners = window.sg.common.utils.removeAllEventListeners;

      this.isSticky = false;
      this.isScrollDown = false;

      this.directionMenuNavBtn = false;
      this.directionFeaturedItemNavBtn = false;

      this.init();
    }

    init() {
      if (Nv14VisualLnb.instances.has(this.els.el)) {
        return;
      }

      Nv14VisualLnb.instances.set(this.els.el, this);

      this.bindEvents();
    }

    setMenuSwiper() {
      const paddingLeft = parseFloat(getComputedStyle(this.els.menuWrapEl, null).paddingLeft.replace('px', ''));
      const paddingRight = parseFloat(getComputedStyle(this.els.menuWrapEl, null).paddingRight.replace('px', ''));
      if ((this.els.menuWrapEl.getBoundingClientRect().width - paddingLeft - paddingRight) < this.els.menuListEl.getBoundingClientRect().width) {
        this.els.menuWrapEl.classList.add('overflow');
        this.els.menuWrapEl.classList.add('swiper-container');
        this.els.menuListEl.classList.add('swiper-wrapper');
        [...this.els.menuEls].forEach((el) => {
          el.classList.add('swiper-slide');
        });

        // eslint-disable-next-line no-undef
        this.menuSwiper = new Swiper(this.els.menuWrapEl, {
          speed: 400,
          slidesPerView: 'auto',
          centerInsufficientSlides: true,
          centeredSlides: true,
          centeredSlidesBounds: true,
          navigation: {
            prevEl: '.nv14-visual-lnb__menu-wrap--previous',
            nextEl: '.nv14-visual-lnb__menu-wrap--next',
            disabledClass: 'disabled',
          },
        });

        [...this.els.menuEls].forEach((el, index) => {
          if (el.classList.contains('highlight-on')) {
            this.menuSwiper.slideTo(index, 0);
          }

          this.addEventListener(el.querySelector('.nv14-visual-lnb__menu-link'), 'focus', () => {
            this.els.menuWrapEl.scrollLeft = 0;
            if ((el.getBoundingClientRect().left < (this.els.menuWrapEl.getBoundingClientRect().left + this.els.menuPrevBtnEl.getBoundingClientRect().width)) || (el.getBoundingClientRect().right > (this.els.menuWrapEl.getBoundingClientRect().right - this.els.menuNextBtnEl.getBoundingClientRect().width))) {
              this.menuSwiper.slideTo(index);
            }
          });
        });

        this.setAccessibility('menu');

        this.menuSwiper.on('slideChange', () => {
          this.setAccessibility('menu');
        });

        this.menuSwiper.on('transitionStart', () => {
          if (this.directionMenuNavBtn) {
            const activeItem = this.menuSwiper.slides[this.menuSwiper.activeIndex];
            const activeItemLeft = activeItem.getBoundingClientRect().left;
            const activeItemRight = activeItem.getBoundingClientRect().right;
            const center = this.els.menuWrapEl.getBoundingClientRect().left + ((this.els.menuWrapEl.getBoundingClientRect().right - this.els.menuWrapEl.getBoundingClientRect().left) / 2);

            if (activeItemLeft < center && activeItemRight > center) {
              if (this.directionMenuNavBtn === 'next') {
                this.menuSwiper.slideTo(this.menuSwiper.activeIndex + 1);
              } else if (this.directionMenuNavBtn === 'prev') {
                this.menuSwiper.slideTo(this.menuSwiper.activeIndex - 1);
              }
            }
            this.directionMenuItemNavBtn = false;
          }
        });
      }
    }

    setFeaturedItemSwiper() {
      const paddingLeft = parseFloat(getComputedStyle(this.els.featuredItemWrapEl, null).paddingLeft.replace('px', ''));
      const paddingRight = parseFloat(getComputedStyle(this.els.featuredItemWrapEl, null).paddingRight.replace('px', ''));
      if ((this.els.featuredItemWrapEl.getBoundingClientRect().width - paddingLeft - paddingRight) < this.els.featuredItemListEl.getBoundingClientRect().width) {
        this.els.featuredItemWrapEl.classList.add('overflow');
        this.els.featuredItemWrapEl.classList.add('swiper-container');
        this.els.featuredItemListEl.classList.add('swiper-wrapper');
        [...this.els.featuredItemEls].forEach((el) => {
          el.classList.add('swiper-slide');
        });

        // eslint-disable-next-line no-undef
        this.featuredItemSwiper = new Swiper(this.els.featuredItemWrapEl, {
          speed: 400,
          slidesPerView: 'auto',
          centeredSlides: true,
          centeredSlidesBounds: true,
          navigation: {
            prevEl: '.nv14-visual-lnb__featured-item-wrap--previous',
            nextEl: '.nv14-visual-lnb__featured-item-wrap--next',
            disabledClass: 'disabled',
          },
        });

        [...this.els.featuredItemEls].forEach((el, index) => {
          if (el.classList.contains('highlight-on')) {
            this.featuredItemSwiper.slideTo(index, 0);
          }

          this.addEventListener(el.querySelector('.nv14-visual-lnb__featured-item-link'), 'focus', () => {
            this.els.featuredItemWrapEl.scrollLeft = 0;
            if ((el.getBoundingClientRect().left < (this.els.featuredItemWrapEl.getBoundingClientRect().left + this.els.featuredItemPrevBtnEl.getBoundingClientRect().width)) || (el.getBoundingClientRect().right > (this.els.featuredItemWrapEl.getBoundingClientRect().right - this.els.featuredItemNextBtnEl.getBoundingClientRect().width))) {
              this.featuredItemSwiper.slideTo(index);
            }
          });
        });

        this.setAccessibility('featuredItem');

        this.featuredItemSwiper.on('slideChange', () => {
          this.setAccessibility('featuredItem');
        });

        this.featuredItemSwiper.on('transitionStart', () => {
          if (this.directionFeaturedItemNavBtn) {
            const activeItem = this.featuredItemSwiper.slides[this.featuredItemSwiper.activeIndex];
            const activeItemLeft = activeItem.getBoundingClientRect().left;
            const activeItemRight = activeItem.getBoundingClientRect().right;
            const center = this.els.featuredItemWrapEl.getBoundingClientRect().left + ((this.els.featuredItemWrapEl.getBoundingClientRect().right - this.els.featuredItemWrapEl.getBoundingClientRect().left) / 2);

            if (activeItemLeft < center && activeItemRight > center) {
              if (this.directionFeaturedItemNavBtn === 'next') {
                this.featuredItemSwiper.slideTo(this.featuredItemSwiper.activeIndex + 1);
              } else if (this.directionFeaturedItemNavBtn === 'prev') {
                this.featuredItemSwiper.slideTo(this.featuredItemSwiper.activeIndex - 1);
              }
            }
            this.directionFeaturedItemNavBtn = false;
          }
        });
      }
    }

    bindEvents() {
      setTimeout(() => {
        if (this.els.menuWrapEl) {
          this.els.menuPrevBtnEl.addEventListener('click', () => {
            this.directionMenuNavBtn = 'prev';
          });
          this.els.menuNextBtnEl.addEventListener('click', () => {
            this.directionMenuNavBtn = 'next';
          });

          this.setMenuSwiper();
        }
        if (this.els.featuredItemWrapEl) {
          this.els.featuredItemPrevBtnEl.addEventListener('click', () => {
            this.directionFeaturedItemNavBtn = 'prev';
          });
          this.els.featuredItemNextBtnEl.addEventListener('click', () => {
            this.directionFeaturedItemNavBtn = 'next';
          });

          const lastFeaturedItemImage = this.els.featuredItemEls[this.els.featuredItemEls.length - 1].querySelector('.image__main');
          if (!lastFeaturedItemImage.classList.contains('image--loaded')) {
            lastFeaturedItemImage.addEventListener('load', () => {
              this.setFeaturedItemSwiper();
            });
          } else {
            this.setFeaturedItemSwiper();
          }
        }
        this.setNavStatus();
        this.setNavHeight();
      }, 0);

      document.addEventListener('scroll', () => {
        this.setNavStatus();
      });

      window.addEventListener('resize', () => {
        this.setNavHeight();

        if (this.currentDevice !== this.getCurrentDevice()) {
          this.currentDevice = this.getCurrentDevice();

          if (this.menuSwiper) {
            [...this.els.menuEls].forEach((el) => {
              this.removeAllEventListeners(el.querySelector('.nv14-visual-lnb__menu-link'), 'focus');
            });
            this.menuSwiper.destroy();
            this.els.menuWrapEl.classList.remove('overflow');
            this.els.menuWrapEl.classList.remove('swiper-container');
            this.els.menuListEl.classList.remove('swiper-wrapper');
            [...this.els.menuEls].forEach((el) => {
              el.classList.remove('swiper-slide');
            });
          }

          if (this.els.menuWrapEl) {
            this.setMenuSwiper();
          }

          if (this.featuredItemSwiper) {
            [...this.els.featuredItemEls].forEach((el) => {
              this.removeAllEventListeners(el.querySelector('.nv14-visual-lnb__featured-item-link'), 'focus');
              el.querySelector('.nv14-visual-lnb__featured-item-link-title').removeAttribute('style');
              el.querySelector('.image').removeAttribute('style');
            });
            this.featuredItemSwiper.destroy();
            this.els.featuredItemWrapEl.classList.remove('overflow');
            this.els.featuredItemWrapEl.classList.remove('swiper-container');
            this.els.featuredItemListEl.classList.remove('swiper-wrapper');
            [...this.els.featuredItemEls].forEach((el) => {
              el.classList.remove('swiper-slide');
            });
          }

          if (this.els.featuredItemWrapEl) {
            this.setFeaturedItemSwiper();
          }
        }
      });
    }

    setNavStatus() {
      const navTop = this.els.el.getBoundingClientRect().top;

      if (navTop <= 0) {
        if (!this.isSticky) {
          this.els.containerEl.classList.add('sticky');
          this.isSticky = true;
        }

        if (this.els.featuredItemWrapEl) {
          if (navTop <= -70) {
            if (!this.isScrollDown) {
              this.isScrollDown = true;
              this.changeFeaturedItemSwiper();
            }
          } else {
            if (this.isScrollDown) {
              this.isScrollDown = false;
              this.changeFeaturedItemSwiper();
            }
          }
        }
      } else {
        if (this.isSticky) {
          this.els.containerEl.classList.remove('sticky');
          this.isSticky = false;
        }

        if (this.els.featuredItemWrapEl) {
          if (this.isScrollDown) {
            this.isScrollDown = false;
            this.changeFeaturedItemSwiper();
          }
        }
      }
    }

    setNavHeight() {
      let featuredItemWrapHeight = 0;
      if (this.els.featuredItemWrapEl) {
        if (!this.isScrollDown) {
          [...this.els.featuredItemEls].forEach((el) => {
            el.querySelector('.nv14-visual-lnb__featured-item-link-title').removeAttribute('style');
            el.querySelector('.image').removeAttribute('style');
          });
        }

        if (this.getCurrentDevice() === 'mobile') {
          let maxTitleHeight = 0;
          [...this.els.featuredItemEls].forEach((el) => {
            if (maxTitleHeight < el.querySelector('.nv14-visual-lnb__featured-item-link-title strong').getBoundingClientRect().height) {
              maxTitleHeight = el.querySelector('.nv14-visual-lnb__featured-item-link-title strong').getBoundingClientRect().height;
            }
          });

          [...this.els.featuredItemEls].forEach((el) => {
            el.querySelector('.nv14-visual-lnb__featured-item-link-title').style.minHeight = `${maxTitleHeight}px`;
          });
        } else if (this.getCurrentDevice() === 'desktop') {
          let maxItemHeight = 0;
          [...this.els.featuredItemEls].forEach((el) => {
            if (maxItemHeight < el.getBoundingClientRect().height) {
              maxItemHeight = el.getBoundingClientRect().height;
            }
          });

          [...this.els.featuredItemEls].forEach((el) => {
            el.querySelector('.image').style.height = `${maxItemHeight}px`;
          });
        }

        this.els.featuredItemWrapEl.style.height = `${this.els.featuredItemListEl.getBoundingClientRect().height}px`;
        featuredItemWrapHeight = this.els.featuredItemListEl.getBoundingClientRect().height;
      }
      this.els.el.style.height = `${this.els.headlineMenuWrapEl.getBoundingClientRect().height + featuredItemWrapHeight}px`;
    }

    changeFeaturedItemSwiper() {
      this.els.featuredItemWrapEl.style.height = '0';
      this.els.featuredItemWrapEl.style.opacity = '0';

      setTimeout(() => {
        if (this.featuredItemSwiper) {
          [...this.els.featuredItemEls].forEach((el) => {
            this.removeAllEventListeners(el.querySelector('.nv14-visual-lnb__featured-item-link'), 'focus');
          });
          this.featuredItemSwiper.destroy();
          this.els.featuredItemWrapEl.style.height = '0';
          this.els.featuredItemWrapEl.style.opacity = '0';
          this.els.featuredItemWrapEl.classList.remove('overflow');
          this.els.featuredItemWrapEl.classList.remove('swiper-container');
          this.els.featuredItemListEl.classList.remove('swiper-wrapper');
          [...this.els.featuredItemEls].forEach((el) => {
            el.classList.remove('swiper-slide');
          });
        }

        if (this.isScrollDown) {
          this.els.featuredItemWrapEl.classList.add('scroll-down');
          // if (this.els.el.querySelectorAll('.highlight-on').length > 1) {
          //   this.els.el.querySelectorAll('.highlight-on')[0].classList.add('no-underline');
          // }
          [...this.els.featuredItemEls].forEach((el) => {
            el.querySelector('.nv14-visual-lnb__featured-item-link-title').removeAttribute('style');
            el.querySelector('.image').removeAttribute('style');
          });
        } else {
          this.els.featuredItemWrapEl.classList.remove('scroll-down');
          //this.els.el.querySelectorAll('.highlight-on')[0].classList.remove('no-underline');
        }

        this.setFeaturedItemSwiper();
        this.setNavHeight();
        this.els.featuredItemWrapEl.style.opacity = '1';
        if (window.sg.components.pd03ProductFinder) {
          window.sg.components.pd03ProductFinder.setHeaderFixFlag();
        }
      }, 200);
    }

    setAccessibility(type) {
      if (type === 'menu') {
        if (this.els.menuPrevBtnEl.classList.contains('disabled')) {
          this.els.menuPrevBtnEl.setAttribute('aria-hidden', 'true');
          this.els.menuPrevBtnEl.setAttribute('tabindex', '-1');
        } else {
          this.els.menuPrevBtnEl.removeAttribute('aria-hidden');
          this.els.menuPrevBtnEl.removeAttribute('tabindex');
        }

        if (this.els.menuNextBtnEl.classList.contains('disabled')) {
          this.els.menuNextBtnEl.setAttribute('aria-hidden', 'true');
          this.els.menuNextBtnEl.setAttribute('tabindex', '-1');
        } else {
          this.els.menuNextBtnEl.removeAttribute('aria-hidden');
          this.els.menuNextBtnEl.removeAttribute('tabindex');
        }
      } else {
        if (this.els.featuredItemPrevBtnEl.classList.contains('disabled')) {
          this.els.featuredItemPrevBtnEl.setAttribute('aria-hidden', 'true');
          this.els.featuredItemPrevBtnEl.setAttribute('tabindex', '-1');
        } else {
          this.els.featuredItemPrevBtnEl.removeAttribute('aria-hidden');
          this.els.featuredItemPrevBtnEl.removeAttribute('tabindex');
        }

        if (this.els.featuredItemNextBtnEl.classList.contains('disabled')) {
          this.els.featuredItemNextBtnEl.setAttribute('aria-hidden', 'true');
          this.els.featuredItemNextBtnEl.setAttribute('tabindex', '-1');
        } else {
          this.els.featuredItemNextBtnEl.removeAttribute('aria-hidden');
          this.els.featuredItemNextBtnEl.removeAttribute('tabindex');
        }
      }
    }
  }

  Nv14VisualLnb.instances = new WeakMap();

  const nv14VisualLnb = {
    initAll() {
      [...document.querySelectorAll('.nv14-visual-lnb')].forEach((el) => {
        if (!Nv14VisualLnb.instances.has(el)) {
          new Nv14VisualLnb(el);
        }
      });
    },
  };

  window.sg.components.nv14VisualLnb = nv14VisualLnb;
  $q.ready(() => nv14VisualLnb.initAll());
})();

(() => {
  const $q = window.sg.common.$q;
  const commonTab = window.sg.common.tab;
  const swiperManager = window.sg.common.swiperManager;
  const BREAKPOINTS = window.sg.common.constants.BREAKPOINTS;
  const utils = window.sg.common.utils;
  const scrollbar = window.sg.common.scrollbar;
  const optionSelector = window.sg.common.OptionSelector;
  const libs = window.sg.common.libs;
  const setMobileFocusLoop = utils.setMobileFocusLoop;
  const removeMobileFocusLoop = utils.removeMobileFocusLoop;

  const selector = {
    section: '.pdd16-step-buying',
  };

  class StepBuying {
    constructor(element) {
      this.el = {
        window: $q(window),
        component: $q(element),
      };

      this.winRect = null;
      this.downOptionScroll = null;
      this.resizeTimer = null;
      this.activeTarget = null;
      this.activeCta = null;

      this.handler = {
        setFix: this.setFix.bind(this),
        resize: this.resize.bind(this),
        resizeSwiper: this.resizeSwiper.bind(this),
        slideChange: this.slideChange.bind(this),
        clickViewIcon: this.clickViewIcon.bind(this),
        checkedCheckbox: this.checkedCheckbox.bind(this),
        clickSelect: (event) => {
          this.clickSelect(event.currentTarget);
        },
        clickMoreBtn: this.clickMoreBtn.bind(this),
        clickTab: () => {
          const idx = this.el.tabBtn.target.indexOf(event.currentTarget);
          this.el.swiper.swiper.slideTo(idx);
        },
        clickFooterBtn: () => {
          this.el.swiper.swiper.slideNext();
        },
        swiperTouchStart: (event) => {
          if (this.isPc) {
            this.el.swiper.swiper.allowTouchMove = false;
          } else if($q(event.target).closest('.option-selector').target.length === 0) {
            this.el.swiper.swiper.allowTouchMove = true;
          }
        },
        optionTouchDown: () => {
          this.el.window.off('mousemove',this.handler.optionTouchMove).on('mousemove',this.handler.optionTouchMove);
          this.el.window.off('touchmove',this.handler.optionTouchMove).on('touchmove',this.handler.optionTouchMove);
          this.el.window.off('mouseup',this.handler.optionTouchUp).on('mouseup',this.handler.optionTouchUp);
          this.el.window.off('touchend',this.handler.optionTouchUp).on('touchend',this.handler.optionTouchUp);
          this.downOptionScroll = this.el.swiper.querySelector('.swiper-slide-active .scrollbar__wrap').scrollLeft;
        },
        optionTouchMove: () => {
          scrollbar.scrollTo(this.el.swiper.querySelector('.swiper-slide-active > .scrollbar'), 0);

          if(this.downOptionScroll !== null && this.el.swiper.swiper.allowTouchMove){ // when dragout .option-selector, allowTouchMove = true
            this.el.swiper.swiper.allowTouchMove = false;
          }
        },
        optionTouchUp: () => {
          this.downOptionScroll = null;
          this.el.window.off('mousemove',this.handler.optionTouchMove);
          this.el.window.off('touchmove',this.handler.optionTouchMove);
          this.el.window.off('mouseup',this.handler.optionTouchUp);
          this.el.window.off('touchend',this.handler.optionTouchUp);
        },
        focusLock: this.focusLock.bind(this),
        closePopup: this.closePopup.bind(this),
        slideChangeTransitionEnd: this.slideChangeTransitionEnd.bind(this),
        slideChangeTransitionStart: this.slideChangeTransitionStart.bind(this),
        slideResetTransitionStart: this.slideResetTransitionStart.bind(this),
      };

      StepBuying.instances.set(element, this);
      this.init();
    }

    setElements() {
      this.el.tabBtn = this.el.component.find('.tab__item-title');
      this.el.swiper = this.el.component.find('.pdd16-step-buying__contents .pdd16-step-buying__card-wrap').target[0];
      this.el.StepSwiper = this.el.component.find('.pdd16-step-buying__add-on-list').target[0];
      this.el.StepSwiperSlide = this.el.component.find('.pdd16-step-buying__add-on-list').find('.swiper-slide');
      this.el.footer = this.el.component.find('.pdd16-step-buying__footer');
      this.el.dummyHeaer = this.el.component.find('.pdd16-step-buying__header__dummy');
      this.el.dummyFooter = this.el.component.find('.pdd16-step-buying__footer__dummy');
      this.el.viewIcon = this.el.component.find('.pdd16-step-buying__list-type > a');
      this.el.selectBtn = this.el.component.find('.pdd16-step-buying__card > button.cta:not(.js-cta-stock), .pdd16-step-buying__card-cta button.cta:not(.js-cta-stock)');
      this.el.selectNum = this.el.component.find('.pdd16-step-buying__evoucher-list li:first-child .pdd16-step-buying__evoucher-title > span');
      this.el.selectClearAll = this.el.component.find('.cta--clear-all');
      this.el.moreBtn = this.el.component.find('.pdd16-step-buying__view-more');
      this.el.tab = this.el.component.find('.tab');
      this.el.checkbox = this.el.component.find('.pdd16-step-buying__tnc-checkbox.is-required .checkbox-v2 input[type="checkbox"]');

      if (this.el.component.hasClass('pdd16-step-buying--default')) {
        this.el.footerBtn = this.el.component.find('.pdd16-step-buying__footer .cta--step');
      } else {
        this.el.footerBtn = $q([]);
      }

      this.el.popup = this.el.component.find('.pdd16-step-buying__layer-learn-more');
      this.el.closePopupCta = this.el.popup.find('.layer-popup__close');

      this.downOptionScroll = null;

      this.el.component.find('.pdd16-step-buying__card-wrap .swiper-slide').target.forEach((slide) => {
        const showCard = slide.querySelectorAll('.pdd16-step-buying__card:nth-child(-n+6)');
        [...showCard].forEach((card) => {
          card.classList.add('is-show');
        });

        $q(showCard[showCard.length - 1]).find('.pdd16-step-buying__tooltip').css({
          'right': 0,
          'left': 'auto',
        });

        if(slide.querySelectorAll('.pdd16-step-buying__card').length <= 6){
          slide.querySelector('.pdd16-step-buying__view-more').style.display = 'none';
        }

        const icon = slide.querySelectorAll('.pdd16-step-buying__list-type > a');
        if(slide.classList.contains('pdd16-step-buying__2column')){
          icon[0].classList.add('on');
          icon[1].classList.remove('on');
        }else{
          icon[0].classList.remove('on');
          icon[1].classList.add('on');
        }
      });

      this.lastSlideIdx = this.el.StepSwiperSlide.target.length > 0 ? this.el.StepSwiperSlide.target.length - 2 : null;
    }

    init() {
      this.setElements();
      if(this.el.swiper.swiper === undefined){
        swiperManager.slideReInit(this.el.swiper);
      }

      this.resize();
      this.bindEvents();
    }

    reInit() {
      this.setElements();
      window.sg.common.lazyLoad.setLazyLoad();
      if(this.el.swiper.swiper === undefined){
        swiperManager.slideReInit(this.el.swiper);
      } else {
        swiperManager.slideUpdate(this.el.swiper);
      }

      if(this.el.StepSwiper.swiper === undefined){
        swiperManager.slideReInit(this.el.StepSwiper);
      } else {
        swiperManager.slideUpdate(this.el.StepSwiper);
      }

      this.resize();
      this.bindEvents();
    }

    slideChangeTransitionStart() {
      this.el.StepSwiperSlide.addClass('changing');
      this.el.StepSwiperSlide.removeClass('changed');

      if (BREAKPOINTS.MOBILE < utils.getViewPort().width) {
        if (this.el.StepSwiperSlide.eq(this.lastSlideIdx).hasClass('swiper-slide-active')) {
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).addClass('changingend');
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changedend');
        }
      } else {
        if (this.el.StepSwiper.swiper.isEnd) {
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).addClass('changingend');
          this.el.StepSwiperSlide.eq(this.lastSlid32eIdx).removeClass('changedend');
        }
      }
    }

    slideChangeTransitionEnd() {
      if (BREAKPOINTS.MOBILE < utils.getViewPort().width) {
        if (this.el.StepSwiperSlide.eq(this.lastSlideIdx).hasClass('swiper-slide-active')) {
          this.el.StepSwiperSlide.removeClass('changing');
          this.el.StepSwiperSlide.addClass('changed');
          
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changingend');
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).addClass('changedend');
        }
      } else {
        if (this.el.StepSwiper.swiper.isEnd) {
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changingend');
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).addClass('changedend');
        } else {
          this.el.StepSwiperSlide.removeClass('changing');
          this.el.StepSwiperSlide.addClass('changed');
          
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changedend');
        }
      }
      
      this.setAccessbility();
    }

    slideResetTransitionStart() {
      if (BREAKPOINTS.MOBILE >= utils.getViewPort().width) {
        if (this.el.StepSwiper.swiper.isEnd) {
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).addClass('changingend');
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changedend');
        } else {
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changingend');
          this.el.StepSwiperSlide.eq(this.lastSlideIdx).removeClass('changedend');
        }
      }
    }

    setSlideAria(slide, flag) {
      const $slide = $q(slide);
      if (flag === true) {
        $slide.attr('aria-hidden', true);
      } else {
        $slide.attr('aria-hidden', false);
      }
    }

    setAccessbility() { //slide aria-hidden set
      this.el.StepSwiperSlide.target.forEach((item) => {
        if ($q(item).hasClass('swiper-slide-active') || $q(item).hasClass('swiper-slide-next')) {
          this.setSlideAria(item, false);
        } else {
          this.setSlideAria(item, true);
        }
      });
    }

    bindEvents() {
      this.el.window.off('scroll',this.handler.setFix).on('scroll',this.handler.setFix);
      this.el.window.off('resize',this.handler.resize).on('resize',this.handler.resize);

      this.el.tabBtn.off('click',this.handler.clickTab).on('click',this.handler.clickTab);
      this.el.viewIcon.off('click',this.handler.clickViewIcon).on('click',this.handler.clickViewIcon);
      this.el.selectBtn.off('click',this.handler.clickSelect).on('click',this.handler.clickSelect);
      this.clickSelect();

      this.el.footerBtn.off('click',this.handler.clickFooterBtn).on('click',this.handler.clickFooterBtn);

      this.el.moreBtn.off('click',this.handler.clickMoreBtn).on('click',this.handler.clickMoreBtn);

      if(this.el.swiper.swiper !== undefined){
        this.el.swiper.swiper.off('slideChange',this.handler.slideChange);
        this.el.swiper.swiper.off('touchStart',this.handler.swiperTouchStart);
      }
      this.el.swiper.swiper.on('slideChange',this.handler.slideChange);
      this.el.swiper.swiper.on('touchStart',this.handler.swiperTouchStart);
      this.tabActive();
      requestAnimationFrame(() => {
        this.setMaxHeight();
      });

      this.el.component.find('.option-selector').target.forEach((el) => {
        optionSelector.reInit($q(el));
      });

      this.el.component.find('.option-selector__wrap--capacity').target.forEach((el) => {
        const capaSlideLength = $q(el).find('.option-selector__swiper-slide').target.length;

        if (capaSlideLength === 1) {
          $q(el).addClass('option-selector__wrap--capacity-single');
        }
      });

      this.el.component.find('.pdd16-step-buying__card-option').target.forEach((option) => {
        const $option = $q(option);
        $option.off('mousedown').on('mousedown',this.handler.optionTouchDown);
        $option.off('touchstart').on('touchstart',this.handler.optionTouchDown);
      });

      this.el.closePopupCta.off('click',this.handler.closePopup).on('click',this.handler.closePopup);
      if (this.el.StepSwiper && this.el.StepSwiper.swiper !== undefined) {
        this.el.StepSwiper.swiper.off('slideChangeTransitionEnd', this.handler.slideChangeTransitionEnd).on('slideChangeTransitionEnd', this.handler.slideChangeTransitionEnd);
        this.el.StepSwiper.swiper.off('transitionEnd', this.handler.slideChangeTransitionEnd).on('transitionEnd', this.handler.slideChangeTransitionEnd);
        
        this.el.StepSwiper.swiper.off('slideChangeTransitionStart', this.handler.slideChangeTransitionStart).on('slideChangeTransitionStart', this.handler.slideChangeTransitionStart);
        this.el.StepSwiper.swiper.off('slideResetTransitionStart', this.handler.slideResetTransitionStart).on('slideResetTransitionStart', this.handler.slideResetTransitionStart);

        this.setAccessbility();
      }

      this.el.checkbox.off('change', this.handler.checkedCheckbox).on('change', this.handler.checkedCheckbox);
    }

    checkedCheckbox(){
      const checkbox = this.el.checkbox.target.length;
      const checked = this.el.component.find('.pdd16-step-buying__tnc-checkbox.is-required .checkbox-v2 input[type="checkbox"]:checked').target.length;
      const stepButton = this.el.component.find('.cta--step');
      if (checkbox === checked) {
        stepButton.removeClass('cta--disabled');
        stepButton.removeAttr('disabled');
      } else {
        stepButton.addClass('cta--disabled');
        stepButton.attr('disabled', 'true');
      }
    }

    clearAll(){
      this.el.component.find('.pdd16-step-buying__card > .cta--contained.cta--on:not([disabled])').trigger('click');
    }

    clickMoreBtn(event){
      const $more = $q(event.currentTarget).closest('.pdd16-step-buying__view-more');
      const $wrap = $more.closest('.swiper-slide');
      const $cards = $wrap.find('.pdd16-step-buying__card');
      const $hideCard = $wrap.find('.pdd16-step-buying__card:not(.is-show)');

      $more.css({
        display: 'none',
      });
      $cards.addClass('is-show');

      this.setMaxHeight();
      $hideCard.find('.option-selector').target.forEach((el) => {
        optionSelector.reInit($q(el));
      });
      this.resizeSwiper();

      $cards.eq(5).find('.pdd16-step-buying__tooltip').css({
        'right': '',
        'left': '',
      });
      $cards.eq($cards.target.length - 1).find('.pdd16-step-buying__tooltip').css({
        'right': 0,
        'left': 'auto',
      });
    }

    clickSelect(btn = null , noActive = null){
      if(btn !== null){
        if(noActive === null){
          noActive = !btn.classList.contains('cta--on');
        }
        if (noActive) {
          btn.classList.add('cta--on');
          $q(btn).find('span').innerHTML(btn.dataset.textSelected);
        } else {
          btn.classList.remove('cta--on');
          $q(btn).find('span').innerHTML(btn.dataset.text);
        }
      }
      if (this.el.selectNum.target.length > 0) {
        const selectLenght = this.el.component.find('.pdd16-step-buying__card > .cta--contained.cta--on').target.length;
        this.el.selectNum.text(selectLenght);
      }
    }

    slideChange(){
      this.tabActive();
      requestAnimationFrame(() => {
        this.setMaxHeight();
      });
    }

    clickViewIcon(event){
      const $click = $q(event.currentTarget);
      const $btns = $click.closest('.pdd16-step-buying__list-type').find('a');
      const $content = $click.closest('.swiper-slide');

      $btns.removeClass('on');
      $click.addClass('on');

      if(event.currentTarget.getAttribute('aria-label') === '1column'){
        $content.removeClass('pdd16-step-buying__2column');
        $content.addClass('pdd16-step-buying__1column');
        $content.find('.option-selector__wrap--color-chip').attr('data-mobile-view',5);
        $content.find('.option-selector__wrap--capacity').attr('data-mobile-view',2);
      }else{
        $content.removeClass('pdd16-step-buying__1column');
        $content.addClass('pdd16-step-buying__2column');
        $content.find('.option-selector__wrap--color-chip').attr('data-mobile-view',4);
        $content.find('.option-selector__wrap--capacity').attr('data-mobile-view',1);
      }

      $content.find('.option-selector').target.forEach((el) => {
        optionSelector.reInit($q(el));
      });

      this.setMaxHeight();
      this.resizeSwiper();
    }

    resizeSwiper(){
      $q(this.el.swiper).find('.swiper-container, .swiper-wrapper, .swiper-slide').css({
        height: '',
      });
      [...this.el.component.find('.scrollbar').target].forEach((bar) => {
        scrollbar.resize(bar);
      });
      this.el.swiper.swiper.emit('resize');
    }

    sameHeightPc($cardWrap,selector,getReturn = false){
      let heightAll = 0;
      const $sameEl = $cardWrap.find(selector);

      $sameEl.target.forEach((sameEl) => {
        const height = sameEl.getBoundingClientRect().height;

        if (heightAll < height) {
          heightAll = height;
        }
      });

      if(getReturn){
        return heightAll;
      } else {
        $sameEl.css({
          height: `${heightAll}px`,
        });
      }
    }

    optionOneLinePC($nowSlide) {
      const showing = $nowSlide.find('.pdd16-step-buying__card.is-show');
      let itemMaxCount = 0;
      showing.target.forEach((card) => {
        const count = card.querySelectorAll('.option-selector__wrap--color-chip, .option-selector__wrap--capacity').length;
        if (itemMaxCount < count) {
          itemMaxCount = count;
        }
      });
      if (itemMaxCount < 2) {
        if (showing.find('.option-selector__wrap--color-chip').target.length === 0) {
          $nowSlide.find('.scrollbar__contents').addClass('none-color-chip');
        } else {
          $nowSlide.find('.scrollbar__contents').addClass('single-chip');
        }
      }
    }

    optionOneLineMo(cardLeft, cardRight = null) {
      const optionSel = '.option-selector__wrap--color-chip, .option-selector__wrap--capacity';
      let itemMaxCount = null;
      let pairCards = null;

      if(cardRight === null){//last card
        itemMaxCount = cardLeft.querySelectorAll(optionSel).length;
        pairCards = $q(cardLeft);
      } else {
        const optionLeft = cardLeft.querySelectorAll(optionSel);
        const optionRight = cardRight.querySelectorAll(optionSel);
        itemMaxCount = Math.max(optionLeft.length,optionRight.length);
        pairCards = $q([cardLeft, cardRight]);
      }

      if (itemMaxCount < 2) {
        const isNoColor = pairCards.find('.option-selector__wrap--color-chip').target.length === 0;
        if (isNoColor) {
          pairCards.find('.option-selector').addClass('none-color-chip');
        } else {
          pairCards.find('.option-selector').addClass('single-chip');
        }
      }
    }

    setMaxHeight(){
      let $nowSlide = $q(this.el.swiper).find('.swiper-slide-active');
      if($nowSlide.target.length === 0){
        $nowSlide = this.el.component.find('.pdd16-step-buying__tab').eq(0);
      }

      const selectorCard = '.pdd16-step-buying__card';
      const selectorBadge = '.pdd16-step-buying__card-badge';
      const selectorOption = '.pdd16-step-buying__card-option';
      const selectorSeller = '.pdd16-step-buying__card-seller';
      const selectorTopBadge = '.pdd16-step-buying__card-header-badge';
      const selectorPrice = '.pdd16-step-buying__card-price';
      const selectorCta = '.pdd16-step-buying__card-cta';
      const $swiperEl = $q(this.el.swiper);

      $nowSlide.find(`${selectorCard}, ${selectorBadge}, ${selectorOption}, ${selectorSeller}, ${selectorTopBadge}, ${selectorPrice}, ${selectorCta}, .pdd16-step-buying__view-more`).css({
        height: '',
      });
      $swiperEl.find('.none-color-chip').removeClass('none-color-chip');
      $swiperEl.find('.single-chip').removeClass('single-chip');

      if (this.isPc) {
        this.optionOneLinePC($nowSlide);
        this.sameHeightPc($nowSlide,selectorBadge);
        this.sameHeightPc($nowSlide,selectorOption);
        this.sameHeightPc($nowSlide,selectorSeller);
        this.sameHeightPc($nowSlide,selectorTopBadge);
        this.sameHeightPc($nowSlide,selectorPrice);
        this.sameHeightPc($nowSlide,selectorCta);

        const cardHeight = this.sameHeightPc($nowSlide,selectorCard,true);
        $nowSlide.find('.pdd16-step-buying__view-more').css({
          height: `${cardHeight}px`,
        });
        $nowSlide.find('.pdd16-step-buying__card').css({
          height: `${cardHeight}px`,
        });
      } else {
        if($nowSlide.target[0].classList.contains('pdd16-step-buying__2column') === false){
          return;
        }

        const $cards = $nowSlide.find('.pdd16-step-buying__card.is-show');
        $cards.target.forEach((card, idx) => {
          if (idx % 2 === 0) {
            return;
          }

          const cardLeft = $cards.target[idx - 1];
          const cardRight = card;

          this.optionOneLineMo(cardLeft,cardRight);

          [selectorOption,selectorBadge,selectorSeller,selectorTopBadge,selectorPrice, selectorCard, selectorCta].forEach((sameSel) => { // sameHeight Mobile
            let sameLeft = cardLeft.querySelector(sameSel);
            let sameRight = cardRight.querySelector(sameSel);

            if (sameSel === selectorCard) {
              sameLeft = cardLeft;
              sameRight = cardRight;
            }

            if(sameLeft !== null && sameRight !== null){
              const max = Math.max(sameLeft.getBoundingClientRect().height, sameRight.getBoundingClientRect().height);
              sameLeft.style.height = `${max}px`;
              sameRight.style.height = `${max}px`;
            }
          });
        });

        if(($cards.target.length - 1) % 2 === 0){
          this.optionOneLineMo($cards.target[$cards.target.length - 1],null);
        }
      }
    }

    tabActive(){
      const swiperObj = this.el.swiper.swiper;
      const slideEl = this.el.component.find('.pdd16-step-buying__tab').target;
      if (swiperObj === undefined) {
        this.el.footerBtn.text(this.el.swiper.querySelector('.swiper-slide').dataset.buttonText);
      } else {
        this.el.footerBtn.text(slideEl[swiperObj.activeIndex].dataset.buttonText);
      }
      commonTab.selectTab(this.el.tab.target[0],swiperObj.activeIndex);
    }

    resize(){
      this.winRect = utils.getViewPort();
      this.el.dummyHeaer.css({
        height: `${this.el.component.find('.pdd16-step-buying__header').offset().height}px`,
      });

      const nowWid = BREAKPOINTS.MOBILE < utils.getViewPort().width;

      if(nowWid !== this.isPc){
        this.isPc = nowWid;
        this.setMaxHeight();
        this.resizeSwiper();
      } else {
        this.setMaxHeight();
      }

      if(this.isPc){
        if(this.el.swiper.swiper.allowTouchMove){
          this.el.swiper.swiper.allowTouchMove = false;
          this.offFix();
        }
      }else{
        if(this.el.swiper.swiper.allowTouchMove !== true){
          this.el.swiper.swiper.allowTouchMove = true;
        }

        if (this.el.component.find('.pdd16-step-buying__add-on-list .swiper-slide').target.length === 1) {
          this.el.component.find('.pdd16-step-buying__add-on-list').addClass('is-full');
        }
      }
      const $footer = this.el.component.find('.pdd16-step-buying__footer');
      this.el.dummyFooter.css({
        height: `${$footer.offset().height + parseInt(window.getComputedStyle($footer.target[0]).marginTop)}px`,
      });
      if (this.activeTarget !== null) {
        this.popupResize();
      }

      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
      this.resizeTimer = setTimeout(() => {
        this.resizeSwiper();
      },200);
    }

    offFix(){
      this.el.footer.removeClass('pdd16-step-buying__footer--fixed');
      this.el.component.removeClass('pdd16-step-buying--floating');
    }

    setFix(){
      const off = this.el.component.offset();

      if(this.isPc){
        return;
      }

      if(off.top < 0 && off.bottom > this.winRect.height){
        if(!this.el.component.hasClass('pdd16-step-buying--floating')){
          this.el.component.addClass('pdd16-step-buying--floating');
        }
        if(!this.el.footer.hasClass('pdd16-step-buying__footer--fixed')){
          this.el.footer.addClass('pdd16-step-buying__footer--fixed');
        }
      } else {
        if(this.el.component.hasClass('pdd16-step-buying--floating')){
          this.el.component.removeClass('pdd16-step-buying--floating');
        }
        if(this.el.footer.hasClass('pdd16-step-buying__footer--fixed')){
          this.el.footer.removeClass('pdd16-step-buying__footer--fixed');
        }
      }
    }

    focusLock(e) {
      if (e.keyCode === libs.keyCode.TAB_KEY) {
        let firstEl = null;

        if (this.activeTarget.find('.swiper-slide').target.length > 1) {
          if (this.activeTarget.find('.swiper-button-prev').hasClass('swiper-button-disabled')) {
            firstEl = this.activeTarget.find('.swiper-button-next').target[0];
          } else {
            firstEl = this.activeTarget.find('a, button, input:not([type="hidden"]), textarea').target[0];
          }
        } else {
          firstEl = this.activeTarget.find('a, button:not([tabindex="-1"]), input:not([type="hidden"]), textarea').target[0];
        }

        if (e.shiftKey === false && this.el.closePopupCta.target[0] === document.activeElement) {
          e.preventDefault();
          firstEl.focus();
        } else if (e.shiftKey === true && firstEl === document.activeElement) {
          e.preventDefault();
          this.el.closePopupCta.focus();
        } else if (e.shiftKey === true && this.activeTarget.target[0] === document.activeElement) {
          e.preventDefault();
          this.el.closePopupCta.focus();
        }
      }
    }

    activePopup(focusEl) {
      if (focusEl) {
        this.activeCta = $q(focusEl);
        selector.setFocus = focusEl;
      }

      utils.hiddenScroll();

      this.activeTarget = this.el.popup;
      this.activeTarget.show();
      this.activeTarget.on('keydown', this.handler.focusLock);

      swiperManager.slideUpdate(this.activeTarget.find('.basic-swiper').target[0]);
      swiperManager.slideReInit(this.activeTarget.find('.basic-swiper').target[0]);

      let focusableEl = null;

      if (this.activeTarget.find('.swiper-slide').target.length > 1) {
        focusableEl = this.activeTarget.find('.swiper-button-next').target[0];
      } else {
        this.activeTarget.find('.swiper-button-prev').attr('tabindex', '-1');
        this.activeTarget.find('.swiper-button-next').attr('tabindex', '-1');
        focusableEl = this.activeTarget.find('a, button:not([tabindex="-1"]), input:not([type="hidden"]), textarea').target[0];
      }
      focusableEl.focus();

      if (document.querySelectorAll('[data-aria-hidden]').length <= 0) {
        setMobileFocusLoop(this.activeTarget.target[0]);
      }

      this.popupResize();
    }

    closePopup(){
      utils.visibleScroll();
      if (document.querySelectorAll('[data-aria-hidden]').length > 0) {
        removeMobileFocusLoop();
      }

      if (this.activeCta !== null) {
        this.activeCta.focus();
      }

      this.activeTarget.hide();
      this.activeTarget.off('keydown', this.handler.eventFocusLock);
      $q(this.activeCta).focus();


      this.activeTarget.find('.swiper-button-prev').removeAttr('tabindex');
      this.activeTarget.find('.swiper-button-next').removeAttr('tabindex');

      this.popupResize(false);
      this.activeCta = null;
      this.activeTarget = null;
    }

    popupResize(open = true) {
      const documentHeight = document.documentElement.clientHeight;
      const popupInner = this.activeTarget.find('.layer-popup__inner');
      const popupScroll = this.activeTarget.find('.scrollbar');
      const popupScrollWrap = this.activeTarget.find('.scrollbar__wrap');

      if (open === true) {
        if (!this.isPc) {
          const titleHeight = popupScrollWrap.target[0].getBoundingClientRect();
          const calcHeight = parseInt(documentHeight - titleHeight.top);
          popupInner.css({
            'min-height': '',
          });
          popupScroll.css({
            'height': `${calcHeight}px`,
          });
        } else {
          if (documentHeight <= popupInner.target[0].getBoundingClientRect().height) {
            popupInner.css({
              'min-height': `${documentHeight}px`,
              'height': `${documentHeight}px`,
            });

            const wrapHeight = popupInner.target[0].getBoundingClientRect();
            const titleHeight = popupScrollWrap.target[0].getBoundingClientRect();
            const calcHeight = parseInt(wrapHeight.height - titleHeight.top);

            popupScroll.css({
              'height': `${calcHeight}px`,
            });
          } else {
            popupInner.css({
              'min-height': '',
              'height': '',
            });
            popupScroll.css({
              'height': '',
            });
          }
        }
        setTimeout( () => {
          scrollbar.resize(popupScroll.target[0]);
        }, 300);
      } else {
        popupInner.css({
          'min-height': '',
          'height': '',
        });
        popupScroll.css({
          'height': '',
        });
      }
    }
  }

  // window.sg.components.stepbuying.init({visibleScrollTop: true}); 팝업을 해제 예시) pd03 quick veiw popup이 open된 후 init가 호출될 경우
  const init = (option = {
    visibleScrollTop: true,
  }) => {
    $q(selector.section).target.forEach((element) => {
      $q(element).find('.tab').target.forEach((tb) => {
        commonTab.init(tb);
      });

      if (StepBuying.instances.has(element)) {
        StepBuying.instances.get(element).reInit();
      } else {
        new StepBuying(element);
      }

      $q(element).find('.scrollbar').target.forEach((tb) => {
        scrollbar.reInit(tb);
      });
    });

    if (option.visibleScrollTop) {
      utils.visibleScroll();
      window.scrollTo(0, 0);
    }
  };
  /**
  //  @param       : focus element(value of id attribute)
  //  @description : set focus when closed Popup.
  //  @example : window.sg.components.stepbuying.activePopup(document.querySelector('#id'))
  **/
  const activePopup = (focusEl) => {
    $q(selector.section).target.forEach((element) => {
      if (StepBuying.instances.has(element)) {
        const instances =  StepBuying.instances.get(element);
        instances.activePopup(focusEl);
      }
    });
  };

  function closePopup() {
    $q(selector.section).target.forEach((element) => {
      if (StepBuying.instances.has(element)) {
        const instances =  StepBuying.instances.get(element);
        instances.closePopup();
      }
    });
  }


  StepBuying.instances = new WeakMap();

  $q.ready(init);

  window.sg.components.stepbuying = {
    init,
    clearAll(element){
      if (StepBuying.instances.has(element)) {
        StepBuying.instances.get(element).clearAll();
      }
    },
    cardSelect(btn,active = null){
      const section = $q(btn).closest(selector.section).target[0];
      if (StepBuying.instances.has(section)) {
        StepBuying.instances.get(section).clickSelect(btn,active);
      }
    },
    activePopup,
    closePopup,
  };
})();

(function (win, $) {
	const siteCode = $("#siteCode").val();
	const pageTrack = (digitalData.page.pageInfo.pageTrack || "").toLowerCase();
	const isSENA = (siteCode === "se" || siteCode === "dk" || siteCode === "fi" || siteCode === "no");
	const isHybris = $("#shopIntegrationFlag").val() === "Hybris";
	const isHybrisIntg = $("#shopIntegrationFlag").val() === "Hybris-intg";
	const isOldHybris = isHybris || isHybrisIntg;
	const isNewHybris = $("#shopIntegrationFlag").val() === "Hybris-new";
	const isGlobal = !isHybris && !isHybrisIntg && !isNewHybris;
	const categoryTypeCode = $("#pfCategoryTypeCode").val();

	let lowestWasPriceCountry = ( siteCode === 'pl' || siteCode === 'si' || siteCode === 'gr' || siteCode === 'fi' || siteCode === 'it' || siteCode === 'se' || siteCode === 'no' || siteCode === 'dk' || siteCode === 'fr') ? true : false;

	// [EPP] epp 관련 변수
	const isEppSite = checkEppSite();
	if(isEppSite && win.sg.epp == null){
		win.sg.epp={};
		win.sg.epp.common ={};
	}
	const apiSiteInfo = isEppSite ? "epp/v2" : "b2c";
	const eppCompanyCode = isEppSite ? win.sg.epp.common.companyCode : "";
	const eppIsUserGroupPricing = isEppSite ? window.sg.epp.common.isUserGroupPricing : false;
	const eppUserGroupName = eppIsUserGroupPricing ? window.sg.epp.common.groupName : "";
	// epp omnipricing
	if ( isEppSite ){
		if ( $('#pfEppOmniPricingUseYn').val() === "Y" ){
			lowestWasPriceCountry = true;
		} else {
			lowestWasPriceCountry = false;
		}
	}
	
	let isPopupCTA = false;
	let clickModelCode = '';
	let clickModelPriceText = '';
	let clickModelPrice = '';
	let currency = '';
	let cartUrl = '';
	let hasAddon = false;
	let categoryIdx = '';
	let selectIndexList = new Array();
	let selectProductList = new Array();
	let selectProductImgList = new Array();
	let productListData = new Array();
	let monthlyCheckedFlag = false;
	
	// bundle
	let hasBundle = false;
	let bundleCnt = 0;
	let bundleData = '';
	let bundleIdx = 0;
	let bundleCategoryName = '';
	let relatedProductsBundleTotal = new Array();
	let selectedBundlePopupData = {};
	let productBundleListData = '';
	
	// voucher
	let hasVoucher = false;
	let voucherdataHybris = '';
	let originPrice = 0;
	let savePrice = 0;
	
	// gift
	let showGift = false;
	let hasGift = false;
	let giftdataHybris = '';
	let relatedProductsGiftTotal = new Array();
	let selectGift = '';
	
	// add 전 가격, combo message
	let vdAddonInitPriceHtml = '';
	let vdComboData = '';
 
	// COMP6FE-1599 [EPP] SEPOL MSRP Price 추가건 : 취소선 제외
	const eppPl = isEppSite && siteCode === "pl" ? true : false;

	const localConfig = {
		es : {
			useVATInclusiveArea : false
		},
		ca : {
			useVATInclusiveArea : false
		},
		ca_fr : {
			useVATInclusiveArea : false
		},
		it : {
			useGiftContinueI18nForAllCTA : true,
			useTnc : true,
			useTncFromAPI : true,
			tncAPIContext : 'FOC',
			useTncOnAddOn : false
		},
		nl : {
			useStaticTitle : categoryTypeCode == '04010000',
			useStaticSubTitle : categoryTypeCode == '04010000'
		},
		be : {
			useStaticTitle : categoryTypeCode == '04010000',
			useStaticSubTitle : categoryTypeCode == '04010000',
		},
		be_fr : {
			useStaticTitle : categoryTypeCode == '04010000',
			useStaticSubTitle : categoryTypeCode == '04010000'
		},
		id : {
			useAddOnNextI18n : true
		},
		default : { // default 값이 true 인 경우 여기에 세팅
			useVATInclusiveArea : true
		}
	}

	const localConfigurator = ((siteCode, config)=>{
		
		let site_cfg = config[siteCode];
		let default_cfg = config["default"];

		/**
		 * option key 항목이 있을 경우 해당 옵션 값을 반환
		 * 그 외에는 false 반환
		 */
		function getConfigProperty(optionKey){

			if(site_cfg && typeof site_cfg[optionKey] !== "undefined"){
				return site_cfg[optionKey];
			}else{
				if(default_cfg && typeof default_cfg[optionKey] !== "undefined"){
					return default_cfg[optionKey]
				}else{
					return false;
				}
			}
		}

		return {
			get : getConfigProperty
		}

	})(siteCode, localConfig);
	
	function callOldHybrisAjax(){
		const storeDomain = $("#storeDomain").val();
		const hybrisJsonYn = $("#hybrisApiJson").val();
		let multiSiteCode = getMultiSiteCode();
		const isSECA = (multiSiteCode === 'ca' || multiSiteCode === 'ca_fr'); 
		
		if(isEppSite){
			multiSiteCode = eppCompanyCode;
		}
		const simpleInfoURL = `${storeDomain}/${multiSiteCode}/servicesv2/getSimpleProductsInfo?productCodes=${clickModelCode}`;
		if(hybrisJsonYn === 'Y') {
			$.ajax({
				url: simpleInfoURL,
				type: "GET",
				dataType: 'json',
				cache:true,
				crossDomain : true,
				timeout : 10000,
				xhrFields: {withCredentials: true},
				success: function( data, responseText, jqXHR ){
					if( jqXHR.status === 200 ){
						if( data && data.productDatas && data.productDatas.length > 0 ){
							const aemAdditionalInfoTypes = data.productDatas[0].aemAdditionalInfoTypes;
							if( aemAdditionalInfoTypes ){
								aemAdditionalInfoTypes.forEach(function(elem){
									const type = elem.type ? elem.type.toLowerCase() : '';
									if( type === 'voucher' ){
										voucherdataHybris = elem.aemAdditionalInfos;
										hasVoucher = true;
										
									}else if( type === 'gift' ){
										giftdataHybris = elem.aemAdditionalInfos;
										hasGift = true;
										callRelatedAjaxOld(clickModelCode);
										
									}else if( type === 'vdcombomessage'){
										vdComboData = elem.aemAdditionalInfos;
									}
								});
							}
							callCategorizedAjaxOld();
							productPriceGrid();
						}else{
							addToCart(true, true);
						} 
					}else{
						addToCart(true, true);
					}
				},
				error: function(){
					addToCart(true, true);
				},
				complete: function(){
				} 
			});
		} else {
			if(isSECA){
				$.ajax({
					url: simpleInfoURL,
					type: "GET",
					dataType: 'jsonp',
					cache:true,
					crossDomain : true,
					timeout : 10000,
					xhrFields: {withCredentials: true},
					success: function( data, responseText, jqXHR ){
						if( jqXHR.status === 200 ){
							if( data && data.productDatas && data.productDatas.length > 0 ){
								const aemAdditionalInfoTypes = data.productDatas[0].aemAdditionalInfoTypes;
								if( aemAdditionalInfoTypes ){
									aemAdditionalInfoTypes.forEach(function(elem){
										const type = elem.type ? elem.type.toLowerCase() : '';
										if( type === 'voucher' ){
											voucherdataHybris = elem.aemAdditionalInfos;
											hasVoucher = true;
											
										}else if( type === 'gift' ){
											giftdataHybris = elem.aemAdditionalInfos;
											hasGift = true;
											callRelatedAjaxOld(clickModelCode);
											
										}else if( type === 'vdcombomessage'){
											vdComboData = elem.aemAdditionalInfos;
										}
									});
								}
								callCategorizedAjaxOld();
								productPriceGrid();
							}else{
								addToCart(true, true);
							}
						}else{
							addToCart(true, true);
						}
					},
					error: function(){
						addToCart(true, true);
					},
					complete: function(){
					}
				});
			}else{
				$.ajax({
					url: simpleInfoURL,
					type: "GET",
					dataType: 'jsonp',
					jsonpCallback:"jQuery1910499421933433041_" + "111",
					cache:true,
					crossDomain : true,
					timeout : 10000,
					xhrFields: {withCredentials: true},
					success: function( data, responseText, jqXHR ){
						if( jqXHR.status === 200 ){
							if( data && data.productDatas && data.productDatas.length > 0 ){
								const aemAdditionalInfoTypes = data.productDatas[0].aemAdditionalInfoTypes;
								if( aemAdditionalInfoTypes ){
									aemAdditionalInfoTypes.forEach(function(elem){
										const type = elem.type ? elem.type.toLowerCase() : '';
										if( type === 'voucher' ){
											voucherdataHybris = elem.aemAdditionalInfos;
											hasVoucher = true;
											
										}else if( type === 'gift' ){
											giftdataHybris = elem.aemAdditionalInfos;
											hasGift = true;
											callRelatedAjaxOld(clickModelCode);
											
										}else if( type === 'vdcombomessage'){
											vdComboData = elem.aemAdditionalInfos;
										}
									});
								}
								callCategorizedAjaxOld();
								productPriceGrid();
							}else{
								addToCart(true, true);
							}
						}else{
							addToCart(true, true);
						}
					},
					error: function(){
						addToCart(true, true);
					},
					complete: function(){
					}
				});
			}
		}
	}
	
	function callNewHybrisAjax(){
		const storeDomain = $("#storeDomain").val();
		let multiSiteCode = getMultiSiteCode();
		
		if(isEppSite){
			multiSiteCode = eppCompanyCode;
		}
		const simpleInfoURL = `${storeDomain}/tokocommercewebservices/v2/${multiSiteCode}/products/${clickModelCode}/**?fields=SIMPLE_INFO`;
		$.ajax({
			url: simpleInfoURL,
			type: 'GET',
			cache: true,
			crossDomain: true,
			dataType: 'json',
			timeout: 20000,
			success: function( data, responseText, jqXHR ){
				if( jqXHR.status === 200 ){
					if( data && data.code ){
						if( data.supportedAvailableServices && data.supportedAvailableServices.length > 0 ){
							if(  data.supportedAvailableServices.indexOf('ACCESSORIES') > -1 ){
								hasAddon = true;
							}
							const aemAdditionalInfoTypes = data.aemAdditionalInfoTypes;
							if( aemAdditionalInfoTypes && aemAdditionalInfoTypes.length > 0 ){
								aemAdditionalInfoTypes.forEach(function(elem){
									const type = elem.type ? elem.type.toLowerCase() : '';
									if( type === 'voucher' ){
										voucherdataHybris = elem.aemAdditionalInfos;
										hasVoucher = true;
										
									} else if( type === 'gift' ){
										giftdataHybris = elem.aemAdditionalInfos;
										hasGift = true;
										callRelatedAjaxNew(clickModelCode);
										
									}else if( type === 'vdcombomessage' ){
										vdComboData = elem.aemAdditionalInfos;
									}
								});
							}
							if( !hasGift && hasAddon ){
								callCategorizedAjaxNew();
								productPriceGrid();
							}else if( !hasGift && !hasAddon ){
								addToCart(true, true);
							}
						}else{
							addToCart(true, true);
						}
					}else{
						addToCart(true, true);
					}
				}else{
					addToCart(true, true);
				}
			},
			error: function(){
				addToCart(true, true);
			},
			complete: function(){
			} 
		});
	}
	
	function callCategorizedAjaxOld(){
		const storeDomain = $("#storeDomain").val();
		const hybrisJsonYn = $("#hybrisApiJson").val();
		let multiSiteCode = getMultiSiteCode();
		
		if(isEppSite){
			multiSiteCode = eppCompanyCode;
		}
		const relatedURL = `${storeDomain}/${multiSiteCode}/servicesv2/getRelatedCategorizedProductsSimpleInfo?productCode=${clickModelCode}`
		if(hybrisJsonYn === 'Y') {
			$.ajax({
				url: relatedURL,
				type: "GET",
				dataType: "json",
				cache: true,  
				crossDomain: true,
				timeout: 10000,
				xhrFields: {withCredentials: true},
				success: function (data) {
					if( data && data.length > 0 ){
						data = data.filter(function(elem){
							if(elem.products[0].modelcode.substring(0,2) !== 'F-'){
								return elem;
							}
						});
						if( data.length > 0 ){
							getCategorizedAjax(data);
							hasAddon = true;
						}else if( !hasGift ){
							addToCart(true, true);
						}
					}else if( !hasGift ){
						addToCart(true, true);
					}
				},
				error: function(){
					if( !hasGift ){
						addToCart(true, true);
					}
				},
				complete: function(){
				}
			});
		} else {
			$.ajax({
				url: relatedURL,
				type: "GET",
				dataType: 'jsonp',
				jsonpCallback:"Query1910499421933433041_161",
				cache: true,  
				crossDomain: true,
				timeout: 10000,
				xhrFields: {withCredentials: true},
				success: function (data) {
					if( data && data.length > 0 ){
						data = data.filter(function(elem){
							if(elem.products[0].modelcode.substring(0,2) !== 'F-'){
								return elem;
							}
						});
						if( data.length > 0 ){
							getCategorizedAjax(data);
							hasAddon = true;
						}else if( !hasGift ){
							addToCart(true, true);
						}
					}else if( !hasGift ){
						addToCart(true, true);
					}
				},
				error: function(){
					if( !hasGift ){
						addToCart(true, true);
					}
				},
				complete: function(){
				}
			});
		}
	}
	
	function callCategorizedAjaxNew(){
		const storeDomain = $("#storeDomain").val();
		let multiSiteCode = getMultiSiteCode();
		
		if(isEppSite){
			multiSiteCode = eppCompanyCode;
		}
		const relatedURL = `${storeDomain}/tokocommercewebservices/v2/${multiSiteCode}/products/${clickModelCode}/relatedCategorizedProducts?fields=SIMPLE_INFO&queryType=ACCESSORIES&categoryPrefix=AEM_`
		const param = {
			"queryType": "ACCESSORIES"
		};
		
		$.ajax({
			url: relatedURL,
			type: "GET",
			dataType: "json",
			cache: true,  
			crossDomain: true,
			timeout: 10000,
			success: function (data) {
				if( data && data.length > 0 ){
					getCategorizedAjax(data);
					productPriceGrid();
				}else{
					if( hasGift ){
						hasAddon = false;
						addToCart(false, true, selectGift);
					}else{
						addToCart(true, true);
					}
				}
			},
			error: function(){
				addToCart(true, true);
			},
			complete: function(){
			}
		});
	}
	
	function getCategorizedAjax( data ){
		let relatedProducts = {};
		const totalRelatedProducts = data;
		let i = 0;
		for( const product of data ){
			if( product.products && product.products.length > 0 ){
				$.each(product.products, function (idx, obj) {
					const modelCode = obj.modelcode;
					const product = relatedProducts[modelCode] = {};
					product.modelCode = modelCode;
					product.modelcode = modelCode;
					product.name = obj.name;
					
					getCategorizedAndRelatedData(product, obj);
					if(isBundleCode(obj.modelcode)){
						bundleCategoryName = data[i].category.display_name;
						$.extend(obj, i);
						bundleIdx = i;
						data[i].products[bundleCnt] = product;
						bundleData = data[i];
						hasBundle = true;
						if( isOldHybris ){
							callRelatedAjaxOld(obj.modelcode, true);
						}else if( isNewHybris ){
							callRelatedAjaxNew(obj.modelcode, true);
						}
						bundleCnt++;
					}
				});
			}else{
				addToCart(true, true);
			}
			i++;
		}
		const modelCodeList = Object.keys(relatedProducts);
		if( modelCodeList && modelCodeList.length > 0 ){
			callSearchAjax(relatedProducts, totalRelatedProducts);
		}
	}
	
	function isBundleCode( modelCode ){
		if( !modelCode ){
			return false;
		}
		return modelCode.substring(0,2) === 'F-';
	}
	
	function callSearchAjax( relatedProducts, totalRelatedProducts, isGift ){
		const searchDomain = $("#searchDomain").val();
		const stage = $("#apiStageInfo").val();
		let urlType = '';
		if( isHybrisIntg ){
			urlType = 'hybris';
		} else if( isNewHybris ){
			urlType = 'newhybris';
		} else {
			urlType = 'global';
		}
		const multiSiteCode = getMultiSiteCode();
		const isMultiSiteCode = multiSiteCode !== siteCode;
		const modelCodeList = Object.keys(relatedProducts);
		const searchURL = `${searchDomain}/${stage}/${apiSiteInfo}/product/card/detail/${urlType}`;
		let param = {
			'siteCode': siteCode,
			'modelList': modelCodeList.join(','),
			'saleSkuYN': 'N',
			'onlyRequestSkuYN': 'Y',
			'commonCodeYN': 'N',
			'vd3PACardYN': 'Y'
		};
		if( isMultiSiteCode ){
			param.shopSiteCode = multiSiteCode;
		}
		if(isEppSite){
			param['companyCode'] = eppCompanyCode;
			if(eppIsUserGroupPricing){
				param['groupName'] = eppUserGroupName;
			}
			//[24.02.27][EPP][CN][O2O] : o2oId 파라미터 추가
			if(window.sg.epp.common.userStoreId != ""){
				param['o2oId'] = window.sg.epp.common.userStoreId;
			}			
		}
		//only SECA 
		let dotcom_countryRegion = $.cookies.get("country_region") ? $.cookies.get("country_region").toString() : '';
		let regionCode = ''; // default CA-ON
		if(siteCode === "ca" || siteCode ==="ca_fr"){
			if(isNotEmpty(dotcom_countryRegion)) {
				regionCode = dotcom_countryRegion;
			} else {
				regionCode = 'CA-ON'; // default CA-ON
			}
			param['regionCode'] = regionCode;
		}
		
		$.ajax({
			url: searchURL,
			type: "GET",
			data: param,
			dataType: "json",
			cache: true,
			crossDomain: true,
			timeout: 10000,
			success: function( data ){
				if( data && data.response.statusCode === 200 ){
					const resultData = data.response.resultData;
					if( resultData && resultData.productList && resultData.productList.length > 0 ){
						getSearchAjax(resultData.productList, relatedProducts, totalRelatedProducts, isGift);
					}else{
						addToCart(true, true);
					}
				}else{
					addToCart(true, true);
				}
			},
			error: function(){
				addToCart(true, true);
			},
			complete: function(){
			}
		});
	}
	
	function getSearchAjax( data, relatedProducts, totalRelatedProducts, isGift ){
		if( !isGift ){
			$.each(relatedProducts, function(i,value){
				$.each(data, function (familyIdx, product){
					const modelList = product.modelList;
					if( modelList && modelList.length > 0 ){
						$.each(modelList, function(modelIdx, model){
							const modelCode = model.modelCode;
							const stocklevel = relatedProducts[modelCode].stocklevel || "";
							if ( !relatedProducts[modelCode] ){
								return;
							}
							if( !model.displayName ){
								model.displayName = relatedProducts[modelCode].name || "";
							}
							model.thumbUrlAlt = relatedProducts[modelCode].imageUrlAlt || "";
							model.priceDisplay = relatedProducts[modelCode].price || "";
							model.promotionPriceDisplay = relatedProducts[modelCode].promotionPrice || "";
							model.price = relatedProducts[modelCode].priceValue || "";
							model.promotionPrice = relatedProducts[modelCode].promotionPriceValue || "";
							model.stocklevel = stocklevel;
							model.isStock = !(stocklevel === "" || stocklevel.toUpperCase() === "OUTOFSTOCK");
							model.idx = String(familyIdx) + '-' + String(modelIdx) // familyNum - modelNum
							model.commercialFlag = relatedProducts[modelCode].commercialFlag || "";
							model.referenceColor = relatedProducts[modelCode].referenceColor || "";
						});
					}
				});
			});
			
			newData = {};
			let number = 0;
			let categoryData = {};
			let productListDatas = new Array();
			let familyIdx = new Array();
			$.each(totalRelatedProducts, function(idx,value){
				const totalProducts = value.products;
				$.each(totalProducts, function(i,value1){
					$.each(data, function(j,value2){
						const productCode = value2.modelList;
						$.each(productCode,function(k,value3){
							if( value1.modelcode === value3.modelCode ){
								const inputData = newObjectSetting(value2);
								if( familyIdx.indexOf(inputData.familyId) < 0 ){
									productListDatas.push(inputData)
									familyIdx.push(inputData.familyId);
								}
								categoryData = {
										category : {
												display_name : value.category.display_name,
												id : value.category.id,
												order : value.category.order,
												productList : productListDatas,
												key : number
										}
								}
								newData[number] = categoryData;
								return;
							}
						});
					});
				});
				familyIdx = new Array();
				productListDatas = new Array();
				number++;
			});
			number = 0;
			
			if( !newData[bundleIdx] && hasBundle ){
				newData[bundleIdx] = {
					category: {
						'display_name': bundleData.category.display_name,
						'id': bundleData.category.id,
						'key': bundleIdx,
						'order': bundleData.category.order,
						'productList': bundleData.products
					}
				}
			}
			
			const keys = Object.keys(newData);
			for( const element of keys ){
				newData[number] = newData[element];
				newData[number].category.id = number;
				number++;
			}
			const productData = [];
			for( const i in newData ){
				productData.push(newData[i]);
			}
			productData.sort((a,b) => a.category.order - b.category.order);
			
			$.each(productData, function(k,v){
				const products = v.category.productList;
				$.each(products, function(k1,v1){
					const lastmodel = products[k1].modelList;
					$.each(lastmodel, function(k2,v2){
							v2.idx = k1 + '-' + v2.idx.split('-')[1];
					})
				})
			});
			if( !showGift ){
				showAddonArea(productData, isGift);
			}
		}else{
			$.each(data, function (familyIdx, product) {
				var modelList = product.modelList;
				if (modelList != null) {
					$.each(modelList, function (modelIdx, model) {
						var modelCode = model.modelCode;
						if (!relatedProducts[modelCode]) {
							return;
						}
						var stocklevel = relatedProducts[modelCode].stocklevel;

						if (!model.displayName) {
							model.displayName = relatedProducts[modelCode].name || "";
						}
						model.thumbUrlAlt = relatedProducts[modelCode].imageUrlAlt || "";
						model.priceDisplay = relatedProducts[modelCode].price || "";
						model.promotionPriceDisplay = relatedProducts[modelCode].promotionPrice || "";
						model.price = relatedProducts[modelCode].priceValue || "";
						model.promotionPrice = relatedProducts[modelCode].promotionPriceValue || "";
						model.stocklevel = stocklevel;
						model.isStock = !(stocklevel === "" || stocklevel.toUpperCase() === "OUTOFSTOCK");
						model.idx = String(familyIdx) + '-' + String(modelIdx); // familyNum - modelNum
					});
				}
			});
			showAddonArea(data, isGift);
			showGift = true;
		}
	}
	
	// old hybris
	function callRelatedAjaxOld( modelCode, isBundle ){
		const storeDomain = $("#storeDomain").val();
		const hybrisJsonYn = $("#hybrisApiJson").val();
		let multiSiteCode = getMultiSiteCode();
		if(isEppSite){
			multiSiteCode = eppCompanyCode;
		}
		const relatedProductsUrl = `${storeDomain}/${multiSiteCode}/servicesv2/getRelatedProductsSimpleInfo?productCode=${modelCode}`;
		const queryType = isBundle ? 'SELECTION_OF_BUNDLE' : 'SELECTION_OF_GIFT';
		const param = {
			"queryType": queryType
		};
		if(hybrisJsonYn === 'Y') {
			$.ajax({
				url: relatedProductsUrl,
				type: "GET",
				async : (isEppSite && !isBundle) ? false : true,
				data: param,
				dataType: "json",
				cache: true,
				crossDomain: true,
				timeout: 10000,
				xhrFields: {withCredentials: true},
				success: function (data) {
					if( data ){
						if( data.products && data.products.length > 0 ){
							getRelatedAjax(data.products, modelCode, isBundle);
						} else {
							//&EPPONLY : 데이터 없을 경우 예외처리
							if ( isEppSite ){
								if( isBundle ){ 
									hasAddon = false;
								}else{
									hasGift = false;
								}
							}
						}
					} else {
						//&EPPONLY : 데이터 없을 경우 예외처리
						if ( isEppSite ){
							if( isBundle ){ 
								hasAddon = false;
							}else{
								hasGift = false;
							}
						}
					}
				},
				complete : function (){
				}
			});
		} else {
			$.ajax({
				url: relatedProductsUrl,
				type: "GET",
				async : (isEppSite && !isBundle) ? false : true,
				data: param,
				dataType: 'jsonp',
				jsonpCallback:"Query1910499421933433041_151",
				cache: true,
				crossDomain: true,
				timeout: 10000,
				xhrFields: {withCredentials: true},
				success: function (data) {
					if( data ){
						if( data.products && data.products.length > 0 ){
							getRelatedAjax(data.products, modelCode, isBundle);
						} else {
							//&EPPONLY : 데이터 없을 경우 예외처리
							if ( isEppSite ){
								if( isBundle ){ 
									hasAddon = false;
								}else{
									hasGift = false;
								}
							}						
						}
					} else {
						//&EPPONLY : 데이터 없을 경우 예외처리
						if ( isEppSite ){
							if( isBundle ){ 
								hasAddon = false;
							}else{
								hasGift = false;
							}
						}
					}
				},
				complete : function (){
				}
			});
		}
	}
	
	// new hybris
	function callRelatedAjaxNew( modelCode, isBundle ){
		const storeDomain = $("#storeDomain").val();
		let multiSiteCode = getMultiSiteCode();
		if(isEppSite){
			multiSiteCode = eppCompanyCode;
		}
		const queryType = isBundle ? 'SELECTION_OF_BUNDLE' : 'SELECTION_OF_GIFT';
		const relatedProductsUrl = `${storeDomain}/tokocommercewebservices/v2/${multiSiteCode}/products/${modelCode}/relatedProducts?fields=SIMPLE_INFO&queryType=${queryType}`;
		$.ajax({
			url: relatedProductsUrl,
			type: "GET",
			async : (isEppSite && !isBundle) ? false : true,
			dataType: "json",
			cache: true,  
			crossDomain: true,
			timeout: 10000,
			success: function (data) {
				if( data ){
					if( data.products && data.products.length > 0 ){
						getRelatedAjax(data.products, modelCode, isBundle);
					} else {
						//&EPPONLY : 데이터 없을 경우 예외처리
						if ( isEppSite ){
							if( isBundle ){ 
								hasAddon = false;
							}else{
								hasGift = false;
							}
						}						
					}
				} else {
					//&EPPONLY : 데이터 없을 경우 예외처리
					if ( isEppSite ){
						if( isBundle ){ 
							hasAddon = false;
						}else{
							hasGift = false;
						}
					}					
				}
			},
			complete : function (){
			}
		});
	}
	
	function getRelatedAjax( data, modelCode, isBundle ){
		if( isBundle ){
			let relatedProductsBundle = {};
			relatedProductsBundle.bundleModelCode = modelCode;
			$.each(data, function (idx, obj) {
				var modelCode = obj.modelcode;
				var product = relatedProductsBundle[modelCode] = {};
				product.modelCode = modelCode;
				product.name = obj.name;
				
				getCategorizedAndRelatedData(product, obj);
				
				if( obj.colorCode ){
					product.colorCode = obj.colorCode;
				}
			});
			relatedProductsBundleTotal.push(relatedProductsBundle);
			
		}else{
			let relatedProducts = {};
			$.each(data, function (idx, obj) {
				const stock = obj.stock && obj.stock.stockLevelStatus || obj.stocklevel;
				if (stock) {
					const modelCode = obj.modelcode;
					const product = relatedProducts[modelCode] = {};
					product.modelCode = modelCode;
					product.name = obj.name;
					product.stocklevel = stock;
					if (obj.picture && obj.picture.url) {
						product.imageUrl = obj.picture.url;
					}
					if (obj.price && obj.price.value) {
						product.priceValue = obj.price.value;
						product.price = obj.price.formattedValue;
					}
				}
			});
			callSearchAjax(relatedProducts, '', true);
		}
	}
	
	function getCategorizedAndRelatedData(product, obj){
		if( isOldHybris ){
			if (obj.imageUrl) {
				product.imageUrl = obj.imageUrl;
			}
			if (obj.imageUrlAlt) {
				product.imageUrlAlt = obj.imageUrlAlt;
			}
			if (obj.stocklevel) {
				product.stocklevel = obj.stocklevel;
			}
			if (obj.price && obj.priceValue) {
				product.priceValue = obj.priceValue;
				product.price = obj.price;
				product.promotionPriceValue = obj.priceValue;
				product.promotionPrice = obj.price;
			}
			if (obj.promotionPrice && obj.promotionPriceValue) {
				product.promotionPriceValue = obj.promotionPriceValue;
				product.promotionPrice = obj.promotionPrice;
			}
			if(obj.commercialFlag){
				product.commercialFlag = obj.commercialFlag;
			}
			if(obj.referenceColor){
				product.referenceColor = obj.referenceColor;
			}
		}else if( isNewHybris ){
			if (obj.picture) {
				product.imageUrl = obj.picture.url;
				product.imageUrlAlt = obj.picture.altText;
			}
			if (obj.stock) {
				product.stocklevel = obj.stock.stockLevelStatus;
			}
			if (obj.price && obj.price.value) {
				product.priceValue = obj.price.value;
				product.price = obj.price.formattedValue;
				product.promotionPriceValue = obj.price.value;
				product.promotionPrice = obj.price.formattedValue;
			}
			if (obj.promotionPrice && obj.promotionPrice.value) {
				product.promotionPriceValue = obj.promotionPrice.value;
				product.promotionPrice = obj.promotionPrice.formattedValue;
			}
			if(obj.commercialFlag){
				product.commercialFlag = obj.commercialFlag;
			}
			if(obj.referenceColor){
				product.referenceColor = obj.referenceColor;
			}
		}
		if((obj.groupCode && obj.groupId == 0 ) || ( obj.groupCode && obj.groupId != 0 )){
			product.groupCode = obj.groupCode;
			product.groupId = obj.groupId;
		}
		return product;
	}
	
	function callSimulatecartAjax( productCodes, monthPrice ) {
		let storeDomain = '';
		const siteCodeWithEpp = isEppSite ? eppCompanyCode : siteCode;
		const isOldHybrisCheckService = $("#shopIntegrationFlag").val() === 'Hybris-intg' || $("#shopIntegrationFlag").val() === 'Hybris'; //[COMP6FE-1507] Hybris API 사용 국가 중 service 확인하는 국가. 추후 모든 hybris국가 변경 예정
		if( isOldHybrisCheckService && $("#newHyvStoreDomain").val() ){
			storeDomain = $("#newHyvStoreDomain").val();
		} else {
			storeDomain = $("#storeDomain").val();
		}
		
		let shopSiteCode = siteCode;
		if( !isEppSite ){
			if (siteCode === "levant") {
				shopSiteCode = "jo";
			} else if (siteCode === "levant_ar") {
				shopSiteCode = "jo_ar";
			} else if (siteCode === "n_africa") {
				shopSiteCode = "ma";
			}
		}else{
			shopSiteCode = siteCodeWithEpp;
		}
		
		const simulatecartUrl = `${storeDomain}/tokocommercewebservices/v2/${shopSiteCode}/userData/anonymous/simulatecart`;
		const param = {
				"productCodes": productCodes
			};
		const _xhrFields = isEppSite ? { withCredentials: true } : {};
		let result = '';
		let isSuccess = false;

		$.ajax({
			url: simulatecartUrl,
			type: "GET",
			data: param,
			dataType: "json",
			cache: true,
			crossDomain: true,
			timeout: 10000,
			xhrFields: _xhrFields,
			success: function (data) {
				if( data ){
					if( data.subTotal && data.totalDiscounts && data.totalPrice ){
						const fromI18n = Granite.I18n.get("From");
						const orI18n = Granite.I18n.get("or");
						const beforePrice = data.subTotal.formattedValue; // 전체 할인 전 가격
						const savePrice = data.totalDiscounts.formattedValue; // 전체 할인 된 가격
						const salePrice = data.totalPrice.formattedValue; // 전체 할인 후 가격
						const unformattedSalePrice = data.totalPrice.value;
						priceHtml = `
							<div class="pdd16-step-buying__header-price-text">`;
						if( monthlyCheckedFlag ){
							priceHtml += `<strong>${fromI18n} ${monthPrice[0].replace(fromI18n, "")}<br>
										${orI18n} ${salePrice}</strong>`;
						}else{
							priceHtml += `<strong>${salePrice}</strong>`;
						}
						// COMP6FE-1599 [EPP] SEPOL MSRP Price 추가건 : 취소선 제외
						if ( !eppPl && !lowestWasPriceCountry ){
							priceHtml += `	<div class="pdd16-step-buying__header-price-save">
											<del class="was-text" data-orignal-price=${beforePrice}>${beforePrice}</del>
										<span class="sale-text" data-save-price=${savePrice}>${Granite.I18n.get("Save {0}", savePrice)}</span>
										</div>
									</div>`;
						} else {
							priceHtml += `</div>`;
						}
						priceHtml += `<input type="hidden" class="hiddenPrice" value="${unformattedSalePrice}">`;
					}
					$(".pdd16-step-buying__header-price").html(priceHtml);
				}
			},
			complete : function (){
			}
		});
	}
	
	function productInfoGrid( desktopSrc, mobileSrc, imgAlt, displayName ){
		const imgHtml = `
			<img class="image__preview lazy-load responsive-img" data-desktop-src="${desktopSrc}?$240_240_PNG$" data-mobile-src="${mobileSrc}?$240_240_PNG$" alt="${imgAlt}">
			<img class="image__main lazy-load responsive-img" data-desktop-src="${desktopSrc}?$240_240_PNG$" data-mobile-src="${mobileSrc}?$240_240_PNG$" alt="${imgAlt}">`;
		$('.pdd16-step-buying .pdd16-step-buying__header-title .image').html(imgHtml);
		$('.pdd16-step-buying .pdd16-step-buying__header-text strong').html(displayName.replace(/\\/g, ''));
		$('.pdd16-step-buying .pdd16-step-buying__header-text .pdd16-step-buying__tooltip').html(displayName.replace(/\\/g, ''));
	}
	
	function productPriceGrid(){
		const fromI18n = Granite.I18n.get("From");
		const orI18n = Granite.I18n.get("or");
		const monthly18n = Granite.I18n.get("Monthly Price") + ":";
		const totalPrice = clickModelPriceText || "";
		const MonthlyPrice = totalPrice.split(" " + orI18n + " ");
		const productPrice = clickModelPrice;
		const orignalPrice = clickModelOriginalPrice;
		const savePrice = clickModelSavePrice;
		const orignalPriceFormatted = clickModelSavePrice > 0 ? currencyComma(orignalPrice, currency) : '';
		const savePriceFormatted = clickModelSavePrice > 0 ? currencyComma(savePrice, currency) : '';
		let priceHtml = "";
		
		priceHtml = `<div class="pdd16-step-buying__header-price-text">`;
		if( MonthlyPrice.length > 1 ){
			monthlyCheckedFlag = true;
			priceHtml += `<strong>${fromI18n} ${MonthlyPrice[0].replace(fromI18n, "")}<br>
							${orI18n} ${MonthlyPrice[1]}</strong>`;
		}else{
			priceHtml += `<strong>${totalPrice}</strong>`;
		}
		if( orignalPriceFormatted && savePriceFormatted ){
			// COMP6FE-1599 [EPP] SEPOL MSRP Price 추가건 : 취소선 제외
			if ( !eppPl ){
				if(savePriceFormatted != '') {
					priceHtml += `
						<div class="pdd16-step-buying__header-price-save">
							<del class="was-text" data-orignal-price=${orignalPrice}>${orignalPriceFormatted}</del>
							<span class="sale-text" data-save-price=${savePrice}>${Granite.I18n.get("Save {0}", savePriceFormatted)}</span>
						</div>
					</div>`;
				} else {
					priceHtml += `
						<div class="pdd16-step-buying__header-price-save">
							<del class="was-text" data-orignal-price=${orignalPrice}>${orignalPriceFormatted}</del>
							<span class="sale-text" data-save-price=${savePrice}>${savePriceFormatted}</span>
						</div>
					</div>`;
				}
			} else {
				priceHtml += `</div>`;
			}
		}
		priceHtml += `<input type="hidden" class="hiddenPrice" value="${productPrice}">`;
		vdAddonInitPriceHtml = priceHtml;
		
		$('.pdd16-step-buying .pdd16-step-buying__header-price').html(priceHtml);
		$('.pdd16-step-buying .pdd16-step-buying__footer-sum').html(priceHtml);
	}
	
	function setVoucher() {
		const voucherTotal = $("#voucherTotal");
		const voucherBalance = $("#voucherBalance");
		const voucherCharge = $("#voucherCharge");
		const zeroPrice = currencyComma(0, currency);
		const headline = $(".pdd16-step-buying__headline");
		const desciption = $(".pdd16-step-buying__sub-headline");
		const disclaimer = $(".pdd16-step-buying__disclaimer");
		voucherTotal.html(zeroPrice);
		voucherBalance.html(zeroPrice);
		voucherCharge.html(zeroPrice);

		const voucherdata = voucherdataHybris;
		for (var i = 0; i < voucherdata.length; i++) {
			const key = voucherdata[i].key;
			const value = voucherdata[i].value;
			if (value) {
				if (key.toLowerCase() === "voucherprice") {
					voucherBalance.html(currencyComma(value, currency));
					voucherBalance.attr("data-price", value);
					voucherBalance.attr("data-oriPrice", value);
				}
				if (key.toLowerCase() === "maintitle") {
					headline.html(value);
				}
				if (key.toLowerCase() === "subtitle") {
					desciption.html(value);
					desciption.show();
				}
				if (key.toLowerCase() === "description") {
					disclaimer.find("p").html(value);
					disclaimer.show();
				}
			}
		}
	}

	function resetVoucherPrice() {
		// 가격 초기화
		const voucherTotal = $("#voucherTotal");
		const voucherBalance = $("#voucherBalance");
		const voucherCharge = $("#voucherCharge");
		const voucherPrice = voucherBalance.attr("data-oriPrice");
		const selectedNumberEL = $(".better-together__selected-title .number span");
		const selectedItem = $("#selectedItem");
		voucherTotal.attr("data-price", 0);
		voucherBalance.attr("data-price", voucherPrice);
		voucherCharge.attr("data-price", 0);
		selectedItem.html('');
		voucherTotal.html(currencyComma(0, currency));
		voucherBalance.html(currencyComma(voucherPrice, currency));
		voucherCharge.html(currencyComma(0, currency));
		selectedNumberEL.html(0);
		originPrice = 0;
		savePrice = 0;
	}

	function voucherPopup(id) {
		const voucherBalance = $("#voucherBalance");
		const voucherOriPrice = Number(voucherBalance.attr("data-oriPrice")) || 0;
		const voucherPrice = Number(voucherBalance.attr("data-price")) || 0;
		let msg, popupType;
		
		if (voucherPrice === 0) {
			popupType = "allVoucher";
			msg = Granite.I18n.get("You redeeemed at your credits!<br>Press 'continue' to proceed.<br/>You cannot change your selection once you press 'continue'.");
			id = "voucher" + id;
		} else if (voucherPrice === voucherOriPrice) {
			popupType = "redeem";
			msg = Granite.I18n.get("You didn't redeem your {0} credit.<br/>it will be gone once you press 'skip'.", currencyComma(voucherPrice, currency));
			id = "skip" + id;
		} else if (voucherPrice > 0) {
			popupType = "voucher";
			msg = Granite.I18n.get("You still have credit to redeem ({0})<br/>Your credit will be gone once you press 'continue'.", currencyComma(voucherPrice, currency));
			id = "voucher" + id;
		}

		confirmPopup(msg, popupType, id);
		
		const alertlayer = $(".confirm-popup");
		const alertTitle = alertlayer.find(".confirm-popup__title");
		const alertYes = alertlayer.find(".cta--contained");
		const alertNo = alertlayer.find(".cta--outlined");
		if( siteCode === 'hk' || siteCode === 'hk_en' ){
			if( popupType === 'redeem' ){ // addon 때 아무것도 add 안 했을 시
				alertTitle.html(Granite.I18n.get("Are you sure? (redeem)"));
				alertlayer.find('.cta--outlined.cta--black').attr('id', 'skipGoCartAddOn');
				alertYes.html(Granite.I18n.get("Use Your Galaxy Credit"));
				alertNo.html(Granite.I18n.get("Skip"));
				alertlayer.find('.cta--contained.cta--emphasis').removeAttr('id');
			}else if( popupType === 'voucher' ){ // addon 때 add는 했는데 잔액이 남았을 시
				alertTitle.html(Granite.I18n.get("Are you sure? (voucher)"));
				alertlayer.find('.cta--outlined.cta--black').attr('id', 'voucherGoCartAddOn');
				alertYes.html(Granite.I18n.get("Use Your Galaxy Credit"));
				alertNo.html(Granite.I18n.get("Skip"));
				alertlayer.find('.cta--contained.cta--emphasis').removeAttr('id');
			}
		}
	}
	
	function setVoucherPrice(price, addFlag) {
		const voucherTotal = $("#voucherTotal");
		const voucherBalance = $("#voucherBalance");
		const voucherCharge = $("#voucherCharge");
		let totalPrice = parseFloat(voucherTotal.attr("data-price") || 0);
		let voucherOriPrice = parseFloat(voucherBalance.attr("data-oriprice") || 0);
		let voucherPrice;
		let chargePrice;
		if (addFlag) {
			totalPrice += price;
		} else {
			totalPrice = Number((parseFloat(totalPrice) - parseFloat(price)).toFixed(2));
		}
		voucherPrice = Number((parseFloat(voucherOriPrice) - parseFloat(totalPrice)).toFixed(2));

		if (voucherPrice < 0) {
			chargePrice = -voucherPrice;
			voucherPrice = 0;
		} else {
			chargePrice = 0;
		}
		voucherTotal.attr("data-price", totalPrice);
		voucherBalance.attr("data-price", voucherPrice);
		voucherCharge.attr("data-price", chargePrice);
		voucherTotal.html(currencyComma(totalPrice, currency));
		voucherBalance.html(currencyComma(voucherPrice, currency));
		voucherCharge.html(currencyComma(chargePrice, currency));
	}
	
	function categoryGrid( data ){
		// search API(shop/model/productcard) Data가 있는 Product의 Category만 다시 Setting
		let sortOrderArr = [];
    	let categoryInfo = [];
		let addOnCategoryId = [];
		let categoryHtml = '';
		if( data && data.length > 0 ){
			$.each(data, function (i, value){
				if( value.category.id !== null && value.category.id !== undefined ) {
					if( addOnCategoryId.indexOf(value.category.id) < 0 ){ // Category 중복 push 막기 위해 addOnCategoryId 검사
						categoryInfo = {
								"categoryId" : value.category.id,
								"categoryOrder" : value.category.order,
								"display_name" : value.category.display_name
						}
						addOnCategoryId.push(value.category.id);
						sortOrderArr.push(categoryInfo);
					}
				}
			});
			
			// category를 categoryOrder 기준으로 sort
			sortOrderArr.sort(function(a, b) { 
				return a.categoryOrder - b.categoryOrder;
			});
			
			// categoryOrder로 sort한 category 정보를 categoryId에 push
			addOnCategoryId = []; // 위에서 push한 addOnCategoryId 값을 비우고 정렬된 categoryId 값을 다시 push
			for(let sort = 0; sort < sortOrderArr.length; sort++){
				addOnCategoryId.push(sortOrderArr[sort].categoryId);
			}
			
			const headlineText = $(".pdd16-step-buying__headline");
			const chooseYourI18n = siteCode === 'es' ? "Choose yours {0}" : "Choose your {0}";

			if(localConfigurator.get("useStaticTitle")){
				headlineText[0].innerHTML = Granite.I18n.get("Choose your TV set-up")
			}else{
				headlineText[0].innerHTML = Granite.I18n.get(chooseYourI18n, sortOrderArr[0].display_name);
			}
			$.each(addOnCategoryId, function (i, addOnCategoryId) {
				categoryHtml += `<li class="tab__item" role="presentation" data-category-name="${sortOrderArr[i].display_name}">
									<button class="tab__item-title" role="tab" an-tr="pdd16_step buying-product detail-select-tab" an-ca="option click" an-ac="bridge" an-la="vd add-on:${sortOrderArr[i].display_name}:tab">${sortOrderArr[i].display_name}
										<span class="tab__item-line"></span>
									</button>
								</li>`;
			});
		}
		$(".tab__list").html(categoryHtml);
		
	}
	
	function comboMsgGrid(){
		if( vdComboData && vdComboData.length > 0 ){
			let vdMsg = '';
			vdComboData.forEach(function(data){
				if( data.key.toLowerCase() === 'maintitle' ){
					vdMsg += data.value;
				}else if( data.key.toLowerCase() === 'subtitle' ){
					if( vdMsg ){
						vdMsg += `<br/>${data.value}`;
					}else{
						vdMsg += data.value;
					}
				}
			});
			$('.pdd16-step-buying__promotion-banner .pdd16-step-buying__promotion-banner-text').html(vdMsg);
		}else{
			$('.pdd16-step-buying__promotion-banner').remove();
		}
	}
	
	function showAddonArea( data, isGift ){
		productListData = data;
		
		if( isGift ){
			addToCart(true, false);
			$('.pdd16-step-buying__promotion-banner').hide();
			$('.pdd16-step-buying .tab').removeClass('bg-light-gray').removeAttr('data-use-arrow');
			$('.pdd16-step-buying .tab__list').hide();
			if(!$('.pdd16-step-buying').hasClass('pdd16-step-buying--free-gift')){
				$('.pdd16-step-buying').addClass('pdd16-step-buying--free-gift');
			}
			
			if(localConfigurator.get('useTnc') && localConfigurator.get('useTncFromAPI')){
				// addOnGiftContinueBtn 이 랜더링된 이후에 할당, 미리 선언할 경우 해당 요소 찾지 못하는 이슈
				tncComponent = addOnGiftTNC();
				const tncAPIcontext = localConfigurator.get('tncAPIContext') ? localConfigurator.get('tncAPIContext') : '';
				tncComponent.render(tncAPIcontext);
			}
			
		}else{
		
			if(!localConfigurator.get("useTncOnAddOn")){
				const _$tnc = $('.pdd16-step-buying__tnc');
				if(_$tnc && _$tnc.length > 0){
					_$tnc.hide();
				}
			}
			
			if( !hasGift ){
				addToCart(true, false);
			}
			$('.pdd16-step-buying .tab').addClass('bg-light-gray').attr('data-use-arrow');
			$('.pdd16-step-buying .tab__list').show();
			
			if(localConfigurator.get("useStaticSubTitle")){
				$('.pdd16-step-buying__sub-headline').css('display','');

				if(hasVoucher){
					$('.pdd16-step-buying__evoucher').show();
					$('.pdd16-step-buying__evoucher').css('display','');
				}else{
					$('.pdd16-step-buying__evoucher').remove();
				}
			}else if( hasVoucher ){
				$('.pdd16-step-buying__sub-headline').css('display','');
				$('.pdd16-step-buying__evoucher').css('display','');
			}
			if($('.pdd16-step-buying').hasClass('pdd16-step-buying--free-gift')){
				$('.pdd16-step-buying').removeClass("pdd16-step-buying--free-gift");
			}

			if(!localConfigurator.get("useStaticSubTitle")){
				$('.pdd16-step-buying__sub-headline').hide();
			}
			categoryGrid(data); // category.order에 대한 sort함수로 정렬(카테고리만 정렬)
			comboMsgGrid();
		}
		
		setTimeout(function() { // bundle데이터가 있을 경우, bundle데이터 가공하는 속도가 느려서 setTimeout 추가
			if( isGift ){
				buildProductGridGift(data);
			}else{
				buildProductGrid(data);
			}
		}, 70);
		
		if( isOldHybris ){
			var removeClass = $("[class*='feature-benefit']");
			for(var i = 0; i < removeClass.length; i++){
				removeClass[i].remove();
			}
			/*var removeClass2 = $("#wrap").nextUntil("footer");
			for(var j = 0; j < removeClass2.length; j++){
				removeClass2[j].remove();
			}*/
			$(".video-wrapper").remove();
		}
		if( isNewHybris ){
			var responsivegrid = $(".root.responsivegrid > div");
			for(let i = 0; i < responsivegrid.length; i++){
				var classList = responsivegrid[i].classList;
				if(!classList.value.includes('aem-Grid--default--12'))
					responsivegrid[i].remove();
			}
		}
		
		$(".pdd16-step-buying").siblings().add($(".pdd16-step-buying").parent().siblings()).hide();
		setTimeout(function() {
			if( isPopupCTA ){
				window.sg.components.stepbuying.init({visibleScrollTop: true});
			}else{
				window.sg.components.stepbuying.init();
			}
		}, 80);

		if ($(".scrollbar__contents .pdd16-step-buying__card").not(".is-item-visible").length === 0) {
			$(".pdd16-step-buying__cta-more").hide();
		}
		
		window.scrollTo(0, 0);
		$(".pdd16-step-buying").show();
		const oldGNB = $(".gnb.js-mobile-open");
		const newGNB = $(".nv00-gnb"); 
		oldGNB.length > 0 ? oldGNB.show() : newGNB.show();
		$("footer").show();
		
		if(typeof _satellite != 'undefined'){
			if( isGift ){
				_satellite.setVar("Add Page Name", "free gift");
			}else{
				if( hasVoucher ){
					setVoucher();
					_satellite.setVar("Add Page Name", "evoucher");
				}else{
					_satellite.setVar("Add Page Name", "add on");
				}
			}
			_satellite.track("page view");
		}

		if(!isGift){ // VD Step Buying 일 때만 고정문구 적용
			if(localConfigurator.get('useStaticTitle')){
				const headlineText = $(".pdd16-step-buying__headline");
				headlineText[0].innerHTML = Granite.I18n.get("Choose your TV set-up")
			}
			if(localConfigurator.get('useStaticSubTitle')){
				$('.pdd16-step-buying__sub-headline').text(Granite.I18n.get('addon subtitle'));
			}
		}
	}
	
	function buildProductGrid( productList ) {
		const viewMoreI18n = Granite.I18n.get("View more");
		const checkoutI18n = Granite.I18n.get("Checkout");
		let nextI18n = Granite.I18n.get("Next");
		const totalI18n = Granite.I18n.get("Total");
		const vatInclusiveI18n = Granite.I18n.get("VAT Inclusive");

		if(localConfigurator.get("useAddOnNextI18n")){
			// addon 한정으로 문구 변경시 "Next (addon)" 키 값 사용
			nextI18n = Granite.I18n.get("Next (addon)");
		}
		
		let result = "";
		resetProduct();
		mainPrice = $('.pdd16-step-buying__header-price-text')[0].innerHTML;
		productListLength = Object.keys(productList).length;
		if( Object.keys(productList) && Object.keys(productList).length > 0 ){
			let productGridTemplate = "";
			$.each(productList, function(idx,value){
				const productData = productList[idx].category.productList;
				for (let pl = 0; pl < productData.length; pl++) {
					let tempProduct = productData[pl];
					if( tempProduct.modelList && tempProduct.modelList.length > 0 ){
						let frontModelIdx = 0;
						let selectedIndex = null; // selected Y값이 여러개 올경우 마지막 것으로 대표모델 선정
						/* selected가 Y인값만 체크 */
						for( let cnt = 0; cnt < tempProduct.modelList.length; cnt++ ){
							const tempModel = tempProduct.modelList[cnt];
							const enabledFlag = tempModel.isStock;
							if ( tempModel.selected && tempModel.selected === "Y" ){
								frontModelIdx = cnt;
								if( enabledFlag ){
									selectedIndex = cnt;
								}
							}
						}
						if( !selectedIndex ){
							for(let cnt = 0; cnt < tempProduct.modelList.length; cnt++){
								const tempModel = tempProduct.modelList[cnt];
								const isStock = tempModel.isStock;
								if( isStock ){
									selectedIndex = cnt;
									break;
								}
							}
						}
						if( !selectedIndex ){
							selectedIndex = frontModelIdx;
						}
						tempProduct = getProductInfo(tempProduct, selectedIndex);
						productGridTemplate += buildProductCard(tempProduct,idx);
					}
				}
				if(productList[idx].category.display_name == bundleCategoryName){ // Bundle이 속한 Category에 bundle Card를 그리기 위한 로직
					const bundleData = productList[idx];
					productBundleListData = bundleData.category.productList;
					for(const bundleIdx in productList[idx].category.productList ){
						const bundleInfo = productList[idx].category.productList[bundleIdx];
						const promoValue = bundleInfo.promotionPriceValue ? bundleInfo.promotionPriceValue : bundleInfo.priceValue;
						
						productGridTemplate += 
							`<div class="pdd16-step-buying__card" data-index="${bundleData.category.key}-${bundleIdx}-0" data-price="${promoValue}">
								${bundleGrid(bundleIdx)}
							</div>`;
					}
				}
				result +=
					`  <div class="pdd16-step-buying__tab pdd16-step-buying__2column swiper-slide" data-button-text="${(Number(idx) + 1) == productListLength ? checkoutI18n : nextI18n}">
		            <div class="pdd16-step-buying__list-type">
		            <a class="btn-type on" aria-label="2column">
		              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
		                <path fill="none" d="M0 0H16V16H0z" transform="translate(-344 -388) translate(344 388)" />
		                <g>
		                  <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 388)" />
                        <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 394.649)" />
                        <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 388)" />
                        <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 394.649)" />
		                </g>
		              </svg>
		            </a>
		            <a class="btn-type" aria-label="1column">
		              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
		                <path fill="none" d="M0 0H16V16H0z" transform="translate(349 388) translate(-349 -388)" />
		                <g>
		                  <path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 388.732) translate(7 1.268) translate(-349 -388)" />
                        <path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 395.732) translate(7 1.268) translate(-349 -388)" />
		                </g>
		              </svg>
		            </a>
		          </div>
		          <div class="scrollbar">
		            <div class="scrollbar__contents">
		            	${productGridTemplate}
		              <div class="pdd16-step-buying__view-more">
		                <button type="button" class="cta" aira-label="${viewMoreI18n}">
		                  <svg class="icon next" focusable="false">
		                    <use xlink:href="#next-bold" href="#next-bold"></use>
		                  </svg>
		                  <span class="cta-text">${viewMoreI18n}</span>
		                  <svg class="icon down" focusable="false">
		                    <use xlink:href="#open-down-bold" href="#open-down-bold"></use>
		                  </svg>
		                </button>
		              </div>
		            </div>
		          </div>
		        </div>`;
				productGridTemplate = "";
			})
	    }else{
	    	let productBundleGridTemplate = "";
	    	result =
					`  <div class="pdd16-step-buying__tab pdd16-step-buying__2column swiper-slide" >
		            <div class="pdd16-step-buying__list-type">
		            <a class="btn-type on" aria-label="2column">
		              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
		                <path fill="none" d="M0 0H16V16H0z" transform="translate(-344 -388) translate(344 388)" />
		                <g>
		                  <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 388)" />
                        <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 394.649)" />
                        <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 388)" />
                        <path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 394.649)" />
		                </g>
		              </svg>
		            </a>
		            <a class="btn-type" aria-label="1column">
		              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
		                <path fill="none" d="M0 0H16V16H0z" transform="translate(349 388) translate(-349 -388)" />
		                <g>
		                  <path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 388.732) translate(7 1.268) translate(-349 -388)" />
                        <path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 395.732) translate(7 1.268) translate(-349 -388)" />
		                </g>
		              </svg>
		            </a>
		          </div>
		          <div class="scrollbar">
		            <div class="scrollbar__contents">
		            	${productBundleGridTemplate}
		              <div class="pdd16-step-buying__view-more">
		                <button type="button" class="cta" aira-label="${viewMoreI18n}">
		                  <svg class="icon next" focusable="false">
		                    <use xlink:href="#next-bold" href="#next-bold"></use>
		                  </svg>
		                  <span class="cta-text">${viewMoreI18n}</span>
		                  <svg class="icon down" focusable="false">
		                    <use xlink:href="#open-down-bold" href="#open-down-bold"></use>
		                  </svg>
		                </button>
		              </div>
		            </div>
		          </div>
		        </div>`;
	    }
		$(".pdd16-step-buying .swiper-wrapper").html(result);
		
		let buttonType = "";
		$("#pdd16-step-buying").addClass('pdd16-step-buying--default');
		const categoryCount = $(".pdd16-step-buying .pdd16-step-buying__tab-wrap .tab__list li").length;
		if( categoryCount > 1 ){ // Category가 두 개 이상 일 때
			buttonType = `
					<div class="pdd16-step-buying__footer-price">
		                <p class="pdd16-step-buying__footer-text"><strong>${totalI18n}</strong>${localConfigurator.get("useVATInclusiveArea") ? vatInclusiveI18n : ''}</p>
		                <p class="pdd16-step-buying__footer-sum">${mainPrice}</p>
		              </div>
					<div class="pdd16-step-buying__footer-cta">
						<button class="cta cta--contained cta--emphasis cta--step" aria-label="Next" id="nextBtn">
							${nextI18n}
						</button>
					</div>`
		}else{ // Category가 단 하나일 때
			buttonType = 
				`
					<div class="pdd16-step-buying__footer-cta">
						<button class="cta cta--contained cta--emphasis cta--step" aria-label="Next" id="primaryInfoGoCartAddOn">
							${checkoutI18n}
						</button>
					</div>
				`
		}
		const vdDisclaimer = Granite.I18n.get("*Savings based on regular Samsung.com price. Discount applied automatically at checkout when two or more qualifying products in basket.");
		buttonType += `<p class="pdd16-step-buying__footer-disclaimer">${vdDisclaimer}</p>`;
		$('.pdd16-step-buying__footer').html(buttonType);
		
		productCardListener();
	}
	
	function buildProductGridGift( productList ){
		const viewMoreI18n = Granite.I18n.get("View more");
		const checkoutI18n = Granite.I18n.get("Checkout");
		let nextI18n = Granite.I18n.get("Next");
		const totalI18n = Granite.I18n.get("Total");
		const vatInclusiveI18n = Granite.I18n.get("VAT Inclusive");
		const outOfStockI18n = Granite.I18n.get("Out Of Stock");

		if(localConfigurator.get("useAddOnNextI18n")){
			// addon 한정으로 문구 변경시 "Next (addon)" 키 값 사용
			nextI18n = Granite.I18n.get("Next (addon)");
		}
		
		let result = "";
		const title = giftdataHybris;
		$.each(title, function(idx,value){	// Gift Page title
			if(title[idx].key.toLowerCase() === "maintitle"){
				$(".pdd16-step-buying__headline").html(title[idx].value)
			}
			if(title[idx].key.toLowerCase() === "subtitle"){
				$(".pdd16-step-buying__sub-headline").html(title[idx].value);
				$('.pdd16-step-buying__sub-headline').css('display','');
			}
			if(title[idx].key.toLowerCase() === "description") {
				$(".pdd16-step-buying__disclaimer p").html(title[idx].value)
				$('.pdd16-step-buying__disclaimer').css('display','');
			}
		})
		
		mainPrice = $('.pdd16-step-buying__header-price-text')[0].innerHTML;
		var count = 0;
		if (productList.length > 0) {
			var productGridTemplate = "";
				for (var pl = 0; pl < productList.length; pl++) {
					var tempProduct = productList[pl];
					if (tempProduct.modelList != null && tempProduct.modelList.length > 0) {
						frontModelIdx = 0;
						var selectedIndex = null; // selected Y값이 여러개 올경우 마지막 것으로 대표모델 선정
						/* selected가 Y인값만 체크 */
						for (var cnt = 0; cnt < tempProduct.modelList.length; cnt++) {
							var tempModel = tempProduct.modelList[cnt];
							var enabledFlag = tempModel.isStock;
	
							if (tempModel.selected && tempModel.selected === "Y") {
								frontModelIdx = cnt;
								if (enabledFlag) {
									selectedIndex = cnt;
								}
							}
						}
						if (selectedIndex == null) {
							for (var cnt = 0; cnt < tempProduct.modelList.length; cnt++) {
								var tempModel = tempProduct.modelList[cnt];
								var isStock = tempModel.isStock;
								if (isStock) {
									selectedIndex = cnt;
									break;
								}
							}
						}
						if (selectedIndex == null) {
							selectedIndex = frontModelIdx;
						}

						tempProduct = getProductInfo(tempProduct, selectedIndex);
						productGridTemplate += buildProductCardGift(tempProduct);
					}
				}
				var gifts = giftdataHybris;
				result += 
					`<div class="pdd16-step-buying__tab pdd16-step-buying__ swiper-slide">
		            <div class="pdd16-step-buying__list-type">
		            <a class="btn-type on" aria-label="">
		              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
		                <path fill="none" d="M0 0H16V16H0z" transform="translate(-344 -388) translate(344 388)" />
		                <g>
							<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 388)" />
							<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 394.649)" />
                    		<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 388)" />
                    		<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 394.649)" />
		                </g>
		              </svg>
		            </a>
		            <a class="btn-type" aria-label="">
		              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
		                <path fill="none" d="M0 0H16V16H0z" transform="translate(349 388) translate(-349 -388)" />
		                <g>
							<path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 388.732) translate(7 1.268) translate(-349 -388)" />
                    		<path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 395.732) translate(7 1.268) translate(-349 -388)" />
		                </g>
		              </svg>
		            </a>
		          </div>
		          <div class="scrollbar">
		            <div class="scrollbar__contents">
		            	${productGridTemplate}
		              <div class="pdd16-step-buying__view-more">
		                <button type="button" class="cta" aira-label="${viewMoreI18n}">
		                  <svg class="icon next" focusable="false">
		                    <use xlink:href="#next-bold" href="#next-bold"></use>
		                  </svg>
		                  <span class="cta-text">${viewMoreI18n}</span>
		                  <svg class="icon down" focusable="false">
		                    <use xlink:href="#open-down-bold" href="#open-down-bold"></use>
		                  </svg>
		                </button>
		              </div>
		            </div>
		          </div>
		        </div>`;
				productGridTemplate = "";
	     }else{
	    	 var productBundleGridTemplate = "";
			var gifts = giftdataHybris;
			result = 
				`<div class="pdd16-step-buying__tab pdd16-step-buying__ swiper-slide">
	            <div class="pdd16-step-buying__list-type">
	            <a class="btn-type on" aria-label="">
	              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
	                <path fill="none" d="M0 0H16V16H0z" transform="translate(-344 -388) translate(344 388)" />
	                <g>
						<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 388)" />
						<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(344 394.649)" />
             		<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 388)" />
             		<path d="M.764 0h3.822a.764.764 0 0 1 .764.764v3.822a.764.764 0 0 1-.764.764H.764A.764.764 0 0 1 0 4.586V.764A.764.764 0 0 1 .764 0z" transform="translate(-344 -388) translate(2 2) translate(350.65 394.649)" />
	                </g>
	              </svg>
	            </a>
	            <a class="btn-type" aria-label="">
	              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
	                <path fill="none" d="M0 0H16V16H0z" transform="translate(349 388) translate(-349 -388)" />
	                <g>
						<path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 388.732) translate(7 1.268) translate(-349 -388)" />
             		<path d="M.652 0h10.7A.681.681 0 0 1 12 .764v3.822a.681.681 0 0 1-.652.764H.652A.681.681 0 0 1 0 4.586V.764A.681.681 0 0 1 .652 0z" class="cls-2" transform="translate(344 395.732) translate(7 1.268) translate(-349 -388)" />
	                </g>
	              </svg>
	            </a>
	          </div>
	          <div class="scrollbar">
	            <div class="scrollbar__contents">
	            	${productBundleGridTemplate}
	              <div class="pdd16-step-buying__view-more">
	                <button type="button" class="cta" aira-label="${viewMoreI18n}">
	                  <svg class="icon next" focusable="false">
	                    <use xlink:href="#next-bold" href="#next-bold"></use>
	                  </svg>
	                  <span class="cta-text">${viewMoreI18n}</span>
	                  <svg class="icon down" focusable="false">
	                    <use xlink:href="#open-down-bold" href="#open-down-bold"></use>
	                  </svg>
	                </button>
	              </div>
	            </div>
	          </div>
	        </div>`;
	     }
		$(".pdd16-step-buying .pdd16-step-buying__card-wrap .swiper-wrapper").html(result);
        
		// Continue를 누른 후 전환된 Gift Page에서 OOS가 아닌 첫번째 제품을 선택
		var firstRadioCheck = $(".radio-v2 input");
		var fistOOSCheck = firstRadioCheck.closest('.pdd16-step-buying--free-gift').find('.pdd16-step-buying__card-state p');
		var radioCheckedFlag = false;
		for(let i = 0; i < fistOOSCheck.length; i++){
			var inputRadioId = firstRadioCheck[i].getAttribute('id');
			var inputRadioClass = firstRadioCheck[i].getAttribute('class')
			if(fistOOSCheck[i].innerText.toUpperCase() == outOfStockI18n.toUpperCase() || inputRadioId == 'radio-id-99' || inputRadioId == 'radio-id-SC' || inputRadioClass.includes('cta--bundle')){
				continue;
			}else{
				firstRadioCheck[i].setAttribute('checked',true);
				selectProductList.push(firstRadioCheck[i].getAttribute('data-modelcode'));
				radioCheckedFlag = true;
				break;
			}
		}
		// 모든 제품이 OOS이면 Skip, 아니라면 Continue 버튼 노출
		var OOScount = 0;
		var OOSstate = "";
		var cardState = $(".pdd16-step-buying--free-gift .pdd16-step-buying__card-state p");
		for(let i = 0; i < cardState.length; i++){
			if(cardState[i].innerText.toUpperCase() == outOfStockI18n.toUpperCase() && !(firstRadioCheck[i].getAttribute('id') == 'radio-id-SC')){
				OOScount++;
			}
		}
		if(OOScount == cardState.length){
			OOSflag = true;
			OOSstate = Granite.I18n.get("Skip");
			radioCheckedFlag = true;
		}else{
			OOSstate = '';
			OOSstate = Granite.I18n.get("CONTINUE");
		}
		if(localConfigurator.get("useGiftContinueI18nForAllCTA")){
			OOSstate = Granite.I18n.get("CONTINUE(GIFT)");
		}
		var buttonType = `
			<div class="pdd16-step-buying__footer-price">
                <p class="pdd16-step-buying__footer-text"><strong>${totalI18n}</strong>${vatInclusiveI18n}</p>
                <p class="pdd16-step-buying__footer-sum">${mainPrice}</p>
              </div>
			<div class="pdd16-step-buying__footer-cta-wrap">`;
		
		if(siteCode === "it"){
			buttonType += `
				<div class="pdd16-step-buying__footer-cta">
					<button class="cta cta--underline cta--emphasis gift cta--skip" id="giftSkip">
						Non mi interessa
		             </button>
		        </div>`;
		}
		
		buttonType += `
            <div class="pdd16-step-buying__footer-cta">
            	<button class="cta cta--contained cta--emphasis ${!radioCheckedFlag ? 'cta--disabled' : ''} ${localConfigurator.get("useTnc") ? 'cta--step' : ''}" id="giftContinue">
                	${OOSstate}
              	</button>
            </div>
          </div>`;
		$('.pdd16-step-buying__footer').html(buttonType);
		
		$('#radio-id-0').click();
		
		productCardListenerGift();
	}
	
	function productCardListener() {
		/* 옵션칩(Color, Memory영역) 클릭 Event :: S */
		$(".pdd16-step-buying").off("click", ".pdd16-step-buying__card .option-selector__color input, .pdd16-step-buying__card .option-selector__size input");
		$(".pdd16-step-buying").on("click", ".pdd16-step-buying__card .option-selector__color input, .pdd16-step-buying__card .option-selector__size input", function () {
			const _this = $(this);
			const optionIdx = _this.attr('data-modeli');
			const selectCard = _this.closest(".pdd16-step-buying__card");
			const selectIndex = selectCard.attr("data-index") || ""; // familyNum
			const productIdx = selectIndex.split('-')[1]; // familyNum
			const targetIdx = selectIndex.split('-')[2];
			const key = selectIndex.split('-')[0];

			setTimeout(function () {
				if (optionIdx != null) {
					productListData[key].category.productList[productIdx].frontModelIdx = optionIdx;
					const productInfo = getProductInfo(productListData[key].category.productList[productIdx], optionIdx);
					let targetContentEl = $(".pdd16-step-buying__2column").eq(key).find('.pdd16-step-buying__card').eq(productIdx);
					const index = $(".pdd16-step-buying__card").index(targetContentEl);
					targetContentEl.find(".option-selector__swiper-wrapper").each(function (idx) {
						const tmpType = productListData[key].category.productList[productIdx].optionTypeList[idx];
						const styleAttr = $(this).attr("style");
						productListData[key].category.productList[productIdx].viewOptionObj[tmpType].styleAttr = styleAttr;
					});
					mainPrice = $('.pdd16-step-buying__header-price-text')[0].innerHTML;
					targetContentEl.replaceWith(buildProductCard(productInfo,key));
					targetContentEl = $(document.querySelectorAll(".pdd16-step-buying__card")[index]);
					targetContentEl.addClass("is-show");
					window.sg.components.stepbuying.init();
				}
			}, 100);
			productCardListener();
		});
		
		/* Card Add버튼 클릭 Event */
		$(".pdd16-step-buying").off("click", ".pdd16-step-buying__card .cta:not(.learn-more-btn)");
		$(".pdd16-step-buying").on("click", ".pdd16-step-buying__card .cta:not(.learn-more-btn)", function () {
			const fromI18n = Granite.I18n.get("From");
			const orI18n = Granite.I18n.get("or");
			const monthly18n = Granite.I18n.get("Monthly Price") + ":";
			
			const _this = $(this);
			const modelCode = _this.attr('data-modelcode');
			const index = _this.closest(".pdd16-step-buying__card").attr("data-index");
			const monthly = clickModelPriceMonth;
			
			const price = parseFloat(_this.closest(".pdd16-step-buying__card").attr("data-price"));
			let productPrice = Number($(".hiddenPrice").val());
			let monthPrice = "";
			let totalPrices = "";
			let priceHtml = "";
			
			let voucherBalance = "";
			let originVoucher = "";
			let voucherCharge = "";
			let selectedItem = "";
			
			let addOnPrice = $(this).attr('data-price');
			const productIndex = index.split('-');
			const selectModel = productListData[productIndex[0]].category.productList[productIndex[1]].modelList[productIndex[2]];
			const addedIndex = selectIndexList.indexOf(index);
			if($(this).hasClass('cta--bundle')){
				addOnPrice = $(this).attr('data-promotionprice');
				if( !$(this).hasClass('js-cta-stock') ){
					if( $(this).hasClass('cta--on') ){
						const fData = productBundleListData.filter(elem => {
							return elem.modelcode === modelCode;
						})
						const bundleData = relatedProductsBundleTotal.filter(elem => {
							return elem.bundleModelCode === modelCode;
						});
						window.sg.components.addonBundlePopup.callSearchAjax(fData[0], bundleData[0]);
						
						window.sg.components.notifyMePopup.showPopup(document.querySelector('.add-ons-evoucher-popup'));
						window.sg.components.notifyMePopup.reInit();
						
					} else {
						$(".pdd16-step-buying__evoucher-title span").html(--selectedCount);
						if( hasVoucher ){
							voucherBalance = Number($('#voucherBalance').attr('data-price'));
							originVoucher = Number($('#voucherBalance').attr('data-oriprice'));
							voucherCharge = Number($('#voucherCharge').attr('data-price'));
							originPrice -= Number($(this).attr('data-originprice'));
							savePrice -= Number(parseFloat($(this).attr('data-saveprice')).toFixed(2));
							setVoucherPrice(price, false);
							
							if(!voucherCharge){ 
							}else{ 
								if(voucherCharge >= Number(addOnPrice)){
									productPrice -= Number(addOnPrice);
								}else{
									productPrice -= voucherCharge;
								}
							}
						}else{
							productPrice -= Number(addOnPrice);
						}
						if( selectedBundlePopupData[modelCode] ){
							selectedBundlePopupData[modelCode] = [];
						}
					}
				}
			}else{
				if($(this).hasClass('cta--on') && !$(this).hasClass('js-cta-stock')){
					selectIndexList.push(index);

					if( hasVoucher ){
	                	voucherBalance = Number($('#voucherBalance').attr('data-price'));
						if( voucherBalance - Number(addOnPrice) < 0){
	                		productPrice += -(voucherBalance - Number(addOnPrice));
						}
						originPrice += Number($(this).attr('data-oriprice'));
						savePrice += Number(parseFloat($(this).attr('data-saveprice')).toFixed(2));
						setVoucherPrice(price, true);
					}else{
						productPrice += Number(addOnPrice);
					}
					
					selectProductList.push(modelCode);
					const modelName = $(this).closest('.pdd16-step-buying__card').find('.pdd16-step-buying__card-title strong').html();
					const imgPath = $(this).closest('.pdd16-step-buying__card').find('.image img').eq(1);
					const imgList = {
							modelCode: modelCode,
							modelName: modelName,
							src: imgPath.attr('src')
					}
					selectProductImgList.push(imgList);
					
				}else if(!$(this).hasClass('cta--on') && !$(this).hasClass('js-cta-stock') ){
					selectIndexList.splice(addedIndex, 1);
					productPrice -= Number(addOnPrice);
					for(let i = 0; i < selectProductList.length; i++){
						if(selectProductList[i] == modelCode){
							selectProductList.splice(i,1);
							i--;
							break;
						}
					}
					selectProductImgList = selectProductImgList.filter(function(elem){
						return modelCode !== elem.modelCode;
					});
				}
			}
			totalPrices = Granite.I18n.get("From {0}/mo", currencyComma(productPrice / Number(monthly), currency)) + ' ' + Granite.I18n.get("for {0} mos",monthly) + ' ' + Granite.I18n.get("or") + ' '+currencyComma(productPrice, currency);
			monthPrice = totalPrices.split(" "+ orI18n + " ");
			
			if( !priceHtml ){
				priceHtml = $(".pdd16-step-buying__header-price").html();
			}
			if( selectProductList.length > 0 ){
				let productCodes = `${clickModelCode},`
				selectProductList.forEach(function(modelCode, idx){
					productCodes += modelCode + (selectProductList.length-1 === idx ? '' : ',');
				});
				
				let addonListHtml = '';
				selectProductImgList.forEach(function(elem){
					addonListHtml += `
						<div class="pdd16-step-buying__add-on-list-box swiper-slide" role="listitem">
							<div class="pdd16-step-buying__add-on-list-icon">
								<svg class="icon close" focusable="false">
								<use xlink:href="#plus-bold" href="#plus-bold"></use>
								</svg>
							</div>
							<div class="pdd16-step-buying__add-on-list-image">
								<div class="image">
									<img class="image__preview lazy-load responsive-img" data-desktop-src="" data-mobile-src="" alt="" role="img" data-comp-name="image">
									<img class="image__main lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(elem.src, "$48_48_PNG$")}" data-mobile-src="${addOnsImgDomain(elem.src, "$32_32_PNG$")}" alt="" role="img" data-comp-name="image">
								</div>
							</div>
							<div class="pdd16-step-buying__add-on-list-product-name">${elem.modelName}</div>
						</div>`;
				});
				const stepBuyingHeaderArea = $('.pdd16-step-buying__header');
				stepBuyingHeaderArea.addClass('pdd16-step-buying__header-add-on-product');
				stepBuyingHeaderArea.find('.swiper-container').show();
				stepBuyingHeaderArea.find('.swiper-wrapper').html(addonListHtml);
				stepBuyingHeaderArea.find('.pdd16-step-buying__quantity strong').html(`+${selectProductList.length}`)
				
				callSimulatecartAjax(productCodes, monthPrice);
				
			}else{
				const stepBuyingHeaderArea = $('.pdd16-step-buying__header');
				stepBuyingHeaderArea.removeClass('pdd16-step-buying__header-add-on-product');
				stepBuyingHeaderArea.find('.swiper-container').hide();
				priceHtml = vdAddonInitPriceHtml;
			}
			
			if( hasVoucher ){
				if(!savePrice || savePrice < 0){ // 할인가가 없다면
					selectedItem = currencyComma(originPrice,currency);
				}else{ // 할인가가 있다면
					selectedItem = currencyComma(originPrice,currency) + ' ' + Granite.I18n.get("Save") + ' ' + '<del>' + currencyComma(savePrice, currency) + '</del> ' + currencyComma(originPrice-savePrice,currency);
				}
				$('#selectedItem').html(selectedItem);
			}
			
			$(".pdd16-step-buying__header-price").html(priceHtml);
			$(".pdd16-step-buying__footer-sum").html(priceHtml);
			
			setCtaTagging();
			window.sg.components.stepbuying.init();
		});
		
		/* Card Learn More 버튼 클릭 Event (VD Step Buying) */
		$(".pdd16-step-buying").off("click", ".pdd16-step-buying__card .pdd16-step-buying__card-cta-learn-more button");
		$(".pdd16-step-buying").on("click", ".pdd16-step-buying__card .pdd16-step-buying__card-cta-learn-more button", function () {
			const _this = $(this);
			const productIndex = _this.closest(".pdd16-step-buying__card").attr("data-index").split('-');
			const selectModel = productListData[productIndex[0]].category.productList[productIndex[1]].modelList[productIndex[2]];
			const thirdPASeller = productListData[productIndex[0]].category.productList[productIndex[1]].thirdPASeller;
			const categoryName = $('.pdd16-step-buying .tab__item--active').attr('data-category-name');
			const learnMorePopup = $('.pdd16-step-buying__layer-learn-more');
			learnMorePopup.find('.layer-popup__title').html(categoryName);
			
			const imageUrl = (selectModel.galleryImage && selectModel.galleryImage.length > 0) ? selectModel.galleryImage : [selectModel.thumbUrl];
			const imageAlt = (selectModel.galleryImage && selectModel.galleryImage.length > 0) ? selectModel.galleryImageAlt : [selectModel.thumbUrlAlt];
			let imageListHtml = '';
			if( imageUrl ){
				for(let idx in imageUrl){
					imageListHtml += `
					<div class="swiper-slide" role="listitem">
						<div class="image">
							<img class="image__preview lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(imageUrl[idx], "$290_240_PNG$")}" data-mobile-src="${addOnsImgDomain(imageUrl[idx], "$520_400_PNG$")}" alt="imageAlt[idx]" role="img">
							<img class="image__main lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(imageUrl[idx], "$290_240_PNG$")}" data-mobile-src="${addOnsImgDomain(imageUrl[idx], "$520_400_PNG$")}" alt="imageAlt[idx]" role="img">
						</div>
					</div>`;
				}
			}
			const isSwiperOption = imageUrl.length > 1 ? true : false;
			const imageHtml = `
				<div class="swiper-container basic-swiper" data-swiper-option='{
					"slidesPerView":"1","keepWrapper":true,"loop":false,"pagination":false,"componentEl":".pdd16-step-buying__learn-more-images","offTxtAccesibility":"true","centeredSlides": true,"centeredSlidesBounds": true,"followFinger":${isSwiperOption}}'>
					<button type="button" class="swiper-button-prev" an-tr="pdd16_step buying-product detail-image-index" an-ca="indication" an-ac="carousel" an-la="carousel:index:left">
						<span class="hidden">${Granite.I18n.get('Previous')}</span>
						<svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#previous-bold" href="#previous-bold"></use></svg>
					</button>
					<div class="swiper-wrapper" role="list">
						${imageListHtml}
					</div>
					<button type="button" class="swiper-button-next" an-tr="pdd16_step buying-product detail-image-index" an-ca="indication" an-ac="carousel" an-la="carousel:index:right">
						<span class="hidden">${Granite.I18n.get('Next')}</span>
						<svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#next-bold" href="#next-bold"></use></svg>
					</button>`;
			learnMorePopup.find('.pdd16-step-buying__learn-more-images').html(imageHtml);
			
			let uspHtml = '';
			if( isHybrisIntg ){
				const promotionList = [{key: selectModel.tradeIn, value: selectModel.tradeInDesc}, {key: selectModel.premiumCare, value: selectModel.premiumCareDesc},
						{key: selectModel.financing, value: selectModel.financingDesc}, {key: selectModel.upgrade, value: selectModel.upgradeDesc}, {key: (selectModel.storePromotions ? 'Y' : 'N'), value: selectModel.storePromotions}];
				for(let idx in promotionList){
					if(promotionList[idx].key === 'Y'){
						uspHtml += `<li class="pdd16-step-buying__learn-more-feature-item" role="listitem">${promotionList[idx].value}</li>`;
					}
				}
			}else if( isGlobal ){
				if( selectModel.vd3PAMarketingMessage && selectModel.vd3PAMarketingMessage.length > 0 ){
					for(let message of selectModel.vd3PAMarketingMessage){
						uspHtml += `<li class="pdd16-step-buying__learn-more-feature-item" role="listitem">${message}</li>`;
					}
				}
			}
			if( selectModel.uspText && selectModel.uspText.length > 0 ){
				for(let usp of selectModel.uspText){
					uspHtml += `	<li class="pdd16-step-buying__learn-more-feature-item" role="listitem">${usp}</li>`;
				}
			}
			let featureHtml = '';
			if( selectModel.keySummary && selectModel.keySummary.length > 0 ){
				for(let keySummary of selectModel.keySummary){
					if( keySummary.displayType.toLowerCase() === 'feature' ){
						featureHtml += `
							<li class="pdd16-step-buying__learn-more-feature-icon-item">
								<div class="pdd16-step-buying__learn-more-feature-icon-image">
									<div class="image">
										<img class="image__preview lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(keySummary.imgUrl, "$64_64_PNG$")}" data-mobile-src="${addOnsImgDomain(keySummary.imgUrl, "$96_96_PNG$")}" alt="${keySummary.imgAlt}" role="img">
										<img class="image__main lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(keySummary.imgUrl, "$64_64_PNG$")}" data-mobile-src="${addOnsImgDomain(keySummary.imgUrl, "$96_96_PNG$")}" alt="${keySummary.imgAlt}" role="img">
									</div>
								</div>
								<p class="pdd16-step-buying__learn-more-feature-icon-text">${keySummary.title}</p>
							</li>`;
					}
				}
			}
			const contentHtml = `
				<h3 class="pdd16-step-buying__learn-more-title">${selectModel.displayName}</h3>
				<div class="pdd16-step-buying__learn-more-info">
					<p class="pdd16-step-buying__learn-more-sku">${selectModel.modelCode}</p>
					${thirdPASeller ? `<strong class="pdd16-step-buying__learn-more-seller">Granite.I18n.get('Seller') : thirdPASeller</strong>` : ``}
				</div>
				${selectModel.ratings && selectModel.reviewCount ? 
				`<div class="pdd16-step-buying__learn-more-review">
					<span class="rating">
						<span class="rating__inner">
							${gridRating(selectModel.ratings, selectModel.reviewCount)}
						</span>
					</span>
				</div>` : ``}
				<ul class="pdd16-step-buying__learn-more-feature" role="list">
					${uspHtml}
				</ul>
				${selectModel.pdpUrl ? 
				`<div class="pdd16-step-buying__learn-more-cta">
					<a class="cta cta--underline cta--black cta--icon" href="${selectModel.pdpUrl}" aria-label="Link Title" target="_blank" 
						an-tr="pdd16_step buying-product detail-cta-button" an-ca="product click" an-ac="bridge" an-la="vd add-on:learn more popup:learn more" data-modelcode="${selectModel.modelCode}" data-modelname="${selectModel.modelName}">
						${Granite.I18n.get('Product detail')}
						<svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#outlink-bold" href="#outlink-bold"></use></svg>
					</a>
				</div>` : ``}
				${featureHtml ? 
				`<ul class="pdd16-step-buying__learn-more-feature-icon">
					${featureHtml}
				</ul>` : ``}`;
			learnMorePopup.find('.pdd16-step-buying__learn-more-content').html(contentHtml);
			
			window.sg.components.stepbuying.activePopup(document.querySelector('#layerPopupLearnMore'));
		});
		
		setCtaTagging();
	}
	
	function productCardListenerGift() {
		/* 옵션칩(Color, Memory영역) 클릭 Event :: S */
		$(".pdd16-step-buying__card > .pdd16-step-buying__card-option").off("click", ".option-selector__color input, .option-selector__size input");
		$(".pdd16-step-buying__card > .pdd16-step-buying__card-option").on("click", ".option-selector__color input, .option-selector__size input", function () {
			var _this = $(this);
			selectProductList = new Array();
			$(".pdd16-step-buying__header-price-text").html(mainPrice);
			var selectCard = _this.closest(".pdd16-step-buying__card");
			var selectIndex = selectCard.attr("data-index") || ""; // familyNum
			var productIdx = selectIndex.split('-')[0]; // familyNum
			var optionIdx = _this.attr('data-modeli'); // option Num
			var selectModel = productListData[productIdx].modelList[optionIdx];
			selectProductList.push(selectModel.modelCode);
			var isStock = selectModel.isStock;
			isSelectedIdx = $(this).attr('name');
			var isSelectedIdxes = isSelectedIdx.lastIndexOf('-');
			isSelectedIdx = isSelectedIdx.substring(isSelectedIdx.lastIndexOf('-',isSelectedIdxes-1)+1);
			
			setTimeout(function () {
				if (optionIdx != null) {
					productListData[productIdx].frontModelIdx = optionIdx;
					var productInfo = getProductInfo(productListData[productIdx], optionIdx);
					var targetContentEl = $(".pdd16-step-buying__card").eq(productIdx);
					var index = $(".pdd16-step-buying__card").index(targetContentEl);
					targetContentEl.find(".option-selector__swiper-wrapper").each(function (idx) {
						var tmpType = productListData[productIdx].optionTypeList[idx];
						var styleAttr = $(this).attr("style");
						productListData[productIdx].viewOptionObj[tmpType].styleAttr = styleAttr;
					});
					targetContentEl.replaceWith(buildProductCardGift(productInfo));
					// product card 를 새로 그려줬으므로 이벤트 새로 지정
					targetContentEl = $(document.querySelectorAll(".pdd16-step-buying__card")[index]);
					targetContentEl.addClass("is-show");
					window.sg.components.stepbuying.init();
					productCardListenerGift();
				}
				targetContentEl.find('.radio-v2__label').click();
			}, 300);
			
			if(!isStock){
				$("#giftContinue").addClass('cta--disabled').attr('disabled', true);
				$("#giftContinue").attr('aria-disabled', 'true')
			}else{
				if($("#giftContinue").hasClass('cta--disabled')){
					$("#giftContinue").removeClass('cta--disabled').attr('disabled', false);
				}
				$("#giftContinue").attr('aria-disabled', '')
			}
		});
		
		/* Card Radio 버튼 클릭 Event */
		$(".pdd16-step-buying.pdd16-step-buying--free-gift").off("click", ".radio-v2__label");
		$(".pdd16-step-buying.pdd16-step-buying--free-gift").on("click", ".radio-v2__label", function () {
			var _this = $(this);
			radioBundleBtn = _this;
			var inStockCard = _this.closest('.pdd16-step-buying__card').find('.pdd16-step-buying__card-state p');
			$(".pdd16-step-buying__header-price-text").html(mainPrice);
			selectProductList = new Array();
			selectIndexList = new Array();
			var index = _this.closest(".pdd16-step-buying__card").attr("data-index");
			const targetInput = _this.closest('.radio-v2').find('input[type="radio"]');
			var productIndex = index.split('-');
			var selectModel = productListData[productIndex[0]].modelList[productIndex[1]];
			var selectProductCode = "";
            var monthly = window.sg.components.dynamic.detailSharedObj.proudctPriceInfo.monthlyPriceInfo.tenureVal;
			var monthlyPrice = window.sg.components.dynamic.detailSharedObj.proudctPriceInfo.monthlyPriceInfo.tenureVal;
			var totalPrices = "";
			var priceHtml = "";
			var priceCurrency = $("#priceCurrency").val();
			
			var selectedItem = "";
			selectProductCode = selectModel.modelCode;
			selectIndexList.push(index);
			selectProductList.push(selectProductCode);

			if(selectProductList.length == 0){
				$("#giftContinue").addClass('cta--disabled').attr('disabled', true)
			}else{
				$("#giftContinue").removeClass('cta--disabled').attr('disabled', false)
			}
		});
	}
	
	function buildProductCard(product,idx) {
		let productCardTemplates = "";
		let productCardTemplate = "";
		const thirdPASeller = product.thirdPASeller;
		const frontModel = product.modelList[product.frontModelIdx];
		const chipOptions = frontModel.fmyChipList;
		let colorName = "";
		if(chipOptions.length > 0){
			for(let i=0; i<chipOptions.length; i++){
				if(chipOptions[i].fmyChipType === "COLOR"){
					colorName = (frontModel.fmyChipList[i].fmyChipLocalName !== '') ? frontModel.fmyChipList[i].fmyChipLocalName : frontModel.fmyChipList[i].fmyChipName;
					break;
				}
			}
		}
		const isStock = frontModel.isStock;
		const princeInfo = setPriceInfo(frontModel);
		const promotionPrice = princeInfo.promotionPrice;
		const savePriceTemp = princeInfo.savePriceTemp;
		const saveText = princeInfo.saveText;
		const productPriceDisplay = princeInfo.productPriceDisplay;
		const promotionPriceDisplay = princeInfo.promotionPriceDisplay;
		const tagging = "evoucher";
		let imageHtml = ""
		const key = idx;
		categoryIdx = idx;
		const imageUrl = frontModel.thumbUrl ? frontModel.thumbUrl : '';
		const imageAlt = frontModel.thumbUrlAlt ? frontModel.thumbUrlAlt : '';
		if( imageUrl ){
			imageHtml =
				`<img class="image__preview lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(imageUrl, "$LazyLoad_Home_PNG$")}" data-mobile-src="${addOnsImgDomain(imageUrl, "$LazyLoad_Home_PNG$")}" alt="${imageAlt}" role="img">
				<img class="image__main lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(imageUrl, "$240_240_PNG$")}" data-mobile-src="${addOnsImgDomain(imageUrl, "$480_480_PNG$")}" alt="${imageAlt}" role="img">`;
		}
		
		let badgeType = '';
		let badgeClass = '';
		if( frontModel.commercialFlag ){
			badgeType = frontModel.commercialFlag;
			badgeClass = 'badge-icon--bg-color-teal';
		}else if( frontModel.topFlags ){
			if( frontModel.topFlags.iconTitle && frontModel.topFlags.iconTypeCd ){
				badgeType = frontModel.topFlags.iconTypeCd;
				switch( badgeType.replace(/ /g,'').toUpperCase() ){
					case 'N':
						badgeType = Granite.I18n.get("new");
						badgeClass = 'badge-icon--bg-color-blue';
						break;
					case 'H':
						badgeType = Granite.I18n.get("hot");
						badgeClass = 'badge-icon--bg-color-red';
						break;
					case 'B':
						badgeType = Granite.I18n.get("best seller");
						badgeClass = 'badge-icon--bg-color-orange';
						break;
					case 'U':
						badgeType = frontModel.topFlags.iconTitle;
						badgeClass = 'badge-icon--bg-color-teal';
						break;
					default:
						break;
				}
			}
		}
		
		productCardTemplate += 
			`<!--/* (2022.06.21 수정) Badge 추가: badge 없을 시 .pdd16-step-buying__card-header-badge 영역 유지 */-->
			<div class="pdd16-step-buying__card-header-badge">
				<!--/* new의 bg color : blue, badge-icon--bg-color-blue 추가 */-->
				<!--/* best seller의 bg color : orange, badge-icon--bg-color-orange 추가 */-->
				<!--/* hot의 bg color : red, badge-icon--bg-color-red 추가 */-->
				<!--/* special deal의 bg color : blue, badge-icon--bg-color-blue 추가 */-->
				<!--/* eco의 bg color : green, badge-icon--bg-color-green 추가 */-->
				<!--/* trade-in의 bg color : teal, badge-icon--bg-color-teal 추가 */-->
				<!--/* gold tier의 bg color : gold, badge-icon--bg-color-gold 추가 */-->
				<!--/* silver tier의 bg color : silver, badge-icon--bg-color-silver 추가 */-->
				<!--/* registered tier의 bg color : silver, badge-icon--bg-color-neutral-blue 추가 */-->
				<!--/* user key-in의 bg color : Dark Cyan, badge-icon--bg-color-teal 추가 */-->
				<!--/* user key-in의 bg color : Black, badge-icon--bg-color-black 추가 */-->
				<!--/* user key-in의 bg color : Red, badge-icon--bg-color-red 추가 */-->
				<!--/* user key-in의 bg color : Blue, badge-icon--bg-color-blue 추가 */-->
				${badgeClass ? `<span class="badge-icon badge-icon--label ${badgeClass}">${badgeType}</span>` : ``}
			</div>`;

		productCardTemplate +=
			`<div class="pdd16-step-buying__card-title"><strong class="pdd16-step-buying__card-title-text">${frontModel.displayName}</strong>
                <div class="pdd16-step-buying__tooltip">${frontModel.displayName}</div>
            </div>
			<div class="image">
				${imageHtml}
			</div>
				`;
		// option 없을때 better-together__info안의 내용만 삭제 height값 유지
		// (2022.01.21 수정) Seller 없을 시 .pdd16-step-buying__card-seller 영역 유지
		productCardTemplate +=
			`<div class="pdd16-step-buying__card-seller">
				<p class="pdd16-step-buying__card-seller-text">
					${thirdPASeller ? `Granite.I18n.get("Seller") : thirdPASeller` : ``}
				</p>
			</div>
			<div class="pdd16-step-buying__card-option">
				<div class="option-selector option-selector__color-text">
					${colorName ?
					`<div class="option-selector__color-name">
								${Granite.I18n.get("Color")} 
								<span class="color-name-text">&nbsp;${colorName}</span>
					</div>` : '' }
					${productCardFmyOptionBuild(product)}
				</div>
			</div>`;
		// Product Fiche : fiche 내용없을경우 better-together__fich안의 내용만 삭제 height값 유지
		const isFiche = frontModel.energyLabelGrade && frontModel.ficheFileUrl;
		const isEnergy = frontModel.energyLabelGrade && frontModel.energyFileUrl;
		productCardTemplate +=
			`<div class="pdd16-step-buying__card-badge">
				<div class="badge-enery-label">
					${isFiche ? 
					`<a href="${frontModel.ficheFileUrl}" target="_blank" title="${Granite.I18n.get("Open in a new window")}" class="cta-text" an-tr="pdd16_product bought together-${pageTrack}-text-product fiche" an-ca="option click" an-ac="bridge" an-la="${tagging}:product fiche">${Granite.I18n.get("Product Fiche")}</a>`:''}
					${isEnergy ? 
					`<a class="badge ${frontModel.energyLabelClass2}" href="${frontModel.energyFileUrl}" target="_blank" title="${frontModel.energyLabelGrade}">
						<span class="badge__grade--with-text ${frontModel.energyLabelClass1}">
							<span class="hidden">${frontModel.energyLabelGrade}</span>
						</span>
					</a>`:''}
				</div>
			</div>`;
		
		let cardWasDisplay = princeInfo.promotionPrice !== null && princeInfo.promotionPrice !== "" && princeInfo.promotionPrice !== "0" && 
								Number(parseFloat(princeInfo.productPrice).toFixed(2)) !== Number(parseFloat(princeInfo.promotionPrice).toFixed(2)) ? true : false;
		if( lowestWasPriceCountry ){
			cardWasDisplay = false;
		}
		if (siteCode !== "pl" || isStock) {
			if( cardWasDisplay ){
				productCardTemplate +=
					`<div class="pdd16-step-buying__card-price">
		                <strong class="card-price">${princeInfo.promotionPriceDisplay}</strong>
		                <span class="card-was">
		                  <span class="hidden">Original Price: ${princeInfo.productPriceDisplay}</span>
		                  <input type="hidden" value="${princeInfo.promotionPrice}">
		                  <del>${princeInfo.productPriceDisplay}</del>
		                </span>
		              </div>`;
			}else{
				productCardTemplate +=
				`<div class="pdd16-step-buying__card-price">
					<strong class="card-price">${(princeInfo.promotionPrice && (princeInfo.promotionPrice <= princeInfo.productPrice)) ? princeInfo.promotionPriceDisplay : princeInfo.productPriceDisplay}</strong>
				</div>`;
			}
			
		}else{
			productCardTemplate +=
				`<div class="pdd16-step-buying__card-price"></div>`;
		}

		let ctaTitle;
		let isSelected = selectIndexList.includes(key + '-' + frontModel.idx);
		const addI18n = Granite.I18n.get("Add");
		const addedI18n = Granite.I18n.get("Added");
		const getStockAlertI18n = Granite.I18n.get("Get Stock Alert");
		const comingSoonI18n = Granite.I18n.get("COMING SOON");
		let isComingSoon = false;
		if (!isStock) {
			ctaTitle = getStockAlertI18n;// 팝업시 js-cta-stock 추가
		} else if (isSelected) {
			ctaTitle = addedI18n;
		} else {
			ctaTitle = addI18n;
		}
		if( isOldHybris || isNewHybris ){
			if(isStock == null || isStock == undefined || princeInfo == null || princeInfo == undefined){
				ctaTitle = comingSoonI18n;
				isComingSoon = true;
			}
		}
		
		let data_price = "";
		if(princeInfo.promotionPrice !== null  && princeInfo.promotionPrice !== "" && princeInfo.promotionPrice !== "0"){
			data_price = princeInfo.promotionPrice;
		}else{
			data_price = princeInfo.productPrice;
		}
		const productPrice = princeInfo.productPrice;
		const saveProductPrice = princeInfo.savePriceTemp;
		const antrTagging = `pdd16_step buying-${pageTrack}-cta-button`;
		productCardTemplate +=
				`<div class="pdd16-step-buying__card-cta">
					<button class= " ${isComingSoon ? 'cta--disabled' : '' } cta cta--contained cta--icon cta--icon-leading cta--2line-mo ${!isStock ? 'js-cta-stock cta--outlined' : 'cta--black' } ${isSelected ? " cta--on":""}" title="${ctaTitle}" aria-selected="" 
						an-tr="${antrTagging}" an-ca="${!isStock ? 'buy cta' : 'option click'}" an-ac="${!isStock ? 'stock alert' : 'bridge'}" an-la="vd add-on:${!isStock ? 'get stock alert' : 'add item'}" 
						data-modelcode="${frontModel.modelCode}" data-modelname="${frontModel.modelName}" data-price=${data_price} data-text=${addI18n} data-text-selected="${addedI18n}" data-oriprice="${productPrice}" data-savePrice="${saveProductPrice}">
							<span>${ctaTitle}</span>
							<svg class="icon" focusable="false">
								<use xlink:href="#done-bold" href="#done-bold">
								</use>
							</svg>
					</button>
					<div class="pdd16-step-buying__card-cta-learn-more">
						<button class="cta cta--outlined cta--black cta--2line-mo learn-more-btn" an-tr="pdd16_step buying-product detail-cta-button" an-ca="option click" an-ac="bridge" an-la="vd add-on:learn more" data-modelcode="${frontModel.modelCode}" data-modelname="${frontModel.modelName}">
							${Granite.I18n.get("Learn more")}
						</button>
					</div>
				</div>`;
		productCardTemplates = `<div class="pdd16-step-buying__card" data-index="${key}-${frontModel.idx}" data-price="${promotionPrice}">
									${productCardTemplate}
								</div>`;
		return productCardTemplates;
	}
	
	var isSelectedIdx = "";
	function buildProductCardGift(product) {
		const outOfStockI18n = Granite.I18n.get("Out Of Stock");
		var productCardTemplates = "";
		var productCardTemplate = "";
		var cardTemplate = "";
		var frontModel = product.modelList[product.frontModelIdx];
		var isSelected = frontModel.idx == isSelectedIdx;
		var chipOptions = frontModel.fmyChipList;
		var colorName = "";
		if(chipOptions.length > 0){
			for(var i = 0; i < chipOptions.length; i++){
				if(chipOptions[i].fmyChipType == "COLOR"){
					colorName = (frontModel.fmyChipList[i].fmyChipLocalName !== '') ? frontModel.fmyChipList[i].fmyChipLocalName : frontModel.fmyChipList[i].fmyChipName;
					break;
				}
			}
		}
		var isStock = frontModel.isStock;
		var princeInfo = setPriceInfo(frontModel);
		var promotionPrice = princeInfo.promotionPrice;
		var savePriceTemp = princeInfo.savePriceTemp;
		var saveText = princeInfo.saveText;
		var productPriceDisplay = princeInfo.productPriceDisplay;
		var promotionPriceDisplay = princeInfo.promotionPriceDisplay;
		var imageHtml = "";
		var cardNumber = frontModel.idx.split('-')[0];
		if (frontModel.thumbUrl) {
			imageHtml =
				`<img class="image__preview lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(frontModel.thumbUrl, "$LazyLoad_Home_PNG$")}" data-mobile-src="${addOnsImgDomain(frontModel.thumbUrl, "$LazyLoad_Home_PNG$")}" alt="${frontModel.thumbUrlAlt}" role="img">
				<img class="image__main lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(frontModel.thumbUrl, "$240_240_PNG$")}" data-mobile-src="${addOnsImgDomain(frontModel.thumbUrl, "$480_480_PNG$")}" alt="${frontModel.thumbUrlAlt}" role="img">`;
		}
		productCardTemplate +=
			`<div class="pdd16-step-buying__card-title"><strong class="pdd16-step-buying__card-title-text">${frontModel.displayName}</strong>
                <div class="pdd16-step-buying__tooltip">${frontModel.displayName}</div>
            </div>
			<div class="image">
				${imageHtml}
			</div>
				`;
		var cardState = "";
		if(!isStock){ // 해당 제품의 재고가 없다면 OOS 문구를 띄워줌.
			cardState = outOfStockI18n;
		}
		productCardTemplate +=
			`<div class="pdd16-step-buying__card-option" style="height:84.4375px">
				<div class="option-selector option-selector__color-text">
					${colorName != "" ?
						`<div class="option-selector__color-name">
									${Granite.I18n.get("Color")}
									<span class="color-name-text">&nbsp;${colorName}</span>
						</div>` : '' }
					${productCardFmyOptionBuild(product)} 
				</div>
			</div>
			<div class="pdd16-step-buying__card-state">
				<p>${cardState}</p>
			</div>`;
		
		if (isSENA) {
			if(princeInfo.promotionPrice != null  && princeInfo.promotionPrice !== "" && princeInfo.promotionPrice != "0"){
				productCardTemplate +=
					`<div class="pdd16-step-buying__card-price">
		                <strong class="card-price">${princeInfo.promotionPriceDisplay}</strong>
		                <span class="card-was">
		                  <span class="hidden">Original Price: ${princeInfo.productPriceDisplay}</span>
		                  <input type="hidden" value="${princeInfo.promotionPrice}">
		                  <del>${princeInfo.productPriceDisplay}</del>
		                </span>
		              </div>`;
			}else{
				productCardTemplate +=
					`<div class="pdd16-step-buying__card-price">
		                <strong class="card-price">${princeInfo.productPriceDisplay}</strong>
		              </div>`;
			}
			
		}

		let modelCode = '';
		modelCode = frontModel.modelCode;
		
		productCardTemplate += 
			`
				<div class="pdd16-step-buying__card-input">
                    <div class="radio-v2">
                      <input type="radio" name="radio" class="hidden" id="radio-id-${cardNumber}" data-modelcode="${modelCode}" data-modelname="${frontModel.modelName}" ${isStock ? '' : "disabled checked"} ${isSelected ? " checked":""}>
                      <label class="radio-v2__label" for="radio-id-${cardNumber}">
                        <span class="radio-v2__label-box-wrap">
                          <span class="radio-v2__label-box">
                            <span class="radio-v2__label-box-circle"></span>
                          </span>
                        </span>
                        <span class="radio-v2__label-text">Selecting item</span>
                      </label>
                    </div>
                  </div>
			`;
		productCardTemplates = `<div class="pdd16-step-buying__card" data-index="${frontModel.idx}" data-modelcode="${modelCode}">
									${productCardTemplate}
								</div>`;
		return productCardTemplates;
	}
	
	function productCardFmyOptionBuild(product, flag){
		let nextI18n = Granite.I18n.get("Next");

		if(localConfigurator.get("useAddOnNextI18n")){
			// addon 한정으로 문구 변경시 "Next (addon)" 키 값 사용
			nextI18n = Granite.I18n.get("Next (addon)");
		}

		let optionHtml = "";
		const frontModel = product.modelList[product.frontModelIdx];
		if (product.viewOptionObj && Object.keys(product.viewOptionObj).length > 0) {
			// 상위 선택된 옵션칩의 model idx : disable 처리 할때 사용 ( idx에 해당되지않으면 disabled )
			let parentOptionModelIdx = "";
			let viewOptionIdx = 0;
			const curViewOptionObj = product.viewOptionObj;
			const curOptionTypeList = product.optionTypeList;

			for(const type in product.viewOptionObj) {
				const optionDataType = type.toLowerCase().replace(/ /g, "-");
				const optionObj = product.viewOptionObj[type].optionList;
				let isSelected = false;
				let currentOption = {};
				let disabledClass = "";
				let selectorWrapperStyle = "";
				const tagging = "evoucher";

				if (product.viewOptionObj[type].styleAttr) {
					selectorWrapperStyle = product.viewOptionObj[type].styleAttr;
				}

				if (type === "COLOR") {
					var curSelecteModelIdx = "";
					var colorOptionHtml = "";
					for (var option in optionObj) {
						var colorOptionCount = optionObj.length;
						/* 선택되어있는(대표모델) 옵션 flag값 셋팅 */
						currentOption = optionObj[option];
						isSelected = false;
						var modelIdxList = currentOption.modelIdx.split(',');

						if (currentOption.modelIdx != null && arrayContains(modelIdxList, String(product.frontModelIdx))) {
							isSelected = true;
							curSelecteModelIdx = currentOption.modelIdx;
						}

						// 각 옵션칩의 model 정보 셋팅 ( 태깅 )
						var modelCodeAttrForTagging = "";
						var modelNameAttrForTagging = "";
						var modelIdx;
						var curSelectOptionMoIdx = currentOption.modelIdx;
						var otherSelectedOptionMoIdxList = [];
						var isColorType = true;

						for (var ooi in curViewOptionObj) {
							if (ooi !== type) {
								var tmp_optionList = curViewOptionObj[ooi].optionList;
								for (var toi in tmp_optionList) {
									var tmp_option = tmp_optionList[toi];
									var tmp_optionMoIdx = tmp_option.modelIdx;
									var tmp_optionMoIdxArr = tmp_optionMoIdx.split(',');

									// 현재 선택되어있는 option 색출
									if (tmp_optionMoIdxArr.indexOf(String(product.frontModelIdx)) > -1) {
										otherSelectedOptionMoIdxList.push(tmp_optionMoIdx);
									}
								}

							}
						}
						
						modelIdx = getSelectedModelIdx(curViewOptionObj, curSelectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, curOptionTypeList);
						if (product.modelList.length > modelIdx && product.modelList[modelIdx]) {
							modelCodeAttrForTagging = product.modelList[modelIdx].modelCode;
							modelNameAttrForTagging = product.modelList[modelIdx].modelName;
						}
						var modelOriPrice = product.modelList[modelIdx].price;
						var modelProPrice = product.modelList[modelIdx].promotionPrice;
						var modelSavPrice = modelOriPrice - modelProPrice;
						
						var chipId = 'pdd16-' + optionDataType + '-' + categoryIdx + '-' + product.modelList[modelIdx].idx;
						var chipName = 'pdd16-' + optionDataType + '-' + categoryIdx;
						const isMultiColorYN = currentOption.multiColorYN;

						colorOptionHtml +=
							`<span class="option-selector__swiper-slide${disabledClass}">
								<span class="option-selector__color">
									<input type="radio" id="${chipId}" name="${chipName}" data-modeli="${modelIdx}" ${(isSelected?' checked':'')} ${(disabledClass === ""?"":" disabled")}
										an-tr="pdd16_step buying-${pageTrack}-select-option" an-ca="option click" an-ac="bridge" an-la="vd ${tagging}:${type.toLowerCase()}:${currentOption.optionName.toLowerCase()}"
										data-modelcode="${modelCodeAttrForTagging}" data-modelname="${modelNameAttrForTagging}" data-price="${modelOriPrice}" data-promotionPrice="${modelProPrice}" data-saveprice="${modelSavPrice}" data-index="${product.modelList[modelIdx].idx}">
									<label for="${chipId}">
										${
											((isMultiColorYN)=>{
												let colorChipHtml = '';
												if(isMultiColorYN != "Y"){
													colorChipHtml = /*html*/`<span class="option-selector__color-code" style="background-color: ${currentOption.optionCode}">${currentOption.optionLocalName}</span>`
												}else{
													const multiColorList = currentOption.multiColorList;
													if(multiColorList){
														colorChipHtml += getMultiColorOptionChipHtml(multiColorList);
													}
												}
												return colorChipHtml;

											})(isMultiColorYN)
										}
										<span class="hidden">${currentOption.optionName}</span>
									</label>
								</span>
							</span>`;
					}
					parentOptionModelIdx = curSelecteModelIdx;
					const showSwiperButton = colorOptionCount > 5 ? true : false;
					optionHtml +=
						`
						<div class="option-selector__wrap option-selector__wrap--color-chip swiper-mode ${flag == true ? '' : 'option-selector__wrap'}" data-desktop-view="5" data-mobile-view="2">
							<div class="option-selector__swiper">
								<div class="option-selector__swiper-container" aria-live="polite">
									<div class="option-selector__swiper-wrapper" style="transform: translateX(0px);">
										${colorOptionHtml}
									</div>
								</div>
								<button type="button" class="option-selector__button-prev ${showSwiperButton ? '' : 'option-selector__button--disabled'}" aria-label="Previous" role="button" aria-disabled="true"  tabindex="0" style="display:block;">
									<span class="hidden">${Granite.I18n.get("Previous")}</span>
									${showSwiperButton ? 
									`<svg class="icon" focusable="false">
										<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#previous-regular"></use>
									</svg>` : '' }
								</button>
								<button type="button" class="option-selector__button-next ${showSwiperButton ? '' : 'option-selector__button--disabled'}" aria-label="Next" role="button" aria-disabled="true" tabindex="0" style="display:block;">
									<span class="hidden">${nextI18n}</span>
									${showSwiperButton ?
									`<svg class="icon" focusable="false">
										<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#next-regular" ></use>
									</svg>` : '' }
								</button>
							</div>
						</div>
						`;
				} else if (type === "MOBILE MEMORY" || type === "TV SIZE" || type === "HOME APPLIANCE SIZE" || type === "MONITOR SCREEN SIZE") {
					// IM: Color | Capacity (Memory) | Carrier, VD: Size, DA: Material | Size
					let curSelecteModelIdx = '';
					let memoryOptionHtml = "";
					let capacityOptionCount = 0;
					for( let oi=0; oi<optionObj.length; oi++ ){
						/* 선택되어있는(대표모델) 옵션 flag값 셋팅 */
						capacityOptionCount = optionObj.length;
						currentOption = optionObj[oi];
						isSelected = false;
						const modelIdxList = currentOption.modelIdx.split(',');

						if( currentOption.modelIdx != null && arrayContains(modelIdxList, String(product.frontModelIdx)) ){
							isSelected = true;
							curSelecteModelIdx = currentOption.modelIdx;
						}

						// 각 옵션칩의 model 정보 셋팅 ( 태깅 )
						let modelCodeAttrForTagging = "";
						let modelNameAttrForTagging = "";
						let modelIdx;

						const curSelectOptionMoIdx = currentOption.modelIdx;
						let otherSelectedOptionMoIdxList = [];
						let isColorType = false;

						for( const ooi in curViewOptionObj ){
							if (ooi !== type) {
								const tmp_optionList = curViewOptionObj[ooi].optionList;
								for( const toi in tmp_optionList ){
									const tmp_option = tmp_optionList[toi];
									const tmp_optionMoIdx = tmp_option.modelIdx;
									const tmp_optionMoIdxArr = tmp_optionMoIdx.split(',');

									// 현재 선택되어있는 option 색출
									if (tmp_optionMoIdxArr.indexOf(String(product.frontModelIdx)) > -1) {
										otherSelectedOptionMoIdxList.push(tmp_optionMoIdx);
									}
								}
							}
						}

						modelIdx = getSelectedModelIdx(curViewOptionObj, curSelectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, curOptionTypeList);
						if (product.modelList.length > modelIdx && product.modelList[modelIdx]) {
							modelCodeAttrForTagging = product.modelList[modelIdx].modelCode;
							modelNameAttrForTagging = product.modelList[modelIdx].modelName;
						}
						
						const chipId = 'pdd16-' + optionDataType + '-' + categoryIdx + '-' + product.modelList[modelIdx].idx;
						const chipName = 'pdd16-' + optionDataType + '-' + categoryIdx + '-'+ product.modelList[modelIdx].idx;

						memoryOptionHtml +=
							`<span class="option-selector__swiper-slide${disabledClass}">
								<span class="option-selector__size">
									<input type="radio" id="${chipId}" name="${chipName}" data-modeli="${modelIdx}"${(isSelected?' checked':'')}${(disabledClass === ""?"":" disabled")}
										an-tr="pdd16_step buying-${pageTrack}-select-option" an-ca="option click" an-ac="bridge" an-la="vd ${tagging}:${type.toLowerCase()}:${currentOption.optionName.toLowerCase()}"
										data-modelcode="${modelCodeAttrForTagging}" data-modelname="${modelNameAttrForTagging}" data-index="${product.modelList[modelIdx].idx}">
									<label class="option-selector__size-label" for="${chipId}">
										<span class="option-selector__size-label-text">${currentOption.optionLocalName}</span>
									</label>
								</span>
							</span>`;
					}
					parentOptionModelIdx = curSelecteModelIdx;
					const showSwiperButton = capacityOptionCount > 2 ? true : false;
					optionHtml +=
						`<div class="option-selector__wrap option-selector__wrap--capacity swiper-mode ${flag == true ? '' : 'option-selector__wrap'}" data-desktop-view="3" data-mobile-view="2">
							<div class="option-selector__swiper">
								<div class="option-selector__swiper-container" aria-live="polite">
									<div class="option-selector__swiper-wrapper" style="${selectorWrapperStyle}">
										${memoryOptionHtml}
										<div class="option-selector__floating-bar" style="display: none;"></div>
									</div>
								</div>
								<button type="button" class="option-selector__button-prev ${showSwiperButton ? '' : 'option-selector__button--disabled'}" aria-label="Previous" role="button" aria-disabled="true" tabindex="0" style="display:block;">
									<span class="hidden">${Granite.I18n.get("Previous")}</span>
									${showSwiperButton ?
									`<svg class="icon" focusable="false">
										<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#previous-regular" ></use>
									</svg>` : ''}
								</button>
								<button type="button" class="option-selector__button-next ${showSwiperButton ? '' : 'option-selector__button--disabled'}" aria-label="Next" role="button" aria-disabled="true" tabindex="0" style="display:block">
									<span class="hidden">${nextI18n}</span>
									${showSwiperButton ?
									`<svg class="icon" focusable="false">
										<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#next-regular" ></use>
									</svg>` : '' }
								</button>
							</div>
						</div>`;
				}
				viewOptionIdx++;
			}
		}
		return optionHtml;
	}
	
	function bundleGrid(bundleIdx){
		const addI18n = Granite.I18n.get("Add");
		const addedI18n = Granite.I18n.get("Added");
		const outOfStockI18n = Granite.I18n.get("Out Of Stock");
		let imageHtml = ""; 
		let productCardTemplate = ""; 
		const bundleOriPrice = productBundleListData[bundleIdx].priceValue;
		const bundlePromotionPrice = productBundleListData[bundleIdx].promotionPriceValue ? productBundleListData[bundleIdx].promotionPriceValue : bundleOriPrice;
		const bundleSavePrice = bundlePromotionPrice ? bundleOriPrice - bundlePromotionPrice : 0;
		const bundleDisplayPrice = productBundleListData[bundleIdx].promotionPrice ? productBundleListData[bundleIdx].promotionPrice : productBundleListData[bundleIdx].price;
		imageHtml = `<img class="image__preview lazy-load responsive-img" data-desktop-src='${addOnsImgBundleDomain(productBundleListData[bundleIdx].imageUrl, "$LazyLoad_Home_PNG$")}' data-mobile-src="${addOnsImgBundleDomain(productBundleListData[bundleIdx].imageUrl, "$LazyLoad_Home_PNG$")}"  alt="" role="img"> 
					<img class="image__main lazy-load responsive-img" data-desktop-src='${addOnsImgBundleDomain(productBundleListData[bundleIdx].imageUrl)}' data-mobile-src="${addOnsImgBundleDomain(productBundleListData[bundleIdx].imageUrl)}" alt=""  role="img">`; 
		productCardTemplate += `
								<div class="pdd16-step-buying__card-title">
									<strong class="pdd16-step-buying__card-title-text">${productBundleListData[bundleIdx].name}</strong> 
									<div class="pdd16-step-buying__tooltip">${productBundleListData[bundleIdx].name}</div> 
								</div> 
								<div class="image image--main-loaded"> ${imageHtml} </div> `; 
		
		const stocklevel = productBundleListData[bundleIdx].stocklevel.toLowerCase();
		let isStock = stocklevel !== 'outofstock' ? true : false;
		if( isStock ){
			if( !relatedProductsBundleTotal || relatedProductsBundleTotal.length == 0 ){
				isStock = false;
			} else {
				// 팝업 노출기준 : 3개의 번들 제품 그룹이 존재 하다면 3개 중 그룹별로 하나라도 가능한 모델이 있어야 팝업 노출 가능
				for( const relatedData of relatedProductsBundleTotal ){
					if( relatedData.bundleModelCode === productBundleListData[bundleIdx].modelCode ){
						const sameGroup = [];
						for(const key in relatedData ){
							if( key !== 'bundleModelCode' && relatedData[key] ){
								if(!sameGroup[relatedData[key].groupCode]){
									sameGroup[relatedData[key].groupCode] = [];
								}
								if( relatedData[key].stocklevel !== 'outOfStock' && relatedData[key].colorCode ){
									sameGroup[relatedData[key].groupCode] .push(relatedData[key]);
								}
							}
						}
						for( const group in sameGroup){
							if(isStock && sameGroup[group].length == 0){
								isStock = false;
							}
						}
					}
				}
			}
		}
		const state = isStock ? addI18n : outOfStockI18n;	
		productCardTemplate += `
								<div class="pdd16-step-buying__card-option" style="height:84.4375px"> 
									<div class="option-selector option-selector__color-text"> 
										<div class="option-selector__color-name"> 
										</div> 
									</div> 
								</div> 
								<div class="pdd16-step-buying__card-badge"> 
									<div class="badge-energy-label"> 
									</div> 
								</div> 
								<div class="pdd16-step-buying__card-price">
									<strong class="card-price">${bundleDisplayPrice}</strong>
									<span class="card-was">
										<span class="hidden">Original Price: ${bundleOriPrice}</span>
										<input type="hidden" value="${bundlePromotionPrice}">
										${bundleSavePrice && !eppPl ? `<del>${productBundleListData[bundleIdx].price}</del>` : ``}
									</span>
								</div>`; 
		productCardTemplate += `
								<button class="cta cta--contained cta--icon cta--icon-leading bundleSelect cta--bundle ${!isStock ? 'js-cta-stock cta--outlined' : 'cta--black'}" title="SELECT" id="bundleSelect" data-modelcode="${productBundleListData[bundleIdx].modelcode}" data-originPrice=${bundleOriPrice} data-savePrice=${bundleSavePrice} data-promotionPrice=${bundlePromotionPrice} aria-selected
								an-tr="pdd16_product bought together-product detail-popup-add" an-ca="option click" data-text="${addI18n}" data-text-selected="${addedI18n}"> 
									<span>${state}</span>
									<svg class="icon" focusable="false"> 
									<use xlink:href="#done-bold" href="#done-bold">
									</use> 
									</svg> 
								</button> `; 
		return productCardTemplate;
	}
	
	function getProductInfo(product, frontModelIdx) {
		var tempProduct = product;
		if (tempProduct.modelList[frontModelIdx].displayName == null) {
			tempProduct.modelList[frontModelIdx].displayName = "";
		}

		/*
		 * viewOptionObj : 전체 옵션칩 리스트 optionTypeList : 옵션 타입만 담고 있는 리스트 ( 옵션타입의
		 * index 값을 구하기 위해 생성함 )
		 */

		var tmpOptionListInModel = {};
		for (var mi in tempProduct.modelList) {
			var tmpModel = tempProduct.modelList[mi];
			var tmpFmyChipList = tmpModel.fmyChipList;

			for (var fci in tmpFmyChipList) {
				// fmyChipCode에 " 제거
				var thisOptionKey = tmpFmyChipList[fci].fmyChipType + '+' +
					tmpFmyChipList[fci].fmyChipCode.replace("\"", "").replace("&quot;", "") + '+' +
					tmpFmyChipList[fci].fmyChipLocalName.replace("\"", "").replace("&quot;", "");

				if (tmpOptionListInModel[thisOptionKey] == undefined) {
					tmpOptionListInModel[thisOptionKey] = mi;
				} else {
					tmpOptionListInModel[thisOptionKey] += "," + mi;
				}
			}
		}

		var optionTypeList = [];
		var viewOptionObj = {};
		if (tempProduct.chipOptions) {
			for (var a = 0; a < tempProduct.chipOptions.length; a++) {
				var optionData = tempProduct.chipOptions[a];
				var optionTypeTmp = optionData.fmyChipType;

				var optionListInType = optionData.optionList;
				for (var opl in optionListInType) {
					var thisOptionKey = optionData.fmyChipType + '+' +
						optionListInType[opl].optionCode.replace("\"", "").replace("&quot;", "") + '+' +
						optionListInType[opl].optionLocalName.replace("\"", "").replace("&quot;", "");
					if (tmpOptionListInModel[thisOptionKey] != undefined) {
						optionListInType[opl].modelIdx = tmpOptionListInModel[thisOptionKey];
					}

				}
				viewOptionObj[optionTypeTmp] = {};
				viewOptionObj[optionTypeTmp]["optionList"] = optionListInType;

				optionTypeList.push(optionTypeTmp);
			}
		}
		tempProduct.viewOptionObj = viewOptionObj;
		tempProduct.optionTypeList = optionTypeList;

		tempProduct.frontModelIdx = frontModelIdx;
		
		return tempProduct;
	}
	
	function setPriceInfo(model) {
		var productPrice = model.price;
		var promotionPrice = model.promotionPrice;
		var savePriceTemp = Number((productPrice - promotionPrice).toFixed(2));
		var saveText = currencyComma(savePriceTemp, currency);
		var productPriceDisplay = !model.priceDisplay ? currencyComma(productPrice, currency) : model.priceDisplay;
		var promotionPriceDisplay = !model.promotionPriceDisplay ? currencyComma(promotionPrice, currency) : model.promotionPriceDisplay;

		return {
			"promotionPrice": promotionPrice,
			"productPrice": productPrice,
			"savePriceTemp": savePriceTemp,
			"saveText": saveText,
			"productPriceDisplay": productPriceDisplay,
			"promotionPriceDisplay": promotionPriceDisplay
		}
	}
	
	function getSelectedModelIdx(viewOptionObj, selectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, optionTypeList){
		var modelIdx = 0;
		var modelIdxList = selectOptionMoIdx.split(',');
		var firstIdx = modelIdxList[0];
		var memoryIdx = optionTypeList.indexOf("MEMORY");

		if ( (isHybris || isGlobal) && isColorType && memoryIdx > 0) {
			// [global, hybrisIntg] 상위 옵션이 color 이고, 하위에 같이 바뀌는 옵션이 memory 일 때 가장 큰값으로 선택처리
			var memoryOptionList = viewOptionObj["MEMORY"].optionList;
			var selectedModelIdx = 0;
			var highestOption = 0;
			for (var moi in memoryOptionList) {
				var temp_mi = memoryOptionList[moi].modelIdx.split(',');
				for (var tmi in temp_mi) {
					// 선택한 옵션칩의 modelIdx 리스트에 해당하는 model idx 가 있으면 비교
					if (arrayContains(modelIdxList, temp_mi[tmi])) {
						var this_memory_num = memoryOptionList[moi].optionCode.replace("TB", "000").replace(/[^0-9]/g, "");
						if (highestOption < this_memory_num) {
							highestOption = this_memory_num;
							selectedModelIdx = temp_mi[tmi];
						}
						break;
					}
				}
			}
			modelIdx = selectedModelIdx;
		} else {
			var tempMappingModelIdx = [];
			for (var omi in otherSelectedOptionMoIdxList) {
				var otherMoIdx = otherSelectedOptionMoIdxList[omi];
				if (otherMoIdx) {
					var otherMoIdxArr = otherMoIdx.split(',');
					tempMappingModelIdx = [];
					for (var mli in modelIdxList) {
						if (otherMoIdxArr.indexOf(String(modelIdxList[mli])) > -1) {
							tempMappingModelIdx.push(modelIdxList[mli]);
						}
					}
					if (tempMappingModelIdx.length > 0) {
						modelIdxList = tempMappingModelIdx;
					}
				}
			}
			if (modelIdxList.length > 0) {
				modelIdx = modelIdxList[0];
			} else {
				modelIdx = firstIdx;
			}
		}
		return modelIdx;
	};
	
	function newObjectSetting(value){
		const outNewObject = new Object();
		for(const[idx,val] of Object.entries(value)){
			outNewObject[idx] = val;
		}

		let newModelList = new Array();
		let newModelListSet = new Set();

		for(let i = 0; i < value.modelList.length; i++){
			const newObject = new Object();
			for(const[idx,val] of Object.entries(value.modelList[i])){
				newObject[idx] = val;
			}
			newModelList.push(newObject);
		}
		outNewObject.modelList = new Array();
		outNewObject.modelList = newModelList;
		return outNewObject;
	}
	
	function resetProduct() {
		selectIndexList = new Array();
		selectProductList = new Array();
		selectProductImgList = new Array();
		selectedBundlePopupData = {};
	}
	
	function gridRating(ratings, reviewCount){
		if( !ratings ){ 
			ratings = 0; 
		}
		// rating 반올림 처리
		const tmpCount = Math.pow(10,1);
		ratings = Math.round(ratings*tmpCount)/tmpCount;
		const ratingValue = parseFloat(ratings).toFixed(1),
		fullStarCnt = parseInt(ratings);
		let cutStarWidthStyleNum = 0;
		cutStarWidthStyleNum = parseInt((ratingValue-fullStarCnt)*100);
		if(ratingValue !== "0.0"){
			ratings = ratingValue;
		}
	
		let latingHtml = `	<span class="rating__star-list">`;
		for(var j=0; j<fullStarCnt;j++){
			latingHtml += `		<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 100%;"></span></span>`;
		}
		if(fullStarCnt < 5 && fullStarCnt > 0){
			latingHtml += `		<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width:${cutStarWidthStyleNum}%;"></span></span>`;
			for(var k=4;k>fullStarCnt;k--){
				latingHtml += `	<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>`;
			}
		} else if ( fullStarCnt === 0 ){
			for(var empty_idx=0;empty_idx<5;empty_idx++){
				latingHtml += `	<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>`;
			}
		}
		latingHtml += `		</span>
							<strong class="rating__point"><span class="hidden">${Granite.I18n.get('Product Ratings')} : </span><span>${ratings}</span></strong>
							<em class="rating__review-count">(<span class="hidden">${Granite.I18n.get('Number of Ratings')} :</span><span>${reviewCount ? reviewCount : 0}</span>)</em>`;
		return latingHtml;
	}

	function addOnsImgBundleDomain(imgUrl, preset, iconFl) {
		/*
		 * 기존 addOnsImgDomain 사용 시 아래 이미지 경로 이상하게 변경되어 신규 제작
		 * https://images.samsung.com/nz/smartphones/galaxy-s22-ultra/buy/Watch_Bundle_B0.png?$THUB_SHOP_L$ >>
		 * tps://images.samsung.com/nz/smartphones/galaxy-s22
		 */ 
		
		var newUrl = "";
		var useScene7domain = $("#scene7domain").val();
		if (imgUrl) {
			if (imgUrl.indexOf("?") > -1) { // 프리셋 안 붙이고 add-ons에서 붙임- hybris용
				imgUrl = imgUrl.replace("medias","");
				imgUrl = imgUrl.substring(0, imgUrl.indexOf("?"));
				imgUrl += "?" + preset;
			} else {
				preset = "?" + preset;
			}
			if (imgUrl.indexOf("https:") > -1 || imgUrl.indexOf("http:") > -1 || imgUrl.indexOf("//stg-images.samsung.com/") > -1 || imgUrl.indexOf("//images.samsung.com/") > -1 || imgUrl.indexOf("image.samsung.com/") > -1) {
				newUrl = imgUrl;
			} else {
				if (iconFl) useScene7domain = useScene7domain.replace("/image/", "/content/");
				newUrl = useScene7domain + imgUrl;
			}
		}
		return newUrl;
	}
	
	function addOnsImgDomain(imgUrl, preset, iconFl) {
		var newUrl = "";
		var useScene7domain = $("#scene7domain").val();
		if (imgUrl) {
			if (imgUrl.indexOf("?") > -1) { // 프리셋 안 붙이고 add-ons에서 붙임- hybris용
				imgUrl = imgUrl.replace("medias","");
				imgUrl = imgUrl.substring(2, imgUrl.indexOf("?"));
				imgUrl = imgUrl.substring(0,imgUrl.lastIndexOf('-'));
				preset = "";
			} else {
				preset = "?" + preset;
			}
			if (imgUrl.indexOf("https:") > -1 || imgUrl.indexOf("http:") > -1 || imgUrl.indexOf("//stg-images.samsung.com/") > -1 || imgUrl.indexOf("//images.samsung.com/") > -1 || imgUrl.indexOf("image.samsung.com/") > -1) {
				newUrl = imgUrl;
			} else {
				if (iconFl) useScene7domain = useScene7domain.replace("/image/", "/content/");
				newUrl = useScene7domain + imgUrl;
			}
		}
		return newUrl;
	}
	
	function arrayContains(array, element) {
		for (var i = 0; i < array.length; i++) {
			if (array[i] === element) {
				return true;
			}
		}
		return false;
	}
	
	function setCtaTagging() {
		var cartEl = $("#primaryInfoGoCartAddOn");
		cartEl.attr("an-tr", "pdd16_step buying-" + pageTrack + "-ecommerce2")
			.attr("an-ca", "ecommerce")
			.attr("an-ac", "addToCart")
			.attr("an-la", "vd add-on:checkout");
		
		if (selectIndexList.length > 0) {
			var modelCode = "";
			var modelName = "";
			var modelPrice = "";
			var discountprice = "";
			var pviTypeName = "";
			var pviSubtypeName = "";
			var categorySubTypeEngName = "";
			var modelrevenue = "";
			var modelqty = "";
			displayName = "";
			for (var i = 0; i < selectIndexList.length; i++) {
				var selectIndex = selectIndexList[i]; // familyNum - modelNum
				var categoryKey = selectIndex.split('-')[0];
				var familyIdx = selectIndex.split('-')[1];
				var modeIdx = selectIndex.split('-')[2];
				var model = productListData[categoryKey].category.productList[familyIdx].modelList[modeIdx];
				var princeInfo = setPriceInfo(model);
				var price = princeInfo.productPrice;
				var qty = 1;
				var comma = '';
				var colon = '';
				if (i > 0) {
					comma = ',';
					colon = ';';
				}
				modelCode += comma + model.modelCode;
				modelName += comma + model.modelName;
				displayName += comma + model.displayName;
				modelPrice += comma + price;
				discountprice += comma + princeInfo.promotionPrice;
				pviTypeName += comma + model.pviTypeName;
				pviSubtypeName += comma + model.pviSubtypeName;
				categorySubTypeEngName += comma + model.pviSubtypeName + ' ' + model.pviTypeName;
				modelrevenue += comma + price;
				modelqty += comma + qty;
			}
			pviTypeName = pviTypeName.toLowerCase();
			pviSubtypeName = pviSubtypeName.toLowerCase();
			categorySubTypeEngName = categorySubTypeEngName.toLowerCase();

			cartEl.attr("data-modelcode", modelCode)
				.attr("data-modeldisplay", displayName)
				.attr("data-modelname", modelName)
				.attr("data-modelrevenue", modelrevenue)
				.attr("data-modelprice", modelPrice)
				.attr("data-pvitype", pviTypeName)
				.attr("data-pvisubtype", pviSubtypeName)
				.attr("data-discountprice", discountprice)
				.attr("data-pimsubtype", categorySubTypeEngName)
				.attr("data-modelqty", modelqty);
		} else {
			cartEl.removeAttr("data-modelcode")
				.removeAttr("data-modeldisplay")
				.removeAttr("data-modelname")
				.removeAttr("data-modelrevenue")
				.removeAttr("data-modelprice")
				.removeAttr("data-pvitype")
				.removeAttr("data-pvisubtype")
				.removeAttr("data-discountprice")
				.removeAttr("data-pimsubtype")
				.removeAttr("data-modelqty");
		}
	}
	
	function addToCart( firstCall, goCartUrl, param ){
		if( siteCode === 'uk' || siteCode === 'cn'){
			if( firstCall ){ // 본품 cart
				if( goCartUrl ){
					addToCartNewHybris(clickModelCode, cartUrl);
				}else{
					addToCartNewHybris(clickModelCode);
				}
			}else{
				let ukParam = [];
				if( param && param.length > 0 ){
					ukParam.isAddonComponent = true;
					if( Array.isArray(param) ){ // addon
						for( const modelCode of param ){
							ukParam.push({
								'productCode': modelCode,
								'qty': 1,
							});
						}
					}else{
						ukParam.push({ // gift
							'productCode': param,
							'qty': 1,
						});
					}
					addToCartNewHybris('', cartUrl, '', ukParam); // addon 페이지에서 선택한 제품 cart
				}else{
					window.location.href = cartUrl; // addon 페이지에서 선택한 제품 없는 경우
				}
			}
			
		}else{
			const addToCartPostYn = $("#addToCartPostYn").val();
			const storeWebDomain = $("#storeWebDomain").val();
			const storeDomain = $("#storeDomain").val();
			const addCartTimeout = siteCode === "vn" ? 20000 : 10000;
			let multiSiteCode = getMultiSiteCode();
			if( cartUrl ){
				if( siteCode === "ae" ){
					cartUrl = cartUrl.replace("/ae/", "/"+multiSiteCode+"/");
				} else if(siteCode === "ae_ar"){
					cartUrl = cartUrl.replace("/ae_ar/", "/"+multiSiteCode+"/");
				}
			}
			
			if(isEppSite){
				multiSiteCode = eppCompanyCode;
			}
			if( addToCartPostYn === "Y" ){
				if( isNewHybris ){
					apiUrl =  storeWebDomain + "/" + multiSiteCode + "/servicesv2/addToCart";
				}else{
					apiUrl =  storeDomain + "/" + multiSiteCode + "/servicesv2/addToCart";
				}
				let postParam = {'products': []};
				if( firstCall ){ // 본품 postParam
					postParam = {'products': [{ 'productCode': clickModelCode, 'quantity': 1 }]};
				}else{ // gift, addon 페이지에서 선택한 제품 postParam
					if( hasGift && !hasAddon ){
						postParam['products'].push({
							'productCode': param,
							'quantity': 1,
						});
					}else if( hasAddon ){
						if( param && param.length > 0 ){
							for( const modelCode of param ){
								postParam['products'].push({
									'productCode': modelCode,
									'quantity': 1,
								});
							}
						}
						if( hasGift ){
							postParam['products'].push({
								'productCode': selectGift,
								'quantity': 1,
							});
						}
					}
				}
				// addon 진입 전 본품 카트 or addon 페이지에서 선택한 제품이 있는 경우
				if( firstCall || !firstCall && postParam['products'] && postParam['products'].length > 0 ){
					$.ajax({ 
						url: apiUrl,
						type: "POST",
						data: JSON.stringify (postParam),
						contentType : "application/json",
						dataType : "json",
						xhrFields: { withCredentials: true },
						crossDomain : true,
						timeout : addCartTimeout,
						success: function (data) {
							if(data){
								if(data.resultCode === "0000"){
									if( goCartUrl ){
										window.location.href = cartUrl;
									}
								}else{
									confirmPopup(data.resultMessage,"error");
								}
							}else{
								confirmPopup("","error");
							}
						},error : function(e){
							var errorText = "";
							if (e.responseJSON != null) {
								if (isNotNull(e.responseJSON.message)) {
									errorText = e.responseJSON.message;
								}
							}
							confirmPopup(errorText,"error");
						}
					});
				}else{
					window.location.href = cartUrl; // addon 페이지에서 선택한 제품 없는 경우
				}
			}
		}
	}
	
	function getMultiSiteCode(){
		let multiSiteCode = siteCode;
		const dotcomMultistore = $.cookies.get('estoreSitecode', {domain : ".samsung.com"});
		if( siteCode === 'levant' ){
			multiSiteCode = 'jo';
		}else if( siteCode === 'levant_ar' ){
			multiSiteCode = 'jo_ar';
		}else if( siteCode === 'n_africa' ){
			multiSiteCode = 'ma';
		}else if( ( siteCode === 'ae' || siteCode === 'ae_ar' ) && dotcomMultistore ){
			if( dotcomMultistore === "ae" || dotcomMultistore === "ae_ar" || dotcomMultistore === "kw" || dotcomMultistore === "kw_ar" || dotcomMultistore === "om" 
				|| dotcomMultistore === "om_ar" || dotcomMultistore === "bh" || dotcomMultistore === "bh_ar" || dotcomMultistore === "qa" || dotcomMultistore === "qa_ar" ){
				multiSiteCode = dotcomMultistore;
			}
		}
		return multiSiteCode;
	}

	// addOn Gift TNC Component
	function addOnGiftTNC(){

		const _$ui = {
			tnc : $('.pdd16-step-buying__tnc'),
			giftContinueBtn : $('#giftContinue')
		}

		const composeHtml = (tncItemList) => {

			let tncHtml = '';

			if(tncItemList && tncItemList.length > 0){
				tncHtml = tncItemList.map((tncItem)=>{
					return /*html*/`
					<div class="pdd16-step-buying__tnc-checkbox ${tncItem.required ? 'is-required' : ''}">
						<div class="checkbox-v2">
							<input class="checkbox-v2__input" type="checkbox" name="checkbox" id="${tncItem.code}">
							<label class="checkbox-v2__label" for="${tncItem.code}">
							<span class="checkbox-v2__label-box-wrap">
								<span class="checkbox-v2__label-box">
								<svg class="checkbox-v2__label-box-icon" focusable="false" aria-hidden="true">
									<use xlink:href="#done-bold" href="#done-bold"></use>
								</svg>
								</span>
							</span>
							<span class="checkbox-v2__label-text">${tncItem.content}</span>
							</label>
						</div>
					</div>`
				}).join('')
			}

			return tncHtml;
		}

		const render = (context) => {
			const storeDomain = $("#storeDomain").val();
			const categoryGroupCode = $("#pfCategoryGroupCode").val();
			//[23.11.22] EPP 수정
			const apiDomain = (isEppSite && isOldHybris) ? $("input#newHyvStoreDomain").val() : storeDomain;
			const siteCodeWithEpp = isEppSite ? eppCompanyCode : siteCode;
			const _xhrFields = isEppSite ? { withCredentials: true } : {};			
			$.when(
				$.ajax({
					url: `${apiDomain}/tokocommercewebservices/v2/${siteCodeWithEpp}/tnc?context=${context}&value=${categoryGroupCode}`,
					type: "GET",
					dataType: "json",
					xhrFields: _xhrFields
				})
			).done((tncApiResponse)=>{
				if(tncApiResponse && tncApiResponse.length > 0){
					_$ui.tnc.html(composeHtml(tncApiResponse));
					_$ui.tnc.show();
					const tncList = $(".pdd16-step-buying__tnc .pdd16-step-buying__tnc-checkbox input[name='checkbox']");
					const checkFlag = localConfigurator.get('useTnc') ? tncCheck(tncList) : true;
					if(!checkFlag){
						$('#giftContinue').addClass('cta--disabled').attr('disabled', true);
					}
				}
			})
		}

		return {
			render : render
		}

	}

	function tncCheck(checkBox) {
		var checkFlage = true;

		if (checkBox.length > 0) {
			checkBox.each(function () {
				var _this = $(this);
				if (_this.closest('.pdd16-step-buying__tnc-checkbox').hasClass("is-required")) {
					checkFlage = checkFlage && _this.is(":checked");
				}
			});
		}
		return checkFlage; 
	}

	function getMultiColorOptionChipHtml(multiColorList){
		const optionColorType = multiColorList.optionColorType;
		const optionCodeList = multiColorList.optionCodeList;
		let optionChipHtml = '';
		switch(optionColorType){
			case 'C1' : 
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code">
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
					<g transform="translate(-18.001 9)">
						<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
						<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${optionCodeList[0]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
					</g>
					</svg>
				  </span>`
				break;
			case 'C2_A' : 
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.C2AType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
					<g transform="translate(-17.999 9)">
						<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
						<g>
						<!--/* left -> right 방향으로 color code 적용 */-->
						<path d="M-3395,7250a18,18,0,0,1,18-18h0v36h0A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${optionCodeList[0]}" />
						<path d="M-3377,7232a18,18,0,0,1,18,18,18,18,0,0,1-18,18Z" transform="translate(3413 -7241)" fill="${optionCodeList[1]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
			
				break;
			case 'C2_B' : 
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.C2BType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
					<g transform="translate(-17.999 9)">
						<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
						<g>
						<!--/* top -> bottom 방향으로 color code 적용 */-->
						<path d="M-3395,7250a18,18,0,0,1,18-18,18,18,0,0,1,18,18Z" transform="translate(3413 -7241)" fill="${optionCodeList[0]}" />
						<path d="M-3395,7250h36a18,18,0,0,1-18,18A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${optionCodeList[1]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
				break;
			case 'C3_A' : 
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.C3AType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36.001" viewBox="0 0 36.001 36.001">
					<g transform="translate(27.001 -17.999) rotate(90)">
						<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
						<g transform="translate(18 -3.005) rotate(-90)">
						<!--/* left -> right -> bottom 방향으로 color code 적용 */-->
						<path d="M-1047.672,8501.792a18.1,18.1,0,0,1-1.321-6.168c0-.027,0-.056,0-.083s0-.06,0-.09a18.092,18.092,0,0,1,1.906-8.522c.009-.017.017-.036.028-.053.017-.036.034-.068.051-.1.028-.054.058-.109.085-.162,0,0,0,0,0-.007.109-.205.22-.405.337-.608l0,0a18.019,18.019,0,0,1,1.92-2.717,18.076,18.076,0,0,1,2.2-2.157,18.042,18.042,0,0,1,2.467-1.712,18.109,18.109,0,0,1,2.674-1.264,18.212,18.212,0,0,1,3.76-.967.18.18,0,0,0,.032,0,.045.045,0,0,0,.017,0A18.394,18.394,0,0,1-1031,8477v18h0l-15.583,9A18.227,18.227,0,0,1-1047.672,8501.792Z" transform="translate(1019 -8477.001)" fill="${optionCodeList[0]}" />
						<path d="M-1049,8494.994h0v-18a18.692,18.692,0,0,1,2.051.115,18.089,18.089,0,0,1,4.971,1.313.644.644,0,0,0,.068.025.02.02,0,0,0,.015.009,17.41,17.41,0,0,1,1.889.95,18.359,18.359,0,0,1,2.047,1.374c.015.013.032.023.047.036s.034.028.051.041a18.122,18.122,0,0,1,4.446,5.135h0a18.843,18.843,0,0,1,.9,1.783l.045.1s0,0,0,0a18.093,18.093,0,0,1,1.462,6.915c0,.023,0,.047,0,.073v.1a18.107,18.107,0,0,1-1.622,7.482l-.032.073c-.009.019-.019.038-.028.058-.22.474-.463.94-.73,1.4Z" transform="translate(1037.001 -8477)" fill="${optionCodeList[1]}" />
						<path d="M-1034.289,8494.979a18.08,18.08,0,0,1-9.093-2.986c-.017-.013-.036-.023-.053-.036a.663.663,0,0,1-.062-.043,18.052,18.052,0,0,1-4.213-3.972l-.1-.128a18.141,18.141,0,0,1-1.2-1.816l15.589-9,15.585,9a18.048,18.048,0,0,1-2.04,2.858.119.119,0,0,1-.015.016l-.077.089a18.1,18.1,0,0,1-2.673,2.456l-.026.02-.1.077a18.052,18.052,0,0,1-9.792,3.466c-.051,0-.1.007-.158.007a.029.029,0,0,1-.013,0c-.228.009-.458.013-.689.013C-1033.709,8495-1034,8495-1034.289,8494.979Z" transform="translate(1021.412 -8459.007)" fill="${optionCodeList[2]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.021,17,17,0,1,0,30.021,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(-30.004 0)" fill="rgba(29,29,27,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
				break;
			case 'C3_B' : 
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.C3BType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
					<g transform="translate(-17.999 -4)">
						<rect width="36" height="36" transform="translate(18 4)" fill="none" />
						<g transform="translate(17.999 4.001)">
						<!--/* left -> center -> right 방향으로 color code 적용 */-->
						<path d="M0,18A18.006,18.006,0,0,1,12,1.024v33.95A18.006,18.006,0,0,1,0,18Z" transform="translate(0 0)" fill="${optionCodeList[0]}" />
						<path d="M0,34.974V1.024a18.086,18.086,0,0,1,12,0v33.95a18.085,18.085,0,0,1-12,0Z" transform="translate(12 0)" fill="${optionCodeList[1]}" />
						<path d="M0,16.975A18.007,18.007,0,0,0,12,33.95V0A18.007,18.007,0,0,0,0,16.975Z" transform="translate(36 34.975) rotate(180)" fill="${optionCodeList[2]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(0,0,0,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
				break;
			case 'C3_C' : 
			optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.C3CType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
					<g transform="translate(-18 -4)">
						<rect width="36" height="36" transform="translate(18 4)" fill="none" />
						<g transform="translate(53.999 4) rotate(90)">
						<!--/* top -> middle -> bottom 방향으로 color code 적용 */-->
						<path d="M0,18A18.006,18.006,0,0,1,12,1.024v33.95A18.006,18.006,0,0,1,0,18Z" transform="translate(0 0)" fill="${optionCodeList[0]}" />
						<path d="M0,34.974V1.024a18.086,18.086,0,0,1,12,0v33.95a18.085,18.085,0,0,1-12,0Z" transform="translate(12 0)" fill="${optionCodeList[1]}" />
						<path d="M0,16.975A18.007,18.007,0,0,0,12,33.95V0A18.007,18.007,0,0,0,0,16.975Z" transform="translate(36 34.975) rotate(180)" fill="${optionCodeList[2]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(0,0,0,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
				break;
			case 'C4_A' :
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.C4AType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
					<g transform="translate(-17.999 9)">
						<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
						<g>
						<!--/* top-left -> top-right -> bottom-right -> bottom-left 방향으로 color code 적용 */-->
						<path d="M-3395,7250a18,18,0,0,1,18-18v18Z" transform="translate(3413 -7241)" fill="${optionCodeList[0]}" />
						<path d="M-3377,7250v-18a18,18,0,0,1,18,18Z" transform="translate(3413 -7241)" fill="${optionCodeList[1]}" />
						<path d="M-3377,7250h18a18,18,0,0,1-18,18Z" transform="translate(3413 -7241)" fill="${optionCodeList[2]}" />
						<path d="M-3395,7250h18v18h0A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${optionCodeList[3]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
				break;
			case 'CP' :
				optionChipHtml = /*html*/`
				<span class="option-selector__color-code" data-sdf-test="{{chip.CPType}}">
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
					<g transform="translate(-17.999 9)">
						<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
						<g transform="translate(48.004 -9)">
						<!--/* middle-left -> top-left -> top-right -> middle-right -> bottom-right -> bottom-left 방향으로 color code 적용 */-->
						<path d="M1.333,15.8A18.1,18.1,0,0,1,.01,9.628c0-.027,0-.055,0-.082s0-.06,0-.089A18.086,18.086,0,0,1,1.91.935L1.938.88l.053-.1L2.074.614l0-.007Q2.239.3,2.413,0L18,9,2.413,18A18.157,18.157,0,0,1,1.333,15.8Z" transform="translate(-30.005 8.994)" fill="${optionCodeList[0]}" />
						<path d="M0,9A17.9,17.9,0,0,1,6.584,2.41,18.351,18.351,0,0,1,9.257,1.145a18.061,18.061,0,0,1,3.667-.95l.132-.019.019,0A18.137,18.137,0,0,1,15.582,0V18Z" transform="translate(-27.587 0)" fill="${optionCodeList[1]}" />
						<path d="M0,18V0A18.223,18.223,0,0,1,2.05.115,18.011,18.011,0,0,1,7.021,1.427l.068.026a.028.028,0,0,0,.015.008,17.506,17.506,0,0,1,1.89.949,18.328,18.328,0,0,1,2.047,1.376l.046.035.052.041A18.106,18.106,0,0,1,15.585,9Z" transform="translate(-12.003 0)" fill="${optionCodeList[2]}" />
						<path d="M0,9,15.583,0a18.31,18.31,0,0,1,.9,1.785l.045.1v0A18.087,18.087,0,0,1,18,8.808c0,.023,0,.048,0,.072s0,.064,0,.1a18.082,18.082,0,0,1-1.621,7.483l-.033.073-.027.058q-.332.71-.731,1.4Z" transform="translate(-12.004 8.997)" fill="${optionCodeList[3]}" />
						<path d="M0,0,15.585,9a18.082,18.082,0,0,1-2.041,2.858l-.014.016-.078.089a18.166,18.166,0,0,1-2.672,2.457l-.027.02-.1.075A18.057,18.057,0,0,1,.86,17.979L.7,17.986H.688C.46,18,.23,18,0,18Z" transform="translate(-12.005 17.994)" fill="${optionCodeList[4]}" />
						<path d="M14.717,17.98a18.082,18.082,0,0,1-9.094-2.987l-.054-.036-.062-.042A18.087,18.087,0,0,1,1.3,10.942h0l-.1-.127A18.134,18.134,0,0,1,0,9L15.589,0V18C15.3,18,15.006,17.994,14.717,17.98Z" transform="translate(-27.593 17.993)" fill="${optionCodeList[5]}" />
						<!--/* [D] 제일 마지막 path의 fill 속성 값은 변경하지 않음 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.021,17,17,0,1,0,30.021,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(-30.004 0)" fill="rgba(29,29,27,0.5)" />
						</g>
					</g>
					</svg>
				</span>`
				break;
			default :
				break;
		}
		return optionChipHtml;
	}
	
	$(document).off("click",".pdd16-step-buying .cta--step");
	$(document).on("click",".pdd16-step-buying .cta--step", function(){
		const selectedCategoryOrder = $(".pdd16-step-buying .tab__item--active").index() + 1;
		const categoryLength = $(".pdd16-step-buying .tab__item").length;
		if( categoryLength === selectedCategoryOrder ){
			$(this).attr('id','primaryInfoGoCartAddOn');
		}else{
			$(this).attr('id','nextBtn');
		}
	});
	
	$(document).off("click",".pdd16-step-buying .tab__item-title");
	$(document).on("click",".pdd16-step-buying .tab__item-title",function(){
		const headlineText = $(".pdd16-step-buying__headline");
		const selectedCategoryOrder = $(".pdd16-step-buying .tab__item--active").index() + 1;
		const categoryLength = $(".pdd16-step-buying .tab__item").length;
		const chooseYourI18n = siteCode === 'es' ? "Choose yours {0}" : "Choose your {0}";
		if(localConfigurator.get("useStaticTitle")){
			headlineText[0].innerHTML = Granite.I18n.get("Choose your TV set-up")
		}else if( !hasVoucher ){
			headlineText[0].innerHTML = Granite.I18n.get(chooseYourI18n, $(this)[0].innerText);
		}
		const btnText = $(this).parents('.pdd16-step-buying__tab-wrap').find('.cta--step');
		if( categoryLength === selectedCategoryOrder ){
			btnText.attr('id','primaryInfoGoCartAddOn');
		}else{
			btnText.attr('id','nextBtn');
		}
		setCtaTagging();
	});
	
	$(document).off("click",".pdd16-step-buying #nextBtn");
	$(document).on("click",".pdd16-step-buying #nextBtn", function(){
		const headlineText = $(".pdd16-step-buying__headline");
		const selectedCategory = $(".pdd16-step-buying .tab__item--active").find('button');
		const selectedCategoryOrder = $(".pdd16-step-buying .tab__item--active").index() + 1;
		const categoryLength = $(".pdd16-step-buying .tab__item").length;
		const chooseYourI18n = siteCode === 'es' ? "Choose yours {0}" : "Choose your {0}";
		if(localConfigurator.get("useStaticTitle")){
			headlineText[0].innerHTML = Granite.I18n.get("Choose your TV set-up")
		}else if( !hasVoucher ){
			headlineText[0].innerHTML = Granite.I18n.get(chooseYourI18n, selectedCategory[0].innerText);
		}
		if( categoryLength === selectedCategoryOrder ){
			$(this).attr('id','primaryInfoGoCartAddOn');
		}else{
			$(this).attr('id','nextBtn');
		}
		setCtaTagging();
	});
	
	$(document).off("click",".pdd16-step-buying #primaryInfoGoCartAddOn");
	$(document).on("click",".pdd16-step-buying #primaryInfoGoCartAddOn", function(){
		if( hasVoucher ){
			voucherPopup("GoCartAddOn");
		}else{
			for( const parentCode in selectedBundlePopupData ){
				for( const modelCode of selectedBundlePopupData[parentCode] ){
					selectProductList.push(modelCode);
				}
			}
			addToCart(false, true, selectProductList);
		}
	});
	
	$(document).on('click', '.js-cta-addon', function(){
		isPopupCTA = $(this).attr('data-cta-type') === 'popup';
		clickModelPriceText = $(this).attr('data-price-text');
		clickModelPrice = $(this).attr('data-price');
		clickModelOriginalPrice = $(this).attr('data-original-price');
		clickModelSavePrice = $(this).attr('data-save-price');
		clickModelPriceMonth = $(this).attr('data-price-month');
		currency = $(this).attr('data-modelcurrency');
		cartUrl = $(this).attr('data-link_info');
		clickModelCode = $(this).attr('data-modelcode');
		
		if( isOldHybris ){
			callOldHybrisAjax(clickModelCode);
		}else if( isNewHybris ){
			callNewHybrisAjax(clickModelCode);
		}
		
		const desktopSrc = $(this).attr('data-desktop-src');
		const mobileSrc = $(this).attr('data-mobile-src');
		const imgAlt = $(this).attr('data-img-alt');
		const displayName = $(this).attr('data-display-name');
		productInfoGrid(desktopSrc, mobileSrc, imgAlt, displayName);
	});
	
	// 번들 팝업에서 add시
	$(document).off("click",".add-ons-evoucher-popup #bundleAddOn");
	$(document).on("click",".add-ons-evoucher-popup #bundleAddOn", function(){
		const orI18n = Granite.I18n.get("or");
		const monthly18n = Granite.I18n.get("Monthly Price") + ":";
		const fromI18n = Granite.I18n.get("From");
		let sumOriPrice = 0;
		let sumPromoPrice = 0;
		let sumSavePrice = 0;
		const itemList = $(".add-ons-evoucher-popup__item input:radio:checked");
		const parentModelCode = $(this).attr('data-parent-modelcode');
		selectedBundlePopupData[parentModelCode] = [];
		if( $(this).attr('data-price') ){
			sumOriPrice += Number($(this).attr('data-price'));
		}
		if( $(this).attr('data-promotionprice') ){
			sumPromoPrice += Number($(this).attr('data-promotionprice'));
		}
		if( $(this).attr('data-saveprice') ){
			sumSavePrice += Number($(this).attr('data-saveprice'));
		}
		$.each(itemList,function(idx,value){
			selectedBundlePopupData[parentModelCode].push(itemList[idx].getAttribute('data-modelcode'));
		})
		
		const totalPrice = clickModelPriceText || "";
		const monthly = totalPrice.split(" " + orI18n + " ");
		let productPrice = clickModelPrice;
		let totalPrices = "";
		let priceHtml = "";
		let voucherBalance = "";
		let selectedItem = "";
		productPrice += Number(sumPromoPrice);
		totalPrices = Granite.I18n.get("From {0}/mo", currencyComma(productPrice / Number(monthly), currency)) + ' ' + Granite.I18n.get("for {0} mos",monthly) + ' ' + Granite.I18n.get("or") + ' '+currencyComma(productPrice, currency);
		
		var MonthlyPrice = totalPrices.split(" " + orI18n + " ");
		if (monthlyCheckedFlag) {
			priceHtml =
			`
				<p class="hidden"><strong>${monthly18n}</strong></p>
				<p class="pdd16-step-buying__header-price-text"><strong>${fromI18n} ${MonthlyPrice[0].replace(fromI18n, "")}</strong><br>
					${orI18n} ${MonthlyPrice[1]}</p>
				<input type="hidden" class="hiddenPrice" value="${productPrice}">
			`;
		} else {
			priceHtml =
			`
				<p class="hidden"><strong>${monthly18n}</strong></p>
				<p class="pdd16-step-buying__header-price-text"><strong>${fromI18n} ${MonthlyPrice[1]}</strong></p>
				<input type="hidden" class="hiddenPrice" value="${productPrice}">
			`;
		}
		$(".pdd16-step-buying__header-price").html(priceHtml);
		$(".pdd16-step-buying__footer-sum").html(priceHtml);
		window.sg.components.notifyMePopup.closePopup();
	})
	
	// 번들 팝업에서 close시
	$(document).off("click",".add-ons-evoucher-popup .layer-popup__close");
	$(document).on("click",".add-ons-evoucher-popup .layer-popup__close", function(){
		const addI18n = Granite.I18n.get("Add");
		const parentModelCode = $(this).attr('data-attr-parent');
		$.each($('.pdd16-step-buying__tab .bundleSelect'),function(idx,value){
			if( $(this).attr('data-modelcode') === parentModelCode ){
				$(this).find('span').text(addI18n);
				$(this).removeClass('cta--on');
			}
		})
	})
	
	$(document).off("click","#giftContinue, #giftSkip");
	$(document).on("click","#giftContinue, #giftSkip",function(){
		showGift = false;
		selectGift = $('.pdd16-step-buying__card-wrap input[name="radio"]:checked').attr('data-modelcode');
		if($(this).attr('id') === 'giftSkip'){
			selectGift = '';
		}
		if( hasAddon ){
			if( isOldHybris ){
				callCategorizedAjaxOld();
			}else if( isNewHybris ){
				callCategorizedAjaxNew();
			}
			productPriceGrid();
		}else{
			addToCart(false, true, selectGift);
		}
	})

	
	$(document).off("click", ".pdd16-step-buying__evoucher-cta .cta--clear-all");
	$(document).on("click", ".pdd16-step-buying__evoucher-cta .cta--clear-all", function () {
		const hasBundle = hasBundleResult();
		if (selectProductList.length > 0 || hasBundle) {
			confirmPopup(deleteConfirmI18n, "voucherDelete", "voucherClearAll");
		}
	});
	
	$(document).off("click", "#voucherClearAll");
	$(document).on("click", "#voucherClearAll", function () {
		var initPrice = $('.pdd16-step-buying__header-price-text');
		
		for(let i = 0; i < initPrice.length; i++){
			initPrice[i].innerHTML = mainPrice;
			$('.hiddenPrice')[i].setAttribute('value',mainInitPrice);
		}
		selectedCount = 0;
		
		resetProduct();
		resetVoucherPrice();
		window.sg.components.stepbuying.clearAll(document.querySelector('.pdd16-step-buying'));
		$(".pdd16-step-buying__evoucher-title span").html(0);
	});
	
	$(document).off("click", "#voucherGoCartAddOn");
	$(document).on("click", "#voucherGoCartAddOn", function () {
		for( const parentCode in selectedBundlePopupData ){
			for( const modelCode of selectedBundlePopupData[parentCode] ){
				selectProductList.push(modelCode);
			}
		}
		addToCart(false, true, selectProductList);
	});

	$(document).off("click", ".pdd16-step-buying__tnc .pdd16-step-buying__tnc-checkbox input[name='checkbox']");
	$(document).on("click",".pdd16-step-buying__tnc .pdd16-step-buying__tnc-checkbox input[name='checkbox']", function(){
		const tncList = $(".pdd16-step-buying__tnc .pdd16-step-buying__tnc-checkbox input[name='checkbox']");
		const checkFlag = tncCheck(tncList);
		if( checkFlag ){
			$('#giftContinue').removeClass('cta--disabled').attr('disabled', false);
		}else{
			$('#giftContinue').addClass('cta--disabled').attr('disabled', true);
		}
	});
	
}(window, $));

(() => {
  const $q = window.sg.common.$q;
  const layerPopupMaxHeight = window.sg.common.layerPopupMaxHeight;
  const utils = window.sg.common.utils;

  const selector = {
    section: '.add-ons-evoucher-popup',
    layerPopup: '.layer-popup',
    scrollPopup: '.add-ons-evoucher-popup .layer-popup',
    close: '.layer-popup__close',
    closeCta: '.add-ons-evoucher-popup__button-item .cta',
  };

  const el = {
    window: null,
    section: null,
  };

  const bindEvents = () => {
    el.section = $q(selector.section);

    el.section.find(selector.close).off('click').on('click',closePopup);
    el.section.find(selector.closeCta).off('click').on('click',closePopup);

    const closeBtn = document.querySelector(`${selector.section} ${selector.close}`);
    closeBtn.removeEventListener('keydown', keydownCloseBtn);
    closeBtn.addEventListener('keydown', keydownCloseBtn);
    
    const layer = document.querySelector(`${selector.section} ${selector.layerPopup}`);
    layer.removeEventListener('keydown', keydownLayer);
    layer.addEventListener('keydown', keydownLayer);
  };

  const init = () => {
    el.window = $q(window);
    el.section = $q(selector.section);

    if (!el.section.target.length) {
      return;
    }

    $q(selector.scrollPopup).target.forEach((element) => {
      layerPopupMaxHeight.init($q(element).target[0]);
    });

    bindEvents();
  };

  const reInit = () => {
    $q(selector.scrollPopup).target.forEach((element) => {
      layerPopupMaxHeight.reInit($q(element).target[0]);
    });

    bindEvents();
  };

  function keydownLayer(evt) {
    if (evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode && evt.target === document.querySelector(`${selector.section} ${selector.layerPopup}`)) {
      evt.preventDefault();
      document.querySelector(`${selector.section} ${selector.close}`).focus();
    }
  }

  function keydownCloseBtn(evt) {
    if (!evt.shiftKey && window.sg.common.constants.KEY_CODE.TAB === evt.keyCode) {
      evt.preventDefault();
      document.querySelector(`${selector.section} ${selector.layerPopup}`).focus();
    }
  }

  function originFocus() {
    // when close popup, focus move
    // $q('.pd-buying-tool [data-target-popup="notifyMePopup"]').focus();
  }

  function utilsShow() {
    const layer = document.querySelector(`${selector.section} ${selector.layerPopup}`);
    layer.setAttribute('tabindex', 0);
    layer.focus();

    utils.popupControl.open(closePopup);
    utils.hiddenScroll();
  }

  function utilsHide() {
    utils.popupControl.close();
    utils.visibleScroll();
  }

  function showPopup() {
    utilsShow();
    
    el.section.show();

    layerPopupMaxHeight.reInit(el.section.target[0]);
  }

  function closePopup() {
    utilsHide();

    el.section.hide();
    
    originFocus();
  }

  $q.ready(init);
  
  window.sg.components.notifyMePopup = {
    init,
    reInit,
    showPopup,
    closePopup
  };
})();

((window, $) => {
	"use strict";
	
	function callSearchAjax( fData, bundleData, isGift ){
		let bundleModelCodes = Object.keys(bundleData);
		bundleModelCodes = bundleModelCodes.splice(bundleModelCodes.indexOf('bundleModelCode') + 1, bundleModelCodes.length);
		const searchDomain = $("#searchDomain").val();
		const stage = $("#apiStageInfo").val();
		const isHybrisIntg = $("#shopIntegrationFlag").val() === "Hybris-intg";
		const isNewHybris = $("#shopIntegrationFlag").val() === "Hybris-new";
		let urlType = '';
		if( isHybrisIntg ){
			urlType = 'hybris';
		} else if( isNewHybris ){
			urlType = 'newhybris';
		} else {
			urlType = 'global';
		}
		// epp search 분기로직 추가
		const isEPP = $('#isEppPage').val() === 'true';
		const businessType = isEPP ? 'epp/v2': 'b2c';
		
		let dotcom_countryRegion = $.cookies.get("country_region") ? $.cookies.get("country_region").toString() : '';
		let regionCode = ''; // default CA-ON
		
		const searchURL = `${searchDomain}/${stage}/${businessType}/product/card/detail/${urlType}`;
		let param = {
			'siteCode': siteCode,
			'modelList': bundleModelCodes.join(','),
			'saleSkuYN': 'N',
			'onlyRequestSkuYN': 'Y',
			'commonCodeYN': 'N',
			'vd3PACardYN': 'Y'
		};
		
		//only SECA
		if(siteCode === "ca" || siteCode === "ca_fr"){
			if(dotcom_countryRegion != null && dotcom_countryRegion != "") {
				regionCode = dotcom_countryRegion;
			} else {
				regionCode = 'CA-ON'; // default CA-ON
			}
			param.regionCode = regionCode;
		}
		
		//epp 분기 추가
		if( isEPP ){
			param.companyCode  = $('#eppCompanyCode').val();
			param.shopSkuYN  = "N";
			
			const eppIsUserGroupPricing = window.sg.epp.common.isUserGroupPricing;
			if(eppIsUserGroupPricing){
				param['groupName'] = window.sg.epp.common.groupName;
			}
			//[24.02.27][EPP][CN][O2O] : o2oId 파라미터 추가
			if(window.sg.epp.common.userStoreId != ""){
				param['o2oId'] = window.sg.epp.common.userStoreId;
			}			
		}
		
		$.ajax({
			url: searchURL,
			type: "GET",
			data: param,
			dataType: "json",
			cache: true,
			crossDomain: true,
			timeout: 10000,
			success: function( data ){
				if( data && data.response.statusCode === 200 ){
					const resultData = data.response.resultData;
					if( resultData && resultData.productList && resultData.productList.length > 0 ){
						getBundleSearchProductcard(fData, bundleData, isGift, resultData.productList);
					}else{
						//addToCart(true, true);
					}
				}else{
					//addToCart(true, true);
				}
			},
			error: function(){
				//addToCart(true, true);
			},
			complete: function(){
			}
		});
	}
	
	function getBundleSearchProductcard( fData, bundleData, isGift, productList ){
		let bundleModelCodes = Object.keys(bundleData);
		bundleModelCodes = bundleModelCodes.splice(bundleModelCodes.indexOf('bundleModelCode') + 1, bundleModelCodes.length);
		$.each(bundleData, function(i,value){
			$.each(productList, function (familyIdx, product) {
				var modelList = product.modelList;
				if (modelList != null) {
					$.each(modelList, function (modelIdx, model) {
						var modelCode = model.modelCode;
						var stocklevel = bundleData[modelCode].stocklevel || "";
						if (!model.displayName) {
							model.displayName = bundleData[modelCode].name || "";
						}
						model.thumbUrlAlt = bundleData[modelCode].imageUrlAlt || "";
						model.priceDisplay = bundleData[modelCode].price || "";
						model.promotionPriceDisplay = bundleData[modelCode].promotionPrice || "";
						model.price = bundleData[modelCode].priceValue || "";
						model.promotionPrice = bundleData[modelCode].promotionPriceValue || "";
						model.stocklevel = stocklevel;
						model.isStock = !(stocklevel === "" || stocklevel.toUpperCase() === "OUTOFSTOCK");
						model.idx = String(familyIdx) + '-' + String(modelIdx) // familyNum
					});
				}
			});
		});
		bundlePopupGrid(fData, productList, isGift);
	}
	
	function bundlePopupGrid( fData, productList, isGift ){
		$('.add-ons-evoucher-popup .layer-popup__title').html(fData.name);
		$('.add-ons-evoucher-popup .layer-popup__close').attr('data-attr-parent',fData.modelCode);
		footerGrid(fData, isGift);
		listGrid(productList);
		checkOutOfStock ();
		productCardListener(productList, isGift);
	}
	
	function checkOutOfStock (){
		$('.add-ons-evoucher-popup .add-ons-evoucher-popup__item').each(function(){
			if( $(this).find('.option-selector-v2__swiper-slide').length === $(this).find('.option-selector-v2__swiper-slide.out-of-stock').length ){
				$(this).closest('.add-ons-evoucher-popup__item').find('.add-ons-evoucher-popup__state').html(stockSvgHtml(false));
			}
		});
		
		checkOOSCta();
	}
	
	function findFrontProduct( family ){
		let modelInfo = {};
		for( const model of family.modelList ){
			if(model.stocklevel.toLowerCase() != "outofstock") {
				modelInfo = model;
				break;
			}
		}
		
		if( !modelInfo.modelCode ){
			modelInfo = family.modelList[0];
		}
		
		return modelInfo;
	}
	
	function listGrid(productList){
		let productHtml = ``;
		let familyIdx = 0;
		for( const family of productList ){
			const frontModel = findFrontProduct( family );
			
			const chipOptions = frontModel.fmyChipList;
			let colorName = '';
			let memoryName = '';
			if( chipOptions.length > 0 ){
				for(let i=0; i<chipOptions.length; i++){
					if(chipOptions[i].fmyChipType === "COLOR"){
						colorName = (frontModel.fmyChipList[i].fmyChipLocalName !== '') ? frontModel.fmyChipList[i].fmyChipLocalName : frontModel.fmyChipList[i].fmyChipName;
						break;
					} else if (chipOptions[i].fmyChipType === "MOBILE MEMORY" || chipOptions[i].fmyChipType === "TV SIZE" 
								|| chipOptions[i].fmyChipType === "HOME APPLIANCE SIZE" || chipOptions[i].fmyChipType === "MONITOR SCREEN SIZE") {
						memoryName = (frontModel.fmyChipList[i].fmyChipLocalName !== '') ? frontModel.fmyChipList[i].fmyChipLocalName : frontModel.fmyChipList[i].fmyChipName;
					}
				}
			}
			productHtml += `
				<li class="add-ons-evoucher-popup__item" data-index="${familyIdx}">
					<div class="add-ons-evoucher-popup__image">
						<div class="image">
							<img class="image__preview lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(frontModel.thumbUrl)}" data-mobile-src="${addOnsImgDomain(frontModel.thumbUrl)}" alt="${frontModel.thumbUrlAlt}" role="img">
							<img class="image__main lazy-load responsive-img" data-desktop-src="${addOnsImgDomain(frontModel.thumbUrl)}" data-mobile-src="${addOnsImgDomain(frontModel.thumbUrl)}" alt="${frontModel.thumbUrlAlt}" role="img">
						</div>
					</div>
					<div class="add-ons-evoucher-popup__content">
						<p class="add-ons-evoucher-popup__text">${frontModel.displayName}</p>
						<div class="add-ons-evoucher-popup__option">
							<div class="option-selector-v2 option-selector-v2__color-text">
								${colorName ?
								`<div class="option-selector-v2__color-name">
									${Granite.I18n.get("Color")} : 
									<span class="color-name-text">${colorName}</span>
								</div>` : '' }
								${memoryName ? memoryName : ''}
								${productChipGrid(family.modelList, familyIdx, frontModel)}
							</div>
						</div>
						<strong class="add-ons-evoucher-popup__state">
							<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
								<g><path d="M9.561 0 10 .439 4.061 6.37 0 2.314l.439-.439 3.622 3.618z" transform="translate(3 5)" style="stroke:#000" /></g>
							</svg>
						</strong>
						</div>
					</div>
				</li>`;
				familyIdx++;
		}
		$('.add-ons-evoucher-popup .add-ons-evoucher-popup__list').html(productHtml);
		
	}
	
	function footerGrid(fData, isGift){
		const finalPrice = fData.promotionPrice ? fData.promotionPrice : fData.price;
		const isStock = fData.stocklevel.toLowerCase() !== 'outofstock' ? true : false;
		let ctaHtml = '';
        let priceHtml = '';
		let idName = isGift ? 'bundleAddOnGift' : 'bundleAddOn';
		if(isStock){
			let savePrice = 0;
			if(fData.priceValue && fData.priceValue > 0 && fData.promotionPriceValue && fData.priceValue != fData.promotionPriceValue){
				savePrice = fData.priceValue - fData.promotionPriceValue;
			}
			ctaHtml =`
				<div class="add-ons-evoucher-popup__button-item">
					<button class="cta cta--contained cta--black footer-cta" id="${idName}" aria-label="Add" data-parent-modelcode=${fData.modelcode} data-price="${fData.priceValue}" data-promotionprice="${fData.promotionPriceValue}" data-saveprice="${savePrice}" >
						${Granite.I18n.get("Add")}
					</button>
				</div>`;
		} else {
			ctaHtml =`
				<div class="add-ons-evoucher-popup__button-item">
					<button class="cta cta--contained cta--black cta--disabled" aria-label="Out of Stock" aria-disabled="true">
						${Granite.I18n.get("Out Of Stock")}
					</button>
				</div>`;
		}
		
		if( !isGift ){
			priceHtml = `
				<div class="add-ons-evoucher-popup__price">
					<span class="hidden">Origin Price : ${fData.price}</span>
					${fData.price !== finalPrice ? `<del class="add-ons-evoucher-popup__price-original">${fData.price}</del>` : ``}
					<strong class="add-ons-evoucher-popup__price-payment">${finalPrice}</strong>
				</div>
			`
		}
		
		const footerHtml = `
			${priceHtml}
			${ctaHtml}`;
			
		$('.add-ons-evoucher-popup .add-ons-evoucher-popup__button').html(footerHtml);
	}
	
	function productChipGrid( modelList, familyIdx, frontModel ){
		let modelIdx = 0;
		let colorCount = modelList.length;
		let colorHtml = ``;
		let memoryHtml = ``;
		for( const model of modelList ){
			const isChecked = frontModel.modelCode === model.modelCode ? true : false;
			let colorIdx = 0;
			let memoryIdx = 0;
			const price = model.price;
			const promotionPrice = model.promotionPrice;
			let savePrice = 0;
			if( promotionPrice !== price ){
				savePrice = Number(price) - Number(promotionPrice);
			}
			for( const option of model.fmyChipList ){
				if(option.fmyChipType === 'COLOR'){
					const chipId = `pdd16-color-${familyIdx}-${modelIdx}-${colorIdx}`;
					colorHtml += `
						<div class="option-selector-v2__swiper-slide ${model.isStock ? 'in-stock' : 'out-of-stock'} ${modelIdx === 0 ? 'is-checked' : ''}" role="listitem">
							<button type="button" class="option-selector-v2__color">
								<span class="option-selector-v2__color-code ${model.isStock ? 'in-stock' : 'out-of-stock'}" style="background-color: ${option.fmyChipCode}" id="${chipId}" name="${chipId}" data-modeli="${modelIdx}"${isChecked ? ' checked' : ''}
									data-modelcode="${model.modelCode}" data-modelname="${model.modelName}" data-index="${modelIdx}" data-price="${price}" data-promotionprice="${promotionPrice}" data-saveprice="${savePrice}">
									<span class="hidden">${option.fmyChipLocalName}</span>
								</span>
							</button>
						</div>`;
					colorIdx++;
				} else if (option.fmyChipType === "MOBILE MEMORY" || option.fmyChipType === "TV SIZE" 
					|| option.fmyChipType === "HOME APPLIANCE SIZE" || option.fmyChipType === "MONITOR SCREEN SIZE") {
					const chipId = `pdd16-memory-${familyIdx}-${modelIdx}-${memoryIdx}`;
					memoryHtml += `
						<div class="option-selector-v2__swiper-slide ${model.isStock ? 'in-stock' : 'out-of-stock'} ${modelIdx === 0 ? 'is-checked' : ''}" role="listitem">
							<button type="button" class="option-selector-v2__size">
								<span class="option-selector-v2__size-text ${model.isStock ? 'in-stock' : 'out-of-stock'}" id="${chipId}" name="${chipId}" data-modeli="${modelIdx}"${isChecked ? ' checked' : ''}
									data-modelcode="${model.modelCode}" data-modelname="${model.modelName}" data-index="${modelIdx}" data-price="${price}" data-promotionprice="${promotionPrice}" data-saveprice="${savePrice}">
								<span class="blind">${option.fmyChipLocalName}</span>
							</button>
						</div>`;
					memoryIdx++;
				}
			}
			modelIdx++;
		}
		const chipHtml = `
			<div class="option-selector-v2__wrap option-selector-v2__wrap--color-chip" data-desktop-view="5" data-mobile-view="2">
				<div class="option-selector-v2__swiper">
					<div class="option-selector-v2__swiper-container" aria-live="polite">
						<div class="option-selector-v2__swiper-wrapper" style="transform: translateX(0px);" role="list">
							${colorHtml ? colorHtml : ''}
							${memoryHtml ? memoryHtml : ''}
						</div>
					</div>
					<button type="button" class="option-selector-v2__button-prev option-selector-v2__button--disabled" aria-label="Previous" role="button" aria-disabled="true" tabindex="0" style="display:block;">
						<span class="hidden">${Granite.I18n.get("Previous")}</span>
						${colorCount > 5 ? 
						`<svg class="icon" focusable="false">
							<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#previous-regular"></use>
						</svg>` : '' }
					</button>
					<button type="button" class="option-selector-v2__button-next" aria-label="Next" role="button" aria-disabled="true" tabindex="0" style="display:block;">
						<span class="hidden">${Granite.I18n.get("Next")}</span>
						${colorCount > 5 ?
						`<svg class="icon" focusable="false">
							<use xlink:href="/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/svg-sprite.svg#next-regular" ></use>
						</svg>` : '' }
					</button>
				</div>
			</div>`;
		return chipHtml;
	}
	
	function productCardListener( productList, isGift ) {
		$(".add-ons-evoucher-popup").off('click', '.add-ons-evoucher-popup__item button.option-selector-v2__color');
		$(".add-ons-evoucher-popup").on('click', '.add-ons-evoucher-popup__item button.option-selector-v2__color', function(){
			const stateTarget = $(this).closest('.add-ons-evoucher-popup__item').find('.add-ons-evoucher-popup__state');
			$(this).closest('#freeGiftPopup').find('.footer-cta').removeClass('cta--disabled');
			$(this).closest('#freeGiftPopup').find('.footer-cta').text(Granite.I18n.get("Add"));
			
			stateTarget.removeClass('is-out');
			stateTarget.html('');
			
			if( !$(this).hasClass('is-checked') ){
				const clickModelArea = $(this).closest('.add-ons-evoucher-popup__item');
				clickModelArea.find('.option-selector-v2__swiper-slide').prop('checked', false);
				clickModelArea.find('.option-selector-v2__swiper-slide').removeClass('is-checked');
				$(this).closest('.option-selector-v2__swiper-slide').prop('checked', true);
				$(this).closest('.option-selector-v2__swiper-slide').addClass('is-checked');
				const modelCode = $(this).find('.option-selector-v2__color-code').attr('data-modelcode');
				
				let clickColorData = '';
				$.each(productList, function(groupIndex,familyGroup){
					$.each(familyGroup.modelList, function(modelIndex,modelInfo){
						if( modelInfo.modelCode === modelCode ){
							clickColorData = modelInfo;
						}
					})
				});
				
				const imgUrl = addOnsImgDomain(clickColorData.thumbUrl);
				clickModelArea.find('.add-ons-evoucher-popup__image img').attr('data-desktop-src', imgUrl).attr('data-mobile-src', imgUrl).attr('src', imgUrl);
				clickModelArea.find('.add-ons-evoucher-popup__text').html(clickColorData.displayName);
				clickModelArea.find('.color-name-text').html(clickColorData.fmyChipList[0].fmyChipLocalName);
				
				stateTarget.html(stockSvgHtml(true));
				if( $(this).hasClass('out-of-stock') ){
					stateTarget.addClass('is-out');
					stateTarget.html(stockSvgHtml(false));
				}
			}
			checkOOSCta();
		});
	}
	
	function checkOOSCta(){
		$.each($('#freeGiftPopup .add-ons-evoucher-popup__item'), function(i,item){
			if( $(this).find('.add-ons-evoucher-popup__state').hasClass('is-out') ){
				$(this).closest('#freeGiftPopup').find('.footer-cta').addClass('cta--disabled');
				$(this).closest('#freeGiftPopup').find('.footer-cta').text(stockSvgHtml(false));
			}
		})
	}
	
	function stockSvgHtml(isStock){
		if( isStock ){
			return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
						<g><path d="M9.561 0 10 .439 4.061 6.37 0 2.314l.439-.439 3.622 3.618z" transform="translate(3 5)" style="stroke:#000" /></g>
					</svg>`;
		}else{
			return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
						<g><path d="M9.232 0 5 4.232.768 0 0 .768 4.232 5 0 9.232.768 10 5 5.768 9.232 10 10 9.232 5.768 5 10 .768z" transform="translate(3 3)" style="fill:#aaa;stroke:#aaa" /></g>
					</svg>
					${Granite.I18n.get("Out Of Stock")}`;
		}
	}
	
	function addOnsImgDomain(imgUrl, preset, iconFl){
		var newUrl = "";
		var useScene7domain = $("#scene7domain").val();
		if (imgUrl) {
			if (imgUrl.indexOf("?") > -1) { // 프리셋 안 붙이고 add-ons에서 붙임- hybris용
				imgUrl = imgUrl.replace("medias","");
				imgUrl = imgUrl.substring(2, imgUrl.indexOf("?"));
				imgUrl = imgUrl.substring(0,imgUrl.lastIndexOf('-'));
				preset = "";
			} else {
				preset = "?" + preset;
			}
			if (imgUrl.indexOf("https:") > -1 || imgUrl.indexOf("http:") > -1 || imgUrl.indexOf("//stg-images.samsung.com/") > -1 || imgUrl.indexOf("//images.samsung.com/") > -1 || imgUrl.indexOf("image.samsung.com/") > -1) {
				newUrl = imgUrl;
			} else {
				if (iconFl) useScene7domain = useScene7domain.replace("/image/", "/content/");
				newUrl = useScene7domain + imgUrl;
			}
		}
		return newUrl;
	}
	
	window.sg.components.addonBundlePopup = (() => {
		return {
			callSearchAjax,
			getBundleSearchProductcard,
			bundlePopupGrid
		}
	})();

})(window, window.jQuery);
(() => {
  const scrollbar = window.sg.common.scrollbar;
  const utils = window.sg.common.utils;
  const KEY_CODE = window.sg.common.constants.KEY_CODE;

  class TncPopup {
    constructor(el) {
      this.els = {
        el,
        contentsWrapEl: null,
        contentsEl: null,
        innerWarpEl: null,
        btnWrapEl: null,
        closeEl: null,
        closeCtaEl: null,
      };

      this.focusTargetEl = null;

      this.init();
    }

    init() {
      if (!this.els.el || TncPopup.instances.has(this.els.el)) {
        return;
      }

      TncPopup.instances.set(this.els.el, this);

      this.setElements();
      this.bindEvents();
    }

    setElements() {
      this.els.contentsWrapEl = this.els.el.querySelector('.tnc-popup__contents-wrap');
      this.els.contentsEl = this.els.contentsWrapEl.querySelector('.tnc-popup__contents');
      this.els.scrollEl = this.els.contentsEl.querySelector('.scrollbar');
      this.els.btnWrapEl = this.els.contentsEl.querySelector('.tnc-popup__btn-wrap');
      this.els.closeEl = this.els.contentsEl.querySelector('.tnc-popup__close');
      this.els.closeCtaEl = this.els.contentsEl.querySelector('.tnc-popup__btn-close');

      scrollbar.init(this.els.scrollEl);
    }

    bindEvents() {
      this.close = this.close.bind(this);
      this.handleContentsKeydown = this.handleContentsKeydown.bind(this);
      this.handleCloseKeydown = this.handleCloseKeydown.bind(this);
      this.resize = this.resize.bind(this);

      this.els.closeEl.addEventListener('click', this.close);
      this.els.closeCtaEl.addEventListener('click', this.close);
      this.els.contentsEl.addEventListener('keydown', this.handleContentsKeydown);
      this.els.closeEl.addEventListener('keydown', this.handleCloseKeydown);
      window.addEventListener('resize', this.resize);
    }

    handleContentsKeydown(e) {
      if (e.shiftKey && KEY_CODE.TAB === e.keyCode) {
        const firstFocusableEl = utils.getFirstFocusableEl(this.els.el);

        if (firstFocusableEl && e.target === firstFocusableEl) {
          e.preventDefault();
          this.els.closeEl.focus();
        }
      }
    }

    handleCloseKeydown(e) {
      if (!e.shiftKey && KEY_CODE.TAB === e.keyCode) {
        e.preventDefault();
        utils.setFocusFirstFocusableEl(this.els.el);
      }
    }

    show(focusTargetEl) {
      this.focusTargetEl = focusTargetEl;
      this.els.el.style.display = 'block';

      utils.popupControl.open(this.close);
      utils.hiddenScroll();
      utils.setMobileFocusLoop(this.els.el);

      this.resize();
      utils.setFocusFirstFocusableEl(this.els.el);
    }

    close() {
      this.els.el.style.display = 'none';

      utils.popupControl.close();
      utils.visibleScroll();
      utils.removeMobileFocusLoop();

      if (this.focusTargetEl && this.focusTargetEl instanceof Element) {
        this.focusTargetEl.focus();
        this.focusTargetEl = null;
      }
    }

    resize() {
      const space = Math.round((this.els.contentsEl.getBoundingClientRect().top
          - this.els.contentsWrapEl.getBoundingClientRect().top) * 2
        + this.els.btnWrapEl.getBoundingClientRect().height);

      this.els.scrollEl.querySelector('.scrollbar__wrap').style.maxHeight = `${window.innerHeight - space}px`;
      scrollbar.resize(this.els.scrollEl);
    }
  }

  TncPopup.instances = new WeakMap();

  window.sg.components.tncPopup = (() => {
    let el;
    let instance;

    const setInstance = () => {
      if (!el) {
        el = document.querySelector('.tnc-popup');
      }

      if (el && !instance) {
        if (!TncPopup.instances.has(el)) {
          instance = new TncPopup(el);
        } else {
          instance = TncPopup.instances.get(el);
        }
      }
    };

    const showPopup = (focusTargetEl = null) => {
      setInstance();

      if (instance) {
        instance.show(focusTargetEl);
      }
    };

    const closePopup = () => {
      if (instance) {
        instance.close();
      }
    };

    return {
      showPopup,
      closePopup,
    };
  })();
})();

