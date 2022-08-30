//
//  Ayase-Server
//  Copyleft 2022 kawashiro-ryofu
//  Licensed Under AGPL-3.0
//
//  主程序
//


const express = require('express')
const mongoose = require('mongoose')
const { version, license } = require('./package.json')
const {Notice, Client, User} = require('./db.js')



const tokenreg = /^[A-F,a-f,0-9]{16}$/
const PORT = 8080

var app = express()
app.use(express.static('static'))
//  路由
//      根  欢迎页
app.get('/', (req, res)=>{
    res.send('Ayase-Server Hello World')
})

//      查询
//      /query/:token/:obj
//      token: 令牌（格式为字符串，内容为十六位十六进制数）
//      obj: 查询对象。(LatestUpdateDate 最新更新时间；NoticesList 所有通知的列表)
app.get('/query/:token/:obj', (req, res)=>{

    //  测试用JSON数据
    var validTokens = ['40234AC45CFEADDE']
    var luduxts = new Date().getTime().toString()
    var demoNotices = require('./notices.json')

    //  obj:
    //	   -1 -> (undefined, response 404)
    //      0 -> LatestUpdateDate
    //      1 -> NoticesList
    var obj = -1
    switch(req.params.obj){
        case 'LatestUpdateDate': obj = 0; break;
        case 'NoticesList': obj = 1; break;
        default: obj = -1;
    }
    //  路由校验
    if(tokenreg.test(req.params.token) && (obj != -1)){

        //  验证Token
        //  返回结果
        //  需要数据库(MongoDB)
        new Promise(function(resolve, reject){
			Client.findOne({token: req.params.token}, (err, doc)=>{
				if(err)	reject(err)
				else{
					if(doc == null || doc.token != req.params.token){
						res.status(403).send('Access Denied')
						return 0
					}else{
						resolve(doc)
					}
				}		
			})
        }).then(function(doc){
			try{
				let result = new Object()
				if(obj){
					let nUUIDList = Array.from(doc.notices)
                    result = {Notices: []}
                    

                    for(var a = 0; a < nUUIDList.length; a++){
                        new Promise(function(resolve, reject){
                            Notice.findOne({uuid: nUUIDList[a]}, function(err, Ndoc){
                                if(err) reject(err);
                                else resolve(Ndoc._doc)
                            })
                        }).then(function(Ndoc){
                            switch(Ndoc.level){
                                case 0: Ndoc.level = "D"; break;
                                case 1: Ndoc.level = "C"; break;
                                case 2: Ndoc.level = "B"; break;
                                case 3: Ndoc.level = "A"; break;
                            }
                            result.Notices.push(Ndoc)
                            if(result.Notices.length == nUUIDList.length){
                                res.status(200)
                                res.json(result)
                            }
                        }).catch(function(err){
                            throw err
                        })
                    }

				}else{
					result = {LatestUpdateDate: doc.NUT}
                    res.status(200)
                    res.json(result)
                    return 0
				}
			}catch(err){
				res.status(500).send(err)
                console.error(err)
				return -1
			}
        }).catch(function(err){
			res.status(500).send(err)
            console.error(err)
			return -1
        })
        
    }else if(tokenreg.test(req.params.token) && (obj == -1)){
        res.status(404).send('Not Found')
    }else res.status(403).send('Access Denied')
})

//      管理页
app.get('/admin', (req,res)=>{
    res.status(404).send('Not Yet')
})

//		监听
var server = app.listen(PORT, function(){
    console.log(`Server Running On Port ${PORT}`)
})