"""
Comprehensive validation engine for CookSheet
Validates clients, workers, tasks data with detailed error reporting
"""

import pandas as pd
import json
import re
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass


@dataclass
class ValidationError:
    """Represents a validation error with location and details"""
    row_index: int
    column: str
    error_type: str
    message: str
    severity: str  # 'critical', 'warning', 'info'
    suggested_fix: Optional[str] = None
    cell_value: Any = None


class DataAlchemistValidator:
    """Main validation engine for all data types"""
    
    def __init__(self):
        self.errors: List[ValidationError] = []
        self.warnings: List[ValidationError] = []
        
    def validate_all_data(self, 
                         clients_data: List[Dict], 
                         workers_data: List[Dict], 
                         tasks_data: List[Dict]) -> Dict[str, Any]:
        """Validate all datasets and return comprehensive results"""
        
        self.errors = []
        self.warnings = []
        
        # Convert to DataFrames for easier processing
        clients_df = pd.DataFrame(clients_data) if clients_data else pd.DataFrame()
        workers_df = pd.DataFrame(workers_data) if workers_data else pd.DataFrame()
        tasks_df = pd.DataFrame(tasks_data) if tasks_data else pd.DataFrame()
        
        # Core validations
        self._validate_required_columns(clients_df, 'clients')
        self._validate_required_columns(workers_df, 'workers') 
        self._validate_required_columns(tasks_df, 'tasks')
        
        self._validate_duplicate_ids(clients_df, 'clients')
        self._validate_duplicate_ids(workers_df, 'workers')
        self._validate_duplicate_ids(tasks_df, 'tasks')
        
        self._validate_data_types(clients_df, 'clients')
        self._validate_data_types(workers_df, 'workers')
        self._validate_data_types(tasks_df, 'tasks')
        
        self._validate_json_fields(clients_df, 'clients')
        self._validate_json_fields(workers_df, 'workers') 
        self._validate_json_fields(tasks_df, 'tasks')
        
        self._validate_references(clients_df, workers_df, tasks_df)
        self._validate_ranges(clients_df, workers_df, tasks_df)
        self._validate_business_rules(clients_df, workers_df, tasks_df)
        
        return self._generate_validation_report()
    
    def _validate_required_columns(self, df: pd.DataFrame, data_type: str):
        """Validate required columns exist and are not empty"""
        required_fields = {
            'clients': ['ClientID', 'Name'],
            'workers': ['WorkerID', 'Name', 'Skills', 'MaxLoad'],
            'tasks': ['TaskID', 'ClientID', 'Duration', 'Priority']
        }
        
        if data_type not in required_fields or df.empty:
            return
            
        required = required_fields[data_type]
        
        # Check missing columns
        missing_cols = [col for col in required if col not in df.columns]
        for col in missing_cols:
            self.errors.append(ValidationError(
                row_index=-1,
                column=col,
                error_type='missing_column',
                message=f"Required column '{col}' is missing from {data_type}",
                severity='critical',
                suggested_fix=f"Add column '{col}' to your {data_type} data"
            ))
        
        # Check empty required fields
        for col in required:
            if col in df.columns:
                empty_rows = df[df[col].isna() | (df[col] == '')].index.tolist()
                for row_idx in empty_rows:
                    self.errors.append(ValidationError(
                        row_index=row_idx,
                        column=col,
                        error_type='missing_value',
                        message=f"Required field '{col}' is empty",
                        severity='critical',
                        suggested_fix=f"Add a value for {col}",
                        cell_value=df.iloc[row_idx][col] if col in df.columns else None
                    ))
    
    def _validate_duplicate_ids(self, df: pd.DataFrame, data_type: str):
        """Check for duplicate IDs"""
        id_columns = {
            'clients': 'ClientID',
            'workers': 'WorkerID', 
            'tasks': 'TaskID'
        }
        
        if data_type not in id_columns or df.empty:
            return
            
        id_col = id_columns[data_type]
        if id_col not in df.columns:
            return
            
        duplicates = df[df[id_col].duplicated(keep=False)]
        for idx, row in duplicates.iterrows():
            self.errors.append(ValidationError(
                row_index=idx,
                column=id_col,
                error_type='duplicate_id',
                message=f"Duplicate {id_col}: '{row[id_col]}'",
                severity='critical',
                suggested_fix=f"Make {id_col} unique",
                cell_value=row[id_col]
            ))
    
    def _validate_data_types(self, df: pd.DataFrame, data_type: str):
        """Validate data types and numeric fields"""
        numeric_fields = {
            'workers': ['MaxLoad', 'CurrentLoad'],
            'tasks': ['Duration', 'Priority']
        }
        
        if data_type not in numeric_fields or df.empty:
            return
            
        for field in numeric_fields[data_type]:
            if field not in df.columns:
                continue
                
            for idx, value in df[field].items():
                if pd.isna(value):
                    continue
                    
                try:
                    num_val = float(value)
                    if num_val < 0:
                        self.errors.append(ValidationError(
                            row_index=idx,
                            column=field,
                            error_type='negative_value',
                            message=f"{field} cannot be negative: {value}",
                            severity='critical',
                            suggested_fix=f"Set {field} to a positive number",
                            cell_value=value
                        ))
                except (ValueError, TypeError):
                    self.errors.append(ValidationError(
                        row_index=idx,
                        column=field,
                        error_type='invalid_type',
                        message=f"'{value}' is not a valid number for {field}",
                        severity='critical',
                        suggested_fix="Enter a numeric value",
                        cell_value=value
                    ))
    
    def _validate_json_fields(self, df: pd.DataFrame, data_type: str):
        """Validate JSON formatted fields"""
        json_fields = {
            'workers': ['Skills', 'Availability'],
            'tasks': ['RequestedTaskIDs', 'Dependencies']
        }
        
        if data_type not in json_fields or df.empty:
            return
            
        for field in json_fields[data_type]:
            if field not in df.columns:
                continue
                
            for idx, value in df[field].items():
                if pd.isna(value) or value == '':
                    continue
                    
                try:
                    if isinstance(value, str):
                        # Try to parse as JSON list
                        parsed = json.loads(value)
                        if not isinstance(parsed, list):
                            self.warnings.append(ValidationError(
                                row_index=idx,
                                column=field,
                                error_type='json_format',
                                message=f"{field} should be a JSON list",
                                severity='warning',
                                suggested_fix=f"Format as JSON list: [\"item1\", \"item2\"]",
                                cell_value=value
                            ))
                except json.JSONDecodeError:
                    # Try comma-separated values
                    if ',' in str(value):
                        self.warnings.append(ValidationError(
                            row_index=idx,
                            column=field,
                            error_type='json_parse_error',
                            message=f"Could not parse {field} as JSON: {value}",
                            severity='warning',
                            suggested_fix=f"Use JSON format: [\"item1\", \"item2\"] or fix syntax",
                            cell_value=value
                        ))
    
    def _validate_references(self, clients_df: pd.DataFrame, workers_df: pd.DataFrame, tasks_df: pd.DataFrame):
        """Validate cross-references between datasets"""
        
        # Get valid IDs
        valid_client_ids = set(clients_df['ClientID'].dropna()) if 'ClientID' in clients_df.columns else set()
        valid_worker_ids = set(workers_df['WorkerID'].dropna()) if 'WorkerID' in workers_df.columns else set()
        valid_task_ids = set(tasks_df['TaskID'].dropna()) if 'TaskID' in tasks_df.columns else set()
        
        # Validate ClientID references in tasks
        if 'ClientID' in tasks_df.columns and valid_client_ids:
            for idx, client_id in tasks_df['ClientID'].items():
                if pd.notna(client_id) and client_id not in valid_client_ids:
                    self.errors.append(ValidationError(
                        row_index=idx,
                        column='ClientID',
                        error_type='invalid_reference',
                        message=f"ClientID '{client_id}' not found in clients data",
                        severity='critical',
                        suggested_fix="Use a valid ClientID from clients data",
                        cell_value=client_id
                    ))
        
        # Validate RequestedTaskIDs in tasks
        if 'RequestedTaskIDs' in tasks_df.columns and valid_task_ids:
            for idx, requested_ids in tasks_df['RequestedTaskIDs'].items():
                if pd.isna(requested_ids) or requested_ids == '':
                    continue
                    
                try:
                    if isinstance(requested_ids, str):
                        parsed_ids = json.loads(requested_ids)
                    else:
                        parsed_ids = requested_ids
                        
                    if isinstance(parsed_ids, list):
                        for task_id in parsed_ids:
                            if task_id not in valid_task_ids:
                                self.errors.append(ValidationError(
                                    row_index=idx,
                                    column='RequestedTaskIDs',
                                    error_type='invalid_task_reference',
                                    message=f"Referenced TaskID '{task_id}' not found",
                                    severity='critical',
                                    suggested_fix="Use valid TaskIDs from tasks data",
                                    cell_value=requested_ids
                                ))
                except (json.JSONDecodeError, TypeError):
                    continue  # Already handled in JSON validation
    
    def _validate_ranges(self, clients_df: pd.DataFrame, workers_df: pd.DataFrame, tasks_df: pd.DataFrame):
        """Validate value ranges and constraints"""
        
        # Task duration validation
        if 'Duration' in tasks_df.columns:
            for idx, duration in tasks_df['Duration'].items():
                if pd.notna(duration):
                    try:
                        dur_val = float(duration)
                        if dur_val < 1:
                            self.errors.append(ValidationError(
                                row_index=idx,
                                column='Duration',
                                error_type='out_of_range',
                                message=f"Duration must be at least 1: {duration}",
                                severity='critical',
                                suggested_fix="Set duration to 1 or higher",
                                cell_value=duration
                            ))
                        elif dur_val > 100:
                            self.warnings.append(ValidationError(
                                row_index=idx,
                                column='Duration',
                                error_type='suspicious_value',
                                message=f"Duration seems very high: {duration}",
                                severity='warning',
                                suggested_fix="Verify if this duration is correct",
                                cell_value=duration
                            ))
                    except (ValueError, TypeError):
                        continue  # Handled in type validation
        
        # Priority validation
        if 'Priority' in tasks_df.columns:
            for idx, priority in tasks_df['Priority'].items():
                if pd.notna(priority):
                    if str(priority).lower() not in ['high', 'medium', 'low', '1', '2', '3']:
                        self.errors.append(ValidationError(
                            row_index=idx,
                            column='Priority',
                            error_type='invalid_priority',
                            message=f"Invalid priority value: {priority}",
                            severity='critical',
                            suggested_fix="Use: high, medium, low, or 1-3",
                            cell_value=priority
                        ))
    
    def _validate_business_rules(self, clients_df: pd.DataFrame, workers_df: pd.DataFrame, tasks_df: pd.DataFrame):
        """Validate business logic and constraints"""
        
        # Check worker overload
        if 'MaxLoad' in workers_df.columns and 'CurrentLoad' in workers_df.columns:
            for idx, row in workers_df.iterrows():
                max_load = row.get('MaxLoad')
                current_load = row.get('CurrentLoad', 0)
                
                if pd.notna(max_load) and pd.notna(current_load):
                    try:
                        if float(current_load) > float(max_load):
                            self.warnings.append(ValidationError(
                                row_index=idx,
                                column='CurrentLoad',
                                error_type='overload_warning',
                                message=f"Worker overloaded: {current_load}/{max_load}",
                                severity='warning',
                                suggested_fix="Reduce CurrentLoad or increase MaxLoad",
                                cell_value=current_load
                            ))
                    except (ValueError, TypeError):
                        continue
        
        # Check for conflicting task dependencies
        if 'Dependencies' in tasks_df.columns and 'TaskID' in tasks_df.columns:
            task_ids = set(tasks_df['TaskID'].dropna())
            
            for idx, deps in tasks_df['Dependencies'].items():
                if pd.isna(deps) or deps == '':
                    continue
                    
                try:
                    task_id = tasks_df.iloc[idx]['TaskID']
                    if isinstance(deps, str):
                        parsed_deps = json.loads(deps)
                    else:
                        parsed_deps = deps
                        
                    if isinstance(parsed_deps, list) and task_id in parsed_deps:
                        self.errors.append(ValidationError(
                            row_index=idx,
                            column='Dependencies',
                            error_type='circular_dependency',
                            message=f"Task {task_id} cannot depend on itself",
                            severity='critical',
                            suggested_fix="Remove self-reference from dependencies",
                            cell_value=deps
                        ))
                except (json.JSONDecodeError, TypeError, KeyError):
                    continue
    
    def _generate_validation_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        
        all_issues = self.errors + self.warnings
        
        # Group errors by type
        error_summary = {}
        for error in all_issues:
            error_type = error.error_type
            if error_type not in error_summary:
                error_summary[error_type] = {
                    'count': 0,
                    'severity': error.severity,
                    'examples': []
                }
            error_summary[error_type]['count'] += 1
            if len(error_summary[error_type]['examples']) < 3:
                error_summary[error_type]['examples'].append({
                    'row': error.row_index,
                    'column': error.column,
                    'message': error.message
                })
        
        return {
            'is_valid': len(self.errors) == 0,
            'total_errors': len(self.errors),
            'total_warnings': len(self.warnings),
            'errors': [
                {
                    'row_index': e.row_index,
                    'column': e.column,
                    'error_type': e.error_type,
                    'message': e.message,
                    'severity': e.severity,
                    'suggested_fix': e.suggested_fix,
                    'cell_value': e.cell_value
                }
                for e in self.errors
            ],
            'warnings': [
                {
                    'row_index': w.row_index,
                    'column': w.column,
                    'error_type': w.error_type,
                    'message': w.message,
                    'severity': w.severity,
                    'suggested_fix': w.suggested_fix,
                    'cell_value': w.cell_value
                }
                for w in self.warnings
            ],
            'summary': error_summary,
            'recommendations': self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations based on validation results"""
        recommendations = []
        
        if len(self.errors) > 0:
            recommendations.append(f"🚨 Fix {len(self.errors)} critical errors before proceeding")
        
        if len(self.warnings) > 0:
            recommendations.append(f"⚠️ Review {len(self.warnings)} warnings for data quality")
        
        return recommendations


def validate_data_comprehensive(clients_data: List[Dict], 
                               workers_data: List[Dict], 
                               tasks_data: List[Dict]) -> Dict[str, Any]:
    """Main validation function for external use"""
    validator = DataAlchemistValidator()
    return validator.validate_all_data(clients_data, workers_data, tasks_data) 