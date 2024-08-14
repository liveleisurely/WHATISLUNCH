import uvicorn
from fastapi import FastAPI, Request, HTTPException, Body
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pymysql
from typing import List
import random
from api_config import dataAPI,openAPI
import openai
import os

app = FastAPI()

openai.api_key = openAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def connect():
    return pymysql.connect(host="127.0.0.1", user="root", password="1234", db="lunch")

def select(sql:str) -> List[List]:
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql)
    data = cur.fetchall()
    conn.close()
    return data

def insert(sql:List[str]):
    conn = connect()
    cur = conn.cursor()
    
    try:
        for _sql in sql:
            cur.execute(_sql)
        conn.commit()
    except Exception as e:
        print(e)
        conn.rollback()
    finally:
        conn.close()
        

def delete(sql: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(sql)
        conn.commit()
    except Exception as e:
        print(e)
        conn.rollback()
    finally:
        conn.close()

def authenticate_admin(api_key: str):
    # 간단한 API 키로 인증
    ADMIN_API_KEY = dataAPI  # 설정해 둔 API 키
    if api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")


def generate_gpt_response(prompt, restaurant_dict):
    # GPT에게 전달할 프롬프트를 구성
    formatted_restaurants = "\n".join(
        [f"{name}: {details['category']}, {details['distance']}m, {details['price_range']}, 메뉴: {details['menu']}" 
         for name, details in restaurant_dict.items()]
    )

    full_prompt = f"""
    Consider the following restaurants:
    {formatted_restaurants}
    Based on the user's request: '{prompt}', You're purpose is only to recommend the best restaurant.
    ANSWER LIKE THIS: "restaurant(menu, distance, price_range) and some reasons in your response in Korea within 200 words.
    ".
    """
    
    try:
        # 각 요청에 대해 독립적인 컨텍스트를 설정
        response = openai.ChatCompletion.create(
            #model="gpt-4",
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": 
                """
                 You are an AI assistant who recommends restaurants.
                 YOU SHOULD ANSWER WITH THIS FORMAT: 
                 "restaurant(menu, distance, price_range) reasons: "___"
                 From DB, call the information of restaurant and Fill ___ with recommendation reason.
                 Multiple recommendation is okay.
                 Please provide a clear answer without repeating the question.
                 """},
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.7,  # 텍스트 생성의 다양성을 위해 설정 (선택 사항)
            max_tokens=150,   # 응답의 최대 길이 설정 (필요 시 조정 가능)
            n=1,              # 한 번에 하나의 응답 생성
            stop=None         # 특정 조건에서 응답을 멈추게 하는 종료 토큰 없음
        )
        return response.choices[0].message['content'].strip()
    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail="Error with AI response generation.")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@app.delete("/api/stats/reset")
async def reset_stats(api_key: str):
    authenticate_admin(api_key)
    sql = "DELETE FROM recommend_log"
    delete(sql)
    return {"status": "success", "message": "All statistics have been reset"}

# 특정 날짜 데이터 리셋 엔드포인트
@app.delete("/api/stats/reset/today")
async def reset_today_stats(api_key: str):
    authenticate_admin(api_key)  # API 키로 인증 (이미 존재하는 함수 사용)
    
    # 오늘 날짜 구하기
    today_date = datetime.now().strftime("%Y-%m-%d")
    
    # 오늘 날짜의 데이터만 삭제하는 SQL 쿼리
    sql = f"DELETE FROM recommend_log WHERE DATE(timestamp) = '{today_date}'"
    
    # SQL 쿼리 실행
    delete(sql)
    
    return {"status": "success", "message": "Today's statistics have been reset"}

@app.post("/api/authenticate")
async def authenticate(request: Request):
    data = await request.json()
    api_key = data.get("apiKey")

    try:
        authenticate_admin(api_key)
        return {"status": "success"}
    except HTTPException:
        return {"status": "error", "detail": "Unauthorized"}


