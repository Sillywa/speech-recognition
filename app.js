var express = require("express");
var app = express();
var multipart = require('connect-multiparty'); //在处理模块中引入第三方解析模块 
var multipartMiddleware = multipart();
var path = require("path")
var fs = require("fs")

var recognize = require("./baiduApi")

app.use(multipart({uploadDir:'./upload' }))

app.post('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.get('*', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    next();
});

app.post('/', multipartMiddleware, function (req, res, next) {
    let filePath = path.resolve(req.files.audioData.path);  // 如果是本地文件
    fs.rename(filePath,filePath+'.wav',function(){

        recognize(filePath+'.wav',function(result) {
            // 返回结果给客户端     
            res.status(result.status).json(result)
        })
    })
});


app.use(express.static("public")).listen(8888);