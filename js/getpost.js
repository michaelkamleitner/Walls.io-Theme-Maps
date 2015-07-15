(function() {
  "use strict";

  var doc = document;

  var formatDate = function(date) {
    date = new Date(date);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var appendixDate = "th";
    var lastDigit = date.getDate().toString().substring((date.getDate().toString().length)-1,date.getDate().toString().length);

    if (lastDigit == 1) {
      appendixDate = "st";
    } else if (lastDigit == 2) {
      appendixDate = "nd";
    } else if (lastDigit == 3) {
      appendixDate = "rd";
    }
    var result = months[date.getMonth()+1] + " " +
                 date.getDate() + appendixDate + " " +
                 date.getFullYear();
    return result;
  }

  var getDomain = function(url) {
    var element = document.createElement("a");
    element.setAttribute("href", url);
    return element.hostname;
  };

  var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var getRandomIdentifier = function(length) {
    return Math.random().toString(36).substr(2, length);
  };

  var getPostIdFromUrl = function(url) {
    var parts = url.match(/facebook\.com\/[^/]+\/posts\/([^/?]+)/);

    if (!parts) {
      return null;
    }

    return parts[1];
  };

  var httpGet = function(url) {
    return new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          resolve(xhr.responseText);
        }
      }
      xhr.send();
    });
  };

  var httpPost = function(url) {
    return new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          resolve(xhr.responseText);
        }
      }
      xhr.send();
    });
  };

  var getJsonp = function(url) {
    return new Promise(function(resolve) {
      var glue = /[?]/.test(url) ? "&" : "?";
      var callbackName = "PP_" + getRandomIdentifier(10);
      var bodyElement = doc.querySelector("body");

      url = url + glue + "callback=PP." + callbackName;

      var s = doc.createElement("script");
      s.setAttribute("src", url);

      PP[callbackName] = function(response) {
        resolve(response);
        bodyElement.removeChild(s);
        delete PP[callbackName];
      }

      bodyElement.appendChild(s);
    });
  };

  var getPost = function(postUrl) {
    var appToken = "383198298545849|5ebbed242a07881b44e0aa439ac3ff81";
    var baseUrl = "https://graph.facebook.com/v2.3/";
    var postId = getPostIdFromUrl(postUrl);
    var apiCall = baseUrl + postId + "?access_token=" + appToken;

    return httpGet(apiCall)
      .then(function(response) {
        var post = JSON.parse(response);

        if (post.error) {
          throw new Error("Post not found in Facebook API");
        }

        return post;
      })
      .then(function(post) {
        var picture = null;
        return httpPost("https://graph.facebook.com/v2.3/?id="+post.link+"&access_token=" + appToken).then(function (data) {
          data = JSON.parse(data);
          if (data.image.length) {
            picture = data.image[0].url;
          }

          return {
            id: post.id,
            from: {
              id: post.from.id,
              name: post.from.name,
              picture: "https://graph.facebook.com/" + post.from.id + "/picture"
            },
            created_time: formatDate(post.created_time),
            name: post.name,
            description: post.description,
            message: post.message,
            link: post.link,
            domain: getDomain(post.link),
            picture: picture
          };
        });
      });
  };

  var getRandomPost = function() {
    var apiUrl = "https://beta.walls.io/api/posts.json?access_token=5df1ad87d2484f20802ac41f9a577cc0c26d4101&type=facebook&fields=post_link&limit=500";

    return getJsonp(apiUrl)
      .then(function(response) {
        var posts = response.data;

        if (posts.length === 0) {
          throw new Error("No posts found via Walls.io API");
        }

        var randomIndex = getRandomInt(0, posts.length - 1);
        return posts[randomIndex].post_link;
      })
      .then(function(link) {
        return getPost(link);
      })
      .then(function(post) {
        var facebookUrlRegex = /^https?:\/\/www\.facebook\.com/;

        if (!post.link) {
          throw new Error("Post has no link");
        }

        if (facebookUrlRegex.test(post.link)) {
          throw new Error("Post link points to Facebook itself.");
        }

        return post;
      })
      .catch(function(e) {
        console.info("calling getRandomPost again", e);
        return getRandomPost();
      });
  };


  if (!window.PP) {
    window.PP = {};
  }

  PP.getRandomPost = getRandomPost;
  PP.getPost = getPost;
}());
