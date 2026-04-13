import React, { useState, useEffect } from "react";
import { getVentas, crearVenta } from "../services/api";

const Ventas = ({ productosDisponibles, alVender, user }) => {
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cantidadesPrevia, setCantidadesPrevia] = useState({});
  
  // Estados para buscadores
  const [busquedaVenta, setBusquedaVenta] = useState("");
  const [filtroCorreo, setFiltroCorreo] = useState("");
  const [filtroProductoId, setFiltroProductoId] = useState("");

  // Detectamos el rol del usuario (Admin o Comprador)
  const isAdmin = user?.rol === "admin";

  useEffect(() => {
    cargarVentas();
  }, [user, productosDisponibles]);

  const cargarVentas = async () => {
    try {
      const res = await getVentas();
      if (res.data.status === "success") {
        const datos = res.data.data;
        // GESTIÓN DE ROLES: Filtrado de seguridad en la vista
        setVentas(isAdmin ? datos : datos.filter(v => v.usuarioEmail === user?.email));
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  };

  const agregarAlCarrito = (p) => {
    const cantidadASumar = parseInt(cantidadesPrevia[p.id]) || 1;
    if (cantidadASumar <= 0 || cantidadASumar > p.stock) return alert("Stock no disponible");

    const existe = carrito.find((item) => item.id === p.id);
    if (existe) {
      setCarrito(carrito.map((item) => item.id === p.id ? { ...item, cantidad: item.cantidad + cantidadASumar } : item));
    } else {
      setCarrito([...carrito, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: cantidadASumar }]);
    }
    setCantidadesPrevia({ ...cantidadesPrevia, [p.id]: "" });
  };

  const ejecutarVenta = async () => {
    if (!user?.email) return alert("Sesión no detectada.");
    if (carrito.length === 0) return;

    const dataVenta = {
      productos: carrito.map(({ id, cantidad, precio }) => ({ id, cantidad, precio })),
      total: carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
      usuarioEmail: user.email
    };

    try {
      const res = await crearVenta(dataVenta);
      if (res.data.status === "success") {
        alert("¡Venta completada!");
        setCarrito([]);
        cargarVentas();
        alVender();
      }
    } catch (err) {
      alert("Error en la transacción");
    }
  };

  // Filtros de búsqueda
  const prodsVenta = productosDisponibles.filter(p => p.nombre.toLowerCase().includes(busquedaVenta.toLowerCase()));

  const ventasFiltradas = ventas.filter((v) => {
    const coincideCorreo = (v.usuarioEmail || "").toLowerCase().includes(filtroCorreo.toLowerCase());
    const coincideProducto = filtroProductoId === "" || v.productos.some(p => {
      const nombre = productosDisponibles.find(item => item.id === p.id)?.nombre.toLowerCase() || "";
      return nombre.includes(filtroProductoId.toLowerCase());
    });
    return coincideCorreo && coincideProducto;
  });

  return (
    <div className="ventas-section" style={{ marginTop: "40px", color: "white" }}>
      <h2 style={{ color: "var(--primary)", marginBottom: "25px" }}>🛒 Punto de Venta</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "25px", marginBottom: "40px" }}>
        {/* LADO IZQUIERDO: CATÁLOGO CON BUSCADOR */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h4>Catálogo</h4>
            <input 
              type="text" 
              placeholder="🔍 Buscar producto..." 
              value={busquedaVenta} 
              onChange={e => setBusquedaVenta(e.target.value)} 
              style={{ padding: "8px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "white" }} 
            />
          </div>
          {prodsVenta.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
              <div>
                <strong>{p.nombre}</strong> <br/>
                <small style={{color: "#94a3b8"}}>${p.precio.toFixed(2)} | Stock: {p.stock}</small>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" value={cantidadesPrevia[p.id] || ""} onChange={e => setCantidadesPrevia({...cantidadesPrevia, [p.id]: e.target.value})} style={{ width: "50px", background: "#0f172a", color: "white", border: "1px solid #334155", textAlign: "center" }} />
                <button onClick={() => agregarAlCarrito(p)} className="btn-save" style={{padding: "5px 15px"}}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* LADO DERECHO: CARRITO */}
        <div className="card" style={{ border: "2px solid var(--primary)" }}>
          <h4 style={{ color: "var(--primary)" }}>Resumen de Compra</h4>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Cliente: {user?.email}</p>
          <div style={{ minHeight: "100px" }}>
            {carrito.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "5px" }}>
                <span>{item.nombre} x{item.cantidad}</span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #334155", marginTop: "15px", paddingTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
              <span>Total:</span>
              <span style={{ color: "var(--primary)" }}>${carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0).toFixed(2)}</span>
            </div>
            <button onClick={ejecutarVenta} className="btn-save" style={{ width: "100%", marginTop: "15px", fontWeight: "bold" }}>Confirmar Orden</button>
          </div>
        </div>
      </div>

      {/* HISTORIAL: ROLES + FECHA + BUSCADORES */}
      <h3 style={{ marginBottom: "20px" }}>📜 Registro de Operaciones ({isAdmin ? "Admin" : "Mis Compras"})</h3>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {isAdmin && (
          <input type="text" placeholder="Filtrar por email..." value={filtroCorreo} onChange={e => setFiltroCorreo(e.target.value)} style={{ padding: "10px", borderRadius: "6px", background: "#1e293b", color: "white", border: "1px solid #334155", flex: 1 }} />
        )}
        <input type="text" placeholder="Filtrar por producto..." value={filtroProductoId} onChange={e => setFiltroProductoId(e.target.value)} style={{ padding: "10px", borderRadius: "6px", background: "#1e293b", color: "white", border: "1px solid #334155", flex: 1 }} />
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left" }}>
              <th style={{ padding: "15px" }}>Fecha y Hora</th>
              <th style={{ padding: "15px" }}>Usuario</th>
              <th style={{ padding: "15px" }}>Detalle (Unitario)</th>
              <th style={{ padding: "15px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {/* RESTAURADA LA FECHA */}
                <td style={{ padding: "15px", fontSize: "0.8rem" }}>
                  {v.fecha ? new Date(v.fecha).toLocaleString() : "Sin fecha"}
                </td>
                <td style={{ padding: "15px", color: "var(--primary)" }}>{v.usuarioEmail || "Anónimo"}</td>
                <td style={{ padding: "15px" }}>
                  {v.productos.map((p, idx) => (
                    <div key={idx} style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      • {productosDisponibles.find(pr => pr.id === p.id)?.nombre || "Producto"} 
                      ({p.cantidad} x <span style={{color: "var(--primary)"}}>${p.precio.toFixed(2)}</span>)
                    </div>
                  ))}
                </td>
                <td style={{ padding: "15px", fontWeight: "bold" }}>${v.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ventas;