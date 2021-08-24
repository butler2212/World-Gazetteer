//Preloader
$(window).on('load', function () {    
    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    }});

//Set up global variables.
var  bounds, 
     capitalMarker,
     countryCode,
     geoJSONLayer, 
     globalMap = L.map('globalMap').setView([53.800755, -1.549077], 6),
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        tiles = L.tileLayer(tileURL, {attribution})
        tiles.addTo(globalMap),
    globalMap.setMinZoom(3),
    hotelLayer = L.markerClusterGroup(), 
    landmarkLayer = L.markerClusterGroup(),
    latitude = 0.0,
    longitude = 0.0, 
    searchCount = 0;

//Set up icons.
var capIcon = L.ExtraMarkers.icon({
    icon: 'fas fa-angle-double-down',
    markerColor: 'red',
    shape: 'circle',
    prefix: 'fa',
    zIndexOffset: 1000
});

var landmarkIcon = L.ExtraMarkers.icon({
    icon: 'fas fa-monument',
    markerColor: 'cyan',
    shape: 'penta',
    prefix: 'fa',
});

var hotelIcon = L.ExtraMarkers.icon({
    icon: 'fas fa-hotel',
    markerColor: 'green-dark',
    shape: 'square',
    prefix: 'fa',
});

//Set up boundaries. 
function polyStyle(feature) {
    return {
        fillColor: '#0F625A',
        weight: 2,
        opacity: 0.6,
        color: 'black',  //Outline color
        fillOpacity: 0.3,
    };
}

//Fill in Data
function fillSelect(result) {
    if (result.data.countryList) {
        $('#countrySelect').html('');
        $.each(result.data.countryList, function(index) {
            $('#countrySelect').append($("<option>", {
                value: result.data.countryList[index].code,
                text: result.data.countryList[index].name
            })); 
        });
    }
}

$(document).ready(function(){
    fillSelect;

    $.ajax({
        type: 'POST',
        url: 'include/php/countrySelect.php',
        dataType: 'json',
        success: function(result){
            $('#countrySelect').html('');

            $.each(result.data, function(index) {
            
                $('#countrySelect').append($("<option>", {
                    value: result.data[index].code,
                    text: result.data[index].name
                }));
            
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            console.log(textStatus, errorThrown);
     }
    });
})

/*Get location of user. */
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError, {timeout:5000});
    }
  }

function locationSuccess(pos) {

    $.ajax({
        url: "include/php/getCountryCode.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
        },
        success: function(result) {

            console.log(result);
             countryCode= result.data.countryCode;

            if (result.status.name == "ok") {
                $('#countrySelect').val(countryCode).change();
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            console.log(textStatus, errorThrown);
        }
    }); 
}

function locationError(err) {
    countryCode = 'GB';
    updateSelect(countryCode);
    onSelectChange(countryCode);
}


$(document).ready(function(){
    getLocation();
})

//Update select value.
function updateSelect(countryCode) {
    $('#countrySelect').val(countryCode);
}

//On change of select, get border coords and pan to the area. 
$('#countrySelect').change(function() {
    onSelectChange(countryCode);
});

function onSelectChange(countryCode) {
  function removeLandmarks() {
    if (globalMap.hasLayer(landmarkLayer)) {
        globalMap.removeLayer(landmarkLayer);
     }   
}

function removeHotels() {
    if (globalMap.hasLayer(hotelLayer)) {
        globalMap.removeLayer(hotelLayer);
     }   
}
    getInfo(countryCode);
    $.ajax({
        url: "include/php/getCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        data: {
            countryCode: countryCode,
        },
        success: function(result) {
          if (result.status.name == "ok") {
          let countryCoordsJSON = result['data'];
          geoJSONLayer = L.geoJSON(countryCoordsJSON, {style: polyStyle});
          geoJSONLayer.addTo(globalMap);
          globalMap.fitBounds(geoJSONLayer.getBounds());
          $("#dataDisplay").hide();
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            console.log(textStatus, errorThrown);
        }
    });
}

//Update select value with map click location.
globalMap.on('click', handleMapClick);

