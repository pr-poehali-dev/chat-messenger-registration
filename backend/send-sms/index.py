import json
import os
import random
import psycopg2
import urllib.request
import urllib.parse


def handler(event, context):
    """Отправка SMS-кода для авторизации по номеру телефона"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    phone = body.get('phone', '').strip()

    if not phone or len(phone.replace('+', '').replace(' ', '').replace('(', '').replace(')', '').replace('-', '')) < 11:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный номер телефона'})}

    digits_only = ''.join(filter(str.isdigit, phone))
    if digits_only.startswith('8'):
        digits_only = '7' + digits_only[1:]
    if not digits_only.startswith('7'):
        digits_only = '7' + digits_only

    code = str(random.randint(1000, 9999))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    cur.execute(
        "UPDATE {schema}.sms_codes SET used = TRUE WHERE phone = '{phone}' AND used = FALSE".format(
            schema=schema, phone=digits_only
        )
    )

    cur.execute(
        "INSERT INTO {schema}.sms_codes (phone, code) VALUES ('{phone}', '{code}')".format(
            schema=schema, phone=digits_only, code=code
        )
    )
    conn.commit()

    api_key = os.environ.get('SMSRU_API_KEY', '')
    sms_sent = False

    if api_key:
        sms_url = "https://sms.ru/sms/send?api_id={api_key}&to={phone}&msg={msg}&json=1".format(
            api_key=api_key,
            phone=digits_only,
            msg=urllib.parse.quote("Pulse: ваш код {code}".format(code=code))
        )
        try:
            req = urllib.request.urlopen(sms_url, timeout=10)
            result = json.loads(req.read().decode())
            if result.get('status') == 'OK':
                sms_sent = True
        except Exception:
            pass

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'sms_sent': sms_sent,
            'demo': not sms_sent,
            'phone': digits_only
        })
    }
