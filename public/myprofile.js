var userinfo;

document.addEventListener("DOMContentLoaded", function () {
  $.getJSON("/api/user/profile", function(data) {
      // Make sure the data contains the username as expected before using it
      if (data.hasOwnProperty('user')) {
          $('#uname').html('&nbsp;&nbsp;'+data.user.firstName+' '+data.user.lastName);
          $('#cuname').html('<strong>&ensp;&nbsp;Username: </strong>'+data.user.username);
          $('#ccontact').html('<strong>&ensp;&nbsp;Email ID: </strong>'+data.user.email+'<strong>&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;Phone No.: </strong>'+data.user.phone);
          $('#cbooks').html('<strong>&ensp;&nbsp;Added books in market: </strong>'+data.info.avbooks+'<strong>&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;Sold books: </strong>'+data.info.sbooks+'<strong>&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;Books requested: </strong>'+data.info.reqbooks);
          userinfo = data.user;
          console.log(data.user);
      }
  });
});
