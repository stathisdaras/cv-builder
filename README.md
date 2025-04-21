# CV Builder

A modern web application for creating professional CVs with ease. This project allows users to input their personal information, work experiences, education, skills, and more through a user-friendly form. The data can then be generated into a well-formatted PDF CV.

## Features

- **User-friendly Form**: Simple and intuitive interface for entering CV data
- **PDF Generation**: Convert your CV data into a professionally formatted PDF
- **Import/Export Functionality**: Save your progress by exporting CV data as JSON, and import it later
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS for a clean, modern look

## Technologies Used

- Angular 17+
- TypeScript
- Tailwind CSS
- PrimeNG (for components like DatePicker)
- html2pdf.js (for PDF generation)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cv-builder.git
cd cv-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## Usage

1. **Start a New CV**: Click "Fill Form" on the landing page
2. **Fill in Your Information**: Enter your personal details, work experience, education, etc.
3. **Generate CV**: Click the "Generate CV" button to create your PDF
4. **Save Your Data**: Use the "Export JSON" button to save your CV data for later use
5. **Import Existing Data**: Use the "Import JSON" button to load previously saved CV data

## Project Structure

- `src/app/landing-page`: Landing page component
- `src/app/cv-form`: Form for inputting CV data
- `src/app/pdf-view`: PDF view/generation component
- `src/app/month-year-picker`: Custom date picker component
- `src/app/services`: Data services for handling CV data

## License

MIT

## Author

Your Name
