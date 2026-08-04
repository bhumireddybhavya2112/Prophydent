import urllib.request, re, json
url = 'https://github.com/bhumireddybhavya2112/Prophydent/actions'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8')

matches = re.findall(r'data-hovercard-url="/bhumireddybhavya2112/Prophydent/actions/runs/(\d+)/hovercard"', content)
if not matches:
    print('No runs found')
else:
    run_id = matches[0]
    print(f'Latest Run ID: {run_id}')
    
    run_url = f'https://github.com/bhumireddybhavya2112/Prophydent/actions/runs/{run_id}'
    req2 = urllib.request.Request(run_url, headers={'User-Agent': 'Mozilla/5.0'})
    content2 = urllib.request.urlopen(req2).read().decode('utf-8')
    
    # Try to find run jobs from the data payloads
    jobs = re.findall(r'aria-label="([a-zA-Z0-9_-]+), ([a-zA-Z]+)(?:, \d+)? steps?"', content2)
    print("Jobs statuses:")
    for j in jobs:
        print(f" - {j[0]}: {j[1]}")
    
    if "This workflow run completed successfully" in content2:
        print("Conclusion: Success")
    elif "This workflow run failed" in content2 or 'This run failed' in content2:
        print("Conclusion: Failed")
    else:
        print("Conclusion: Unknown or In Progress")
