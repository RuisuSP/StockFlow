import React, { useState, useEffect } from "react";
import { getVentas, crearVenta } from "../services/api";

const Ventas = ({ productosDisponibles, alVender }) => {
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  
  // Estados para los filtros
  const [filtroCorreo, setFiltroCorreo] = useState("");
  const [filtroProductoId, setFiltroProductoId] = useState("");

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      const res = await getVentas();
      if (res.data.status === "success") {
        setVentas(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  };

  const agregarAlCarrito = (p) => {
    const existe = carrito.find((item) => item.id === p.id);

    if (existe) {
      setCarrito(
        carrito.map((item) =>
          item.id === p.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: 1,
        },
      ]);
    }
  };

  const ejecutarVenta = async () => {
    if (carrito.length === 0) return;

    const total = carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    const dataVenta = {
      productos: carrito.map(({ id, cantidad, precio }) => ({
        id,
        cantidad,
        precio,
      })),
      total: total,
    };

    try {
      const res = await crearVenta(dataVenta);

      if (res.data.status === "success") {
        alert(res.data.message || "¡Venta realizada con éxito!");
        setCarrito([]);
        cargarVentas();
        alVender();
      }
    } catch (err) {
      console.error("Error en la transacción:", err);
      const mensajeError =
        err.response?.data?.message || "No se pudo completar la venta";
      alert("Error: " + mensajeError);
    }
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  // Lógica de filtrado corregida para mostrar registros sin correo
  const ventasFiltradas = ventas.filter((v) => {
    // Si el correo es null o undefined, usamos una cadena vacía para que no falle el .includes
    const correoSeguro = v.usuarioEmail || "";
    const coincideCorreo = correoSeguro.toLowerCase().includes(filtroCorreo.toLowerCase());
    
    // Filtro por ID de producto dentro del array de productos de la venta
    const coincideProducto = filtroProductoId === "" || v.productos.some(p => 
      p.id.toString().toLowerCase().includes(filtroProductoId.toLowerCase())
    );

    return coincideCorreo && coincideProducto;
  });

  return (
    <div className="ventas-section" style={{ marginTop: "40px" }}>
      <h2
        style={{
          color: "var(--primary)",
          marginBottom: "25px",
          fontWeight: "700",
        }}
      >
        Punto de Venta
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "25px",
          marginBottom: "40px",
        }}
      >
        {/* PRODUCTOS */}
        <div className="card">
          <h4 style={{ marginTop: 0, marginBottom: "20px" }}>
            Productos Disponibles
          </h4>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {productosDisponibles.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", color: "var(--text)" }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Stock: {p.stock} |{" "}
                    <span style={{ color: "var(--accent)", fontWeight: "bold" }}>
                      ${p.precio.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => agregarAlCarrito(p)}
                  disabled={p.stock <= 0}
                  className="btn-add"
                >
                  {p.stock > 0 ? "Añadir" : "Agotado"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CARRITO */}
        <div
          className="card"
          style={{
            border: "2px solid var(--accent)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "20px", color: "var(--accent)" }}>
            Resumen de Venta
          </h4>

          <div style={{ flex: 1, marginBottom: "20px", minHeight: "100px" }}>
            {carrito.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem", paddingTop: "20px" }}>
                El carrito está vacío. Añade productos.
              </p>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem",
                    marginBottom: "10px",
                    background: "rgba(255,255,255,0.03)",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text)" }}>{item.nombre}</div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {item.cantidad} x ${item.precio.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "bold", color: "var(--text)", fontSize: "1rem" }}>
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                    <button
                      onClick={() => quitarDelCarrito(item.id)}
                      style={{ background: "none", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: "2px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", fontWeight: "800", marginBottom: "20px" }}>
              <span>Total:</span>
              <span style={{ color: "var(--accent)" }}>
                ${carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0).toFixed(2)}
              </span>
            </div>
            <button
              onClick={ejecutarVenta}
              disabled={carrito.length === 0}
              style={{ background: "var(--accent)", padding: "15px", fontSize: "1.1rem", width: "100%", color: "white", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>

      {/* HISTORIAL CON FILTROS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontWeight: "700" }}>Registro de Operaciones</h3>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Filtrar por correo..." 
            value={filtroCorreo}
            onChange={(e) => setFiltroCorreo(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #334155", background: "#1e293b", color: "white", fontSize: "0.85rem" }}
          />
          <input 
            type="text" 
            placeholder="ID de producto..." 
            value={filtroProductoId}
            onChange={(e) => setFiltroProductoId(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #334155", background: "#1e293b", color: "white", fontSize: "0.85rem", width: "120px" }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text)", minWidth: "600px" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left" }}>
              <th style={{ padding: "15px" }}>Fecha y Hora</th>
              <th style={{ padding: "15px" }}>Usuario</th>
              <th style={{ padding: "15px" }}>Productos</th>
              <th style={{ padding: "15px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length > 0 ? (
              ventasFiltradas.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "15px" }}>{new Date(v.fecha).toLocaleString()}</td>
                  <td style={{ padding: "15px", color: "var(--primary)", fontWeight: "600" }}>
                    {v.usuarioEmail || <span style={{color: "var(--text-muted)", fontWeight: "400"}}>Sin registro</span>}
                  </td>
                  <td style={{ padding: "15px" }}>
                    {v.productos.map((p, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {p.id} ({p.cantidad} uds)
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "15px", fontWeight: "bold", color: "var(--accent)" }}>
                    ${v.total.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ventas;