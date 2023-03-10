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

const spreadsheetId = '1E6iMfg7OmKf-39mIfpm6oGcGSogJAABad_bjTihh-Qg';
const playersfoldergoogledriveID = '1usR6T1GvBMdKHL9i4pxzoX_bYnwsQOtT';
const teamfoldergoogledriveID = '1QyDqYL1Q9JpaOPbdGhGfEaz1Cf-BKiuu';
const fifafoldersgoogledriveID = '1ZedYvvCzIoXb08su2SVw2jglpIrU5R0I'

// GET request to get APL 5 players data
app.get('/seasons/apl5/players/playerdata', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const PlayerData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'APL5Players!2:900'
    })
    res.send(PlayerData.data.values);
})

// GET request to get APL 5 teams data
app.get('/seasons/apl5/players/teamdata', async (req,res)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    const PlayerData = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'APL5Owners!2:900'
    })
    res.send(PlayerData.data.values);
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
        spreadsheetId,
        range: 'PLAYERTESTSHEET!E2:E900'
    })
    res.send(RegisteredPlayersEmailData.data);
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
        spreadsheetId,
        range: 'TEAMTESTSHEET!D2:D900'
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
    await googleSheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "PLAYERTESTSHEET",
        valueInputOption: "USER_ENTERED",
        resource: {
            // image, firstname, middlename, lastname, emailid, batch, phone, gender, primarypos, secondpos, comment
            values: [[
                req.body.image,
                req.body.firstname, 
                req.body.middlename, 
                req.body.lastname, 
                req.body.emailid,
                req.body.batch, 
                req.body.phonenumber, 
                req.body.gender, 
                req.body.primarypos,
                req.body.secondpos,
                req.body.comment
            ]],
        },
      });
} )

// POST request to store APL 6 team data in database
app.post('/registration/team', async (req, res) =>{

    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: 'v4', auth: client});
    await googleSheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "TEAMTESTSHEET",
        valueInputOption: "USER_ENTERED",
        resource: {
            // teamlogo, teamname, managername, manageremailid, managerphone, totalownersnumber, allownersemail, allownersemailIDs
            values: [[
                req.body.teamlogo,
                req.body.teamname, 
                req.body.managername, 
                req.body.manageremail, 
                req.body.managerphone,
                req.body.totalowners, 
                req.body.teamownersnames, 
                req.body.teamownersemailIDs,
            ]],
        },
      });
} )






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


// FOR TESTING! POST request when we were testing image upload
    app.post('/seasons/apl5/players', async (req,res)=>{

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
        console.log(res)
    })

// GET request to get fifa registered participants emailIDs data
    app.get('/registration/fifa', async(req,res)=>{

        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: 'v4', auth: client});
        const Participants1EmailData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'FIFATESTSHEET!C2:C900'
        })
        const Participants2EmailData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'FIFATESTSHEET!G2:G900'
        })
        
        const RegisteredParticipantsEmailData = Participants1EmailData.data.values.concat(Participants2EmailData.data.values)
        res.send(RegisteredParticipantsEmailData)
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
            range: "FIFATESTSHEET",
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

app.listen(3001, (req,res)=>{
    console.log("Running on Port: 3001")
});