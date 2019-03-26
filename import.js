
async function grubSearch() {
    let searchValue = document.getElementById('optional-input').value;
    removeRows();
    const position = await this.requestLocation();
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
    let geoLoc = "Point(" + position.coords.longitude + "+" + position.coords.latitude + ")";
    console.log(geoLoc);

    let url = 'https://us-central1-optical-psyche-137823.cloudfunctions.net/function-1?search=' + searchValue + '&geo=' + geoLoc;

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (j) {
        console.log(j);
        addRow(j);
    })
}

function requestLocation() {
    var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };
    return new Promise(function (resolve, reject, options) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function removeRows() {
    while (grid_parent.firstChild) {
        grid_parent.removeChild(grid_parent.firstChild);
    }
}

function addRow(name) {
    let noResults = document.getElementById("noResults");
    noResults ? container.removeChild(noResults) : null;
    if (name.length > 0) {
        name.forEach(item => {
            var div = document.createElement('div');
            div.className = 'row';
            div.innerHTML = item.name;

            document.getElementById('grid_parent').appendChild(div).setAttribute('onclick', `getRestaurentMenu(${item.restaurant_id})`);
        });
        document.getElementById('grid_parent').style.display = "block"
    } else {
        if (!container.noResults) {
            var div = document.createElement('h1');
            div.innerText = "No results found.";
            document.getElementById('container').appendChild(div).setAttribute('id', 'noResults');
        }
    }
}

function getRestaurentMenu(id) {
    let url = 'https://us-central1-optical-psyche-137823.cloudfunctions.net/function-1?rest_id=' + id;
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (j) {
        postMenu(j);
        console.log(j);
    })
}

function postMenu(restaurant) {
    let restName = restaurant.restaurant.name;
    let restCity = restaurant.restaurant.address.locality;
    let restState = restaurant.restaurant.address.region;
    let restStreet = restaurant.restaurant.address.street_address;
    let date = new Date().toISOString();

    let restData = [
        {
            "Id": -1,
            "Name": restName,
            "Street": restStreet,
            "City": restCity,
            "State": restState,
            "Items": []
        }
    ];

    var makeRequest;

    makeRequest = function (data) {
        const url = 'https://efeed.azurewebsites.net/api/restaurant/';
        let formData = new FormData();
        formData.append("restaurants", JSON.stringify(data));
        fetch(url, {
            method: 'PUT',
            body: formData, // data can be `string` or {object}!
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1qazRSVVZEUmtaR01EVkdPRGsxTVVZMFJURTFSakJHTWpJM09FSTVOemt6TURNMU1qSXdRZyJ9.eyJpc3MiOiJodHRwczovL2ZlZWRtZS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTI4MzIxNDA4MDk3MzgxNTEzMDkiLCJhdWQiOlsiaHR0cHM6Ly9lZmVlZC5henVyZXdlYnNpdGVzLm5ldCIsImh0dHBzOi8vZmVlZG1lLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1NTM1NDM0NDQsImV4cCI6MTU1MzYyOTg0NCwiYXpwIjoicjJGcWNONndPbmljSm00UlZHVFBKckptUEdoTjFTTlAiLCJzY29wZSI6Im9wZW5pZCBlbWFpbCBvZmZsaW5lX2FjY2VzcyJ9.hAVJ1DCNIVA9FDE6tqf0eN2MtYXZInh8KzN-RiqvKV2-M0tYqQiZ7gzUk5gKBGDpVDWp7IhYTB1mbdhmoKNqR-WWHpVF5-Ro1y8uB82CWyfBBmeOyTM8n4sG7Yb_arNDTMJBDXVye48JOoB8i4Va1MfPSZnx6g1Au5EsP6BxSKbgkKdAP-IG30YjB6ByvmZXEIQxgF1UIKvyDUMwxYiiXOunO27m5XDo1fdC8SNXdlfKcMp6BoSJ66GIw_vlOdKtR-f6AXy2Zj9b773N0cva97uE_T3kPIv8X7xPYJ9LliRlPmG9u_MDsuA3yQuW1HHcadzZCMvYcQa4tZOUlkm0cA'
            }
        });
    };

    restaurant.restaurant.menu_category_list.forEach(category_list => {
        category_list.menu_item_list.forEach(menuItem => {
            let menuData =
            {
                "Id": -1,
                "Name": menuItem.name,
                "Category": menuItem.menu_category_name,
                "CreatedOn": date
            };
            restData[0].Items.push(menuData);
        })
    })
    console.log(restData);
    makeRequest(restData);
}


function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

