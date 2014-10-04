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
.directive("atNewBlock", function($compile,$document) {
  var template='<div ng-click="click($event)" class="at-plus"><span>+</span></div>';
  var template_for = function(type) {
    return type+"\\.html";
  };
  var blocks=[
  	{
  		type:'image',
  		faIcon:'fa-camera',
  		
  	},{
  		type:'text',
  		faIcon:'fa-pencil'
  	}
  ];
  var chooser='<div class="at-block-chooser" ng-focus="blockCancel()">';
  for (i=0;i<blocks.length;i++){
  	chooser+='<span class="at-block-type"><a ng-click="newBlock($event,\''+blocks[i].type+'\')"><i class="fa '+blocks[i].faIcon+'"></i><a></span>';
  }
  chooser+='</div>';
  return {
    restrict: "E",
    // transclude: true,
    scope: true,
    replace:true,
    template:template,
    controller: function($scope, $element){
         $scope.click = function(e){
         	// var linkFn = $compile(chooser);
            // var content = linkFn($scope);
            var compiled=$compile(chooser)($scope);
            // $element.append(content);
           $element.replaceWith(compiled);
           $element=compiled;
           e.stopPropagation();
		  $document.bind('click', $scope.blockCancel);
           // $compile($element.contents());
         };
         $scope.newBlock=function(e,type){
         	e.stopPropagation();
         	console.log(type);
         	$scope.$parent.AT.blocks.push('test2');
         	var compiled=$compile(template)($scope);
         	 $element.replaceWith(compiled);
         	 $element=compiled;
         	 
         };
         $scope.blockCancel=function(e){
         	// isOpen = false;
         	var compiled=$compile(template)($scope);
         	 $element.replaceWith(compiled);
         	 $element=compiled;
		    $document.unbind('click',$scope.blockCancel);
         };
    }
  };
}).directive("atEditable", function($compile) {
  var template='<div contenteditable="true" class="at-editable"></div>';
  var template_for = function(type) {
    return type+"\\.html";
  };
  
  return {
    restrict: "E",
    // transclude: true,
    template:template,
    link: function(scope,element, attrs) {
    	 element.bind("keypress", function (e) {
    	 	// http://www.javascripter.net/faq/keycodes.htm  && http://unixpapa.com/js/key.html OR http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
 			switch (e.which) {
 				case 13:
 					//add new AT text block
 					e.preventDefault();
 					if (!/\S/.test(element[0].innerText)) {
    						// string is just whitespace
    						return;
					}
 					scope.$parent.AT.blocks.push('test2');
 					scope.$apply();
 					var newBlock=element[0].parentNode.parentNode.nextSibling.nextSibling.childNodes[1].childNodes[1].childNodes[0];
 					var div = document.createRange();
					div.selectNodeContents(newBlock);
 					var sel=window.getSelection();sel.removeAllRanges();
 					sel.addRange(div);
			    case 35:
			        scope.watchHash=true;
			        break;
			    case 32:
			    	spaceHash();
			        // if (getSelectionContainerElement().getAttribute('class')=='at-hash'){
               			// unwrapHash();
              		// }
			    	// else if (scope.watchHash){
			   			// wrapHash();scope.watchHash=false;
			    	// }
			        break;
        	   default:
        	   // http://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than
			   if (((e.which >= 48) && (e.which <= 57)) || ((e.which >= 65) && (e.which <= 90)) ||((e.which >= 97) && (e.which <= 122)) || e.which==95){
			   	  // console.log('alpha_numeric');
			   }else{
			   		if (scope.watchHash){scope.watchHash=false;}
			        if (getSelectionContainerElement().getAttribute('class')=='at-hash'){
               			unwrapHash();
              		}			   	
			   }

			   		break;
			}
    	 });
    	function unwrapHash(){
    		var text=getSelectionContainerElement().innerHTML;
    		console.log(text);
    	};
		function wrapHash(){		
              	var sel = window.getSelection();
		        sel.collapseToStart();
		        sel.modify("move", "backward", "word");
		        sel.modify("move","backward","character");
		        sel.modify("extend", "forward", "word");
		        //TODO make sure word still starts w/ hash, otherwise skip.
            //insertHTML is not supported by IE & Chrome won't insert p tags
            // document.execCommand('insertHtml',false,'<span class="at-hash">'+sel.toString()+'</span>');
               var selectedRange = sel.getRangeAt(0);
               if (getSelectionContainerElement().getAttribute('class')=='at-hash'){
               		console.log('got it');
               		console.log(selectedRange);
               		return;
               }	
               var newNode = document.createElement("span");
               newNode.setAttribute("class","at-hash");
               selectedRange.surroundContents(newNode);
               selectedRange.collapse(false);
               selectedRange.setEndAfter(newNode);
				//need to create a new text node and omve to that
				selectedRange.insertNode(document.createTextNode("\u200B"));
				selectedRange.collapse(false);
                sel.removeAllRanges();
		        sel.addRange(selectedRange);
            // sel.modify("move","forward","lineboundary");
		};
		function spaceHash(){
			//grab previous word and run regex to see if hashtag. 
			    var sel = window.getSelection(), selectedRange = sel.getRangeAt(0);
		        sel.collapseToStart();
		        sel.modify("extend","backward","word");
		        var spaceCheck=(sel.toString().indexOf(' ') >= 0);
		        sel.modify("extend","backward","character");
		        // sel.modify("move", "backward", "word");
		        // sel.modify("move","backward","character");
		         // sel.modify("move","backward","character");
		        // sel.modify("extend", "forward", "word");
		        var potHash=sel.toString();
		      sel.modify("extend","backwawrd","character");
		      sel.modify("extend","backward","character");
		      var prevChar=sel.toString().charAt(0);
		      if (prevChar==" " || (prevChar=="#" && sel.extentOffset==0)){
		      	//extentOffset will be zero if first word in block is a #
		      // console.log(sel.focusNode.textContent);
		        // /(^|\W)(#[a-z\d][\w-]*)/ig
	        	if (/(#[a-z][a-z0-9\_]*)/ig.test(potHash.toString()) && !spaceCheck) {
	        		var selectedRange=sel.getRangeAt(0);
               		var newNode = document.createElement("span");
	               newNode.setAttribute("class","at-hash");
	               selectedRange.surroundContents(newNode);
	               selectedRange.collapse(false);
	               selectedRange.setStartAfter(newNode);
					//need to create a new text node and omve to that
					selectedRange.insertNode(document.createTextNode("\u200B"));
					selectedRange.collapse(false);
				}
		      }
		        // Restore selection
		        sel.removeAllRanges();
		        sel.addRange(selectedRange);
		};
		
		function getSelectionContainerElement() {
		    var range, sel, container;
		    if (document.selection && document.selection.createRange) {
		        // IE case
		        range = document.selection.createRange();
		        return range.parentElement();
		    } else if (window.getSelection) {
		        sel = window.getSelection();
		        if (sel.getRangeAt) {
		            if (sel.rangeCount > 0) {
		                range = sel.getRangeAt(0);
		            }
		        } else {
		            // Old WebKit selection object has no getRangeAt, so
		            // create a range from other selection properties
		            range = document.createRange();
		            range.setStart(sel.anchorNode, sel.anchorOffset);
		            range.setEnd(sel.focusNode, sel.focusOffset);
		
		            // Handle the case when the selection was selected backwards (from the end to the start in the document)
		            if (range.collapsed !== sel.isCollapsed) {
		                range.setStart(sel.focusNode, sel.focusOffset);
		                range.setEnd(sel.anchorNode, sel.anchorOffset);
		            }
		        }
		
		        if (range) {
		           container = range.commonAncestorContainer;
		
		           // Check if the container is a text node and return its parent if so
		           return container.nodeType === 3 ? container.parentNode : container;
		        }   
		    }
		}
    }
  };
});
