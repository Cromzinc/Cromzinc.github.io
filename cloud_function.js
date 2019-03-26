/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  let authToken;
  var request = require('request-promise');
  // Set the headers
  let headers = {
    'accept-encoding': 'gzip',
    'accept-language': 'en-us',
    'content-encoding': 'deflate',
    'Content-Type': 'application/json',
    'user-agent': 'GrubHub/7.2 (iPod touch; iOS 10.2)',
    'vary': 'Accept-Encoding',
    'x-px-authorization': '1',
    'bundleid': 'com.apple.AdSheet',
    'device': 'iPod7,1',
    'os_version': 'iOS 10.2',
    'storefront': '143441-1,29'
  };
  // Configure the request
  let options = {
    url: 'https://api-gtm.grubhub.com/auth',
    method: 'POST',
    headers: headers,
    json: { "brand": "GRUBHUB", "scope": "anonymous", "client_id": "ghiphone_Vkuxbs6t0f4SZjTOW42Y52z1itJ7Li0Tw3FEcboT" }
  };

  // Start the request
  request(options).then((response) => {
    authToken = response.session_handle["access_token"];
  }).then(()=>{

  if (req.query.geo) {
    let pageSize = req.query.searchCount;
    let radius = req.query.searchRadius;
    // Set the headers
    let headers = {
      'authorization': 'Bearer ' + authToken
    }
    // Configure the request
  let options = {
    url: 'http://api-gtm.grubhub.com/restaurants/search?location='+ req.query.geo + '&queryText=' + req.query.search + '&pageNum=1&pageSize=' + pageSize + '&radius=' + radius,
    headers: headers,
    gzip: true,
    json: true
  }

    // Start the request
    request(options).then((response) => {
      res.status(200).send(response.search_result.results);
    })


  } else if (req.query.rest_id) {
        let headers = {
      'authorization': 'Bearer ' + authToken
    }
    // Configure the request
  let options = {
    url: 'http://api-gtm.grubhub.com/restaurants/'+ req.query.rest_id,
    headers: headers,
    gzip: true,
    json: true
  }
    // Start the request
    request(options).then((response) => {
      res.status(200).send(response);
    })
  
  } else {
    res.status(200).send("not found");
  }
})
};