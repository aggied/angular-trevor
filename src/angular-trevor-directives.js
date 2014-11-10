angular.module('angular-trevor-directives', [])
.directive('angularTrevor', function() {
  var temp='<div ng-repeat="i in AT.blocks" class="list"><div class="at-block"><at-editable ng-if="i.type===\'text\'"></at-editable><at-image ng-if="i.type==\'image\'"></at-image><at-embed ng-if="i.type===\'embed\'"></at-embed><div class="at-controls-right"><div ng-repeat="j in atOptions.rtControls" ng-click="j.callback()"><i class="fa" ng-class="j.faIcon"></i></div><div><i class="fa fa-arrows-v"></i></div><div ng-click="delBlock($index)"><i class="fa fa-trash"></i></div></div></div><at-new-block></at-new-block></div>';
        return {
          template:temp,
          restrict:'EAC',
          link: function($scope, elm, attrs) {
              $scope.delBlock=function(index){
                $scope.AT.blocks.splice(index,1);
              };
              $scope.reset=function(){
                $scope.AT={};
                $scope.AT.blocks=[
                  {type:'text',sequence:0,tags:[]},
                ];
              };
              $scope.reset();
              // $scope.compile=function(){
              //  var output=$scope.AT;
          //       $scope.compileCall(output);
          //       // $scope.$emit('atCompiled',output);
              // };

            }
        };
})
.directive('contenteditable', function($timeout) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                // view -> model
                elm.bind('blur', function() {
                  $timeout(function() {
                      scope.$apply(function() {
                          ctrl.$setViewValue(elm.html());
                      });
          });

                });

                // model -> view
                ctrl.$render = function() {
                    elm.html(ctrl.$viewValue);
                };

                // load init value from DOM
                //ctrl.$setViewValue(elm.html());
            }
        };
})
.directive("atEmbed", function($http,$compile,$sce) {
 var temp='<div class="at-image-outer"><div class="at-image-inner"><i class="fa fa-link" style="font-size:34px;"></i><input ng-model="inputs.url" ng-paste="generateEmbed($event)" placeholder="type or paste URL here"  type="text"></div></div>';

  return {
    restrict: "E",
    // templateUrl:'blocks/at-image.html',
    template:temp,
    // transclude: true,
    scope: true,
    link: function(scope,element, attrs) {
        scope.inputs={};
        scope.generateEmbed=function(evt){
          var uri=evt.originalEvent.clipboardData.getData('text/plain');
          var embedTypes=['player','app']; 
        // if (window.location.protocol != "https:"){
        //   var url = '
        // }else{
        //   var url = '
        // }
      $http({
          url: 'http://alpha.test.com:8061/iframely',
          method: "GET",
          params: {
              uri:uri,
              group:false,
            }       
      }).success(function(data, status, headers, config) {
        data.switch='default';
        for (var i=0;i<embedTypes.length;i++){
          if (data.rel && data.rel.indexOf(embedTypes[i])>-1){
            data.switch='html';
            scope.iframeHtml=$sce.trustAsHtml(data.html);
          }
        }
        scope.data=data;
        scope.$parent.i.embed=data;
         $http.get('/partials/embed.html')
              .then(function(response){
          // var newTemp='<div class="generatedLink" style="border-left:solid 8px {{data.meta.color}};margin-right:auto;margin-left:auto;"><a ng-href="{{data.meta.canonical}}" target="_blank" style="height:100%;width:100%;"><div style="float: left; margin-right: 15px;"><img ng-if="data.links.thumbnail[0]" class="generatedLink" style="width: 130px; height: auto;" ng-src="{{data.links.thumbnail[0].href}}" alt=""></div><div class="previewPosted" style="width: 290px; float: left;"><div style="margin-bottom: 10px;"><span style="font-weight: bold;font-size:16px;"><span>{{data.meta.title}}</span></span></div><div class="previewDescriptionPosted" style="font-size:12px;">{{data.meta.description}}</div><div style="margin-bottom: 10px;"><a ng-href="{{data.meta.canonical}}" target="_blank" style="font-size:14px;overflow-x: hidden;max-width: 300px;display: block;white-space: nowrap;">Read the article at {{data.meta.canonical}}</a></div></div><div class="spacer"></div></div></div></a></div>';
            var compiled=$compile(response.data)(scope);
             element.replaceWith(compiled);
            });

        }).
        error(function(data, status, headers, config) {
          console.log(data);
        });
        };
      }
   };
})
.directive("atNewBlock", function($compile,$document) {
  var template='<div ng-click="click($event)" class="at-plus"><span>+</span></div>';
  var template_for = function(type) {
    return type+"\\.html";
  };
  var blocks={
    text:{
      faIcon:'fa-pencil'
    },
    image:{
      faIcon:'fa-camera',
      
    },
  embed:{
    faIcon:'fa-link'
  }
  };
  var chooser='<div class="at-block-chooser" ng-focus="blockCancel()">';
  // for (i=0;i<blocks.length;i++){
    for (var k in blocks){
    chooser+='<span class="at-block-type"><a ng-click="newBlock($event,\''+k+'\')"><i class="fa '+blocks[k].faIcon+'"></i><a></span>';
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
        // $scope.$parent.AT.blocks.push({type:type});
        for (j=$scope.$index+1;j<$scope.AT.blocks.length;j++){
          $scope.AT.blocks[j].sequence+=1;
          $scope.AT.blocks[j].tags=[];
        }
        $scope.AT.blocks.splice($scope.$index+1,0,{'type':type,sequence:$scope.$index+1});
        // scope.$apply();
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
}).directive("atEditable", function($compile,$timeout,$http,$document) {
  var template='<div placeholder="{{atOptions.atEditPlaceholder}}" contenteditable="true" ng-class="atOptions.atEditClass" ng-model="i.content" class="at-editable" ng-mouseup="showControls($event,i)"></div><div ng-class="{atAutoComp: autocomplete.length>0}" ><li ng-repeat="i in autocomplete" ng-mousedown="entSelect($event,i)" ng-class="{atAutoCompSelected: $index==acSelected}"><p class="atAutoName">{{i.name}}</p><p class="atAutoSubname">{{i.subname}}</p></li></div><div class="at-text-controls"><li><button class="stopProp" style="font-weight:bold;" unselectable="on" ng-click="bold($event)">B</button></li><li ><button class="stopProp" unselectable="on" style="font-s6ytyle:italic;" ng-click="italic($event)">i</button></li></div>';
  var template_for = function(type) {
    return type+"\\.html";
  };
  
  return {
    restrict: "E",
    // transclude: true,
    template:template,
    link: function(scope,element, attrs) {
      //place cursor in all new text blocks
      element[0].childNodes[0].focus();
      scope.tags=[];
      scope.autocomplete=[];
      // scope.autocomplete=[{value:'pr is awesome',entType:'phrase'}];
      // socket.on('autocomplete',function(results){
        // if (results.index==scope.$index){
          // scope.autcomplete=results.data;
        // }
      // });
      if (scope.atOptions.onDirty){
        element.bind("click",function(e){
          scope.atOptions.onDirty();
        });        
      }

      element.bind("keydown", function (e) {
        //should use keypress?
        var trick = element.offsetHeight;
        // http://www.javascripter.net/faq/keycodes.htm  && http://unixpapa.com/js/key.html OR http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
      switch (e.which) {
        case 0:
          //tab
          removeAutoComplete();
          break;
        case 13:
          //add new AT text block
          e.preventDefault();
          //check if autocomplete selected
          if (scope.autocomplete.length>0){
            scope.entSelect(e,scope.autocomplete[scope.acSelected]);
            return;
          }
          removeAutoComplete();
          if (!/\S/.test(element[0].innerText)) {
                // string is just whitespace
                return;
          }
          // scope.$parent.AT.blocks.splice(scope.$index+1, 0, "image");
          for (j=scope.$index+1;j<scope.$parent.AT.blocks.length;j++){
            scope.$parent.AT.blocks[j].sequence+=1;
          }
          // scope.$parent.AT.blocks.push({'type':'text',sequence:scope.$index+1});
          scope.$parent.AT.blocks.splice(scope.$index+1,0,{'type':'text',sequence:scope.$index+1});
          // scope.$parent.AT.blocks.push('text');
          $timeout(function() {
            scope.$apply();
          });
          break;
          case 35:
              scope.watchHash=true;
              break;
          case 32: //space
            removeAutoComplete();
            getWord(4,true);
            // exitWrapElement();
            // regexOnSpace();
            break;
          case 37: // left
            break;

            case 38: // up
              autocompleteArrow(-1);
            break;

            case 39: // right
            break;

            case 40: // down
              autocompleteArrow(1);
              break; 
          default:
            // var word=getWord(3,false,false,String.fromCharCode(e.which));
            // if (!word)break;
            // if (word.word.length>2){
            //  //get first character and watch for autocomplete
            //  var firstChar=word.word.charAt(0);
            //  if (firstChar==='^'){
            //    geocomplete(word.word);
            //  }
            //  //add line height to top for autocopmlete
            //  var top=parseInt(word.pos.top.split('px')[0])+13;
            //  angular.element(element[0].children[1]).css('top',top.toString()+'px');
            //  angular.element(element[0].children[1]).css('left',word.pos.left);
            //  // socket.emit('autocomplete',{q:word.word.trim(),index:scope.$index});
            // }
          regexAll(String.fromCharCode(e.which));
             // http://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than
         // if (((e.which >= 48) && (e.which <= 57)) || ((e.which >= 65) && (e.which <= 90)) ||((e.which >= 97) && (e.which <= 122)) || e.which==95){
            // // console.log('alpha_numeric');       
         // }
            break;
      }
       });
      function removeAutoComplete(apply){
        scope.autocomplete=[];
      $timeout(function() {
        scope.$apply();
      });
      }; 
      
      function autocompleteArrow(val){
        if (isNaN(scope.acSelected)){
          scope.acSelected=0;
        }else{
          scope.acSelected+=val;     
        }
        if (scope.acSelected<0){
          scope.acSelected=0;
        }else if (scope.acSelected>scope.autocomplete.length-1){
          scope.acSelected=scope.autocomplete.length-1;
        }
        $timeout(function() {
          scope.$apply();
        }); 
      };

      var stopwords=['a'];
      // ==========================================  
      scope.showControls=function(e,index){
      var sel=window.getSelection(), selectedRange=sel.getRangeAt(0);
      if (sel.anchorNode.parentElement.nodeName=="B"){
        //already bold, make button orange
        angular.element(element[0].children[2].children[0].children[0]).css('color','orange');
      }
      if (sel.anchorNode.parentElement.nodeName=="I"){
        angular.element(element[0].children[2].children[1].children[0]).css('color','orange');
      }
        if (selectedRange.toString().length>0){
          var caretPos=getCaretPixelPos();var top=parseInt(caretPos.top.split('px')[0])-30;
          //place closer to the middle
          // var left=parseInt(caretPos.top.split('px')[0])-(selectedRange.toString().length*.4);
          angular.element(element[0].children[2]).css('top',top.toString()+'px');
          angular.element(element[0].children[2]).css('left',caretPos.left);
          angular.element(element[0].children[2]).css('display','inline');
          e.stopPropagation(); 
          $document.bind('mousedown', scope.hideControls);            
        }
      };
      
      scope.hideControls=function(e){
      // angular.element(element[0].children[2].children[0].children[0]).css('color','white');
      angular.element(element[0]).find('button').css('color','white');
        if (e && angular.element(e.target).hasClass('stopProp')){
          return false;
        }
        angular.element(element[0].children[2]).css('display','none');
        $document.unbind('mousedown', scope.hideControls);   
        return false;
      };
      scope.bold=function(e){
        document.execCommand ('bold', false, null);
        scope.hideControls();
      };
      scope.italic=function(e){
        document.execCommand ('italic', false, null); 
        scope.hideControls();
      };
      scope.entSelect=function(e,ent){
        e.preventDefault(); 
        var word=getWord(0,false,true);
        var re = new RegExp(word.word.trim());
        var replacedString = word.node.textContent.replace(re, '<span>'+ent.value+' '+'</span>');
        var testString=word.node.parentNode.innerHTML;
        var newNode = document.createElement("span");
        if (!ent.className){
          ent.className='at-hash';
        }
        newNode.setAttribute("class",ent.className);
        var selectedRange=word.sel.getRangeAt(0);
        selectedRange.surroundContents(newNode);
        newNode.textContent=" "+ent.value+" ";
        selectedRange.collapse(false);
        selectedRange.setEndAfter(newNode);
        if (ent.tag){
          scope.$parent.i.tags.push({
            type:ent.entType,
            value:ent.object
          });  
        }
        //need to create a new text node and omve to that
        selectedRange.insertNode(document.createTextNode("\u200B"));
        selectedRange.collapse(false);
        word.sel.removeAllRanges();
        word.sel.addRange(selectedRange);
        removeAutoComplete();
      };
      
    function getWord(minLen,checkEnts,leaveSel,curChar){
      var sel=window.getSelection(),selectedRange=sel.getRangeAt(0);
      try {
        sel.collapseStart();
      }catch(e){
        // console.log('at start of line');t
      }
      sel.modify("extend","backward","word");
      var wordOffset=sel.getRangeAt(0).getBoundingClientRect();
      sel.modify("extend","backward","character");
      var word=sel.toString();
      var wordNode=sel.anchorNode;
      var caretPos=getCaretPixelPos();
      if (curChar){
        word+=curChar;
      }
      if (checkEnts && word.length>minLen-1){
        if (spaceHash(word,sel)){
          entityCheck(word.slice(1));
          return;
        }
        entityCheck(word);
      }
      if (!leaveSel){
        //restore selection
        sel.removeAllRanges();
        sel.addRange(selectedRange);        
      }
      if (word.length>=minLen){
        // return {word:word,offset:wordOffset,rect:wordRect};
        return {word:word,node:wordNode,sel:sel,offset:wordOffset,pos:caretPos};
      }
      return false;
      
    };
    
    function entityCheck(word){
      // this function checks emits all capitalized words to the server for updating  recommendations on the fly
      var puncts='.,;"\'()!';
      word=word.trim();
      if (!/[A-Z]/.test(word[0])){
        //only automplete capitalized words for now
        return;
      }
      if (puncts.indexOf(word[word.length-1])>-1){
        word=word.substr(0,word.length-1);
      }
      if (stopwords.indexOf(word.toLowerCase())>-1){return;}
      // socket.emit('checkEntity',{w:word});
    }
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
    
    function spanElement(tag,elmClass){
      //in sequence for this function to work selection needs to already be at word
      var sel = window.getSelection();
      var selectedRange=sel.getRangeAt(0);
      var newNode=document.createElement("span");
      newNode.setAttribute("class",elmClass);
      try{
        selectedRange.surroundContents(newNode);
      }catch(e){
        console.log(e);
      }
      selectedRange.collapse(false);
      selectedRange.setStartAfter(newNode);

      //create new 0-width element as a workaround to getting stuck in the new span element
      selectedRange.insertNode(document.createTextNode("\u200B"));
      selectedRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(selectedRange);
    };
    function spaceHash(potHash,sel){
            var nodeContents=sel.anchorNode.textContent;
            var charPos=nodeContents.length-potHash.length-1;
            var spaceCheck=(nodeContents.charAt(charPos)==' '|| nodeContents.charAt(charPos).length===0);
            var firstChar=potHash.charAt(0);
            if (spaceCheck && firstChar=="#"){
                if (/(#[a-z][a-z0-9\_]*)/ig.test(potHash.toString())){
                  spanElement(potHash,"at-hash");
                  if (!scope.$parent.i.tags){
                    scope.$parent.i.tags=[];
                  }
                  scope.$parent.i.tags.push({
                    type:'hashtag',
                    value:potHash
                  });
                  return true;
                } 
                return false;   
            }
    };

    function exitWrapElement(){
      //this function exits a wrapped element on space press
      var sel = window.getSelection();
      var anchor = sel.anchorNode;
      var selectedRange=sel.getRangeAt(0);
      var pClasses = anchor.parentNode.classList;

      if (!pClasses.contains('at-editable')){
        //get out of the span!
        var blankNode = document.createTextNode("\u200B");
        anchor.parentNode.insertBefore(blankNode, anchor.parentNode.nextSibling);
        selectedRange.setStartAfter(blankNode);
        selectedRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(selectedRange);
      }
    };

    function regexOnSpace(){
      var curText = element[0].innerText;
      var curNode = document.getSelection().anchorNode;
      var parentNode = curNode.parentNode;
      var curNodeText = curNode.textContent;
      var hashArray = curNodeText.split(/(#|＃)([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/);

        if (hashArray.length>1){
          var newNodes = [];
          var sel = window.getSelection();
          var selectedRange=sel.getRangeAt(0);
          console.log(hashArray);
          for (var i=0;i<hashArray.length;i+=4){
            newNodes.push(document.createTextNode(hashArray[i]));
            var spanText = document.createTextNode("#"+hashArray[i+2]);
            var newSpan = document.createElement('span');
            newSpan.setAttribute('class','at-hash');
            newSpan.appendChild(spanText);
            newNodes.push(newSpan);
          }
          parentNode.replaceChild(newNodes[newNodes.length-1],curNode);
          for (var j=newNodes.length-2;j>-1;j--){
           parentNode.insertBefore(newNodes[j],newNodes[j+1]); 
          }
          console.log(newNodes);
          placeCaretAtEnd(element[0].children[0]);
        };
    };

    function regexAll(curChar){
      // var res = element[0].innerText.match(/(\s)|(^)#([a-z][a-z0-9\_]*)/ig);
      var curText = element[0].innerText;
      var curNode = document.getSelection().anchorNode;
      var parentNode = curNode.parentNode;
      var curNodeText = curNode.textContent;
      //curNodeText2 = curNodeText.replace(/(#|＃)([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/gi,"<span class='at-hash'>$&</span>");

      var hashArray = curNodeText.split(/(#|＃)([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/);

        // if (hashArray.length>1){
        //   var newNodes = [];
        //   var sel = window.getSelection();
        //   var selectedRange=sel.getRangeAt(0);
        //   console.log(hashArray);
        //   for (var i=0;i<hashArray.length;i+=4){
        //     newNodes.push(document.createTextNode(hashArray[i]));
        //     var spanText = document.createTextNode("#"+hashArray[i+2]+curChar);
        //     var newSpan = document.createElement('span');
        //     newSpan.setAttribute('class','at-hash');
        //     newSpan.appendChild(spanText);
        //     newNodes.push(newSpan);
        //   }
        //   parentNode.replaceChild(newNodes[newNodes.length-1],curNode);
        //   for (var j=newNodes.length-2;j>-1;j--){
        //    parentNode.insertBefore(newNodes[j],newNodes[j+1]); 
        //   }
        //   console.log(newNodes);
        //   placeCaretAtEnd(element[0].children[0]);
        // };
        

      // document.getSelection().anchorNode.parentNode.replaceChild(curNodeText,curNodeText);
      // console.log(document.getSelection().anchorNode.parentNode);
      // console.log(arrayOfStrings);
        // curText=curText.replace(/(?:(?:https?):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:([a-z0-9][a-z0-9\-]*)?[a-z0-9]+)(?:\.(?:[a-z0-9\-])*[a-z0-9]+)*(?:\.(?:[a-z]{2,})(:\d{1,5})?))(?:\/[^\s]*)?(?=\s)/gi,"<a href='$1$2'>$1$2</a>");
        // console.log(curText);
        // console.log(element[0].children[0].innerHTML);
        // console.log(element);

        //test for geotag
        var geo = curNodeText.match(/\^.*/);
        console.log(geo);
        geocomplete(geo[0]);

        // var geotag = element[0].innerText.match


        // element[0].children[0].innerHTML=curText;
        placeCaretAtEnd(element[0].children[0]);
    };

    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    function geocomplete(word){
      $http({
          ignoreLoadingBar: true,
          url: "http://api.geonames.org/searchJSON",
          method: "GET",
          params: {
          featureClass: "P",
          username:'testTeam',
          style: "full",
          maxRows: 8,
          // name_startsWith: request.term
          q: word.substr(1),
          // q:word
            }       
      }).success(function(data, status, headers, config) {
        removeAutoComplete();
          for (var i=0;i<data.geonames.length;i++){
            scope.autocomplete.push({
              name:data.geonames[i].toponymName,
              subname:data.geonames[i].countryName,
              value:"^"+data.geonames[i].toponymName,
              object:data.geonames[i],
              entType:'geotag',
              className:'at-geotag',
              tag:true
            });
          }
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    };
    function insertNodeAtCaret(node) {
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                range.collapse(false);
                range.insertNode(node);
                range = range.cloneRange();
                range.selectNodeContents(node);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
            var html = (node.nodeType == 1) ? node.outerHTML : node.data;
            var id = "marker_" + ("" + Math.random()).slice(2);
            html += '<span id="' + id + '"></span>';
            var textRange = document.selection.createRange();
            textRange.collapse(false);
            textRange.pasteHTML(html);
            var markerSpan = document.getElementById(id);
            textRange.moveToElementText(markerSpan);
            textRange.select();
            markerSpan.parentNode.removeChild(markerSpan);
        }
    }
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
    function getCaretPixelPos($node, offsetx, offsety){
        offsetx = offsetx || 0;
        offsety = offsety || 0;
    
        var nodeLeft = 0,
            nodeTop = 0;
        if ($node){
            nodeLeft = $node.offsetLeft;
            nodeTop = $node.offsetTop;
        }
    
        var pos = {left: 0, top: 0};
    
        if (document.selection){
            var range = document.selection.createRange();
            pos.left = range.offsetLeft + offsetx - nodeLeft + 'px';
            pos.top = range.offsetTop + offsety - nodeTop + 'px';
        }else if (window.getSelection){
            var sel = window.getSelection();
            var range = sel.getRangeAt(0).cloneRange();
            try{
                range.setStart(range.startContainer, range.startOffset-1);
            }catch(e){}
            var rect = range.getBoundingClientRect();
            if (range.endOffset == 0 || range.toString() === ''){
                // first char of line
                if (range.startContainer == $node){
                    // empty div
                    if (range.endOffset == 0){
                        pos.top = '0px';
                        pos.left = '0px';
                    }else{
                        // firefox need this
                        var range2 = range.cloneRange();
                        range2.setStart(range2.startContainer, 0);
                        var rect2 = range2.getBoundingClientRect();
                        pos.left = rect2.left + offsetx - nodeLeft + 'px';
                        pos.top = rect2.top + rect2.height + offsety - nodeTop + 'px';
                    }
                }else{
                    pos.top = range.startContainer.offsetTop+'px';
                    pos.left = range.startContainer.offsetLeft+'px';
                }
            }else{
                pos.left = rect.left + rect.width + offsetx - nodeLeft + 'px';
                pos.top = rect.top + offsety - nodeTop + 'px';
            }
        }
        return pos;
    };
    }
  };
})
.directive("atImage", function($rootScope,fileUploadSvc,profile,$compile) {
 var temp='<div class="at-image-outer"><div class="at-image-inner"><i class="fa fa-camera" style="font-size:34px;"></i><p>Drag<strong>Image</strong> here</p><input type="file" file-model="myFile"/><input placeholder="Or paste URL here"  type="text"></div><div><textarea ng-model="i.caption" placeholder="Write an image caption..." autofocus style="resize: none;width:96%;"></textarea></div><button ng-click="uploadImage()" style="border: none;color: white;background-color: orangered;">Upload Image</button></div>';

  return {
    restrict: "E",
    // templateUrl:'blocks/at-image.html',
    template:temp,
    // transclude: true,
    // scope: true,
    link: function($scope,$element, attrs) {
        $scope.uploadImage=function(){
          var file = $scope.myFile;
          var uploadUrl = 'https://api.test.com/services/rest/file/uploadImage';
          var formObj={
            file:$scope.myFile,
            token:$rootScope.upToken,
            ip:$rootScope.upIp,
            pid:profile.ident,
            caption:$scope.$parent.i.caption
          }
          var newImg=fileUploadSvc.uploadFileToUrl(formObj, uploadUrl);
          newImg.success(function(result){
            $scope.$parent.i.url=result.message;
            var newTemp='<div class="at-img-wrap"><div class="at-img-card-inner"><img src="'+result.message+'"/><div class="at-img-caption">{{i.caption}}</div></div></div>';
            var compiled=$compile(newTemp)($scope);
            $element.replaceWith(compiled);
          });
        };
      }
   };
});

