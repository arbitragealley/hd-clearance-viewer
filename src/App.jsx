import { useState, useMemo, useEffect } from "react";
import Papa from "papaparse";
import Barcode from "react-barcode";

export default function App() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [minDiscount, setMinDiscount] = useState(""); 
  const [minPrice, setMinPrice] = useState(""); 
  const [maxPrice, setMaxPrice] = useState(""); 
  const [minStock, setMinStock] = useState(""); 
  const [maxStock, setMaxStock] = useState(""); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setRows(results.data),
    });
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const d = Number(r.discount || 0);
      const s = Number(r.stock || 0);
      const p = Number(r.price || 0);
      const matches = r.name?.toLowerCase().includes(search.toLowerCase());

      return (
        (!minDiscount || d >= Number(minDiscount)) &&
        (!minStock || s >= Number(minStock)) &&
        (!maxStock || s <= Number(maxStock)) &&
        (!minPrice || p >= Number(minPrice)) &&
        (!maxPrice || p <= Number(maxPrice)) &&
        matches
      );
    });
  }, [
    rows,
    search,
    minDiscount,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
  ]);

  const getDiscountColor = (discount) => {
    const d = Number(discount || 0);
    if (d >= 80) return "#39D353";
    if (d >= 65) return "#66C466";
    if (d >= 50) return "#FFD700";
    return "#FF4C4C";
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#121212", color: "#dcdcdc", padding: 16 }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 36, fontWeight: "bold", color: "#f96302" }}>🏷️ HD Clearance</h1>
        {isMobile && (
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ fontSize: 24, background: "#dcdcdc", border: "none", color: "#fff", cursor: "pointer" }}>☰</button>
        )}
      </header>

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20 }}>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          {rows.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", flexDirection: "column", textAlign: "center", color: "#aaa" }}>
              <p style={{ fontSize: 18 }}>Upload your Home Depot clearance CSV to get started.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filtered.map((item, i) => (
                <div
                  key={i}
                  style={{ background: "#1e1e1e", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", cursor: "pointer", position: "relative", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={{ position: "absolute", top: 12, left: 12, background: getDiscountColor(item.discount), color: "#dcdcdc", fontWeight: "bold", padding: "4px 8px", borderRadius: 20, fontSize: 14, zIndex: 2 }}>
                    {item.discount}% OFF
                  </div>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                  <div style={{ padding: 12, display: "flex", flexDirection: "column" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item.name}</h2>
                    <div style={{ color: "#f96302", fontWeight: "bold", marginBottom: 6 }}>${item.price}</div>
                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Stock: {item.stock} • {item.city}, {item.state}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {(showSidebar || !isMobile) && (
          <div style={{ width: isMobile ? "100%" : 260, background: "#4f4f4f", padding: 16, borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, color: "#121212" }}>
            <h2 style={{ textAlign: "center" }}>Filters</h2>

            <label>Upload CSV</label>
            <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files[0])} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212", cursor: "pointer" }} />

            <label>Search Product Name</label>
            <input type="text" placeholder="" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212" }} />

            <label>Min % Discount</label>
            <input type="number" placeholder="" value={minDiscount} onChange={(e) => setMinDiscount(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212" }} />

            <label>Price Range</label>
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212", marginBottom: 4 }} />
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212" }} />

            <label>Stock Range</label>
            <input type="number" placeholder="Min" value={minStock} onChange={(e) => setMinStock(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212", marginBottom: 4 }} />
            <input type="number" placeholder="Max" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", background: "#dcdcdc", color: "#121212" }} />
          </div>
        )}
      </div>

      {/* Modal for Barcode */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e1e1e", padding: 24, borderRadius: 12, width: 340, textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.7)", color: "#fff" }}>
            <h2 style={{ marginBottom: 12 }}>{selectedItem.name}</h2>
            <p style={{ fontSize: 16, marginBottom: 12 }}><strong>ID:</strong> {selectedItem.upc}</p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Barcode value={selectedItem.upc} format="CODE128" width={2.5} height={100} displayValue={true} background="transparent" lineColor="#FFFFFF" />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(selectedItem.upc)} style={{ padding: "6px 12px", background: "#ffa500", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Copy ID</button>
              <button onClick={() => setSelectedItem(null)} style={{ padding: "6px 12px", background: "#f96302", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
