require.async(['common:widget/pano/module/PanoModule/WebglRender/Panorama.js'], function(Panorama){

    var container = document.getElementById('container');
    var pano = window.pano = new Panorama(container, {
        'sid':'0100220000130808133131113J2'     //东湖别墅门口
        //'sid':'0100220000130808133339443J2'   //十字路口
        //'sid':'0100220000130808163419019J2'   //十字路口往北
        //'sid':'0100220000130808163426360J2'
        //'sid':'0100220000130817125150912J2' //银座麦当劳
    });
    //pano.setPov(89.79);
    //pano.setPov(179.79);

    //debug marker
    var createViewer = function(container, dragController){
        var view = document.createElement('div');
        view.style.cssText = [
            'display:inline-block',
            'white-space:nowrap',
            'border:1px solid red',
            'padding:10px',
            'color:white',
            'background-color:rgba(0,0,0,0.8)'
        ].join(';');
        return view;
    }
    var debugView = createViewer(container);
    pano.on('pov_changed', function(heading, pitch){
        debugView.innerHTML = 'heading:' + heading + ' ,pitch:' + pitch;
    });
    pano.addDomMarker(debugView, 20, 20);


    //东湖别墅
    (function(){
        var div = document.createElement('div');
        div.innerHTML = '东湖别墅';
        div.style.cssText = [
            'display:inline-block',
            'white-space:nowrap',
            'border:1px solid red',
            'padding:10px',
            'color:white',
            'cursor:pointer',
            'background-color:rgba(0,0,0,0.8)'
        ].join(';');
        pano.addDomMarker(div, 12963124, 4830592, {
            'isCoordPosition':true,
            'markerHeight':0.1
        });
        div.addEventListener('click', function(){
            pano.setPanoId('0100220000130808133131113J2', 37);
        });
    })();

    //银座麦当劳
    (function(){
        var div = document.createElement('div');
        div.innerHTML = '银座麦当劳';
        div.style.cssText = [
            'display:inline-block',
            'white-space:nowrap',
            'border:1px solid red',
            'padding:10px',
            'color:white',
            'cursor:pointer',
            'background-color:rgba(0,0,0,0.8)'
        ].join(';');
        pano.addDomMarker(div, 12962438, 4830462, {
            'isCoordPosition':true,
            'markerHeight':0.1
        });
        div.addEventListener('click', function(){
            pano.setPanoId('0100220000130817125150912J2', 267);
        });
    })();
    //pano.setPov(89.26);

});


