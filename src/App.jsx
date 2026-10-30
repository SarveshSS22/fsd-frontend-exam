import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/expenses`
  : "http://localhost:8080/api/expenses";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_BASE);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      showMessage("Error connecting to server", "error");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showMessage("Title cannot be empty", "error");
    if (Number(form.amount) <= 0) return showMessage("Amount must be greater than zero", "error");

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, {
          ...form,
          amount: parseFloat(form.amount)
        });
        showMessage("Updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(API_BASE, {
          ...form,
          amount: parseFloat(form.amount)
        });
        showMessage("Added successfully!");
      }
      setForm({
        title: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0]
      });
      fetchExpenses();
    } catch (err) {
      showMessage("Save failed", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: item.date
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      showMessage("Deleted successfully!");
      fetchExpenses();
    } catch (err) {
      showMessage("Delete failed", "error");
    }
  };

  const displayedExpenses = filterCategory === "All"
    ? expenses
    : expenses.filter(i => i.category === filterCategory);

  const totalAmount = displayedExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center" }}>Personal Expense Tracker</h2>

      {message.text && (
        <div style={{
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "15px",
          backgroundColor: message.type === "error" ? "#fee2e2" : "#dcfce7",
          color: message.type === "error" ? "#991b1b" : "#166534"
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer" }}>
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <label>Filter: </label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <strong>Total Spent: ₹{totalAmount.toFixed(2)}</strong>
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse", borderColor: "#cbd5e1" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedExpenses.map(item => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>₹{item.amount}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={{ marginLeft: "8px", color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}