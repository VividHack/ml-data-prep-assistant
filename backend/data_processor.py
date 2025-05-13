import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.impute import KNNImputer
from collections import defaultdict

def get_data_summary(df):
    """
    Generate a summary of the dataframe including basic stats and column info.
    """
    summary = {
        'rows': len(df),
        'columns': len(df.columns),
        'column_info': []
    }
    
    for col in df.columns:
        col_data = {
            'name': col,
            'dtype': str(df[col].dtype),
            'missing_values': int(df[col].isna().sum()),
            'missing_percentage': float(df[col].isna().mean() * 100),
            'unique_values': int(df[col].nunique())
        }
        
        # Add numeric stats if applicable
        if pd.api.types.is_numeric_dtype(df[col]):
            col_data.update({
                'min': float(df[col].min()) if not pd.isna(df[col].min()) else None,
                'max': float(df[col].max()) if not pd.isna(df[col].max()) else None,
                'mean': float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                'median': float(df[col].median()) if not pd.isna(df[col].median()) else None,
                'std': float(df[col].std()) if not pd.isna(df[col].std()) else None
            })
        
        # Add sample values
        sample_values = df[col].dropna().sample(min(5, df[col].nunique())).tolist()
        col_data['sample_values'] = [str(val) for val in sample_values]
        
        summary['column_info'].append(col_data)
    
    return summary

def detect_missing_values(df):
    """
    Detect columns with missing values.
    """
    missing_values = {}
    
    for col in df.columns:
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            missing_values[col] = {
                'count': int(missing_count),
                'percentage': float(missing_count / len(df) * 100),
                'issue_type': 'missing_values'
            }
    
    return missing_values

def detect_duplicates(df):
    """
    Detect duplicate rows in the dataframe.
    """
    duplicates = {}
    
    if df.duplicated().any():
        duplicate_count = df.duplicated().sum()
        duplicates['rows'] = {
            'count': int(duplicate_count),
            'percentage': float(duplicate_count / len(df) * 100),
            'issue_type': 'duplicates',
            'example_indices': df[df.duplicated(keep='first')].index[:5].tolist()
        }
    
    return duplicates

def detect_outliers(df):
    """
    Detect outliers in numeric columns using Isolation Forest.
    """
    outliers = {}
    numeric_cols = df.select_dtypes(include=['number']).columns
    
    if len(numeric_cols) > 0:
        for col in numeric_cols:
            if df[col].isna().sum() < len(df) * 0.5:  # Skip if more than 50% missing
                try:
                    # Reshape data for Isolation Forest
                    X = df[col].dropna().values.reshape(-1, 1)
                    
                    # Apply Isolation Forest
                    iso_forest = IsolationForest(contamination=0.1, random_state=42)
                    outliers_pred = iso_forest.fit_predict(X)
                    
                    # Get indexes of outliers
                    outlier_indexes = np.where(outliers_pred == -1)[0]
                    
                    if len(outlier_indexes) > 0:
                        # Get the actual values of the outliers
                        outlier_values = X[outlier_indexes].flatten()
                        
                        outliers[col] = {
                            'count': int(len(outlier_indexes)),
                            'percentage': float(len(outlier_indexes) / len(X) * 100),
                            'issue_type': 'outliers',
                            'example_values': outlier_values[:5].tolist()
                        }
                except Exception as e:
                    # Skip columns where outlier detection fails
                    continue
    
    return outliers

def detect_inconsistent_formats(df):
    """
    Detect inconsistent formats in string columns (e.g., dates, phone numbers).
    """
    inconsistent_formats = {}
    
    # Function to check for different date formats
    def has_different_date_formats(series):
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{2}-\d{2}-\d{4}'   # DD-MM-YYYY
        ]
        
        found_patterns = defaultdict(int)
        for val in series.dropna():
            for pattern in date_patterns:
                if pd.Series([str(val)]).str.match(pattern).any():
                    found_patterns[pattern] += 1
                    break
        
        return len(found_patterns) > 1, found_patterns
    
    # Check string columns for inconsistent formats
    for col in df.select_dtypes(include=['object']).columns:
        # Try to identify date columns
        has_diff_dates, patterns = has_different_date_formats(df[col])
        
        if has_diff_dates:
            inconsistent_formats[col] = {
                'issue_type': 'inconsistent_format',
                'format_type': 'date',
                'patterns': {str(k): int(v) for k, v in patterns.items()},
                'example_values': df[col].dropna().sample(min(5, df[col].nunique())).tolist()
            }
    
    return inconsistent_formats

