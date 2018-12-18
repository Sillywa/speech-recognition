// 百度语音识别api

var fs = require("fs")

let AipSpeech = require("baidu-aip-sdk").speech;
// 务必替换百度云控制台中新建百度语音应用的 Api Key 和 Secret Key

let config = {
    apiKey: 'ohlzg5bQUuaTfAnymM9GCtC6',
    secretKey: 'CEYgePGvRKPEtTlMHArhR9ugxvMafKOR'
}
let client = new AipSpeech(0, config.apiKey, config.secretKey);


function deleteFile(filePath) {
    fs.unlink(filePath,function(error) {
        if(error) {
            return console.log(err)
        }
        console.log("文件删除成功")
    })
}
let startRecognize = function (filePath,callback) {
    let voice = fs.readFileSync(filePath);

    let voiceBase64 = new Buffer(voice);

    client.recognize(voiceBase64, 'wav', 16000).then(function(message) {
        let result = {
            code: message.err_no
        }
        console.log('语音识别本地音频文件结果: ' + JSON.stringify(message) );
        console.log(message)
        // 识别完之后删除文件
        deleteFile(filePath)
        if (message.err_no == 0) {
            result.status = 200
            result.result = message.result
        } else {
            result.status = 500
            result.result = message.err_msg
        }
        
        callback(result)
    }, function(err) {
        console.log(err)
        let result = {
            code: 1000,
            result: "请求百度语音服务出错"
        }
        result.status = 500
        callback(result)
    });

}

module.exports = startRecognize
