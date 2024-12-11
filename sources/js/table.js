
document.addEventListener("DOMContentLoaded", function() {
    const searchBox = document.getElementById("searchBox");
    const studentsTable = document.getElementById("studentsTable");
    const tbody = studentsTable.getElementsByTagName("tbody")[0];

    searchBox.addEventListener("input", function() {
        const searchTerm = searchBox.value.toLowerCase();
        const rows = tbody.getElementsByTagName("tr");

        for (let row of rows) {
            const cells = row.getElementsByTagName("td");
            let rowVisible = false;

            for (let cell of cells) {
                if (cell.innerText.toLowerCase().includes(searchTerm)) {
                    rowVisible = true;
                    break;
                }
            }

            row.style.display = rowVisible ? "" : "none";
        }
    });
});

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get table data
    const table = document.getElementById('teachersTable');
    const rows = Array.from(table.rows);
    
    let tableData = [];
    rows.forEach(row => {
      const cols = Array.from(row.cells).map(cell => cell.textContent);
      tableData.push(cols);
    });
  
    // Define table headers
    const headers = ['First Name', 'Last Name', 'Email'];
  
    // Add table to PDF with reduced row height
    doc.autoTable({
      head: [headers],
      body: tableData.slice(1), // Skip the header row
      styles: {
        cellPadding: 2, // Adjust this value to reduce cell padding
        lineWidth: 0.1, // Adjust line width for borders
        fontSize: 10, // Font size for the text
      },
      margin: { top: 10 } // Adjust top margin as needed
    });
  
    // Save the PDF
    doc.save('registered_teachers.pdf');
  }

  function downloadStudentsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get table data
    const table = document.getElementById('studentsTable');
    const rows = Array.from(table.rows);
    
    let tableData = [];
    rows.forEach(row => {
      const cols = Array.from(row.cells).map(cell => cell.textContent);
      tableData.push(cols);
    });
  
    // Define table headers
    const headers = ['First Name', 'Last Name', 'Section', 'Email'];
  
    // Add table to PDF with reduced row height
    doc.autoTable({
      head: [headers],
      body: tableData.slice(1), // Skip the header row
      styles: {
        cellPadding: 2, // Adjust this value to reduce cell padding
        lineWidth: 0.1, // Adjust line width for borders
        fontSize: 10, // Font size for the text
      },
      margin: { top: 10 } // Adjust top margin as needed
    });
  
    // Save the PDF
    doc.save('registered_students.pdf');
  }

  function downloadQuestionsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get table data
    const table = document.getElementById('questionsTable');
    const rows = Array.from(table.rows);
    
    let tableData = [];
    rows.forEach(row => {
      const cols = Array.from(row.cells).map(cell => cell.textContent);
      tableData.push(cols);
    });
  
    // Define table headers
    const headers = ['#', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
  
    // Add table to PDF with reduced row height
    doc.autoTable({
      head: [headers],
      body: tableData.slice(1), // Skip the header row
      styles: {
        cellPadding: 2, // Adjust this value to reduce cell padding
        lineWidth: 0.1, // Adjust line width for borders
        fontSize: 10, // Font size for the text
      },
      margin: { top: 10 } // Adjust top margin as needed
    });
  
    // Save the PDF
    doc.save('quiz_questions.pdf');
  }

  function downloadResultsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get table data
    const table = document.getElementById('resultsTable');
    const rows = Array.from(table.rows);
    
    let tableData = [];
    rows.forEach(row => {
      const cols = Array.from(row.cells).map(cell => cell.textContent);
      tableData.push(cols);
    });
  
    // Define table headers
    const headers = ['Name', 'Section', 'Score'];
  
    // Add table to PDF with reduced row height
    doc.autoTable({
      head: [headers],
      body: tableData.slice(1), // Skip the header row
      styles: {
        cellPadding: 2, // Adjust this value to reduce cell padding
        lineWidth: 0.1, // Adjust line width for borders
        fontSize: 10, // Font size for the text
      },
      margin: { top: 10 } // Adjust top margin as needed
    });
  
    // Save the PDF
    doc.save('student_results.pdf');
  }
  