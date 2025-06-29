# 🧪 CookSheet v2.0 - Market Ready

**AI-powered spreadsheet configurator for production use**

Transform messy CSV/XLSX data into clean, rule-based configurations with the power of AI. CookSheet helps non-technical users upload, validate, and configure complex datasets through natural language interfaces and intelligent suggestions.

## ✨ Features

### 🚀 **Phase 1-6: Core Production Features**
- **📁 Smart File Upload**: CSV/XLSX support with AI-powered header mapping
- **📊 Interactive Data Grid**: Real-time editing with validation highlighting  
- **🔍 Comprehensive Validation**: Advanced error detection and reporting
- **⚙️ Visual Rule Builder**: Drag-and-drop rule creation interface
- **🤖 Natural Language Modification**: "Change MaxLoad of sales workers to 5"
- **🧠 AI Rule Suggestions**: Intelligent recommendations based on data analysis
- **🎯 Priority Configuration**: Optimization weight sliders
- **📦 Production Export**: Complete ZIP packages with configs

### 🎯 **Market-Ready Enhancements**
- **Enhanced Validation Engine**: 15+ validation types with detailed reporting
- **Natural Language Query**: Search and filter data with plain English
- **AI Suggestions**: Smart rule recommendations with confidence scoring
- **Production Export**: Deployment-ready configuration packages
- **Modern UI**: Tabbed interface with professional styling

## 🏗️ Architecture

```
DataAlchemistApp/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
├── backend/           # FastAPI + Pandas + Pydantic  
├── ai/               # NLP processing and rule parsing
├── samples/          # Demo data files
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.9+ and **pip**

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
# Backend runs on http://localhost:8000
```

### 2. Frontend Setup  
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Try Sample Data
Upload the sample files from `samples/` folder:
- `clients.csv` - Customer data
- `workers.csv` - Employee data with skills
- `tasks.csv` - Project tasks with dependencies

## 📖 User Guide

### **Upload & Validate**
1. Go to **📁 Upload** tab
2. Upload CSV/XLSX files for clients, workers, and tasks
3. Review AI-generated header mappings
4. Check **🔍 Validation** tab for data quality issues

### **Build Rules**
1. Use **⚙️ Rules** tab for visual rule building
2. Try **🤖 AI Modify** for natural language editing:
   - "Set priority to high for Phase 1 tasks"
   - "Change MaxLoad of sales workers to 5"
3. Accept **🧠 AI Suggestions** for smart recommendations

### **Configure & Export**
1. Set optimization weights in **🎯 Priorities**
2. Export complete configuration from **📦 Export**
3. Download production-ready ZIP package

## 🔧 API Endpoints

### **Core Endpoints**
- `POST /upload` - File upload with AI header mapping
- `POST /validate/comprehensive` - Advanced data validation
- `POST /rules/generate` - Natural language rule parsing
- `POST /export` - Production configuration export

### **AI-Powered Endpoints**
- `POST /query/natural-language` - Search data with plain English
- `POST /modify/natural-language` - Modify data via natural language
- `GET /suggestions/ai` - Intelligent rule suggestions

## 📊 Sample Data Format

### Clients
```csv
ClientID,Name,Industry,Priority,Budget,Contact
C001,TechCorp Solutions,Technology,High,50000,john@techcorp.com
```

### Workers  
```csv
WorkerID,Name,Skills,MaxLoad,CurrentLoad,Department
W001,Alice Johnson,"[""Python"", ""Data Analysis""]",5,2,Engineering
```

### Tasks
```csv
TaskID,ClientID,Name,Duration,Priority,Phase,Dependencies,RequiredSkills
T001,C001,Data Pipeline,5,High,1,"[]","[""Python"", ""Data Analysis""]"
```

## 🎨 Rule Examples

### **Co-Run Rules**
```
"T1 and T2 must run together"
→ Creates co-execution constraint
```

### **Priority Rules**  
```
"Set priority to high for Phase 1 tasks"
→ Applies high priority to matching tasks
```

### **Load Balancing**
```
"Balance load evenly across all workers"
→ Creates load distribution rule
```

### **Capacity Limits**
```
"No more than 3 tasks per worker"
→ Sets capacity constraint
```

## 🔍 Validation Features

- **Data Completeness**: Missing required fields
- **ID Uniqueness**: Duplicate identifier detection  
- **Reference Integrity**: Cross-table reference validation
- **Data Types**: Numeric validation and format checking
- **Business Rules**: Domain-specific constraint validation
- **JSON Parsing**: List field format validation

## 🧠 AI Capabilities

### **Header Mapping**
Automatically maps uploaded columns to standard schema:
- `employee_id` → `WorkerID`
- `task_name` → `TaskName`  
- `skill_set` → `Skills`

### **Rule Suggestions**
AI analyzes your data and suggests rules like:
- "Tasks T12 and T14 always co-run" (85% confidence)
- "Workers in Phase 2 overloaded, add slot limit" (78% confidence)

### **Natural Language Processing**
Transform English into structured operations:
- Query: "Show all high priority Phase 1 tasks"
- Modify: "Change duration to 5 for all design tasks"

## 📦 Export Package Contents

The production export includes:
- **clean_*.csv**: Validated datasets
- **rules_config.json**: Complete rule definitions
- **priority_config.json**: Optimization weights
- **deployment_config.json**: Production settings
- **export_summary.json**: Package metadata
- **README.md**: Usage instructions

## 🚀 Deployment

### **Docker Deployment**
```bash
# Backend
docker build -t data-alchemist-api ./backend
docker run -p 8000:8000 data-alchemist-api

# Frontend  
docker build -t data-alchemist-web ./frontend
docker run -p 3000:3000 data-alchemist-web
```

### **Cloud Deployment**
- **Backend**: Deploy to Railway, Render, or AWS Lambda
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Database**: Optional PostgreSQL for persistent storage

## 🔧 Development

### **Backend Development**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Development**
```bash
cd frontend
npm install
npm run dev
```

### **Adding New Features**
1. **Validation Rules**: Add to `backend/validators/engine.py`
2. **AI Models**: Extend `ai/nlp.py` 
3. **UI Components**: Create in `frontend/src/components/`

## 📋 Roadmap

### **Phase 7: Advanced AI** (Future)
- [ ] GPT-4 integration for complex rule generation
- [ ] Predictive analytics and anomaly detection
- [ ] Multi-language support
- [ ] Custom AI model training

### **Phase 8: Enterprise** (Future)  
- [ ] Multi-tenant architecture
- [ ] Advanced security and compliance
- [ ] Real-time collaboration
- [ ] Enterprise SSO integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions  
- **Email**: support@dataalchemist.dev

---

**Built with ❤️ for data professionals who want AI-powered configuration tools**

🧪 **CookSheet v2.0** - Transform your data, empower your workflows! 