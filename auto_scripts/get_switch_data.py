import requests
import json
import datetime
import pytz
import sys


def ns_get_access_token(client_id, session_token):
    session = requests.Session()

    body = (
        '{"client_id":"'
        + client_id
        + '","session_token":"'
        + session_token
        + '","grant_type":"urn:ietf:params:oauth:grant-type:jwt-bearer-session-token"}'
    )
    url = "https://accounts.nintendo.com/connect/1.0.0/api/token"

    r = session.post(url, headers={"Content-Type": "application/json"}, data=body)
    access_token = json.loads(r.text)

    return access_token


def ns_get_play_history(access_token, ua):
    session = requests.Session()

    url = "https://mypage-api.entry.nintendo.co.jp/api/v1/users/me/play_histories"
    header = {
        "Authorization": access_token["token_type"]
        + " "
        + access_token["access_token"],
        "User-Agent": ua,
    }
    r = session.get(url, headers=header)
    history = json.loads(r.text)

    return history


def convert_timezone_to_string(
    input_str, from_timezone, to_timezone, date_format="%Y-%m-%d"
):
    try:
        input_datetime = datetime.datetime.fromisoformat(input_str)

        input_timezone = pytz.timezone(from_timezone)

        target_timezone = pytz.timezone(to_timezone)

        converted_datetime = input_datetime.astimezone(target_timezone)

        converted_date_str = converted_datetime.strftime(date_format)

        return converted_date_str
    except Exception as e:
        return None


if __name__ == "__main__":
    client_id = "5c38e31cd085304b"
    ua = "com.nintendo.znej/1.13.0 (Android/7.1.2)"

    if len(sys.argv) != 2:
        print("Usage: python your_script.py <session_token>")
        sys.exit(1)

    session_token = sys.argv[1]

    settings = {
        "0100C2500FC20000": {"titleName": "斯普拉遁 3", "firstPlayedAt": "2023-10-01"},
        "0100F2C0115B6000": {"titleName": "塞尔达传说 王国之泪", "firstPlayedAt": "2023-09-21"},
    }

    play_histories = ns_get_play_history(
        ns_get_access_token(client_id, session_token), ua
    )["playHistories"]

    for play_history in play_histories:
        title_id = play_history["titleId"]
        if title_id in settings:
            play_history["titleName"] = settings[title_id]["titleName"]
            play_history["firstPlayedAt"] = settings[title_id]["firstPlayedAt"]

        play_history["lastPlayedAt"] = convert_timezone_to_string(
            play_history["lastPlayedAt"], "Asia/Tokyo", "Asia/Shanghai"
        )

        play_history["totalPlayedHours"] = play_history["totalPlayedMinutes"] // 60

    with open("./src/data/ns_data.json", "w") as ns_json_file:
        json.dump(play_histories, ns_json_file)
