# services/authentication_service/authentication_service.py
import asyncio
import bcrypt
import jwt
import json
from datetime import datetime, timedelta
from common.nats_client import NATSClient
from common.models import User
import logging

logging.basicConfig(level=logging.INFO)

# Secret key for signing JWTs (replace with a secure key in production)
JWT_SECRET = 'your-secure-secret-key'
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# def create_access_token(data: dict, expires_delta: timedelta = None):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
#     to_encode.update({"exp": expire, "type": "access"})
#     encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
#     return encoded_jwt

def create_access_token(user: User, expires_delta: timedelta = None):
    to_encode = {
        "exp": datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)),
        "type": "access",
        "user": {
            "id": user.id,
            "name": user.name,
            "templates": user.templates,
            "last_login": user.last_login,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "logged_in": user.logged_in,
        }
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def run():
    nats_client = NATSClient()
    await nats_client.connect()
    
    js = nats_client.js
    
    # Ensure the users KV store is available
    await js.create_key_value(bucket='users')
    kv_users = await js.key_value(bucket='users')
    
    # Handler for user registration
    async def handle_user_registration(msg):
        try:
            user_data = msg.data.decode()
            user_info = User.from_json(user_data)
            username = user_info.name
            password = user_info.login_pass.encode('utf-8')

            # Check if user already exists
            try:
                await kv_users.get(username)
                # User already exists
                response = {'status': 'error', 'message': 'User already exists.'}
            except:
                # Hash the password
                hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
                user_info.login_pass = hashed_password.decode('utf-8')
                user_info.created_at = datetime.utcnow().isoformat()
                user_info.updated_at = datetime.utcnow().isoformat()
                user_info.logged_in = False

                # Store user in KV store
                await kv_users.put(username, user_info.to_json().encode())

                response = {'status': 'success', 'message': 'User registered successfully.'}
            # Send response
            await msg.respond(json.dumps(response).encode())
        except Exception as e:
            logging.error(f"Registration error: {e}")
            response = {'status': 'error', 'message': 'Registration failed.'}
            await msg.respond(json.dumps(response).encode())

    # Handler for user login
    async def handle_user_login(msg):
        try:
            credentials = msg.data.decode()
            credentials = json.loads(credentials)  # {'username': 'user1', 'password': 'pass123'}
            username = credentials['username']
            password = credentials['password'].encode('utf-8')

            # Fetch user from KV store
            entry = await kv_users.get(username)
            user_info = User.from_json(entry.value.decode())
            stored_hashed_password = user_info.login_pass.encode('utf-8')

            # Verify password
            if bcrypt.checkpw(password, stored_hashed_password):
                # Update last login
                user_info.last_login = datetime.utcnow().isoformat()
                user_info.logged_in = True
                user_info.updated_at = datetime.utcnow().isoformat()

                # Update user info in KV store
                await kv_users.put(username, user_info.to_json().encode())

                # Create JWT tokens
                access_token = create_access_token(user_info)
                refresh_token = create_refresh_token({"sub": user_info.id, "name": user_info.name})

                response = {
                    'status': 'success',
                    'message': 'Login successful.',
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            else:
                response = {'status': 'error', 'message': 'Invalid username or password.'}
            await msg.respond(json.dumps(response).encode())
        except Exception as e:
            logging.error(f"Login error: {e}")
            response = {'status': 'error', 'message': 'Login failed.'}
            await msg.respond(json.dumps(response).encode())

    # async def handle_user_login(msg):
    #     try:
    #         credentials = msg.data.decode()
    #         credentials = json.loads(credentials)  # {'username': 'user1', 'password': 'pass123'}
    #         username = credentials['username']
    #         password = credentials['password'].encode('utf-8')

    #         # Fetch user from KV store
    #         entry = await kv_users.get(username)
    #         user_info = User.from_json(entry.value.decode())
    #         stored_hashed_password = user_info.login_pass.encode('utf-8')

    #         # Verify password
    #         if bcrypt.checkpw(password, stored_hashed_password):
    #             # Create JWT tokens
    #             user_data = {"sub": user_info.id, "name": user_info.name}
    #             access_token = create_access_token(user_data)
    #             refresh_token = create_refresh_token(user_data)

    #             # Update last login
    #             user_info.last_login = datetime.utcnow().isoformat()
    #             user_info.logged_in = True
    #             user_info.updated_at = datetime.utcnow().isoformat()

    #             # Update user info in KV store
    #             await kv_users.put(username, user_info.to_json().encode())

    #             response = {
    #                 'status': 'success',
    #                 'message': 'Login successful.',
    #                 'access_token': access_token,
    #                 'refresh_token': refresh_token
    #             }
    #         else:
    #             response = {'status': 'error', 'message': 'Invalid username or password.'}
    #         await msg.respond(json.dumps(response).encode())
    #     except Exception as e:
    #         logging.error(f"Login error: {e}")
    #         response = {'status': 'error', 'message': 'Login failed.'}
    #         await msg.respond(json.dumps(response).encode())

    # Handler for password change
    async def handle_password_change(msg):
        try:
            data = msg.data.decode()
            data = json.loads(data)  # {'access_token': '...', 'new_password': 'newpass123'}
            access_token = data.get('access_token')
            new_password = data.get('new_password').encode('utf-8')

            # Verify access token
            payload = jwt.decode(access_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

            if payload.get('type') != 'access':
                raise jwt.InvalidTokenError('Invalid token type')

            username = payload.get('name')

            # Fetch user from KV store
            entry = await kv_users.get(username)
            user_info = User.from_json(entry.value.decode())

            # Hash new password
            hashed_password = bcrypt.hashpw(new_password, bcrypt.gensalt())
            user_info.login_pass = hashed_password.decode('utf-8')
            user_info.updated_at = datetime.utcnow().isoformat()

            # Update user in KV store
            await kv_users.put(username, user_info.to_json().encode())

            response = {'status': 'success', 'message': 'Password changed successfully.'}
            await msg.respond(json.dumps(response).encode())
        except jwt.ExpiredSignatureError:
            response = {'status': 'error', 'message': 'Access token expired.'}
            await msg.respond(json.dumps(response).encode())
        except jwt.InvalidTokenError as e:
            response = {'status': 'error', 'message': 'Invalid access token.'}
            await msg.respond(json.dumps(response).encode())
        except Exception as e:
            logging.error(f"Password change error: {e}")
            response = {'status': 'error', 'message': 'Password change failed.'}
            await msg.respond(json.dumps(response).encode())

    # Handler for token refresh
    async def handle_token_refresh(msg):
        try:
            data = msg.data.decode()
            data = json.loads(data)  # {'refresh_token': '...'}
            refresh_token = data.get('refresh_token')

            # Verify refresh token
            payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

            if payload.get('type') != 'refresh':
                raise jwt.InvalidTokenError('Invalid token type')

            username = payload.get('name')

            # Fetch user from KV store
            entry = await kv_users.get(username)
            user_info = User.from_json(entry.value.decode())

            # Create new access token
            access_token = create_access_token(user_info)

            response = {
                'status': 'success',
                'access_token': access_token,
            }
            await msg.respond(json.dumps(response).encode())
        except jwt.ExpiredSignatureError:
            response = {'status': 'error', 'message': 'Refresh token expired.'}
            await msg.respond(json.dumps(response).encode())
        except jwt.InvalidTokenError as e:
            response = {'status': 'error', 'message': 'Invalid refresh token.'}
            await msg.respond(json.dumps(response).encode())
        except Exception as e:
            logging.error(f"Token refresh error: {e}")
            response = {'status': 'error', 'message': 'Token refresh failed.'}
            await msg.respond(json.dumps(response).encode())


    # Subscribe to subjects
    await nats_client.nc.subscribe('auth.register', cb=handle_user_registration)
    await nats_client.nc.subscribe('auth.login', cb=handle_user_login)
    await nats_client.nc.subscribe('auth.change_password', cb=handle_password_change)
    await nats_client.nc.subscribe('auth.refresh_token', cb=handle_token_refresh)

    # Keep the service running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await nats_client.close()

if __name__ == '__main__':
    asyncio.run(run())
