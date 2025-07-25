from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
import os
import smtplib
from email.message import EmailMessage
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# MySQL connection settings from .env
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")

# Connect to MySQL
conn = mysql.connector.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DATABASE
)
cur = conn.cursor(dictionary=True)

# Create a unified leads table
cur.execute("""
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_type VARCHAR(255),
    customer_name VARCHAR(255),
    contact_number VARCHAR(20),
    gmail_id VARCHAR(255),
    city VARCHAR(100),
    vehicle VARCHAR(100),
    ca_name VARCHAR(100),

    td_given TEXT,
    quotation TEXT,
    cx TEXT,
    status TEXT,
    heat_status TEXT,
    remark TEXT,
    photo_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
""")

conn.commit()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://guest.manickbag.in", "http://localhost:3000"]}}, supports_credentials=True)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/submit-step1", methods=["POST"])
def submit_step1():
    data = request.get_json()

    cur.execute("""
        INSERT INTO leads (
            customer_type, customer_name, contact_number, gmail_id, city, vehicle, ca_name
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        data["customer_type"], data["customer_name"], data["contact_number"],
        data["gmail_id"], data["city"], data["vehicle"], data["ca_name"]
    ))
    conn.commit()
    lead_id = cur.lastrowid

    try:
        send_notification_email(data["customer_type"], data)
    except Exception as e:
        print("Email sending failed:", e)

    return jsonify({"step_one_id": lead_id})

def send_notification_email(customer_type, data):
    EMAIL_ADDRESS = os.getenv("GMAIL_USER")
    EMAIL_PASSWORD = os.getenv("GMAIL_PASS")

    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("Missing Gmail credentials in .env")
        return

    greetings = {
        "First": "Welcome to the Manickbag family! 🎉\nWe’re thrilled to be part of your very first vehicle journey...",
        "Existing": "It’s always a pleasure to serve you again! 🙏\nYour continued trust in Manickbag...",
        "Delivery": "Congratulations on your new vehicle delivery! 🚗✨\nWe hope your delivery experience..."
    }

    message = greetings.get(customer_type, "Thank you for reaching out to Manickbag Automobiles...")

    subject = f"Greetings from Manickbag - {customer_type} Customer"
    body = f"""
Dear {data.get('customer_name', 'Valued Customer')},

{message}

Best regards,  
Manickbag Automobiles Pvt. Ltd.
"""

    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = data.get('gmail_id', EMAIL_ADDRESS)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
            print(f"Greeting email sent to {msg['To']}.")
    except Exception as e:
        print(f"Failed to send email: {e}")


@app.route("/submit-step2", methods=["POST"])
def submit_step2():
    td_given = request.form["td_given"]
    quotation = request.form["quotation"]
    cx = request.form["cx"]
    status = request.form["status"]
    heat_status = request.form["heat_status"]
    remark = request.form["remark"]
    step_one_id = request.form["step_one_id"]
    photo_file = request.files.get("photo")

    photo_url = None
    if photo_file:
        filename = secure_filename(photo_file.filename)
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        photo_file.save(photo_path)
        photo_url = f"/uploads/{filename}"

    cur.execute("""
        UPDATE leads SET
            td_given = %s,
            quotation = %s,
            cx = %s,
            status = %s,
            heat_status = %s,
            remark = %s,
            photo_url = %s
        WHERE id = %s
    """, (
        td_given, quotation, cx, status,
        heat_status, remark, photo_url, step_one_id
    ))
    conn.commit()

    return jsonify({"success": True})

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory('uploads', filename)

@app.route("/all-data", methods=["GET"])
def all_data():
    cur.execute("SELECT * FROM leads ORDER BY id DESC")
    data = cur.fetchall()
    for idx, item in enumerate(data, start=1):
        item["sl_no"] = idx
    return jsonify(data)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    try:
        cur.execute("SELECT password_hash FROM admin_users WHERE username = %s", (username,))
        row = cur.fetchone()
        if row and check_password_hash(row["password_hash"], password):
            return jsonify({"success": True})
        else:
            return jsonify({"success": False}), 401
    except Exception as e:
        print("Login error:", e)
        conn.rollback()
        return jsonify({"error": "Server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
