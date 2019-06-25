(() => {
    let MutationObserver,
        Util,
        WeakMap,
        getComputedStyle,
        getComputedStyleRX,
        bind = (fn, me) => {
            return () => fn.apply(me, arguments);
        };

    class Util {
        constructor() {
            this.extend = this.extend.bind(this);
            this.isMobile = this.isMobile.bind(this);
            this.createEvent = this.createEvent.bind(this);
            this.emitEvent = this.emitEvent.bind(this);
            this.addEvent = this.addEvent.bind(this);
            this.removeEvent = this.removeEvent.bind(this);
            this.innerHeight = this.innerHeight.bind(this);
        }
        extend(custom, defaults) {
            for (let key in defaults) {
                custom[key] === null ? custom[key] = defaults[key] : null;
                return custom;
            }
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

    MutationObserver = this.MutationObserver || this.WebkitMutationObserver

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
})(this);