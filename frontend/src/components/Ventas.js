import React, { useState, useEffect } from "react";
import { getVentas, crearVenta } from "../services/api";

const Ventas = ({ productosDisponibles, alVender, user }) => {
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cantidadesPrevia, setCantidadesPrevia] = useState({});
  const [busquedaVenta, setBusquedaVenta] = useState("");
  const [filtroCorreo, setFiltroCorreo] = useState("");
  const [filtroProductoId, setFiltroProductoId] = useState("");

  const isAdmin = user?.rol === "admin";

  useEffect(() => { cargarVentas(); }, [user, productosDisponibles]);

  const cargarVentas = async () => {
    try {
      const res = await getVentas();
      if (res.data.status === "success") {
        const datos = res.data.data;
        // El admin ve todo, el comprador solo lo suyo
        setVentas(isAdmin ? datos : datos.filter(v => v.usuarioEmail === user?.email));
      }
    } catch (err) { console.error("Error al cargar historial"); }
  };

  const agregarAlCarrito = (p) => {
    const cant = parseInt(cantidadesPrevia[p.id]) || 1;
    if (cant <= 0 || cant > p.stock) return alert("Cantidad no válida o stock insuficiente");
    const existe = carrito.find(i => i.id === p.id);
    if (existe) {
      setCarrito(carrito.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + cant } : i));
    } else {
      setCarrito([...carrito, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: cant }]);
    }
    setCantidadesPrevia({ ...cantidadesPrevia, [p.id]: "" });
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const ejecutarVenta = async () => {
    if (!user?.email || carrito.length === 0) return;
    const dataVenta = {
      productos: carrito.map(({ id, cantidad, precio }) => ({ id, cantidad, precio })),
      total: carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
      usuarioEmail: user.email
    };
    try {
      const res = await crearVenta(dataVenta);
      if (res.data.status === "success") {
        alert("Compra exitosa");
        setCarrito([]);
        cargarVentas();
        alVender();
      }
    } catch (err) { alert("Error al procesar"); }
  };

  const prodsVenta = productosDisponibles.filter(p => p.nombre.toLowerCase().includes(busquedaVenta.toLowerCase()));

  // Lógica de filtrado para la tabla de historial
  const ventasFiltradas = ventas.filter(v => {
    const matchEmail = (v.usuarioEmail || "").toLowerCase().includes(filtroCorreo.toLowerCase());
    const matchProd = filtroProductoId === "" || v.productos.some(p => {
      const n = productosDisponibles.find(i => i.id === p.id)?.nombre.toLowerCase() || "";
      return n.includes(filtroProductoId.toLowerCase());
    });
    return matchEmail && matchProd;
  });

  return (
    <div className="ventas-section" style={{ marginTop: "40px", color: "white" }}>
      <h2 style={{ color: "var(--primary)" }}>Punto de Venta</h2>
      
      {/* --- SECCIÓN DE TIENDA Y CARRITO (YA ACTUALIZADA) --- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "25px", alignItems: "start", marginBottom: "50px" }}>
        {/* Catálogo */}
        <div>
          <input type="text" placeholder="Buscar producto en tienda..." value={busquedaVenta} onChange={e => setBusquedaVenta(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#0f172a", border: "1px solid #334155", color: "white", marginBottom: "20px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
            {prodsVenta.map(p => (
              <div key={p.id} className="card" style={{ padding: "15px", border: "1px solid #1e293b" }}>
                <h4 style={{ margin: "0 0 10px 0" }}>{p.nombre}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
                  <span>Stock: <b>{p.stock}</b></span>
                  <span style={{ color: "var(--primary)", fontWeight: "bold" }}>${p.precio}</span>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <input type="number" min="1" placeholder="Cant." value={cantidadesPrevia[p.id] || ""} onChange={e => setCantidadesPrevia({...cantidadesPrevia, [p.id]: e.target.value})} style={{ flex: 1, padding: "5px", background: "#0f172a", color: "white", border: "1px solid #334155", borderRadius: "5px" }} />
                  <button onClick={() => agregarAlCarrito(p)} className="btn-save" style={{ padding: "5px 15px" }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen Carrito */}
        <div className="card" style={{ border: "2px solid var(--primary)", position: "sticky", top: "20px" }}>
          <h4 style={{ marginTop: 0 }}>Resumen de Compra</h4>
          <div style={{ margin: "20px 0" }}>
            {carrito.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem" }}>
                <span>{i.nombre} x{i.cantidad}</span>
                <span>${(i.precio * i.cantidad).toFixed(2)} <button onClick={() => quitarDelCarrito(i.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "5px" }}>✕</button></span>
              </div>
            ))}
          </div>
          <button onClick={ejecutarVenta} className="btn-save" style={{ width: "100%" }}>Confirmar Pedido</button>
        </div>
      </div>

      {/* --- HISTORIAL DE OPERACIONES (RESTAURADO) --- */}
      <hr className="separator" />
      <h3 style={{ marginTop: "40px" }}> Mis Operaciones</h3>
      
      <div style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
        {isAdmin && (
          <input 
            type="text" 
            placeholder="Filtrar por correo..." 
            value={filtroCorreo} 
            onChange={e => setFiltroCorreo(e.target.value)} 
            style={{ padding: "10px", background: "#1e293b", border: "1px solid #334155", color: "white", flex: 1, borderRadius: "8px" }} 
          />
        )}
        <input 
          type="text" 
          placeholder="Filtrar por nombre de producto..." 
          value={filtroProductoId} 
          onChange={e => setFiltroProductoId(e.target.value)} 
          style={{ padding: "10px", background: "#1e293b", border: "1px solid #334155", color: "white", flex: 1, borderRadius: "8px" }} 
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#1e293b", color: "var(--primary)" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left" }}>Fecha</th>
              {isAdmin && <th style={{ padding: "15px", textAlign: "left" }}>Usuario</th>}
              <th style={{ padding: "15px", textAlign: "left" }}>Productos</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length > 0 ? (
              ventasFiltradas.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "15px", fontSize: "0.85rem" }}>{new Date(v.fecha).toLocaleString()}</td>
                  {isAdmin && <td style={{ padding: "15px", fontSize: "0.85rem", color: "#94a3b8" }}>{v.usuarioEmail}</td>}
                  <td style={{ padding: "15px" }}>
                    {v.productos.map((p, idx) => (
                      <div key={idx} style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
                        • {productosDisponibles.find(pr => pr.id === p.id)?.nombre || "Producto"} (x{p.cantidad})
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "15px", fontWeight: "bold", color: "var(--primary)" }}>${v.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  No se encontraron registros de ventas.
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