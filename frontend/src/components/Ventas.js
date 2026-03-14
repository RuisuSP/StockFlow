import React, { useState, useEffect } from 'react';
import { getVentas, crearVenta } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Ventas = ({ productosDisponibles, alVender }) => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    const res = await getVentas();
    if (res.data.status === "success") setVentas(res.data.data);
  };

  const agregarAlCarrito = (p) => {
    const existe = carrito.find(item => item.id === p.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === p.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }]);
    }
  };

  const ejecutarVenta = async () => {
    if (carrito.length === 0) return;
    
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    const dataVenta = {
      usuarioId: user.uid,
      productos: carrito.map(({id, cantidad, precio}) => ({id, cantidad, precio})),
      total: total
    };

    try {
      await crearVenta(dataVenta);
      alert("Venta realizada con éxito");
      setCarrito([]);
      cargarVentas();
      alVender(); // Para que App.js refresque el stock de los productos
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "No se pudo realizar la venta"));
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>Punto de Venta</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Selección de Productos */}
        <div className="card">
          <h4>Seleccionar Productos</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {productosDisponibles.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                <span>{p.nombre} (Stock: {p.stock})</span>
                <button 
                  onClick={() => agregarAlCarrito(p)} 
                  disabled={p.stock <= 0}
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito Actual */}
        <div className="card" style={{ border: '1px solid var(--accent)' }}>
          <h4>Carrito</h4>
          {carrito.map(item => (
            <div key={item.id} style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
              {item.nombre} x {item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}
            </div>
          ))}
          <hr />
          <div style={{ fontWeight: 'bold', margin: '10px 0' }}>
            Total: ${carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toFixed(2)}
          </div>
          <button onClick={ejecutarVenta} style={{ width: '100%', background: 'var(--accent)' }}>
            Confirmar Venta
          </button>
        </div>
      </div>

      {/* Historial de Ventas */}
      <h3 style={{ marginTop: '40px' }}>Historial de Ventas</h3>
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--primary)' }}>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ fontSize: '0.8rem', padding: '10px 0' }}>{v.id.substring(0,8)}...</td>
                <td>{new Date(v.fecha).toLocaleDateString()}</td>
                <td style={{ color: 'var(--accent)' }}>${v.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ventas;