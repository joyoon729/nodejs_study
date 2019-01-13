var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, description, control){
  var template;
  template = `
    <!doctype html>
    <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        <h2>${title}</h2>
        <p>${description}</p>
      </body>
    </html>
    `;
  //console.log(template);
  return template;
}

function templateList(filelist){
  var list = '<ul>';
  for(var i=0; i<filelist.length; i++){
    list = list+`<li><a href=/?id=${filelist[i]}>${filelist[i]}</a></li>`;
  }
  list = list+'</ul>';
  return list;
}

// function parseId(id){
//   if(id === undefined){
//     fs.readdir('./data', function(err,filelist){
//       //console.log(filelist);
//       var title = 'Welcome';
//       var list = templateList(filelist);
//       var description = 'Hello, Node.js';
//       var template = templateHTML(title, list, description);
//       //console.log(template);
//       return template;
//     })
//   }else{
//     fs.readFile(`data/${id}`, 'utf8', function(err, description){
//       fs.readdir('./data', function(err,filelist){
//         var title = id;
//         var list = templateList(filelist);
//         var template = templateHTML(title, list, description);
//         console.log(template);
//         return template;
//       });
//     });
//   }
// }

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      var id = queryData.id
      if(id === undefined){
        fs.readdir('./data', function(err,filelist){

          var title = 'Welcome';
          var list = templateList(filelist);
          var description = 'Hello, Node.js';
          var control = `
            <a href="/create">create</a>
          `;
          var template = templateHTML(title, list, description, control);

          response.writeHead(200);
          response.end(template);
        });
      }else{
        fs.readFile(`data/${id}`, 'utf8', function(err, description){
          fs.readdir('./data', function(err,filelist){
            var title = id;
            var list = templateList(filelist);
            var control = `
              <a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden", name="id", value="${title}">
                <input type="submit", value="delete">
              </form>
            `
            var template = templateHTML(title, list, description, control);

            response.writeHead(200);
            response.end(template);
          });
        });
      }
    }else if(pathname === '/create'){
      fs.readdir('./data', function(err,filelist){

        var title = 'WEB - create';
        var list = templateList(filelist);
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
        var template = templateHTML(title, list, description, control);

        response.writeHead(200);
        response.end(template);
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
        fs.writeFile(`data/${title}`, description, `utf8`, function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
      });
    }else if(pathname === '/update'){
      fs.readdir('./data', function(err,filelist){
        fs.readFile(`data/${queryData.id}`, `utf8`, function(err, description){
          var title = queryData.id;
          var list = templateList(filelist);
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
          var template = templateHTML(title, list, _description, control);
          response.writeHead(200);
          response.end(template);
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
        fs.unlink(`data/${id}`, function(err){
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
