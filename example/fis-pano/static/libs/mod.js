/**
 * file: mod.js
 * ver: 1.0.5
 * update: 2013/10/21
 */
var require, define;

(function(self) {
    var head = document.getElementsByTagName('head')[0],
        loadingMap = {},
        factoryMap = {},
        modulesMap = {},
        scriptsMap = {},
        resMap = {},
        pkgMap = {},
        styleMap = {};



    function createScript(url, onerror) {
        if (url in scriptsMap) return;
        scriptsMap[url] = true;

        var script = document.createElement('script');
        if (onerror) {
            var tid = setTimeout(onerror, require.timeout);

            script.onerror = function() {
                clearTimeout(tid);
                onerror();
            };

            script.onreadystatechange = function() {
                if (this.readyState == 'complete') {
                    clearTimeout(tid);
                }
            }
        }
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
        return script;
    }

    function loadScript(id, callback, onerror) {
        var queue = loadingMap[id] || (loadingMap[id] = []);
        queue.push(callback);

        //
        // resource map query
        //
        var res = resMap[id] || {};
        var pkg = res.pkg;
        var url;

        if (pkg) {
            url = pkgMap[pkg].url;
        } else {
            url = res.url || id;
        }

        createScript(url, onerror && function() {
            onerror(id);
        });
    }

    /**
     * 动态插入css文本片段
     * 从原先PC主站中迁移过来
     * @by fms 2013-12-18
     * @param {string} cssText css样式文本片段
     */
    function addSheet(cssText) {
        var doc = document,
            cssCode = cssText;
        var headElement = head;
        var styleElements = headElement.getElementsByTagName("style");
        if (styleElements.length == 0) { //如果不存在style元素则创建
            if (doc.createStyleSheet) {
                //包括ie10在内的以下版本，创建一个空的style标签并插入到当前document中
                doc.createStyleSheet();
            } else {
                //w3c标准
                var tempStyleElement = doc.createElement('style');
                tempStyleElement.setAttribute("type", "text/css");
                headElement.appendChild(tempStyleElement);
            }
        }
        var styleElement = styleElements[0];
        var media = styleElement.getAttribute("media");
        if (media != null && !/screen/.test(media.toLowerCase())) {
            styleElement.setAttribute("media", "screen");
        }
        if (styleElement.styleSheet) { //ie
            styleElement.styleSheet.cssText += cssCode;
        } else if (doc.getBoxObjectFor) { //火狐支持直接innerHTML添加样式表字串
            styleElement.innerHTML += cssCode;
        } else {
            styleElement.appendChild(doc.createTextNode(cssCode))
        }
    }

    define = function(id, factory) {
        factoryMap[id] = factory;

        var queue = loadingMap[id];
        if (queue) {
            for (var i = queue.length - 1; i >= 0; --i) {
                queue[i]();
            }
            delete loadingMap[id];
        }
    };

    require = function(id) {
        id = require.alias(id);

        var mod = modulesMap[id];
        if (mod) {
            return mod.exports;
        }

        //
        // init module
        //
        var factory = factoryMap[id];
        if (!factory) {
            throw Error('Cannot find module `' + id + '`');
        }

        mod = modulesMap[id] = {
            exports: {}
        };

        //
        // factory: function OR value
        //
        var ret = (typeof factory == 'function') ? factory.apply(mod, [require, mod.exports, mod]) : factory;

        if (ret) {
            mod.exports = ret;
        }
        return mod.exports;
    };

    require.async = function(names, onload, onerror) {
        if (typeof names == 'string') {
            names = [names];
        }

        for (var i = names.length - 1; i >= 0; --i) {
            names[i] = require.alias(names[i]);
        }

        var needMap = {};
        var needNum = 0;

        function findNeed(depArr) {
            for (var i = depArr.length - 1; i >= 0; --i) {
                //
                // skip loading or loaded
                //
                var dep = depArr[i];
                if (dep in factoryMap || dep in needMap) {
                    continue;
                }

                needMap[dep] = true;
                needNum++;
                loadScript(dep, updateNeed, onerror);

                var child = resMap[dep];
                if (child && 'deps' in child) {
                    findNeed(child.deps);
                }
            }
        }

        function updateNeed() {
            if (0 == needNum--) {
                var i, n, args = [];
                for (i = 0, n = names.length; i < n; ++i) {
                    args[i] = require(names[i]);
                }
                onload && onload.apply(self, args);
            }
        }

        findNeed(names);
        updateNeed();
    };

    require.resourceMap = function(obj) {
        var k, col;

        // merge `res` & `pkg` fields
        col = obj.res;
        for (k in col) {
            if (col.hasOwnProperty(k)) {
                resMap[k] = col[k];
            }
        }

        col = obj.pkg;
        for (k in col) {
            if (col.hasOwnProperty(k)) {
                pkgMap[k] = col[k];
            }
        }
    };

    require.loadJs = function(url) {
        createScript(url);
    };

    require.loadCss = function(cfg) {
        if (cfg.content) {
            // 这段代码在ie下部分css hack会失效
            /*            var sty = document.createElement('style');
            sty.type = 'text/css';
            if (sty.styleSheet) {       // IE
                sty.styleSheet.cssText = cfg.content;
            } else {
                sty.innerHTML = cfg.content;
            }
            head.appendChild(sty);*/
            //如果已经加载过样式资源，则不再重复
            if (cfg.name) {
                if (styleMap[cfg.name] !== 1) {
                    addSheet(cfg.content);
                    styleMap[cfg.name] = 1;
                }
            } else {
                addSheet(cfg.content);
            }

        } else if (cfg.url) {
            var link = document.createElement('link');
            link.href = cfg.url;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        }
    };


    require.alias = function(id) {
        return id
    };

    require.timeout = 5000;

    define.amd = {
        'jQuery': true,
        'version': '1.0.0'
    };


})(this);