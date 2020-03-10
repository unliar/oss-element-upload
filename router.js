const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

const config = {
  dirPath: "oss/file/", //oss 文件夹 不存在会自动创建
  bucket: "glhtest", //oss应用名
  region: "oss-cn-hangzhou", //oss节点名
  accessKeyId: "不给看", //申请的osskey
  accessKeySecret: "不给看", //申请的osssecret
  callbackIp: "116.62.102.22", //回调ip,一定要能被外网访问的地址。不要用这个地址,我瞎写的，用自己部署服务器地址就ok了。
  callbackPort: "2225", //回调端口
  callbackPath: "api/ossCallback", //回调接口路径
  expAfter: 60000, //签名失效时间
  maxSize: 1048576000 //最大文件大小
};

router.get("/ossSign", (req, res) => {
  const {
    bucket,
    region,
    expAfter,
    maxSize,
    dirPath,
    accessKeyId,
    accessKeySecret,
    callbackIp,
    callbackPort,
    callbackPath
  } = config;
  const host = `http://${bucket}.${region}.aliyuncs.com`; //你的oss完整地址
  const expireTime = new Date().getTime() + expAfter;
  const expiration = new Date(expireTime).toISOString();
  const policyString = JSON.stringify({
    expiration,
    conditions: [
      ["content-length-range", 0, maxSize],
      ["starts-with", "$key", dirPath]
    ]
  });
  const policy = Buffer(policyString).toString("base64");
  const Signature = crypto
    .createHmac("sha1", accessKeySecret)
    .update(policy)
    .digest("base64");
  const callbackBody = {
    callbackUrl: `http://${callbackIp}:${callbackPort}/${callbackPath}`,
    callbackHost: `${callbackIp}`,
    callbackBody: '{"filename": ${object},"size": ${size}}',
    callbackBodyType: "application/json"
  };
  const callback = Buffer(JSON.stringify(callbackBody)).toString("base64");
  res.json({
    statusCode: 200,
    message: "oss签名成功",
    result: {
      Signature,
      policy,
      host,
      OSSAccessKeyId: accessKeyId,
      key: expireTime,
      success_action_status: 200,
      dirPath,
      callback
    }
  });
});

router.post("/ossCallback", async (req, res, next) => {
  // 获取header里面的 x-oss-pub-key-url 字段
  const publicKeyURLBase64 = req.header["x-oss-pub-key-url"];
  if (!publicKeyURLBase64) {
    res.status(400).json({
      statusCode: 200,
      message: "headers中没有x-oss-pub-key-url",
      result: null
    });
    return;
  }
  // 解析出证书地址
  const certURL = new Buffer(publicKeyURLBase64, "base64").toString();

  // 获取证书内容
  const certData = await axios.get(certURL).then(res => res.data);
  if (!certData) {
    res.status(400).json({
      statusCode: 200,
      message: "获取证书内容失败",
      result: null
    });
    return;
  }
  res.json({
    statusCode: 200,
    message: "oss参数回调",
    result: {
      ...req.body
    }
  });
});

module.exports = router;
