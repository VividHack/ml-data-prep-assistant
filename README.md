# ML Data Prep Assistant

A web-based tool that automates data cleaning and preparation for machine learning models. ML Data Prep Assistant helps data scientists and ML engineers save time by automatically detecting and fixing common data issues.

## Features

- **CSV Upload**: Drag and drop or browse to upload your CSV files
- **Data Summary**: View statistical summaries of your dataset
- **Issue Detection**: Automatically identify:
  - Missing values
  - Duplicate rows
  - Outliers
  - Inconsistent formats (dates, etc.)
- **Fix Suggestions**: Get actionable suggestions for fixing issues
- **Data Cleaning**: Apply fixes with a single click
- **Quality Report**: Generate reports summarizing issues and fixes

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Flask (Python)
- **Data Processing**: Pandas, scikit-learn
- **Deployment**: Ready for Heroku

## Setup and Installation

### Prerequisites

- Node.js and npm
- Python 3.8+
- pip

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd ml-data-prep-assistant/backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```
   python app.py
   ```
   
The server will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ml-data-prep-assistant/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Usage

1. **Upload CSV**: Start by uploading your CSV file using the drag-and-drop interface.
2. **Review Summary**: Check the summary statistics of your data.
3. **Detect Issues**: The system will automatically detect common data issues.
4. **Select Fixes**: Choose from suggested fixes for each issue.
5. **Apply Fixes**: Apply selected fixes to clean your data.
6. **Generate Report**: Create a detailed report of data quality issues and fixes.
7. **Download Cleaned Data**: Get your cleaned data ready for ML modeling.

## Development Roadmap

- [ ] Add data visualization features (histograms, box plots)
- [ ] Implement additional data cleaning algorithms
- [ ] Add support for more file formats (Excel, JSON)
- [ ] Create API access for programmatic usage
- [ ] Add user authentication and saved projects
- [ ] Integrate with popular ML frameworks (TensorFlow, PyTorch)

## License

MIT

## Contributors

- Mr. Robot - Initial work 