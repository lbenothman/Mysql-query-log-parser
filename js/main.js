var mysqlLog = require('./js/logs/mysql.js');

(function($){
  var mainView = Backbone.View.extend({
    el: $('#main'), // el attaches to existing element

    //Defines all the events
    events: {
      'click button#mysqlLogAction': 'logParse',
      'click button#mysqlLogClear': 'mysqlLogClear',
      'change input#mysqlQueryFilter': 'filterQueries',
    },
    initialize: function(){
      // Load native UI library
      var gui = require('nw.gui');

      // get the window object
      var win = gui.Window.get();

      var view = this;

      //Maximizethe window
      win.show();
      win.maximize();

      //get node webkit GUI
      var gui = require('nw.gui');

      var menubar = new gui.Menu({
        type: 'menubar'
      });

      //Add sub items
      var file = new gui.Menu();
      file.append(new gui.MenuItem({
        label: 'Open the sql file',
        click: function() {
          view.selectLogFile();
        }
      }));

      file.append(new gui.MenuItem({
        label: 'Quit',
        click: function(){
          // Quit current app
          gui.App.quit();
        }
      }));

      menubar.append(new gui.MenuItem({ label: 'File', submenu: file}));

      win.menu = menubar;

      _.bindAll(this, 'render', 'logParse','displayQuery','selectLogFile'); // every function that uses 'this' as the current object should be in here

      this.query = 0;
      this.sParsing = false;
      this.render();

      //If exists, retrieve the log file path from the local storage
      this.mysqlLogFile = localStorage.mysqlLogFile;
    },
    // `render()` now introduces a button to add a new list item.
    render: function(){
      // Compile the template using underscore
       var template = _.template( $("#mysqlLogView").html(), {} );
       // Load the compiled HTML into the Backbone "el"
       this.$el.html( template );
    },

    selectLogFile : function() {
      var view = this;

      var chooser = document.querySelector('#fileDialog');
      chooser.addEventListener("change", function(evt) {
        //Save the file path
        localStorage.setItem("mysqlLogFile", this.value);

        view.mysqlLogFile = this.value;
      }, false);

      chooser.click();
    },

    //Display the query in the log
    displayQuery : function (data,newQuery) {

      var queryDiv;

      if(!newQuery) {
        //Get the div of the last query
        queryDiv =$('#query_'+(this.query-1));

        queryDiv.html(queryDiv.html()+data);
      }
      else {
        $("#mysqlLog").prepend("<div class='query'><code class='sql hljs' id='query_"+this.query+"'>"+data+"</code></div>");

        //Retrieve the query div
        var queryDiv = $('#query_'+this.query);

        this.query++;
      }

      //Highlight the query
      hljs.highlightBlock(queryDiv.get(0));

      //Filter the query
      this.filterQuery(queryDiv);

      if(this.query == 1000) {
        this.query = 0;
        this.mysqlLogClear();
      }
    },

    //Play or pause the log parsing
    logParse: function(){

      //Disable buttons if there is no lof file
      if(typeof this.mysqlLogFile == "undefined") {
        alert("Please select the sql log file using the menu");
        return;
      }

      if(!this.isParsing) {
        $('#mysqlLogAction').html('Pause');
        mysqlLog.parseLog(this.mysqlLogFile,this.displayQuery);
        this.isParsing = true;
      }
      else {
        this.isParsing = false;
        $('#mysqlLogAction').html('Play');
        mysqlLog.pause();
      }
    },

    //Clear the log
    mysqlLogClear : function(){
      $("#mysqlLog").text("");
    },


    filterQueries:function(){
      var filter = $('#mysqlQueryFilter');
      var view = this;
      if($(filter).val() == "") {
        $('.sql').show();
        return;
      }

      $('.sql').each(function(){
        view.filterQuery($(this));
      });
    },

    //Filer thq query
    filterQuery : function(queryDivObj) {
      var filterInput = $('#mysqlQueryFilter');

      if(mysqlLog.filter(queryDivObj.text(),filterInput.val())) {
        queryDivObj.show();
      } else {
        queryDivObj.hide();
      }
    }
  });

  var mainView = new mainView();
})(jQuery);
