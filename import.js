
async function grubSearch() {
    let searchValue = document.getElementById('optional-input').value;
    let searchRadius = localStorage.getItem('searchRadius') || "10";
    let searchCount = localStorage.getItem('searchCount') || "5";
    removeRows();
    message(false);
    const position = await this.requestLocation();
    let geoLoc = "Point(" + position.coords.longitude + "+" + position.coords.latitude + ")";
    console.log(geoLoc);

    let url = 'https://us-central1-optical-psyche-137823.cloudfunctions.net/function-1?search=' + searchValue + '&geo=' + geoLoc + '&searchRadius=' + searchRadius + '&searchCount=' + searchCount;

    spinner(true);

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (j) {
        spinner(false);
        console.log(j);
        addRow(j);
    })
}

function spinner(toggle){
    let spinner = document.getElementById("spinner");
    toggle ? spinner.style.display = "inline-block" : spinner.style.display = "none";
}

function message(toggle, message){
    let messageElement = document.getElementById("message");
    toggle ? messageElement.innerText = message : messageElement.innerText = "";
    toggle ? messageElement.style.display = "block" : messageElement.style.display = "none";
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
    grid_parent.style.display = "none";
    while (grid_parent.firstChild) {
        grid_parent.removeChild(grid_parent.firstChild);
    }
}

function addRow(name) {
    let noResults = document.getElementById("noResults");
    let noAuth = document.getElementById("noAuth");
    let importResponseMsg = document.getElementById("importResponseMsg");

    importResponseMsg ? Search.removeChild(importResponseMsg) : null;
    noResults ? Search.removeChild(noResults) : null;
    noAuth ? Search.removeChild(noAuth) : null;

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
            message(true, "No results found.");
        }
    }
}

function getRestaurentMenu(id) {
    removeRows();
    
    let url = 'https://us-central1-optical-psyche-137823.cloudfunctions.net/function-1?rest_id=' + id;

    if(localStorage.getItem("authToken")){
        spinner(true);
        fetch(url).then(function (response) {
            return response.json();
        }).then(function (j) {
            postMenu(j);
            console.log(j);
        })
    } else{
        message(true, "You must enter an auth token to import menu.");
    }

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
        }).then(res => {
            removeRows();
            spinner(false);
            if (res.ok) {
                message(true, "Menu items successfully imported!");
            } else {
                message(true, "Importing menu items failed :(");
            }
          })
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
    authToken ? localStorage.setItem('authToken', authToken) : localStorage.removeItem('authToken');

    let searchRadius = document.getElementById('searchRadius').value;
    searchRadius ? localStorage.setItem('searchRadius', searchRadius) : localStorage.removeItem('searchRadius');

    let searchCount = document.getElementById('searchCount').value;
    searchCount ? localStorage.setItem('searchCount', searchCount) : localStorage.removeItem('searchCount');
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

    let searchRadius = localStorage.getItem('searchRadius');
    document.getElementById('searchRadius').value = searchRadius;

    let searchCount = localStorage.getItem('searchCount');
    document.getElementById('searchCount').value = searchCount;


}


