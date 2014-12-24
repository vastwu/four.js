Four.ready(function(){

    require(['./pano/Panorama.js'], function(Panorama){
        var container = document.getElementById('container');
        var pano = window.pano = new Panorama(container, {
            'sid':'0100220000130808133131113J2'
        });
    });
   
})

