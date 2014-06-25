var id;
var selected_button;
var tabUrl;
var lastTabId = -1;
var article_site;
var supported_sites = [
	{site: "www.cnn.com", srch_str: "http://cnn.com/search/?query="}, 
	{site: "www.nytimes.com", srch_str: "http://query.nytimes.com/search/sitesearch/?action=click&contentCollection=Europe&region=TopBar&WT.nav=searchWidget&module=SearchSubmit&pgtype=article#/"},
	{site: "www.foxnews.com", srch_str: "http://www.foxnews.com/search-results/search?q="},	
	{site: "www.bbc.com", srch_str: "http://www.bbc.co.uk/search/news/?q="}, 
	{site: "www.newsmax.com", srch_str: "http://www.newsmax.com/search/?cx=011533900540746215761%3A-adksucby_s&cof=FORID%3A9&ie=UTF-8&hl=en&sitesearch=&q="},
	{site: "www.america.aljazeera.com", srch_str: "http://america.aljazeera.com/search.html?q="}, //may need to use the google site restricted to aljazeera's page'
	{site: "www.huffingtonpost.com", srch_str: "https://www.google.com/search?q=www.huffingtonpost.com+"},//the search results page doesn't seem to be working, it may need to be left off the search possibilities (but not the supported_sites)
	{site: "www.dailymail.co.uk", srch_str: "http://www.dailymail.co.uk/home/search.html?sel=site&searchPhrase="},
	{site: "www.npr.org", srch_str: "http://www.npr.org/templates/search/index.php?searchinput="},
	{site: "www.washingtonpost.com", srch_str: "http://www.washingtonpost.com/newssearch/search.html?st="},
	{site: "www.theonion.com", srch_str: "http://www.theonion.com/search/?q="}
	];

	
function parseURL(url) { //parses a URL, enabling access to individual elements of it (e.g. host), borrowed from http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
} 

function openSearch(id) {	//opens new tab of the search page for the corresponding news site whose button is clicked, with the search words automatically inserted
	var index = supported_sites.map(function(e) { return e.site; }).indexOf(id);	
	var query = supported_sites[index].srch_str;
	var box_text = document.getElementById("search_box").value;
	var search_url = query.concat(box_text);
	
	chrome.storage.sync.set({'storage1': tabUrl}, function() { //preparing to store URL in storage2 if not already in storage2
														//article URLs go in storage1 only if basis for search
			chrome.storage.sync.set({'storage2': search_url});								
    });
	chrome.tabs.create({url: search_url});	
	}
	
function openSubmit(){ //opens newscompare.net's "submit" page and automatically inserts that two most recent news story URLs into the proper fields
	chrome.storage.sync.get(null, function(result){		
		chrome.tabs.create({url: "http://www.newscompare.net/submit.php" + "#link_field1=" + result['storage1'] + "&link_field2=" + result['storage2'] });
	});
}	


function sendMessage(article_site) { //function determines the URL of the users current tab, sends it to content script which searches page DOM for article description 
									 //which is then sent back, the function lastly inputs the description into the search box
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		lastTabId = tabs[0].id; //since only one active tab in current window, the array of URLs will only have 1 element
	
		chrome.tabs.sendMessage(lastTabId, {salutation: "time to search"}, function (responseCallback) { //
           
			document.getElementById('search_box').value=responseCallback.shoutback;
		});
	});
}

	
chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {//move this up top so the code is consistent with the ordering of the execution of the program
	//since only one tab should be active and in the current window at once
	//the return variable should only have one entry

	tabUrl = arrayOfTabs[0].url; 	
	
	chrome.storage.sync.get(null, function(data) { //preparing to store URL in storage2 if not already in storage2
														//article URLs go in storage1 only if basis for search
		if (data['storage2'] != tabUrl) //check to see if current URL matches article2 URL			
		{	
			chrome.storage.sync.set({'storage2': tabUrl}, function() {			
				document.getElementById('first_article').value=data['storage1'];
				document.getElementById('second_article').value=tabUrl;				
			});
		}
		else
		{
			document.getElementById('first_article').value=data['storage1'];
			document.getElementById('second_article').value=data['storage2'];
		}
		document.getElementById('first_article').readOnly = true;
		document.getElementById('second_article').readOnly = true;
    });

	var parsed_result = parseURL(tabUrl);
	article_site = parsed_result.host;	
	sendMessage(article_site);	
	
	//document.getElementById('search_box').value="Site isn't currently supported. Please manually enter your search.";
	
	
		
});


	

$('button[id="newscompare_button"]').click(function(event) { //opens newscompare.net's "submit" page		
        openSubmit();
    });


$('button[type="button"]').click(function(event) {		//opens search of the website whose button is clicked
        openSearch($(this).attr('id'));
		
});
	

