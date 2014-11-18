importScripts('lib/Long.js', 'lib/ByteBufferAB.js', 'lib/ProtoBuff.js');
var featureMessage = dcodeIO.ProtoBuf.loadProtoFile("lib/feature.proto").build();

onmessage = function (evt){    
    var rawData = evt.data; //通过evt.data获得发送来的数据

    var res = parseData(rawData);
    postMessage(res); //将获取到的数据发送会主线程
}

function parseData(rawData){    
    var res = featureMessage.vecmap.GridBinaryData.decode(new Uint8Array(rawData)),
        png = res.png;

    if(png && png.buffer){
        //替换原有的png为base64串
        res.png = decodeImage(new Uint8Array(png.buffer), png.offset);
    }    
    return res;
}

function decodeImage(binaryData, offset){
    var i = binaryData.length;
    offset = offset || 0;
    var binaryString = new Array(i);
    while (i >= offset) {
        binaryString[i] = String.fromCharCode(binaryData[i]);
        i --;
    }
    var data = binaryString.join(''),
        base64 = btoa(data);

    return "data:image/png;base64," + base64;    
}
