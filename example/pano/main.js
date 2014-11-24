Four.ready(function(){

    require(['./pano/Panorama.js'], function(Panorama){
        var container = document.getElementById('container');
        var pano = new Panorama(container, {
            'svid':'0100220000130829094125300J3'
        });
    });
   
})

