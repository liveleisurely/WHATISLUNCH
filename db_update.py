import pandas as pd
import pymysql
from api_config import googleAPI

def connect():
    return pymysql.connect(host="127.0.0.1", user="root", password="1234", db="lunch")

def fetch_restaurant_data():
    conn = connect()
    sql = "SELECT id, name, address, lat, lon, dist FROM restaurants"
    df = pd.read_sql(sql, conn)
    conn.close()
    return df

# 데이터 가져오기
data = fetch_restaurant_data()

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import requests
from math import radians, cos, sin, asin, sqrt

API_KEY = googleAPI
company_lat = 37.559518
company_lon = 126.9479577

def get_coordinates(address):
    url = 'https://maps.googleapis.com/maps/api/geocode/json'
    params = {
        'address': address,
        'key': API_KEY
    }
    response = requests.get(url, params=params)
    results = response.json().get('results')
    if results:
        location = results[0].get('geometry').get('location')
        return location.get('lat'), location.get('lng')
    return None, None

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # 지구 반지름 (km)
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    distance_km = R * c
    distance_m = int(distance_km * 1000)  # 미터 단위로 변환하고 정수로 변환
    return distance_m

# 웹 드라이버 설정
options = webdriver.ChromeOptions()
options.add_argument('--headless')  # 브라우저를 열지 않고 실행
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=options)

# 카카오 지도 접속
driver.get('https://map.kakao.com/')

for index, row in data.iterrows():
    if pd.isnull(row['address']):
        shop_name = row['name']
        try:
            # 카카오 지도 접속
            driver.get('https://map.kakao.com/')

            # 검색어 입력란 찾기 및 초기화
            search_box = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '#search\\.keyword\\.query'))
            )
            search_box.clear()  # 입력란 완전히 초기화
            search_box.send_keys(shop_name)
            search_box.send_keys(Keys.RETURN)

            # 검색 결과 로딩 대기 및 도로명 주소 추출
            road_address_element = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '#info\\.search\\.place\\.list > li.PlaceItem > div.info_item > div.addr > p:nth-child(1)'))
            )
            road_address = road_address_element.text
            
            # 결과 저장
            data.at[index, 'address'] = road_address
            
            # 위도와 경도 계산 및 저장
            latitude, longitude = get_coordinates(road_address)
            data.at[index, 'lat'] = latitude
            data.at[index, 'lon'] = longitude
            
            # 거리 계산 및 저장
            if latitude and longitude:
                distance = haversine(company_lat, company_lon, latitude, longitude)
                data.at[index, 'dist'] = distance
            
            print(f'가게 이름: {shop_name}, 도로명 주소: {road_address}, 위도: {latitude}, 경도: {longitude}') 
            
            # 페이지 새로고침 (모든 검색을 처음부터 다시 시작)
            driver.get('https://map.kakao.com/')
            
        except Exception as e:
            print(f'{shop_name}의 주소를 가져오는 중 오류 발생: {e}')

driver.quit()

def update_restaurant_data(data):
    conn = connect()
    cur = conn.cursor()
    
    try:
        for index, row in data.iterrows():
            sql = f"""
            UPDATE restaurants
            SET address = '{row['address']}', lat = {row['lat']}, lon = {row['lon']}, dist = {row['dist']}
            WHERE id = {row['id']}
            """
            cur.execute(sql)
        conn.commit()
    except Exception as e:
        print(e)
        conn.rollback()
    finally:
        conn.close()

# 업데이트된 데이터 DB에 반영
update_restaurant_data(data)