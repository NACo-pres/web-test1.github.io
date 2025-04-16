require('dotenv').config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const path = require('path');


//const { passport, initializeSession } = require('./auth'); // Import the authentication setup
const { initializeSession, setupAuthRoutes } = require("./auth");

const app = express();
app.use(express.json());
app.use(cors());

// Initialize session and Passport authentication
initializeSession(app);
setupAuthRoutes(app);

// Configure the database connection
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Use encryption (recommended for Azure)
    trustServerCertificate: true, // Skip SSL validation (for development)
  },
};

// Test connection to the database
sql.connect(dbConfig, (err) => {
  if (err) {
    console.log("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to Azure SQL Database");
});

app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Connect to the database
      await sql.connect(dbConfig);
  
      // Check if the email already exists
      const result = await sql.query`SELECT * FROM D365.Individual WHERE email_address = ${email}`;
  
      if (result.recordset.length > 0) {
        // Email already exists
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
  
      // Insert new user if email doesn't exist
      await sql.query`INSERT INTO d.emp (name, email_address, password) VALUES (${name}, ${email}, ${password})`;
  
      // Return success response
      res.status(200).json({ success: true, message: 'User created successfully' });
  
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ success: false, message: 'Error connecting to database' });
    }
  });
  

// POST route for login
app.post("/login", async (req, res) => {
    const { email } = req.body;
  
    try {
      // Query the 'emp' table under schema 'd' for the email
      const result = await sql.query`SELECT * FROM D365.Individual WHERE email_address = ${email}`;
      
      if (result.recordset.length > 0) {
        // Email exists, return success response
        res.status(200).json({ message: "Email found, redirecting to Home" });
      } else {
        // Email not found
        res.status(404).json({ message: "Email not found" });
      }
    } catch (err) {
      console.error("Error checking email:", err);
      res.status(500).json({ message: "Error connecting to the database" });
    }
  });

  app.get('/api/committees', async (req, res) => {
    try {
      // Connect to the Azure SQL Database
      await sql.connect(dbConfig);
      
      // Query data from your database
      const result = await sql.query('SELECT * FROM D365.Committee'); // Adjust the SQL query to match your schema
      
      // Send back the result as JSON
      res.json(result.recordset); 
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/committee-member', async (req, res) => {
    try {
        // Connect to Azure SQL Database
        await sql.connect(dbConfig);
        
        // Run the SQL query
        const result = await sql.query(`
            SELECT
                cm.committee_member_key,
                i.full_name AS Individual,
                i.title AS JobTitle,
                c.name AS CommitteeName,
                o.organization_name AS Organization,
                o.state_abb AS State,
                p.position_name AS Position,
                t.term_name AS Term
            FROM
                D365.Committee_Members cm
                LEFT JOIN D365.Individual i ON cm.Individual_Key = i.individual_key
                LEFT JOIN D365.Organization o ON cm.Organization_key = o.organization_key
                LEFT JOIN D365.Committee c ON cm.committee_key = c.committee_key
                LEFT JOIN D365.Committee_Term t ON cm.term_key = t.term_key
                LEFT JOIN D365.Committee_Position p ON cm.position_key = p.position_key
            ORDER BY
                cm.committee_member_key;
        `);
        
        // Check if any records were returned
        if (result.recordset.length === 0) {
            console.warn('No committee member data found.');
        }

        // Send JSON response
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching committee members:', err);
        res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/committee-applications', async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query(`
        SELECT 
            pcm.naco_prospectivecommitteememberid,  -- Unique ID for prospective members
            i.full_name AS Individual,
            i.title AS JobTitle,
            o.organization_name AS Organization,
            o.state_abb AS State, 
            c.name AS Committee, 
            ct.term_name AS Term
        FROM 
            D365.Prospective_Committee_Members pcm
        LEFT JOIN 
            D365.Individual i ON pcm.naco_individualid = i.individual_Key
        LEFT JOIN 
            D365.Organization o ON i.Organization_key = o.organization_key
        LEFT JOIN 
            D365.Committee c ON pcm.naco_committeeid = c.committee_key
        LEFT JOIN 
            D365.Committee_Term ct ON pcm.naco_committeetermid = ct.term_Key;


      `);
      res.json(result.recordset);
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/final-leaders-list', async (req, res) => {
    try {
        // Connect to the Azure SQL Database
        await sql.connect(dbConfig);

        // Query to fetch applicants without a position
        const result = await sql.query(`
            SELECT 
                pcm.naco_committeeapplicationid AS CommitteeApplication,
                i.full_name AS Individual,
                o.organization_name AS Organization,
                o.state_abb AS State,
                c.name AS Committee,
                ct.term_name AS Term,  
                pcm.naco_committeechair AS Chair,
                pcm.naco_committeevicechair AS ViceChair,
                pcm.naco_subcommitteeid AS SubCommittee
            FROM 
                D365.Prospective_Committee_Members pcm
            LEFT JOIN 
                D365.Individual i ON pcm.naco_individualid = i.individual_Key
            LEFT JOIN 
                D365.Organization o ON i.Organization_key = o.organization_key
            LEFT JOIN 
                D365.Committee c ON pcm.naco_committeeid = c.committee_key
            LEFT JOIN 
                D365.Committee_Term ct ON pcm.naco_committeetermid = ct.term_Key  -- Joining Term table
            WHERE 
                pcm.naco_committeepositionid IS NOT NULL  -- Filtering applicants without a position
            
        `);

        // Send back the result as JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching final leaders:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/applicants-without-position', async (req, res) => {
  try {
      // Connect to the Azure SQL Database
      await sql.connect(dbConfig);

      // Query to fetch applicants without a position
      const result = await sql.query(`
       SELECT 
            pcm.naco_committeeapplicationid AS CommitteeApplication,
            i.full_name AS Individual,
            o.organization_name AS Organization,
            o.state_abb AS State,
            c.name AS Committee,
            ct.term_name AS Term,

            -- Newline-separated position list
            LTRIM(RTRIM(
                CONCAT(
                    CASE WHEN pcm.naco_vicechair = 1 THEN 'Vice Chair' + CHAR(13) + CHAR(10) ELSE '' END,
                    CASE WHEN pcm.naco_director = 1 THEN 'Director' + CHAR(13) + CHAR(10) ELSE '' END,
                    CASE WHEN pcm.naco_chair = 1 THEN 'Chair' + CHAR(13) + CHAR(10) ELSE '' END,
                    CASE WHEN pcm.naco_subcommitteechair = 1 THEN 'Subcommittee Chair' + CHAR(13) + CHAR(10) ELSE '' END,
                    CASE WHEN pcm.naco_subcommitteevicechair = 1 THEN 'Subcommittee Vice Chair' + CHAR(13) + CHAR(10) ELSE '' END,
                    CASE WHEN pcm.naco_committeechair = 1 THEN 'Committee Chair' + CHAR(13) + CHAR(10) ELSE '' END,
                    CASE WHEN pcm.naco_committeemember = 1 THEN 'Committee Member' + CHAR(13) + CHAR(10) ELSE '' END
                )
            )) AS Position
        FROM 
            D365.Prospective_Committee_Members pcm
        LEFT JOIN 
            D365.Individual i ON pcm.naco_individualid = i.individual_Key
        LEFT JOIN 
            D365.Organization o ON i.Organization_key = o.organization_key
        LEFT JOIN 
            D365.Committee c ON pcm.naco_committeeid = c.committee_key
        LEFT JOIN 
            D365.Committee_Term ct ON pcm.naco_committeetermid = ct.term_Key
        WHERE 
            pcm.naco_committeepositionid IS NOT NULL



      `);

      // Send back the result as JSON
      res.json(result.recordset);
  } catch (err) {
      console.error('Error fetching applicants without position:', err);
      res.status(500).send('Internal Server Error');
  }
});

app.use(express.static(path.join(__dirname, '..', 'wwwroot')));
 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'wwwroot', 'index.html'));
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});