# 💎 Aurora Auctions 
Aurora Auctions is a full-stack online auction platform that allows both **users** and **admins** to create, manage, and participate in live auctions. It offers a real-time bidding system, secure sandbox-enabled payments, and modern dashboards designed for smooth auction management and user experience.

## 🌐 User Features  
- **Create Auctions** — Users can list their own items for auction with images and details  
- **Real-Time Bidding** — Participate in live auctions and track current bids instantly  
- **Secure Payments** — Sandbox-enabled payment system for safe test transactions  
- **Profile & History** — View personal bidding history, won auctions, and payment records  
- **Responsive Design** — Fully optimized for both desktop and mobile devices  

## 🛡️ Admin Dashboard  
- **Manage Auctions** — Approve, edit, or remove auction listings  
- **User Management** — View, verify, or restrict user accounts  
- **Bid Monitoring** — Track live bids and auction analytics  
- **Payment Oversight** — Review transactions through the sandbox system  
- **System Insights** — View reports and platform statistics  

## 🛠️ Tech Stack  

- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** .NET 9 Web API, Entity Framework Core  
- **Database:** SQL Server (Dockerized)  
- **Authentication:** JWT-based role management (User/Admin)  
- **Payments:** Sandbox Integration


## 💻 Local Development  

1. **Clone the repository:**  
   ```sh
   git clone https://github.com/Danindu05/aurora-auctions-system.git
   ```

2. **Backend setup:**  
   ```sh
   cd Auction.Api
   dotnet restore
   dotnet run
   ```

3. **Frontend setup:**  
   ```sh
   cd ../frontend
   pnpm install
   pnpm dev
   ```

4. **Access the application:**  
   Open [http://localhost:5173](http://localhost:5173) in your browser.  
