/**
 *  Steps handler
 */

var Steps = {}

Steps.init = function() {
  this.buildParseUrl();
  this.bindBtn('#step-1-btn', function(e){
    ParseRequest.getData();
    e.preventDefault();
  })
}

Steps.buildParseUrl = function() {
  var url = Config.getUrl();
  $('#parse-url').html(url + '/parse');
}

Steps.bindBtn = function(id, callback) {
  $(id).click(callback)
}

Steps.closeStep = function(id) {
  $(id).addClass('step--disabled');
}

Steps.openStep  = function(id) {
  $(id).removeClass('step--disabled');
}

Steps.fillStepOutput  = function(id, data) {
  $(id).html('Output: ' + data).slideDown();
}

Steps.fillBtn  = function(id, message) {
  $(id).addClass('success').html('✓  ' + message);
}

Steps.showWorkingMessage = function() {
  $('#step-4').delay(500).slideDown();
}


/**
 *  Parse requests handler
 */

var ParseRequest = {};

ParseRequest.postData = function() {
  XHR.setCallback(function(data){
    // store objectID
    Store.objectId = JSON.parse(data).objectId;
    // close first step
    Steps.closeStep('#step-1');
    Steps.fillStepOutput('#step-1-output', data)
    Steps.fillBtn('#step-1-btn', 'Posted');
    // open second step
    Steps.openStep('#step-2');
    Steps.bindBtn('#step-2-btn', function(e){
      ParseRequest.getData();
      e.preventDefault();
    });
  });
  XHR.POST('/parse/classes/GameScore');
}

ParseRequest.getData = function() {
  XHR.setCallback(function(data){
    var jsonData = JSON.parse(data);
    var count = Object.keys(jsonData.results).length;
    console.log(count);

    var milliseconds[];
    var dateLabel[];
    var completed[];

    for (var i = 0; i < count; i++) {
      var counter = jsonData.results[i];
      console.log(counter.objectId);

      var thisMs = Date.parse(counter.eventDate);
      var insertIndex = 0;
      for (insertIndex = 0; insertIndex < milliseconds.length; insertIndex++)
      {
        if (thisMs > milliseconds[insertIndex])
        {
          break;
        }
      }
      milliseconds.splice(insertIndex,0,thisMs);
      dateLabel.splice(insertIndex,0,counter.eventDate);
      if (counter.completionStatus == "true")
      {
        completed.splice(insertIndex,0,1);
      }
      else
      {
        completed.splice(insertIndex,0,0);
      }
      console.log("Just inserted:");
      console.log(milliseconds[insertIndex]);
      console.log(dateLabel[insertIndex]);
      console.log(completed[insertIndex]);

    }

    //Plot the graph
    Plotly.plot( TESTER, [{
        dateLabel,
        completed }], {
        margin: { t: 0 } } );

  });
  console.log("Getting data");
  XHR.GET('/parse/classes/DataModel');
}

ParseRequest.postCloudCodeData = function() {
  XHR.setCallback(function(data){
    // close second step
    Steps.closeStep('#step-3');
    Steps.fillStepOutput('#step-3-output', data)
    Steps.fillBtn('#step-3-btn', 'Tested');
    // open third step
    Steps.showWorkingMessage();
  });
  XHR.POST('/parse/functions/hello');
}


/**
 * Store objectId and other references
 */

var Store = {
  objectId: ""
};

var Config = {}

Config.getUrl = function() {
  if (url) return url;
  var port = window.location.port;
  var url = window.location.protocol + '//' + window.location.hostname;
  if (port) url = url + ':' + port;
  return url;
}


/**
 * XHR object
 */

var XHR = {}

XHR.setCallback = function(callback) {
  this.xhttp = new XMLHttpRequest();
  var _self = this;
  this.xhttp.onreadystatechange = function() {
    if (_self.xhttp.readyState == 4 && _self.xhttp.status >= 200 && _self.xhttp.status <= 299) {
      callback(_self.xhttp.responseText);
    }
  };
}

XHR.POST = function(path, callback) {
  var seed = {"score":1337,"playerName":"Sean Plott","cheatMode":false}
  this.xhttp.open("POST", Config.getUrl() + path, true);
  this.xhttp.setRequestHeader("X-Parse-Application-Id", "myAppId");
  this.xhttp.setRequestHeader("Content-type", "application/json");
  this.xhttp.send(JSON.stringify(seed));
}

XHR.GET = function(path, callback) {
  this.xhttp.open("GET", Config.getUrl() + path + '/' + Store.objectId, true);
  this.xhttp.setRequestHeader("X-Parse-Application-Id", "UlJdbXUl6AcQN7IhXWv278qf4aNzj3qNs4XPOSrt");
  this.xhttp.setRequestHeader("Content-type", "application/json");
  this.xhttp.send(null);
}


/**
 *  Boot
 */

Steps.init();
