module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('ipfs', {
      handle,
      name: 'ipfs',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.ipfs')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const url = userConfig.url
    const gateway = userConfig.gateway
    
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, url, imgList[i].fileName)
        let body = await ctx.Request.request(postConfig)
        delete imgList[i].base64Image
        delete imgList[i].buffer
        var obj = JSON.parse(body)
        imgList[i]['imgUrl'] = gateway + 'ipfs/' + obj.Hash
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (image, url, fileName) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    let formData = {}
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData['file'] = {}
    opts.formData['file'].value = image
    opts.formData['file'].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.ipfs')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'url',
        type: 'input',
        default: userConfig.url,
        required: true,
        message: 'API地址',
        alias: 'API地址'
      },
      {
        name: 'gateway',
        type: 'input',
        default: userConfig.gateway,
        required: true,
        message: 'Gateway地址',
        alias: 'Gateway地址'
      }
    ]
  }
  return {
    uploader: 'ipfs',
    // transformer: 'ipfs',
    // config: config,
    register

  }
}
