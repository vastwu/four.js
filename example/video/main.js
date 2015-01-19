Four.ready(function(){
    var vw = 2048;
    var vh = 1024;
    var container = document.getElementById('container');

    var video = document.createElement('video');
    video.preload = true;
    video.autoplay = true;
    video.controls = true;
    video.loop = true;
    video.width = vw;
    video.height = vh;
    video.className = 'video';
    video.src = './test_360.mp4';
    video.id = 'video_player';
    document.body.appendChild(video);

    var canvas = document.createElement('canvas');
    canvas.id = 'video_texture';
    var context = canvas.getContext('2d');
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    canvas.width = vw;
    canvas.height = vh;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    var img = new Image();
    img.src = '../../image/earth.png';



    /*
    navigator.webkitGetUserMedia({
        'video':true
    }, function(stream){
        video.src = webkitURL.createObjectURL(stream);
    }, function(error){
        console.error('failed to get a stream ', error);
    })
    */
    var isPlaying = false;

    if(location.search.indexOf('canvas') > -1){
        video.addEventListener('play', function(){
            if(isPlaying){
                return;
            }
            isPlaying = true;
            var video360 = new Earth(container);
            video360.setTexture(canvas);
            var render = function(){
                context.clearRect(0, 0, vw, vh);
                context.drawImage(video, 0, 0, vw, vh);
                video360.clearBuffer();
                setTimeout(render, 64);
                return;
            }
            render();
        });
    }else{
        video.addEventListener('play', function(){
            if(isPlaying){
                return;
            }
            isPlaying = true;
            var video360 = new Earth(container);
            video360.setTexture(video);
            var render = function(){
                video360.clearBuffer();
                setTimeout(render, 64);
                return;
            }
            render();
        });
    }


    return;
})

