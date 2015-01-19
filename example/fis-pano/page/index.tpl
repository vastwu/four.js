<!DOCTYPE HTML>
{%html framework="common:static/libs/mod.js"%}
{%head%}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <style>
    html,body{
        background-color:black;
        width:100%;
        height:100%;
        margin:0;
        padding:0;
    }
    #container{
        width:100%;
        height:100%;
    }
    </style>
{%/head%}
{%body%}
    <div id="container"></div>

    <!--<script src="../../src/WebGLRender/Four.js"></script>-->
    {%require name="common:static/libs/Four.js"%}
    {%require name="common:static/bootstrap.js"%}
{%/body%}
{%/html%}



