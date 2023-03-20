const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const Multer = require('multer');
const fs = require("fs");
const stream =  require('stream');
const buffer = require('buffer');
const path = require('path');

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

const spreadsheetId = '1E6iMfg7OmKf-39mIfpm6oGcGSogJAABad_bjTihh-Qg'; //test spreadsheet id
const APL5spreadsheetID = '1IvrgdFqmex0yfk-JXP47bhp57BOkvzoQlV_y4W4OET0';
const APL6spreadsheetID = '1Hs-L9ebpEWKyQ_XoJoz5fdxTI2LK6sGCdrWyIYC-bqg';
const playersfoldergoogledriveID = '1usR6T1GvBMdKHL9i4pxzoX_bYnwsQOtT';
const teamfoldergoogledriveID = '1QyDqYL1Q9JpaOPbdGhGfEaz1Cf-BKiuu';
const fifafoldersgoogledriveID = '1ZedYvvCzIoXb08su2SVw2jglpIrU5R0I'

// GET request to get APL 5 players data
app.get('/seasons/apl5/playerdata', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const PlayerData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL5spreadsheetID,
        range: 'APL5Players!2:900'
    })
    res.send(PlayerData.data.values);
})

// GET request to get APL 5 teams data
app.get('/seasons/apl5/teamdata', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const TeamData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL5spreadsheetID,
        range: 'APL5Teams'
    })
    res.send(TeamData.data.values);
})

// GET request to get APL 5 teams budget data
app.get('/seasons/apl5/teamdata/budgets', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const TeamData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL5spreadsheetID,
        range: 'APL5TeamBudgetSplits'
    })
    res.send(TeamData.data);
})

// GET request to get APL 6 registered players emailIDs data
app.get('/registration/player', async(req,res)=>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const RegisteredPlayersEmailData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL6spreadsheetID,
        range: 'APL6Players!L2:L900'
    })
    res.send(RegisteredPlayersEmailData.data);
})
app.get('/registration/checkreg', async(req,res)=>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const RegisteredPlayersGenderData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL6spreadsheetID,
        range: 'APL6Players!J2:J900'
    })
    res.send(RegisteredPlayersGenderData.data);
})

// GET request to get APL 6 registered teams emailIDs data
app.get('/registration/team', async(req,res)=>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const RegisteredTeamsEmailData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL6spreadsheetID,
        range: 'APL6Teams!B2:B900'
    })
    res.send(RegisteredTeamsEmailData.data);
})

// POST request to store APL 6 player data in database
app.post('/registration/player', async (req, res) =>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const response = await googleSheets.spreadsheets.values.append({
        spreadsheetId: APL6spreadsheetID,
        range: "APL6Players",
        valueInputOption: "USER_ENTERED",
        resource: {
            // image, firstname, middlename, lastname, emailid, batch, phone, gender, primarypos, secondpos, comment
            values: [[
                req.body.image,
                req.body.name, 
                req.body.primarypos, 
                req.body.secondpos, 
                req.body.comment,
                req.body.tier, 
                req.body.price, 
                req.body.team, 
                req.body.teamlogo,
                req.body.gender,
                req.body.batch,
                req.body.emailID
            ]],
        },
      });
      res.send(response)
} )

// POST request to store APL 6 team data in database
app.post('/registration/team', async (req, res) =>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const response = await googleSheets.spreadsheets.values.append({
        spreadsheetId: APL6spreadsheetID,
        range: "APL6Teams",
        valueInputOption: "USER_ENTERED",
        resource: {
            // teamlogo, teamname, managername, manageremailid, managerphone, totalownersnumber, allownersemail, allownersemailIDs
            values: [[
                req.body.teamlogo,
                req.body.manageremail, 
                req.body.teamname, 
                req.body.paymentmode, 
                req.body.managername,
                req.body.teamownersnames, 
                req.body.managerphone, 
                req.body.teamownersemailIDs,
                req.body.teamownersphones
            ]],
        },
      });
      res.send(response)
} )

// POST request to store APL 6 team budgets data in database
app.post('/registration/team/budgets', async (req, res) =>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    await googleSheets.spreadsheets.values.append({
        spreadsheetId: APL6spreadsheetID,
        range: "APL6TeamBudgetSplits",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [[
                req.body.teamname,
            ]],
        },
      });
} )

// GET request to get APL 6 players data
app.get('/seasons/apl6/playerdata', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const PlayerData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL6spreadsheetID,
        range: 'APL6Players'
    })
    res.send(PlayerData.data);
})

// GET request to get APL 6 teams data
app.get('/seasons/apl6/teamdata', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const TeamData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL6spreadsheetID,
        range: 'APL6Teams'
    })
    res.send(TeamData.data.values);
})

// GET request to get APL 6 teams budget data
app.get('/seasons/apl6/teamdata/budgets', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const TeamData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: APL6spreadsheetID,
        range: 'APL6TeamBudgetSplits'
    })
    res.send(TeamData.data);
})








//Code to send player image to google drive

    // function to store player image file locally first, and also update the name
    const Playermulter = Multer({
        storage: Multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './images/players');
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        },
        }),
        limits: {
        fileSize: 5 * 1024 * 1024,
        },
    });

    // function to delete the locally stored image file after uploading to google drive
    const deletePlayerFile = (filePath) => {
        fs.unlink(filePath, () => {
            console.log("player profile image file deleted");
        });
    };

    // POST request to upload player image to google drive folder
    app.post('/registration/playerimage',Playermulter.single('file') ,async (req, res) => {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/drive'
        })
        const googleDrive = google.drive({ version: "v3", auth });
        const fileMetadata = {
            name: req.file.originalname,
            parents: [playersfoldergoogledriveID]
        };
        // const bufferStream = new stream.PassThrough()
        // bufferStream.end(req.body.file.buffer);
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };
        const response = await googleDrive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        deletePlayerFile(req.file.path);
    })




