import React, { useEffect, useState } from 'react';
import './App.css';
import { getProductos, crearProducto, eliminarProducto, actualizarProducto } from './services/api';
import Login from './components/Login';
import Ventas from './components/Ventas'; // Importamos el nuevo componente
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [editando, setEditando] = useState(false);
  const [productoId, setProductoId] = useState(null);
  
  // Estado para el formulario de productos
  const [form, setForm] = useState({ 
    nombre: '', 
    descripcion: '', 
    precio: '', 
    stock: '' 
  });

  // 1. Cargar productos desde el backend
  const cargarProductos = async () => {
    try {
      const res = await getProductos();
      // Ajuste para el controlador que envía { status: "success", data: [...] }
      if (res.data && res.data.status === "success") {
        setProductos(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setProductos([]);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 2. Manejo de cambios en el formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Crear o Actualizar Producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    const datos = { 
      ...form, 
      precio: parseFloat(form.precio), 
      stock: parseInt(form.stock) 
    };

    try {
      if (editando) {
        await actualizarProducto(productoId, datos);
        alert("Producto actualizado con éxito");
      } else {
        await crearProducto(datos);
        alert("Producto creado con éxito");
      }
      cancelarEdicion();
      cargarProductos();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "No se pudo procesar la solicitud"));
    }
  };

  // 4. Preparar la interfaz para editar
  const prepararEdicion = (p) => {
    setEditando(true);
    setProductoId(p.id);
    setForm({ 
      nombre: p.nombre, 
      descripcion: p.descripcion, 
      precio: p.precio, 
      stock: p.stock 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setProductoId(null);
    setForm({ nombre: '', descripcion: '', precio: '', stock: '' });
  };

  // 5. Eliminar producto
  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await eliminarProducto(id);
        cargarProductos();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="container">
      <header className="header-section">
        <h1>StackFlow <span style={{ color: 'var(--primary)' }}>Manager</span></h1>
        <Login />
      </header>

      {/* SECCIÓN: GESTIÓN DE PRODUCTOS (Solo si hay usuario) */}
      {user && (
        <section className="card" style={{ marginBottom: '40px', border: editando ? '1px solid var(--primary)' : 'none' }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? "Editando Producto" : "Registrar Nuevo Producto"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
              <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
              <input name="precio" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={handleChange} required />
              <input name="stock" type="number" placeholder="Stock inicial" value={form.stock} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 2 }}>
                {editando ? "Guardar Cambios" : "Agregar al Inventario"}
              </button>
              {editando && (
                <button type="button" onClick={cancelarEdicion} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* SECCIÓN: LISTADO DE PRODUCTOS (VISTA DE INVENTARIO) */}
      <h3 style={{ marginBottom: '20px' }}>Inventario Actual</h3>
      <div className="product-grid">
        {productos.length > 0 ? (
          productos.map(p => (
            <div key={p.id} className="card">
              <h4 style={{ color: 'var(--primary)', margin: '0 0 10px 0' }}>{p.nombre}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minHeight: '35px' }}>{p.descripcion}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span className="price-tag">${p.precio}</span>
                <span style={{ fontSize: '0.9rem', color: p.stock > 0 ? 'var(--accent)' : '#ef4444' }}>
                  {p.stock} unidades
                </span>
              </div>
              
              {user && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <button onClick={() => prepararEdicion(p)} style={{ flex: 1, backgroundColor: '#3b82f6', fontSize: '0.75rem', padding: '8px' }}>
                    Editar
                  </button>
                  <button onClick={() => handleEliminar(p.id)} style={{ flex: 1, backgroundColor: '#ef4444', fontSize: '0.75rem', padding: '8px' }}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No hay productos o cargando...</p>
        )}
      </div>

      {/* SECCIÓN: VENTAS (Solo si hay usuario) */}
      {user ? (
        <>
          <hr style={{ margin: '50px 0', opacity: 0.1 }} />
          <Ventas 
            productosDisponibles={productos} 
            alVender={cargarProductos} 
          />
        </>
      ) : (
        <div className="card" style={{ marginTop: '40px', textAlign: 'center' }}>
          <p>Debes iniciar sesión con Google para gestionar el inventario y realizar ventas.</p>
        </div>
      )}
    </div>
  );
}

export default App;