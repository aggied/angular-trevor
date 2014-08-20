angular.module('angular-trevor-directives', [])

.directive("atNewBlock2", function() {
  var linkFunction = function(scope, element, attributes) {
    var paragraph = element.children()[0];
    $(paragraph).on("click", function() {
      $(this).css({ "background-color": "red" });
    });
  };

  return {
    restrict: "E",
    link: linkFunction
  };
})

.directive("atNewBlock3", function($compile) {
  var template=' <div ng-click="newBlock($event,i.seq)" style="font-size:20px;text-align: center;padding: 15px;background-color: rgb(230, 230, 230);margin: 10px 0px;">+</div>';
  var template_for = function(type) {
    return type+"\\.html";
  };
  
  return {
    restrict: "E",
    // transclude: true,
    scope: true,
    compile: function(element, attrs) {
      return function(scope, element, attrs) {
        var tmpl = template_for(scope.component.type);
        element.html($("#"+tmpl).html()).show();
        $compile(element.contents())(scope);
      };
    }
  };
})
.directive("atNewBlock", function($compile) {
  var template=' <div ng-click="click()" style="font-size:20px;text-align: center;padding: 15px;background-color: rgb(230, 230, 230);margin: 10px 0px;">+</div>';
  var template_for = function(type) {
    return type+"\\.html";
  };
  
  return {
    restrict: "E",
    // transclude: true,
    scope: true,
    replace:true,
    template:template,
      controller: function($scope, $element){
         $scope.click = function(){
           $element.html('testing').show();
           $compile(element.contents()($scope));
         };
       }
  };
});
