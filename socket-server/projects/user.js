var db = require('../common/basicConnection');
var $sqlCommands = require('../common/sqlCommands');

/**
 * 增加用户Action
 */
function addUserAction(req, res, next) {
    // 获取前台页面传过来的参数
    var param = req.query || req.params;
    // 执行Query
    db.queryArgs($sqlCommands.user_status.insertOne, [param.username, param.password, param.qrcode],
        function(err, result) {
            if (!err) {
                result = {
                    code: 200,
                    msg: 'successful'
                };
            }
            // 以json形式，把操作结果返回给前台页面
            db.doReturn(res, result);
        }
    );
}

// exports
module.exports = {
    addUserAction: addUserAction
};