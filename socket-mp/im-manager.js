//一个websocket调度中心类的示例

let common = require('../common/common.js'),
    api = common.api,
    toolkit = common.toolkit;

var wss;
export default class IMManager {
    static url = ''; //通信地址

    //构造消息类，需要参数：消息类型
    constructor() {
        this.text = 0;
        this.img = 1;
        this.voice = 2;
        this.sending = 0;
        this.success = 1;
        this.fail = 2;
        this.devUrl = api.socketHost + '/'
    };
    //建立socket连接
    createSocket(id, page, callback1, callback2) {
        let that = this
        wss = wx.connectSocket({

            url: that.devUrl + id,
            data: {

            },
            header: {
                'content-type': 'application/json'
            },
            method: 'GET'
        })

        wss.onOpen(callback1)

        wss.onClose(function(res) {
            console.log('已关闭', res)
        })

        wss.onError((err) => {
                console.log('直接打印错误', err)
                if (callback2) {
                    callback2(err)
                }
            })
            //接收新消息必须做点什么（判断类型，订阅DOM更新）
        wss.onMessage(function(res) {
            let message = {};
            try {
                message = JSON.parse(res.data)
            } catch (err) {
                message = res.data
            }
            if (message.type) {
                switch (message.type) {
                    case 'notice': //拿到了新消息
                        //更新消息列表
                        console.log('收到了一条消息', message)
                            //监听到消息 
                            //筛选本房间消息                           
                            //推入视图消息队列
                        if (!message.data.info || message.data.info.room_id != page.data.consult.room_id) {
                            return;
                        }
                        let arr = page.data.chatItems
                        if (message.data.info) {
                            if (arr[arr.length - 1]) {
                                if (message.data.info.created_at - 180 > arr[arr.length - 1].created_at) {
                                    message.data.info.showTime = true
                                }
                            } else {
                                message.data.info.showTime = true
                            }
                            arr.push(message.data.info)
                            page.setData({
                                chatItems: arr
                            })
                            page.pageScrollToBottom();
                        }
                        break;
                    case 'join':

                        break;
                    case 'leave':

                        break;
                }
            } else {
                console.log(message)
            }
        })
        return wss;
    };
    //组装消息
    makeUpNotice(send_id, consult_id, room_id, type, content, duration) {
        return {
            send_id: send_id,
            consult_id: consult_id,
            room_id: room_id,
            type: type,
            content: content,
            time_long: duration,
            read_status: type == 2 ? 0 : 1
        }
    };
    //发送请求
    sendRequest(notice, callback) {
        console.log(notice)
        let params = {
            room_id: notice.room_id,
            send_id: notice.send_id,
            type: notice.type,
            content: notice.content,
            consult_id: notice.consult_id
        }
        if (params.type == 2) {
            params.time_long = notice.time_long
        }
        console.log(params)
        toolkit.post(api.message.send, params, callback, false)
    };
    //对方不在线，将对应id消息改成未读
    editStatus(data, id, callback) {
        let params = {
            token: data.token,
            status: 0,
            room_id: data.room_id,
            message_id: id
        }
        toolkit.post(api.message.read, params, callback, false)
    };
    //向node服务器发送notice
    sendNotice(wss, notice, id) {
        console.log(wss)
        var message = JSON.stringify({
            type: 'notice',
            data: {
                id: id,
                data: {
                    info: notice
                }
            }
        })
        wss.send({
            data: message,
            success: function() {
                console.log('socket发送成功')
            },
            fail(err) {
                console.log(err, '发送失败了')
            }
        })
    };
    //消费消息队列
    consumeNotice() {

    };
}