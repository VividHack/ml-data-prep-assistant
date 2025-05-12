import pandas as pd
import os
import tempfile
from datetime import datetime
import json

def generate_report(original_filepath, cleaned_filepath, applied_fixes):
    """
    Generate a PDF report summarizing the data quality issues and fixes.
    
    For the MVP, we'll create a simple HTML report instead of a PDF,
    which can be rendered in the browser.
    """
    # Read the original and cleaned data
    original_df = pd.read_csv(original_filepath)
    cleaned_df = pd.read_csv(cleaned_filepath)
    
    # Create a temporary file for the report
    report_dir = tempfile.gettempdir()
    report_filename = f"data_quality_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    report_path = os.path.join(report_dir, report_filename)
    
    # Calculate data quality metrics
    original_rows = len(original_df)
    cleaned_rows = len(cleaned_df)
    
    # Count missing values before and after
    original_missing = original_df.isna().sum().sum()
    cleaned_missing = cleaned_df.isna().sum().sum()
    
    # Count duplicates before and after
    original_duplicates = original_df.duplicated().sum()
    cleaned_duplicates = cleaned_df.duplicated().sum()
    
    # Generate summary statistics
    summary = {
        "original_rows": original_rows,
        "cleaned_rows": cleaned_rows,
        "rows_removed": original_rows - cleaned_rows,
        "original_missing_values": int(original_missing),
        "cleaned_missing_values": int(cleaned_missing),
        "original_duplicates": int(original_duplicates),
        "cleaned_duplicates": int(cleaned_duplicates),
        "applied_fixes": applied_fixes
    }
    
    # Generate the HTML report
    html_content = generate_html_report(
        original_filepath,
        cleaned_filepath,
        summary
    )
    
    # Write the HTML content to the report file
    with open(report_path, 'w') as f:
        f.write(html_content)
    
    return report_path

