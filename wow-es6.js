(() => {
    let MutationObserver,
        Util,
        WeakMap,
        getComputedStyle,
        getComputedStyleRX,

    class Util {
        constructor() {
            this.isMobile = this.isMobile.bind(this);
            this.createEvent = this.createEvent.bind(this);
            this.emitEvent = this.emitEvent.bind(this);
            this.addEvent = this.addEvent.bind(this);
            this.removeEvent = this.removeEvent.bind(this);
            this.innerHeight = this.innerHeight.bind(this);
        }

        isMobile(agent) {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent);
        }

        createEvent(event, bubble, cancel, detail) {
            let customEvent;
            bubble = !!bubble;
            cancel = !!cancel;
            detail = !detail ? null : detail;
            if (window.CustomEvent && typeof window.CustomEvent === "function") {
                customEvent = new CustomEvent(event, bubble, cancel, detail);
            }
            if (document.createEvent) {
                customEvent = document.createEvent("CustomEvent");
                customEvent.initCustomEvent(event, bubble, cancel, detail);
            } else if (document.createEventObject) {
                customEvent = documnet.createEventObject();
                customEvent.eventType = event;
            } else {
                customEvent.eventName = event;
            }
            return customEvent;
        }

        emitEvent(elem, event) {
            if (elem.dispatchEvent) {
                return elem.dispatchEvent(event);
            } else if (event in (elem != null)) {
                return elem[event]();
            } else if (("on" + event) in (elem != null)) {
                return elem["on" + event]();
            }
        }

        addEvent(elem, event, fn) {
            if (elem.addEventListener) {
                return elem.addEventListener(event, fn, false);
            } else if (elem.attachEvent) {
                return elem.attachEvent("on" + event, fn);
            } else {
                return elem[event] = fn;
            }
        }

        removeEvent(elem, event, fn) {
            if (elem.removeEventListener) {
                return elem.removeEventListener(event, fn, false);
            } else if (elem.detachEvent) {
                return elem.detachEvent("on" + event, fn);
            } else {
                return delete elem[event];
            }
        }

        innerHeight() {
            if ("innerHeight" in window) {
                return window.innerHeight;
            } else {
                return document.documentElement.clientHeight;
            }
        }
    }

    class WeakMap {
        constructor() {
            this.keys = [];
            this.values = [];
        }

        get(key) {
            let index = this.keys.indexOf(key);
            return this.values[index];
        }

        set(key, value) {
            let index = this.keys.indexOf(key);
            if (index >= 0) {
                this.values.splice(index, 1, value);
            } else {
                this.keys.push(key);
                this.values.push(value);
            }
            return this;
        }
    }
    WeakMap = this.WeakMap || this.MozWeakMap || WeakMap;

    MutationObserver = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (MutationObserver = (function () {
        function MutationObserver() {
          if (typeof console !== "undefined" && console !== null) {
            console.warn('MutationObserver is not supported by your browser.');
          }
          if (typeof console !== "undefined" && console !== null) {
            console.warn('WOW.js cannot detect dom mutations, please call .sync() after loading new content.');
          }
        }
    
        MutationObserver.notSupported = true;
    
        MutationObserver.prototype.observe = function () { };
    
        return MutationObserver;
    
      })());

    getComputedStyleRX = /(\-([a-z]){1})/g;

    getComputedStyle = this.getComputedStyle || function (el, pseudo) {
        this.getPropertyValue = function (prop) {
            let ref = el.currentStyle;
            prop = prop === "float" ? "styleFloat" : "";
            if (getComputedStyleRX.test(prop)) {
                prop.replace(getComputedStyleRX, (_) => {
                    return _.toUpperCase().replace("-", "");
                })
            }
            return ref ? ref[prop] : undefined;
        }
        return this;
    }


    class WOW {
        constructor(options) {
            this.scrollCallback = this.scrollCallback.bind(this);
            this.scrollHandler = this.scrollHandler.bind(this);
            this.resetAnimation = this.resetAnimation.bind(this);
            this.start = this.start.bind(this);

            if (!options) {
                options = {};
            }
            this.defaults = {
                boxClass: "wow",
                animateClass: "animated",
                offset: 0,
                mobile: true,
                live: true,
                callback: null,
                scrollContainter: null,
            }
            this.scrolled = true;
            this.config = Object.assign({}, this.defaults, options);
            this.wowEvent = this.util().createEvent(this.config.boxClass);
            this.stopped = true;
        }

        init() {
            this.rootElement = window.document.documentElement;
            if (document.readyState === "interactive" || document.readyState === "complete") {
                this.start();
            } else {
                this.util().addEvent(document, "DOMContentLoaded", this.start);
            }
            return this.finished = [];
        }

        start() {
            this.stopped = false;
            let ref = this.rootElement.querySelectorAll(`.${this.config.boxClass}`);
            this.boxes = [...ref];
            this.all = [...ref];
            if (this.boxes.length) {
                if (this.disabled()) {
                    this.resetStyle();
                } else {
                    let ref = this.boxes;
                    for (let i = 0, len = ref.length; i < len; i++) {
                        this.applyStyle(ref[i], true);
                    }
                }
            }
            if (!this.disabled()) {
                this.util().addEvent(this.config.scrollContainter || window, "scroll", this.scrollHandler);
                this.util().addEvent(window, "resize", this.scrollHandler);
                this.interval = setInterval(this.scrollCallback, 50);
            }
            if (this.config.live) {
                let mutationObserver = new MutationObserver((records) => {
                    let results = [];
                    for (let i = 0, len = records.length; i < len; i++) {
                        record = record[i];
                        let addedNodes = record.addedNodes || [];
                        let r1 = [];
                        for (let j = 0, len = addedNodes.length; j < len; j++) {
                            r1.push(this.doSync(addedNodes[j]))
                        }

                        results.push(r1);
                    }
                })
                mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            }
        }

        stop(){
            this.stopped = true;
            this.util().removeEvent(this.config.scrollContainter||window,"scroll",this.scrollHandler);
            this.util().removeEvent(window,"resize",this.scrollHandler);
            if(this.interval){
                return clearInterval(this.interval);
            }
        }

        sync(element){
            if(MutationObserver.notSupported){
                return this.doSync(this.rootElement);
            }
        }
    }
})(this);