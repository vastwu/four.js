/**
 * @ignore
 */
var Panorama = require('common:widget/pano/module/PanoModule/WebglRender/Panorama.js');
var Emiter = require('common:widget/pano/module/PanoModule/WebglRender/Emiter.js');
var util = require('common:widget/pano/module/PanoModule/WebglRender/util.js');

/**
 * 构造函数
 * @param {opts}, {panoData:{xx}, container: xx, panoConfigUrl: {xx}}
 */
var WebglRender = util.extend(Emiter, {
    'init': function (panoDatas, containerDom, panoConfigUrl) {
        this.container = containerDom;


        this.instance = new Panorama(containerDom, {

        });

        //this._jsForFlashEventHandlers = null; //用来保存js事件(滚轮、浏览器大小改变等丰富flash功能)响应处理函数

        //this.initialize(panoDatas, panoConfigUrl);

        //this._createFlash(panoDatas, this._flashContainer, panoConfigUrl);
        //this._decorateFlash(); //丰富flash的功能,比如滚轮缩放放大缩小
    },
    /* align */
    addEventListener:function(){
        return this.on.apply(this, arguments);
    },
    removeEventListener:function(){
        return this.off.apply(this, arguments);
    },
    /**
     * js调用flash的某个操作doAction
     * @param {actionName} 操作类型
     * @param {object|undefine} 操作所带数据
     */
    doAction: function(actionName, value) {
        /*
        if (actionName == 'closePano') {
            this._dispose();
        }
        this._flashDom.doAction && this._flashDom.doAction(actionName, value);
        */
    },
    /*
     * 跳转到某个点
     * @param {Object} value
     */
    gotoPOI: function(value) {
        //flash需要厘米单位, js部分墨卡托全部使用米, 在最后入口处修正
        /*
        var value = {
            'id': value.uid,
            'pid': value.panoId,
            'x': value.x * 100,
            'y': value.y * 100,
            'rank': value.rank,
            'panox': value.panoX * 100,
            'panoy': value.panoY * 100,
            'dir': value.panoHeading,
            'pitch': value.panoPitch,
            'poiLinex': value.poiLinex,
            'poiLiney': value.poiLiney,
            'tourId':value.tourId
        };
        this._flashDom.doAction('gotoPOI', value);
        */
        this.instance.setPanoId(value.uid, value.panoHeading);
    },
    /**
     * 通知flash绘制一条线,从二维屏幕点到flash中的3维点坐标
     * @param {String} [uid=''] poi的uid
     * @param {Number} startX 起点坐标,距离屏幕左上角x
     * @param {Number} startY 起点坐标,距离屏幕左上角y
     * @param {Number} pointX 目标墨卡托x,单位米
     * @param {Number} pointY 目标墨卡托y,单位米
     * @param {Number} pointRank 目标高度, 单位厘米
     * @param {Function} callback 绘制结束回调函数,第一个参数为报错信息,无参数表示正常
     */
    drawLineToPoint: function(uid, startX, startY, pointX, pointY, pointRank, callback) {
        /*
        var listener = function(evt, args) {
            //once
            this.removeEventListener('draw_line_complete', listener);
            callback(args.data);
        }
        this.addEventListener('draw_line_complete', listener);
        this._flashDom.doAction('drawPOILine', {
            pointX: pointX * 100,
            pointY: pointY * 100,
            pointRank: pointRank,
            startX: startX,
            startY: startY,
            id: uid || ''
        });
        */
    },
    setRoutParam: function(param) {
        this.set('routParams', param);
    },
    closePano: function() {
        this.instance.dispose();
        this.instance = null;
    },
    addMarkers: function(markers) {
        this.instance.addMarker();
    },
    hideRegion: function() {
        //this._flashDom.doAction('hideRegion');
    },
    removeMarkers: function(markerIdArr) {
        this.instance.removeMarker();
    },
    getMarkerUidInBestPano: function() {
        //return this._flashDom.get('markerUidInBestPano');
    },
    //关闭路径导航视频
    playRouteVideo: function(params) {
        //return this._flashDom.doAction('playPanoVideo', params);
    },
    //关闭路径导航视频
    closeRouteVideo: function() {
        //return this._flashDom.doAction('closePanoVideo');
    },
	/**
	 * js调用flash get接口获取街景数据
	 * @param {string} key，获取的数据名称key
	 * @return {object | string | number} 返回flash返回的结果数据
	 */
	get: function(key) {
		//return this._flashDom.get(key);
	},

    /**
     * js调用flash set接口，设置flash内数据
     * @param {string} key, 数据字段名
     * @param {object | string | number} value，数据字段对应的数据
     */
    set: function(key, value) {
        /*
        if (key == 'panoOptions') {
            var size = this._getContainerSize(this._flashDom);
            value = {
                'panoType': value.panoType,
                'id': value.panoId || value.panoIId,
                'pid': value.panoId,
                'iid': value.panoIId,
                'poiuid': value.panoUId,
                'heading': value.panoHeading,
                'pitch': value.panoPitch,
                'zoom': value.panoZoom,
                'width': size.width,
                'height': size.height
            };
        }
        if (this._flashDom && this._flashDom.set) {
            this._flashDom.set(key, value);
        }
        */
    },
    /**
     * 获取容器的宽高
     * @return {object}, 宽高尺寸对象{width: xx, height: xx}
     */
    _getContainerSize: function(containerDom) {
        /*
        return {
            width: containerDom.clientWidth,
            height: containerDom.clientHeight
        };
        */
    }
});
module.exports = WebglRender;
