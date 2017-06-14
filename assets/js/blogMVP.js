/** This script controls almost everything about the frontend of the blog
  * If you have no idea about what it does and how, try not to meddle with it.
  * Dependencies : ngRoute, route-params
  */


// The environment variable describes whether the blog is on local development
// environment or deployed on github.
// If on local development env, we dont need to add './blog/' prefix to the links.
// On github, we need to add that prefix.
// Hence, change this var to deploy when deploying it on github. 

//var environment = 'develop';
var environment = 'deploy';
var prefix = (environment == 'deploy') ? './blog/' : '';

var myBlog = angular.module('myBlog', ['ngRoute']);


// Configuring the app and the angular routes. 
// Initially I had used $locationProvider to get pretty URLs but on reload
// those pretty routes gave 404s and I could not resolve them. So I had to
// stay happy with hashed URLs. 

myBlog.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl : prefix+'pages/main.html',
      controller : 'mainController',
      controllerAs : 'ctrl'
    })
    .when('/category/:category', {
      templateUrl : prefix+'pages/category.html',
      controller : 'categoryController',
      controllerAs : 'ctrl'
    })
    .when('/post/:postID', {
      templateUrl : prefix+'/pages/post.html',
      controller : 'postController',
      controllerAs : 'ctrl'
    });
    
    //$locationProvider.html5Mode(true);
});


// A function to sort an array of Month names in reverse order. Pretty noobish
// implementation. But it works and the performance is not yet an issue. 
// When we get performance issues, this will have to be optimized.

function sortMonthsReverse(arr) {
  var m = ['December', 'November', 'October', 'September', 'August', 'July', 'June', 'May', 'April', 'March', 'February', 'January'];
  var ret = [];
  for(var i=0; i<m.length; i++) {
    for(var j=0; j<arr.length; j++) {
      if(arr[j] == m[i]){
        ret.push(m[i]);
        break;
      }
    }
  }
  return ret;
}


// Create a $titleProvider service to change the title of the page dynamically
// for each partial page contained inside an ng-view.
// The default title is 'Blog'.
// 
// This works great. But on the down-side, when we try to share it on Google+
// the google page parser does not find the page title for the view, rather
// it just puts {{ctrl.title.title()}} in the title field of the share.
//
// Had to work around that by adding meta title/name tags in the html specifically
// for the Google+ share. That makes the title of all shared posts a static 
// word "Languoric", but well, nothing else seems to work. 

myBlog.factory('$titleProvider', function() {
  var title = 'Blog';
  return {
    title: function() {return title},
    setTitle: function(newTitle) {title=newTitle;}
  };
});


// controller for the title field. Uses the $titleProvider service above to
// change the title of the page dynamically for each partial page contained 
// within ng-view. The controllers for those views set the title using the 
// $titleProvider service.

myBlog.controller('titleController', function($titleProvider) {
  var self = this;
  self.title = $titleProvider; 
});


// mainpage controller
// implements a treeview for the timeline in pure angular way using ng-show
// Also handles getting data from JSON files and all those stuff a controller 
// should do.

myBlog.controller('mainController', function($http, $titleProvider) {
  var self = this;
  self.timeline = {};
  self.posts = {};
  self.categories = {};
  self.prefix = prefix;
  self.treeView= {};
  
  $titleProvider.setTitle('Languoric');
  
  self.keys = function(obj) {
    return obj? Object.keys(obj) : [];
  }
  
  // function to toggle a boolean value
  
  self.toggle = function(val) {
    //console.log(self.treeView);
    if(val) return false;
    return true;
  }
  
  $http.get(self.prefix+'timeline.json')
    .then(function(res){
      if(res.data == 'error'){
        console.log("Error occured while fetching courses data from server");
      }
      else{
        self.timeline = res.data;
        self.timeline.years = [];
        delete self.timeline['filepath'];
        for(var yr in self.timeline) {
        
          // This is where I have implemented the collapsible treeview structure
          // for the timeline. The basic idea is to order the posts in reverese
          // order of the years and months.
          // For each year and month store a boolean value whether the posts nested
          // under that are visible or not. And when the Year/month is clicked, 
          // toggle that value. The ng-show directive takes care of the rest.
          //
          // Simple idea and so far it works. 
          
          if(yr != 'years'){
            self.timeline.years.push(yr);
            self.timeline[yr].months = [];
            self.treeView[yr] = {"yearLevel":false};
            for(var mn in self.timeline[yr]){
              if(mn != 'months'){
                self.timeline[yr].months.push(mn);
                self.treeView[yr][mn] = false;
              }
            }
            self.timeline[yr].months = sortMonthsReverse(self.timeline[yr].months);
          }
        }
        self.timeline.years.reverse();
        
        // Make the posts under topmost/latest month of the topmost/latest year
        // visible initially. Rest of them should be in collapsed state.
        
        self.treeView[self.timeline.years[0]].yearLevel = true;
        self.treeView[self.timeline.years[0]][self.timeline[self.timeline.years[0]].months[0]] = true;
        //console.log(self.treeView);
      }
    },
    function(err){
      console.log("server did not send any courses data. Server side error maybe");
    });
    
  // Get the categories.json file and put that data in place.
  $http.get(self.prefix+'categories.json')
    .then(function(res){
      if(res.data == 'error'){
        console.log("Error occured while fetching courses data from server");
      }
      else{
        self.categories = res.data;
        delete self.categories['filepath'];
      }
    },
    function(err){
      console.log("server did not send any courses data. Server side error maybe");
    });
    
  // get the posts.json file
  $http.get(self.prefix+'posts.json')
    .then(function(res){
      if(res.data == 'error'){
        console.log("Error occured while fetching courses data from server");
      }
      else{
        self.posts = res.data;
        delete self.posts['filepath'];
      }
    },
    function(err){
      console.log("server did not send any courses data. Server side error maybe");
    });
});


myBlog.controller('postController', function($routeParams, $http, $titleProvider) {
  var postID = $routeParams.postID;
  var self = this;
  self.post = {};
  self.prefix = prefix;
  self.postID = postID;
  
  $titleProvider.setTitle('Blog');
  
  $http.get(self.prefix+'posts/'+postID+'/post.json')
    .then(function(res){
      if(res.data == 'error'){
        console.log("Error occured while fetching courses data from server");
      }
      else{
        self.post = res.data;
        $titleProvider.setTitle(self.post.title);
        delete self.post['filepath'];
      }
    },
    function(err){
      console.log("server did not send any courses data. Server side error maybe");
    }); 
});


myBlog.controller('categoryController', function($routeParams, $http, $titleProvider) {
  var self = this;
  self.categoryName = $routeParams.category;
  self.posts = {};
  self.categories = {};
  self.prefix = prefix;
  
  $titleProvider.setTitle(self.categoryName);
  
  $http.get(self.prefix+'categories.json')
    .then(function(res){
      if(res.data == 'error'){
        console.log("Error occured while fetching courses data from server");
      }
      else{
        self.categories = res.data;
        delete self.categories['filepath'];
        console.log(self.categories);
      }
    },
    function(err){
      console.log("server did not send any courses data. Server side error maybe");
    });
    
  $http.get(self.prefix+'posts.json')
    .then(function(res){
      if(res.data == 'error'){
        console.log("Error occured while fetching courses data from server");
      }
      else{
        self.posts = res.data;
        delete self.posts['filepath'];
        console.log(self.posts);
      }
    },
    function(err){
      console.log("server did not send any courses data. Server side error maybe");
    });
});


// defne a filter to trust and render HTML strings from the post.json file inside
// the post view.

myBlog.filter('unsafe', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  }
});