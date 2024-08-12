import uvicorn
from fastapi import FastAPI, Request, HTTPException, Body
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pymysql
from typing import List
import random
from api_config import dataAPI

app = FastAPI()

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

@app.get("/restaurants")
async def get_restaurants():
    data = select("SELECT name, dist, menu, price_range,category FROM restaurants;")
    return {
        "status": "success",
        "data": data
    }

@app.get("/recommend")
async def recommend_restaurant():
    picked = select("select name, dist, menu, price_range, category, scores, etc FROM restaurants ORDER BY RAND() LIMIT 1;")
    return {
        "status": "success",
        "data": picked[0] if picked else None
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

# API 엔드포인트
# @app.get("/api/health_categories")
# async def get_categories():
#     categories = [r[0] for r in select("select distinct 건강유형명 from 건강유형")]
#     return {
#         "status": "success",
#         "message": "",
#         "data": categories
#     }

# @app.get("/heartbeat")
# async def heartbeat():
#     return {
#         "status": "success",
#         "message": "hihi`",
#         "data": None
#     }


# # HTML 렌더링 엔드포인트
# @app.get("/health_categories", response_class=HTMLResponse)
# async def health_categories(request: Request):
#     template = env.get_template("categories.html")
#     categories = [r[0] for r in select("select distinct 건강유형명 from 건강유형")]
#     html_content = template.render(categories=categories)
    
#     # CSS 파일 추가
#     css_link = '<link rel="stylesheet" type="text/css" href="/static/categories.css">'
#     html_content = f"{css_link}\n{html_content}"
    
#     return HTMLResponse(content=html_content)

# # 이거 sql injection 방어 안되어 있으니까 (데모니까) 추가해야함
# @app.get("/api/questionnaires")
# async def get_questionnaire(category:str):
#     result = select("select a.건강유형_id, a.문항 from 설문지 as a join 건강유형 as b on a.건강유형_id=b.id where b.건강유형명='{}'".format(category))
    
#     return {
#         "status": "success",
#         "message": "",
#         "data": result
#     }

# @app.post("/api/submit_questionnaires")
# async def post_question_result(req:dict = Body()):
#     answers = req["answers"]
    
#     ids = [str(answer["id"]) for answer in answers if answer["yes"]>=answer["no"]]
#     if not ids:
#         return {
#             "status": "failed",
#             "message": "no ids",
#             "data": None
#         }

#     result = select('''select a.세부기능명, d.원료명, d.일일섭취량_하한, d.일일섭취량_상한, d.일일섭취량_단위,
#                     case when d.주의사항 IS NULL then "주의사항 없음"
#                     ELSE d.`주의사항` END AS 주의사항
#                     from 건강유형 as a join 기능성_내용 as b on a.id=b.건강유형_id
#                     join 기능성_내용_및_원료 as c on b.id=c.기능성내용_id
#                     join 기능성_원료 as d on c.기능성원료_id=d.id
#                     where b.건강유형_id IN ({})'''.format(",".join(ids)))
#     result_json = [
#         {
#             "category": r[0],
#             "material_name": r[1],
#             "intake_low": r[2],
#             "intake_high": r[3],
#             "intake_unit": r[4],
#             "marks": r[5]
#         } for r in result
#     ]
#     return {
#         "status": "success",
#         "message": "",
#         "data": result_json
#     }
    

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)