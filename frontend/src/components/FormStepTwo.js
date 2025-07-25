// FormStepTwo.js
import React, { useState } from "react";
import axios from "axios";
import "./FormStepTwo.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function FormStepTwo({ stepOneId, onDone }) {
  const [form, setForm] = useState({
    td_given: "Yes",
    quotation: "Yes",
    cx: "",
    status: "Booked",
    heat_status: "Cold",
    remark: "",
    photo: null,
  });

  const BASE_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

const handleSubmit = async () => {
  setLoading(true);

  const data = new FormData();
  for (const key in form) {
    data.append(key, form[key]);
  }
  data.append("step_one_id", stepOneId);

  try {
    await axios.post(`${BASE_URL}/submit-step2`, data);
    setLoading(false);
    setShowPopup(true); // ✅ Show popup

    setTimeout(() => {
      setShowPopup(false); // ✅ Hide popup after 2s
      onDone();            // ✅ Go to FormStepOne
    }, 2000);

  } catch (error) {
    setLoading(false);
    console.error("Error submitting step 2:", error);
    alert("Submission failed. Please try again.");
  }
};

  return (
    <div className="form-container">
      <h2 className="title">Customer Lead Form - Step 2</h2>
      <div className="form-card">
        <label>TD Given</label>
        <select onChange={(e) => setForm({ ...form, td_given: e.target.value })}>
          <option>Yes</option>
          <option>No</option>
        </select>

        <label>Quotation</label>
        <select onChange={(e) => setForm({ ...form, quotation: e.target.value })}>
          <option>Yes</option>
          <option>No</option>
        </select>

        <label>CX</label>
          <select
            value={form.cx}
            onChange={(e) => setForm({ ...form, cx: e.target.value })}
          >
            <option value="">-- Select CX --</option>
            <option value="RTO">RTO</option>
            <option value="Booking">Booking</option>
            <option value="Delivery">Delivery</option>
            <option value="Documents">Documents</option>
            <option value="Payment">Payment</option>
            <option value="Others">Others</option>
          </select>

        <label>Status</label>
        <select onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Booked</option>
          <option>Decision Pending</option>
          <option>Comparing with Competition</option>
          <option>Other</option>
        </select>

        <label>Lead Classification</label>
        <div className="heat-slider">
          {['Cold', 'Warm', 'Hot'].map((level) => (
            <div
              key={level}
              className={`heat-block ${form.heat_status === level ? 'active' : ''}`}
              onClick={() => setForm({ ...form, heat_status: level })}
            >
              {level}
            </div>
          ))}
        </div>

        <label>Remark</label>
        <textarea
          placeholder="Remark"
          rows={3}
          onChange={(e) => setForm({ ...form, remark: e.target.value })}
        />

        <label htmlFor="photo-upload" className="photo-label">
            {form.photo ? form.photo.name : "Tap to take or upload a photo"}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
          />

        {!loading ? (
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          ) : (
            <p className="loading-text">Submitting...</p>
          )}

      </div>
      <ToastContainer />
      {showPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>✅ Submitted Successfully!</h3>
              <p>Returning to Step 1...</p>
            </div>
          </div>
        )}
    </div>
  );
}

export default FormStepTwo;