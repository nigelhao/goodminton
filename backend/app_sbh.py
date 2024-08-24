import json
from bs4 import BeautifulSoup
import requests
from datetime import datetime, timedelta

facilities = [
    {"id": 2965, "name": "Sims Singapore Badminton Hall"},
    {"id": 2967, "name": "Expo Singapore Badminton Hall"},
]


def format_sbh_url(facility_id: int, date: datetime) -> str:
    date_str = date.strftime("%Y/%m/%d")
    return f"https://singaporebadmintonhall.getomnify.com/welcome/loadSlotsByTagId?date={date_str}&facilitytag_id={facility_id}&timezone=Asia%2FSingapore"


def parse_html_to_slots(html_content):
    soup = BeautifulSoup(html_content, "html.parser")

    # Get the date from the context (assuming it's July 20, 2024)
    date = datetime(2024, 7, 20)

    slots = {}

    for facility_row in soup.find_all("div", class_="week-column facility-row"):
        facility_name = facility_row.find(
            "div", class_="week-column-header facility"
        ).text.strip()
        facility_slots = []

        for slot in facility_row.find_all("div", class_="time-slot facility-slot"):
            start_time = slot["data-starttime"]
            end_time = slot["data-endtime"]

            start_datetime = date.replace(
                hour=int(start_time.split(":")[0]),
                minute=int(start_time.split(":")[1][:2]),
            )
            end_datetime = date.replace(
                hour=int(end_time.split(":")[0]), minute=int(end_time.split(":")[1][:2])
            )

            if start_time.endswith("PM") and start_datetime.hour != 12:
                start_datetime += timedelta(hours=12)
            if end_time.endswith("PM") and end_datetime.hour != 12:
                end_datetime += timedelta(hours=12)

            facility_slots.append(
                {
                    "time": f"{start_time} - {end_time}",
                    "start": start_datetime.strftime("%Y-%m-%dT%H:%M"),
                    "end": end_datetime.strftime("%Y-%m-%dT%H:%M"),
                }
            )

        if facility_slots:
            slots[facility_name] = facility_slots

    return slots


def format_output(slots):
    return [{"location": "Singapore Badminton Hall", "slots": slots}]


results = []

for facility in facilities:
    url = format_sbh_url(facility.get("id"), datetime(2024, 7, 26))
    response = requests.get(url)

    if response.status_code == 200:
        try:
            parsed_slots = parse_html_to_slots(response.text)
            formatted_output = format_output(parsed_slots)
            results.append(formatted_output)
        except requests.exceptions.JSONDecodeError:
            print("Response is not valid JSON")
            print("Raw response:", response.text)
    else:
        print("Request failed with status code:", response.status_code)


print(results)
