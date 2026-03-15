import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("firebase_credentials.json")
firebase_admin.initialize_app(cred)

# create a test user
try:
    user = auth.create_user(
        email="test@voyant.com",
        password="test1234",
        display_name="Test User"
    )
    print(f"✅ User created: {user.uid}")
except Exception as e:
    # user already exists
    user = auth.get_user_by_email("test@voyant.com")
    print(f"✅ User exists: {user.uid}")

# create custom token
custom_token = auth.create_custom_token(user.uid)
print(f"\n🔑 UID: {user.uid}")
print(f"\n📋 Custom Token (use this to get ID token):\n{custom_token.decode()}")