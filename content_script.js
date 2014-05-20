var search_site;
var pos;
var search_words;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
	if (request.salutation == "time to search") {
		$(document).ready(function(){
			search_site = request.site;			
			pos = request.pos;			
			if (pos == (0 || 1))
			{				
				search_words = $('meta[itemprop=description]').attr("content");
			}
			else if (pos == 2)
			{				
				search_words = $('meta[name=keywords]').attr("content");				
			}
			else if (pos == 3)
			{				
				search_words = $('meta[name=Description]').attr("content");
			}
			else
			{				
				search_words = $('meta[name=description]').attr("content");
			}		
			sendResponse({shoutback: search_words});	
		});
	}
});
