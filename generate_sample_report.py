import pandas as pd
import random

# Generate 300 rows of fake test data
data = []
for i in range(1, 301):
    data.append({
        'Test ID': f'TC-SAMPLE-{i:03d}',
        'Test Name': f'Sample Test Case {i}',
        'Suite': random.choice(['Login', 'Checkout', 'Search', 'Profile']),
        'Status': 'Pass',
        'Duration': f'{random.uniform(0.1, 5.0):.2f}s',
        'Notes': 'Placeholder data'
    })

df_results = pd.DataFrame(data)

total = len(df_results)
passed = len(df_results[df_results['Status'] == 'Pass'])
failed = len(df_results[df_results['Status'] == 'Fail'])
skipped = len(df_results[df_results['Status'] == 'Skip'])
pass_rate = (passed / total) * 100 if total > 0 else 0

summary_data = {
    'Metric': ['Total Count', 'Pass', 'Fail', 'Skip', 'Pass Rate %'],
    'Value': [total, passed, failed, skipped, f'{pass_rate:.2f}%']
}
df_summary = pd.DataFrame(summary_data)

with pd.ExcelWriter('sample_report.xlsx', engine='openpyxl') as writer:
    df_results.to_excel(writer, sheet_name='Test Results', index=False, startrow=1)
    df_summary.to_excel(writer, sheet_name='Summary', index=False, startrow=1)
    
    banner = "⚠ SAMPLE DATA — NOT REAL TEST RESULTS — For format testing only"
    writer.sheets['Test Results'].cell(row=1, column=1, value=banner)
    writer.sheets['Summary'].cell(row=1, column=1, value=banner)

print("Generated sample_report.xlsx")
