var uname;
var hlist = [];

document.addEventListener("DOMContentLoaded", function () {
  $.getJSON("api/user", function(data) {
      // Make sure the data contains the username as expected before using it
      if (data.hasOwnProperty('user')) {
          $('#welcome').html('Welcome '+data.user.username);
          uname = data.user.username;
          console.log(data.user);
      }
      if (data.empty==0) {
        compiledata(data.avlist,data.slist,data.reqlist, function(finalList){
          finalList.sort(function(x, y) {
            if (x.date < y.date) {
                return 1;
            }
            if (x.date > y.date) {
              return -1;
            }
            return 0;
          });
          var tablehtml="";
          var nlist = Math.min(10,finalList.length);
          for(book=0; book<nlist; book++){
            tablehtml+="<tr>"+"<td>"+finalList[book].date.toString()+"</td>"+"<td>"+finalList[book].isbn+"</td>"+"<td>"+finalList[book].title+"</td>"+"<td>"+finalList[book].type+"</td>"+"<td>"+finalList[book].nuser+"</td>"+"<td>"+finalList[book].price+"</td>"+"</tr>"
          }
          $('#history').html(tablehtml);
        });
      }
      else {
        $('#history').html('');
        $('#htable').html('<p align="center">NO HISTORY RECORDED!</p>');
      }
  });
});

function compiledata(avlist,slist,reqlist,cb){
  var finalList = [];
  if(avlist.length!=0){
    for(book in avlist){
      compileav(avlist[book],function(cbook) {
        finalList.push(cbook);
      });
    }
  }
  if(slist.length!=0){
    for(book in slist){
      compiles(slist[book],function(cbook) {
        finalList.push.apply(finalList,cbook);
      });
    }
  }
  if(reqlist.length!=0){
    for(book in reqlist){
      compilereq(reqlist[book],function(cbook) {
        finalList.push(cbook);
      });
    }
  }
  cb(finalList);
}

function compileav(book,cb){
  var b = {};
  b.date = new Date(book.addDate);
  b.isbn = book.isbn;
  b.title = book.title;
  b.type = "Add";
  b.nuser = "-";
  b.price = book.price;
  cb(b);
}

function compiles(book,cb){
  var l = [];
  if(uname==book.owner){
    var b1 = {};
    var b3 = {};
    b1.date = new Date(book.addDate);
    b1.isbn = book.isbn;
    b1.title = book.title;
    b1.type = "Add";
    b1.nuser = "-";
    b1.price = book.price;
    l.push(b1);
    b3.date = new Date(book.sellDate);
    b3.isbn = book.isbn;
    b3.title = book.title;
    b3.type = "Sell";
    b3.nuser = book.buyer;
    b3.price = book.price;
    l.push(b3);
  }
  if(uname==book.buyer){
    var b2 = {};
    b2.date = new Date(book.sellDate);
    b2.isbn = book.isbn;
    b2.title = book.title;
    b2.type = "Buy";
    b2.nuser = book.owner;
    b2.price = book.price;
    l.push(b2);
  }
  cb(l);
}

function compilereq(book,cb){
  var b = {};
  b.date = book.reqDate;
  b.isbn = book.isbn;
  b.title = book.title;
  b.type = "Request";
  b.nuser = "-";
  b.price = "-";
  cb(b);
}
