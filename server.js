const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const axios = require("axios");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
// At the top of your file, add:
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
const apiKey = process.env.POSTMAN_API_KEY;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Function to fetch all workspaces along with their collections
async function fetchWorkspaces() {
  const response = await axios.get("https://api.getpostman.com/workspaces", {
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  //console.log(response.data.workspaces);
  // Filter out the excluded workspace ID
  return response.data.workspaces.filter(
    (workspace) => workspace.id !== "62081371-47af-448e-a7d6-9e523dd0f6dc"
  );
  //return response.data.workspaces;
}

// Function to fetch specific collection data
async function fetchCollectionData(collectionId) {
  try {
    const response = await axios.get(
      `https://api.getpostman.com/collections/${collectionId}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );
    // const collectionData = await response.json();

    //const requests = collectionData.item.map(item => item.name);
    //console.log(response);
    // Clear the existing checkboxes
    return response;
  } catch (error) {
    console.error("Failed to get initial collection data:", error);
  }
}

// Route to fetch collections for a given workspace
app.get("/collections-for-workspace/:workspaceId", async (req, res) => {
  try {
    const workspaceDetails = await fetchWorkspaceDetails(
      req.params.workspaceId
    );
    res.json(workspaceDetails.collections || []);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch collections for workspace" });
  }
});

// Route to fetch checkboxes for a given collection
app.get("/checkboxes-for-collection/:collectionId", async (req, res) => {
  try {
    const collectionData = await fetchCollectionData(req.params.collectionId);
    res.json(collectionData.data.collection.item || []);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch checkboxes for collection" });
  }
});

//Function to gethc a specific workspace
async function fetchWorkspaceDetails(workspaceId) {
  const response = await axios.get(
    `https://api.getpostman.com/workspaces/${workspaceId}`,
    {
      headers: {
        "X-Api-Key": apiKey,
      },
    }
  );
  return response.data.workspace;
}

//fetch only oubic workspace
async function fetchPublicWorkspaces() {
  const response = await axios.get("https://api.getpostman.com/workspaces", {
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  return response.data.workspaces.filter(
    (workspace) => workspace.visibility === "public"
  );
}

// Main route to render the page
app.get("/", async (req, res) => {
  let workspaces,
    publicWorkspaces,
    selectedWorkspaceId,
    workspaceDetails,
    collections,
    selectedCollectionId,
    collectionData,
    requests = [];

  // Fetch all workspaces
  try {
    workspaces = await fetchWorkspaces();
    //console.log("Workspaces:", workspaces);
    selectedWorkspaceId =
      req.query.workspace || (workspaces[0] && workspaces[0].id);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
  }

  try {
    publicWorkspaces = workspaces.filter(
      (workspace) => workspace.visibility === "public"
    );
    //console.log("Public Workspaces:", publicWorkspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
  }

  // Fetch details of the selected workspace
  try {
    workspaceDetails = await fetchWorkspaceDetails(selectedWorkspaceId);
    //console.log("Workspace Details:", workspaceDetails);
    collections = workspaceDetails.collections || [];
  } catch (error) {
    console.error(
      `Error fetching details for workspace ${selectedWorkspaceId}:`,
      error
    );
  }

  selectedCollectionId =
    req.query.collection || (collections[0] && collections[0].uid);

  // Fetch specific collection data
  if (selectedCollectionId) {
    try {
      collectionData = await fetchCollectionData(selectedCollectionId);
      //console.log("Collection Data:", collectionData.data);
      requests = collectionData.data.collection.item;
      //console.log("Items:", requests);
    } catch (error) {
      console.error(
        `Error fetching collection data for collection ${selectedCollectionId}:`,
        error
      );
    }
  }

  res.render("index", {
    requests,
    workspaces,
    publicWorkspaces,
    collections,
    selectedWorkspaceId,
    selectedCollectionId,
    collectionData,
  });
});

app.get("/workspaces/:workspaceId", async (req, res) => {
  try {
    const workspaceDetails = await fetchWorkspaceDetails(
      req.params.workspaceId
    );
    res.json(workspaceDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspace details" });
  }
});

app.get("/collections/:collectionId", async (req, res) => {
  try {
    const collectionData = await fetchCollectionData(req.params.collectionId);
    res.json(collectionData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch collection details" });
  }
});

app.post("/create-collection", async (req, res) => {
  console.log("Request Body:", JSON.stringify(req.body.selectedRequests));

  //console.log("req.body.selectedRequests:", req.body.selectedRequests);

  const selectedIndices = Array.isArray(req.body.selectedRequests)
    ? req.body.selectedRequests.map(Number)
    : [Number(req.body.selectedRequests)];

  console.log("Selected Indices:", selectedIndices);

  const selectedObjects = selectedIndices.map((index) => {
    const requestData = req.body["requestData_" + index];
    //console.log(`requestData_${index}:`, requestData);
    return requestData ? JSON.parse(requestData) : null;
  });

  console.log("Selected Objects:", selectedObjects);

  const publicWorkspaceId = req.body.publicWorkspaceId;
  console.log("Public Workspace ID:", publicWorkspaceId);

  //console.log("Selected requests:", JSON.stringify(selectedObjects));
  // Construct a new collection object based on the selected requests
  // This is a simplified example; you might need to adjust based on the actual structure of your requests
  const newCollection = {
    info: {
      name: "New Collection",
      description: "Generated from selected requests",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: selectedObjects,
  };

  // console.log(
  //   "Selected requests after parsing:",
  //   JSON.stringify(newCollection)
  // );
  try {
    // Log the request body
    // console.log("Request Body:", {
    //   collection: newCollection,
    // });

    //Use the Postman API to create the new collection
    // const response = await axios.post(
    //   `https://api.getpostman.com/collections`,
    //   {
    //     collection: newCollection,
    //   },
    //   {
    //     headers: {
    //       "X-Api-Key": apiKey,
    //     },
    //   }
    // );

    const response = await axios.post(
      `https://api.getpostman.com/collections?workspace=${publicWorkspaceId}`,
      {
        collection: newCollection,
      },
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );

    // Log the request body
    console.log("New Collection:", {
      collection: response.data,
    });

    res.redirect("/");
  } catch (error) {
    console.error("Failed to create new collection:", error.response.data);
    res.status(500).send("Failed to create new collection");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