function handleMapClick(e) {
    let mapClickLat = e.latlng.lat;
    let mapClickLong = e.latlng.lng;
    $.ajax({
        url: "include/php/reverseGeocode.php",
        type: 'POST',
        dataType: 'json',
        data: {
            latitude: mapClickLat,
            longitude: mapClickLong 
        },
        success: function(result) {
          if (result.status.name == "ok") {
            countryCode = result.data[0].components["ISO_3166-1_alpha-2"];
            globalMap.removeLayer(geoJSONLayer); 
            updateSelect(countryCode);
            onSelectChange(countryCode);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            console.log(textStatus, errorThrown);
        }
    });
}


//Perform API calls to retrieve data. 
function getInfo(countryCode) {
    $.ajax({
        url: "include/php/getInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            countryCode: countryCode, 
            count: searchCount
        },
        success: function(result) {
            longitude = result.data.openCage.lnglat.lng;
            latitude = result.data.openCage.lnglat.lat;
            fillSelect(result);
            getLandmarks(result);
            getHotels(result);
            placeMarker(result);
            fillTitles(result);
            fillStats(result);
            fillWeather(result);
            fillPeople(result);
            fillCurrency(result);
            fillCovid(result);
            searchCount++;
        },
       error: (x,y,z)=> {console.log("Errrror", x,y,z)}
    });
}



function placeMarker(result) {
    let long = result.data.openCage.lnglat.lng;
    let lat = result.data.openCage.lnglat.lat;
    if (globalMap.hasLayer(capitalMarker)) {
        globalMap.removeLayer(capitalMarker);
     }            
    capitalMarker = L.marker([lat, long], {icon: capIcon});
    capitalMarker.bindPopup(result.data.restCountries.capitalCity).openPopup(); 
    globalMap.addLayer(capitalMarker);
}

function fillTitles(result) {
    let data = ['#countryName', '#capitalCity'];
    if (result.status.restCountries == '200') {
        $('#countryName').html(result.data.restCountries.name);
        $('#capitalCity').html(result.data.restCountries.capitalCity);
    }
    else {
        $.each(data, function(value) {
            $(value).html('');
          });
    }
}

function fillStats(result) {
    let data1 = ['#neighbourCountries', '#callingCode', '#flag'];
    if (result.status.restCountries == '200') {
        $('#neighbourCountries').html(result.data.restCountries.borders.join(", "));
        $('#callingCode').html(result.data.restCountries.callingCodes);
        $('#flag').attr("src", result.data.restCountries.flag);
    }
    else {
        $.each(data1, function(value) {
            $(value).html('');
          });
    }
    let data2 = ['#timeZone', '#driving', '#currentTime', '#sunrise', '#sunset']
    if (result.status.openCage == '200') {
        $('#timeZone').html(result.data.openCage.timezone.short_name);
        $('#driving').html(result.data.openCage.driveOn['drive_on']);
        let offset = result.data.openCage.timezone.offset_sec;
        let currentTime = getLocalTime(offset);
        $('#currentTime').html(currentTime);
        let sunrise = correctTimestamp(result.data.openCage.sun.rise.apparent, offset); 
        let sunset = correctTimestamp(result.data.openCage.sun.set.apparent, offset);
        $('#sunrise').html(sunrise);
        $('#sunset').html(sunset);
    }
    else {
        $.each(data2, function(value) {
            $(value).html('');
          });
    }
}

function fillWeather(result) {
    let data = ['#weatherDesc', '#temp', '#feelsLike', '#humidity', '#windSpeed', '#weatherSymbol'];
    if (result.status.openWeather == '200') {
        $('#weatherDesc').html(result.data.openWeather.weather.description);
        $('#temp').html(result.data.openWeather.temp.temp);
        $('#feelsLike').html(result.data.openWeather.temp.feels_like);
        $('#humidity').html(result.data.openWeather.temp.humidity);
        $('#windSpeed').html(result.data.openWeather.wind);
        $('#weatherSymbol').attr("src", 'http://openweathermap.org/img/wn/' + result.data.openWeather.weather.icon +'@2x.png');
    }
    else {
        $.each(data, function(value) {
            $(value).html('');
          });
    }
}

function fillPeople(result) {
    let data1 = ['#population', '#language'];
    if (result.status.restCountries == '200') {
        $('#population').html(result.data.restCountries.population.toLocaleString('en-UK'));
        $('#language').html(result.data.restCountries.languages[0].name);
    }
    else {
        $.each(data1, function(value) {
            $(value).html('');
          });
    }
   
    let data2 = ['#wiki1', '#wiki2', '#wiki3'];
    if (result.status.wiki == '200') {
        $('#wiki1').html(result.data.wiki[0].title);
        $('#wiki1').attr('href', 'http://' + result.data.wiki[0].wikipediaUrl);
        $('#wiki2').html(result.data.wiki[1].title);
        $('#wiki2').attr('href', 'http://' + result.data.wiki[1].wikipediaUrl);
        $('#wiki3').html(result.data.wiki[2].title);
        $('#wiki3').attr('href', 'http://' + result.data.wiki[2].wikipediaUrl);
    }
    else {
        $.each(data2, function(value) {
            $(value).html('');
          });
    }
    if (result.status.imgur.link) {
        $('#imgurImg').attr("src", result.data.imgur.link);
    }
    else {
        $('#imgurImg').attr("src", '');
    }
}

