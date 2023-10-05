const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const axios = require('axios');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
// At the top of your file, add:
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
const apiKey = process.env.POSTMAN_API_KEY;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Function to fetch all workspaces along with their collections
async function fetchWorkspaces() {
    const response = await axios.get('https://api.getpostman.com/workspaces', {
        headers: {
            'X-Api-Key': apiKey
        }
    });
    console.log(response.data.workspaces);
    return response.data.workspaces;
}

// Function to fetch specific collection data
async function fetchCollectionData(collectionId) {
    const response = await axios.get(`https://api.getpostman.com/collections/${collectionId}`, {
        headers: {
            'X-Api-Key': apiKey
        }
    });
    return response.data.collection;
}

//Function to gethc a specific workspace
async function fetchWorkspaceDetails(workspaceId) {
    const response = await axios.get(`https://api.getpostman.com/workspaces/${workspaceId}`, {
        headers: {
            'X-Api-Key': apiKey
        }
    });
    return response.data.workspace;
}

//fetch only oubic workspace
async function fetchPublicWorkspaces() {
    const response = await axios.get('https://api.getpostman.com/workspaces', {
        headers: {
            'X-Api-Key': apiKey
        }
    });
    return response.data.workspaces.filter(workspace => workspace.type === 'public');
}

// Main route to render the page
app.get('/', async (req, res) => {
    let workspaces, publicWorkspaces, selectedWorkspaceId, workspaceDetails, collections, selectedCollectionId, collectionData, requests = [];

    // Fetch all workspaces
    try {
        workspaces = await fetchWorkspaces();
        console.log('Workspaces:', workspaces);
        selectedWorkspaceId = req.query.workspace || (workspaces[0] && workspaces[0].id);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }

    try {
        publicWorkspaces  = workspaces.filter(workspace => workspace.type === 'public');
        console.log('Public Workspaces:', publicWorkspaces);

    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }

    // Fetch details of the selected workspace
    try {
        workspaceDetails = await fetchWorkspaceDetails(selectedWorkspaceId);
        console.log('Workspace Details:', workspaceDetails);
        collections = workspaceDetails.collections || [];
    } catch (error) {
        console.error(`Error fetching details for workspace ${selectedWorkspaceId}:`, error);
    }

    selectedCollectionId = req.query.collection || (collections[0] && collections[0].id);

    // Fetch specific collection data
    if (selectedCollectionId) {
        try {
            collectionData = await fetchCollectionData(selectedCollectionId);
            console.log('Collection Data:', collectionData);
            requests = collectionData.item.map(item => item.name);
        } catch (error) {
            console.error(`Error fetching collection data for collection ${selectedCollectionId}:`, error);
        }
    }

    res.render('index', { requests, workspaces, publicWorkspaces, collections, selectedWorkspaceId, selectedCollectionId, collectionData });
});

app.get('/workspaces/:workspaceId', async (req, res) => {
    try {
        const workspaceDetails = await fetchWorkspaceDetails(req.params.workspaceId);
        res.json(workspaceDetails);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch workspace details" });
    }
});

app.get('/collections/:collectionId', async (req, res) => {
    try {
        const collectionData = await fetchCollectionData(req.params.collectionId);
        res.json(collectionData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch collection details" });
    }
});

app.post('/create-collection', async (req, res) => {
    const selectedRequests = req.body.selectedRequests;
    const publicWorkspaceId = req.body.publicWorkspaceId;

     // Construct a new collection object based on the selected requests
    // This is a simplified example; you might need to adjust based on the actual structure of your requests
    const newCollection = {
        "info": {
            "name": "New Collection",
            "description": "Generated from selected requests"
        },
        "item": selectedRequests.map(request => {
            return {
                "name": request,
                "request": {
                    // ... other request properties, such as method, URL, headers, etc.
                }
            }
        })
    };


    try {
        // Use the Postman API to create the new collection
        const response = await axios.post(`https://api.getpostman.com/collections?workspace=${publicWorkspaceId}`, {
            collection: newCollection
        }, {
            headers: {
                'X-Api-Key': apiKey
            }
        });

        const newCollectionId = response.data.collection.id;

        res.redirect('/');
    } catch (error) {
        console.error('Failed to create new collection:', error);
        res.status(500).send('Failed to create new collection');
    }
});


app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});