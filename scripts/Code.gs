function patch() {
  
  // set this to true to actually do the update as opposed to just reporing it
  var actuallyDoIt = false;
  
  // this is the site i'm working with
  var site = SitesApp.getSite("mcpher.com", "share");
  
  // get all the pages on the site
  var pages = getPages(site,2);
  
  // get all the pages that contain the search term in their html
  var searchRx = /0B92ExLh4POiZT081dWl6WjdwbFk/g;
  var workingPages = pages.reduce (function (p,c) {
    var html = c.getHtmlContent();
    Logger.log(html);
    // if its a target page then select it and avoid getting the html again later
    if (html.search (searchRx , html) >=0) {
      p.push ({html:html, page:c});
    }
    return p;
  },[]);
  
  
  //now we'll update these pages with the replacement value
  var replaceWith = "0B92ExLh4POiZb19Qc3hidFgzS2M";
  workingPages.forEach (function (d,i) {
    Logger.log (""+i+" "+(actuallyDoIt ? "updating " : "would have updated ") + d.page.getUrl());
    if (actuallyDoIt) {
      d.page.setHtmlContent ( d.html.replace (searchRx, replaceWith) );
    }
  });
  
}

/**
 * get all the pages on my site - into a heirach object
 * @param {Site} site the site
 * @param {number} optMax max number of pages to go for
 * @param {string} optQuery a search query (unfortunately this doesnt search html)
 * @param {number} optStart you can start later - useful for restarting if you run out of execution time
 * @return {Array.Page} all the pages on the site
 **/
function getPages(site,optMax,optQuery,optStart) {
  
  var chunk,pages = [], options = {};
  do {
    options.start= pages.length + (optStart || 0);
    if (optMax) options.max =  optMax - pages.length ;
    if (optQuery) options.search = optQuery;
    chunk = cUseful.rateLimitExpBackoff( function (){
      return site.getAllDescendants(options);
    });
    cUseful.arrayAppend(pages, chunk);
  }
  while (chunk.length && (!optMax || pages.length < optMax));
  
  return pages;
}  