
# 📦 StockFlow: Sistema Gestor de Inventario

  

**StockFlow** es una aplicación web para la gestión de inventarios y ventas, diseñada para pequeñas empresas. Implementa una arquitectura desacoplada con un backend en Node.js (Express) y un frontend en React, utilizando Firebase para autenticación y base de datos NoSQL.

 

## 🛠️ Framework elegido y versiones

  

-  **Backend:** Express.js v5.2.1

-  **Frontend:** React.js v19.2.4

-  **Entorno:** Node.js v18 o superior

  


## 📋 Requisitos para ejecutar

  

- Node.js (v18 o superior)

- Cuenta de Firebase con Firestore habilitado

- Archivo `serviceAccountKey.json` en:

backend/src/config/

  

- Archivo .env en backend:

PORT=3000



## 🔧 Instalación de dependencias

  

El proyecto no incluye la carpeta `node_modules`, por lo que deben instalarse manualmente:

  

### Backend

```bash

cd  backend

npm  install

```

  

### Frontend

```bash

cd  frontend

npm  install

```



## 🚀 Cómo ejecutar el proyecto

### 1. Iniciar Backend

```bash

cd  backend

npm  start

```

  

### 💡 Modo desarrollo (opcional):

```bash

npm  run  dev

```

  

### 2. Iniciar Frontend

```bash

cd  frontend

npm  start

```

  

- Backend: http://localhost:3000

- Frontend: http://localhost:3001

  


## 🔗 Endpoints disponibles (Resumen)

La API utiliza el prefijo `/api/v1` para todas sus rutas.

  

| **Módulo** | **Ruta** | **Método** | **Descripción** | **Seguridad** |



| **Productos** | `/productos` | GET | Listado de inventario | Público |

| **Productos** | `/productos` | POST | Registrar nuevo producto | Requiere JWT |

| **Productos** | `/productos/:id` | PUT | Actualizar información | Requiere JWT |

| **Productos** | `/productos/:id` | DELETE | Eliminar del catálogo | Requiere JWT |

| **Ventas** | `/ventas` | POST | Registro de venta múltiple | Requiere JWT |

| **Ventas** | `/ventas` | GET | Historial de transacciones | Requiere JWT |

 

## 📦 Ejemplo de Request (Registro de Venta)

```json
{
	"usuarioId":  "usuario@prueba.com",
	"total":  94.00,
	"productos":  [
		{
		"id":  "osoI4scgDpjpijJYty3L",
		"cantidad":  3,
		"precio":  18.00
		},
		{
			"id":  "TjlG715Top5CHPDQb2lQ",
			"cantidad":  2,
			"precio":  20.00
		}
	]
}
```


## 📥 Ejemplo de Response

```json

{
	"status": "success",
	"message": "Venta realizada exitosamente"
}

```

  

## 🔒 Autenticación

- Tipo: Firebase Auth (JWT)
- Header requerido:

		Authorization: Bearer <token>

  

## 🧪 Evidencia de pruebas

- Las pruebas del sistema fueron realizadas con Postman e incluyen:
	- CRUD completo de productos
	- Registro y consulta de ventas
	- Validación de endpoints protegidos (401 Unauthorized)
	- Manejo de errores (400, 404, 401)
- Las evidencias completas se encuentran en el documento PDF del proyecto.



## 📁 Estructura del proyecto

	backend/
	└── src/
	├── config/
	├── controllers/
	├── middleware/
	├── routes/
	└── index.js

	frontend/
	└── src/
	├── components/
	├── services/
	└── App.js

  
## 👨‍💻 Equipo

- Luis Angel Pacheco Silva
- Diego Martinez Camacho
- Emilio Antonio Macías Ovalle
