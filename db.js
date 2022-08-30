//
//  Ayase-Server
//  (C) 2022 kawashiro-ryofu
//  Licensed Under AGPL-3.0
//
//  数据库
//
const mongoose = require('mongoose')
const log = require('log4js').getLogger()

var DB_URL = 'mongodb://192.168.1.250/ayase'

//	数据库连接
mongoose.connect(DB_URL)
mongoose.connection.on('error', function(err){
	console.error('Database: ' + err)
})
mongoose.connection.on('connected', function(){
	console.log('Database: Connected')
})
mongoose.connection.on('disconnected', function(){
	console.warn('Database: Disconnected')
})

//	构建Schema
//		通知
var NoticeSchema = mongoose.Schema({
	uuid: String,						/* 通知对象uuid */
	title: String,						/* 通知对象标题 */
	content: String,					/* 通知正文 */
	publisher: String,					/* 通知发布者_id */
	pubDate: String,					/* 发布时间（为Unix时间戳字符串） */
	level: Number,						/* 优先级 */
	/*
		数据库存储		后端返回
		3(0b11) 		'A'
		2(0b10)			'B'
		1(0b01)			'C'
		0(0b00)			'D'
	*/
	description: {type: String, default: null}					/* 描述（可选） */
})
//		客户端
var ClientSchema = mongoose.Schema({
	token: String,		/* 客户端的Token */
	label: String,		/* 该客户端的标签 */
	notices: Array,		/* 该客户端下的通知的数组（内为Notice对象的_id） */
	NUT: String			/* 最新更新时间（为Unix时间戳字符串） */
})
//		用户
var	UserSchema = mongoose.Schema({
	username: String,	/* 用户名 */
	nickname: String,	/* 昵称 */
	password: String,	/* 密码(需要SHA512加盐) */
	clients: Array		/* 所属的客户端(内为Client对象的_id) */
})

//	构建Model
var Notice = mongoose.model('Notice', NoticeSchema)
var Client = mongoose.model('Client', ClientSchema)
var User = mongoose.model('User', UserSchema)

//	增
//	实例化User
/*
var u = new User({
	username: 'admin',
	password: '1145141919810',
	clients: ['40234AC45CFEADDE']
})
u.save(function(err){
	if(err)console.error(err);
	else console.log('OK')
})*/

//	改
/*
User.update({username: 'admin'}, {$set: {password: '1919810'}}, function(err){
	if(err)console.error(err);
	else console.log('OK')
})*/

module.exports = {
	Notice, Client, User
}