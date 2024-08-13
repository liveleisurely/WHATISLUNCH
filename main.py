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

app = FastAPI()

openai.api_key = openAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
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


def generate_gpt_response(prompt, available_restaurants):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": 
            """
             You are an AI assistant who recommends restaurants.
             Always include the price information when asked and say in Korean within 50 words.
             Simply answer.
             Please provide a clear answer without repeating the question
             """},
            {"role": "user", "content": f"Given the options: {', '.join(available_restaurants)}, and considering the prompt '{prompt}', recommend the best restaurant. Make sure to include the price range in your answer."}
        ]
    )
    print(response)  # 응답 전체를 출력하여 확인
    return response.choices[0].message['content'].strip()



    
@app.delete("/api/stats/reset")
async def reset_stats(api_key: str):
    authenticate_admin(api_key)
    sql = "DELETE FROM recommend_log"
    delete(sql)
    return {"status": "success", "message": "All statistics have been reset"}



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
    picked = select("select name, dist, menu, price_range, category, scores, etc FROM restaurants ORDER BY RAND() LIMIT 1;")
    return {
        "status": "success",
        "data": picked[0] if picked else None
    }

@app.post("/recommend/advanced")
async def recommend_advanced(request: Request):
    data = await request.json()
    prompt = data.get("prompt")
    user_ip = request.client.host  # 요청한 사용자의 IP 주소

    # 데이터베이스에서 레스토랑 정보 가져오기
    results = select("SELECT name, dist, category, price_range FROM restaurants;")
    available_restaurants = [f"{r[0]} ({r[2]}, {r[1]}m, {r[3]})" for r in results]
    
    recommended_restaurant = generate_gpt_response(prompt, available_restaurants)
    restaurant_name = recommended_restaurant.split('(')[0].strip()  # 레스토랑 이름만 추출

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
        print(f"Logging data: {log_data}")  # 로그에 저장할 데이터를 출력
        cur.execute(sql, (log_data['user_ip'], log_data['restaurant'], log_data['timestamp'], log_data['answer']))
        conn.commit()
        print("Data committed successfully")  # 성공적으로 커밋되었는지 로그 출력
    except Exception as e:
        print(f"Error occurred: {e}")  # 오류 발생 시 오류 메시지를 출력
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()
    
    return {
        "status": "success",
        "data": recommended_restaurant
    }
    

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
                #,host="0.0.0.0" # 나만 보기
                ,host="127.0.0.1" # 배포 실행
                , port=3001
                , reload=True)