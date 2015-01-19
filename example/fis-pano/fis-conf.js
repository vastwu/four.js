/**
 * 测试机服务器远程发布配置
 * @type {Object}
 */
//是否开启debug模式，本地调试或者发布到测试机使用本模式
var OPEN_DEBUG = false;

var MUSCLE_MAN_CONFIG = {
    deploy:{},
    //线下调试路径域名配置
    DEBUG_DOMAIN: {
        '**': '/newmap'
    }
};

/**
 * 编译打包配置
 * @type {String}
 */
fis.config.merge({
    // 模块名申明
    namespace: 'common',
    // 申明支持的文件类型
    project: {
        fileType: {
            image: 'swf, cur, ico,gif'
        },
        exclude: /.*\.(?:svn|cvs|tar|rar|psd|bat|log|docx|area).*/i
    },
    //打包配置
    pack: {
    },
    // 产出配置
    roadmap: {
        // 线下(cdn域名)路径配置
        domain: OPEN_DEBUG ? MUSCLE_MAN_CONFIG.DEBUG_DOMAIN : MUSCLE_MAN_CONFIG.ONLINE_DOMAIN
        //线上cdn域名配置
        // domain: MUSCLE_MAN_CONFIG.ONLINE_DOMAIN
    },
    settings: {
        parser: {
            bdtmpl: { //对前端模板处理的插件中，初始化参数
                LEFT_DELIMITER: '<%',
                RIGHT_DELIMITER: '%>'
            }
        }
    },
    // 部署配置
    deploy: {
        //使用fis release --dest map来使用这个配置
        map: [{
            //如果配置了receiver，fis会把文件逐个post到接收端上
            receiver: MUSCLE_MAN_CONFIG.deploy.receiver,
            //从产出的结果的static目录下找文件
            from: '/static',
            //上传目录从static下一级开始不包括static目录
            subOnly: true,
            //保存到远端机器的/lighttpd/htdocs/newmap/static目录下
            //这个参数会跟随post请求一起发送
            to: MUSCLE_MAN_CONFIG.deploy.root + '/lighttpd/htdocs/newmap/static',
            //某些后缀的文件不进行上传
            exclude: /.*\.(?:svn|cvs|tar|rar|psd|bat|db|log|txt|text|docx|xml|sh).*/
        }, {
            //如果配置了receiver，fis会把文件逐个post到接收端上
            receiver: MUSCLE_MAN_CONFIG.deploy.receiver,
            //从产出的结果的static目录下找文件
            from: '/config',
            //上传目录从static下一级开始不包括static目录
            subOnly: true,
            //保存到远端机器的/phpui/webmap/smarty/config目录下
            //这个参数会跟随post请求一起发送
            to: MUSCLE_MAN_CONFIG.deploy.root + '/phpui/webmap/smarty/config',
            //某些后缀的文件不进行上传
            exclude: /.*\.(?:svn|cvs|tar|rar|psd|db|bat|log).*/
        }, {
            //如果配置了receiver，fis会把文件逐个post到接收端上
            receiver: MUSCLE_MAN_CONFIG.deploy.receiver,
            //从产出的结果的static目录下找文件
            from: '/plugin',
            //上传目录从static下一级开始不包括static目录
            subOnly: true,
            //保存到远端机器的/phpui/webmap/smarty/plugin目录下
            //这个参数会跟随post请求一起发送
            to: MUSCLE_MAN_CONFIG.deploy.root + '/phpui/webmap/smarty/plugin',
            //某些后缀的文件不进行上传
            exclude: /.*\.(?:svn|cvs|tar|rar|psd|db|bat|log).*/
        }, {
            //如果配置了receiver，fis会把文件逐个post到接收端上
            receiver: MUSCLE_MAN_CONFIG.deploy.receiver,
            //从产出的结果的static目录下找文件
            from: '/template',
            //上传目录从static下一级开始不包括static目录
            subOnly: true,
            //保存到远端机器的/phpui/webmap/views/template目录下
            //这个参数会跟随post请求一起发送
            to: MUSCLE_MAN_CONFIG.deploy.root + '/phpui/webmap/views/template',
            //某些后缀的文件不进行上传
            exclude: /.*\.(?:svn|cvs|tar|rar|psd|db|bat|log).*/
        }]
    },
    modules: {
        optimizer: {
            tpl: 'html-compress'
        }
    }
});


///images/api目录下的文件不需生成MD5
fis.config.get('roadmap.path').unshift({
    reg: /^\/static\/images\/api\/(.*\.(?:png|gif|cur|ico|jpg))/i,
    useHash: false,
    useDomain: true,
    release: '/static/${namespace}/images/api/$1'
});



//生成fis_resource_map.js独立文件配置
fis.config.set('modules.postpackager', function(ret, conf, settings, opt) {
    var map = ret.map;
    var _ = fis.util;
    var result = {
        res: {},
        pkg: {}
    };

    function next(id, obj, type) {

        if (obj['type'] == 'js') {
            var info = fis.util.clone(obj);
            info['url'] = info['uri'];

            delete info['extras'];
            delete info['uri'];
            delete info['type'];

            result[type][id] = info;
        }
    }

    //res
    _.map(map.res, function(id, obj) {
        next(id, obj, 'res');
    });
    //pkg
    _.map(map.pkg, function(id, obj) {
        next(id, obj, 'pkg');
    });

    var file = fis.file.wrap(fis.project.getProjectPath() + '/static/fis_resource_map.js');
    file.setContent('require.resourceMap(' + JSON.stringify(result) + ');');
    ret.pkg[file.subpath] = file;

    var url = file.getUrl(opt.hash, opt.domain);

    _.map(ret.src, function(subpath, file) {
        if (file.extras && file.extras.isPage) {
            var content = file.getContent();
            if (/\{%html/.test(content)) {
                content = '{%$fis_res_map_url[]="' + url + '"%}' + content;
            } else if (/\{%extends/.test(content)) {
                var p = content.indexOf('{%/block%}');
                content = content.substring(0, p) + '{%$fis_res_map_url[]="' + url + '"%}' + content.substring(p);
            } else {
                content = '{%$fis_res_map_url[]="' + url + '"%}' + content;
            }

            file.setContent(content);
        }
    });
});
