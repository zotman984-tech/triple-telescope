import requests
import json
import subprocess

# 1. Fetch from esimAccess
url = "https://api.esimaccess.com/api/v1/open/package/list"
headers = {
    "RT-AccessCode": "52ae832167194edebca803a3898bb15b",
    "RT-SecretKey": "89c1207a02ce4a099a468793978303be",
    "Content-Type": "application/json"
}

try:
    print("Fetching from esimAccess...")
    response = requests.post(url, headers=headers, json={})
    if response.status_code == 200:
        data = response.json()
        packages = data.get('obj', {}).get('packageList', [])
        esim_count = len(packages)
        print(f"esimAccess Total: {esim_count}")
        
        # Count by type (approximate based on sync logic)
        unlimited = 0
        local = 0
        global_ = 0
        region = 0
        topup = 0
        
        for pkg in packages:
            name = pkg.get('name', '').lower()
            data_type = pkg.get('dataType')
            location_code = pkg.get('locationCode', '')
            
            if pkg.get('supportTopUpType') == 1 or 'topup' in name or 'top-up' in name:
                topup += 1
            elif 'unlimited' in name or data_type == 2:
                unlimited += 1
            elif location_code == 'Global':
                global_ += 1
            elif location_code in ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania']: # Simplified check
                region += 1
            else:
                local += 1
                
        print(f"  - Unlimited (approx): {unlimited}")
        print(f"  - Topup (approx): {topup}")
        
    else:
        print(f"Error fetching from esimAccess: {response.status_code}")
        esim_count = -1

except Exception as e:
    print(f"Exception fetching from esimAccess: {e}")
    esim_count = -1

# 2. Fetch from Strapi DB
print("\nFetching from Strapi DB...")
cmd = "ssh -i /Users/admin/Desktop/triple-telescope/id_ed25519 -o StrictHostKeyChecking=no root@188.137.254.45 'PGPASSWORD=strapiPassword123 psql -h localhost -U strapi -d esim0_strapi -t -c \"SELECT COUNT(*) FROM products;\"'"
try:
    result = subprocess.check_output(cmd, shell=True).decode().strip()
    strapi_count = int(result)
    print(f"Strapi Total: {strapi_count}")
    
    # Check unlimited count in DB
    cmd_unlimited = "ssh -i /Users/admin/Desktop/triple-telescope/id_ed25519 -o StrictHostKeyChecking=no root@188.137.254.45 'PGPASSWORD=strapiPassword123 psql -h localhost -U strapi -d esim0_strapi -t -c \"SELECT COUNT(*) FROM products WHERE is_unlimited = true;\"'"
    res_unlimited = subprocess.check_output(cmd_unlimited, shell=True).decode().strip()
    print(f"  - Unlimited in DB: {res_unlimited}")

except Exception as e:
    print(f"Error fetching from Strapi: {e}")
    strapi_count = -1

# 3. Compare
if esim_count != -1 and strapi_count != -1:
    diff = esim_count - strapi_count
    print(f"\nDifference: {diff}")
    if diff == 0:
        print("Data is COMPLETE.")
    else:
        print(f"Data is MISSING {diff} products (or Strapi has extra)." if diff > 0 else f"Strapi has {-diff} EXTRA products.")

