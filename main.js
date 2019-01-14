var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')
var path = require('path')

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      var id = queryData.id
      if(id === undefined){
        fs.readdir('./data', function(err,filelist){

          var title = 'Welcome';
          var list = template.list(filelist);
          var description = 'Hello, Node.js';
          var control = `
            <a href="/create">create</a>
          `;
          var html = template.HTML(title, list, description, control);

          response.writeHead(200);
          response.end(html);
        });
      }else{
        var filteredId = path.parse(id).name;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          fs.readdir('./data', function(err,filelist){
            var title = id;
            var list = template.list(filelist);
            var control = `
              <a href="/create">create</a>
              <a href="/update?id=${filteredId}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden", name="id", value="${filteredId}">
                <input type="submit", value="delete">
              </form>
            `
            var html = template.HTML(title, list, description, control);

            response.writeHead(200);
            response.end(html);
          });
        });
      }
    }else if(pathname === '/create'){
      fs.readdir('./data', function(err,filelist){

        var title = 'WEB - create';
        var list = template.list(filelist);
        var description = `
          <form action="/create_process" method="post">
            <p>
              <input type="text" name="title" placeholder="제목을 입력하세요">
            </p>
            <p>
              <textarea name="description" placeholder="본문을 입력하세요"></textarea>
            </p>
              <input type="submit" value="작성">
          </form>
        `;
        var control = '';
        var html = template.HTML(title, list, description, control);

        response.writeHead(200);
        response.end(html);
      });
    }else if(pathname === '/create_process'){
      var body = '';

      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);

        var title = post.title;
        var description = post.description;
        var filteredId = path.parse(title).name;
        console.log(filteredId);
        fs.writeFile(`data/${filteredId}`, description, `utf8`, function(err){
          response.writeHead(302, {Location: `/?id=${filteredId}`});
          response.end();
        })
      });
    }else if(pathname === '/update'){
      fs.readdir('./data', function(err,filelist){
        var filteredId = path.parse(queryData.id).name;
        fs.readFile(`data/${filteredId}`, `utf8`, function(err, description){
          var title = filteredId;
          var list = template.list(filelist);
          var _description = `
            <form action="/update_process" method="post">
              <p><input type="hidden" name="id" value="${title}"></p>
              <p>
                <input type="text" name="title" value="${title}">
              </p>
              <p>
                <textarea name="description">${description}</textarea>
              </p>
                <input type="submit">
            </form>
          `;
          var control = '';
          var html = template.HTML(title, list, _description, control);
          response.writeHead(200);
          response.end(html);
        });
      });
    }else if(pathname === '/update_process'){
      var body = '';

      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){

        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err){
          fs.writeFile(`data/${title}`, description, `utf8`, function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          });
        });
      });
    }else if(pathname === '/delete_process'){
      var body = '';

      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).name;
        fs.unlink(`data/${filteredId}`, function(err){
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      });
    }else{
      response.writeHead(404);
      response.end('Not Found');
    }
});
app.listen(4000);
