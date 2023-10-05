# Postman Collection Generator

The Postman Collection Generator is a Node.js application that interacts with the Postman API. Users can select specific requests from a Postman collection and generate a new collection based on their selections. The application provides a user-friendly interface with dropdowns for workspace and collection selection, and checkboxes for individual requests.

The new collection is saved to the [Avetta's APIs Public Workspace](https://www.postman.com/avettamigration/workspace/avetta-s-apis) for sharing with the customer.

## Getting Started

### Prerequisites

- Node.js and npm
- A Postman account

### Setting up a local environment file

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Create a `.env.local` file in the root directory of the project.

3. Inside `.env.local`, add your Postman API key:

   ```
   POSTMAN_API_KEY=your_actual_api_key_here
   ```

### Obtaining a Postman API Key

1. Log in to your Postman account.
2. Go to the [Postman Dashboard](https://go.postman.co/).
3. Navigate to the "API Keys" tab.
4. Click on "Create API Key".
5. Name your API key, and click on "Create API Key" again.
6. Copy the generated API key and save it securely. Remember, once you close the API key generation modal, you won't be able to see the API key again.

### Installing

Once you've set up your `.env.local` file:

1. Install the required packages:

   ```bash
   npm install
   ```

2. Run the server:

   ```bash
   npm start
   ```

3. Navigate to `http://localhost:3000` in your browser (or the port you've configured) to use the application.

## Usage

Select a workspace and a collection using the dropdown menus. Choose the requests you want to include in your new collection using the checkboxes, and then click "Create New Collection". Your new collection will be generated and saved to your Postman account.
