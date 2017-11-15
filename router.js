const express = require("express")
const router = express.Router()
const crypto = require("crypto")
const config = {
  dirPath: 'oss/file/', //oss 文件夹 不存在会自动创建
  bucket: 'glhtest', //oss应用名
  region: 'oss-cn-hangzhou', //oss节点名
  accessKeyId: '不给看', //申请的osskey
  accessKeySecret: '不给看', //申请的osssecret
  callbackIp: "116.62.102.2", //回调ip,一定要能被外网访问的地址,你可以暂时用这个...后台的代码和下面路由一致,不过不建议
  callbackPort: "2225", //回调端口
  callbackPath: "acapi/be/ossCallback", //回调接口
  expAfter: 60000, //签名失效时间
  maxSize: 1048576000 //最大文件大小
}

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
  } = config
  const host = `http://${bucket}.${region}.aliyuncs.com` //你的oss完整地址
  const expireTime = new Date().getTime() + expAfter
  const expiration = new Date(expireTime).toISOString()
  const policyString = JSON.stringify({
    expiration,
    conditions: [
      ['content-length-range', 0, maxSize],
      ['starts-with', '$key', dirPath]
    ]
  })
  const policy = Buffer(policyString).toString("base64")
  const Signature = crypto.createHmac('sha1', accessKeySecret).update(policy).digest("base64")
  const callbackBody = {
    "callbackUrl": `http://${callbackIp}:${callbackPort}/${callbackPath}`,
    "callbackHost": `${callbackIp}`,
    "callbackBody": "{\"filename\": ${object},\"size\": ${size}}",
    "callbackBodyType": "application/json"
  }
  const callback = Buffer(JSON.stringify(callbackBody)).toString('base64')
  res.json({
    statusCode: 200,
    message: 'oss签名成功',
    result: {
      Signature,
      policy,
      host,
      'OSSAccessKeyId': accessKeyId,
      'key': expireTime,
      'success_action_status': 200,
      dirPath,
      callback
    }
  })
})

router.post("/ossCallback", (req, res, next) => {
  res.json({
    statusCode: 200,
    message: 'oss参数回调',
    result: {
      ...req.body
    }
  })
})

module.exports = router