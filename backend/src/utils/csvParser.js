const csv = require("csv-parser");
const { Readable } = require("stream");

/* ==============================================================
   🔹 Parse CSV Buffer
================================================================ */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      return reject(new Error("Empty CSV file"));
    }

    const results = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) => (value || "").trim(),
        })
      )
      .on("data", (row) => {
        // Skip completely empty rows
        if (Object.values(row).every((v) => v === "")) return;
        results.push(row);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

/* ==============================================================
   🔹 Validate Student CSV
================================================================ */
const validateStudentCSV = (rows = []) => {
  const requiredFields = [
    "name",
    "email",
    "rollNumber",
    "year",
    "branch",
    "semester",
  ];

  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // CSV starts from line 2 (after header)

    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Row ${rowNumber}: Missing ${field}`);
      }
    });

    // Email validation
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }

    // Year, Semester numeric checks
    if (row.year && isNaN(row.year)) {
      errors.push(`Row ${rowNumber}: Year must be a number`);
    }
    if (row.semester && isNaN(row.semester)) {
      errors.push(`Row ${rowNumber}: Semester must be a number`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/* ==============================================================
   🔹 Validate Teacher CSV
================================================================ */
const validateTeacherCSV = (rows = []) => {
  const requiredFields = ["name", "email", "employeeId", "department"];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Row ${rowNumber}: Missing ${field}`);
      }
    });

    // Email validation
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  parseCSV,
  validateStudentCSV,
  validateTeacherCSV,
};
