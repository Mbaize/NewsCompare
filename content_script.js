var search_words;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
	if (request.salutation == "time to search") {
		$(document).ready(function(){
			
			if ($('meta[name=keywords]').attr("content"))
			{
				search_words = $('meta[name=keywords]').attr("content");
			}
			else if ($('meta[itemprop=description]').attr("content"))
			{	
				search_words = $('meta[itemprop=description]').attr("content");
			}
			else if ($('meta[name=description]').attr("content"))
			{
				search_words = $('meta[name=description]').attr("content");
			}	
			else if ($('meta[name=Description]').attr("content"))
			{
				search_words = $('meta[name=Description]').attr("content");
			}		
			else 
			{
				search_words = "Site isn't currently supported. Please manually enter your search.";
			}					
					
			sendResponse({shoutback: search_words});	
		});
	}
});
