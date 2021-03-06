import { Server } from '../src/server';
import * as Express from "express";
import * as request from 'supertest';
import * as mysql from 'mysql';
import cbFunc from '../src/cb/cb';
import * as assert from 'assert';

const app = Express();
const server = new Server(app, 3000);

test('Should greet with message', () => {
  const express1 = Express();
  const express2 = Express();
  expect(express1 !== express2).toBe(true);
  const server = new Server(express1);
  expect(server.server).toBe(express1);
  server.server = express2;
  expect(server.server).toBe(express2);
});



test('测试访问用户页面success', (done) => {
  request(app)
    .get('/user/5555')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('-用户文件管理')).toBeTruthy();
      done();
    });
});
test('测试访问用户页面fail', (done) => {
  request(app)
    .get('/user/qqq')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('404')).toBeTruthy();
      done();
    });
});
test('测试管理员登录success', (done) => {
  request(app)
    .get('/admin/login')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('-管理员登录')).toBeTruthy();
      done();
    });
});
test('测试管理员 password modify', (done) => {
  request(app)
    .get('/admin/update')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('管理员个人设置')).toBeTruthy();
      done();
    });
});
test('url-register', (done) => {
  request(app)
    .get('/user/register')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('注册')).toBeTruthy();
      done();
    });
});
test('url-login', (done) => {
  request(app)
    .get('/user/login')
    .expect(200, function (err, res) {
      console.log(err);
      expect(err).toBeFalsy();
      expect((res.text).includes('登录')).toBeTruthy();
      done();
    });
});

test('测试访问用户管理页面', (done) => {
  request(app)
    .get('/admin/users')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('支持模糊搜索')).toBeTruthy();
      done();
    })
});

test('测试访问文件分类页面', (done) => {
  request(app)
    .get('/admin/file/category')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect((res.text).includes('-后台内容')).toBeTruthy();
      done();
    })
});

test('测试数据库创建', (done) => {
  var con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD
  });

  con.query('CREATE DATABASE cloud', function (err) {
    expect(err).toBeFalsy();
    // 断开
    con.end();
    done();
  });


});


test('测试数据库链接', (done) => {
  var con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: 'cloud'
  });
  // 创建user
  con.query('create table user (id int primary key auto_increment,username varchar(20)not null,password varchar(64)not null,email varchar(30)not null,created_at datetime not null)', function (err) {
    expect(err).toBeFalsy();
    console.log('success user');
    con.query("INSERT INTO user(username, password, email, created_at) VALUES ('user1','123','user1.qq','2017-10-20')", function (err) {
      expect(err).toBeFalsy();
      console.log('insert success');
      con.end();
      done();
    });

  });
});

test('测试用户所有获取', (done) => {
  request(app)
    .get('/api/admin/users')
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect(res.body[0].username === 'user1').toBeTruthy();
      done();
    })
});

test('测试单用户查询', (done) => {
  request(app)
  .get('/api/admin/users/user1')
  .expect(200, function(err, res) {
    expect(err).toBeFalsy();
    expect(res.body[0].id === 1).toBeTruthy();
    done();
  })
});

test('测试单用户查询结果无此用户', (done) => {
  request(app)
  .get('/api/admin/users/user15')
  .expect(200, function(err, res) {
    expect(err).toBeFalsy();
    expect(res.body === 'none').toBeTruthy();
    done();
  })
});

test('测试用户密码重置', (done) => {
  request(app)
    .post('/api/admin/users')
    .type('form')
    .send({ action: 'reset', id: 1 })
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect(res.body === 'ok').toBeTruthy();
      done();
    });
});

test('测试用户删除', (done) => {
  request(app)
    .post('/api/admin/users')
    .type('form')
    .send({ action: 'delete', id: 1 })
    .expect(200, function (err, res) {
      expect(err).toBeFalsy();
      expect(res.body === 'ok').toBeTruthy();
      done();
    });
});

test('cb错误测试覆盖', (done) => {
  let func = cbFunc(() => { });
  expect(func(new Error('222'), '0') === undefined).toBeTruthy();
  done();
});

test('测试文件上传成功', (done) => {
  request(app)
    .post('/files')
    .type('form')
    .field('action', 'upload')
    .attach('_upload', '__tests__/1.txt')
    .expect(200, (err,data) => {
      console.log(err);
      done();
    })
});

beforeAll(function (done) {
  var con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD
  });
  con.query('DROP DATABASE IF EXISTS cloud;', function (err) {
    expect(err).toBeFalsy();
    // 断开
    con.end();
    done();
  });
})
