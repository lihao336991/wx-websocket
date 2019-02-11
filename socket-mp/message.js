import IM from './im-manager';
import common from '../common/common';
let api = common.api;
let toolkit = common.toolkit;
let socket = new IM();
let wss = {};

Page({
    data: {
        send_id: 12,
    },
    onLoad() {
        let page = this;
        wss = socket.createSocket(page.data.send_id, page, (res) => {
            console.log('socket连接成功')
        }, (err) => {
            console.log('socket错误', err.errMsg)
        });
    }
});