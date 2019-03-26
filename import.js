
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
        let authToken = localStorage.getItem("authToken");
        formData.append("restaurants", JSON.stringify(data));
        fetch(url, {
            method: 'PUT',
            body: formData, // data can be `string` or {object}!
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': 'Bearer ' + authToken
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

function setLocalStorage() {
    let authToken = document.getElementById('authToken').value;
    if (authToken) {
        localStorage.setItem('authToken', authToken);
    }
}

function getLocalStorage(key) {
    let authToken = localStorage.getItem("authToken");
    if (key == "authToken") {
        return authToken;
    }
}

window.onload = function () {
    const input = document.getElementById("optional-input");
    input.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            document.getElementById("searchButton").click();
        }
    });

    let authToken = localStorage.getItem('authToken');
    document.getElementById('authToken').value = authToken;

    // if (authToken) {
    // }

}


