import csv
import random
from datetime import datetime, timedelta

# Configuration
csv_path = "frontend/sample_traffic_data.csv"  # Path to your CSV file
num_days = 7  # Number of days to generate data for
hours_per_day = 24
road_names = [
    "San Francisco – Oakland Bay Bridge",
    "Golden Gate Bridge",
    "Lombard Street",
    "Market Street",
    "Van Ness Avenue",
    "Interstate 280",
    "Highway 101"
]

# Get the last timestamp from the existing CSV to continue from there
last_timestamp_str = None
try:
    with open(csv_path, 'r', newline='') as file:
        reader = csv.reader(file)
        # Skip header
        next(reader, None) 
        for row in reader:
            if row: # Check if row is not empty
                last_timestamp_str = row[0]
except FileNotFoundError:
    print(f"CSV file not found at {csv_path}. A new file will be created.")
    # Create header if file doesn't exist
    with open(csv_path, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "road_id", "road_name", "traffic_level"])

start_datetime = datetime.now()
if last_timestamp_str:
    try:
        start_datetime = datetime.strptime(last_timestamp_str, "%Y-%m-%d %H:%M:%S") + timedelta(hours=1)
    except ValueError:
        print(f"Could not parse last timestamp: {last_timestamp_str}. Starting from current time.")
        start_datetime = datetime.now().replace(minute=0, second=0, microsecond=0)
else:
    # If no last timestamp (e.g., new or empty file), start from a fixed recent past time
    start_datetime = datetime.now().replace(minute=0, second=0, microsecond=0) - timedelta(days=num_days)


new_data = []
current_datetime = start_datetime

for _ in range(num_days * hours_per_day):
    for road_name in road_names:
        road_id = f"({random.randint(10000000, 99999999)}, {random.randint(1000000000, 9999999999)}, 0)" # Generate a random-like road_id
        traffic_level = random.randint(1, 5) # Random traffic level between 1 and 5
        new_data.append([
            current_datetime.strftime("%Y-%m-%d %H:%M:%S"),
            road_id,
            road_name,
            traffic_level
        ])
    current_datetime += timedelta(hours=1)

# Append data to CSV
with open(csv_path, 'a', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(new_data)

print(f"Added {len(new_data)} new rows of sample data to {csv_path}")