var activeListElement;

$(document).ready(function(){
	//$(".info-page").hide();
	$(".sidebar-list")
		.mouseenter(function(){
			$(this).addClass("sidebar-list-hover");
		})
		.mouseleave(function(){
			$(this).removeClass("sidebar-list-hover");
		})
		.click(function(){
			var el = $(this);
			var pageID = el.attr("page-id");
			if(!el.hasClass("sidebar-list-active")) {
				if(activeListElement && activeListElement.hasClass("sidebar-list-active")) {
					activeListElement.removeClass("sidebar-list-active");
					if(activeListElement.attr("page-id")) {
						$("#"+activeListElement.attr("page-id")).slideUp("slow");
					}
				}
				activeListElement = el;
				el.addClass("sidebar-list-active");
				if(pageID) {
					$("#" + pageID).slideDown("slow");
				}
			} else {
				el.removeClass("sidebar-list-active");
				if(pageID) {
					$("#" + pageID).slideUp("slow");
				}
			}
		})
		.each(function() {
			var pageID = $(this).attr("page-id");
			if(!activeListElement && $(this).hasClass("sidebar-list-active") && pageID) {
				$("#" + pageID).show();
				activeListElement = $(this);
			}
		});
});