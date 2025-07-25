import React, { useState } from "react";
import axios from "axios";
import "./FormStepOne.css";

function FormStepOne({ onNext }) {
  const [form, setForm] = useState({
    customer_type: "",
    customer_name: "",
    contact_number: "",
    gmail_id: "",
    city: "",
    vehicle: "",
    ca_name: "",
  });

  const [errors, setErrors] = useState({});
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);


  const validate = () => {
    const newErrors = {};
    if (!form.customer_type) newErrors.customer_type = "Customer Type is required";
    if (!form.customer_name.trim()) newErrors.customer_name = "Customer Name is required";
    if (!form.contact_number.trim()) {
      newErrors.contact_number = "Contact Number is required";
    } else if (!/^\d{10}$/.test(form.contact_number.trim())) {
      newErrors.contact_number = "Enter a valid 10-digit number";
    }
    if (form.gmail_id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.gmail_id)) {
      newErrors.gmail_id = "Enter a valid Gmail ID";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Please fill in the required fields correctly.");
      return;
    }

    setLoading(true); // start loading
    try {
      const res = await axios.post(`${BASE_URL}/submit-step1`, form);
      alert("Step 1 Submitted Successfully!");
      onNext(res.data.step_one_id);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false); // end loading
    }
  };


  return (
    <div className="form-container">
      <h1 className="title">Welcome to Manickbag Automobiles Pvt Ltd</h1>
      <div className="form-card">
        <h2>Customer Lead Form - Step 1</h2>

        <label>Customer Type</label>
        <select
          value={form.customer_type}
          className={errors.customer_type ? "error-input" : ""}
          onChange={(e) => {
            setForm({ ...form, customer_type: e.target.value });
            setErrors({ ...errors, customer_type: "" });
          }}
        >
          <option value="">Select Customer Type</option>
          <option value="First">First</option>
          <option value="Existing">Existing</option>
          <option value="Delivery">Delivery</option>
        </select>

        <label>Customer Name</label>
        <input
          placeholder="Enter Customer Name"
          value={form.customer_name}
          className={errors.customer_name ? "error-input" : ""}
          onChange={(e) => {
            setForm({ ...form, customer_name: e.target.value });
            setErrors({ ...errors, customer_name: "" });
          }}
        />

        <label>Contact Number</label>
        <input
          placeholder="Enter 10-digit Contact Number"
          value={form.contact_number}
          className={errors.contact_number ? "error-input" : ""}
          onChange={(e) => {
            setForm({ ...form, contact_number: e.target.value });
            setErrors({ ...errors, contact_number: "" });
          }}
        />

        <label>Gmail ID</label>
        <input
          placeholder="Enter Customer Gmail ID"
          value={form.gmail_id}
          className={errors.gmail_id ? "error-input" : ""}
          onChange={(e) => {
            setForm({ ...form, gmail_id: e.target.value });
            setErrors({ ...errors, gmail_id: "" });
          }}
        />

        <label>City</label>
        <input
          placeholder="Enter City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <label>Vehicle</label>
        <input
          placeholder="Enter Vehicle Name"
          value={form.vehicle}
          onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
        />

        <label>CA Name</label>
        <input
          placeholder="Enter CA Name"
          value={form.ca_name}
          onChange={(e) => setForm({ ...form, ca_name: e.target.value })}
        />

        {!loading && (
          <button className="submit-btn" onClick={handleSubmit}>
            Submit & Next
          </button>
        )}

        {loading && <p className="submitting-text">Submitting...</p>}


      </div>
    </div>
  );
}

export default FormStepOne;
