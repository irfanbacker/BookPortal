var userinfo;
var avlist;
var navlist;
var slist;
var nslist;
var blist;
var nblist;
var tlimit=5;

document.addEventListener("DOMContentLoaded", function () {
  $.getJSON("/api/user/profile", function(data) {
      // Make sure the data contains the username as expected before using it
      if (data.hasOwnProperty('user')) {
          $('#uname').html('&nbsp;&nbsp;'+data.user.firstName+' '+data.user.lastName);
          $('#cuname').html('<strong>&ensp;&nbsp;Username: </strong>'+data.user.username);
          $('#ccontact').html('<strong>&ensp;&nbsp;Email ID: </strong>'+data.user.email+'<strong>&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;Phone No.: </strong>'+data.user.phone);
          $('#cbooks').html('<strong>&ensp;&nbsp;Added books in market: </strong>'+data.info.avbooks+'<strong>&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;Sold books: </strong>'+data.info.sbooks+'<strong>&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;Books requested: </strong>'+data.info.reqbooks);
          userinfo = data.user;
      }
  });

  reloadavTable();
  reloadsTable();
  reloadbTable();
});

//----------------------------------AVAIL list-------------------------------------------

function reloadavTable(){
  $.getJSON("api/getavail", function(data) {
      var tablehtml="";
      var pagehtml="<li id='avpg1' class='page-item active'><button class='page-link' onclick='changeavPage(1);'>1</button></li>";
      avlist=data.avlist;
      navlist=data.avlist.length;
      var currn = Math.min(tlimit,data.avlist.length);
      if (data.avlist.length!=0) {
        $('#availtable').show();
        for(book=0; book<currn; book++){
          tablehtml+="<tr>"+"<td>"+(new Date(data.avlist[book].addDate)).toString()+"</td>"+"<td>"+data.avlist[book].isbn+"</td>"+"<td>"+data.avlist[book].title+"</td>"+"<td>"+data.avlist[book].author+"</td>"+"<td>"+data.avlist[book].price+"</td>"+"<td><button class='btn btn-danger btn-sm' onclick='remAvail("+data.avlist[book].isbn+")'>Remove&nbsp;<span data-feather='trash-2'></span></button></td>"+"</tr>";
        }
        for(p=2; p<(Math.ceil(navlist/tlimit)+1); p++){
          pagehtml+="<li id='avpg"+p+"' class='page-item'><button class='page-link' onclick='changeavPage("+p+");'>"+p+"</button></li>";
        }
        $('#availcontent').html(tablehtml);
        $('#availpage').html(pagehtml);
        $('#availpage').show();
        feather.replace();
      }
      else {
        $('#availcontent').html('');
        $('#availtable').hide();
        $('#availpage').html('');
        $('#availpage').hide();
      }
  });
}

function changeavPage(pno){
  var tablehtml="";
  for(p=1; p<(Math.ceil(navlist/tlimit)+1); p++){
    if(p==pno) $('#avpg'+p).addClass('active');
    else $('#avpg'+p).removeClass('active');
  }

  var blimit;
  if(pno==Math.ceil(navlist/tlimit)) blimit=navlist;
  else blimit=(tlimit*(pno-1))+tlimit;

  for(book=(tlimit*(pno-1)); book<blimit; book++){
    tablehtml+="<tr>"+"<td>"+(new Date(avlist[book].addDate)).toString()+"</td>"+"<td>"+avlist[book].isbn+"</td>"+"<td>"+avlist[book].title+"</td>"+"<td>"+avlist[book].author+"</td>"+"<td>"+avlist[book].price+"</td>"+"<td><button class='btn btn-danger btn-sm' onclick='remAvail("+avlist[book].isbn+")'>Remove&nbsp;<span data-feather='trash-2'></span></button></td>"+"</tr>";
  }
  $('#availcontent').html(tablehtml);
  feather.replace();
}

function remAvail(isbn){
  $.post("/api/remavail", {dlist: [isbn]}, function(resp, status){
    reloadavTable();
  });
}

//----------------------------------SOLD list-------------------------------------------

