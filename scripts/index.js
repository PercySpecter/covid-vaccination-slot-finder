/**
     * Return date in DD-MM-YYYY format
     */
 const formatDate = (date) => {
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const yyyy = date.getFullYear()
    const formattedDate = (dd < 10 ? "0"+dd : dd) + "-" + (mm < 10 ? "0"+mm : mm) + "-" + yyyy;
    return formattedDate;
};


/**
 * Add days to a date
 */
const addDaysToDate = (currentDate, days) => {
    let newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}


/**
 * API call for district id
 */
const queryDistrictId = async (stateId, district_name) => {
    // const stateId = state_id[state_name];
    let districtId = ""
    const queryUrl = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}/`;
    try {
        let districtQueryResult = await fetch(queryUrl, {
            method: 'GET',
            headers: {
            "Content-type": "application/json"
            }
        });
        let districtResponse = await districtQueryResult.json();
        let districtObj = districtResponse.districts.find(district => district.district_name == district_name);
        districtId = districtObj.district_id;

    } catch (e) {
        console.log(e);
    }
    
    console.log(stateId + " : " + districtId);
    
    return districtId; 
};


const getAvailableSlots = (centers) => {
    let slots = [];
    centers.forEach(center => {
        let sessions = [];
        center.sessions.forEach(session => {
            if (session.available_capacity > 0) {
                time_slots = [];
                session.slots.forEach((time_slot, index) => {
                    time_slots.push({"Slot Number": index, "Timing": time_slot});
                });
                const session_info = {
                    "Date": session.date,
                    "Available Capacity": session.available_capacity,
                    "Minimum Age Limit": session.min_age_limit,
                    "Vaccine": session.vaccine,
                    "Slots": time_slots
                };
                sessions.push(session_info);
            }
        });
        if (sessions.length > 0) {
                const center_info = {
                "Center Name": center.name,
                "Pincode": center.pincode,
                "Fees Type": center.fee_type,
                "Available Dates": sessions
            };
            slots.push(center_info);
        }
    });

    return slots;
};


/**
 * API call centers by district id and week start date
 */ 
const querySlots = async (districtId, startDate) => {
    let centers = null;
    const queryUrl = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${startDate}`;
    try {
        let districtQueryResult = await fetch(queryUrl, {
            method: 'GET',
            headers: {
            "Content-type": "application/json"
            }
        });
        let centerResponse = await districtQueryResult.json();
        centers = centerResponse.centers;

    } catch (e) {
        console.log(e);
    }
    
    const availableSlots = getAvailableSlots(centers);
    // console.log(queryUrl);
    
    return availableSlots; 
};


const displaySlots = async (districtId, startDate) => {
    document.getElementById("slots").innerHTML = "Please Wait...";

    const slots = await querySlots(districtId, formatDate(startDate));

    let container = document.getElementById("slots");
    let jsonGrid = new JSONGrid(slots, container);
    jsonGrid.render();

    // document.getElementById("slots").innerHTML = JSON.stringify(slots);
};


/**
 * API call for districts in the state
 */
 const populateDistricts = async (stateId) => {
    const queryUrl = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}/`;
    let districts = null;
    try {
        let districtQueryResult = await fetch(queryUrl, {
            method: 'GET',
            headers: {
            "Content-type": "application/json"
            }
        });
        let districtResponse = await districtQueryResult.json();
        districts = districtResponse.districts;

        let selectOptions = "";
        districts.forEach((district, index) => {
            selectOptions += `<option value=${district.district_id}${index==0 ? " selected" : ""}>${district.district_name}</option>` + "\n";
        });
        document.getElementById("district-list").innerHTML = selectOptions;

    } catch (e) {
        console.log(e);
    }
};


const initializeForm = async () => {
    let selectOptions = "";
    let isFirst = true;
    let firstStateId = "";
    for (let state in state_id) {
        if (isFirst) {
            firstStateId = state_id[state];
        }
        selectOptions += `<option value=${state_id[state]}${isFirst ? " selected" : ""}>${state}</option>` + "\n";
        isFirst = false;
    };
    document.getElementById("state-list").innerHTML = selectOptions;
    await populateDistricts(firstStateId);
};

/***************************************************************/


(async () => {
    initializeForm();

    let startDate = new Date();
    console.log(formatDate(startDate));

    let stateId = null;
    let districtId = null;

    // District Dropdown list
    let stateListElement = document.getElementById("state-list");
    stateListElement.addEventListener("change", async (e) => {
        await populateDistricts(stateListElement.value);
    });

    // Submit Button
    document.getElementById("query-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        stateId = document.getElementById("state-list").value;
        districtId = document.getElementById("district-list").value;
        startDate = new Date();

        await displaySlots(districtId, startDate);

        document.getElementById("week-navigator").style.display = "block";
        let weekTxt = formatDate(startDate) + " - " + formatDate(addDaysToDate(startDate, 7));
        document.getElementById("week").innerHTML = weekTxt;
    });

    // Previous Week Button
    document.getElementById("prev-week").addEventListener("click", async (e) => {
        startDate = addDaysToDate(startDate, -7);
        console.log(startDate);
        await displaySlots(districtId, startDate);
        let weekTxt = formatDate(startDate) + " - " + formatDate(addDaysToDate(startDate, 7));
        document.getElementById("week").innerHTML = weekTxt;
    });

    // Next Week Button
    document.getElementById("next-week").addEventListener("click", async (e) => {
        startDate = addDaysToDate(startDate, 7);
        console.log(startDate);
        await displaySlots(districtId, startDate);
        let weekTxt = formatDate(startDate) + " - " + formatDate(addDaysToDate(startDate, 7));
        document.getElementById("week").innerHTML = weekTxt;
    });
})();