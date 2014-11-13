define(function(){
    var Shaders = {};
    Shaders.baseVertexShader = [
        'attribute vec3 aVertexPosition;',
        'attribute vec4 aVertexColor;',
        'varying vec4 vColor;',
        'void main(void){',
        '   gl_Position = vec4(aVertexPosition, 1.0);',
        '   vColor = aVertexColor;',
        '}'
    ].join('');
    Shaders.mVertexShader = [
        'attribute vec2 aTextureCoord;',
        'attribute vec3 aVertexPosition;',
        'attribute vec4 aVertexColor;',
        'varying vec4 vColor;',
        'varying vec2 vTextureCoord;',
        'uniform mat4 uMVMatrix;',
        'uniform mat4 uPMatrix;',
        'uniform mat4 uItemMatrix;',
        'void main(void){',
        '   gl_Position = uPMatrix * uMVMatrix * uItemMatrix * vec4(aVertexPosition, 1.0);',
        '   vColor = aVertexColor;',
        '   vTextureCoord = aTextureCoord;',
        '}'
    ].join('\n');
    Shaders.baseFragmentShader = [
        'precision mediump float;',
        'varying vec4 vColor;',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        'uniform bool uDrawTexture;',
        'uniform float uOpacity;',
        'void main(void){',
        '   if (uDrawTexture) {',
        '       vec4 texelColor = texture2D( uSampler, vTextureCoord);',
        '       gl_FragColor = texelColor * vec4(1.0, 1.0, 1.0, uOpacity);',
        '   } else {',
        '       gl_FragColor = vec4(vColor.rgb, vColor.a * uOpacity);',
        '   }',
        '}'
    ].join('\n');

    return Shaders;
})
