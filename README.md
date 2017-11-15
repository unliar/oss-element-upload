# oss 前端直传
>oss上传文件有两种方式,一种是上传到服务器,服务器传输到oss,清空临时文件,另一种是直接通过用户端传输到oss,服务器只提供签名,和回调。

>优势:减轻了服务器鸭梨。劣势：对用户上传行为没法很好的监控。

## config 配置
>oss bucket 配置跨域 [务必在控制台设置跨域](https://help.aliyun.com/document_detail/31928.html) 

> 修改里的config配置 ./router.js

## start 启动

1、npm i

2、node app.js

## demo
>访问element-ui demo, localhost:2050/demo/index.html,
   
>原生 localhost:2050/demo/index2.html