def detect_issues(df):
    """
    Detect all issues in the dataframe.
    """
    issues = {}
    
    # Detect missing values
    missing = detect_missing_values(df)
    if missing:
        issues['missing_values'] = missing
    
    # Detect duplicates
    duplicates = detect_duplicates(df)
    if duplicates:
        issues['duplicates'] = duplicates
    
    # Detect outliers
    outliers = detect_outliers(df)
    if outliers:
        issues['outliers'] = outliers
    
    # Detect inconsistent formats
    inconsistent_formats = detect_inconsistent_formats(df)
    if inconsistent_formats:
        issues['inconsistent_formats'] = inconsistent_formats
    
    return issues

def suggest_fixes(df, issues):
    """
    Suggest fixes for the detected issues.
    """
    fixes = {}
    
    # Suggest fixes for missing values
    if 'missing_values' in issues:
        fixes['missing_values'] = {}
        for col, info in issues['missing_values'].items():
            # Determine imputation method based on column type
            if pd.api.types.is_numeric_dtype(df[col]):
                fixes['missing_values'][col] = {
                    'options': [
                        {'method': 'mean', 'description': f'Replace with mean value ({df[col].mean():.2f})'},
                        {'method': 'median', 'description': f'Replace with median value ({df[col].median():.2f})'},
                        {'method': 'knn', 'description': 'Use K-Nearest Neighbors imputation'},
                        {'method': 'drop', 'description': 'Drop rows with missing values'},
                    ]
                }
            else:
                # For categorical/string columns
                most_common = df[col].mode()[0] if not df[col].mode().empty else None
                fixes['missing_values'][col] = {
                    'options': [
                        {'method': 'mode', 'description': f'Replace with most common value ("{most_common}")'},
                        {'method': 'constant', 'value': 'Unknown', 'description': 'Replace with "Unknown"'},
                        {'method': 'drop', 'description': 'Drop rows with missing values'},
                    ]
                }
    
    # Suggest fixes for duplicates
    if 'duplicates' in issues:
        fixes['duplicates'] = {
            'rows': {
                'options': [
                    {'method': 'drop_first', 'description': 'Keep first occurrence, drop duplicates'},
                    {'method': 'drop_last', 'description': 'Keep last occurrence, drop duplicates'},
                    {'method': 'none', 'description': 'Keep all duplicates (no action)'}
                ]
            }
        }
    
    # Suggest fixes for outliers
    if 'outliers' in issues:
        fixes['outliers'] = {}
        for col, info in issues['outliers'].items():
            fixes['outliers'][col] = {
                'options': [
                    {'method': 'cap', 'description': f'Cap outliers at Q3 + 1.5*IQR or floor at Q1 - 1.5*IQR'},
                    {'method': 'remove', 'description': 'Remove rows with outlier values'},
                    {'method': 'none', 'description': 'Keep outliers (no action)'}
                ]
            }
    
    # Suggest fixes for inconsistent formats
    if 'inconsistent_formats' in issues:
        fixes['inconsistent_formats'] = {}
        for col, info in issues['inconsistent_formats'].items():
            if info['format_type'] == 'date':
                fixes['inconsistent_formats'][col] = {
                    'options': [
                        {'method': 'standardize_date_yyyy_mm_dd', 'format': '%Y-%m-%d', 'description': 'Standardize to YYYY-MM-DD format'},
                        {'method': 'standardize_date_mm_dd_yyyy', 'format': '%m/%d/%Y', 'description': 'Standardize to MM/DD/YYYY format'},
                        {'method': 'none', 'description': 'Keep as is (no action)'}
                    ]
                }
    
    return fixes