@app.post("/log_recommendation")
async def log_recommendation(request: Request):
    data = await request.json()
    print(f"Received data: {data}")  # 받은 데이터를 로그로 출력

    conn = connect()
    cur = conn.cursor()
    sql = "INSERT INTO recommend_log (user_ip, restaurant, timestamp) VALUES (%s, %s, %s)"
    try:
        cur.execute(sql, (data['user_ip'], data['restaurant'], datetime.now()))
        conn.commit()
        print("Data committed successfully")  # 성공적으로 커밋되었는지 로그 출력
    except Exception as e:
        print(f"Error occurred: {e}")  # 오류 발생 시 오류 메시지를 출력
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()
    
    return {"status": "success", "message": "Log saved successfully"}


@app.get("/select")
async def select_all():
    data = select("select * from restaurants;")
    return {
        "status": "success",
        "data": data
    }

# 전체 레스트랑 목록
@app.get("/restaurants")
async def get_restaurants():
    data = select("SELECT name, dist, menu, price_range,category FROM restaurants;")
    return {
        "status": "success",
        "data": data
    }

# 랜덤 추천 하나
@app.get("/recommend")
async def recommend_restaurant():
    data = await select_all()
    if not data['data']:
        return {"status": "error", "message": "No restaurant data found."}
    
    # 데이터 개수를 가져옴
    total_data_count = len(data['data'])
    
    # 1개의 랜덤 인덱스 선택 (0부터 시작하므로 나중에 DB 인덱스에 맞추기 위해 +1)
    random_idx = random.randint(0, total_data_count - 1) + 1
    
    # 해당 인덱스의 데이터 선택
    selected_data = select(f"SELECT name, dist, menu, price_range, category, scores, etc FROM restaurants WHERE id = {random_idx};")[0]
    
    return {
        "status": "success",
        "data": selected_data
    }

@app.get("/recommend/triple")
async def recommend_triple_restaurant():
    data = await select_all()
    if not data['data']:
        return {"status": "error", "message": "No restaurant data found."}
    
    total_data_count = len(data['data'])
    if total_data_count < 3:
        return {"status": "error", "message": "Not enough data to select 3 restaurants."}
    
    random_idxs = [idx + 1 for idx in random.sample(range(total_data_count), 3)]
    
    selected_data = []
    for idx in random_idxs:
        try:
            result = select(f"SELECT name, dist, menu, price_range, category, scores, etc FROM restaurants WHERE id = {idx};")
            if result:
                selected_data.append(result[0])
            else:
                print(f"No data found for index: {idx}")
        except Exception as e:
            print(f"Error occurred when querying for index {idx}: {e}")
    
    if len(selected_data) < 3:
        return {"status": "error", "message": "Could not retrieve 3 restaurants."}
    
    return {
        "status": "success",
        "data": selected_data
    }

