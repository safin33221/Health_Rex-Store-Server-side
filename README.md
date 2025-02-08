# HealthRex Store Backend

This repository hosts the backend server for the **HealthRex Store**, a modern e-commerce platform for selling medicines. The backend is built to efficiently handle data management, authentication, and API services, ensuring smooth integration with the frontend.

## 🌐 Live Backend URL
[Backend Live Server](https://medicing-selling-server-side.vercel.app/)

---

## 🚀 Features

1. **User Authentication**: Secure login and registration using JWT (JSON Web Token).  
2. **Admin Management**: Admin roles for managing products, orders, and users.  
3. **Product Management**: CRUD operations for medicines and categories.  
4. **Order Handling**: Efficient order creation, status updates, and tracking.  
5. **Cart Functionality**: Backend logic to handle user cart data.  
6. **Real-time Inventory Updates**: Tracks and updates stock levels based on user orders.  
7. **RESTful API**: Clean and organized endpoints for seamless communication with the frontend.  
8. **Data Validation**: Input validation for user data and API requests to ensure reliability.  
9. **Database Management**: Efficient handling of data using MongoDB.  
10. **Deployment Ready**: Fully hosted on Vercel for fast and reliable performance.  

---

## 🧰 Technologies Used

- **Backend Framework**: Node.js with Express.js  
- **Database**: MongoDB (Cloud-hosted via MongoDB Atlas)  
- **Authentication**: JSON Web Tokens (JWT)  
- **Hosting**: Vercel  
- **Environment Variables**: Managed securely with `dotenv`



## API Endpoints
### JWT Token Creation
- `POST /jwt`: Create a JSON web token for the user

### User Management
- `GET /users`: Retrieve all users (Admin only)
- `POST /users`: Store a new user in the database
- `PATCH /user/role/:email`: Update user role (Admin only)
- `GET /user/role/:email`: Get user role by email

### Customer Testimonials
- `GET /customerTestimonials`: Retrieve all customer testimonials

### FAQ Management
- `GET /fqa`: Retrieve all FAQs

### Medicines Management
- `GET /medicines`: Retrieve medicines with search and sort options
- `GET /medicineCounts`: Get the count of all medicines
- `GET /discount-products`: Retrieve medicines with discounts
- `GET /invoice/details/:transtionId`: Get invoice details by transaction ID
- `GET /seller/medicine/:email`: Retrieve medicines for a specific seller
- `GET /sellers/medicine-counts/:email`: Get the count of medicines for a specific seller
- `POST /medicines`: Add new medicine (Seller only)
- `DELETE /medicine/delete/:id`: Delete a medicine by ID (Seller only)

### Advertisement Management
- `POST /askAddverticement`: Request an advertisement (Seller only)
- `GET /addvertisements`: Retrieve all advertisements
- `GET /addvertise/success`: Retrieve successful advertisements
- `GET /seller/adds/:email`: Retrieve advertisements for a specific seller
- `PATCH /askAddverticement/status`: Update advertisement status (Admin only)

### Category Management
- `GET /category`: Retrieve all categories
- `GET /categories/:category`: Retrieve medicines by category with search and sort options
- `GET /categoryDetails`: Retrieve category details with medicine count
- `POST /category`: Add a new category (Admin only)
- `DELETE /category/:id`: Delete a category by ID (Admin only)
- `PATCH /category/:id`: Update a category by ID (Admin only)

### Cart Management
- `GET /carts/:email`: Retrieve cart items for a specific user
- `POST /carts`: Add an item to the cart
- `PATCH /cart/quantity/:id`: Update the quantity of a cart item
- `DELETE /cart/:id`: Delete a cart item by ID
- `DELETE /deletedAll/:email`: Delete all cart items for a specific user

### Payment Management
- `POST /create-payment-intent`: Create a payment intent with Stripe
- `POST /payment`: Store payment information and delete related cart items
- `GET /payments/:email`: Retrieve payments for a specific user
- `GET /manage-payments`: Retrieve all payments (Admin only)
- `PATCH /payment/:id`: Update payment status by ID (Admin only)

### Sales Reports
- `GET /sales-reports`: Retrieve sales reports (Admin only)
- `GET /payments-history/:email`: Retrieve payment history for a specific user
- `GET /seller/sales-states/:email`: Retrieve sales statistics for a specific seller
- `GET /admin/sales-states`: Retrieve overall sales statistics (Admin only)

### Server Status
- `GET /`: Check if the server is running

## License
This project is licensed under the MIT License.




