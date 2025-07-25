from werkzeug.security import generate_password_hash

# Replace this with your desired password
plain_password = "Safari@1314"

# Generate hash
hashed_password = generate_password_hash(plain_password)

# Print or copy it
print("Hashed password:", hashed_password)