@app.post("/recommend/advanced")
async def recommend_advanced(request: Request):
    try:
        data = await request.json()
        prompt = data.get("prompt")
        user_ip = request.client.host  # 요청한 사용자의 IP 주소

        # 모든 레스토랑 데이터 가져오기
        all_restaurants = select("SELECT * FROM restaurants;")
        if not all_restaurants:
            raise ValueError("No restaurant data found.")  # 구체적인 오류 메시지

        print(f"Restaurants: {all_restaurants}")  # 데이터가 제대로 나오는지 확인

        # 각 레스토랑 정보를 딕셔너리로 변환
        restaurant_dict = {
            r[1]: {
                "category": r[7],
                "distance": r[6],
                "price_range": r[3],
                "menu": r[2]
            } for r in all_restaurants
        }
        
        # GPT에게 프롬프트와 모든 레스토랑 데이터를 전달하여 최적의 레스토랑 추천 받기
        recommended_restaurant = generate_gpt_response(prompt, restaurant_dict)
        if not recommended_restaurant:
            raise ValueError("No recommendation generated by GPT.")

        # 레스토랑 이름만 추출
        restaurant_name = recommended_restaurant.split('(')[0].strip()

        # 추천 로그 데이터 구성
        log_data = {
            'user_ip': user_ip,
            'restaurant': restaurant_name,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'answer': recommended_restaurant  # GPT-3의 응답 전체를 answer에 저장
        }

        # 로그에 저장
        conn = connect()
        cur = conn.cursor()
        sql = "INSERT INTO recommend_log (user_ip, restaurant, timestamp, answer) VALUES (%s, %s, %s, %s)"
        try:
            cur.execute(sql, (log_data['user_ip'], log_data['restaurant'], log_data['timestamp'], log_data['answer']))
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Database error: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            conn.close()
        
        return {
            "status": "success",
            "data": recommended_restaurant
        }

    except Exception as e:
        print(f"Error in recommend_advanced: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_gpt_response(prompt, restaurant_dict):
    # GPT에게 전달할 프롬프트를 구성
    formatted_restaurants = "\n".join(
        [f"{name}: {details['category']}, {details['distance']}m, {details['price_range']}, 메뉴: {details['menu']}" 
         for name, details in restaurant_dict.items()]
    )

    full_prompt = f"""
    Consider the following restaurants:
    {formatted_restaurants}
    
    Based on the user's request: '{prompt}', recommend the best restaurant. Please answer such that the name(menu, distance, price_range) and one reason in your response.
    "Just give me the reason, and skip the unnecessary flattery. 
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": 
                """
                 You are an AI assistant who recommends restaurants.
                 Always include the price information when asked and say in Korean within 50 words.
                 Please provide a clear answer without repeating the question.
                 """},
                {"role": "user", "content": full_prompt}
            ]
        )
        return response.choices[0].message['content'].strip()
    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail="Error with AI response generation.")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@app.get("/api/stats/daily")
async def get_daily_stats():
    sql = """
    SELECT restaurant, COUNT(*) as count
    FROM recommend_log
    WHERE DATE(timestamp) = CURDATE()
    GROUP BY restaurant
    ORDER BY count DESC
    """
    results = select(sql)
    return {"status": "success", "data": results}


@app.get("/api/stats/weekly")
async def get_weekly_stats():
    sql = """
        WITH Week_Calculation AS (
            SELECT 
                DATE_FORMAT(timestamp, '%Y-%m') as month_year,
                WEEKOFYEAR(timestamp) - WEEKOFYEAR(DATE_SUB(timestamp, INTERVAL DAYOFMONTH(timestamp)-1 DAY)) + 1 AS week_of_month,
                restaurant,
                COUNT(*) as count
            FROM recommend_log
            WHERE timestamp >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            GROUP BY month_year, week_of_month, restaurant
            HAVING week_of_month <= 4
        )
        SELECT * FROM Week_Calculation
        WHERE week_of_month <= 4
        ORDER BY month_year, week_of_month, count DESC;
    """
    results = select(sql)
    return {"status": "success", "data": results}


@app.get("/api/stats/monthly")
async def get_monthly_stats():
    sql = """
    SELECT MONTH(timestamp) as month, restaurant, COUNT(*) as count
    FROM recommend_log
    WHERE YEAR(timestamp) = YEAR(CURDATE())
    GROUP BY month, restaurant
    ORDER BY month, count DESC
    """
    results = select(sql)
    return {"status": "success", "data": results}


@app.get("/api/stats/weekday")
async def get_weekday_stats():
    sql = """
    SELECT DAYOFWEEK(timestamp) as weekday, restaurant, COUNT(*) as count
    FROM recommend_log
    WHERE WEEKDAY(timestamp) BETWEEN 0 AND 4  -- 월요일부터 금요일
    GROUP BY weekday, restaurant
    ORDER BY weekday, count DESC
    """
    results = select(sql)
    return {"status": "success", "data": results}

if __name__ == "__main__":
    uvicorn.run("main:app"
                ,host="0.0.0.0" # 배포 실행
                #,host="127.0.0.1" # 나만 보기
                , port=3001
                , reload=True)