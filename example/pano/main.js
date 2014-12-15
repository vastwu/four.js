Four.ready(function(){

    require(['./pano/Panorama.js'], function(Panorama){
        var container = document.getElementById('container');
        var pano = window.pano = new Panorama(container, {
            'sid':'01002200001308181010448555D'
        });
    });
   
})

