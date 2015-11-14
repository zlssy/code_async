#部署说明#  

*系统环境需求:*  
1. 系统环境 linux/windows/macos , git;  
2. 运行环境 nodejs , npm , pm2;  
3. git仓库权限  

#部署步骤:#   

##1.git拉取项目代码(分支/tag),进入目录
`git clone ssh://git@stash.lab.tclclouds.com:7999/wf/operation.git`  
`cd settlements`  
##2.安装子模块
`git submodule  init`  
`git submodule  update`  
##3.下载依赖
`npm install`  
##4.配置项目
详细配置参看local-sample.js注释;   
`cp local-sample.js local.js`  
`vim local.js`  
##5.安装pm2
`npm install pm2 -g`  
##6.配置pm2配置文件
主要配置日志存放路径,运行实例数等  
`vim pm2.json`  
`mkdir log`  
##7.启动/重启/停止
`pm2 start pm2.json`  
`pm2 restart pm2.json`  
`pm2 delete pm2.json`  
##8.配置nginx(略)
