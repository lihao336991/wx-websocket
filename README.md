# 微信小程序websocket聊天室
微信小程序中聊天室的服务端和客户端配置示例

/socket-server ：服务端项目目录

/socket-mp ：小程序前端代码示例


## 背景

最近做了一个微信小程序的即时通讯功能，之前我也做过node.js的websocket服务，不过是在web端应用的socket.io服务。小程序本身对http、websocket等连接均有诸多限制，所以这次项目选择了node.js自带的ws模块。

## 服务端

初始化一个node.js项目，引入ws模块

```
const webSocket = require('ws');
```
创建websocket实例，并设置监听端口
```
const wss = new webSocket.Server({
    port: 3001
});
```
<!--more-->
定义wss实例方法，实现socket监听和信息发布。下面贴上简单的示例：
```
wss.on('connection', function connection(ws, req) {
    console.log('连接开启')
    
    //发生错误
    ws.on('error', function error(error) {
        console.log('error', error);
    });

    //断开连接
    ws.on('close', function close(close) {
        console.log( '已关闭');
    });

    ws.on('message', function message(message) {
        ws.send('客户端发来了一条消息')
    });

    //发送消息
    ws.send('连接已开启');
    ws.send(id + '已连接')
});
```
这样，一个简单的websocket服务就配置完成了。当然，问题远远不止这么简单。要想在小程序中进行通信，还需要解决下面几个问题。

## 域名

关于小程序服务端域名配置，小程序开发文档中如下提到

![](https://user-gold-cdn.xitu.io/2019/1/30/1689e1876366367f?w=1110&h=373&f=png&s=66515)
小程序请求地址只支持https或者wss协议，因此首先要配置的就是SSL证书。拿到SSL证书之后，在服务端做一下https的配置即可。
```
var fs = require('fs');
const options = {
    key: fs.readFileSync('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'utf8'),//证书地址
    cert: fs.readFileSync('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'utf8'),//证书地址
};
var https = require('https');
var server = https.createServer(options, app);
```

另外值得注意的是，websocket监听的端口号需要做一下代理，因为小程序如果不配置端口号时，所有请求的url都不可以带端口号。

## 多房间通信

先看一下广播的实现：
```
//广播方法
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data)
    });
};
```
wss对象的clients是一个存储着所有socket连接对象的数组，每条连接对象都可以调用各自的send方法发送信息。

在此基础上，我们可以进行一定的封装，用一个唯一的标识符映射到每一条socket连接，这样我们需要向特定的某个连接发送信息时，就可以找到该连接。

可以通过连接的url作为唯一标识：

```
 let sockets = {}
 wss.on('connection', function connection(ws, req) {
        let id = req.url.slice(5);//截几位字符串根据自己实际获得的url来看
        sockets[id] = ws;
        ws.send(id + '已连接');
        ...
```
客户端每次连接时url后拼接一个唯一id，在服务端获取``req.url``并截取字符串拿到唯一id，并将该连接对象存储在全局的sockets下以便需要时使用。

在此基础上，可以继续封装诸如加入房间、离开房间、房间内通信、向特定用户私聊等功能，总体来说是对send方法的封装。值得注意的是send方法只能发送字符串，json对象需要转化成字符串再传入send。

下面是一个私聊的示例：

```
wss.notice = function notice(id, data, ws) {
    // 向指定id发送
    try {
        ws.send('正在发送...')
        var notice = JSON.stringify({
            type: 'notice',
            data: data
        })
        let target = sockets[id]
        if (target) {
            target.send('收到一条新消息')
            target.send(notice)
        } else {
            ws.send('目标信道已关闭')
        }
    } catch (err) {
        console.log(err)
    }
}
```
到这里，一个简单的聊天室服务端配置就基本完成了。

最终作品效果如下：
[![kafv7R.gif](https://github.com/lihao336991/wx-websocket/blob/master/kafv7R.gif)](https://github.com/lihao336991/wx-websocket/blob/master/kafv7R.gif)


有问题可以一起探讨，顺手点个赞就更好啦！