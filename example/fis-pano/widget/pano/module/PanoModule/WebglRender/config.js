var config = {
    PANO_URL:'http://pcsv0.map.bdimg.com/',
    PANO_TILE_URL:'http://pcsv{port}.map.bdimg.com/?qt=pdata&sid={sid}&pos={y}_{x}&z={z}&udt=20141108',
    //球模型经纬度精度
    SPHERE_WIDTH_SEGMENTS: 64,
    SPHERE_HEIGHT_SEGMENTS: 32,
    //井盖最近显示距离
    TRACKER_MIN_DISTANCE:3,
    //井盖最远显示距离
    TRACKER_MAX_DISTANCE:50,
    //无操作时，箭头隐藏延迟
    ARROW_AUTOHIDDEN_DELAY:2000,
    //拓扑箭头缩放比例
    ARROW_SIZE:300,
    //前进动画移动距离
    ANIMATION_MOVE_LENGTH: 3,
    //前进动画持续时间
    ANIMATION_MOVE_DURATION: 600,
    //前进动画变化函数
    ANIMATION_MOVE_FUNC: function(x){
        return Math.sqrt(x);
    },
    //清晰瓦片加载完成后透明度变化时间
    TILE_FADE_IN_DURATION:300,
    //清晰瓦片加载完成后透明度变化函数
    TILE_FADE_IN_FUNC:function(x){
        return x * x;
    },
    $set:function(key, value){
        this[key] = value;
    }
};
return config;
