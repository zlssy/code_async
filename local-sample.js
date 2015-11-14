module.exports = {
	port: '3000', //监听的端口号
	apiUrl: 'http://testtclpay.tclclouds.com/settlement', //接口地址 正式环境请配局域网地址以提高效率
	proxyPath: '/settlementWeb', //url根路径
	filePath: '/settlementWeb',//引用静态前端文件(js,css)路径

		//passport 配置
	passport    : 'http://passporttest.tclclouds.com/passport',//passport URL
	projectCode : 'settlement', //分配的名称
	projectKey  : 'qysks4rb',   //分配的KEY
	serverHost  : 'http://testtclpay.tclclouds.com/settlementWeb',//项目URL

	//临时用户名密码
	,users: [
		['admin','P@ssw0rd'],
		['why','123']
	]
/*说明
不通过代理访问 或者 代理的路径为根目录时请如下配置
proxyPath: '',
filePath:  '',
*/
}