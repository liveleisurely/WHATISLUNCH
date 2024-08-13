import requests
import pymysql
from typing import List
import time

from api_config import naver_client, naver_secret

NAVER_MAPS_CLIENT_ID = naver_client
NAVER_MAPS_CLIENT_SECRET = naver_secret

def connect():
    return pymysql.connect(
        host="127.0.0.1", 
        user="root", 
        password="1234", 
        db="lunch", 
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def select(sql: str) -> List[dict]:
    conn = connect()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

def insert(sql: List[str]):
    conn = connect()
    try:
        with conn.cursor() as cursor:
            for _sql in sql:
                cursor.execute(_sql)
        conn.commit()
    except Exception as e:
        print(e)
        conn.rollback()
    finally:
        conn.close()

# url이 NULL인 가게 데이터 가져오기
def get_restaurant_data():
    return select("SELECT id, name FROM restaurants WHERE url IS NULL;")

def search_name_naver(name):
    url = f"https://openapi.naver.com/v1/search/local.json?query={name}&display=1"
    headers = {
        'X-Naver-Client-Id': NAVER_MAPS_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_MAPS_CLIENT_SECRET
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            return data['items'][0]['link']  # 네이버 지도 링크 반환
    else:
        print(f"Searching for {name}, Status Code: {response.status_code}")
    return None

def create_short_naver_url(long_url):
    url = "https://openapi.naver.com/v1/util/shorturl"
    headers = {
        'X-Naver-Client-Id': NAVER_MAPS_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_MAPS_CLIENT_SECRET,
        'Content-Type': 'plain/text'
    }
    params = {
        'url': long_url
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        return data['result']['url']
    else:
        print(f"Error creating short URL for {long_url}, Status Code: {response.status_code}")
    return None

def update_short_address(restaurant_id, short_address):
    update_sql = f"UPDATE restaurants SET url = '{short_address}' WHERE id = {restaurant_id}"
    insert([update_sql])

def update_restaurants_with_short_address():
    restaurants = get_restaurant_data()
    for restaurant in restaurants:
        restaurant_id, name = restaurant['id'], restaurant['name']
        naver_url = search_name_naver(name)
        if naver_url:
            short_url = create_short_naver_url(naver_url)
            if short_url:
                update_short_address(restaurant_id, short_url)
            else:
                print(f"Failed to create short URL for {name}")
        else:
            print(f"No result found for {name}")

if __name__ == "__main__":
    update_restaurants_with_short_address()