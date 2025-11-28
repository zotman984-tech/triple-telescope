import requests
import json

base_url = "https://api.esimfree.store/api/products"

links = [
    ("Unlimited", "filters[isUnlimited][]=true"),
    ("Global", "filters[type][]=global"),
    ("Local", "filters[type][]=local"),
    ("Region (EU)", "filters[region][]=EU"),
    ("Country (ES)", "filters[country][]=ES"),
    ("Name (Morocco)", "filters[name][]=Morocco")
]

for name, query in links:
    try:
        url = f"{base_url}?{query}&pagination[limit]=1"
        response = requests.get(url)
        data = response.json()
        count = len(data) if isinstance(data, list) else len(data.get('data', []))
        print(f"{name}: {count} items found")
        if count == 0 and name == "Region (EU)":
             # Try debugging EU
             print("  Debug EU: Retrying with contains...")
             url_debug = f"{base_url}?filters[region][]=EU&pagination[limit]=1"
             resp_debug = requests.get(url_debug)
             print(f"  Debug EU contains: {len(resp_debug.json())}")
    except Exception as e:
        print(f"{name}: Error - {e}")
