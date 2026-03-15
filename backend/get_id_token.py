import requests

API_KEY = ""

# sign in with email/password to get ID token
response = requests.post(
    f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}",
    json={
        "email": "test@voyant.com",
        "password": "test1234",
        "returnSecureToken": True
    }
)

data = response.json()
if "idToken" in data:
    print(f"✅ ID Token:\n{data['idToken']}")
    print(f"\n✅ Use this in Swagger as: Bearer <token>")
else:
    print(f"❌ Error: {data}")