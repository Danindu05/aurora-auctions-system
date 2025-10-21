# GemAuctionAPI

This is the backend API for the Gem Auction System. It provides endpoints for user authentication and will be extended to manage auctions, bids, and user profiles.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites for Backend

*   [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
*   [Docker](https://www.docker.com/products/docker-desktop)
*   [Azure Data Studio](https://learn.microsoft.com/en-us/azure-data-studio/download-azure-data-studio?tabs=win-install%2Cwin-user-install%2Credhat-install%2Cwindows-uninstall%2Credhat-uninstall)(For manage Database)


### Database Setup
## Step 1: Open Your Terminal

Launch your preferred command-line interface, such as **PowerShell**, **Command Prompt**, or the terminal integrated into Docker Desktop.

## Step 2: Pull the SQL Server Docker Image

Run the following command to download the latest SQL Server 2022 image from Microsoft's container registry.

```bash
docker pull mcr.microsoft.com/mssql/server:2022-latest
```

## Step 3: Run the SQL Server Container

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=#Group61" -p 1433:1433 --name sql1 --hostname sql1 -d mcr.microsoft.com/mssql/server:2022-latest
```

### Step 4: Connect with Azure Data Studio

Once the container is running, open Azure Data Studio and set up a new connection with the following details:

  * **Server:** `localhost`
  * **Authentication type:** `SQL Login`
  * **User name:** `sa`
  * **Password:** `#Group61`
  * **Trust Server Certificate:** `True`



Click **Connect**, and you should now be connected to your SQL Server instance running in Docker\! 🎉


### Installation Backend

1.  Clone the repo
2.  Navigate to the backend directory `cd backend/GemAuctionAPI`
3.  Restore the dependencies:
    ```bash
        dotnet restore
    ```

## Usage

To run the application, use the following command:

```bash
dotnet run
```

The API will be available at `https://localhost:5001` (or a similar port). You can view the available endpoints and interact with the API through the Swagger UI at `https://localhost:5001/swagger`.
