var socket = io("http://localhost:3000/");

document.addEventListener("DOMContentLoaded", function () {
  $.getJSON("api/user", function(data) {
      // Make sure the data contains the username as expected before using it
      if (data.hasOwnProperty('user')) {
          $('#welcome').html('Welcome '+data.user.username)
          console.log(data.user);
      }
  });

  $('#history').html('<p align="center">NO HISTORY RECORDED!</p>');
});