function reloadsTable(){
  $.getJSON("api/getsold", function(data) {
      var tablehtml="";
      var pagehtml="<li id='spg1' class='page-item active'><button class='page-link' onclick='changesPage(1);'>1</button></li>";
      slist=data.slist;
      nslist=data.slist.length;
      var currn = Math.min(tlimit,data.slist.length);
      if (data.slist.length!=0) {
        $('#soldtable').show();
        for(book=0; book<currn; book++){
          tablehtml+="<tr>"+"<td>"+(new Date(data.slist[book].sellDate)).toString()+"</td>"+"<td>"+data.slist[book].isbn+"</td>"+"<td>"+data.slist[book].title+"</td>"+"<td>"+data.slist[book].author+"</td>"+"<td>"+"<a href='/profile/"+data.slist[book].buyer+"' rel='noopener noreferrer' target='_blank'>"+data.slist[book].buyer+"</a>"+"</td>"+"<td>"+data.slist[book].price+"</td>"+"</tr>";
        }
        for(p=2; p<(Math.ceil(nslist/tlimit)+1); p++){
          pagehtml+="<li id='spg"+p+"' class='page-item'><button class='page-link' onclick='changesPage("+p+");'>"+p+"</button></li>";
        }
        $('#soldcontent').html(tablehtml);
        $('#soldpage').html(pagehtml);
        $('#soldpage').show();
        feather.replace();
      }
      else {
        $('#soldcontent').html('');
        $('#soldtable').hide();
        $('#soldpage').html('');
        $('#soldpage').hide();
      }
  });
}

function changesPage(pno){
  var tablehtml="";
  for(p=1; p<(Math.ceil(nslist/tlimit)+1); p++){
    if(p==pno) $('#spg'+p).addClass('active');
    else $('#spg'+p).removeClass('active');
  }

  var blimit;
  if(pno==Math.ceil(nslist/tlimit)) blimit=nslist;
  else blimit=(tlimit*(pno-1))+tlimit;

  for(book=(tlimit*(pno-1)); book<blimit; book++){
    tablehtml+="<tr>"+"<td>"+(new Date(slist[book].sellDate)).toString()+"</td>"+"<td>"+slist[book].isbn+"</td>"+"<td>"+slist[book].title+"</td>"+"<td>"+slist[book].author+"</td>"+"<td>"+"<a href='/profile/"+slist[book].buyer+"' rel='noopener noreferrer' target='_blank'>"+slist[book].buyer+"</a>"+"</td>"+"<td>"+slist[book].price+"</td>"+"</tr>";
  }
  $('#soldcontent').html(tablehtml);
  feather.replace();
}

//----------------------------------BOUGHT list-------------------------------------------

function reloadbTable(){
  $.getJSON("api/getbought", function(data) {
      var tablehtml="";
      var pagehtml="<li id='bpg1' class='page-item active'><button class='page-link' onclick='changebPage(1);'>1</button></li>";
      blist=data.blist;
      nblist=data.blist.length;
      var currn = Math.min(tlimit,data.blist.length);
      if (data.blist.length!=0) {
        $('#boughttable').show();
        for(book=0; book<currn; book++){
          tablehtml+="<tr>"+"<td>"+(new Date(data.blist[book].sellDate)).toString()+"</td>"+"<td>"+data.blist[book].isbn+"</td>"+"<td>"+data.blist[book].title+"</td>"+"<td>"+data.blist[book].author+"</td>"+"<td>"+"<a href='/profile/"+data.blist[book].owner+"' rel='noopener noreferrer' target='_blank'>"+data.blist[book].owner+"</a>"+"</td>"+"<td>"+data.blist[book].price+"</td>"+"</tr>";
        }
        for(p=2; p<(Math.ceil(nblist/tlimit)+1); p++){
          pagehtml+="<li id='bpg"+p+"' class='page-item'><button class='page-link' onclick='changebPage("+p+");'>"+p+"</button></li>";
        }
        $('#boughtcontent').html(tablehtml);
        $('#boughtpage').html(pagehtml);
        $('#boughtpage').show();
        feather.replace();
      }
      else {
        $('#boughtcontent').html('');
        $('#boughttable').hide();
        $('#boughtpage').html('');
        $('#boughtpage').hide();
      }
  });
}

function changebPage(pno){
  var tablehtml="";
  for(p=1; p<(Math.ceil(nblist/tlimit)+1); p++){
    if(p==pno) $('#bpg'+p).addClass('active');
    else $('#bpg'+p).removeClass('active');
  }

  var blimit;
  if(pno==Math.ceil(nblist/tlimit)) blimit=nblist;
  else blimit=(tlimit*(pno-1))+tlimit;

  for(book=(tlimit*(pno-1)); book<blimit; book++){
    tablehtml+="<tr>"+"<td>"+(new Date(blist[book].sellDate)).toString()+"</td>"+"<td>"+blist[book].isbn+"</td>"+"<td>"+blist[book].title+"</td>"+"<td>"+blist[book].author+"</td>"+"<td>"+"<a href='/profile/"+blist[book].owner+"' rel='noopener noreferrer' target='_blank'>"+blist[book].owner+"</a>"+"</td>"+"<td>"+blist[book].price+"</td>"+"</tr>";
  }
  $('#boughtcontent').html(tablehtml);
  feather.replace();
}
