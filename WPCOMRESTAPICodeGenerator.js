(function() {
  var WPCOMRESTAPICodeGenerator;

  (function(root) {
    var ref;
    if ((ref = root.bundle) != null ? ref.minApiVersion('0.2.0') : void 0) {
      return root.Mustache = require("./mustache");
    } else {
      return require("mustache.js");
    }
  })(this);

  addslashes = function(str) {
    return ("" + str).replace(/[\\"]/g, '\\$&');
  };

  extractUrlVersion = function(url) {
    return url.match(/\/v([0-9].[0-9]|[0-9])/)[1];
  };

  generateUrlJavaMethod = function(url) {
    return "getUrlV" + extractUrlVersion(url).replace(".", "_");
  };

  extractEndpoint = function(url) {
    return url.match(/\/v([0-9].[0-9]|[0-9])([^?]*)/)[2];
  }

  extractApiComponents = function(url) {
    var endpoint = extractEndpoint(url);
    var endpointList = endpoint.slice(1, -1).split("/");

    var formattedList = [];

    for (var i=0; i < endpointList.length; i++) {
      if (isNaN(endpointList[i])) {
        formattedList.push({"value": endpointList[i]});
      } else {
        var previousEndpoint = endpointList[i-1];
        var methodName = previousEndpoint.slice(0, -1);
        formattedList.push({"value": methodName + "(" + methodName + "Id)"});
      }
    }
    return formattedList;
  };

  WPCOMRESTAPICodeGenerator = function() {
    this.url = function(request) {
      return {
        "fullpath": request.url,
        "version": extractUrlVersion(request.url),
        "javaMethod": generateUrlJavaMethod(request.url),
        "endpoint": extractEndpoint(request.url),
        "endpointList": extractApiComponents(request.url),
      };
    };
    this.params = function(request) {
      var params = [];
      var param_key, param_value;
      if (request.method === "GET") {
        // GET request, extract any params from URL
        if (request.url.indexOf("?") > 0) {
          var paramSet = request.url.substring(request.url.indexOf("?")+1).split("&").reverse();
          for (var i = 0; i < paramSet.length; i++) {
            var param_pair = paramSet[i].split("=");
            params.push({
              "param_key": addslashes(param_pair[0]),
              "param_value": addslashes(param_pair[1])
            });
          }
        }
      } else {
        // POST request, extract any params from body
        var object = request.jsonBody;
        for (key in object) {
          params.push({
            "param_key": addslashes(key),
            "param_value": addslashes(object[key]),
          });
        }
      }

      return {
        "has_params": Object.keys(params).length > 0,
        "params_list": params
      }
    };
    this.generate = function(context) {
      var request, template, view;
      request = context.getCurrentRequest();
      view = {
        "request": context.getCurrentRequest(),
        "method": request.method[0].toUpperCase() + request.method.slice(1).toLowerCase(),
        "url": this.url(request),
        "params": this.params(request),
      };
      template = readFile("java.mustache");
      return Mustache.render(template, view);
    };
  };

  WPCOMRESTAPICodeGenerator.identifier = "org.wordpress.android.fluxc.PawExtensions.WPCOMRESTAPICodeGenerator";

  WPCOMRESTAPICodeGenerator.title = "WP.COM REST API Code Generator";

  WPCOMRESTAPICodeGenerator.fileExtension = "java";

  WPCOMRESTAPICodeGenerator.languageHighlighter = "java";

  registerCodeGenerator(WPCOMRESTAPICodeGenerator)

}).call(this);
