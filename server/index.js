require("newrelic");
const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const redisDB = require("/home/ec2-user/redis/redis.js");
const request = require("request-promise");
const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http
  .createServer((req, res) => {
    if (req.method === "GET") {
      if (req.url === "/loaderio-58ce6fe976c9252e2545d2f070f321e7.txt") {
        fs.readFile("/home/ec2-user/server/loader.txt", (err, file) => {
          if (err) {
            res.end(err);
          } else {
            res.writeHead(200, {
              "Content-Type": "text/html",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(file);
          }
        });
      } else if (req.url === "/restNames") {
        redisDB.get("popular", (err, result) => {
          if (result) {
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(result);
          } else {
            let options = {
              uri:
                "http://ec2-54-244-172-153.us-west-2.compute.amazonaws.com:3004/restNames"
            };
            request(options)
              .then(popular => {
                redisDB.set("popular", JSON.stringify(popular));
                res.writeHead(200, {
                  "Access-Control-Allow-Origin": "*",
                  "Content-Type": "application/json"
                });
                res.end(JSON.stringify(popular));
              })
              .catch(err => res.end(err));
          }
        });
      } else if (isNaN(req.url.substr(1)) !== true) {
        let id = req.url.substr(1);
        redisDB.get(id, (err, photoResult) => {
          if (photoResult) {
            res.writeHead(200, {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            });
            res.end(JSON.parse(photoResult));
          } else {
            let options = {
              uri: `http://ec2-54-244-172-153.us-west-2.compute.amazonaws.com:3004/${id}`
            };
            request(options)
              .then(photos => {
                redisDB.set(id, JSON.stringify(photos));
                res.writeHead(200, {
                  "Access-Control-Allow-Origin": "*",
                  "Content-Type": "application/json"
                });
                res.end(photos);
              })
              .catch(err => res.end(err));
          }
        });
      }
    } else if (req.method === "DELETE") {
      let id = req.url.substr(1);
      let options = {
        uri: `http://ec2-54-244-172-153.us-west-2.compute.amazonaws.com:3004/${id}`,
        method: "DELETE"
      };
      request(options)
        .then(resp => {
          res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          });
          res.end(resp);
        })
        .catch(err => res.end(err));
    } else if (req.method === "POST") {
      let dataCatch = "";
      req.on("data", chunk => {
        dataCatch += chunk.toString();
      });
      req.on("end", () => {
        let options = {
          uri:
            "http://ec2-54-244-172-153.us-west-2.compute.amazonaws.com:3004/",
          method: "POST",
          body: JSON.parse(dataCatch),
          json: true
        };
        request(options)
          .then(resp => {
            res.writeHead(200, {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            });
            res.end(JSON.stringify(resp));
          })
          .catch(err => res.end(err));
      });
    } else if (req.method === "PATCH") {
      let dataCatch = "";
      req.on("data", chunk => {
        dataCatch += chunk.toString();
      });
      req.on("end", () => {
        let options = {
          uri:
            "http://ec2-54-244-172-153.us-west-2.compute.amazonaws.com:3004/",
          method: "PATCH",
          body: JSON.parse(dataCatch),
          json: true
        };
        request(options)
          .then(resp => {
            res.writeHead(200, {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            });
            res.end(JSON.stringify(resp));
          })
          .catch(err => res.end(err));
      });
    }
  })
  .listen(PORT, () => console.log(`SERVER LISTENING ON ${PORT}`));
