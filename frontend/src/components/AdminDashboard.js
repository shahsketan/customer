import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AdminDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/all-data`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch data:", err));
  }, []);

  const handleExport = () => {
    const exportData = data.map((entry) => ({
      "Sl No": entry.sl_no,
      "Customer Name": entry.customer_name,
      "Contact": entry.contact_number,
      "City": entry.city,
      "Vehicle": entry.vehicle,
      "CA Name": entry.ca_name,
      "TD": entry.td_given,
      "Quotation": entry.quotation,
      "CX": entry.cx,
      "Status": entry.status,
      "Heat": entry.heat_status,
      "Remark": entry.remark,
      "Photo URL": entry.photo_url
        ? `${process.env.REACT_APP_API_URL}${entry.photo_url}`
        : "N/A",
      "Submitted At": entry.created_at
        ? new Date(entry.created_at).toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Leads");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "customer_leads.xlsx");
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>City</th>
              <th>Vehicle</th>
              <th>CA Name</th>
              <th>TD</th>
              <th>Quotation</th>
              <th>CX</th>
              <th>Status</th>
              <th>Lead Classification</th>
              <th>Remark</th>
              <th>Photo</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, i) => (
              <tr key={i}>
                <td>{entry.sl_no}</td>
                <td>{entry.customer_name}</td>
                <td>{entry.contact_number}</td>
                <td>{entry.city}</td>
                <td>{entry.vehicle}</td>
                <td>{entry.ca_name}</td>
                <td>{entry.td_given}</td>
                <td>{entry.quotation}</td>
                <td>{entry.cx}</td>
                <td>{entry.status}</td>
                <td>{entry.heat_status}</td>
                <td>{entry.remark || ""}</td>
                <td>
                  {entry.photo_url ? (
                    <a
                      href={`${process.env.REACT_APP_API_URL}${entry.photo_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${process.env.REACT_APP_API_URL}${entry.photo_url}`}
                        alt={`Customer ${entry.customer_name}`}
                        height="50"
                      />
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {entry.created_at
                    ? new Date(entry.created_at).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="export-btn-wrapper">
          <button className="export-btn" onClick={handleExport}>
            Export as Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