//Code to send player PAYMENT image to google drive

    //function to store player image file locally first, and also update the name
    const PlayerPaymentmulter = Multer({
        storage: Multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './images/playerspayments');
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        },
        }),
        limits: {
        fileSize: 5 * 1024 * 1024,
        },
    });

    //function to delete the locally stored image file after uploading to google drive
    const deletePlayerPaymentFile = (filePath) => {
        fs.unlink(filePath, () => {
            console.log("player payment file deleted");
        });
    };

    // POST request to upload player image to google drive folder
    app.post('/registration/playerpaymentimage',PlayerPaymentmulter.single('file') ,async (req, res) => {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/drive'
        })
        const googleDrive = google.drive({ version: "v3", auth });
        const fileMetadata = {
            name: req.file.originalname,
            parents: [playersfoldergoogledriveID]
        };
        // const bufferStream = new stream.PassThrough()
        // bufferStream.end(req.body.file.buffer);
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };
        const response = await googleDrive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        deletePlayerPaymentFile(req.file.path);
    })



//Code to send team logo image to google drive

    const Teammulter = Multer({
        storage: Multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './images/teams');
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        },
        }),
        limits: {
        fileSize: 5 * 1024 * 1024,
        },
    });

    const deleteTeamFile = (filePath) => {
        fs.unlink(filePath, () => {
            console.log("Team logo image file deleted");
        });
    };

    app.post('/registration/teamlogo',Teammulter.single('file') ,async (req, res) => {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/drive'
        })
        const googleDrive = google.drive({ version: "v3", auth });
        const fileMetadata = {
            name: req.file.originalname,
            parents: [teamfoldergoogledriveID]
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };
        const response = await googleDrive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        deleteTeamFile(req.file.path);
    })

// Code to send team PAYMENT image to google drive

    const TeamPaymentmulter = Multer({
        storage: Multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './images/teampayments');
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        },
        }),
        limits: {
        fileSize: 5 * 1024 * 1024,
        },
    });

    const deleteTeamPaymentFile = (filePath) => {
        fs.unlink(filePath, () => {
            console.log("Team payment file deleted");
        });
    };

    app.post('/registration/teampaymentimages',TeamPaymentmulter.single('file') ,async (req, res) => {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/drive'
        })
        const googleDrive = google.drive({ version: "v3", auth });
        const fileMetadata = {
            name: req.file.originalname,
            parents: [teamfoldergoogledriveID]
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };
        const response = await googleDrive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        deleteTeamPaymentFile(req.file.path);
    })

    // GET request to get fifa registered participants emailIDs data
    app.get('/registration/fifa1', async(req,res)=>{
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const Participants1EmailData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'APL6FIFAEVENT!C2:C900'
        })
        res.send(Participants1EmailData.data)
        
    })
    app.get('/registration/fifa2', async(req,res)=>{
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const Participants2EmailData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'APL6FIFAEVENT!G2:G900'
        })
        res.send(Participants2EmailData.data)
        
    })
    
    // POST request to store fifa parricipants data in database
    app.post('/registration/fifa', async (req, res) =>{
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        console.log(req)
        await googleSheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: "APL6FIFAEVENT",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[
                    req.body.participantone,
                    req.body.participantonephone,
                    req.body.participantoneemail,
                    req.body.participantonebatch,
                    req.body.participanttwo,
                    req.body.participanttwophone,
                    req.body.participanttwoemail,
                    req.body.participanttwobatch,
                    req.body.image
                ]],
            },
        });
    } )
    
    app.post('/registration/fifaplayerpaymentimage',PlayerPaymentmulter.single('file') ,async (req, res) => {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/drive'
        })
        const googleDrive = google.drive({ version: "v3", auth });
        const fileMetadata = {
            name: req.file.originalname,
            parents: [fifafoldersgoogledriveID]
        };
        // const bufferStream = new stream.PassThrough()
        // bufferStream.end(req.body.file.buffer);
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };
        const response = await googleDrive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        deletePlayerPaymentFile(req.file.path);
    })

    app.get('/seasons/apl6/rules/player', async (req, res)=>{
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const playerRules = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: APL6spreadsheetID,
            range: 'APL6Rules!A2:A15'
        })
        res.send(playerRules.data)
    })
    app.get('/seasons/apl6/rules/team', async (req, res)=>{
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const teamRules = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: APL6spreadsheetID,
            range: 'APL6Rules!B2:B15'
        })
        res.send(teamRules.data)
    })
    app.get('/seasons/apl6/rules/auction', async (req, res)=>{
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const auctionRules = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: APL6spreadsheetID,
            range: 'APL6Rules!C2:C15'
        })
        res.send(auctionRules.data)
    })
    app.get('/seasons/apl6/rules/game', async (req, res)=>{
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const gameRules = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId: APL6spreadsheetID,
            range: 'APL6Rules!D2:D15'
        })
        res.send(gameRules.data)
    })
    
    app.listen(3001, (req,res)=>{
        console.log("Running on Port: 3001")
    });


// FOR TESTING! POST request when we were testing image upload
    app.post('/imagemaker', async (req,res)=>{

        const auth= new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        await googleSheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: "IMAGE",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[
                    req.body.image,
                    req.body.name
                ]]
            }
        });
        res.send('Sent')
    })

