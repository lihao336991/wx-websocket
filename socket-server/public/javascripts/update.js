var exec = require('child_process').exec;
var cmd = 'git pull origin master';

exec(cmd, function(error, stdout, stderr) {
    // 获取命令执行的输出
    if (error) {
        console.log(error);
    } else {
        console.log("成功");
    }
})();