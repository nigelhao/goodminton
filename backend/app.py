import requests
import json
from datetime import datetime
import time


sbh_locations = [
    {"Expo": 2967},
    {"Sims": 2965},
]


def format_openpa_url(facility: str, date: datetime) -> str:
    date_str = date.strftime("%d/%m/%Y")
    formated_facility = facility.lower().replace(" ", "")
    return f"https://www.onepa.gov.sg/pacesapi/facilityavailability/GetFacilitySlots?selectedFacility={formated_facility}_BADMINTONCOURTS&selectedDate={date_str}"


def filter_openpa_available_slot(data):
    available_slots = {}

    try:
        # Check if data is a string (JSON)
        if isinstance(data, str):
            data = json.loads(data)

        # Handle case where data might be a list with one item
        if isinstance(data, list):
            data = data[0]

        # Navigate through the response structure
        response = data.get("response", {})
        resource_list = response.get("resourceList", [])

        for court in resource_list:
            court_name = court.get("resourceName", "Unknown")
            court_slots = []
            for slot in court.get("slotList", []):
                if slot.get("isAvailable", False):
                    court_slots.append(
                        {
                            "time": slot.get("timeRangeName", ""),
                            "start": slot.get("startTime", ""),
                            "end": slot.get("endTime", ""),
                        }
                    )
            if court_slots:
                available_slots[f"Court {court_name}"] = court_slots

        if not available_slots:
            return json.dumps(
                {"message": "No available slots found for the given date."}
            )
        else:
            return json.dumps(available_slots, indent=2)

    except Exception as e:
        return json.dumps(
            {"error": f"An error occurred while processing the data: {str(e)}"}
        )


def app():
    results = []
    for openpa_court in openpa_courts:
        url = format_openpa_url(openpa_court, datetime(2024, 7, 26))
        response = requests.get(url)

        if response.status_code == 200:
            try:
                data = response.json()
                results.append(
                    {
                        "location": openpa_court,
                        "slots": json.loads(filter_openpa_available_slot(data)),
                    }
                )
            except requests.exceptions.JSONDecodeError:
                print("Response is not valid JSON")
                print("Raw response:", response.text)
        else:
            print("Request failed with status code:", response.status_code)
        print("=" * 80)

        time.sleep(1)

    print(results)


if "__main__":
    app()