def generate_html_report(original_filepath, cleaned_filepath, summary):
    """Generate an HTML report with data quality information."""
    
    # Format applied fixes for display
    fixes_html = ""
    if summary["applied_fixes"]:
        for fix in summary["applied_fixes"]:
            issue_type = fix.get("issue_type", "")
            
            if issue_type == "missing_values":
                fixes_html += f"""
                <div class="fix-item">
                    <h4>Missing Values Fix - Column: {fix.get('column', '')}</h4>
                    <p>Method: {fix.get('fix_method', '')}</p>
                    <p>Count: {fix.get('count', 0)} values</p>
                    {f"<p>Replaced with: {fix.get('constant_value', '')}</p>" if fix.get('fix_method') == 'constant' else ""}
                </div>
                """
            elif issue_type == "duplicates":
                fixes_html += f"""
                <div class="fix-item">
                    <h4>Duplicates Fix</h4>
                    <p>Method: {fix.get('fix_method', '')}</p>
                    <p>Count: {fix.get('count', 0)} rows</p>
                </div>
                """
            elif issue_type == "outliers":
                fixes_html += f"""
                <div class="fix-item">
                    <h4>Outliers Fix - Column: {fix.get('column', '')}</h4>
                    <p>Method: {fix.get('fix_method', '')}</p>
                    <p>Count: {fix.get('count', 0)} values</p>
                    {f"<p>Lower bound: {fix.get('lower_bound', '')} / Upper bound: {fix.get('upper_bound', '')}</p>" if fix.get('fix_method') == 'cap' else ""}
                </div>
                """
            elif issue_type == "inconsistent_formats":
                fixes_html += f"""
                <div class="fix-item">
                    <h4>Format Standardization - Column: {fix.get('column', '')}</h4>
                    <p>Method: {fix.get('fix_method', '')}</p>
                    <p>Format: {fix.get('format', '')}</p>
                </div>
                """
    
    # Create overall data quality score (simple version for MVP)
    original_quality_score = calculate_quality_score(
        summary["original_rows"],
        summary["original_missing_values"],
        summary["original_duplicates"]
    )
    
    cleaned_quality_score = calculate_quality_score(
        summary["cleaned_rows"],
        summary["cleaned_missing_values"],
        summary["cleaned_duplicates"]
    )
    
    # Generate the HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Data Quality Report</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }}
            h1, h2, h3 {{
                color: #2c3e50;
            }}
            .report-header {{
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }}
            .summary-section {{
                display: flex;
                justify-content: space-around;
                margin-bottom: 30px;
            }}
            .summary-card {{
                background-color: #f9f9f9;
                border-radius: 5px;
                padding: 20px;
                width: 30%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .quality-score {{
                font-size: 36px;
                font-weight: bold;
                color: #27ae60;
                text-align: center;
                margin: 10px 0;
            }}
            .fixes-section {{
                margin-bottom: 30px;
            }}
            .fix-item {{
                background-color: #f9f9f9;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }}
            .fix-item h4 {{
                margin-top: 0;
                color: #3498db;
            }}
            .recommendations {{
                background-color: #eaf7fd;
                border-radius: 5px;
                padding: 20px;
            }}
            .recommendations ul {{
                padding-left: 20px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            th, td {{
                padding: 10px;
                border: 1px solid #ddd;
                text-align: left;
            }}
            th {{
                background-color: #f2f2f2;
            }}
        </style>
    </head>
    <body>
        <div class="report-header">
            <h1>Data Quality Report</h1>
            <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Original file: {os.path.basename(original_filepath)}</p>
            <p>Cleaned file: {os.path.basename(cleaned_filepath)}</p>
        </div>
        
        <div class="summary-section">
            <div class="summary-card">
                <h3>Original Data Quality</h3>
                <div class="quality-score">{original_quality_score}%</div>
                <table>
                    <tr>
                        <td>Rows:</td>
                        <td>{summary["original_rows"]}</td>
                    </tr>
                    <tr>
                        <td>Missing Values:</td>
                        <td>{summary["original_missing_values"]}</td>
                    </tr>
                    <tr>
                        <td>Duplicates:</td>
                        <td>{summary["original_duplicates"]}</td>
                    </tr>
                </table>
            </div>
            
            <div class="summary-card">
                <h3>Changes Applied</h3>
                <table>
                    <tr>
                        <td>Rows Removed:</td>
                        <td>{summary["rows_removed"]}</td>
                    </tr>
                    <tr>
                        <td>Missing Values Fixed:</td>
                        <td>{summary["original_missing_values"] - summary["cleaned_missing_values"]}</td>
                    </tr>
                    <tr>
                        <td>Duplicates Removed:</td>
                        <td>{summary["original_duplicates"] - summary["cleaned_duplicates"]}</td>
                    </tr>
                    <tr>
                        <td>Total Fixes Applied:</td>
                        <td>{len(summary["applied_fixes"])}</td>
                    </tr>
                </table>
            </div>
            
            <div class="summary-card">
                <h3>Cleaned Data Quality</h3>
                <div class="quality-score">{cleaned_quality_score}%</div>
                <table>
                    <tr>
                        <td>Rows:</td>
                        <td>{summary["cleaned_rows"]}</td>
                    </tr>
                    <tr>
                        <td>Missing Values:</td>
                        <td>{summary["cleaned_missing_values"]}</td>
                    </tr>
                    <tr>
                        <td>Duplicates:</td>
                        <td>{summary["cleaned_duplicates"]}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="fixes-section">
            <h2>Applied Fixes</h2>
            {fixes_html if fixes_html else "<p>No fixes were applied to the dataset.</p>"}
        </div>
        
        <div class="recommendations">
            <h2>Recommendations for Further Cleaning</h2>
            <ul>
                {f"<li>There are still {summary['cleaned_missing_values']} missing values in the dataset. Consider applying additional imputation methods.</li>" if summary['cleaned_missing_values'] > 0 else ""}
                {f"<li>There are still {summary['cleaned_duplicates']} duplicate rows in the dataset. Consider removing them for better analysis.</li>" if summary['cleaned_duplicates'] > 0 else ""}
                <li>Review the distribution of numeric columns to ensure the data makes sense for your analysis.</li>
                <li>Consider feature engineering to derive new variables from the existing data.</li>
                <li>Examine correlations between variables to identify potential redundancies.</li>
            </ul>
        </div>
    </body>
    </html>
    """
    
    return html_content

def calculate_quality_score(total_rows, missing_values, duplicates):
    """
    Calculate a simple data quality score (0-100%).
    For the MVP, this is a basic calculation that could be enhanced later.
    """
    if total_rows == 0:
        return 0
    
    # Calculate percentage of clean data points
    total_cells = total_rows * 10  # Assume 10 columns on average
    problematic_cells = missing_values + duplicates
    
    quality_percentage = 100 - min(100, (problematic_cells / total_cells) * 100)
    
    return round(quality_percentage, 1) 