angular.module('angular-trevor', ['angular-trevor-directives'])
.controller('wrapper',function($scope){
	$scope.AT={};
	$scope.AT.blocks=[
		{type:'text',order:0},
		];
});
