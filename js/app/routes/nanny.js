define(['jquery', 'jquery.spin'], function($) {
	Path.map("#!/nanny").to(function() {
		$('#main').spin('xlarge');

		if ( !JSON.parse(sessionStorage.getItem("isLoggedIn")) ) {
			window.location.hash = '#!/login';
		}

		// FIXME: Should probably check if user is a Nanny before redirecting
		var isNanny = !JSON.parse(sessionStorage.getItem("isParent"));
		if (!isNanny) {
			window.location.hash = '#!/parent';
		}
	}).enter(function() {
		require([
			'jquery', 'moment',
			'tpl!template/nanny.html', 'tpl!template/completed-task.html',
			'bootstrap', 'bs-datetimepicker'
		], function($, moment, tplNanny, tplCT) {
			var $mainContainer = $('#main');			

			var notesDfd = $.Deferred().resolve('This is a test'),
				messagesDfd = $.Deferred().resolve([{
					message: 'Hey!',
					time: moment().subtract(3, 'days').format('lll')
				}, {
					message: 'Uh-oh',
					time: moment().format('lll')
				}]),
				childrenDfd = $.ajax({
					url: 'api/index.php/parents/' + sessionStorage.getItem("parentId") + '/children',//should be the parent that owns this nanny's id
					type: 'GET',
				});

			// Wait for all AJAX calls to complete
			$.when(notesDfd, messagesDfd, childrenDfd)
				.done(function(notes, messages, childrenResult) {
					var children = childrenResult[0].data[0],
						tabs = [];

					children.forEach(function(obj) {
						tabs.push({
							name: obj.name
						});
					});

					$mainContainer.append($(tplNanny.apply({
						generalNotes: notes,
						messages: messages,
						childrenTabs: tabs,
						children: children
					})));

					// $('.js-children-tabs a[data-toggle="tab"]:first').click();
					$('.js-children-tabs a[data-toggle="tab"]:first').tab('show');
				}).fail(function() {

				})
				.always(function() {
					$mainContainer.spin(false);
				});						

			$mainContainer.delegate('.js-mark-complete', 'click', function(e) {
				var $target = $(e.target),
					$containerCompleted = $('.js-container-completed-actions'),
					childName = $('.js-children-tabs li.active a').text(),
					$actionBox = $target.parents('.js-container-actions'),
					action = $actionBox.find('.js-action-name').text(),
					$note = $actionBox.find('.js-action-note');

				$containerCompleted.append(tplCT.apply({
					child: childName,
					action: action,
					time: moment().format('lll'),
					'isNote?': $note.val().length === 0 ? false : true,
					note: $note.val()
				}));
			});

			$mainContainer.delegate('.js-edit-completed-action', 'click', function(e) {
				var $target = $(e.target),
					$completedAction = $target.parents('.js-container-completed-action'),
					$note = $completedAction.find('.js-container-completed-action-note'),
					$time = $completedAction.find('.js-container-completed-action-time');

				// FIXME: This needs to be moved
				$completedAction.find('.date').datetimepicker();

				$note
					.find('.js-completed-action-note-text').addClass('hidden')
					.end()
					.find('.js-completed-action-note-input').removeClass('hidden');

				$time
					.find('.js-completed-action-time-text').addClass('hidden')
					.end()
					.find('.js-completed-action-time-input').removeClass('hidden');

				$completedAction.find('.js-edit-completed-action-done')
					.removeClass('hidden')
					.on('click', function(e) {
						$(this).addClass('hidden').off();

						// TODO: Save edited data to Database
						$note
							.find('.js-completed-action-note-text').removeClass('hidden')
							.end()
							.find('.js-completed-action-note-input').addClass('hidden');

						$time
							.find('.js-completed-action-time-text').removeClass('hidden')
							.end()
							.find('.js-completed-action-time-input').addClass('hidden');
					});
			});			
		});
	}).exit(function() {
		// Exit from route
		$('#main').spin(false);
		$('#main').off().empty();
	});
});
