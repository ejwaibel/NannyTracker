define([], function() {
	Path.map("#!/nanny").to(function(){
	}).enter(function() {
		require(['tpl!template/nanny.html'], function(tpl) {
			$('#main').append($(tpl.apply()));
		});
	}).exit(function() {
		// Exit from route
		$('#main').off().empty();
	});
});
