#!/usr/bin/env python3
"""
Analyze E2E test results from Playwright JSON output.
Extracts all failures, groups them by type, and generates a comprehensive report.
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, Any

def load_results(file_path: str) -> Dict[str, Any]:
    """Load the Playwright results JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_failure_info(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract relevant failure information from a test result."""
    errors = []
    
    for error in result.get('errors', []):
        errors.append({
            'message': error.get('message', 'No error message'),
            'location': error.get('location', {}),
            'snippet': error.get('snippet', '')
        })
    
    return {
        'status': result.get('status'),
        'duration': result.get('duration', 0),
        'errors': errors,
        'retry': result.get('retry', 0),
        'startTime': result.get('startTime', ''),
        'attachments': len(result.get('attachments', []))
    }

def analyze_results(data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze test results and categorize failures."""
    
    stats = {
        'total': 0,
        'passed': 0,
        'failed': 0,
        'flaky': 0,
        'skipped': 0,
        'timedOut': 0
    }
    
    failures_by_browser = defaultdict(list)
    failures_by_test = defaultdict(list)
    error_patterns = defaultdict(int)
    
    for suite in data.get('suites', []):
        for spec in suite.get('suites', []):
            for test in spec.get('specs', []):
                test_title = test.get('title', 'Unknown test')
                test_file = spec.get('file', 'Unknown file')
                test_line = spec.get('line', 0)
                
                for result in test.get('tests', []):
                    stats['total'] += 1
                    project_name = result.get('projectName', 'Unknown browser')
                    
                    # Get final status (after retries)
                    final_result = result.get('results', [{}])[-1]
                    status = final_result.get('status', 'unknown')
                    
                    if status == 'passed':
                        stats['passed'] += 1
                    elif status == 'failed':
                        stats['failed'] += 1
                        
                        failure_info = extract_failure_info(final_result)
                        
                        failure_record = {
                            'test': test_title,
                            'file': test_file,
                            'line': test_line,
                            'browser': project_name,
                            'info': failure_info
                        }
                        
                        failures_by_browser[project_name].append(failure_record)
                        failures_by_test[f"{test_file}:{test_title}"].append(failure_record)
                        
                        # Extract error patterns
                        for error in failure_info['errors']:
                            msg = error['message']
                            # Try to extract key error patterns
                            if 'TimeoutError' in msg:
                                error_patterns['Timeout'] += 1
                            elif 'expect' in msg.lower():
                                error_patterns['Assertion'] += 1
                            elif 'locator' in msg.lower():
                                error_patterns['Locator'] += 1
                            elif 'navigation' in msg.lower():
                                error_patterns['Navigation'] += 1
                            else:
                                error_patterns['Other'] += 1
                                
                    elif status == 'timedOut':
                        stats['timedOut'] += 1
                    elif status == 'skipped':
                        stats['skipped'] += 1
                    
                    # Check if flaky (passed on retry)
                    if len(result.get('results', [])) > 1:
                        first_status = result['results'][0].get('status')
                        if first_status == 'failed' and status == 'passed':
                            stats['flaky'] += 1
    
    return {
        'stats': stats,
        'failures_by_browser': dict(failures_by_browser),
        'failures_by_test': dict(failures_by_test),
        'error_patterns': dict(error_patterns)
    }

def generate_markdown_report(analysis: Dict[str, Any], output_file: str) -> None:
    """Generate a markdown report of all failures."""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# E2E Test Failures Report\n\n")
        f.write(f"*Generated: {Path(output_file).stem}*\n\n")
        
        # Summary statistics
        stats = analysis['stats']
        f.write("## 📊 Summary Statistics\n\n")
        f.write(f"- **Total Tests**: {stats['total']}\n")
        
        if stats['total'] > 0:
            f.write(f"- **✅ Passed**: {stats['passed']} ({stats['passed']/stats['total']*100:.1f}%)\n")
            f.write(f"- **❌ Failed**: {stats['failed']} ({stats['failed']/stats['total']*100:.1f}%)\n")
        else:
            f.write(f"- **✅ Passed**: {stats['passed']} (0.0%)\n")
            f.write(f"- **❌ Failed**: {stats['failed']} (0.0%)\n")
        
        f.write(f"- **⚠️ Flaky** (passed on retry): {stats['flaky']}\n")
        f.write(f"- **⏱️ Timed Out**: {stats['timedOut']}\n")
        f.write(f"- **⏭️ Skipped**: {stats['skipped']}\n\n")
        
        # Error patterns
        error_patterns = analysis['error_patterns']
        if error_patterns:
            f.write("## 🔍 Error Patterns\n\n")
            for pattern, count in sorted(error_patterns.items(), key=lambda x: x[1], reverse=True):
                f.write(f"- **{pattern}**: {count} occurrences\n")
            f.write("\n")
        
        # Failures by browser
        failures_by_browser = analysis['failures_by_browser']
        if failures_by_browser:
            f.write("## 🌐 Failures by Browser/Device\n\n")
            for browser, failures in sorted(failures_by_browser.items()):
                f.write(f"### {browser} ({len(failures)} failures)\n\n")
            f.write("\n")
        
        # Detailed failures by test
        failures_by_test = analysis['failures_by_test']
        if failures_by_test:
            f.write("## 📋 Detailed Failures\n\n")
            
            for test_key, failures in sorted(failures_by_test.items()):
                test_file, test_name = test_key.split(':', 1)
                
                # Show which browsers failed for this test
                browsers_failed = [f['browser'] for f in failures]
                
                f.write(f"### ❌ {test_name}\n\n")
                f.write(f"**File**: `{test_file}`\n\n")
                f.write(f"**Failed on**: {', '.join(browsers_failed)}\n\n")
                
                # Show error details from first failure
                first_failure = failures[0]
                if first_failure['info']['errors']:
                    f.write("**Error Details**:\n\n")
                    for error in first_failure['info']['errors']:
                        f.write("```\n")
                        f.write(error['message'])
                        f.write("\n```\n\n")
                        
                        if error.get('snippet'):
                            f.write("**Code Snippet**:\n```typescript\n")
                            f.write(error['snippet'])
                            f.write("\n```\n\n")
                
                f.write("---\n\n")
        
        # Final summary
        if stats['failed'] == 0:
            f.write("## ✨ All Tests Passed!\n\n")
            f.write("No failures to report. Great job! 🎉\n")
        else:
            f.write("## 🎯 Next Steps\n\n")
            f.write("1. Review each failure above\n")
            f.write("2. Check if failures are consistent across browsers\n")
            f.write("3. Examine error patterns for common root causes\n")
            f.write("4. Update tests or fix application code\n")
            f.write("5. Re-run tests to verify fixes\n")

def main():
    """Main execution function."""
    input_file = Path(__file__).parent.parent / "test-results" / "results.json"
    output_file = Path(__file__).parent.parent / "E2E_FAILURES_REPORT.md"
    
    print(f"📖 Reading results from: {input_file}")
    
    if not input_file.exists():
        print(f"❌ Error: Results file not found at {input_file}")
        sys.exit(1)
    
    try:
        data = load_results(str(input_file))
        print("✅ Results loaded successfully")
        
        print("🔍 Analyzing test results...")
        analysis = analyze_results(data)
        
        print(f"📝 Generating report at: {output_file}")
        generate_markdown_report(analysis, str(output_file))
        
        print("\n" + "="*60)
        print("📊 SUMMARY")
        print("="*60)
        stats = analysis['stats']
        print(f"Total Tests:    {stats['total']}")
        
        if stats['total'] > 0:
            print(f"✅ Passed:      {stats['passed']} ({stats['passed']/stats['total']*100:.1f}%)")
            print(f"❌ Failed:      {stats['failed']} ({stats['failed']/stats['total']*100:.1f}%)")
        else:
            print(f"✅ Passed:      {stats['passed']} (0.0%)")
            print(f"❌ Failed:      {stats['failed']} (0.0%)")
        
        print(f"⚠️  Flaky:       {stats['flaky']}")
        print(f"⏱️  Timed Out:   {stats['timedOut']}")
        print("="*60)
        print(f"\n✨ Report generated: {output_file}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