function fillCurrency(result) {
    let data = ['#currency', '#currCode', '#currSymbol', '#currSymbol2'];
    if (result.status.restCountries == '200') {
        $('#currency').html(result.data.restCountries.currencies[0].name);
        $('#currCode').html(result.data.restCountries.currencies[0].code);
        $('#currSymbol').html(result.data.restCountries.currencies[0].symbol);
        $('#currSymbol2').html(result.data.restCountries.currencies[0].symbol);
    }
    else {
        $.each(data, function(value) {
            $(value).html('');
          });
    }
    if (result.status.exchangeRate == '200') {
        $('#exchangeRate').html(result.data.exchangeRate.result.toFixed(2));
    }
    else {
        $('#exchangeRate').html('');
    }
}

function fillCovid(result) {
    let data1 = ['#totalCases', '#recovered', '#deaths', '#percDeaths'];
    let data2 = ['#popAffected', '#population2'];
    if (result.status.covid == '200') {
        let recovered = result.data.covid[0].recovered / result.data.covid[0].confirmed * 100;
        recovered = recovered.toFixed(2);
        let dead = result.data.covid[0].deaths / result.data.covid[0].confirmed * 100;
        dead = dead.toFixed(2);
        $('#totalCases').html(result.data.covid[0].confirmed.toLocaleString('en-UK'));
        $('#recovered').html(result.data.covid[0].recovered.toLocaleString('en-UK'));
        $('#percRecovered').html(recovered);
        $('#deaths').html(result.data.covid[0].deaths.toLocaleString('en-UK'));
        $('#percDeaths').html(dead);
        if (result.status.restCountries == '200') {
            let affectedPop = result.data.covid[0].confirmed / result.data.restCountries.population * 100;
            affectedPop = affectedPop.toFixed(2);
            $('#popAffected').html(affectedPop);
            $('#population2').html(result.data.restCountries.population.toLocaleString('en-UK'));
        }
        else {
            $.each(data2, function(value) {
                $(value).html('');
              });
        }
    }
    else {
        $.each(data1, function(value) {
            $(value).html('');
          });
    }
}


//On click of landmark icon, perform API call and display landmark icons. 
function getLandmarks(result) {
    if (result.status.landMarks == "200") {
      let landmarksArr = [];
      let base = result.data.landMarks.items;
      for (let i=0; i<base.length; i++) {
          let landmark = L.marker(
              L.latLng(
                  parseFloat(base[i].position.lat),
                  parseFloat(base[i].position.lng)
              ),
                {icon: landmarkIcon}  
          )
          landmark.bindPopup(base[i].title + ', ' + base[i].categories[0].name).openPopup();
          landmarksArr.push(landmark);
      }
      landmarkLayer = L.markerClusterGroup();
      landmarkLayer.addTo(globalMap);
      let landmarks = L.featureGroup(landmarksArr);
      landmarks.addTo(landmarkLayer);
      }
}

//On click of hotel icon, perform API call and display hotel icons. 
function getHotels(result) {
    if (result.status.hotels == "200") {
      let hotelsArr = [];
      let base = result.data.hotels.items;
      for (let i=0; i<base.length; i++) {
          let hotel = L.marker(
              L.latLng(
                  parseFloat(base[i].position.lat),
                  parseFloat(base[i].position.lng)
              ),
                {icon: hotelIcon}  
          )
          hotel.bindPopup(base[i].title + ', ' + base[i].categories[0].name).openPopup();
          hotelsArr.push(hotel);
      }
      hotelLayer = L.markerClusterGroup();
      hotelLayer.addTo(globalMap);
      let hotels = L.featureGroup(hotelsArr);
      hotels.addTo(hotelLayer);
      }
}

//Computation Functions
function correctTimestamp(unix, offset) {
    let newUnix = unix + offset;
    let modDate = new Date(newUnix * 1000);
    let time = modDate.toLocaleTimeString('en-UK');
    return time;
}

function getLocalTime(offset) {
    let currentUnix = Math.floor(Date.now() / 1000);
    let newUnix = currentUnix + offset;
    let time = new Date(newUnix * 1000).toLocaleTimeString("en-UK");
    return time;
} 


//DOM Stuff.
$( "#close" ).click(function() {
    $("#dataDisplay").toggle();
    $("#info").css('animation', 'none');
});

$("#info").click(function() {
    $("#dataDisplay").toggle();
    $("#info").css('animation', 'none');
});
