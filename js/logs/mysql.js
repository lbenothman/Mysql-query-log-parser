module.exports = new function () {

  this.tail = 0;

  this.formatQuery = function (data,callback)
  {
    //Check if the line is a new query
    var matchNewQuery = data.match(/^\s*([0-9]+)/);
    var newQuery = true;

    if(matchNewQuery==null) {
      newQuery = false;
    }

    //Format the query
    data = data.replace(/\s(INNER|LEFT|FROM|WHERE|AND,LIMIT,OR)\s/gi, function(matched){
      return '<BR/>'+matched;
    });

    //Call the callback funtion
    callback(data,newQuery);
  }

  this.parseLog = function (filePath,callback)
  {
    var that = this;
    var Tail = require('tail').Tail;

    this.tail = new Tail(filePath);

    this.tail.on("line", function(data) {
      that.formatQuery(data,callback);
    });

    this.tail.on("error", function(error) {
      console.log('ERROR: ', error);
    });
  }

  this.pause = function ()
  {
    this.tail.unwatch();
  }

  this.filter = function (query,filter)
  {
    return query.toUpperCase().indexOf(filter.toUpperCase()) > -1;
  }
}
