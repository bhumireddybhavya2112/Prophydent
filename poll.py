import urllib.request; import json; import time; run_id = '30906335483'; url = f'https://api.github.com/repos/bhumireddybhavya2112/Prophydent/actions/runs/{run_id}'; 
while True:
    res = json.loads(urllib.request.urlopen(urllib.request.Request(url)).read());
    if res['status'] == 'completed':
        print('Finished:', res['conclusion']);
        break;
    time.sleep(10);
jobs_url = f'https://api.github.com/repos/bhumireddybhavya2112/Prophydent/actions/runs/{run_id}/jobs';
jobs = json.loads(urllib.request.urlopen(urllib.request.Request(jobs_url)).read())['jobs'];
for j in jobs:
    print('Job:', j['name'], '-', j['conclusion']);