def apply_fixes(df, fixes):
    """
    Apply the selected fixes to the dataframe.
    """
    applied_fixes = []
    df_copy = df.copy()
    
    # Apply fixes for missing values
    if 'missing_values' in fixes:
        for col, fix_info in fixes['missing_values'].items():
            selected_fix = fix_info.get('selected')
            if selected_fix:
                method = selected_fix.get('method')
                
                if method == 'mean':
                    df_copy[col] = df_copy[col].fillna(df_copy[col].mean())
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'missing_values',
                        'fix_method': 'mean',
                        'count': int(df[col].isna().sum())
                    })
                
                elif method == 'median':
                    df_copy[col] = df_copy[col].fillna(df_copy[col].median())
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'missing_values',
                        'fix_method': 'median',
                        'count': int(df[col].isna().sum())
                    })
                
                elif method == 'mode':
                    mode_value = df_copy[col].mode()[0] if not df_copy[col].mode().empty else None
                    df_copy[col] = df_copy[col].fillna(mode_value)
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'missing_values',
                        'fix_method': 'mode',
                        'count': int(df[col].isna().sum())
                    })
                
                elif method == 'constant':
                    value = selected_fix.get('value', 'Unknown')
                    df_copy[col] = df_copy[col].fillna(value)
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'missing_values',
                        'fix_method': 'constant',
                        'constant_value': value,
                        'count': int(df[col].isna().sum())
                    })
                
                elif method == 'knn':
                    # Only apply KNN to numeric columns
                    if pd.api.types.is_numeric_dtype(df_copy[col]):
                        # Get numeric columns for KNN imputation
                        numeric_cols = df_copy.select_dtypes(include=['number']).columns
                        
                        # Prepare data for KNN imputation
                        X = df_copy[numeric_cols].copy()
                        
                        # Apply KNN imputation
                        imputer = KNNImputer(n_neighbors=5)
                        X_imputed = imputer.fit_transform(X)
                        
                        # Update the dataframe with imputed values
                        for i, num_col in enumerate(numeric_cols):
                            # Only update the target column
                            if num_col == col:
                                df_copy[col] = X_imputed[:, i]
                        
                        applied_fixes.append({
                            'column': col,
                            'issue_type': 'missing_values',
                            'fix_method': 'knn',
                            'count': int(df[col].isna().sum())
                        })
                
                elif method == 'drop':
                    df_copy = df_copy.dropna(subset=[col])
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'missing_values',
                        'fix_method': 'drop',
                        'count': int(df[col].isna().sum())
                    })
    
    # Apply fixes for duplicates
    if 'duplicates' in fixes and 'rows' in fixes['duplicates']:
        fix_info = fixes['duplicates']['rows']
        selected_fix = fix_info.get('selected')
        
        if selected_fix:
            method = selected_fix.get('method')
            
            if method == 'drop_first':
                dup_count = df_copy.duplicated().sum()
                df_copy = df_copy.drop_duplicates(keep='first')
                applied_fixes.append({
                    'issue_type': 'duplicates',
                    'fix_method': 'drop_first',
                    'count': int(dup_count)
                })
            
            elif method == 'drop_last':
                dup_count = df_copy.duplicated().sum()
                df_copy = df_copy.drop_duplicates(keep='last')
                applied_fixes.append({
                    'issue_type': 'duplicates',
                    'fix_method': 'drop_last',
                    'count': int(dup_count)
                })
    
    # Apply fixes for outliers
    if 'outliers' in fixes:
        for col, fix_info in fixes['outliers'].items():
            selected_fix = fix_info.get('selected')
            
            if selected_fix and pd.api.types.is_numeric_dtype(df_copy[col]):
                method = selected_fix.get('method')
                
                if method == 'cap':
                    # Calculate IQR
                    Q1 = df_copy[col].quantile(0.25)
                    Q3 = df_copy[col].quantile(0.75)
                    IQR = Q3 - Q1
                    
                    # Define bounds
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    
                    # Count outliers
                    outliers_count = ((df_copy[col] < lower_bound) | (df_copy[col] > upper_bound)).sum()
                    
                    # Cap/floor values
                    df_copy[col] = df_copy[col].clip(lower=lower_bound, upper=upper_bound)
                    
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'outliers',
                        'fix_method': 'cap',
                        'lower_bound': float(lower_bound),
                        'upper_bound': float(upper_bound),
                        'count': int(outliers_count)
                    })
                
                elif method == 'remove':
                    # Get condition for rows without outliers (using Isolation Forest)
                    X = df_copy[col].dropna().values.reshape(-1, 1)
                    iso_forest = IsolationForest(contamination=0.1, random_state=42)
                    outliers_pred = iso_forest.fit_predict(X)
                    
                    # Get original index positions of non-outliers
                    non_outlier_indices = df_copy[col].dropna().index[outliers_pred == 1]
                    
                    # Count outliers removed
                    outliers_count = len(df_copy) - len(non_outlier_indices)
                    
                    # Keep only non-outlier rows
                    df_copy = df_copy.loc[df_copy.index.isin(non_outlier_indices)]
                    
                    applied_fixes.append({
                        'column': col,
                        'issue_type': 'outliers',
                        'fix_method': 'remove',
                        'count': int(outliers_count)
                    })
    
    # Apply fixes for inconsistent formats
    if 'inconsistent_formats' in fixes:
        for col, fix_info in fixes['inconsistent_formats'].items():
            selected_fix = fix_info.get('selected')
            
            if selected_fix:
                method = selected_fix.get('method')
                
                if method == 'standardize_date_yyyy_mm_dd':
                    output_format = selected_fix.get('format')
                    
                    try:
                        # Make a copy of the current column state to parse from
                        source_column_for_parsing = df_copy[col].copy()

                        # This Series will store the datetime objects after successful parsing by any format.
                        parsed_datetime_objects = pd.Series([pd.NaT] * len(df_copy), index=df_copy.index, dtype='datetime64[ns]')
                        
                        input_formats_to_try = ['%Y-%m-%d', '%m/%d/%Y', '%d-%m-%Y'] 

                        for fmt in input_formats_to_try:
                            current_format_parse_results = pd.to_datetime(source_column_for_parsing, format=fmt, errors='coerce')
                            newly_parsed_mask = current_format_parse_results.notna() & parsed_datetime_objects.isna()
                            parsed_datetime_objects.loc[newly_parsed_mask] = current_format_parse_results[newly_parsed_mask]

                        successfully_converted_mask = parsed_datetime_objects.notna()
                        
                        if successfully_converted_mask.any():
                             df_copy.loc[successfully_converted_mask, col] = parsed_datetime_objects[successfully_converted_mask].dt.strftime(output_format)
                        
                        applied_fixes.append({
                            'column': col,
                            'issue_type': 'inconsistent_formats',
                            'fix_method': 'standardize_date_yyyy_mm_dd',
                            'format': output_format
                        })
                    except Exception as e:
                        # Skip if format standardization fails
                        pass
                elif method == 'standardize_date_mm_dd_yyyy':
                    output_format = selected_fix.get('format')
                    
                    try:
                        # Make a copy of the current column state to parse from
                        source_column_for_parsing = df_copy[col].copy()

                        # This Series will store the datetime objects after successful parsing by any format.
                        parsed_datetime_objects = pd.Series([pd.NaT] * len(df_copy), index=df_copy.index, dtype='datetime64[ns]')
                        
                        input_formats_to_try = ['%Y-%m-%d', '%m/%d/%Y', '%d-%m-%Y']

                        for fmt in input_formats_to_try:
                            current_format_parse_results = pd.to_datetime(source_column_for_parsing, format=fmt, errors='coerce')
                            newly_parsed_mask = current_format_parse_results.notna() & parsed_datetime_objects.isna()
                            parsed_datetime_objects.loc[newly_parsed_mask] = current_format_parse_results[newly_parsed_mask]
                        
                        successfully_converted_mask = parsed_datetime_objects.notna()

                        if successfully_converted_mask.any():
                            df_copy.loc[successfully_converted_mask, col] = parsed_datetime_objects[successfully_converted_mask].dt.strftime(output_format)
                        
                        applied_fixes.append({
                            'column': col,
                            'issue_type': 'inconsistent_formats',
                            'fix_method': 'standardize_date_mm_dd_yyyy',
                            'format': output_format
                        })
                    except Exception as e:
                        # Skip if format standardization fails
                        pass
    
    return df_copy, applied_fixes 