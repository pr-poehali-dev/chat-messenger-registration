import json
import os
import psycopg2
import hashlib
import time


def handler(event, context):
    """Проверка SMS-кода и авторизация пользователя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    phone = body.get('phone', '').strip()
    code = body.get('code', '').strip()

    if not phone or not code:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите номер и код'})}

    digits_only = ''.join(filter(str.isdigit, phone))
    if digits_only.startswith('8'):
        digits_only = '7' + digits_only[1:]
    if not digits_only.startswith('7'):
        digits_only = '7' + digits_only

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    cur.execute(
        "SELECT id, code FROM {schema}.sms_codes WHERE phone = '{phone}' AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1".format(
            schema=schema, phone=digits_only
        )
    )
    row = cur.fetchone()

    if not row or row[1] != code:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный код'})}

    cur.execute(
        "UPDATE {schema}.sms_codes SET used = TRUE WHERE id = {id}".format(
            schema=schema, id=row[0]
        )
    )

    cur.execute(
        "SELECT id, name, is_premium, avatar_emoji FROM {schema}.users WHERE phone = '{phone}'".format(
            schema=schema, phone=digits_only
        )
    )
    user_row = cur.fetchone()

    if user_row:
        user_id = user_row[0]
        user_name = user_row[1]
        is_premium = user_row[2]
        avatar_emoji = user_row[3]
        cur.execute(
            "UPDATE {schema}.users SET last_seen = NOW() WHERE id = {id}".format(
                schema=schema, id=user_id
            )
        )
    else:
        cur.execute(
            "INSERT INTO {schema}.users (phone, name) VALUES ('{phone}', 'Пользователь') RETURNING id".format(
                schema=schema, phone=digits_only
            )
        )
        result = cur.fetchone()
        user_id = result[0]
        user_name = 'Пользователь'
        is_premium = False
        avatar_emoji = None

    token = hashlib.sha256("{uid}_{ts}_{phone}".format(uid=user_id, ts=int(time.time()), phone=digits_only).encode()).hexdigest()

    conn.commit()
    cur.close()
    conn.close()

    formatted = "+7 ({a}) {b}-{c}-{d}".format(
        a=digits_only[1:4], b=digits_only[4:7], c=digits_only[7:9], d=digits_only[9:11]
    ) if len(digits_only) == 11 else phone

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'user': {
                'id': user_id,
                'phone': formatted,
                'name': user_name,
                'is_premium': is_premium,
                'avatar_emoji': avatar_emoji,
                'token': token
            }
        })
    }
