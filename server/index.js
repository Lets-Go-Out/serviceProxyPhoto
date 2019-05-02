const dotenv = require('dotenv');
dotenv.config();

const redisDB = require('/home/ec2-user/redis/redis.js');
const request = require('request-promise')
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(req.method);
  if(req.method === 'GET') {
    if(req.url === '/restNames') {
      redisDB.get('popular', (err, result) => {
        if(result) {
            res.writeHead(200, {
              'Content-Type': 'application/json'
            })
            res.end(result);
        } else {
          let options = {
            uri: 'http://ec2-54-218-12-68.us-west-2.compute.amazonaws.com:3004/restNames'
          }
          request(options).then(popular => {
	    redisDB.set('popular', JSON.stringify(popular));
            res.writeHead(200, {
   	      'Content-Type': 'application/json'
            })
            res.end(JSON.stringify(popular));
          }).catch(err => console.log(err));  
        }
      })
    } else if(isNaN(req.url.substr(1)) !== true) {
      let id = req.url.substr(1);
     redisDB.get(id, (err, photoResult) => {
        if(photoResult) {
          res.writeHead(200, {
            'Content-Type': 'application/json'
          })
	  res.end(photoResult);
        } else {
        let options = {
        uri: `http://ec2-54-218-12-68.us-west-2.compute.amazonaws.com:3004/${id}`
        }
      request(options).then(photos => {
        redisDB.set(id, JSON.stringify(photos))
        res.writeHead(200,{
            'Content-Type': 'application/json'
           })
            res.end(photos);
          }).catch(err => console.log(err, 'THIS IS TFROM THE CATCH BLCOK'))
        }
      })
    }
  } else if(req.method === 'DELETE') {
    let id = req.url.substr(1);
    let options = {
      uri: `http://ec2-54-218-12-68.us-west-2.compute.amazonaws.com:3004/${id}`,
      method: 'DELETE'
    }
    request(options).then(resp => {
      res.writeHead(200,{
        'Content-Type': 'application/json'
      })
      res.end(resp);
    }).catch(err => console.log(err));
  }
  
}).listen(PORT, () => console.log(`SERVER LISTENING ON ${PORT}`))
