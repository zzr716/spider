'use strict';
// 爬虫？
// 通过http模块，代码请求http协议，拿到网页内容，分析网页，拿到想要的。
// require引入http模块
var http = require('http'),
    // 向url发出http请求
    https = require('https'),
    // node 后端， 服务器，文件系统
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio');
// 从请求，相应，到分析，再到文件保存
// 配置
var opt = {
  // url: 子域名 路由 端口
  hostname: 'movie.douban.com',
  path: '/top250',
  port: 80
}
// 发出请求
const url = `https://${opt.hostname}${opt.path}?start=0`
// console.log(url)
https.get(url, function (res) {
  // 二进制流
  res.setEncoding('utf-8');
  // 数据包到达 chunk 这个二进制块
  // ondata事件
  var html = '';
  var movies = [];
  res.on('data', function (chunk) {
    html += chunk;
  })
  // 发送结束
  res.on('end', function () {
    // console.log(html)
    // cheerio 将html字符串在命令行显示出DOM的库
    var $ = cheerio.load(html);
    $('.item').each(function () {
      var picUrl = $('.pic img', this).attr('src');
      // console.log(picUrl);
      var movie = {
        picUrl,
        title: $('.title', this).text(),
        star: $('.info star .rating_num', this).text(),
        link: $('a', this).attr('href')
      }
      movies.push(movie);
      downloadImg('./img/',picUrl);
    })
    saveData('./data/1.json' + movies);
  })
})
function saveData (path, movies) {
  fs.writeFile(path, JSON.stringify(movies), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('Data Saved');
  })
}
function downloadImg (imgDir, url) {
  https.get(url, function (res) {
    var data = "";
    // 图片是二进制流 网页是html字符串
    res.setEncoding('binary');
    res.on('data', function (chunk) {
      data += chunk;
    })
    res.on('end', function () {
      // 文件模块
      fs.writeFile(imgDir + path.basename(url), data, 'binary', function (err) {
        if (err) {
          console.log('文件保存失败');
          return;
        }
        console.log('Image downloaded:', path.basename(url));
      })
    })
  })
}
