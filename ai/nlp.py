# Natural language rule parser using OpenAI or mock logic

import re
from typing import Dict, Any, List

def parse_rule(nl_query: str) -> Dict[str, Any]:
    """
    Parse natural language query into structured rule
    This is a mock implementation - would integrate with OpenAI in production
    """
    query_lower = nl_query.lower()
    
    # Initialize result structure
    result = {
        "original_query": nl_query,
        "parsed_intent": None,
        "entities": [],
        "parameters": {},
        "confidence": 0.5
    }
    
    # Extract task entities (T12, T14, etc.)
    task_pattern = r't\d+|task\s*\d+'
    tasks = re.findall(task_pattern, query_lower)
    if tasks:
        result["entities"].extend([{"type": "task", "value": task} for task in tasks])
    
    # Extract numbers
    numbers = re.findall(r'\d+', nl_query)
    if numbers:
        result["entities"].extend([{"type": "number", "value": int(num)} for num in numbers])
    
    # Intent detection
    if any(phrase in query_lower for phrase in ["run together", "together", "corun"]):
        result["parsed_intent"] = "coRun"
        result["parameters"]["tasks"] = tasks
        result["confidence"] = 0.9
    
    elif "priority" in query_lower:
        result["parsed_intent"] = "priority"
        if "high" in query_lower:
            result["parameters"]["level"] = "high"
        elif "low" in query_lower:
            result["parameters"]["level"] = "low"
        else:
            result["parameters"]["level"] = "medium"
        result["confidence"] = 0.85
    
    elif any(phrase in query_lower for phrase in ["balance", "load", "distribute"]):
        result["parsed_intent"] = "loadBalance"
        result["parameters"]["strategy"] = "distribute"
        result["confidence"] = 0.8
    
    elif any(phrase in query_lower for phrase in ["group", "same", "together"]):
        result["parsed_intent"] = "grouping"
        if "client" in query_lower:
            result["parameters"]["group_by"] = "client"
        elif "worker" in query_lower:
            result["parameters"]["group_by"] = "worker"
        result["confidence"] = 0.75
    
    elif any(phrase in query_lower for phrase in ["no more than", "maximum", "limit"]):
        result["parsed_intent"] = "capacity"
        if numbers:
            result["parameters"]["max_count"] = int(numbers[0])
        result["confidence"] = 0.85
    
    else:
        result["parsed_intent"] = "custom"
        result["parameters"]["raw_query"] = nl_query
    
    return result 